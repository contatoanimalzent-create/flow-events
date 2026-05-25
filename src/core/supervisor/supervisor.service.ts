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
        id, first_name, last_name, role_title, area, shift_starts_at, status, is_active,
        checked_in_at, checked_out_at
      `)
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('first_name', { ascending: true })

    if (!members) return { members: [], total: 0, active: 0, delayed: 0, absent: 0, outOfArea: 0 }

    const now = Date.now()
    const DELAY_THRESHOLD_MS = 15 * 60 * 1000

    const result: TeamMember[] = (members as any[]).map((m) => {
      let memberStatus: TeamMemberStatus = 'absent'

      if (m.status === 'active' && m.checked_in_at && !m.checked_out_at) {
        memberStatus = 'active'
      } else if (m.shift_starts_at) {
        const shiftStart = new Date(m.shift_starts_at).getTime()
        const late = now - shiftStart
        if (late > 0 && late > DELAY_THRESHOLD_MS) {
          memberStatus = 'delayed'
        } else if (late <= 0) {
          memberStatus = 'absent'
        }
      }

      const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ')

      return {
        id: m.id,
        name: fullName || 'Sem nome',
        role: m.role_title ?? 'staff',
        zone: m.area ?? null,
        status: memberStatus,
        sessionStart: m.checked_in_at ?? null,
        lastPingAt: null,
        lat: null,
        lng: null,
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
    try {
      const { data } = await supabase
        .from('supervisor_approvals')
        .select(`
          id, type, reason, requested_at, status,
          staff_member_id,
          staff_member:staff_members(first_name, last_name)
        `)
        .eq('event_id', eventId)
        .order('requested_at', { ascending: false })

      if (!data) return []

      return (data as any[]).map((a) => ({
        id: a.id,
        type: a.type,
        staffName: [a.staff_member?.first_name, a.staff_member?.last_name].filter(Boolean).join(' ') || '-',
        reason: a.reason ?? '',
        requestedAt: a.requested_at,
        status: a.status ?? 'pending',
      }))
    } catch {
      return []
    }
  },

  async resolveApproval(approvalId: string, approved: boolean, supervisorId: string): Promise<void> {
    try {
      await supabase
        .from('supervisor_approvals')
        .update({
          status: approved ? 'approved' : 'rejected',
          resolved_by: supervisorId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', approvalId)
    } catch {
      // Table may not exist
    }
  },

  async getOccurrences(eventId: string): Promise<SupervisorOccurrence[]> {
    try {
      const { data } = await supabase
        .from('staff_occurrences')
        .select(`
          id, type, description, created_at,
          staff_id,
          staff:staff_members(first_name, last_name, area)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (!data) return []

      return (data as any[]).map((o) => ({
        id: o.id,
        staffName: [o.staff?.first_name, o.staff?.last_name].filter(Boolean).join(' ') || '-',
        type: o.type,
        description: o.description,
        zone: o.staff?.area ?? null,
        occurredAt: o.created_at,
        status: o.resolved_at ? 'resolved' : 'open',
      }))
    } catch {
      return []
    }
  },

  async resolveOccurrence(occurrenceId: string): Promise<void> {
    try {
      await supabase
        .from('staff_occurrences')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', occurrenceId)
    } catch {
      // Table may not exist
    }
  },

  async sendInstruction(eventId: string, supervisorId: string, title: string, body: string, priority: string): Promise<void> {
    try {
      await supabase.from('staff_instructions').insert({
        event_id: eventId,
        created_by: supervisorId,
        title,
        body,
        priority,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Table may not exist
    }
  },

  async getHealthScore(eventId: string): Promise<{
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    factors: Array<{ label: string; value: number; weight: number; ok: boolean }>
  }> {
    const [teamData, validResult, invalidResult] = await Promise.all([
      supervisorService.getTeamLive(eventId),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('result', 'success'),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('event_id', eventId).neq('result', 'success'),
    ])

    const checkins = validResult.count ?? 0
    const invalids = invalidResult.count ?? 0

    const activeRate = teamData.total > 0 ? (teamData.active / teamData.total) * 100 : 100
    const delayRate = teamData.total > 0 ? ((teamData.total - teamData.delayed - teamData.absent) / teamData.total) * 100 : 100
    const presentRate = teamData.total > 0 ? ((teamData.active + teamData.delayed) / teamData.total) * 100 : 100
    const total = checkins + invalids
    const securityRate = total > 0 ? (checkins / total) * 100 : 100

    const factors = [
      { label: 'Staff ativo', value: Math.round(activeRate), weight: 40, ok: activeRate >= 80 },
      { label: 'Pontualidade', value: Math.round(delayRate), weight: 25, ok: delayRate >= 85 },
      { label: 'Presença geral', value: Math.round(presentRate), weight: 20, ok: presentRate >= 70 },
      { label: 'Segurança', value: Math.round(securityRate), weight: 15, ok: securityRate >= 90 },
    ]

    const score = Math.round(factors.reduce((sum, f) => sum + (f.value * f.weight) / 100, 0))
    const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
      score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'

    return { score, grade, factors }
  },
}
