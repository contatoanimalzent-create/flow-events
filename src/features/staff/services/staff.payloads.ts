import type { StaffFormData, StaffMemberRow, StaffPermission, StaffTimeEntryRow } from '@/features/staff/types'

function parsePermissions(value: unknown): StaffPermission[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is StaffPermission => typeof item === 'string') as StaffPermission[]
  }

  return ['checkin.scan']
}

export function mapStaffMemberRow(row: Record<string, unknown>): StaffMemberRow {
  const gate = row.gate as { name?: string } | null | undefined

  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    first_name: String(row.first_name ?? ''),
    last_name: (row.last_name as string | null | undefined) ?? null,
    email: (row.email as string | null | undefined) ?? null,
    phone: (row.phone as string | null | undefined) ?? null,
    cpf: (row.cpf as string | null | undefined) ?? null,
    role_title: (row.role_title as string | null | undefined) ?? null,
    department: (row.department as string | null | undefined) ?? null,
    area: (row.area as string | null | undefined) ?? null,
    company: (row.company as string | null | undefined) ?? null,
    gate_id: (row.gate_id as string | null | undefined) ?? null,
    permissions: parsePermissions(row.permissions),
    shift_label: (row.shift_label as string | null | undefined) ?? null,
    shift_starts_at: (row.shift_starts_at as string | null | undefined) ?? null,
    shift_ends_at: (row.shift_ends_at as string | null | undefined) ?? null,
    linked_device_id: (row.linked_device_id as string | null | undefined) ?? null,
    daily_rate: row.daily_rate == null ? null : Number(row.daily_rate),
    credential_issued_at: (row.credential_issued_at as string | null | undefined) ?? null,
    checked_in_at: (row.checked_in_at as string | null | undefined) ?? null,
    checked_out_at: (row.checked_out_at as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    is_active: Boolean(row.is_active ?? true),
    status: (row.status as StaffMemberRow['status']) ?? 'invited',
    qr_token: (row.qr_token as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    gate: gate?.name ? { name: gate.name } : undefined,
  }
}

export function mapStaffTimeEntryRow(row: Record<string, unknown>): StaffTimeEntryRow {
  const gate = row.gate as { name?: string } | null | undefined

  return {
    id: String(row.id),
    staff_id: String(row.staff_id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    gate_id: (row.gate_id as string | null | undefined) ?? null,
    type: ((row.type as StaffTimeEntryRow['type'] | undefined) ?? 'clock_in'),
    recorded_at: String(row.recorded_at ?? new Date().toISOString()),
    method: (row.method as string | null | undefined) ?? null,
    is_valid: Boolean(row.is_valid ?? true),
    device_id: (row.device_id as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    gate: gate?.name ? { name: gate.name } : undefined,
  }
}

export function buildStaffPayload(form: StaffFormData, eventId: string, organizationId: string) {
  return {
    organization_id: organizationId,
    event_id: eventId,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    cpf: form.cpf.trim() || null,
    role_title: form.role_title.trim() || null,
    department: form.department.trim() || null,
    area: form.area.trim() || null,
    company: form.company.trim() || null,
    gate_id: form.gate_id || null,
    shift_label: form.shift_label.trim() || null,
    shift_starts_at: form.shift_starts_at || null,
    shift_ends_at: form.shift_ends_at || null,
    linked_device_id: form.linked_device_id.trim() || null,
    daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
    notes: form.notes.trim() || null,
    permissions: form.permissions,
  }
}

export function mapStaffToForm(row: StaffMemberRow): StaffFormData {
  return {
    first_name: row.first_name ?? '',
    last_name: row.last_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    cpf: row.cpf ?? '',
    role_title: row.role_title ?? '',
    department: row.department ?? '',
    area: row.area ?? '',
    company: row.company ?? '',
    gate_id: row.gate_id ?? '',
    shift_label: row.shift_label ?? '',
    shift_starts_at: row.shift_starts_at ? row.shift_starts_at.slice(0, 16) : '',
    shift_ends_at: row.shift_ends_at ? row.shift_ends_at.slice(0, 16) : '',
    linked_device_id: row.linked_device_id ?? '',
    daily_rate: row.daily_rate != null ? String(row.daily_rate) : '',
    notes: row.notes ?? '',
    permissions: row.permissions ?? ['checkin.scan'],
  }
}
