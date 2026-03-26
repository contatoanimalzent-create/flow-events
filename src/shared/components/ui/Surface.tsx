import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface SurfaceProps {
  children: ReactNode
  className?: string
}

export function Surface({ children, className }: SurfaceProps) {
  return <div className={cn('surface-panel', className)}>{children}</div>
}
