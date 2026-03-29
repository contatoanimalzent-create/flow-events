import { ArrowRight } from 'lucide-react'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumEventCard } from './PremiumEventCard'
import { PublicReveal } from './PublicReveal'
import { usePublicLocale } from '../lib/public-locale'

interface ExploreMoreSectionProps {
  currentEventId: string
  events: PublicEventSummary[]
}

export function ExploreMoreSection({ currentEventId, events }: ExploreMoreSectionProps) {
  const { isPortuguese } = usePublicLocale()
  const relatedEvents = events.filter((event) => event.id !== currentEventId).slice(0, 3)

  if (relatedEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-16 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <PublicReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#ae936f]/70">
                {isPortuguese ? 'Continue explorando' : 'Keep exploring'}
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold uppercase leading-[0.92] tracking-tight text-white">
                {isPortuguese ? 'Mais experiencias para voce' : 'More experiences for you'}
              </h2>
            </div>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-[#d62a0b] hover:text-[#ebe7e0]"
            >
              {isPortuguese ? 'Ver todos' : 'View all'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </PublicReveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedEvents.map((event, index) => (
            <PremiumEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
