/**
 * Operator Service
 * Real QR validation, manual check, checkin history, flow metrics.
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
  /**
   * Validate a QR token for check-in.
   * Rules: token exists, belongs to event, is paid, is active, not yet used.
   */
  async validateToken(token: string, eventId: string, gate?: string): Promise<ValidationResult> {
    // 1. Find the ticket by QR token
    const { data: ticket, error } = await supabase
      .from('digital_tickets')
      .select(`
        id,
        status,
        event_id,
        qr_token,
        ticket_type_id,
        attendee_id,
        ticket_types(name),
        profiles!attendee_id(full_name)
      `)
      .eq('qr_token', token)
      .maybeSingle()

    if (error || !ticket) {
      return { valid: false, reason: 'not_found', message: 'Ingresso não encontrado' }
    }

    // 2. Check event match
    if (ticket.event_id !== eventId) {
      return { valid: false, reason: 'wrong_event', message: 'Ingresso de outro evento' }
    }

    // 3. Check status
    if (ticket.status === 'used') {
      return { valid: false, reason: 'already_used', message: 'Ingresso já utilizado' }
    }

    if (ticket.status !== 'active' && ticket.status !== 'paid') {
      return { valid: false, reason: 'invalid_token', message: `Ingresso inválido (${ticket.status})` }
    }

    // 4. Check existing checkin (dedup)
    const { count: checkinCount } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('ticket_id', ticket.id)

    if ((checkinCount ?? 0) > 0) {
      return { valid: false, reason: 'already_used', message: 'Ingresso já utilizado (check-in duplicado)' }
    }

    // 5. Register checkin
    const { error: checkinError } = await supabase.from('checkins').insert({
      event_id: eventId,
      ticket_id: ticket.id,
      attendee_id: ticket.attendee_id,
      qr_token: token,
      gate: gate ?? null,
      checked_in_at: new Date().toISOString(),
      offline: false,
    })

    if (checkinError) {
      return { valid: false, reason: 'unauthorized', message: 'Erro ao registrar check-in' }
    }

    // 6. Mark ticket as used
    await supabase
      .from('digital_tickets')
      .update({ status: 'used' })
      .eq('id', ticket.id)

    const name = (ticket.profiles as any)?.full_name ?? 'Participante'
    const typeName = (ticket.ticket_types as any)?.name ?? 'Ingresso'

    return {
      valid: true,
      name,
      ticketLabel: `${typeName}`,
      ticketType: typeName,
      attendeeId: ticket.attendee_id,
      message: 'Acesso liberado',
    }
  },

  /**
   * Manual check by attendee name or document.
   */
  async searchAttendee(query: string, eventId: string): Promise<Array<{
    ticketId: string; attendeeId: string; name: string; email: string; ticketType: string; status: string
  }>> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id,
        status,
        attendee_id,
        ticket_types(name),
        profiles!attendee_id(full_name, email)
      `)
      .eq('event_id', eventId)
      .limit(20)

    if (!data) return []

    const q = query.toLowerCase()
    return (data as any[])
      .filter((t) => {
        const name = t.profiles?.full_name ?? ''
        const email = t.profiles?.email ?? ''
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
      })
      .map((t) => ({
        ticketId: t.id,
        attendeeId: t.attendee_id,
        name: t.profiles?.full_name ?? '-',
        email: t.profiles?.email ?? '-',
        ticketType: t.ticket_types?.name ?? 'Ingresso',
        status: t.status,
      }))
  },

  /**
   * Get checkin history for the current operator session.
   */
  async getCheckinHistory(eventId: string, limit = 50): Promise<CheckinRecord[]> {
    const { data } = await supabase
      .from('checkins')
      .select(`
        id,
        checked_in_at,
        gate,
        offline,
        profiles!attendee_id(full_name),
        digital_tickets(ticket_types(name))
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((c) => ({
      id: c.id,
      attendeeName: c.profiles?.full_name ?? 'Participante',
      ticketLabel: c.digital_tickets?.ticket_types?.name ?? 'Ingresso',
      validAt: c.checked_in_at,
      valid: true,
      gate: c.gate ?? null,
    }))
  },

  /**
   * Get real-time flow metrics for an event.
   */
  async getFlowMetrics(eventId: string): Promise<FlowMetrics> {
    const [validRes, invalidRes] = await Promise.all([
      supabase
        .from('checkins')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId),
      supabase
        .from('checkin_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('valid', false),
    ])

    const totalValid = validRes.count ?? 0
    const totalInvalid = invalidRes.count ?? 0

    // Last-minute rate
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count: recentCount } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .gte('checked_in_at', oneMinuteAgo)

    return {
      totalValid,
      totalInvalid,
      perMinute: recentCount ?? 0,
      syncPending: 0,
    }
  },
}
