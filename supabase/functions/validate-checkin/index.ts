import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RequestBody {
  credentialToken: string
  checkpointId: string
}

type CheckinResult = 'valid' | 'duplicated' | 'invalid'

interface CheckinResponse {
  result: CheckinResult
  message: string
  checkin_log_id?: string | null
  credential_id?: string | null
  holder_name?: string | null
  zone_name?: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number, code?: string): Response {
  return jsonResponse({ error: message, ...(code ? { code } : {}) }, status)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {

  // ── CORS preflight ─────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST.', 405, 'METHOD_NOT_ALLOWED')
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body.', 400, 'INVALID_JSON')
  }

  const { credentialToken, checkpointId } = body

  if (!credentialToken || typeof credentialToken !== 'string') {
    return errorResponse('credentialToken is required.', 400, 'MISSING_CREDENTIAL_TOKEN')
  }
  if (!checkpointId || typeof checkpointId !== 'string') {
    return errorResponse('checkpointId is required.', 400, 'MISSING_CHECKPOINT_ID')
  }

  const admin = createSupabaseAdminClient()
  const now = new Date()
  const nowIso = now.toISOString()

  // ── Helper: write checkin_log and return response ──────────────────────────
  async function writeLog(params: {
    result: CheckinResult
    message: string
    credentialId: string | null
    eventId: string | null
    zoneId: string | null
    zoneName: string | null
    holderName: string | null
    denialReason?: string | null
  }): Promise<Response> {
    const { data: logRow } = await admin
      .from('checkin_logs')
      .insert({
        event_id:      params.eventId,
        credential_id: params.credentialId,
        qr_token:      credentialToken,
        checkpoint_id: checkpointId,
        action:        params.result === 'valid' ? 'entry' : 'denied',
        denial_reason: params.denialReason ?? null,
        occurred_at:   nowIso,
        metadata: {
          result:      params.result,
          zone_id:     params.zoneId,
          zone_name:   params.zoneName,
          holder_name: params.holderName,
        },
      })
      .select('id')
      .single()

    const resp: CheckinResponse = {
      result:         params.result,
      message:        params.message,
      checkin_log_id: logRow?.id ?? null,
      credential_id:  params.credentialId,
      holder_name:    params.holderName,
      zone_name:      params.zoneName,
    }
    return jsonResponse(resp, 200)
  }

  // ── 1. Look up the QR token ────────────────────────────────────────────────
  const { data: qrToken, error: qrError } = await admin
    .from('qr_tokens')
    .select('id, token, ref_type, ref_id, event_id, is_active, expires_at, used_count, max_uses')
    .eq('token', credentialToken)
    .maybeSingle()

  if (qrError) {
    console.error('[validate-checkin] qr_tokens lookup error:', qrError)
    return errorResponse('Database error during token lookup.', 500, 'DB_ERROR')
  }

  let credentialId: string | null = null
  let eventId: string | null = null

  if (!qrToken) {
    // Fallback: treat credentialToken as a direct credential UUID
    const { data: directCred, error: directErr } = await admin
      .from('credentials')
      .select('id, staff_id, status, issued_at, expires_at, staff_members!inner(event_id)')
      .eq('id', credentialToken)
      .maybeSingle()

    if (directErr || !directCred) {
      return await writeLog({
        result: 'invalid',
        message: 'Credential not found.',
        credentialId: null,
        eventId: null,
        zoneId: null,
        zoneName: null,
        holderName: null,
        denialReason: 'token_not_found',
      })
    }

    credentialId = directCred.id
    const sm = directCred.staff_members as { event_id: string }
    eventId = sm?.event_id ?? null
  } else {
    // ── 2. Validate QR token state ─────────────────────────────────────────
    if (!qrToken.is_active) {
      return await writeLog({
        result: 'invalid',
        message: 'This QR code is no longer active.',
        credentialId: null,
        eventId: qrToken.event_id,
        zoneId: null,
        zoneName: null,
        holderName: null,
        denialReason: 'token_inactive',
      })
    }

    if (qrToken.expires_at && new Date(qrToken.expires_at) < now) {
      return await writeLog({
        result: 'invalid',
        message: 'This QR code has expired.',
        credentialId: null,
        eventId: qrToken.event_id,
        zoneId: null,
        zoneName: null,
        holderName: null,
        denialReason: 'token_expired',
      })
    }

    if (qrToken.max_uses !== null && (qrToken.used_count ?? 0) >= qrToken.max_uses) {
      return await writeLog({
        result: 'invalid',
        message: 'This QR code has reached its usage limit.',
        credentialId: null,
        eventId: qrToken.event_id,
        zoneId: null,
        zoneName: null,
        holderName: null,
        denialReason: 'max_uses_reached',
      })
    }

    if (qrToken.ref_type !== 'credential') {
      return await writeLog({
        result: 'invalid',
        message: 'QR code does not reference a credential.',
        credentialId: null,
        eventId: qrToken.event_id,
        zoneId: null,
        zoneName: null,
        holderName: null,
        denialReason: 'invalid_ref_type',
      })
    }

    credentialId = qrToken.ref_id
    eventId = qrToken.event_id
  }

  // ── 3. Fetch credential details ────────────────────────────────────────────
  const { data: credential, error: credError } = await admin
    .from('credentials')
    .select(`
      id,
      staff_id,
      type,
      format,
      status,
      issued_at,
      expires_at,
      staff_members!inner (
        id,
        event_id,
        name,
        role
      )
    `)
    .eq('id', credentialId!)
    .maybeSingle()

  if (credError) {
    console.error('[validate-checkin] credential lookup error:', credError)
    return errorResponse('Database error during credential lookup.', 500, 'DB_ERROR')
  }

  if (!credential) {
    return await writeLog({
      result: 'invalid',
      message: 'Credential not found.',
      credentialId,
      eventId,
      zoneId: null,
      zoneName: null,
      holderName: null,
      denialReason: 'credential_not_found',
    })
  }

  const staffMember = credential.staff_members as { id: string; event_id: string; name: string; role: string }
  const holderName: string = staffMember?.name ?? 'Unknown'
  const credEventId: string = staffMember?.event_id ?? eventId ?? ''

  // ── 4. Validate credential status ─────────────────────────────────────────
  if (credential.status === 'revoked') {
    return await writeLog({
      result: 'invalid',
      message: 'This credential has been revoked.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId: null,
      zoneName: null,
      holderName,
      denialReason: 'credential_revoked',
    })
  }

  if (credential.expires_at && new Date(credential.expires_at) < now) {
    return await writeLog({
      result: 'invalid',
      message: 'This credential has expired.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId: null,
      zoneName: null,
      holderName,
      denialReason: 'credential_expired',
    })
  }

  // ── 5. Fetch checkpoint and verify it exists ───────────────────────────────
  const { data: checkpoint, error: cpError } = await admin
    .from('checkpoints')
    .select(`
      id,
      name,
      venue_map_id,
      zone_id,
      venue_maps!inner (
        id,
        venue_id
      )
    `)
    .eq('id', checkpointId)
    .maybeSingle()

  if (cpError) {
    console.error('[validate-checkin] checkpoint lookup error:', cpError)
    return errorResponse('Database error during checkpoint lookup.', 500, 'DB_ERROR')
  }

  if (!checkpoint) {
    return await writeLog({
      result: 'invalid',
      message: 'Checkpoint not found.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId: null,
      zoneName: null,
      holderName,
      denialReason: 'checkpoint_not_found',
    })
  }

  // ── 6. Fetch zone info ─────────────────────────────────────────────────────
  const zoneId: string | null = checkpoint.zone_id ?? null
  let zoneName: string | null = null

  if (zoneId) {
    const { data: zone } = await admin
      .from('venue_zones')
      .select('id, name, zone_type')
      .eq('id', zoneId)
      .maybeSingle()
    zoneName = zone?.name ?? null
  }

  // ── 7. Validate event date/time window ────────────────────────────────────
  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id, starts_at, ends_at, status')
    .eq('id', credEventId)
    .maybeSingle()

  if (eventError || !event) {
    return await writeLog({
      result: 'invalid',
      message: 'Event not found.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId,
      zoneName,
      holderName,
      denialReason: 'event_not_found',
    })
  }

  // Allow check-in within [starts_at - 2h, ends_at + 30min]
  const windowStart = event.starts_at
    ? new Date(new Date(event.starts_at).getTime() - 2 * 60 * 60 * 1000)
    : null
  const windowEnd = event.ends_at
    ? new Date(new Date(event.ends_at).getTime() + 30 * 60 * 1000)
    : null

  if (windowStart && now < windowStart) {
    return await writeLog({
      result: 'invalid',
      message: 'Check-in not yet available. The event has not started.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId,
      zoneName,
      holderName,
      denialReason: 'event_not_started',
    })
  }

  if (windowEnd && now > windowEnd) {
    return await writeLog({
      result: 'invalid',
      message: 'Check-in window has closed. The event has ended.',
      credentialId: credential.id,
      eventId: credEventId,
      zoneId,
      zoneName,
      holderName,
      denialReason: 'event_ended',
    })
  }

  // ── 8. Zone access control via credential_access_rules ────────────────────
  if (zoneId) {
    const { data: accessRules, error: rulesError } = await admin
      .from('credential_access_rules')
      .select('zone_id, valid_from, valid_until')
      .eq('credential_id', credential.id)

    if (rulesError) {
      console.error('[validate-checkin] access rules lookup error:', rulesError)
      return errorResponse('Database error during access rule lookup.', 500, 'DB_ERROR')
    }

    // Only enforce if explicit rules exist (no rules = full access)
    if (accessRules && accessRules.length > 0) {
      const allowedRule = accessRules.find((r) => {
        if (r.zone_id !== zoneId) return false
        if (r.valid_from && new Date(r.valid_from) > now) return false
        if (r.valid_until && new Date(r.valid_until) < now) return false
        return true
      })

      if (!allowedRule) {
        return await writeLog({
          result: 'invalid',
          message: `Access denied. No permission for zone: ${zoneName ?? zoneId}.`,
          credentialId: credential.id,
          eventId: credEventId,
          zoneId,
          zoneName,
          holderName,
          denialReason: 'zone_not_allowed',
        })
      }
    }
  }

  // ── 9. Duplicate detection (same credential, last 5 minutes) ──────────────
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()

  const { data: recentLogs, error: dupError } = await admin
    .from('checkin_logs')
    .select('id, occurred_at')
    .eq('credential_id', credential.id)
    .eq('action', 'entry')
    .gte('occurred_at', fiveMinAgo)
    .order('occurred_at', { ascending: false })
    .limit(1)

  if (dupError) {
    console.warn('[validate-checkin] duplicate check error (non-fatal):', dupError.message)
  }

  if (recentLogs && recentLogs.length > 0) {
    return await writeLog({
      result: 'duplicated',
      message: `Duplicate check-in. ${holderName} already checked in recently.`,
      credentialId: credential.id,
      eventId: credEventId,
      zoneId,
      zoneName,
      holderName,
      denialReason: 'duplicated',
    })
  }

  // ── 10. All checks passed — commit check-in ────────────────────────────────

  // Increment QR token used_count (non-fatal)
  if (qrToken) {
    admin
      .from('qr_tokens')
      .update({ used_count: (qrToken.used_count ?? 0) + 1 })
      .eq('id', qrToken.id)
      .then(({ error }) => {
        if (error) console.warn('[validate-checkin] used_count increment failed:', error.message)
      })
  }

  return await writeLog({
    result: 'valid',
    message: `Welcome, ${holderName}! Check-in successful.`,
    credentialId: credential.id,
    eventId: credEventId,
    zoneId,
    zoneName,
    holderName,
    denialReason: null,
  })
})
