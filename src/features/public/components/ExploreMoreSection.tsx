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
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="grid gap-6 rounded-[2.6rem] border border-[#0b1016]/10 bg-[#fffaf3] p-8 shadow-[0_18px_55px_rgba(11,16,22,0.08)] lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#6d727a]">
                {isPortuguese ? 'Explore mais' : 'Explore more'}
              </div>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,4vw,4rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-[#0b1016]">
                {isPortuguese
                  ? 'Continue explorando experiencias relacionadas.'
                  : 'Keep exploring related experiences.'}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5b6168]">
                {isPortuguese
                  ? 'Uma segunda camada de descoberta para comparar venues, atmosfera, ticketing e proximas datas sem sair do fluxo.'
                  : 'A second discovery layer to compare venues, atmosphere, ticketing and upcoming dates without leaving the flow.'}
              </p>
            </div>
            <a
              href="/events"
              className="inline-flex items-center justify-center rounded-full bg-[#0b1016] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5"
            >
              {isPortuguese ? 'Ver mais eventos' : 'View more events'}
            </a>
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
