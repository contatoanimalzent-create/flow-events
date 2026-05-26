/**
 * Attendee Service
 * Tickets, dynamic QR, agenda, feed, networking, upgrades.
 */

import { supabase } from '@/lib/supabase'

export interface AttendeeTicket {
  id: string
  qrToken: string
  status: string
  ticketType: string
  eventId: string
  eventName: string
  eventDate: string | null
  eventVenue: string | null
  holderName: string
}

export interface AgendaSession {
  id: string
  title: string
  description: string | null
  speakerName: string | null
  stage: string | null
  startsAt: string
  endsAt: string | null
  category: string | null
  isFavorite: boolean
}

export interface FeedPost {
  id: string
  authorName: string
  authorAvatar: string | null
  body: string
  imageUrl: string | null
  createdAt: string
  likesCount: number
}

export interface UpgradeOffer {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  available: number | null
}

export const attendeeService = {
  async getMyTickets(userId: string): Promise<AttendeeTicket[]> {
    const { data: authUser } = await supabase.auth.getUser()
    const email = authUser?.user?.email
    if (!email) return []

    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id, qr_token, status, holder_name, holder_email,
        event_id,
        ticket_type:ticket_types(name),
        event:events(name, starts_at, venue_name)
      `)
      .eq('holder_email', email)
      .order('created_at', { ascending: false })

    if (!data) return []

    return (data as any[]).map((t) => ({
      id: t.id,
      qrToken: t.qr_token,
      status: t.status,
      ticketType: t.ticket_type?.name ?? 'Ingresso',
      eventId: t.event_id,
      eventName: t.event?.name ?? '-',
      eventDate: t.event?.starts_at ?? null,
      eventVenue: t.event?.venue_name ?? null,
      holderName: t.holder_name ?? 'Participante',
    }))
  },

  async getTicketById(ticketId: string): Promise<AttendeeTicket | null> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id, qr_token, status, holder_name, holder_email,
        event_id,
        ticket_type:ticket_types(name),
        event:events(name, starts_at, venue_name)
      `)
      .eq('id', ticketId)
      .maybeSingle()

    if (!data) return null

    return {
      id: (data as any).id,
      qrToken: (data as any).qr_token,
      status: (data as any).status,
      ticketType: (data as any).ticket_type?.name ?? 'Ingresso',
      eventId: (data as any).event_id,
      eventName: (data as any).event?.name ?? '-',
      eventDate: (data as any).event?.starts_at ?? null,
      eventVenue: (data as any).event?.venue_name ?? null,
      holderName: (data as any).holder_name ?? 'Participante',
    }
  },

  async getAgenda(eventId: string, userId: string): Promise<AgendaSession[]> {
    try {
      const [sessionsResult, favoritesResult] = await Promise.all([
        supabase
          .from('agenda_sessions')
          .select('id, title, description, speaker_name, stage, starts_at, ends_at, category')
          .eq('event_id', eventId)
          .order('starts_at', { ascending: true }),
        supabase
          .from('agenda_favorites')
          .select('session_id')
          .eq('user_id', userId)
          .eq('event_id', eventId),
      ])

      const sessions = sessionsResult.data
      if (!sessions) return []

      const favSet = new Set((favoritesResult.data ?? []).map((f: any) => f.session_id))

      return (sessions as any[]).map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description ?? null,
        speakerName: s.speaker_name ?? null,
        stage: s.stage ?? null,
        startsAt: s.starts_at,
        endsAt: s.ends_at ?? null,
        category: s.category ?? null,
        isFavorite: favSet.has(s.id),
      }))
    } catch {
      return []
    }
  },

  async toggleFavorite(sessionId: string, eventId: string, userId: string, isFavorite: boolean): Promise<void> {
    try {
      if (isFavorite) {
        await supabase.from('agenda_favorites').delete()
          .eq('session_id', sessionId).eq('user_id', userId)
      } else {
        await supabase.from('agenda_favorites').upsert({
          session_id: sessionId, event_id: eventId, user_id: userId,
        })
      }
    } catch {
      // Tables may not exist yet
    }
  },

  async getFeed(eventId: string): Promise<FeedPost[]> {
    try {
      const { data } = await supabase
        .from('event_feed_posts')
        .select('id, body, image_url, created_at, likes_count, author_name')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!data) return []

      return (data as any[]).map((p) => ({
        id: p.id,
        authorName: p.author_name ?? 'Organizador',
        authorAvatar: null,
        body: p.body,
        imageUrl: p.image_url ?? null,
        createdAt: p.created_at,
        likesCount: p.likes_count ?? 0,
      }))
    } catch {
      return []
    }
  },

  async getUpgrades(eventId: string): Promise<UpgradeOffer[]> {
    try {
      const { data } = await supabase
        .from('ticket_types')
        .select('id, name, description, currency, ticket_batches(price, available_quantity)')
        .eq('event_id', eventId)
        .eq('is_active', true)

      if (!data) return []

      return (data as any[])
        .filter((t) => t.ticket_batches?.length > 0)
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description ?? null,
          price: t.ticket_batches?.[0]?.price ?? 0,
          currency: t.currency ?? 'BRL',
          available: t.ticket_batches?.[0]?.available_quantity ?? null,
        }))
    } catch {
      return []
    }
  },
}
