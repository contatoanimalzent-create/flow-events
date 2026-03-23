export type StaffStatus = 'invited' | 'confirmed' | 'active' | 'no_show' | 'cancelled'

export type StaffPermission =
  | 'checkin.scan'
  | 'checkin.override'
  | 'gate.manage'
  | 'command.view'
  | 'staff.manage'

export interface StaffEventScope {
  id: string
  name: string
}

export interface StaffGateOption {
  id: string
  name: string
}

export interface StaffMemberRow {
  id: string
  organization_id: string
  event_id?: string | null
  first_name: string
  last_name?: string | null
  email?: string | null
  phone?: string | null
  cpf?: string | null
  role_title?: string | null
  department?: string | null
  area?: string | null
  company?: string | null
  gate_id?: string | null
  permissions: StaffPermission[]
  shift_label?: string | null
  shift_starts_at?: string | null
  shift_ends_at?: string | null
  linked_device_id?: string | null
  daily_rate?: number | null
  credential_issued_at?: string | null
  checked_in_at?: string | null
  checked_out_at?: string | null
  notes?: string | null
  is_active: boolean
  status: StaffStatus
  qr_token?: string | null
  created_at: string
  gate?: {
    name: string
  }
}

export interface StaffTimeEntryRow {
  id: string
  staff_id: string
  event_id?: string | null
  gate_id?: string | null
  type: 'clock_in' | 'clock_out'
  recorded_at: string
  method?: string | null
  is_valid: boolean
  device_id?: string | null
  notes?: string | null
  gate?: {
    name: string
  }
}

export interface StaffSummaryStats {
  total: number
  confirmed: number
  active: number
  allocatedToGates: number
  totalDailyCost: number
}

export interface StaffFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  cpf: string
  role_title: string
  department: string
  area: string
  company: string
  gate_id: string
  shift_label: string
  shift_starts_at: string
  shift_ends_at: string
  linked_device_id: string
  daily_rate: string
  notes: string
  permissions: StaffPermission[]
}

export interface RecordStaffPresenceInput {
  staffId: string
  eventId: string
  gateId?: string | null
  type: 'clock_in' | 'clock_out'
  deviceId?: string | null
  notes?: string | null
}
