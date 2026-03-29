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

function EventMetaLine({
  event,
  locale,
  isPortuguese,
}: {
  event: PublicEventSummary
  locale: 'en-US' | 'pt-BR'
  isPortuguese: boolean
}) {
  return (
    <div className="mt-4 grid gap-3 text-sm text-white/76">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-white/68" />
        <span>
          {formatPublicDate(event.starts_at, locale, {
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
        <span>
          {formatPublicNumber(event.sold_tickets, locale)} {isPortuguese ? 'sold' : 'sold'}
        </span>
      </div>
    </div>
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
    <PublicReveal delayMs={index * 90}>
      <a
        href={`/e/${event.slug}`}
        className="group relative block h-full overflow-hidden rounded-[2.25rem] border border-[#0b1016]/10 bg-[#05080d] shadow-[0_24px_90px_rgba(11,16,22,0.18)]"
      >
        <div className={large ? 'min-h-[35rem] md:min-h-[42rem]' : 'min-h-[22rem] md:min-h-[20rem]'}>
          <img
            src={getFallbackImage(event)}
            alt={event.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.12)_0%,rgba(5,8,13,0.2)_34%,rgba(5,8,13,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%)]" />

          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-8">
            <div className="inline-flex w-fit rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/80 backdrop-blur-md">
              {event.category || (isPortuguese ? 'Experience' : 'Experience')}
            </div>
            <div
              className={
                large
                  ? 'mt-5 max-w-xl font-display text-[3.8rem] font-semibold leading-[0.86] tracking-[-0.05em]'
                  : 'mt-5 max-w-md font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.04em]'
              }
            >
              {event.name}
            </div>
            {event.subtitle ? <p className="mt-4 max-w-lg text-sm leading-7 text-white/74">{event.subtitle}</p> : null}

            <EventMetaLine event={event} locale={locale} isPortuguese={isPortuguese} />

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/12 pt-5">
              <div className="text-sm font-medium text-white/82">
                {event.minPrice === null
                  ? 'On request'
                  : event.minPrice === 0
                    ? 'Free access'
                    : `From ${formatPublicCurrency(event.minPrice, locale)}`}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-white">
                Open chapter
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
  const { isPortuguese, locale } = usePublicLocale()
  const primaryEvent = events[0]
  const secondaryEvents = events.slice(1, 4)

  if (events.length === 0) {
    return (
      <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-[1920px]">
          <EmptyState
            title="No published experiences right now"
            description="As soon as new events enter curation, this public showcase updates automatically."
            className="min-h-[20rem]"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="mb-8 grid gap-6 rounded-[2.5rem] border border-[#0b1016]/10 bg-[#fffaf3] p-8 shadow-[0_22px_70px_rgba(11,16,22,0.08)] lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.36em] text-[#6d727a]">
                Selected now
              </div>
              <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] text-[#0b1016]">
                A sharper showcase for what deserves attention right now.
              </h2>
            </div>
            <div className="max-w-2xl text-base leading-8 text-[#5b6168]">
              Instead of repeating the same module, the public layer now uses one master spotlight and a tighter sequence of supporting experiences.
            </div>
          </div>
        </PublicReveal>

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          {primaryEvent ? (
            <FeaturedEventTile
              event={primaryEvent}
              large
              index={0}
              locale={locale}
              isPortuguese={isPortuguese}
            />
          ) : null}

          <div className="grid gap-6">
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
