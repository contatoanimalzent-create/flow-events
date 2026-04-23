/**
 * Supervisor Service
 * Real-time team monitoring, delays, absences, approvals, map data.
 */

import { supabase } from '@/lib/supabase'

export type TeamMemberStatus = 'active' | 'delayed' | 'absent' | 'out-of-area' | 'offline'

export interface TeamMember {
  id: string
  name: string
  role: string
  zone: string | null
  status: TeamMemberStatus
  sessionStart: string | null
  lastPingAt: string | null
  lat: number | null
  lng: number | null
}

export interface SupervisorApproval {
  id: string
  type: string
  staffName: string
  reason: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface SupervisorOccurrence {
  id: string
  staffName: string
  type: string
  description: string
  zone: string | null
  occurredAt: string
  status: 'open' | 'resolved'
}

export const supervisorService = {
  async getTeamLive(eventId: string): Promise<{
    members: TeamMember[]
    total: number
    active: number
    delayed: number
    absent: number
    outOfArea: number
  }> {
    const { data: members } = await supabase
      .from('staff_members')
      .select(`
        id, role, zone, shift_start, status,
        user_id,
        profiles!user_id(full_name),
        staff_sessions(id, started_at, status),
        staff_location_pings(lat, lng, pinged_at)
      `)
      .eq('event_id', eventId)
      .order('shift_start', { ascending: true })

    if (!members) return { members: [], total: 0, active: 0, delayed: 0, absent: 0, outOfArea: 0 }

    const now = Date.now()
    const PING_TIMEOUT_MS = 5 * 60 * 1000 // 5 min without ping = offline
    const DELAY_THRESHOLD_MS = 15 * 60 * 1000 // 15 min late = delayed

    const result: TeamMember[] = (members as any[]).map((m) => {
      const activeSession = (m.staff_sessions ?? []).find((s: any) => s.status === 'active')
      const lastPing = (m.staff_location_pings ?? []).sort((a: any, b: any) =>
        new Date(b.pinged_at).getTime() - new Date(a.pinged_at).getTime()
      )[0]

      let status: TeamMemberStatus = 'absent'

      if (activeSession) {
        if (lastPing) {
          const pingAge = now - new Date(lastPing.pinged_at).getTime()
          status = pingAge > PING_TIMEOUT_MS ? 'offline' : 'active'
        } else {
          status = 'active'
        }
      } else if (m.shift_start) {
        const shiftStart = new Date(m.shift_start).getTime()
        const late = now - shiftStart
        status = late > DELAY_THRESHOLD_MS ? 'delayed' : 'absent'
      }

      return {
        id: m.id,
        name: (m.profiles as any)?.full_name ?? 'Sem nome',
        role: m.role ?? 'staff_member',
        zone: m.zone ?? null,
        status,
        sessionStart: activeSession?.started_at ?? null,
        lastPingAt: lastPing?.pinged_at ?? null,
        lat: lastPing?.lat ?? null,
        lng: lastPing?.lng ?? null,
      }
    })

    return {
      members: result,
      total: result.length,
      active: result.filter((m) => m.status === 'active').length,
      delayed: result.filter((m) => m.status === 'delayed').length,
      absent: result.filter((m) => m.status === 'absent').length,
      outOfArea: result.filter((m) => m.status === 'out-of-area').length,
    }
  },

  async getApprovals(eventId: string): Promise<SupervisorApproval[]> {
    const { data } = await supabase
      .from('supervisor_approvals')
      .select(`
        id, type, reason, requested_at, status,
        staff_member_id,
        staff_members(profiles!user_id(full_name))
      `)
      .eq('event_id', eventId)
      .order('requested_at', { ascending: false })

    if (!data) return []

    return (data as any[]).map((a) => ({
      id: a.id,
      type: a.type,
      staffName: a.staff_members?.profiles?.full_name ?? '—',
      reason: a.reason ?? '',
      requestedAt: a.requested_at,
      status: a.status ?? 'pending',
    }))
  },

  async resolveApproval(approvalId: string, approved: boolean, supervisorId: string): Promise<void> {
    const { error } = await supabase
      .from('supervisor_approvals')
      .update({
        status: approved ? 'approved' : 'rejected',
        resolved_by: supervisorId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
    if (error) throw new Error(error.message)
  },

  async getOccurrences(eventId: string): Promise<SupervisorOccurrence[]> {
    const { data } = await supabase
      .from('staff_occurrences')
      .select(`
        id, type, description, occurred_at, status,
        staff_member_id,
        staff_members(zone, profiles!user_id(full_name))
      `)
      .eq('event_id', eventId)
      .order('occurred_at', { ascending: false })

    if (!data) return []

    return (data as any[]).map((o) => ({
      id: o.id,
      staffName: o.staff_members?.profiles?.full_name ?? '—',
      type: o.type,
      description: o.description,
      zone: o.staff_members?.zone ?? null,
      occurredAt: o.occurred_at,
      status: o.status ?? 'open',
    }))
  },

  async resolveOccurrence(occurrenceId: string): Promise<void> {
    await supabase
      .from('staff_occurrences')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', occurrenceId)
  },

  async sendInstruction(eventId: string, supervisorId: string, title: string, body: string, priority: string): Promise<void> {
    const { error } = await supabase.from('staff_instructions').insert({
      event_id: eventId,
      created_by: supervisorId,
      title,
      body,
      priority,
      created_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
  },
}
