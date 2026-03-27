import { ArrowRight } from 'lucide-react'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumEventCard } from './PremiumEventCard'
import { PublicReveal } from './PublicReveal'

interface RelatedExperiencesGridProps {
  events: PublicEventSummary[]
  title?: string
}

export function RelatedExperiencesGrid({
  events,
  title = 'Experiencias relacionadas',
}: RelatedExperiencesGridProps) {
  const visibleEvents = events.slice(0, 4)

  if (visibleEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Recommended next</div>
              <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3.2rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                {title}
              </h2>
            </div>
            <a
              href="/events"
              className="hidden items-center gap-2 rounded-full border border-[#d9ccb8] bg-white/82 px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all duration-300 hover:-translate-y-0.5 lg:inline-flex"
            >
              Ver agenda completa
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </PublicReveal>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {visibleEvents[0] ? (
            <PremiumEventCard event={visibleEvents[0]} priority className="xl:row-span-2" />
          ) : null}
          {visibleEvents.slice(1).map((event, index) => (
            <PremiumEventCard key={event.id} event={event} index={index + 1} />
          ))}
        </div>

        <div className="mt-6 lg:hidden">
          <a
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-[#d9ccb8] bg-white/82 px-4 py-2 text-sm font-medium text-[#1f1a15]"
          >
            Ver agenda completa
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
