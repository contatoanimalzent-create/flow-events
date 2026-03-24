import type { Profile } from '@/lib/supabase'
import type { AccessAction, AccessModule, EnterpriseRole, SectionPermissionMap } from '@/features/access-control/types/access-control.types'

export const SECTION_PERMISSIONS: SectionPermissionMap = {
  dashboard: { module: 'dashboard', action: 'view' },
  events: { module: 'events', action: 'view' },
  tickets: { module: 'tickets', action: 'view' },
  sales: { module: 'sales', action: 'view' },
  crm: { module: 'crm', action: 'view' },
  checkin: { module: 'checkin', action: 'view' },
  staff: { module: 'staff', action: 'view' },
  suppliers: { module: 'staff', action: 'view' },
  products: { module: 'sales', action: 'view' },
  inventory: { module: 'sales', action: 'view' },
  intelligence: { module: 'intelligence', action: 'view' },
  communication: { module: 'campaigns', action: 'view' },
  financial: { module: 'financial', action: 'view' },
  growth: { module: 'dashboard', action: 'view' },
  help: { module: 'dashboard', action: 'view' },
  settings: { module: 'settings', action: 'view' },
}

const ROLE_MATRIX: Record<EnterpriseRole, Record<AccessModule, AccessAction[]>> = {
  owner: {
    dashboard: ['view', 'manage'],
    events: ['view', 'manage'],
    tickets: ['view', 'manage'],
    sales: ['view', 'manage'],
    crm: ['view', 'manage'],
    checkin: ['view', 'manage'],
    staff: ['view', 'manage'],
    financial: ['view', 'manage'],
    campaigns: ['view', 'manage'],
    intelligence: ['view', 'manage'],
    settings: ['view', 'manage'],
  },
  admin: {
    dashboard: ['view', 'manage'],
    events: ['view', 'manage'],
    tickets: ['view', 'manage'],
    sales: ['view', 'manage'],
    crm: ['view', 'manage'],
    checkin: ['view', 'manage'],
    staff: ['view', 'manage'],
    financial: ['view', 'manage'],
    campaigns: ['view', 'manage'],
    intelligence: ['view', 'manage'],
    settings: ['view', 'manage'],
  },
  manager: {
    dashboard: ['view'],
    events: ['view', 'manage'],
    tickets: ['view', 'manage'],
    sales: ['view', 'manage'],
    crm: ['view', 'manage'],
    checkin: ['view'],
    staff: ['view', 'manage'],
    financial: ['view'],
    campaigns: ['view', 'manage'],
    intelligence: ['view'],
    settings: ['view'],
  },
  operator: {
    dashboard: ['view'],
    events: ['view'],
    tickets: ['view'],
    sales: ['view'],
    crm: ['view'],
    checkin: ['view', 'manage'],
    staff: ['view'],
    financial: ['view'],
    campaigns: ['view'],
    intelligence: ['view'],
    settings: ['view'],
  },
  viewer: {
    dashboard: ['view'],
    events: ['view'],
    tickets: ['view'],
    sales: ['view'],
    crm: ['view'],
    checkin: ['view'],
    staff: ['view'],
    financial: ['view'],
    campaigns: ['view'],
    intelligence: ['view'],
    settings: ['view'],
  },
}

export function mapProfileToEnterpriseRole(profileRole?: Profile['role'] | null): EnterpriseRole {
  switch (profileRole) {
    case 'super_admin':
      return 'owner'
    case 'org_admin':
      return 'admin'
    case 'org_manager':
      return 'manager'
    case 'checkin_operator':
    case 'pdv_operator':
    case 'staff_member':
      return 'operator'
    case 'supplier':
    case 'attendee':
    default:
      return 'viewer'
  }
}

export function hasPermission(role: EnterpriseRole, module: AccessModule, action: AccessAction) {
  return ROLE_MATRIX[role][module].includes(action)
}
