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

function normalizeText(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

function deriveArmyLabel(...values: unknown[]) {
  const text = values.map(normalizeText).join(' ')
  if (text.includes('COALIZ')) return 'Coalizão'
  if (text.includes('ALIAN')) return 'Aliança'
  return null
}

function deriveKitStatus(...values: unknown[]) {
  const text = values.map(normalizeText).join(' ')
  if (text.includes('SEM') && text.includes('KIT')) return 'Sem kit'
  if (text.includes('COM') && text.includes('KIT')) return 'Com kit'
  if (text.includes('KIT')) return 'Com kit'
  return null
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

    if (error) throw new Error(error.message || 'Erro ao enviar código')
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

    if (error) throw new Error(error.message || 'Erro ao validar código')
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

    if (error) throw new Error(error.message || 'Sessão do scanner expirada')
    if ((data as any)?.error) throw new Error((data as any).error)
    return data as ScannerAuthResponse
  },

  async validateToken(token: string, eventId: string, gate?: string): Promise<ValidationResult> {
    const { data: ticket, error } = await supabase
      .from('digital_tickets')
      .select(`
        id,
        status,
        event_id,
        qr_token,
        ticket_number,
        holder_name,
        holder_email,
        holder_cpf,
        metadata,
        ticket_type:ticket_types(name),
        batch:ticket_batches(name)
      `)
      .eq('qr_token', token)
      .maybeSingle()

    if (error || !ticket) {
      return { valid: false, reason: 'not_found', message: 'Ingresso não encontrado' }
    }

    if ((ticket as any).event_id !== eventId) {
      return { valid: false, reason: 'wrong_event', message: 'Ingresso de outro evento' }
    }

    const ticketStatus = (ticket as any).status as string
    if (ticketStatus === 'used') {
      return { valid: false, reason: 'already_used', message: 'Ingresso já utilizado' }
    }

    if (ticketStatus !== 'confirmed' && ticketStatus !== 'active' && ticketStatus !== 'paid') {
      return { valid: false, reason: 'invalid_token', message: `Ingresso inválido (${ticketStatus})` }
    }

    const { count: existingCheckins } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('digital_ticket_id', (ticket as any).id)
      .eq('result', 'success')
      .eq('is_exit', false)

    if ((existingCheckins ?? 0) > 0) {
      return { valid: false, reason: 'already_used', message: 'Ingresso já utilizado (check-in duplicado)' }
    }

    const { error: checkinError } = await supabase.from('checkins').insert({
      event_id: eventId,
      digital_ticket_id: (ticket as any).id,
      gate_id: gate ?? null,
      result: 'success',
      reason_code: 'ticket_valid',
      is_exit: false,
      was_offline: false,
      checked_in_at: new Date().toISOString(),
    })

    if (checkinError) {
      return { valid: false, reason: 'unauthorized', message: 'Erro ao registrar check-in' }
    }

    await supabase
      .from('digital_tickets')
      .update({ status: 'used', checked_in_at: new Date().toISOString() })
      .eq('id', (ticket as any).id)

    const name = (ticket as any).holder_name ?? 'Participante'
    const typeName = ((ticket as any).ticket_type as any)?.name ?? 'Ingresso'
    const batchName = ((ticket as any).batch as any)?.name ?? ''
    const metadata = ((ticket as any).metadata ?? {}) as Record<string, unknown>
    const army = String(metadata.army_label ?? '') || deriveArmyLabel(typeName, batchName)
    const category =
      String(metadata.category ?? metadata.registration_category ?? metadata.squad ?? '').trim() ||
      typeName
    const kitStatus = String(metadata.kit_status ?? '').trim() || deriveKitStatus(typeName, batchName)

    return {
      valid: true,
      name,
      ticketLabel: typeName,
      ticketType: typeName,
      attendeeId: (ticket as any).id,
      message: 'Acesso liberado',
      cpf: (ticket as any).holder_cpf ?? null,
      email: (ticket as any).holder_email ?? null,
      ticketNumber: (ticket as any).ticket_number ?? null,
      army: army || null,
      kitStatus: kitStatus || 'Não informado',
      category,
    }
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
