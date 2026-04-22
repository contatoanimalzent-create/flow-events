import type { AppMode } from '../context/app-context.types'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'manage'

export type PermissionModule =
  | 'checkin'
  | 'manual-check'
  | 'checkin-history'
  | 'flow'
  | 'operator-alerts'
  | 'shift'
  | 'presence'
  | 'location'
  | 'instructions'
  | 'occurrences'
  | 'team-live'
  | 'team-map'
  | 'delays'
  | 'absences'
  | 'approvals'
  | 'tickets'
  | 'agenda'
  | 'event-map'
  | 'feed'
  | 'networking'
  | 'upgrades'
  | 'sales'
  | 'commission'
  | 'ranking'
  | 'goals'
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'help'

export interface EffectivePermission {
  module: PermissionModule
  actions: PermissionAction[]
}

export interface PermissionsState {
  permissions: EffectivePermission[]
  availableModes: AppMode[]
  isLoading: boolean
  load(userId: string, orgId: string, eventId: string): Promise<void>
  hasPermission(module: PermissionModule, action?: PermissionAction): boolean
  canAccessMode(mode: AppMode): boolean
  clear(): void
}
