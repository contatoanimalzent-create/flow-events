import type { ReactNode } from 'react'
import { EventsPublicHeader } from './EventsPublicHeader'

interface PublicHeaderProps {
  onLogin?: () => void
  actionSlot?: ReactNode
  compact?: boolean
  className?: string
}

export function PublicHeader({ onLogin, actionSlot, compact = false, className }: PublicHeaderProps) {
  return (
    <EventsPublicHeader
      onLogin={onLogin}
      actionSlot={actionSlot}
      compact={compact}
      className={className}
    />
  )
}
