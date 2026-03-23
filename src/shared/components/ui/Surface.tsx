import type { ReactNode } from 'react'

interface SurfaceProps {
  children: ReactNode
  className?: string
}

export function Surface({ children, className }: SurfaceProps) {
  return <div className={className}>{children}</div>
}
