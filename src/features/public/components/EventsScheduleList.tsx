import type { PublicEventSummary } from '@/features/public/types/public.types'
import { EventScheduleCard } from './EventScheduleCard'
import { PublicReveal } from './PublicReveal'
import { usePublicLocale } from '../lib/public-locale'

interface EventsScheduleListProps {
  events: PublicEventSummary[]
  title?: string
  subtitle?: string
}

export function EventsScheduleList({ events, title, subtitle }: EventsScheduleListProps) {
  const { isPortuguese } = usePublicLocale()
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
            <div className="mb-10 flex flex-col gap-4 border-b border-white/8 pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {title ? (
                  <h2 className="font-display text-[clamp(2.8rem,4vw,4.2rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
                    {title}
                  </h2>
                ) : null}
                {subtitle ? <p className="mt-4 text-base leading-8 text-white/68 md:text-lg">{subtitle}</p> : null}
              </div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">
                {sortedEvents.length} {isPortuguese ? 'experiencias disponiveis' : 'experiences available'}
              </div>
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
