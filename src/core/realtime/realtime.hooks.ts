/**
 * Realtime Hooks
 * Supabase Realtime subscriptions for operator checkins, team live, alerts.
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/core/notifications/notifications.store'

/** Subscribe to live checkins for an event. Fires onCheckin on each new row. */
export function useRealtimeCheckins(
  eventId: string | undefined,
  onCheckin: (row: { attendeeName: string; ticketType: string; gate: string | null }) => void
) {
  const cbRef = useRef(onCheckin)
  cbRef.current = onCheckin

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`checkins:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'checkins', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const row = payload.new as any
          // Fetch ticket info asynchronously via digital_ticket_id
          const { data: ticket } = await supabase
            .from('digital_tickets')
            .select('holder_name, ticket_type:ticket_type(name)')
            .eq('id', row.digital_ticket_id)
            .maybeSingle()
          const ticketData = ticket as any
          cbRef.current({
            attendeeName: ticketData?.holder_name ?? 'Participante',
            ticketType: ticketData?.ticket_type?.name ?? 'Ingresso',
            gate: row.gate_id ?? null,
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])
}

/** Subscribe to supervisor alerts (staff occurrences) for an event. */
export function useRealtimeAlerts(eventId: string | undefined) {
  const add = useNotifications((s) => s.add)

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`occurrences:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_occurrences', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as any
          add({
            type: row.type === 'critical' ? 'critical' : 'warning',
            title: 'Nova ocorrência',
            message: row.description ?? 'Ocorrência registrada',
            actionPath: '/pulse/supervisor/occurrences',
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, add])
}

/** Subscribe to approvals pending for supervisors. */
export function useRealtimeApprovals(eventId: string | undefined) {
  const add = useNotifications((s) => s.add)

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`approvals:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'supervisor_approvals', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as any
          add({
            type: 'info',
            title: 'Aprovação pendente',
            message: row.reason ?? 'Solicitação de aprovação recebida',
            actionPath: '/pulse/supervisor/approvals',
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, add])
}

/** Subscribe to staff_location_pings for real-time team map. */
export function useRealtimeTeamPings(
  eventId: string | undefined,
  onPing: (staffId: string, lat: number, lng: number) => void
) {
  const cbRef = useRef(onPing)
  cbRef.current = onPing

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`pings:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_location_pings', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as any
          cbRef.current(row.staff_member_id, row.lat, row.lng)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])
}

/** Subscribe to event feed posts. */
export function useRealtimeFeed(
  eventId: string | undefined,
  onPost: (post: { id: string; body: string }) => void
) {
  const cbRef = useRef(onPost)
  cbRef.current = onPost

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`feed:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_feed_posts', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as any
          cbRef.current({ id: row.id, body: row.body })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])
}
