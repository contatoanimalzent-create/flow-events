/**
 * Operator Service
 * Real QR validation, manual check, checkin history, flow metrics.
 * Uses same schema as features/checkin (digital_ticket_id, gate_id, result, etc.)
 */

import { supabase } from '@/lib/supabase'

export type ValidationResult =
  | {
      valid: true
      name: string
      ticketLabel: string
      ticketType: string
      attendeeId: string
      message: string
      cpf?: string | null
      email?: string | null
      ticketNumber?: string | null
      manualCode?: string | null
      army?: string | null
      kitStatus?: string | null
      category?: string | null
    }
  | { valid: false; reason: 'not_found' | 'already_used' | 'wrong_event' | 'invalid_token' | 'gate_mismatch' | 'unauthorized'; message: string }

export interface CheckinRecord {
  id: string
  attendeeName: string
  ticketLabel: string
  validAt: string
  valid: boolean
  gate: string | null
}

export interface FlowMetrics {
  totalValid: number
  totalInvalid: number
  perMinute: number
  syncPending: number
}

export interface ScannerAuthResponse {
  ok: true
  masked_email?: string
  scanner_session?: string
  expires_at?: string
  event_id?: string
  event_name?: string
}

export interface OperatorTicketListItem {
  id: string
  name: string
  email: string | null
  cpf: string | null
  army: string | null
  category: string
  kitStatus: string | null
  ticketNumber: string | null
  manualCode: string | null
  status: string
  checkedInAt: string | null
  checkedIn: boolean
}

function normalizeText(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
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

function normalizeLookup(rawToken: string) {
  const trimmed = rawToken.trim()
  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get('token') ?? url.searchParams.get('qr_token') ?? url.searchParams.get('code')
    if (fromQuery) return normalizeLookup(fromQuery)
    const uuidInUrl = url.href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
    if (uuidInUrl) return uuidInUrl.toLowerCase()
    const lastPathPart = url.pathname.split('/').filter(Boolean).pop()
    if (lastPathPart) return normalizeLookup(lastPathPart)
  } catch {
    // Plain QR token or manual code.
  }

  const uuid = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
  if (uuid) return uuid.toLowerCase()
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
  metadata,
  ticket_type:ticket_types(name),
  batch:ticket_batches(name)
`

function mapTicketListItem(ticket: Record<string, unknown>): OperatorTicketListItem {
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
  }
}

export const operatorService = {
  async requestScannerCode(input: { eventId?: string; eventSlug?: string }): Promise<ScannerAuthResponse> {
    const { data, error } = await supabase.functions.invoke('scanner-auth', {
      body: {
        action: 'request_code',
        event_id: input.eventId,
        event_slug: input.eventSlug,
      },
    })

    if (error) throw new Error(error.message || 'Erro ao enviar codigo')
    if ((data as any)?.error) throw new Error((data as any).error)
    return data as ScannerAuthResponse
  },

  async verifyScannerCode(input: { eventId?: string; eventSlug?: string; code: string }): Promise<ScannerAuthResponse> {
    const { data, error } = await supabase.functions.invoke('scanner-auth', {
      body: {
        action: 'verify_code',
        event_id: input.eventId,
        event_slug: input.eventSlug,
        code: input.code,
      },
    })

    if (error) throw new Error(error.message || 'Erro ao validar codigo')
    if ((data as any)?.error) throw new Error((data as any).error)
    return data as ScannerAuthResponse
  },

  async checkScannerSession(input: { eventId?: string; eventSlug?: string; scannerSession: string }): Promise<ScannerAuthResponse> {
    const { data, error } = await supabase.functions.invoke('scanner-auth', {
      body: {
        action: 'check_session',
        event_id: input.eventId,
        event_slug: input.eventSlug,
        scanner_session: input.scannerSession,
      },
    })

    if (error) throw new Error(error.message || 'Sessao do scanner expirada')
    if ((data as any)?.error) throw new Error((data as any).error)
    return data as ScannerAuthResponse
  },

  async validateToken(token: string, eventId: string, gate?: string): Promise<ValidationResult> {
    const lookup = normalizeLookup(token)
    let ticket: Record<string, unknown> | null = null
    let lookupError: unknown = null
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookup)

    if (isUuid) {
      const { data, error } = await supabase
        .from('digital_tickets')
        .select(ticketSelect)
        .eq('qr_token', lookup)
        .maybeSingle()
      ticket = data as Record<string, unknown> | null
      lookupError = error
    }

    if (!ticket && !lookupError) {
      const { data, error } = await supabase
        .from('digital_tickets')
        .select(ticketSelect)
        .eq('event_id', eventId)
        .limit(2000)

      lookupError = error
      ticket = ((data ?? []) as Array<Record<string, unknown>>).find((item) => {
        const qrToken = String(item.qr_token ?? '').toLowerCase()
        const ticketNumber = String(item.ticket_number ?? '').toUpperCase()
        const manualCode = ticketManualCode(item)
        return qrToken === lookup.toLowerCase()
          || ticketNumber === lookup
          || ticketNumber.endsWith(`-${lookup}`)
          || manualCode === lookup
      }) ?? null
    }

    if (lookupError || !ticket) {
      return { valid: false, reason: 'not_found', message: 'Ingresso nao encontrado' }
    }

    if (ticket.event_id !== eventId) {
      return { valid: false, reason: 'wrong_event', message: 'Ingresso de outro evento' }
    }

    const ticketStatus = ticket.status as string
    if (ticketStatus === 'used') {
      return { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado' }
    }

    if (ticketStatus !== 'confirmed' && ticketStatus !== 'active' && ticketStatus !== 'paid') {
      return { valid: false, reason: 'invalid_token', message: `Ingresso invalido (${ticketStatus})` }
    }

    const { count: existingCheckins } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('digital_ticket_id', ticket.id as string)
      .eq('result', 'success')
      .eq('is_exit', false)

    if ((existingCheckins ?? 0) > 0) {
      return { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado (check-in duplicado)' }
    }

    const checkedInAt = new Date().toISOString()
    const { data: lockedTicket, error: lockError } = await supabase
      .from('digital_tickets')
      .update({ status: 'used', checked_in_at: checkedInAt })
      .eq('id', ticket.id as string)
      .is('checked_in_at', null)
      .in('status', ['confirmed', 'active', 'paid'])
      .select(ticketSelect)
      .maybeSingle()

    if (lockError || !lockedTicket) {
      return { valid: false, reason: 'already_used', message: 'Ingresso ja utilizado' }
    }

    const { error: checkinError } = await supabase.from('checkins').insert({
      event_id: eventId,
      digital_ticket_id: ticket.id,
      gate_id: gate ?? null,
      result: 'success',
      reason_code: 'ticket_valid',
      is_exit: false,
      was_offline: false,
      checked_in_at: checkedInAt,
    })

    if (checkinError) {
      return { valid: false, reason: 'unauthorized', message: 'Erro ao registrar check-in' }
    }

    const mapped = mapTicketListItem(lockedTicket as Record<string, unknown>)
    const typeName = ((lockedTicket as Record<string, unknown>).ticket_type as any)?.name ?? 'Ingresso'

    return {
      valid: true,
      name: mapped.name,
      ticketLabel: typeName,
      ticketType: typeName,
      attendeeId: mapped.id,
      message: 'Acesso liberado',
      cpf: mapped.cpf,
      email: mapped.email,
      ticketNumber: mapped.ticketNumber,
      manualCode: mapped.manualCode,
      army: mapped.army,
      kitStatus: mapped.kitStatus,
      category: mapped.category,
    }
  },

  async listEventTickets(eventId: string): Promise<OperatorTicketListItem[]> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(ticketSelect)
      .eq('event_id', eventId)
      .order('holder_name', { ascending: true })
      .limit(2000)

    if (!data) return []
    return (data as Array<Record<string, unknown>>).map(mapTicketListItem)
  },

  async searchAttendee(query: string, eventId: string): Promise<Array<{
    ticketId: string; attendeeId: string; name: string; email: string; ticketType: string; status: string; qrToken?: string
  }>> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id,
        status,
        holder_name,
        holder_email,
        qr_token,
        ticket_type:ticket_types(name)
      `)
      .eq('event_id', eventId)
      .limit(50)

    if (!data) return []

    const q = query.toLowerCase()
    return (data as any[])
      .filter((t) => {
        const name = t.holder_name ?? ''
        const email = t.holder_email ?? ''
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
      })
      .map((t) => ({
        ticketId: t.id,
        attendeeId: t.id,
        name: t.holder_name ?? '-',
        email: t.holder_email ?? '-',
        ticketType: t.ticket_type?.name ?? 'Ingresso',
        status: t.status,
        qrToken: t.qr_token ?? undefined,
      }))
  },

  async getCheckinHistory(eventId: string, limit = 50): Promise<CheckinRecord[]> {
    const { data } = await supabase
      .from('checkins')
      .select(`
        id,
        checked_in_at,
        gate_id,
        result,
        is_exit,
        was_offline,
        digital_ticket:digital_tickets(holder_name, ticket_type:ticket_types(name)),
        gate:gates(name)
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((c) => ({
      id: c.id,
      attendeeName: c.digital_ticket?.holder_name ?? 'Participante',
      ticketLabel: c.digital_ticket?.ticket_type?.name ?? 'Ingresso',
      validAt: c.checked_in_at,
      valid: c.result === 'success',
      gate: c.gate?.name ?? null,
    }))
  },

  async getFlowMetrics(eventId: string): Promise<FlowMetrics> {
    const [validRes, invalidRes] = await Promise.all([
      supabase
        .from('checkins')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('result', 'success'),
      supabase
        .from('checkins')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .neq('result', 'success'),
    ])

    const totalValid = validRes.count ?? 0
    const totalInvalid = invalidRes.count ?? 0

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count: recentCount } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('result', 'success')
      .gte('checked_in_at', oneMinuteAgo)

    return {
      totalValid,
      totalInvalid,
      perMinute: recentCount ?? 0,
      syncPending: 0,
    }
  },
}
