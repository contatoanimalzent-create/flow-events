import type { ReactNode } from 'react'

interface AppShellV2Props {
  children: ReactNode
}

export function AppShellV2({ children }: AppShellV2Props) {
  return <>{children}</>
}
