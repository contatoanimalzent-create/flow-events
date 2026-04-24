import type { StaffFormData, StaffPermission, StaffStatus } from './staff.types'

export const STAFF_STATUS_CONFIG: Record<StaffStatus, { label: string; color: string }> = {
  invited: { label: 'Convidado', color: 'text-status-warning' },
  confirmed: { label: 'Confirmado', color: 'text-status-success' },
  active: { label: 'Em campo', color: 'text-brand-acid' },
  no_show: { label: 'Faltou', color: 'text-status-error' },
  cancelled: { label: 'Cancelado', color: 'text-text-muted' },
}

export const STAFF_PERMISSION_OPTIONS: Array<{ value: StaffPermission; label: string }> = [
  { value: 'checkin.scan', label: 'Scanner de check-in' },
  { value: 'checkin.override', label: 'Override de exceções' },
  { value: 'gate.manage', label: 'Operação de portaria' },
  { value: 'command.view', label: 'Visão do command center' },
  { value: 'staff.manage', label: 'Gestão de equipe' },
]

export const EMPTY_STAFF_FORM: StaffFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  cpf: '',
  role_title: '',
  department: '',
  area: '',
  company: '',
  gate_id: '',
  shift_label: '',
  shift_starts_at: '',
  shift_ends_at: '',
  linked_device_id: '',
  daily_rate: '',
  notes: '',
  permissions: ['checkin.scan'],
}
