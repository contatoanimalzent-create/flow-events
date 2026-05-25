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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', userId)
      .single()
    const profileRole = profile?.role ?? null

    const { data: authUser } = await supabase.auth.getUser()
    const userEmail = authUser?.user?.email ?? null

    const { data: events } = await supabase
      .from('events')
      .select('id, name, slug, starts_at, ends_at, status, cover_url, venue_name, organization_id')
      .eq('organization_id', orgId)
      .in('status', ['published', 'ongoing', 'finished'])
      .order('starts_at', { ascending: false })
      .limit(30)

    if (!events) return []

    const eventIds = events.map((e: any) => e.id)

    const [staffResult, ticketResult, referralResult] = await Promise.all([
      supabase
        .from('staff_members')
        .select('event_id, role_title')
        .eq('email', userEmail ?? '')
        .in('event_id', eventIds),
      userEmail
        ? supabase
            .from('digital_tickets')
            .select('event_id')
            .eq('holder_email', userEmail)
            .in('event_id', eventIds)
        : Promise.resolve({ data: null }),
      supabase
        .from('referral_links')
        .select('event_id')
        .eq('referrer_id', userId)
        .in('event_id', eventIds),
    ])

    const staffRows = staffResult.data ?? []
    const ticketEventIds = new Set((ticketResult.data ?? []).map((t: any) => t.event_id))
    const referralEventIds = new Set((referralResult.data ?? []).map((r: any) => r.event_id))

    const result: UserEvent[] = []

    for (const e of events as any[]) {
      const modeSet = new Set<AppMode>()

      if (profileRole) {
        ;(ROLE_MODE_MAP[profileRole] ?? []).forEach((m) => modeSet.add(m))
      }

      ;(staffRows as any[])
        .filter((s: any) => s.event_id === e.id)
        .forEach(() => {
          modeSet.add('staff')
        })

      if (ticketEventIds.has(e.id)) modeSet.add('attendee')
      if (referralEventIds.has(e.id)) modeSet.add('promoter')

      if (modeSet.size === 0) continue

      result.push({
        id: e.id,
        name: e.name,
        slug: e.slug,
        starts_at: e.starts_at,
        ends_at: e.ends_at ?? null,
        status: e.status,
        venue_name: e.venue_name ?? null,
        cover_url: e.cover_url ?? null,
        organization_id: e.organization_id,
        availableModes: Array.from(modeSet),
      })
    }

    return result
  },
}
