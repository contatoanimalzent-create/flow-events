import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { EmptyState } from '@/shared/components'
import { formatCurrency } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumSection } from './PremiumSection'
import { PublicReveal } from './PublicReveal'

interface FeaturedEventsSectionProps {
  events: PublicEventSummary[]
}

function getFallbackImage(event?: PublicEventSummary | null) {
  return (
    getEventAssetUrl(event?.mediaPresentation.coverAsset) ||
    event?.cover_url ||
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1800&q=80&fit=crop'
  )
}

function EventMetaLine({ event }: { event: PublicEventSummary }) {
  return (
    <div className="mt-4 grid gap-3 text-sm text-white/76">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-white/68" />
        <span>
          {new Date(event.starts_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-white/68" />
        <span>{[event.venue_name, event.city].filter(Boolean).join(' / ')}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-white/68" />
        <span>{event.sold_tickets.toLocaleString('pt-BR')} vendidos</span>
      </div>
    </div>
  )
}

function FeaturedEventTile({
  event,
  large = false,
  index = 0,
}: {
  event: PublicEventSummary
  large?: boolean
  index?: number
}) {
  return (
    <PublicReveal delayMs={index * 90}>
      <a
        href={`/e/${event.slug}`}
        className="group relative block h-full overflow-hidden rounded-[2.25rem] border border-white/70 bg-[#1e1813] shadow-[0_24px_90px_rgba(46,34,17,0.12)]"
      >
        <div className={large ? 'min-h-[34rem] md:min-h-[42rem]' : 'min-h-[22rem] md:min-h-[20rem]'}>
          <img
            src={getFallbackImage(event)}
            alt={event.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,16,10,0.12)_0%,rgba(23,16,10,0.2)_34%,rgba(23,16,10,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,226,200,0.22),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-8">
            <div className="inline-flex w-fit rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/80 backdrop-blur-md">
              {event.category || 'Experiencia premium'}
            </div>
            <div className={large ? 'mt-5 max-w-xl font-display text-[3.4rem] font-semibold leading-[0.88] tracking-[-0.04em]' : 'mt-5 max-w-md font-display text-[2.4rem] font-semibold leading-[0.9] tracking-[-0.04em]'}>
              {event.name}
            </div>
            {event.subtitle ? (
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/76">{event.subtitle}</p>
            ) : null}
            <EventMetaLine event={event} />
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/12 pt-5">
              <div className="text-sm font-medium text-white/82">
                {event.minPrice === null
                  ? 'Sob consulta'
                  : event.minPrice === 0
                    ? 'Inscricao gratuita'
                    : `a partir de ${formatCurrency(event.minPrice)}`}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                Ver experiencia
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}

export function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
  const primaryEvent = events[0]
  const secondaryEvents = events.slice(1, 3)

  return (
    <PremiumSection
      eyebrow="Experiencias em destaque"
      title="Um calendario apresentado como curadoria de alto impacto."
      description="Os destaques saem do grid comum e entram em uma composicao mais proxima de editorial de luxo: imagem dominante, narrativa visual e leitura imediata."
    >
      {events.length === 0 ? (
        <EmptyState
          title="Nenhuma experiencia publicada no momento"
          description="Assim que novos eventos entrarem em curadoria, esta vitrine publica sera atualizada automaticamente."
          className="min-h-[20rem]"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          {primaryEvent ? <FeaturedEventTile event={primaryEvent} large index={0} /> : null}
          <div className="grid gap-6">
            {secondaryEvents.map((event, index) => (
              <FeaturedEventTile key={event.id} event={event} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </PremiumSection>
  )
}
