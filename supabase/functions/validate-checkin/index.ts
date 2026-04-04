import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidateCheckinPayload {
  qr_token: string
  event_id: string
  operator_id: string
  device_id?: string
  gate_id?: string
  checkpoint_id?: string
  lat?: number
  lng?: number
  accuracy?: number
  manual_override?: boolean
}

type DenialReason =
  | 'token_not_found'
  | 'token_inactive'
  | 'token_expired'
  | 'max_uses_reached'
  | 'credential_revoked'
  | 'credential_not_yet_valid'
  | 'credential_expired'
  | 'zone_not_allowed'
  | 'wrong_event'
  | 'ticket_not_valid'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getGateZone(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  gate_id?: string,
  checkpoint_id?: string,
): Promise<string | null> {
  if (gate_id) {
    const { data } = await supabase
      .from('gates')
      .select('zone')
      .eq('id', gate_id)
      .single()
    return data?.zone ?? null
  }
  if (checkpoint_id) {
    const { data } = await supabase
      .from('checkpoints')
      .select('zone')
      .eq('id', checkpoint_id)
      .single()
    return data?.zone ?? null
  }
  return null
}

async function isOperatorAdmin(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  operator_id: string,
  event_id: string,
): Promise<boolean> {
  // Check profiles for super-admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', operator_id)
    .single()

  if (profile?.role === 'admin' || profile?.role === 'super_admin') return true

  // Check event-level staff member role
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('role')
    .eq('profile_id', operator_id)
    .eq('event_id', event_id)
    .single()

  return staffMember?.role === 'admin' || staffMember?.role === 'coordinator'
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const supabase = createSupabaseAdminClient()
  const now = new Date()
  const nowIso = now.toISOString()

  let body: ValidateCheckinPayload

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
  }

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  if (!body.qr_token || !body.event_id || !body.operator_id) {
    return Response.json(
      { error: 'qr_token, event_id, and operator_id are required' },
      { status: 400, headers: corsHeaders },
    )
  }

  // Helper to write a denial log and return the structured error response
  async function deny(
    reason: DenialReason,
    contextData: Record<string, unknown> = {},
    credentialId?: string,
  ): Promise<Response> {
    const { data: logRow } = await supabase
      .from('checkin_logs')
      .insert({
        event_id: body.event_id,
        qr_token: body.qr_token,
        credential_id: credentialId ?? null,
        action: 'denied',
        denial_reason: reason,
        gate_id: body.gate_id ?? null,
        checkpoint_id: body.checkpoint_id ?? null,
        operator_id: body.operator_id,
        device_id: body.device_id ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        accuracy: body.accuracy ?? null,
        occurred_at: nowIso,
        metadata: contextData,
      })
      .select('id')
      .single()

    return Response.json(
      {
        allowed: false,
        denial_reason: reason,
        checkin_log_id: logRow?.id ?? null,
        ...contextData,
      },
      { status: 200, headers: corsHeaders },
    )
  }

  try {
    // -----------------------------------------------------------------------
    // 1. Fetch qr_token record
    // -----------------------------------------------------------------------
    const { data: tokenRow, error: tokenError } = await supabase
      .from('qr_tokens')
      .select('id, token, ref_type, ref_id, event_id, is_active, expires_at, used_count, max_uses')
      .eq('token', body.qr_token)
      .single()

    if (tokenError || !tokenRow) {
      return await deny('token_not_found')
    }

    // -----------------------------------------------------------------------
    // 2. Validate token state
    // -----------------------------------------------------------------------
    if (!tokenRow.is_active) {
      return await deny('token_inactive')
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < now) {
      return await deny('token_expired', { expires_at: tokenRow.expires_at })
    }

    if (tokenRow.max_uses !== null && tokenRow.used_count >= tokenRow.max_uses) {
      return await deny('max_uses_reached', { used_count: tokenRow.used_count, max_uses: tokenRow.max_uses })
    }

    // -----------------------------------------------------------------------
    // 3. Resolve the credential or digital_ticket
    // -----------------------------------------------------------------------
    let personName: string | null = null
    let credentialType: string = 'unknown'
    let credentialId: string | null = null
    let accessZones: string[] | null = null
    let credentialEventId: string | null = null

    if (tokenRow.ref_type === 'credential') {
      const { data: cred, error: credError } = await supabase
        .from('credentials')
        .select('id, event_id, credential_type, access_zones, valid_from, valid_until, is_revoked, holder_name')
        .eq('id', tokenRow.ref_id)
        .single()

      if (credError || !cred) {
        return await deny('token_not_found')
      }

      credentialId = cred.id
      credentialEventId = cred.event_id

      if (cred.is_revoked) {
        return await deny('credential_revoked', {}, cred.id)
      }

      if (cred.valid_from && new Date(cred.valid_from) > now) {
        return await deny('credential_not_yet_valid', { valid_from: cred.valid_from }, cred.id)
      }

      if (cred.valid_until && new Date(cred.valid_until) < now) {
        return await deny('credential_expired', { valid_until: cred.valid_until }, cred.id)
      }

      personName = cred.holder_name ?? null
      credentialType = cred.credential_type ?? 'staff'
      accessZones = cred.access_zones ?? []
    } else if (tokenRow.ref_type === 'digital_ticket') {
      const { data: ticket, error: ticketError } = await supabase
        .from('digital_tickets')
        .select('id, event_id, holder_name, status, order_id')
        .eq('id', tokenRow.ref_id)
        .single()

      if (ticketError || !ticket) {
        return await deny('token_not_found')
      }

      if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
        return await deny('ticket_not_valid', { ticket_status: ticket.status })
      }

      credentialEventId = ticket.event_id ?? null
      personName = ticket.holder_name ?? null
      credentialType = 'attendee'
      accessZones = ['general']
    } else {
      return await deny('token_not_found')
    }

    // -----------------------------------------------------------------------
    // 4. Cross-check event
    // -----------------------------------------------------------------------
    if (credentialEventId && credentialEventId !== body.event_id) {
      return await deny('wrong_event', { expected_event: credentialEventId }, credentialId ?? undefined)
    }

    // -----------------------------------------------------------------------
    // 5. Zone check
    // -----------------------------------------------------------------------
    const gateZone = await getGateZone(supabase, body.gate_id, body.checkpoint_id)

    const zoneAllowed =
      !gateZone ||
      !accessZones ||
      accessZones.length === 0 ||
      accessZones.includes(gateZone) ||
      accessZones.includes('all')

    if (!zoneAllowed) {
      // Check for manual override by an admin operator
      if (body.manual_override) {
        const isAdmin = await isOperatorAdmin(supabase, body.operator_id, body.event_id)
        if (!isAdmin) {
          return await deny(
            'zone_not_allowed',
            { gate_zone: gateZone, allowed_zones: accessZones, override_rejected: true },
            credentialId ?? undefined,
          )
        }
        // Admin override — fall through to allow
      } else {
        return await deny(
          'zone_not_allowed',
          { gate_zone: gateZone, allowed_zones: accessZones },
          credentialId ?? undefined,
        )
      }
    }

    // -----------------------------------------------------------------------
    // 6. All checks passed — commit the check-in
    // -----------------------------------------------------------------------

    // Increment used_count on qr_token
    const { error: incrError } = await supabase
      .from('qr_tokens')
      .update({ used_count: (tokenRow.used_count ?? 0) + 1 })
      .eq('id', tokenRow.id)

    if (incrError) {
      console.error('[validate-checkin] failed to increment used_count:', incrError.message)
    }

    // Insert successful checkin_log
    const { data: logRow, error: logError } = await supabase
      .from('checkin_logs')
      .insert({
        event_id: body.event_id,
        qr_token: body.qr_token,
        credential_id: credentialId ?? null,
        action: 'entry',
        denial_reason: null,
        gate_id: body.gate_id ?? null,
        checkpoint_id: body.checkpoint_id ?? null,
        operator_id: body.operator_id,
        device_id: body.device_id ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        accuracy: body.accuracy ?? null,
        occurred_at: nowIso,
        metadata: body.manual_override ? { manual_override: true } : {},
      })
      .select('id')
      .single()

    if (logError) {
      console.error('[validate-checkin] failed to write checkin_log:', logError.message)
    }

    return Response.json(
      {
        allowed: true,
        person_name: personName,
        credential_type: credentialType,
        checkin_log_id: logRow?.id ?? null,
        ...(body.manual_override ? { override_applied: true } : {}),
      },
      { status: 200, headers: corsHeaders },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[validate-checkin] unhandled error:', err)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
