import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumEventCard } from './PremiumEventCard'
import { PublicReveal } from './PublicReveal'

interface ExploreMoreSectionProps {
  currentEventId: string
  events: PublicEventSummary[]
}

export function ExploreMoreSection({ currentEventId, events }: ExploreMoreSectionProps) {
  const relatedEvents = events.filter((event) => event.id !== currentEventId).slice(0, 3)

  if (relatedEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Explore more</div>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,4vw,3.8rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
              Outras experiencias para continuar a jornada.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f5549]">
              Blocos complementares para manter descoberta, comparacao e conversao no mesmo fluxo.
            </p>
          </div>
        </PublicReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relatedEvents.map((event, index) => (
            <PremiumEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
