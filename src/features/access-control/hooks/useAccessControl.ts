import { useMemo } from 'react'
import type { NavSection } from '@/app/layout'
import { useAuthStore } from '@/features/auth'
import { hasPermission, mapProfileToEnterpriseRole, SECTION_PERMISSIONS } from '@/features/access-control/services/access-control.policy'
import type { AccessAction, AccessModule } from '@/features/access-control/types/access-control.types'

export function useAccessControl() {
  const profile = useAuthStore((state) => state.profile)
  const organization = useAuthStore((state) => state.organization)

  const role = useMemo(() => mapProfileToEnterpriseRole(profile?.role), [profile?.role])

  function can(module: AccessModule, action: AccessAction = 'view') {
    return Boolean(organization?.id) && hasPermission(role, module, action)
  }

  function canAccessSection(section: NavSection) {
    const permission = SECTION_PERMISSIONS[section]
    return can(permission.module, permission.action)
  }

  return {
    role,
    organizationId: organization?.id ?? null,
    can,
    canAccessSection,
  }
}
