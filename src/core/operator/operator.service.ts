/**
 * Operator Service
 * Real QR validation, manual check, checkin history, flow metrics.
 * Uses same schema as features/checkin (digital_ticket_id, gate_id, result, etc.)
 */

import { supabase } from '@/lib/supabase'

export type ValidationResult =
  | { valid: true; name: string; ticketLabel: string; ticketType: string; attendeeId: string; message: string }
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

export const operatorService = {
  async validateToken(token: string, eventId: string, gate?: string): Promise<ValidationResult> {
    const { data: ticket, error } = await supabase
      .from('digital_tickets')
      .select(`
        id,
        status,
        event_id,
        qr_token,
        holder_name,
        holder_email,
        ticket_type:ticket_types(name)
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

    return {
      valid: true,
      name,
      ticketLabel: typeName,
      ticketType: typeName,
      attendeeId: (ticket as any).id,
      message: 'Acesso liberado',
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
