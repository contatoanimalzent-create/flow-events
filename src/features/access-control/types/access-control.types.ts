import type { NavSection } from '@/app/layout'

export type EnterpriseRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'

export type AccessModule = 'dashboard' | 'events' | 'tickets' | 'sales' | 'crm' | 'checkin' | 'staff' | 'financial' | 'campaigns' | 'intelligence' | 'settings'

export type AccessAction = 'view' | 'manage'

export interface PermissionDescriptor {
  module: AccessModule
  action: AccessAction
}

export type SectionPermissionMap = Record<NavSection, PermissionDescriptor>
