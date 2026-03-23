import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { StaffFormData, StaffStatus } from '@/features/staff/types'
import { staffService } from './staff.service'

interface UpsertStaffVariables {
  staffId?: string
  eventId: string
  organizationId: string
  form: StaffFormData
}

interface DeleteStaffVariables {
  staffId: string
}

interface UpdateStaffStatusVariables {
  staffId: string
  status: StaffStatus
}

interface IssueCredentialVariables {
  staffId: string
}

interface RecordPresenceVariables {
  staffId: string
  eventId: string
  type: 'clock_in' | 'clock_out'
  gateId?: string | null
  deviceId?: string | null
}

export const staffKeys = {
  all: ['staff'] as const,
  events: (organizationId: string) => [...staffKeys.all, 'events', organizationId] as const,
  byEvent: (eventId: string, statusFilter: 'all' | StaffStatus = 'all') => [...staffKeys.all, 'list', eventId, statusFilter] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (staffId: string) => [...staffKeys.details(), staffId] as const,
  gateOptions: (eventId: string) => [...staffKeys.all, 'gate-options', eventId] as const,
  timeEntries: (staffId: string, eventId: string) => [...staffKeys.detail(staffId), 'time', eventId] as const,
  summary: (eventId: string) => [...staffKeys.all, 'summary', eventId] as const,
  actions: () => [...staffKeys.all, 'actions'] as const,
}

export const staffQueries = {
  events: (organizationId: string) =>
    queryOptions({
      queryKey: staffKeys.events(organizationId),
      queryFn: () => staffService.listStaffEvents(organizationId),
    }),
  listByEvent: (eventId: string, statusFilter: 'all' | StaffStatus = 'all') =>
    queryOptions({
      queryKey: staffKeys.byEvent(eventId, statusFilter),
      queryFn: () => staffService.listStaffByEvent(eventId, statusFilter),
    }),
  detail: (staffId: string) =>
    queryOptions({
      queryKey: staffKeys.detail(staffId),
      queryFn: () => staffService.getStaffById(staffId),
    }),
  gateOptions: (eventId: string) =>
    queryOptions({
      queryKey: staffKeys.gateOptions(eventId),
      queryFn: () => staffService.listGateOptions(eventId),
    }),
  timeEntries: (staffId: string, eventId: string) =>
    queryOptions({
      queryKey: staffKeys.timeEntries(staffId, eventId),
      queryFn: () => staffService.listTimeEntriesByStaff(staffId, eventId),
    }),
  summary: (eventId: string) =>
    queryOptions({
      queryKey: staffKeys.summary(eventId),
      queryFn: () => staffService.getSummaryByEvent(eventId),
    }),
}

export const staffMutations = {
  create: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'create'] as const,
      mutationFn: ({ eventId, organizationId, form }: UpsertStaffVariables) => staffService.createStaffMember(eventId, organizationId, form),
    }),
  update: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'update'] as const,
      mutationFn: ({ staffId, eventId, organizationId, form }: UpsertStaffVariables) =>
        staffService.updateStaffMember(staffId as string, eventId, organizationId, form),
    }),
  remove: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'remove'] as const,
      mutationFn: ({ staffId }: DeleteStaffVariables) => staffService.deleteStaffMember(staffId),
    }),
  updateStatus: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'update-status'] as const,
      mutationFn: ({ staffId, status }: UpdateStaffStatusVariables) => staffService.updateStaffStatus(staffId, status),
    }),
  issueCredential: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'issue-credential'] as const,
      mutationFn: ({ staffId }: IssueCredentialVariables) => staffService.issueStaffCredential(staffId),
    }),
  recordPresence: () =>
    mutationOptions({
      mutationKey: [...staffKeys.actions(), 'record-presence'] as const,
      mutationFn: ({ staffId, eventId, type, gateId, deviceId }: RecordPresenceVariables) =>
        staffService.recordStaffPresence(staffId, eventId, type, gateId, deviceId),
    }),
}
