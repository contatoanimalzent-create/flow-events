import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface MobileShellProps {
  children: ReactNode
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'sky'
  className?: string
}

const accentVars: Record<NonNullable<MobileShellProps['accent']>, string> = {
  blue:   '#0057E7',
  green:  '#22C55E',
  purple: '#7C3AED',
  orange: '#F97316',
  sky:    '#4285F4',
}

export function MobileShell({ children, accent = 'blue', className }: MobileShellProps) {
  return (
    <div
      className={cn('flex h-screen flex-col overflow-hidden bg-black text-white', className)}
      style={{ '--app-accent': accentVars[accent] } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

interface MobileScreenProps {
  children: ReactNode
  scrollable?: boolean
  className?: string
}

export function MobileScreen({ children, scrollable = true, className }: MobileScreenProps) {
  return (
    <div className={cn('flex-1 overflow-hidden', scrollable && 'overflow-y-auto', className)}>
      {children}
    </div>
  )
}
