import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CheckinRequestBody {
  staff_member_id: string
  event_id: string
  type: 'checkin' | 'checkout'
  work_role?: string
  photo_url?: string
  photo_base64?: string
  latitude: number
  longitude: number
  accuracy_meters?: number
}

const DEFAULT_GEOFENCE_METERS = 650
const MAX_ACCURACY_TOLERANCE_METERS = 250
const WORK_ROLE_OPTIONS = new Set([
  'Carregador',
  'SeguranÃ§a eventual',
  'SeguranÃ§a patrimonial',
  'ProduÃ§Ã£o',
  'Brigadista',
  'Posto mÃ©dico',
  'Credenciamento',
  'Limpeza',
  'TransmissÃ£o',
  'Outros',
])
const BSB5_RECEIPT_IMAGE_URL =
  'https://nrjizzfkhficvhiiqvtl.supabase.co/storage/v1/object/public/staff-documents/bsb5/ponto-pulse.png'

interface EvolutionProvider {
  apiUrl: string
  apiKey: string
  instance: string
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
 * Haversine formula â€” returns the distance in meters between two lat/lng points.
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
  const [year, month, day] = saoPauloDateFolder().split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0)).toISOString()
}

function saoPauloDateFolder(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function saoPauloDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('55') && digits.length < 12) digits = digits.slice(2)
  if (!digits.startsWith('55') && digits.length >= 10 && digits.length <= 11) digits = `55${digits}`
  return digits
}

function normalizePhone(phone: string): string {
  const digits = normalizePhoneDigits(phone)
  return digits ? `+${digits}` : ''
}

function normalizeWorkRole(value?: string | null): string | null {
  const role = (value ?? '').trim()
  if (!role) return null
  if (WORK_ROLE_OPTIONS.has(role)) return role
  return role.slice(0, 80)
}

function useSmsOnly(): boolean {
  const provider = (Deno.env.get('WHATSAPP_PROVIDER') ?? '').toLowerCase()
  return provider === 'sms' || provider === 'sms-only'
}

function uniqueEvolutionProviders(providers: EvolutionProvider[]): EvolutionProvider[] {
  const seen = new Set<string>()
  return providers.filter((provider) => {
    if (!provider.apiUrl || !provider.apiKey || !provider.instance) return false
    const key = `${provider.apiUrl}|${provider.apiKey}|${provider.instance}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseEvolutionProviders(): EvolutionProvider[] {
  const primaryUrl = Deno.env.get('EVOLUTION_API_URL') ?? ''
  const primaryKey = Deno.env.get('EVOLUTION_API_KEY') ?? ''
  const primaryInstance = Deno.env.get('EVOLUTION_INSTANCE_NAME') ?? ''
  const providers: EvolutionProvider[] = []

  const json = Deno.env.get('EVOLUTION_PROVIDERS_JSON') ?? ''
  if (json.trim()) {
    try {
      const parsed = JSON.parse(json) as Array<Partial<EvolutionProvider>>
      for (const item of parsed) {
        providers.push({
          apiUrl: item.apiUrl || primaryUrl,
          apiKey: item.apiKey || primaryKey,
          instance: item.instance || '',
        })
      }
    } catch (err) {
      console.warn('[staff-checkin] Invalid EVOLUTION_PROVIDERS_JSON:', err)
    }
  }

  const names = (Deno.env.get('EVOLUTION_INSTANCE_NAMES') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  for (const instance of names) {
    providers.push({ apiUrl: primaryUrl, apiKey: primaryKey, instance })
  }

  providers.push({ apiUrl: primaryUrl, apiKey: primaryKey, instance: primaryInstance })
  for (let i = 2; i <= 5; i++) {
    providers.push({
      apiUrl: Deno.env.get(`EVOLUTION_API_URL_${i}`) ?? primaryUrl,
      apiKey: Deno.env.get(`EVOLUTION_API_KEY_${i}`) ?? primaryKey,
      instance: Deno.env.get(`EVOLUTION_INSTANCE_NAME_${i}`) ?? '',
    })
  }

  return uniqueEvolutionProviders(providers)
}

async function sendResendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  const apiKey = Deno.env.get('RESEND_API_KEY') ?? ''
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Pulse <ponto@pulse.animalzgroup.com>'
  if (!apiKey || !params.to) {
    return { ok: false, id: null, error: 'Resend not configured.' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) {
      return { ok: false, id: null, error: `Resend HTTP ${res.status}: ${data?.message ?? JSON.stringify(data)}` }
    }
    return { ok: true, id: data.id ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

async function sendTwilioSms(params: {
  to: string
  body: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') ?? ''
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
  const from = Deno.env.get('TWILIO_SMS_NUMBER') ?? ''
  const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID') ?? ''

  if (!accountSid || !authToken || (!from && !messagingServiceSid) || !params.to) {
    return { ok: false, id: null, error: 'Twilio SMS not configured.' }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const form = new URLSearchParams({
      To: normalizePhone(params.to),
      Body: params.body,
    })
    if (messagingServiceSid) {
      form.set('MessagingServiceSid', messagingServiceSid)
    } else {
      form.set('From', normalizePhone(from))
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    const data = await res.json().catch(() => ({})) as { sid?: string; error_message?: string }
    if (!res.ok) {
      return { ok: false, id: null, error: `Twilio SMS HTTP ${res.status}: ${data.error_message ?? JSON.stringify(data)}` }
    }
    return { ok: true, id: data.sid ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

async function sendEvolutionWhatsApp(params: {
  to: string
  body: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  return sendEvolutionWhatsAppFailover({ ...params, media: null })
}

async function sendEvolutionTextWithProvider(params: {
  to: string
  body: string
  provider: EvolutionProvider
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  if (!params.provider.apiUrl || !params.provider.apiKey || !params.provider.instance || !params.to) {
    return { ok: false, id: null, error: 'Evolution API not configured.' }
  }

  try {
    const baseUrl = params.provider.apiUrl.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/message/sendText/${params.provider.instance}`, {
      method: 'POST',
      headers: {
        apikey: params.provider.apiKey,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        number: normalizePhoneDigits(params.to),
        text: params.body,
        delay: 1200,
        linkPreview: true,
      }),
    })
    const data = await res.json().catch(() => ({})) as { key?: { id?: string }, status?: string }
    if (!res.ok) {
      return { ok: false, id: null, error: `Evolution HTTP ${res.status}: ${JSON.stringify(data)}` }
    }
    return { ok: true, id: data.key?.id ?? data.status ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

async function sendEvolutionWhatsAppImage(params: {
  to: string
  imageUrl: string
  caption: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  return sendEvolutionWhatsAppFailover({
    to: params.to,
    body: params.caption,
    media: {
      imageUrl: params.imageUrl,
      fileName: 'comprovante-ponto-bsb-fight-5.png',
    },
  })
}

async function sendEvolutionImageWithProvider(params: {
  to: string
  imageUrl: string
  caption: string
  fileName: string
  provider: EvolutionProvider
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  if (!params.provider.apiUrl || !params.provider.apiKey || !params.provider.instance || !params.to || !params.imageUrl) {
    return { ok: false, id: null, error: 'Evolution API not configured.' }
  }

  try {
    const baseUrl = params.provider.apiUrl.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/message/sendMedia/${params.provider.instance}`, {
      method: 'POST',
      headers: {
        apikey: params.provider.apiKey,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        number: normalizePhoneDigits(params.to),
        mediatype: 'image',
        mimetype: 'image/png',
        media: params.imageUrl,
        fileName: params.fileName,
        caption: params.caption,
        delay: 1200,
      }),
    })
    const data = await res.json().catch(() => ({})) as { key?: { id?: string }, status?: string }
    if (!res.ok) {
      return { ok: false, id: null, error: `Evolution media HTTP ${res.status}: ${JSON.stringify(data)}` }
    }
    return { ok: true, id: data.key?.id ?? data.status ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

async function sendEvolutionWhatsAppFailover(params: {
  to: string
  body: string
  media: { imageUrl: string; fileName: string } | null
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  const errors: string[] = []
  for (const provider of parseEvolutionProviders()) {
    const result = params.media
      ? await sendEvolutionImageWithProvider({
        to: params.to,
        imageUrl: params.media.imageUrl,
        caption: params.body,
        fileName: params.media.fileName,
        provider,
      })
      : await sendEvolutionTextWithProvider({
        to: params.to,
        body: params.body,
        provider,
      })
    if (result.ok) {
      return { ok: true, id: result.id ? `${provider.instance}:${result.id}` : provider.instance, error: null }
    }
    errors.push(`${provider.instance || 'sem-instancia'}: ${result.error}`)
  }
  return { ok: false, id: null, error: errors.join(' | ') || 'Evolution providers not configured.' }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET handler â€” lookup staff status
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleGet(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const eventSlug = url.searchParams.get('event_slug')
  const emailParam = url.searchParams.get('email')
  const cpfParam = url.searchParams.get('cpf')
  const phoneParam = url.searchParams.get('phone')

  if (!eventSlug || !cpfParam) {
    return errorResponse(
      'Preencha o CPF.',
      400,
      'MISSING_PARAMS',
    )
  }

  const admin = createSupabaseAdminClient()

  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, name, venue_coordinates, geofence_radius_meters')
    .eq('slug', eventSlug)
    .maybeSingle()

  if (eventErr) {
    console.error('[staff-checkin] Erro ao buscar evento:', eventErr)
    return errorResponse('Erro interno ao buscar evento.', 500, 'DB_ERROR')
  }

  if (!event) {
    return errorResponse('Evento nÃ£o encontrado.', 404, 'EVENT_NOT_FOUND')
  }

  const cleanEmail = emailParam?.toLowerCase().trim() ?? ''
  const cleanCpf = cpfParam.replace(/\D/g, '')
  const cleanPhone = phoneParam?.replace(/\D/g, '') ?? ''

  let staffQuery = admin
    .from('staff_members')
    .select('id, first_name, last_name, email, cpf, phone, role_title, status, checked_in_at, checked_out_at')
    .eq('event_id', event.id)
    .eq('cpf', cleanCpf)

  if (cleanEmail) staffQuery = staffQuery.eq('email', cleanEmail)

  const { data: staffRows, error: staffErr } = await staffQuery.limit(2)

  if (staffErr) {
    console.error('[staff-checkin] Erro ao buscar membro da equipe:', staffErr)
    return errorResponse('Erro interno ao buscar membro da equipe.', 500, 'DB_ERROR')
  }

  if (!staffRows || staffRows.length === 0) {
    return errorResponse(
      'CPF nÃ£o encontrado no cadastro deste evento.',
      404,
      'STAFF_NOT_FOUND',
    )
  }

  if (staffRows.length > 1) {
    return errorResponse(
      'Encontramos mais de um cadastro com este CPF. Procure a coordenacao para liberar o ponto.',
      409,
      'DUPLICATE_STAFF_CPF',
    )
  }

  const staffMember = staffRows[0]

  const memberCpf = (staffMember.cpf ?? '').replace(/\D/g, '')
  const memberPhone = (staffMember.phone ?? '').replace(/\D/g, '')

  if (memberCpf && memberCpf !== cleanCpf) {
    return errorResponse('CPF nÃ£o confere com o cadastro.', 403, 'CPF_MISMATCH')
  }

  if (cleanPhone && memberPhone && memberPhone !== cleanPhone && memberPhone !== `55${cleanPhone}`) {
    return errorResponse('WhatsApp nÃ£o confere com o cadastro.', 403, 'PHONE_MISMATCH')
  }

  // 3. Get today's checkins for this staff member
  const todayStart = todayStartUTC()

  const { data: todayCheckins, error: checkinsErr } = await admin
    .from('staff_checkins')
    .select('id, type, created_at, photo_url, latitude, longitude, distance_from_venue_meters, work_role')
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
  const pointStatus = lastRecord?.type === 'checkout'
    ? 'finished'
    : isCheckedIn
      ? 'needs_checkout'
      : 'needs_checkin'

  // 5. Parse venue coordinates
  const venueCoords = parsePoint(event.venue_coordinates)

  return jsonResponse({
    event_id: event.id,
    event_name: event.name,
    staff_member: {
      id: staffMember.id,
      name: [staffMember.first_name, staffMember.last_name].filter(Boolean).join(' '),
      email: staffMember.email,
      role: staffMember.role_title,
      status: staffMember.status,
      checked_in_at: staffMember.checked_in_at,
      checked_out_at: staffMember.checked_out_at,
    },
    is_checked_in: isCheckedIn,
    point_status: pointStatus,
    today_checkins: records,
    venue_coordinates: venueCoords,
    geofence_radius_meters: event.geofence_radius_meters ?? DEFAULT_GEOFENCE_METERS,
  })
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// POST handler â€” register checkin/checkout
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handlePost(req: Request): Promise<Response> {
  let body: CheckinRequestBody
  try {
    body = await req.json()
  } catch {
    return errorResponse('JSON invÃ¡lido no corpo da requisiÃ§Ã£o.', 400, 'INVALID_JSON')
  }

  const { staff_member_id, event_id, type, latitude, longitude, accuracy_meters } = body
  const workRole = normalizeWorkRole(body.work_role)

  // â”€â”€ Validate required fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!staff_member_id || typeof staff_member_id !== 'string') {
    return errorResponse('Campo obrigatÃ³rio: staff_member_id.', 400, 'MISSING_STAFF_MEMBER_ID')
  }
  if (!event_id || typeof event_id !== 'string') {
    return errorResponse('Campo obrigatÃ³rio: event_id.', 400, 'MISSING_EVENT_ID')
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
      'Campos obrigatÃ³rios: latitude e longitude (numÃ©ricos).',
      400,
      'MISSING_COORDINATES',
    )
  }

  const admin = createSupabaseAdminClient()

  // â”€â”€ 1. Validate staff member exists and is active â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: staffMember, error: staffErr } = await admin
    .from('staff_members')
    .select('id, first_name, last_name, email, phone, role_title, status, event_id')
    .eq('id', staff_member_id)
    .maybeSingle()

  if (staffErr) {
    console.error('[staff-checkin] Erro ao buscar membro da equipe:', staffErr)
    return errorResponse('Erro interno ao buscar membro da equipe.', 500, 'DB_ERROR')
  }

  if (!staffMember) {
    return errorResponse('Membro da equipe nÃ£o encontrado.', 404, 'STAFF_NOT_FOUND')
  }

  if (staffMember.status !== 'active' && staffMember.status !== 'confirmed') {
    return errorResponse(
      `Membro da equipe nÃ£o estÃ¡ ativo (status atual: ${staffMember.status}).`,
      403,
      'STAFF_INACTIVE',
    )
  }

  if (staffMember.event_id !== event_id) {
    return errorResponse(
      'Membro da equipe nÃ£o pertence a este evento.',
      403,
      'STAFF_EVENT_MISMATCH',
    )
  }

  // â”€â”€ 2. Get event venue coordinates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, name, slug, venue_name, venue_address, venue_coordinates, geofence_radius_meters')
    .eq('id', event_id)
    .maybeSingle()

  if (eventErr) {
    console.error('[staff-checkin] Erro ao buscar evento:', eventErr)
    return errorResponse('Erro interno ao buscar evento.', 500, 'DB_ERROR')
  }

  if (!event) {
    return errorResponse('Evento nÃ£o encontrado.', 404, 'EVENT_NOT_FOUND')
  }

  // â”€â”€ 3. Calculate distance from venue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const venueCoords = parsePoint(event.venue_coordinates)
  let distanceFromVenueMeters: number | null = null

  const configuredMaxDist = Math.max(event.geofence_radius_meters ?? DEFAULT_GEOFENCE_METERS, DEFAULT_GEOFENCE_METERS)
  const accuracyTolerance = typeof accuracy_meters === 'number'
    ? Math.min(Math.max(accuracy_meters, 0), MAX_ACCURACY_TOLERANCE_METERS)
    : 0
  const maxDist = configuredMaxDist + accuracyTolerance

  if (venueCoords) {
    distanceFromVenueMeters = Math.round(
      haversineMeters(latitude, longitude, venueCoords.latitude, venueCoords.longitude),
    )
    if (distanceFromVenueMeters > maxDist) {
      return errorResponse(
        'Para registrar o ponto, Ã© necessÃ¡rio estar no local do evento.',
        403,
        'TOO_FAR_FROM_VENUE',
      )
    }
  }

  if (!body.photo_base64 && !body.photo_url) {
    return errorResponse('Foto obrigatÃ³ria para registrar o ponto.', 400, 'PHOTO_REQUIRED')
  }

  // â”€â”€ 4/5/6. Check for open checkin today â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const hasFinishedToday = lastRecord?.type === 'checkout'

  if (type === 'checkin' && hasFinishedToday) {
    return errorResponse(
      'Ponto finalizado hoje. A entrada nao pode ser registrada novamente.',
      409,
      'POINT_ALREADY_FINISHED',
    )
  }
  if (!workRole && type === 'checkin') {
    return errorResponse('Selecione a funÃ§Ã£o do ponto de hoje.', 400, 'MISSING_WORK_ROLE')
  }

  if (type === 'checkin' && hasOpenCheckin) {
    return errorResponse(
      'JÃ¡ existe um check-in aberto hoje. FaÃ§a o checkout primeiro.',
      409,
      'ALREADY_CHECKED_IN',
    )
  }

  if (type === 'checkout' && !hasOpenCheckin) {
    return errorResponse(
      'NÃ£o hÃ¡ check-in aberto hoje. FaÃ§a o check-in primeiro.',
      409,
      'NOT_CHECKED_IN',
    )
  }

  // â”€â”€ Handle photo upload (base64 â†’ Supabase Storage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let photoUrl = body.photo_url ?? null

  if (body.photo_base64) {
    try {
      const timestamp = Date.now()
      const dayFolder = saoPauloDateFolder()
      const filePath = `checkins/${event_id}/${dayFolder}/${staff_member_id}/${type}-${timestamp}.jpg`

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
        return errorResponse('Erro ao salvar a foto do ponto. Tente novamente.', 500, 'PHOTO_UPLOAD_FAILED')
      } else {
        const { data: publicUrlData } = admin.storage
          .from('staff-documents')
          .getPublicUrl(filePath)

        photoUrl = publicUrlData?.publicUrl ?? null
      }
    } catch (uploadException) {
      console.error('[staff-checkin] ExceÃ§Ã£o no upload da foto:', uploadException)
      return errorResponse('Erro ao processar a foto do ponto. Tente novamente.', 500, 'PHOTO_UPLOAD_FAILED')
    }
  }

  // â”€â”€ 7. Insert into staff_checkins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!photoUrl) {
    return errorResponse('Foto obrigatÃ³ria nÃ£o foi salva. Tente novamente.', 500, 'PHOTO_UPLOAD_FAILED')
  }

  const { data: checkinRecord, error: insertErr } = await admin
    .from('staff_checkins')
    .insert({
      staff_member_id,
      event_id,
      type,
      photo_url: photoUrl,
      work_role: workRole,
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

  // â”€â”€ 8/9. Update staff_members checked_in_at / checked_out_at â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateField = type === 'checkin' ? 'checked_in_at' : 'checked_out_at'
  const staffUpdate = type === 'checkin'
    ? { checked_in_at: new Date().toISOString(), checked_out_at: null }
    : { checked_out_at: new Date().toISOString() }
  const { error: updateErr } = await admin
    .from('staff_members')
    .update(staffUpdate)
    .eq('id', staff_member_id)

  if (updateErr) {
    console.error(`[staff-checkin] Erro ao atualizar ${updateField}:`, updateErr)
    // Non-fatal: the checkin record was already created
  }

  // â”€â”€ 10. Return success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (type === 'checkin' && staffMember.phone) {
    const staffName = [staffMember.first_name, staffMember.last_name].filter(Boolean).join(' ')
    const venueAddress = event.venue_address as Record<string, unknown> | null
    const addressParts = venueAddress
      ? [venueAddress.street, venueAddress.city, venueAddress.state].filter(Boolean).join(', ')
      : ''
    const venueLabel = [event.venue_name, addressParts].filter(Boolean).join(' - ') || 'Centro OlÃ­mpico da Estrutural, BrasÃ­lia - DF'
    const receiptCode = String(checkinRecord.id).slice(0, 8).toUpperCase()
    const receiptMessage = [
      `COMPROVANTE DE PONTO - ${event.name ?? 'BSB FIGHT 5'}`,
      '',
      `Nome: ${staffName}`,
      'Tipo: Entrada',
      `Data/hora: ${saoPauloDateTime(new Date(checkinRecord.created_at))}`,
      `Local: ${venueLabel}`,
      `Coordenadas: ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`,
      `CÃ³digo: ${receiptCode}`,
      '',
      'PONTO REGISTRADO. Dirija-se agora ao credenciamento para retirar sua pulseira.',
      'Mostre este comprovante para a equipe no credenciamento.',
      'Lembrete: o ponto deve ser batido todos os dias do evento.',
    ].join('\n')
    const receiptSms = [
      `Pulse: ponto registrado no ${event.name ?? 'BSB FIGHT 5'}.`,
      `Codigo: ${receiptCode}.`,
      `Horario: ${saoPauloDateTime(new Date(checkinRecord.created_at))}.`,
      'Retire sua pulseira no credenciamento e mostre este comprovante.',
      'Bata o ponto todos os dias em que trabalhar.',
    ].join(' ')

    if (useSmsOnly()) {
      const smsFallback = await sendTwilioSms({
        to: staffMember.phone,
        body: receiptSms,
      })
      if (!smsFallback.ok) {
        console.warn('[staff-checkin] Falha ao enviar comprovante por SMS:', smsFallback.error)
      }
    } else {
      const whatsappResult = await sendEvolutionWhatsAppImage({
        to: staffMember.phone,
        imageUrl: BSB5_RECEIPT_IMAGE_URL,
        caption: receiptMessage,
      })

      if (!whatsappResult.ok) {
      console.warn('[staff-checkin] Falha ao enviar comprovante com imagem por WhatsApp:', whatsappResult.error)
      const textFallback = await sendEvolutionWhatsApp({
        to: staffMember.phone,
        body: receiptMessage,
      })
      if (!textFallback.ok) {
        console.warn('[staff-checkin] Falha ao enviar comprovante em texto por WhatsApp:', textFallback.error)
        const smsFallback = await sendTwilioSms({
          to: staffMember.phone,
          body: receiptSms,
        })
        if (!smsFallback.ok) {
          console.warn('[staff-checkin] Falha ao enviar comprovante por SMS:', smsFallback.error)
        }
      }
    }
    }
  }

  // ── Email lembrete da saída (após checkin, mesmo sem WhatsApp) ─────────────
  if (type === 'checkin' && staffMember.email) {
    const staffNameEmail = [staffMember.first_name, staffMember.last_name].filter(Boolean).join(' ')
    const venueAddressEmail = event.venue_address as Record<string, unknown> | null
    const addressPartsEmail = venueAddressEmail
      ? [venueAddressEmail.street, venueAddressEmail.city, venueAddressEmail.state].filter(Boolean).join(', ')
      : ''
    const venueLabelEmail = [event.venue_name, addressPartsEmail].filter(Boolean).join(' - ') || 'Local do evento'
    const receiptCodeEmail = String(checkinRecord.id).slice(0, 8).toUpperCase()
    const checkinTimeEmail = saoPauloDateTime(new Date(checkinRecord.created_at))
    const pontoUrlEmail = `https://pulse.animalzgroup.com/staff/ponto/${event.slug ?? ''}`
    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06070a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#06070a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d1118;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 28px 8px 28px;">
          <p style="margin:0 0 8px 0;color:#D4FF00;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ponto registrado</p>
          <h1 style="margin:0 0 16px 0;color:#f5f0e8;font-size:24px;line-height:1.2;font-weight:800;">Entrada confirmada, ${staffNameEmail}!</h1>
          <p style="margin:0 0 8px 0;color:rgba(245,240,232,0.7);font-size:15px;line-height:1.6;">Sua entrada no <strong style="color:#f5f0e8;">${event.name}</strong> foi registrada às <strong style="color:#D4FF00;">${checkinTimeEmail}</strong>.</p>
          <p style="margin:0 0 24px 0;color:rgba(245,240,232,0.7);font-size:15px;line-height:1.6;">Dirija-se ao credenciamento para retirar sua pulseira. Mostre esta confirmação para a equipe.</p>
        </td></tr>
        <tr><td style="padding:0 28px 8px 28px;">
          <div style="background:rgba(212,255,0,0.08);border:1px solid rgba(212,255,0,0.25);border-radius:12px;padding:16px 18px;">
            <p style="margin:0 0 6px 0;color:#D4FF00;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">⏰ Não esqueça</p>
            <p style="margin:0;color:#f5f0e8;font-size:14px;line-height:1.6;">Ao fim do seu turno, bata a <strong>saída</strong> no mesmo link. Sem a saída registrada, o ponto fica incompleto.</p>
          </div>
        </td></tr>
        <tr><td style="padding:24px 28px 8px 28px;" align="center">
          <a href="${pontoUrlEmail}" style="display:inline-block;background:#D4FF00;color:#06070a;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;border-radius:999px;text-decoration:none;">Bater saída no fim do turno</a>
        </td></tr>
        <tr><td style="padding:16px 28px 28px 28px;" align="center">
          <p style="margin:0;color:rgba(245,240,232,0.42);font-size:11px;line-height:1.6;word-break:break-all;">${pontoUrlEmail}</p>
        </td></tr>
        <tr><td style="padding:0 28px 28px 28px;">
          <hr style="border:0;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 16px 0;">
          <p style="margin:0;color:rgba(245,240,232,0.4);font-size:11px;line-height:1.6;">Código do ponto: ${receiptCodeEmail} · Local: ${venueLabelEmail}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
    const emailText = [
      `Entrada confirmada, ${staffNameEmail}!`,
      '',
      `Sua entrada no ${event.name} foi registrada às ${checkinTimeEmail}.`,
      'Dirija-se ao credenciamento para retirar sua pulseira.',
      '',
      '⏰ NÃO ESQUEÇA: ao fim do seu turno, bata a SAÍDA no mesmo link:',
      pontoUrlEmail,
      '',
      `Código do ponto: ${receiptCodeEmail}`,
      `Local: ${venueLabelEmail}`,
    ].join('\n')

    const emailResult = await sendResendEmail({
      to: staffMember.email,
      subject: `Ponto registrado | ${event.name} — lembre da saída`,
      html: emailHtml,
      text: emailText,
    })
    if (!emailResult.ok) {
      console.warn('[staff-checkin] Falha ao enviar email de lembrete:', emailResult.error)
    }
  }

  const message =
    type === 'checkin'
      ? `Check-in registrado com sucesso para ${[staffMember.first_name, staffMember.last_name].filter(Boolean).join(' ')}. Dirija-se ao credenciamento para retirar sua pulseira e mostre o comprovante.`
      : `Checkout registrado com sucesso para ${[staffMember.first_name, staffMember.last_name].filter(Boolean).join(' ')}.`

  return jsonResponse({
    success: true,
    message,
    checkin: checkinRecord,
    distance_from_venue_meters: distanceFromVenueMeters,
  })
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main Handler
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Deno.serve(async (req: Request): Promise<Response> => {
  // â”€â”€ CORS preflight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    return errorResponse('MÃ©todo nÃ£o permitido. Use GET ou POST.', 405, 'METHOD_NOT_ALLOWED')
  } catch (err) {
    console.error('[staff-checkin] Erro inesperado:', err)
    return errorResponse(
      'Erro interno do servidor. Tente novamente mais tarde.',
      500,
      'INTERNAL_ERROR',
    )
  }
})
