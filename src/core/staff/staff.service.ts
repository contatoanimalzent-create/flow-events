/**
 * Staff Service
 * Shift, presence sessions, location pings, occurrences, instructions.
 */

import { supabase } from '@/lib/supabase'

export interface StaffShift {
  id: string
  eventId: string
  eventName: string
  role: string
  supervisorName: string | null
  zone: string | null
  startTime: string
  endTime: string | null
  status: 'scheduled' | 'active' | 'completed'
}

export interface StaffSession {
  id: string
  startedAt: string
  endedAt: string | null
  status: 'active' | 'closed'
  latStart: number | null
  lngStart: number | null
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
  async getCurrentShift(userId: string, eventId: string): Promise<StaffShift | null> {
    const { data } = await supabase
      .from('staff_members')
      .select(`
        id,
        role,
        zone,
        shift_start,
        shift_end,
        status,
        event_id,
        events(name),
        supervisor_id,
        profiles!supervisor_id(full_name)
      `)
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      eventId: data.event_id,
      eventName: (data.events as any)?.name ?? '-',
      role: data.role ?? 'staff_member',
      supervisorName: (data.profiles as any)?.full_name ?? null,
      zone: data.zone ?? null,
      startTime: data.shift_start ?? new Date().toISOString(),
      endTime: data.shift_end ?? null,
      status: data.status === 'active' ? 'active' : data.status === 'completed' ? 'completed' : 'scheduled',
    }
  },

  async getActiveSession(staffMemberId: string): Promise<StaffSession | null> {
    const { data } = await supabase
      .from('staff_sessions')
      .select('id, started_at, ended_at, status, lat_start, lng_start')
      .eq('staff_member_id', staffMemberId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      startedAt: data.started_at,
      endedAt: data.ended_at ?? null,
      status: data.status,
      latStart: data.lat_start ?? null,
      lngStart: data.lng_start ?? null,
    }
  },

  async startSession(staffMemberId: string, eventId: string, lat?: number, lng?: number): Promise<string> {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const { error } = await supabase.from('staff_sessions').insert({
      id: sessionId,
      staff_member_id: staffMemberId,
      event_id: eventId,
      started_at: new Date().toISOString(),
      lat_start: lat ?? null,
      lng_start: lng ?? null,
      status: 'active',
    })
    if (error) throw new Error(error.message)
    return sessionId
  },

  async endSession(sessionId: string, lat?: number, lng?: number): Promise<void> {
    const { error } = await supabase
      .from('staff_sessions')
      .update({
        ended_at: new Date().toISOString(),
        lat_end: lat ?? null,
        lng_end: lng ?? null,
        status: 'closed',
      })
      .eq('id', sessionId)
    if (error) throw new Error(error.message)
  },

  async sendLocationPing(staffMemberId: string, eventId: string, lat: number, lng: number): Promise<void> {
    await supabase.from('staff_location_pings').insert({
      staff_member_id: staffMemberId,
      event_id: eventId,
      lat,
      lng,
      pinged_at: new Date().toISOString(),
    })
  },

  async getOccurrences(staffMemberId: string, eventId: string): Promise<StaffOccurrence[]> {
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
  },

  async createOccurrence(
    staffMemberId: string,
    eventId: string,
    type: string,
    description: string,
    location?: string
  ): Promise<void> {
    const { error } = await supabase.from('staff_occurrences').insert({
      staff_member_id: staffMemberId,
      event_id: eventId,
      type,
      description,
      location: location ?? null,
      occurred_at: new Date().toISOString(),
      status: 'open',
    })
    if (error) throw new Error(error.message)
  },

  async getInstructions(eventId: string): Promise<StaffInstruction[]> {
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
  },

  async getShiftHistory(userId: string, limit = 20): Promise<StaffShift[]> {
    const { data } = await supabase
      .from('staff_members')
      .select(`
        id, role, zone, shift_start, shift_end, status, event_id,
        events(name)
      `)
      .eq('user_id', userId)
      .in('status', ['completed', 'active'])
      .order('shift_start', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((d) => ({
      id: d.id,
      eventId: d.event_id,
      eventName: d.events?.name ?? '-',
      role: d.role ?? 'staff_member',
      supervisorName: null,
      zone: d.zone ?? null,
      startTime: d.shift_start ?? '',
      endTime: d.shift_end ?? null,
      status: d.status === 'active' ? 'active' : 'completed',
    }))
  },
}
