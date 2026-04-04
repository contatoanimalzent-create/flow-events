import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RequestBody {
  staffId: string
  type: 'badge' | 'qrcode'
  zoneIds?: string[]
}

interface ErrorResponse {
  error: string
  code?: string
}

interface SuccessResponse {
  credentialId: string
  qrToken: string
  type: 'badge' | 'qrcode'
  status: 'active'
  issuedAt: string
  accessZones: string[] | 'all'
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
  const body: ErrorResponse = { error: message, ...(code ? { code } : {}) }
  return jsonResponse(body, status)
}

/**
 * Generates a secure, URL-safe QR token.
 * Format: 32-char uppercase hex (UUID v4 without hyphens).
 * e.g. "A3F2C1D490B14E8A9C2F0E7D5B3A1C6D"
 */
function generateQrToken(): string {
  return crypto.randomUUID().replace(/-/g, '').toUpperCase()
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

  const { staffId, type, zoneIds } = body

  // ── Input validation ───────────────────────────────────────────────────────
  if (!staffId || typeof staffId !== 'string') {
    return errorResponse('staffId is required and must be a UUID string.', 400, 'MISSING_STAFF_ID')
  }

  if (!type || !['badge', 'qrcode'].includes(type)) {
    return errorResponse("type must be 'badge' or 'qrcode'.", 400, 'INVALID_TYPE')
  }

  if (zoneIds !== undefined) {
    if (!Array.isArray(zoneIds) || zoneIds.some((z) => typeof z !== 'string')) {
      return errorResponse('zoneIds must be an array of UUID strings.', 400, 'INVALID_ZONE_IDS')
    }
  }

  // ── Authenticate calling user ──────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header.', 401, 'UNAUTHORIZED')
  }

  const userJwt = authHeader.replace('Bearer ', '')

  // User-scoped client — respects RLS, resolves auth.uid()
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${userJwt}` } } },
  )

  // Resolve the calling user's profile (organization_id + role)
  const { data: callerProfile, error: profileError } = await userClient
    .from('profiles')
    .select('id, organization_id, role')
    .single()

  if (profileError || !callerProfile) {
    return errorResponse('Could not resolve caller profile.', 401, 'PROFILE_NOT_FOUND')
  }

  if (!callerProfile.organization_id) {
    return errorResponse('Caller has no organization assigned.', 403, 'NO_ORGANIZATION')
  }

  const callerOrgId: string = callerProfile.organization_id

  // Only org_admin, org_manager and checkin_operator can issue credentials
  const allowedRoles = ['super_admin', 'org_admin', 'org_manager', 'checkin_operator']
  if (!allowedRoles.includes(callerProfile.role)) {
    return errorResponse(
      'Insufficient permissions to issue credentials. Required role: org_admin, org_manager or checkin_operator.',
      403,
      'FORBIDDEN',
    )
  }

  // ── Admin client — bypasses RLS for writes ─────────────────────────────────
  const admin = createSupabaseAdminClient()

  // ── Verify staff member exists and belongs to caller's org ─────────────────
  // staff_members → events → organization_id
  const { data: staffMember, error: staffError } = await admin
    .from('staff_members')
    .select(`
      id,
      event_id,
      events!inner ( id, organization_id )
    `)
    .eq('id', staffId)
    .maybeSingle()

  if (staffError) {
    console.error('Staff lookup error:', staffError)
    return errorResponse('Database error while looking up staff member.', 500, 'DB_ERROR')
  }

  if (!staffMember) {
    return errorResponse('Staff member not found.', 404, 'STAFF_NOT_FOUND')
  }

  // Supabase join returns nested object
  const eventRecord = staffMember.events as { id: string; organization_id: string }

  if (eventRecord.organization_id !== callerOrgId) {
    return errorResponse(
      'Staff member does not belong to your organization.',
      403,
      'STAFF_ORG_MISMATCH',
    )
  }

  const eventId: string = eventRecord.id

  // ── Validate zoneIds belong to this org ───────────────────────────────────
  if (zoneIds && zoneIds.length > 0) {
    // venue_zones → venue_maps → venues → organization_id
    const { data: validZones, error: zoneError } = await admin
      .from('venue_zones')
      .select(`
        id,
        venue_maps!inner (
          id,
          venues!inner ( organization_id )
        )
      `)
      .in('id', zoneIds)

    if (zoneError) {
      console.error('Zone validation error:', zoneError)
      return errorResponse('Failed to validate zone IDs.', 500, 'ZONE_VALIDATION_ERROR')
    }

    const validIds = new Set(
      (validZones ?? [])
        .filter((z) => {
          const map = z.venue_maps as { venues: { organization_id: string } }
          return map.venues.organization_id === callerOrgId
        })
        .map((z) => z.id),
    )

    const invalidZones = zoneIds.filter((id) => !validIds.has(id))
    if (invalidZones.length > 0) {
      return errorResponse(
        `Zone IDs not found or not in your organization: ${invalidZones.join(', ')}`,
        400,
        'INVALID_ZONE_IDS',
      )
    }
  }

  // ── Create the credential ──────────────────────────────────────────────────
  const issuedAt = new Date().toISOString()
  const qrToken  = generateQrToken()

  const { data: credential, error: credentialError } = await admin
    .from('credentials')
    .insert({
      staff_id:  staffId,
      type:      'staff',    // credential_type enum — staff category
      format:    type,       // credential_format enum — badge | qrcode (new)
      status:    'active',
      issued_at: issuedAt,
      expires_at: null,
    })
    .select('id, issued_at')
    .single()

  if (credentialError || !credential) {
    console.error('Credential insert error:', credentialError)
    return errorResponse('Failed to create credential.', 500, 'CREDENTIAL_INSERT_ERROR')
  }

  const credentialId: string = credential.id

  // ── Create access rules ────────────────────────────────────────────────────
  let accessZones: string[] | 'all' = 'all'

  if (zoneIds && zoneIds.length > 0) {
    // Restricted access: one rule per zone
    const rules = zoneIds.map((zoneId) => ({
      credential_id: credentialId,
      zone_id:       zoneId,
      valid_from:    issuedAt,
      valid_until:   null,
    }))

    const { error: rulesError } = await admin
      .from('credential_access_rules')
      .insert(rules)

    if (rulesError) {
      // Roll back the credential to avoid orphaned records
      await admin.from('credentials').delete().eq('id', credentialId)
      console.error('Access rules insert error:', rulesError)
      return errorResponse('Failed to create access rules. Credential rolled back.', 500, 'ACCESS_RULES_INSERT_ERROR')
    }

    accessZones = zoneIds
  }
  // No zoneIds → no restriction rows → full event access

  // ── Audit log (non-fatal) ──────────────────────────────────────────────────
  try {
    await admin.from('audit_logs').insert({
      actor_id:      callerProfile.id,
      organization_id: callerOrgId,
      action:        'credential.issued',
      resource_type: 'credential',
      resource_id:   credentialId,
      metadata: {
        staff_id:     staffId,
        event_id:     eventId,
        format:       type,
        access_zones: accessZones,
        qr_token:     qrToken,
      },
    })
  } catch (auditErr) {
    console.warn('Audit log failed (non-fatal):', auditErr)
  }

  // ── Return success ─────────────────────────────────────────────────────────
  const response: SuccessResponse = {
    credentialId,
    qrToken,
    type,
    status:      'active',
    issuedAt,
    accessZones,
  }

  return jsonResponse(response, 201)
})
