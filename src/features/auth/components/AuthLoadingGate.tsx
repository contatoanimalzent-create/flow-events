import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/services'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

interface AuthLoadingGateProps {
  children: ReactNode
}

export function AuthLoadingGate({ children }: AuthLoadingGateProps) {
  const initialized = useAuthStore((state) => state.initialized)

  if (!initialized) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
