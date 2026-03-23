import type { AppChildren } from '@/core/types'
import { useAuthBootstrap } from '@/features/auth/hooks'

export function AuthProvider({ children }: AppChildren) {
  useAuthBootstrap()
  return <>{children}</>
}
