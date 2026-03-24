import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type { StaffEventScope, StaffFormData, StaffGateOption, StaffMemberRow, StaffStatus, StaffSummaryStats, StaffTimeEntryRow } from '@/features/staff/types'
import { assertStaffResult, StaffServiceError } from './staff.errors'
import { buildStaffPayload, mapStaffMemberRow, mapStaffTimeEntryRow } from './staff.payloads'

const staffApi = createApiClient('staff')

export const staffService = {
  async listStaffEvents(organizationId: string): Promise<StaffEventScope[]> {
    return staffApi.request('list_staff_events', async () => {
      const result = await supabase
        .from('events')
        .select('id,name')
        .eq('organization_id', organizationId)
        .order('starts_at', { ascending: false })

      assertStaffResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
      }))
    }, { organizationId })
  },

  async listGateOptions(eventId: string): Promise<StaffGateOption[]> {
    return staffApi.request('list_gate_options', async () => {
      const result = await supabase.from('gates').select('id,name').eq('event_id', eventId).eq('is_active', true).order('name')
      assertStaffResult(result)

      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
      }))
    }, { eventId })
  },

  async listStaffByEvent(eventId: string, statusFilter: 'all' | StaffStatus = 'all'): Promise<StaffMemberRow[]> {
    return staffApi.request('list_staff_by_event', async () => {
      let query = supabase
        .from('staff_members')
        .select('*, gate:gates(name)')
        .eq('event_id', eventId)
        .order('first_name')

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const result = await query
      assertStaffResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapStaffMemberRow)
    }, { eventId, statusFilter })
  },

  async getStaffById(staffId: string): Promise<StaffMemberRow | null> {
    return staffApi.request('get_staff_by_id', async () => {
      const result = await supabase.from('staff_members').select('*, gate:gates(name)').eq('id', staffId).single()

      if (result.error && (result.error as { code?: string }).code === 'PGRST116') {
        return null
      }

      assertStaffResult(result)
      return result.data ? mapStaffMemberRow(result.data as Record<string, unknown>) : null
    }, { staffId })
  },

  async createStaffMember(eventId: string, organizationId: string, form: StaffFormData) {
    return staffApi.request('create_staff_member', async () => {
      if (!form.first_name.trim()) {
        throw new StaffServiceError('Nome e obrigatorio', 'staff_name_required')
      }

      const result = await supabase
        .from('staff_members')
        .insert({
          ...buildStaffPayload(form, eventId, organizationId),
          status: 'invited',
          is_active: true,
        })
        .select('*, gate:gates(name)')
        .single()

      assertStaffResult(result)
      return result.data ? mapStaffMemberRow(result.data as Record<string, unknown>) : null
    }, { organizationId, eventId })
  },

  async updateStaffMember(staffId: string, eventId: string, organizationId: string, form: StaffFormData) {
    return staffApi.request('update_staff_member', async () => {
      if (!form.first_name.trim()) {
        throw new StaffServiceError('Nome e obrigatorio', 'staff_name_required')
      }

      const result = await supabase
        .from('staff_members')
        .update(buildStaffPayload(form, eventId, organizationId))
        .eq('id', staffId)
        .select('*, gate:gates(name)')
        .single()

      assertStaffResult(result)
      return result.data ? mapStaffMemberRow(result.data as Record<string, unknown>) : null
    }, { organizationId, eventId, staffId })
  },

  async deleteStaffMember(staffId: string) {
    return staffApi.request('delete_staff_member', async () => {
      const result = await supabase.from('staff_members').delete().eq('id', staffId)
      assertStaffResult(result)
    }, { staffId })
  },

  async updateStaffStatus(staffId: string, status: StaffStatus) {
    return staffApi.request('update_staff_status', async () => {
      const result = await supabase.from('staff_members').update({ status }).eq('id', staffId).select('*, gate:gates(name)').single()
      assertStaffResult(result)
      return result.data ? mapStaffMemberRow(result.data as Record<string, unknown>) : null
    }, { staffId, status })
  },

  async issueStaffCredential(staffId: string) {
    return staffApi.request('issue_staff_credential', async () => {
      const result = await supabase
        .from('staff_members')
        .update({
          qr_token: `STAFF-${staffId}-${Date.now()}`,
          credential_issued_at: new Date().toISOString(),
        })
        .eq('id', staffId)
        .select('*, gate:gates(name)')
        .single()

      assertStaffResult(result)
      return result.data ? mapStaffMemberRow(result.data as Record<string, unknown>) : null
    }, { staffId })
  },

  async listTimeEntriesByStaff(staffId: string, eventId: string): Promise<StaffTimeEntryRow[]> {
    return staffApi.request('list_time_entries_by_staff', async () => {
      const result = await supabase
        .from('time_entries')
        .select('*, gate:gates(name)')
        .eq('staff_id', staffId)
        .eq('event_id', eventId)
        .order('recorded_at', { ascending: false })
        .limit(10)

      assertStaffResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapStaffTimeEntryRow)
    }, { staffId, eventId })
  },

  async recordStaffPresence(staffId: string, eventId: string, type: 'clock_in' | 'clock_out', gateId?: string | null, deviceId?: string | null) {
    return staffApi.request('record_staff_presence', async () => {
      const recordedAt = new Date().toISOString()
      const insertResult = await supabase
        .from('time_entries')
        .insert({
          staff_id: staffId,
          event_id: eventId,
          gate_id: gateId ?? null,
          type,
          method: 'manual',
          is_valid: true,
          device_id: deviceId ?? null,
          recorded_at: recordedAt,
        })
        .select('*, gate:gates(name)')
        .single()

      assertStaffResult(insertResult)

      const statusUpdate = type === 'clock_in'
        ? { checked_in_at: recordedAt, checked_out_at: null, status: 'active', gate_id: gateId ?? null }
        : { checked_out_at: recordedAt, status: 'confirmed' }

      const updateResult = await supabase.from('staff_members').update(statusUpdate).eq('id', staffId)
      assertStaffResult(updateResult)

      return insertResult.data ? mapStaffTimeEntryRow(insertResult.data as Record<string, unknown>) : null
    }, { staffId, eventId, type, gateId, deviceId })
  },

  async getSummaryByEvent(eventId: string): Promise<StaffSummaryStats> {
    return staffApi.request('get_summary_by_event', async () => {
      const staff = await this.listStaffByEvent(eventId)
      return {
        total: staff.length,
        confirmed: staff.filter((member) => member.status === 'confirmed' || member.status === 'active').length,
        active: staff.filter((member) => member.status === 'active').length,
        allocatedToGates: staff.filter((member) => Boolean(member.gate_id)).length,
        totalDailyCost: staff.reduce((sum, member) => sum + (member.daily_rate ?? 0), 0),
      }
    }, { eventId })
  },
}
