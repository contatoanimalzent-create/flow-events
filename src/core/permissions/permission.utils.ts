import type { AppMode } from '../context/app-context.types'
import type { EffectivePermission, PermissionAction, PermissionModule } from './permissions.types'

export function hasPermission(
  permissions: EffectivePermission[],
  module: PermissionModule,
  action: PermissionAction = 'view'
): boolean {
  return permissions.some((p) => p.module === module && p.actions.includes(action))
}

export function hasAnyPermission(
  permissions: EffectivePermission[],
  modules: PermissionModule[]
): boolean {
  return modules.some((m) => permissions.some((p) => p.module === m))
}

export function canAccessRoute(availableModes: AppMode[], path: string): boolean {
  const modeFromPath = resolveModeFromPath(path)
  if (!modeFromPath) return true // non-mode route (profile, settings) always ok
  return availableModes.includes(modeFromPath)
}

export function resolveModeFromPath(path: string): AppMode | null {
  if (path.includes('/operator')) return 'operator'
  if (path.includes('/staff')) return 'staff'
  if (path.includes('/supervisor')) return 'supervisor'
  if (path.includes('/attendee')) return 'attendee'
  if (path.includes('/promoter')) return 'promoter'
  return null
}
