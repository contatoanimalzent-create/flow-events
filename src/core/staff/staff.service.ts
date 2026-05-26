/**
 * Staff Service
 * Shift, presence sessions, location pings, occurrences, instructions.
 */

import { supabase } from '@/lib/supabase'

export interface StaffShift {
  id: string
  organizationId: string
  eventId: string
  eventName: string
  roleTitle: string
  area: string | null
  startTime: string
  endTime: string | null
  status: 'scheduled' | 'active' | 'completed'
}

export interface StaffSession {
  id: string
  openedAt: string
  closedAt: string | null
  status: 'open' | 'closed' | 'exception'
  totalMinutes: number | null
}

export interface StaffOccurrence {
  id: string
  type: string
  description: string
  occurredAt: string
  status: 'open' | 'resolved'
  location: string | null
}

export interface StaffInstruction {
  id: string
  title: string
  body: string
  priority: 'normal' | 'high' | 'critical'
  createdAt: string
}

export const staffService = {
  /**
   * Find the staff_member record for the currently authenticated user
   * by matching auth email against staff_members.email.
   */
  async findStaffMemberForAuthUser(authUserEmail: string, eventId: string): Promise<string | null> {
    const { data } = await supabase
      .from('staff_members')
      .select('id')
      .eq('email', authUserEmail)
      .eq('event_id', eventId)
      .limit(1)
      .maybeSingle()

    return data?.id ?? null
  },

  async getCurrentShift(staffMemberId: string, eventId: string): Promise<StaffShift | null> {
    const { data } = await supabase
      .from('staff_members')
      .select(`
        id,
        organization_id,
        role_title,
        area,
        shift_starts_at,
        shift_ends_at,
        status,
        event_id,
        events(name)
      `)
      .eq('id', staffMemberId)
      .eq('event_id', eventId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      organizationId: data.organization_id,
      eventId: data.event_id ?? eventId,
      eventName: (data.events as any)?.name ?? '-',
      roleTitle: data.role_title ?? 'staff_member',
      area: data.area ?? null,
      startTime: data.shift_starts_at ?? new Date().toISOString(),
      endTime: data.shift_ends_at ?? null,
      status: data.status === 'active' ? 'active' : data.status === 'completed' ? 'completed' : 'scheduled',
    }
  },

  async getActiveSession(staffMemberId: string): Promise<StaffSession | null> {
    const { data } = await supabase
      .from('timeclock_sessions')
      .select('id, opened_at, closed_at, status, total_minutes')
      .eq('staff_member_id', staffMemberId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      openedAt: data.opened_at,
      closedAt: data.closed_at ?? null,
      status: data.status,
      totalMinutes: data.total_minutes ?? null,
    }
  },

  async startSession(staffMemberId: string, eventId: string, organizationId: string): Promise<string> {
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('timeclock_sessions').insert({
      staff_member_id: staffMemberId,
      event_id: eventId,
      organization_id: organizationId,
      opened_at: now,
      status: 'open',
    }).select('id').single()
    if (error) throw new Error(error.message)
    return data.id
  },

  async endSession(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('timeclock_sessions')
      .update({
        closed_at: now,
        status: 'closed' as const,
      })
      .eq('id', sessionId)
    if (error) throw new Error(error.message)
  },

  async sendLocationPing(
    _staffMemberId: string,
    _eventId: string,
    lat: number,
    lng: number
  ): Promise<void> {
    // staff_location_pings table does not exist in the schema.
    // Log to console as a no-op so callers don't crash.
    console.debug('[staffService.sendLocationPing] no-op — table not available', {
      lat,
      lng,
    })
  },

  async getOccurrences(staffMemberId: string, eventId: string): Promise<StaffOccurrence[]> {
    try {
      const { data } = await supabase
        .from('staff_occurrences')
        .select('id, type, description, occurred_at, status, location')
        .eq('staff_member_id', staffMemberId)
        .eq('event_id', eventId)
        .order('occurred_at', { ascending: false })

      if (!data) return []

      return (data as any[]).map((o) => ({
        id: o.id,
        type: o.type,
        description: o.description,
        occurredAt: o.occurred_at,
        status: o.status ?? 'open',
        location: o.location ?? null,
      }))
    } catch (err) {
      console.warn('[staffService.getOccurrences] table may not exist, returning empty', err)
      return []
    }
  },

  async createOccurrence(
    staffMemberId: string,
    eventId: string,
    type: string,
    description: string,
    location?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('staff_occurrences').insert({
        staff_member_id: staffMemberId,
        event_id: eventId,
        type,
        description,
        location: location ?? null,
        occurred_at: new Date().toISOString(),
        status: 'open',
      })
      if (error) throw error
    } catch (err) {
      console.warn('[staffService.createOccurrence] table may not exist, skipping', err)
    }
  },

  async getInstructions(eventId: string): Promise<StaffInstruction[]> {
    try {
      const { data } = await supabase
        .from('staff_instructions')
        .select('id, title, body, priority, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (!data) return []

      return (data as any[]).map((i) => ({
        id: i.id,
        title: i.title,
        body: i.body,
        priority: i.priority ?? 'normal',
        createdAt: i.created_at,
      }))
    } catch (err) {
      console.warn('[staffService.getInstructions] table may not exist, returning empty', err)
      return []
    }
  },

  async getShiftHistory(staffMemberId: string, limit = 20): Promise<StaffShift[]> {
    const { data } = await supabase
      .from('staff_members')
      .select(`
        id, organization_id, role_title, area, shift_starts_at, shift_ends_at, status, event_id,
        events(name)
      `)
      .eq('id', staffMemberId)
      .in('status', ['completed', 'active'])
      .order('shift_starts_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((d): StaffShift => ({
      id: d.id,
      organizationId: d.organization_id ?? '',
      eventId: d.event_id ?? '',
      eventName: d.events?.name ?? '-',
      roleTitle: d.role_title ?? 'staff_member',
      area: d.area ?? null,
      startTime: d.shift_starts_at ?? '',
      endTime: d.shift_ends_at ?? null,
      status: d.status === 'active' ? 'active' : 'completed',
    }))
  },
}
