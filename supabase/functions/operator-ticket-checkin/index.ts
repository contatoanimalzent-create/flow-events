import { getCorsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

type Action = 'validate' | 'list'

interface RequestBody {
  action?: Action
  event_id?: string
  event_slug?: string
  token?: string
  gate_id?: string | null
  scanner_session?: string
  dry_run?: boolean
}

const ACTIVE_STATUSES = ['confirmed', 'active', 'paid']

const ticketSelect = `
  id,
  status,
  event_id,
  qr_token,
  ticket_number,
  checked_in_at,
  holder_name,
  holder_email,
  holder_cpf,
  metadata
`

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  })
}

function normalizeText(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

function normalizeLookup(rawToken: string) {
  const trimmed = rawToken.trim()
  try {
    const parsed = JSON.parse(trimmed)
    const fromJson = parsed?.token ?? parsed?.qr_token ?? parsed?.qrToken ?? parsed?.code ?? parsed?.id
    if (fromJson) return normalizeLookup(String(fromJson))
  } catch {
    // Plain token or URL.
  }

  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get('token') ?? url.searchParams.get('qr_token') ?? url.searchParams.get('code')
    if (fromQuery) return normalizeLookup(fromQuery)
    const uuidInUrl = url.href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
    if (uuidInUrl) return uuidInUrl.toLowerCase()
    const lastPathPart = url.pathname.split('/').filter(Boolean).pop()
    if (lastPathPart) return normalizeLookup(lastPathPart)
  } catch {
    // Plain token.
  }

  const uuid = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
  if (uuid) return uuid.toLowerCase()
  if (/^[0-9a-f]{8}(?:-[0-9a-f]{0,4}){0,4}$/i.test(trimmed)) return trimmed.toLowerCase()
  return trimmed.replace(/^CS[-\s]?/i, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function shortCodeFromQrToken(qrToken?: string | null) {
  const compact = String(qrToken ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return compact ? compact.slice(0, 8) : null
}

function ticketManualCode(ticket: Record<string, unknown>) {
  const metadata = (ticket.metadata ?? {}) as Record<string, unknown>
  return String(metadata.short_code ?? '').trim().toUpperCase() || shortCodeFromQrToken(String(ticket.qr_token ?? ''))
}

function deriveArmyLabel(...values: unknown[]) {
  const text = values.map(normalizeText).join(' ')
  if (text.includes('COALIZ')) return 'Coalizao'
  if (text.includes('ALIAN')) return 'Alianca'
  return null
}

function deriveKitStatus(...values: unknown[]) {
  const text = values.map(normalizeText).join(' ')
  if (text.includes('SEM') && text.includes('KIT')) return 'Sem kit'
  if (text.includes('COM') && text.includes('KIT')) return 'Com kit'
  if (text.includes('KIT')) return 'Com kit'
  return null
}

function mapTicket(ticket: Record<string, unknown>) {
  const typeName = (ticket.ticket_type as any)?.name ?? 'Ingresso'
  const batchName = (ticket.batch as any)?.name ?? ''
  const metadata = (ticket.metadata ?? {}) as Record<string, unknown>
  const army = String(metadata.army_label ?? '') || deriveArmyLabel(typeName, batchName)
  const category = String(metadata.category ?? metadata.registration_category ?? metadata.squad ?? '').trim() || typeName
  const kitStatus = String(metadata.kit_status ?? '').trim() || deriveKitStatus(typeName, batchName)
  const checkedInAt = (ticket.checked_in_at as string | null) ?? null
  const status = String(ticket.status ?? '')
  const checkedIn = status === 'used' || Boolean(checkedInAt)

  return {
    id: String(ticket.id),
    name: String(ticket.holder_name ?? 'Participante'),
    email: (ticket.holder_email as string | null) ?? null,
    cpf: (ticket.holder_cpf as string | null) ?? null,
    army: army || null,
    category,
    kitStatus: kitStatus || 'Nao informado',
    ticketNumber: (ticket.ticket_number as string | null) ?? null,
    manualCode: ticketManualCode(ticket),
    status,
    checkedInAt,
    checkedIn,
    ticketLabel: typeName,
  }
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function resolveProducerEmail(admin: ReturnType<typeof createSupabaseAdminClient>, event: any) {
  const configuredProducerEmail = String(Deno.env.get('SCANNER_PRODUCER_EMAIL') ?? 'walteciojr@gmail.com').trim().toLowerCase()
  if (configuredProducerEmail) return configuredProducerEmail
  const organizationEmail = Array.isArray(event.organization) ? event.organization[0]?.email : event.organization?.email
  return String(organizationEmail ?? '').trim().toLowerCase()
}

async function assertScannerSession(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  event: any,
  req: Request,
  scannerSession?: string,
) {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const bearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim()
  const apiKey = req.headers.get('apikey')?.trim()
  if (serviceRoleKey && (bearer === serviceRoleKey || apiKey === serviceRoleKey)) return { ok: true }

  const session = String(scannerSession ?? '').trim()
  if (serviceRoleKey && session === serviceRoleKey) return { ok: true }
  if (!session) return { ok: false, error: 'Sessao do scanner nao informada.' }

  const producerEmail = await resolveProducerEmail(admin, event)
  const pepper = Deno.env.get('SCANNER_AUTH_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const sessionHash = await sha256(`${event.id}:${producerEmail}:${session}:${pepper}`)
  const { data } = await admin
    .from('scanner_auth_codes')
    .select('id')
    .eq('event_id', event.id)
    .eq('email', producerEmail)
    .eq('session_token_hash', sessionHash)
    .gte('session_expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  if (data?.id) return { ok: true }

  // Diagnostic: see if there is ANY non-expired session for this event+email
  // and if the session token even hashes against a non-expired row
  const { data: anyValid } = await admin
    .from('scanner_auth_codes')
    .select('id, session_expires_at')
    .eq('event_id', event.id)
    .eq('email', producerEmail)
    .gte('session_expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  if (!anyValid?.id) {
    console.warn('[operator-ticket-checkin] no valid session row for event', event.id, 'email', producerEmail)
    return { ok: false, error: 'Sessao do scanner expirada. Faca login novamente.' }
  }

  console.warn('[operator-ticket-checkin] valid session row exists but token hash mismatch — session likely from a different SCANNER_AUTH_SECRET/SERVICE_ROLE_KEY rotation. event', event.id)
  return { ok: false, error: 'Sessao do scanner invalida. Sai e entra de novo.' }
}

async function findTicket(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  eventId: string,
  lookup: string,
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookup)
  const looksLikeUuidPrefix = /^[0-9a-f-]{8,35}$/i.test(lookup)

  if (isUuid) {
    const { data: byQr } = await admin
      .from('digital_tickets')
      .select(ticketSelect)
      .eq('event_id', eventId)
      .eq('qr_token', lookup)
      .limit(1)
      .maybeSingle()
    if (byQr) return byQr as Record<string, unknown>

    const { data: byId } = await admin
      .from('digital_tickets')
      .select(ticketSelect)
      .eq('event_id', eventId)
      .eq('id', lookup)
      .limit(1)
      .maybeSingle()
    if (byId) return byId as Record<string, unknown>
  }

  if (!isUuid && looksLikeUuidPrefix) {
    const { data: prefixMatches } = await admin
      .from('digital_tickets')
      .select(ticketSelect)
      .eq('event_id', eventId)
      .ilike('qr_token', `${lookup.toLowerCase()}%`)
      .limit(2)

    const matches = (prefixMatches ?? []) as Array<Record<string, unknown>>
    if (matches.length === 1) return matches[0]
  }

  const { data } = await admin
    .from('digital_tickets')
    .select(ticketSelect)
    .eq('event_id', eventId)
    .limit(3000)

  const tickets = (data ?? []) as Array<Record<string, unknown>>
  const exactMatch = tickets.find((item) => {
    const qrToken = String(item.qr_token ?? '').toLowerCase()
    const ticketNumber = String(item.ticket_number ?? '').toUpperCase()
    const manualCode = ticketManualCode(item)
    return qrToken === lookup.toLowerCase()
      || ticketNumber === lookup
      || ticketNumber.endsWith(`-${lookup}`)
      || manualCode === lookup
  })
  if (exactMatch) return exactMatch

  const compactLookup = lookup.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (compactLookup.length >= 8) {
    const prefixMatches = tickets.filter((item) => {
      const compactQr = String(item.qr_token ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      return compactQr.startsWith(compactLookup)
    })
    if (prefixMatches.length === 1) return prefixMatches[0]
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) })
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405)

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json(req, { error: 'JSON invalido.' }, 400)
  }

  const admin = createSupabaseAdminClient()
  const eventQuery = admin
    .from('events')
    .select('id,name,organization_id,slug,organization:organizations(email)')
    .limit(1)

  const { data: events, error: eventError } = body.event_id
    ? await eventQuery.eq('id', body.event_id)
    : await eventQuery.eq('slug', String(body.event_slug ?? '').trim())

  const event = Array.isArray(events) ? events[0] : null
  if (eventError || !event) return json(req, { error: 'Evento nao encontrado.' }, 404)

  const session = await assertScannerSession(admin, event, req, body.scanner_session)
  if (!session.ok) return json(req, { valid: false, reason: 'unauthorized', message: session.error }, 401)

  if (body.action === 'list') {
    const { data, error } = await admin
      .from('digital_tickets')
      .select(ticketSelect)
      .eq('event_id', event.id)
      .order('holder_name', { ascending: true })
      .limit(3000)

    if (error) return json(req, { error: 'Nao foi possivel carregar inscritos.' }, 500)
    return json(req, { tickets: ((data ?? []) as Array<Record<string, unknown>>).map(mapTicket) })
  }

  if (body.action !== 'validate') return json(req, { error: 'Acao invalida.' }, 400)

  const lookup = normalizeLookup(String(body.token ?? ''))
  if (!lookup) return json(req, { valid: false, reason: 'invalid_token', message: 'Codigo invalido' }, 400)

  const ticket = await findTicket(admin, event.id, lookup)
  if (!ticket) {
    console.warn('[operator-ticket-checkin] ticket not found', {
      raw_token: String(body.token ?? '').slice(0, 120),
      normalized_lookup: lookup,
      event_id: event.id,
    })
    return json(req, { valid: false, reason: 'not_found', message: 'Ingresso nao encontrado', debug_lookup: lookup })
  }
  if (ticket.event_id !== event.id) return json(req, { valid: false, reason: 'wrong_event', message: 'Ingresso de outro evento' })

  const mapped = mapTicket(ticket)
  const ticketStatus = String(ticket.status ?? '')
  if (ticketStatus === 'used' || ticket.checked_in_at) {
    return json(req, { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado' })
  }
  if (!ACTIVE_STATUSES.includes(ticketStatus)) {
    return json(req, { valid: false, reason: 'invalid_token', message: `Ingresso invalido (${ticketStatus})` })
  }

  const { count: existingCheckins } = await admin
    .from('checkins')
    .select('id', { count: 'exact', head: true })
    .eq('digital_ticket_id', ticket.id as string)
    .eq('result', 'success')
    .eq('is_exit', false)

  if ((existingCheckins ?? 0) > 0) {
    return json(req, { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado (check-in duplicado)' })
  }

  if (body.dry_run) {
    return json(req, {
      valid: true,
      dryRun: true,
      name: mapped.name,
      ticketLabel: mapped.ticketLabel,
      ticketType: mapped.ticketLabel,
      attendeeId: mapped.id,
      message: 'Acesso liberado (teste)',
      cpf: mapped.cpf,
      email: mapped.email,
      ticketNumber: mapped.ticketNumber,
      manualCode: mapped.manualCode,
      army: mapped.army,
      kitStatus: mapped.kitStatus,
      category: mapped.category,
    })
  }

  const checkedInAt = new Date().toISOString()
  const { data: lockedTicket, error: lockError } = await admin
    .from('digital_tickets')
    .update({ status: 'used', checked_in_at: checkedInAt })
    .eq('id', ticket.id as string)
    .is('checked_in_at', null)
    .in('status', ACTIVE_STATUSES)
    .select(ticketSelect)
    .maybeSingle()

  if (lockError || !lockedTicket) {
    return json(req, { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado' })
  }

  const { error: checkinError } = await admin.from('checkins').insert({
    event_id: event.id,
    digital_ticket_id: ticket.id,
    gate_id: body.gate_id ?? null,
    result: 'success',
    reason_code: 'ticket_valid',
    is_exit: false,
    was_offline: false,
    checked_in_at: checkedInAt,
  })

  if (checkinError) {
    return json(req, { valid: false, reason: 'unauthorized', message: 'Erro ao registrar check-in' }, 500)
  }

  const checkedMapped = mapTicket(lockedTicket as Record<string, unknown>)
  return json(req, {
    valid: true,
    name: checkedMapped.name,
    ticketLabel: checkedMapped.ticketLabel,
    ticketType: checkedMapped.ticketLabel,
    attendeeId: checkedMapped.id,
    message: 'Acesso liberado',
    cpf: checkedMapped.cpf,
    email: checkedMapped.email,
    ticketNumber: checkedMapped.ticketNumber,
    manualCode: checkedMapped.manualCode,
    army: checkedMapped.army,
    kitStatus: checkedMapped.kitStatus,
    category: checkedMapped.category,
  })
})
