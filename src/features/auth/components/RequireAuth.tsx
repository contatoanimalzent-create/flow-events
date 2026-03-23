import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/services'

interface RequireAuthProps {
  children: ReactNode
  fallback: ReactNode
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
