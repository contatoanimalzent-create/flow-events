import type { PublicEventSummary } from '@/features/public/types/public.types'
import { EventScheduleCard } from './EventScheduleCard'
import { PublicReveal } from './PublicReveal'

interface EventsScheduleListProps {
  events: PublicEventSummary[]
  title?: string
  subtitle?: string
}

export function EventsScheduleList({ events, title, subtitle }: EventsScheduleListProps) {
  if (events.length === 0) {
    return null
  }

  const sortedEvents = [...events].sort(
    (left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime(),
  )

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        {title || subtitle ? (
          <PublicReveal>
            <div className="mb-10 max-w-3xl">
              {title ? (
                <h2 className="font-display text-[clamp(2.4rem,4vw,3.8rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="mt-4 text-base leading-8 text-[#5f5549] md:text-lg">{subtitle}</p> : null}
            </div>
          </PublicReveal>
        ) : null}

        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <PublicReveal key={event.id} delayMs={index * 50}>
              <EventScheduleCard event={event} index={index} />
            </PublicReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
