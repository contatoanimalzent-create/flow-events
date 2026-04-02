import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { EmptyState } from '@/shared/components'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import {
  formatPublicCurrency,
  formatPublicDate,
  formatPublicNumber,
  usePublicLocale,
} from '../lib/public-locale'
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

function FeaturedEventTile({
  event,
  large = false,
  index = 0,
  locale,
  isPortuguese,
}: {
  event: PublicEventSummary
  large?: boolean
  index?: number
  locale: 'en-US' | 'pt-BR'
  isPortuguese: boolean
}) {
  return (
    <PublicReveal delayMs={index * 80}>
      <a
        href={`/e/${event.slug}`}
        className="group relative block h-full overflow-hidden rounded-3xl shadow-card transition-all duration-500 hover:shadow-card-hover"
      >
        <div className={large ? 'min-h-[32rem] md:min-h-[38rem]' : 'min-h-[20rem]'}>
          <img
            src={getFallbackImage(event)}
            alt={event.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {/* Photo overlay — dark bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {event.category || (isPortuguese ? 'Evento' : 'Event')}
            </div>
            <div
              className={
                large
                  ? 'mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[0.92] tracking-tight'
                  : 'mt-4 max-w-md font-display text-[1.6rem] font-bold leading-[0.95] tracking-tight'
              }
            >
              {event.name}
            </div>
            {event.subtitle && large ? (
              <p className="mt-3 max-w-lg text-sm text-white/60">{event.subtitle}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatPublicDate(event.starts_at, locale, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {[event.venue_name, event.city].filter(Boolean).join(' · ')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {formatPublicNumber(event.sold_tickets, locale)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/15 pt-4">
              <div className="text-sm font-semibold text-white">
                {event.minPrice === null
                  ? isPortuguese
                    ? 'Sob consulta'
                    : 'On request'
                  : event.minPrice === 0
                    ? isPortuguese
                      ? 'Acesso livre'
                      : 'Free access'
                    : `${isPortuguese ? 'A partir de' : 'From'} ${formatPublicCurrency(event.minPrice, locale)}`}
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-acid px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white opacity-0 transition-all group-hover:opacity-100">
                {isPortuguese ? 'Ver evento' : 'View event'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}

export function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
  const { isPortuguese, locale } = usePublicLocale()
  const primaryEvent = events[0]
  const secondaryEvents = events.slice(1, 4)

  if (events.length === 0) {
    return (
      <section className="bg-bg-secondary px-5 py-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-3xl border border-bg-border bg-white p-12 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10">
              <CalendarDays className="h-7 w-7 text-brand-navy/60" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-text-primary">
              {isPortuguese ? 'Nenhum evento publicado ainda' : 'No published events yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {isPortuguese
                ? 'Quando novos eventos entrarem na plataforma, eles aparecerao aqui automaticamente.'
                : 'As new events enter the platform, they will appear here automatically.'}
            </p>
            <a
              href="/create-event"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue"
            >
              {isPortuguese ? 'Criar evento' : 'Create event'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-bg-secondary px-5 py-20 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <PublicReveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-brand-navy/50">
                {isPortuguese ? 'Selecao' : 'Selection'}
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold uppercase leading-[0.92] tracking-tight text-text-primary">
                {isPortuguese ? 'Em destaque agora' : 'Featured right now'}
              </h2>
            </div>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-bg-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary shadow-card transition-all hover:border-brand-navy/20 hover:text-text-primary hover:shadow-card-hover"
            >
              {isPortuguese ? 'Ver todos' : 'View all'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </PublicReveal>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          {primaryEvent ? (
            <FeaturedEventTile
              event={primaryEvent}
              large
              index={0}
              locale={locale}
              isPortuguese={isPortuguese}
            />
          ) : null}
          <div className="grid gap-4">
            {secondaryEvents.map((event, index) => (
              <FeaturedEventTile
                key={event.id}
                event={event}
                index={index + 1}
                locale={locale}
                isPortuguese={isPortuguese}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
