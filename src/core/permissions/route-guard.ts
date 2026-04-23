import type { AppMode } from '../context/app-context.types'
import type { ActiveContext } from '../context/app-context.types'

// Map route prefixes to their required mode
export const ROUTE_MODE_MAP: Record<string, AppMode> = {
  '/pulse/operator': 'operator',
  '/pulse/staff': 'staff',
  '/pulse/supervisor': 'supervisor',
  '/pulse/attendee': 'attendee',
  '/pulse/promoter': 'promoter',
}

// Given a path, return the required mode (null if no restriction)
export function getRequiredModeForPath(path: string): AppMode | null {
  for (const [prefix, mode] of Object.entries(ROUTE_MODE_MAP)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return mode
    }
  }
  return null
}

// Check if access is allowed
export interface GuardResult {
  allowed: boolean
  reason: 'no-auth' | 'no-context' | 'wrong-mode' | 'no-permission' | 'ok'
  redirectTo?: string
}

export function checkRouteAccess(
  path: string,
  context: ActiveContext | null,
  availableModes: AppMode[],
  isContextReady: boolean
): GuardResult {
  // Onboarding paths are always allowed
  if (path.startsWith('/pulse/select-')) {
    return { allowed: true, reason: 'ok' }
  }

  // Shared paths (notifications, profile) are always allowed if context exists
  if (path.startsWith('/pulse/notifications') || path.startsWith('/pulse/profile')) {
    if (!isContextReady || !context) {
      return { allowed: false, reason: 'no-context', redirectTo: '/pulse/select-organization' }
    }
    return { allowed: true, reason: 'ok' }
  }

  // No context → redirect to onboarding
  if (!isContextReady || !context) {
    return { allowed: false, reason: 'no-context', redirectTo: '/pulse/select-organization' }
  }

  const requiredMode = getRequiredModeForPath(path)

  // No mode restriction on path
  if (!requiredMode) {
    return { allowed: true, reason: 'ok' }
  }

  // User doesn't have access to this mode at all
  if (!availableModes.includes(requiredMode)) {
    // Redirect to their actual home
    const homeMode = context.mode || availableModes[0]
    const homeRoute = homeMode ? `/pulse/${homeMode}` : '/pulse/select-mode'
    return { allowed: false, reason: 'no-permission', redirectTo: homeRoute }
  }

  // User has this mode but it's not their current active mode
  // This is OK - they can switch modes via URL (e.g., supervisor also has operator)
  return { allowed: true, reason: 'ok' }
}
