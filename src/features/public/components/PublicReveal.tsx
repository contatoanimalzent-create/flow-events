import type { ReactNode } from 'react'
import { MotionReveal } from '@/shared/motion'
import { cn } from '@/shared/lib'

interface PublicRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

export function PublicReveal({ children, className, delayMs = 0 }: PublicRevealProps) {
  return (
    <MotionReveal className={cn(className)} delayMs={delayMs} distance={22}>
      {children}
    </MotionReveal>
  )
}
