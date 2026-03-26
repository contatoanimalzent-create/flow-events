import type { AccountEventRecord } from '@/features/account/types'
import { EmptyState, SectionHeader } from '@/shared/components'
import { UserEventCard } from './UserEventCard'

interface UserEventsSectionProps {
  title: string
  description: string
  events: AccountEventRecord[]
  activeEventId?: string | null
  onSelect: (eventId: string) => void
  emptyTitle: string
  emptyDescription: string
}

export function UserEventsSection({
  title,
  description,
  events,
  activeEventId,
  onSelect,
  emptyTitle,
  emptyDescription,
}: UserEventsSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader title={title} description={description} />

      {events.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <UserEventCard
              key={event.id}
              event={event}
              active={activeEventId === event.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  )
}
