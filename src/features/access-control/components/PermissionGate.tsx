import type { ReactNode } from 'react'
import { useAccessControl } from '@/features/access-control/hooks/useAccessControl'
import type { AccessAction, AccessModule } from '@/features/access-control/types/access-control.types'

interface PermissionGateProps {
  module: AccessModule
  action?: AccessAction
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGate({ module, action = 'view', fallback = null, children }: PermissionGateProps) {
  const access = useAccessControl()
  return access.can(module, action) ? <>{children}</> : <>{fallback}</>
}
