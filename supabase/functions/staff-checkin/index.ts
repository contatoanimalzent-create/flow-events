import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CheckinRequestBody {
  staff_member_id: string
  event_id: string
  type: 'checkin' | 'checkout'
  photo_url?: string
  photo_base64?: string
  latitude: number
  longitude: number
  accuracy_meters?: number
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

/**
 * Haversine formula — returns the distance in meters between two lat/lng points.
 */
function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Parse a Postgres point value "(x,y)" into {longitude, latitude}.
 * Postgres point stores (x, y) which maps to (longitude, latitude).
 */
function parsePoint(raw: unknown): { latitude: number; longitude: number } | null {
  if (!raw) return null

  // Could be a string "(lng,lat)" or an object {x, y} depending on driver
  if (typeof raw === 'string') {
    const match = raw.match(/\(?\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)?/)
    if (!match) return null
    return { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) }
  }

  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    // Supabase sometimes returns point as string even through JS client
    if ('x' in obj && 'y' in obj) {
      return { longitude: Number(obj.x), latitude: Number(obj.y) }
    }
  }

  return null
}

/**
 * Get the start of today (UTC) as ISO string.
 */
function todayStartUTC(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

// ─────────────────────────────────────────────────────────────────────────────
// GET handler — lookup staff status
// ─────────────────────────────────────────────────────────────────────────────

async function handleGet(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const eventSlug = url.searchParams.get('event_slug')
  const email = url.searchParams.get('email')

  if (!eventSlug || !email) {
    return errorResponse(
      'Parâmetros obrigatórios: event_slug e email.',
      400,
      'MISSING_PARAMS',
    )
  }

  const admin = createSupabaseAdminClient()

  // 1. Find the event by slug
  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, venue_coordinates')
    .eq('slug', eventSlug)
    .maybeSingle()

  if (eventErr) {
    console.error('[staff-checkin] Erro ao buscar evento:', eventErr)
    return errorResponse('Erro interno ao buscar evento.', 500, 'DB_ERROR')
  }

  if (!event) {
    return errorResponse('Evento não encontrado.', 404, 'EVENT_NOT_FOUND')
  }

  // 2. Find the staff member by email + event
  const { data: staffMember, error: staffErr } = await admin
    .from('staff_members')
    .select('id, name, email, role, status, checked_in_at, checked_out_at')
    .eq('event_id', event.id)
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (staffErr) {
    console.error('[staff-checkin] Erro ao buscar membro da equipe:', staffErr)
    return errorResponse('Erro interno ao buscar membro da equipe.', 500, 'DB_ERROR')
  }

  if (!staffMember) {
    return errorResponse(
      'Membro da equipe não encontrado para este evento.',
      404,
      'STAFF_NOT_FOUND',
    )
  }

  // 3. Get today's checkins for this staff member
  const todayStart = todayStartUTC()

  const { data: todayCheckins, error: checkinsErr } = await admin
    .from('staff_checkins')
    .select('id, type, created_at, photo_url, latitude, longitude, distance_from_venue_meters')
    .eq('staff_member_id', staffMember.id)
    .gte('created_at', todayStart)
    .order('created_at', { ascending: true })

  if (checkinsErr) {
    console.error('[staff-checkin] Erro ao buscar registros de ponto:', checkinsErr)
    return errorResponse('Erro interno ao buscar registros.', 500, 'DB_ERROR')
  }

  // 4. Determine if currently checked in (last record today is a checkin without a subsequent checkout)
  const records = todayCheckins ?? []
  const lastRecord = records.length > 0 ? records[records.length - 1] : null
  const isCheckedIn = lastRecord?.type === 'checkin'

  // 5. Parse venue coordinates
  const venueCoords = parsePoint(event.venue_coordinates)

  return jsonResponse({
    staff_member: {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      status: staffMember.status,
      checked_in_at: staffMember.checked_in_at,
      checked_out_at: staffMember.checked_out_at,
    },
    is_checked_in: isCheckedIn,
    today_checkins: records,
    venue_coordinates: venueCoords,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler — register checkin/checkout
// ─────────────────────────────────────────────────────────────────────────────

async function handlePost(req: Request): Promise<Response> {
  let body: CheckinRequestBody
  try {
    body = await req.json()
  } catch {
    return errorResponse('JSON inválido no corpo da requisição.', 400, 'INVALID_JSON')
  }

  const { staff_member_id, event_id, type, latitude, longitude, accuracy_meters } = body

  // ── Validate required fields ──────────────────────────────────────────────
  if (!staff_member_id || typeof staff_member_id !== 'string') {
    return errorResponse('Campo obrigatório: staff_member_id.', 400, 'MISSING_STAFF_MEMBER_ID')
  }
  if (!event_id || typeof event_id !== 'string') {
    return errorResponse('Campo obrigatório: event_id.', 400, 'MISSING_EVENT_ID')
  }
  if (type !== 'checkin' && type !== 'checkout') {
    return errorResponse(
      'Campo "type" deve ser "checkin" ou "checkout".',
      400,
      'INVALID_TYPE',
    )
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return errorResponse(
      'Campos obrigatórios: latitude e longitude (numéricos).',
      400,
      'MISSING_COORDINATES',
    )
  }

  const admin = createSupabaseAdminClient()

  // ── 1. Validate staff member exists and is active ─────────────────────────
  const { data: staffMember, error: staffErr } = await admin
    .from('staff_members')
    .select('id, name, email, role, status, event_id')
    .eq('id', staff_member_id)
    .maybeSingle()

  if (staffErr) {
    console.error('[staff-checkin] Erro ao buscar membro da equipe:', staffErr)
    return errorResponse('Erro interno ao buscar membro da equipe.', 500, 'DB_ERROR')
  }

  if (!staffMember) {
    return errorResponse('Membro da equipe não encontrado.', 404, 'STAFF_NOT_FOUND')
  }

  if (staffMember.status !== 'active' && staffMember.status !== 'confirmed') {
    return errorResponse(
      `Membro da equipe não está ativo (status atual: ${staffMember.status}).`,
      403,
      'STAFF_INACTIVE',
    )
  }

  if (staffMember.event_id !== event_id) {
    return errorResponse(
      'Membro da equipe não pertence a este evento.',
      403,
      'STAFF_EVENT_MISMATCH',
    )
  }

  // ── 2. Get event venue coordinates ────────────────────────────────────────
  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, venue_coordinates')
    .eq('id', event_id)
    .maybeSingle()

  if (eventErr) {
    console.error('[staff-checkin] Erro ao buscar evento:', eventErr)
    return errorResponse('Erro interno ao buscar evento.', 500, 'DB_ERROR')
  }

  if (!event) {
    return errorResponse('Evento não encontrado.', 404, 'EVENT_NOT_FOUND')
  }

  // ── 3. Calculate distance from venue ──────────────────────────────────────
  const venueCoords = parsePoint(event.venue_coordinates)
  let distanceFromVenueMeters: number | null = null

  if (venueCoords) {
    distanceFromVenueMeters = Math.round(
      haversineMeters(latitude, longitude, venueCoords.latitude, venueCoords.longitude),
    )
  }

  // ── 4/5/6. Check for open checkin today ───────────────────────────────────
  const todayStart = todayStartUTC()

  const { data: todayRecords, error: recordsErr } = await admin
    .from('staff_checkins')
    .select('id, type, created_at')
    .eq('staff_member_id', staff_member_id)
    .gte('created_at', todayStart)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recordsErr) {
    console.error('[staff-checkin] Erro ao verificar registros de hoje:', recordsErr)
    return errorResponse('Erro interno ao verificar registros.', 500, 'DB_ERROR')
  }

  const lastRecord = todayRecords && todayRecords.length > 0 ? todayRecords[0] : null
  const hasOpenCheckin = lastRecord?.type === 'checkin'

  if (type === 'checkin' && hasOpenCheckin) {
    return errorResponse(
      'Já existe um check-in aberto hoje. Faça o checkout primeiro.',
      409,
      'ALREADY_CHECKED_IN',
    )
  }

  if (type === 'checkout' && !hasOpenCheckin) {
    return errorResponse(
      'Não há check-in aberto hoje. Faça o check-in primeiro.',
      409,
      'NOT_CHECKED_IN',
    )
  }

  // ── Handle photo upload (base64 → Supabase Storage) ───────────────────────
  let photoUrl = body.photo_url ?? null

  if (type === 'checkin' && body.photo_base64) {
    try {
      const timestamp = Date.now()
      const filePath = `checkins/${staff_member_id}/${timestamp}.jpg`

      // Decode base64 to Uint8Array
      const base64Data = body.photo_base64.replace(/^data:image\/\w+;base64,/, '')
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const { error: uploadErr } = await admin.storage
        .from('staff-documents')
        .upload(filePath, bytes, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadErr) {
        console.error('[staff-checkin] Erro ao fazer upload da foto:', uploadErr)
        // Non-fatal: continue without the photo
      } else {
        const { data: publicUrlData } = admin.storage
          .from('staff-documents')
          .getPublicUrl(filePath)

        photoUrl = publicUrlData?.publicUrl ?? null
      }
    } catch (uploadException) {
      console.error('[staff-checkin] Exceção no upload da foto:', uploadException)
      // Non-fatal: continue without the photo
    }
  }

  // ── 7. Insert into staff_checkins ─────────────────────────────────────────
  const { data: checkinRecord, error: insertErr } = await admin
    .from('staff_checkins')
    .insert({
      staff_member_id,
      event_id,
      type,
      photo_url: photoUrl,
      latitude,
      longitude,
      accuracy_meters: accuracy_meters ?? null,
      distance_from_venue_meters: distanceFromVenueMeters,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertErr) {
    console.error('[staff-checkin] Erro ao inserir registro de ponto:', insertErr)
    return errorResponse(
      'Erro interno ao registrar ponto. Tente novamente.',
      500,
      'INSERT_ERROR',
    )
  }

  // ── 8/9. Update staff_members checked_in_at / checked_out_at ──────────────
  const updateField = type === 'checkin' ? 'checked_in_at' : 'checked_out_at'
  const { error: updateErr } = await admin
    .from('staff_members')
    .update({ [updateField]: new Date().toISOString() })
    .eq('id', staff_member_id)

  if (updateErr) {
    console.error(`[staff-checkin] Erro ao atualizar ${updateField}:`, updateErr)
    // Non-fatal: the checkin record was already created
  }

  // ── 10. Return success ────────────────────────────────────────────────────
  const message =
    type === 'checkin'
      ? `Check-in registrado com sucesso para ${staffMember.name}.`
      : `Checkout registrado com sucesso para ${staffMember.name}.`

  return jsonResponse({
    success: true,
    message,
    checkin: checkinRecord,
    distance_from_venue_meters: distanceFromVenueMeters,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // ── CORS preflight ──────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req)
    }

    if (req.method === 'POST') {
      return await handlePost(req)
    }

    return errorResponse('Método não permitido. Use GET ou POST.', 405, 'METHOD_NOT_ALLOWED')
  } catch (err) {
    console.error('[staff-checkin] Erro inesperado:', err)
    return errorResponse(
      'Erro interno do servidor. Tente novamente mais tarde.',
      500,
      'INTERNAL_ERROR',
    )
  }
})
