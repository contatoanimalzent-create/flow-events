import { ArrowRight } from 'lucide-react'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumEventCard } from './PremiumEventCard'
import { PublicReveal } from './PublicReveal'
import { usePublicLocale } from '../lib/public-locale'

interface RelatedExperiencesGridProps {
  events: PublicEventSummary[]
  title?: string
}

export function RelatedExperiencesGrid({
  events,
  title,
}: RelatedExperiencesGridProps) {
  const { isPortuguese } = usePublicLocale()
  const resolvedTitle = title || (isPortuguese ? 'Experiências relacionadas' : 'Related experiences')
  const visibleEvents = events.slice(0, 4)

  if (visibleEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-12 md:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="flex items-end justify-between gap-6 border-b border-white/8 pb-8 pt-2">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.34em] text-white/40">
                {isPortuguese ? 'Selecao recomendada' : 'Recommended next'}
              </div>
              <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3.15rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
                {resolvedTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                {isPortuguese
                  ? 'Uma camada secundaria para continuar descobrindo eventos com o mesmo ritmo visual da home.'
                  : 'A second discovery layer to keep exploring events with the same cinematic rhythm as the home page.'}
              </p>
            </div>
            <a
              href="/events"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 lg:inline-flex"
            >
              {isPortuguese ? 'Ver agenda completa' : 'View full calendar'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </PublicReveal>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.95fr]">
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white"
          >
            {isPortuguese ? 'Ver agenda completa' : 'View full calendar'}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
