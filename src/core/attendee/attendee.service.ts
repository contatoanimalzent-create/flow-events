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
  expiresAt: string | null
}

export const attendeeService = {
  async getMyTickets(userId: string): Promise<AttendeeTicket[]> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id, qr_token, status, attendee_id,
        ticket_type_id, event_id,
        ticket_types(name),
        events(name, start_date, venues(name)),
        profiles!attendee_id(full_name)
      `)
      .eq('attendee_id', userId)
      .order('created_at', { ascending: false })

    if (!data) return []

    return (data as any[]).map((t) => ({
      id: t.id,
      qrToken: t.qr_token,
      status: t.status,
      ticketType: t.ticket_types?.name ?? 'Ingresso',
      eventId: t.event_id,
      eventName: t.events?.name ?? '-',
      eventDate: t.events?.start_date ?? null,
      eventVenue: t.events?.venues?.name ?? null,
      holderName: t.profiles?.full_name ?? 'Participante',
    }))
  },

  async getTicketById(ticketId: string): Promise<AttendeeTicket | null> {
    const { data } = await supabase
      .from('digital_tickets')
      .select(`
        id, qr_token, status, attendee_id,
        ticket_type_id, event_id,
        ticket_types(name),
        events(name, start_date, venues(name)),
        profiles!attendee_id(full_name)
      `)
      .eq('id', ticketId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      qrToken: data.qr_token,
      status: data.status,
      ticketType: (data.ticket_types as any)?.name ?? 'Ingresso',
      eventId: data.event_id,
      eventName: (data.events as any)?.name ?? '-',
      eventDate: (data.events as any)?.start_date ?? null,
      eventVenue: (data.events as any)?.venues?.name ?? null,
      holderName: (data.profiles as any)?.full_name ?? 'Participante',
    }
  },

  async getAgenda(eventId: string, userId: string): Promise<AgendaSession[]> {
    const [{ data: sessions }, { data: favorites }] = await Promise.all([
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

    if (!sessions) return []

    const favSet = new Set((favorites ?? []).map((f: any) => f.session_id))

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
  },

  async toggleFavorite(sessionId: string, eventId: string, userId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await supabase.from('agenda_favorites').delete()
        .eq('session_id', sessionId).eq('user_id', userId)
    } else {
      await supabase.from('agenda_favorites').upsert({
        session_id: sessionId, event_id: eventId, user_id: userId,
      })
    }
  },

  async getFeed(eventId: string): Promise<FeedPost[]> {
    const { data } = await supabase
      .from('event_feed_posts')
      .select(`
        id, body, image_url, created_at, likes_count,
        author_id,
        profiles!author_id(full_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!data) return []

    return (data as any[]).map((p) => ({
      id: p.id,
      authorName: p.profiles?.full_name ?? 'Organizador',
      authorAvatar: p.profiles?.avatar_url ?? null,
      body: p.body,
      imageUrl: p.image_url ?? null,
      createdAt: p.created_at,
      likesCount: p.likes_count ?? 0,
    }))
  },

  async getUpgrades(eventId: string): Promise<UpgradeOffer[]> {
    const { data } = await supabase
      .from('ticket_types')
      .select('id, name, description, price, currency, available_qty, sale_end_date')
      .eq('event_id', eventId)
      .eq('is_upgrade', true)
      .eq('status', 'active')

    if (!data) return []

    return (data as any[]).map((u) => ({
      id: u.id,
      name: u.name,
      description: u.description ?? null,
      price: u.price ?? 0,
      currency: u.currency ?? 'BRL',
      available: u.available_qty ?? null,
      expiresAt: u.sale_end_date ?? null,
    }))
  },
}
