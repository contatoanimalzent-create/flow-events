import { supabase } from '@/lib/supabase'
import type { AppMode } from '../context/app-context.types'
import type { UserEvent } from './events.types'

const ROLE_MODE_MAP: Record<string, AppMode[]> = {
  super_admin: ['operator', 'staff', 'supervisor', 'attendee', 'promoter'],
  org_admin: ['operator', 'staff', 'supervisor', 'attendee', 'promoter'],
  org_manager: ['supervisor', 'staff', 'attendee'],
  checkin_operator: ['operator'],
  pdv_operator: ['operator'],
  staff_member: ['staff'],
  attendee: ['attendee'],
  promoter: ['promoter'],
}

export const eventsService = {
  async getEventsForUser(userId: string, orgId: string): Promise<UserEvent[]> {
    const { data: events } = await supabase
      .from('events')
      .select('id, name, slug, start_date, end_date, status, cover_url, organization_id, venues(name)')
      .eq('organization_id', orgId)
      .in('status', ['published', 'ongoing', 'finished'])
      .order('start_date', { ascending: false })
      .limit(30)

    if (!events) return []

    const eventIds = events.map((e: any) => e.id)

    // Get staff roles
    const { data: staffRows } = await supabase
      .from('staff_members')
      .select('event_id, role')
      .eq('user_id', userId)
      .in('event_id', eventIds)

    // Get tickets
    const { data: tickets } = await supabase
      .from('digital_tickets')
      .select('event_id')
      .eq('attendee_id', userId)
      .in('event_id', eventIds)

    // Get referral links (promoter)
    const { data: referrals } = await supabase
      .from('referral_links')
      .select('event_id')
      .eq('owner_id', userId)
      .in('event_id', eventIds)

    const ticketEventIds = new Set((tickets ?? []).map((t: any) => t.event_id))
    const referralEventIds = new Set((referrals ?? []).map((r: any) => r.event_id))

    // Get profile role (org-level, applies to all events in org)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    const profileRole = profile?.role ?? null

    const result: UserEvent[] = []

    for (const e of events as any[]) {
      const modeSet = new Set<AppMode>()

      if (profileRole) {
        ;(ROLE_MODE_MAP[profileRole] ?? []).forEach((m) => modeSet.add(m))
      }

      ;(staffRows ?? [])
        .filter((s: any) => s.event_id === e.id)
        .forEach((s: any) => {
          ;(ROLE_MODE_MAP[s.role] ?? []).forEach((m) => modeSet.add(m))
        })

      if (ticketEventIds.has(e.id)) modeSet.add('attendee')
      if (referralEventIds.has(e.id)) modeSet.add('promoter')

      if (modeSet.size === 0) continue // user has no access to this event

      result.push({
        id: e.id,
        name: e.name,
        slug: e.slug,
        start_date: e.start_date,
        end_date: e.end_date,
        status: e.status,
        venue_name: e.venues?.name ?? null,
        cover_url: e.cover_url ?? null,
        organization_id: e.organization_id,
        availableModes: Array.from(modeSet),
      })
    }

    return result
  },
}
