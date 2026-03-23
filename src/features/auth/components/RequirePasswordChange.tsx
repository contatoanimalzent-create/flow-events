import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/services'
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage'

interface RequirePasswordChangeProps {
  children: ReactNode
}

export function RequirePasswordChange({ children }: RequirePasswordChangeProps) {
  const profile = useAuthStore((state) => state.profile)

  if (profile?.must_change_password) {
    return <ChangePasswordPage />
  }

  return <>{children}</>
}
