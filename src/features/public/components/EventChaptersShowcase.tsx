import { CalendarDays, MapPin } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { formatPublicDate, usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

interface EventChaptersShowcaseProps {
  events: PublicEventSummary[]
}

function getCover(event: PublicEventSummary) {
  return (
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80&fit=crop'
  )
}

export function EventChaptersShowcase({ events }: EventChaptersShowcaseProps) {
  const { isPortuguese, locale } = usePublicLocale()
  const marqueeEvents = events.slice(0, 3)

  if (marqueeEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-12 md:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[3rem] border border-[#0b1016]/10 bg-[#fffaf3] px-6 py-8 shadow-[0_28px_80px_rgba(11,16,22,0.09)] md:px-10 md:py-10 lg:px-14 lg:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(11,16,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(11,16,22,0.04) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(212,163,109,0.12),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(255,75,54,0.08),transparent_24%)]" />

            <div className="relative z-10 grid gap-10 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
              <div className="max-w-xl">
                <div className="text-[11px] uppercase tracking-[0.36em] text-[#6d727a]">
                  Editorial flow
                </div>
                <h2 className="mt-5 max-w-lg font-display text-[clamp(3.2rem,5vw,6rem)] font-semibold uppercase leading-[0.86] tracking-[-0.06em] text-[#0b1016]">
                  Events arranged like a collector edit.
                </h2>
                <p className="mt-6 max-w-md text-base leading-8 text-[#5b6168]">
                  {isPortuguese
                    ? 'The goal is to stop repeating the same card and start staging each event as a high-value moment with stronger composition.'
                    : 'The goal is to stop repeating the same card and start staging each event as a high-value moment with stronger composition.'}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {marqueeEvents.map((event, index) => (
                  <a
                    key={event.id}
                    href={`/e/${event.slug}`}
                    className={
                      index === 0
                        ? 'group relative overflow-hidden rounded-[2.2rem] border border-[#0b1016]/10 bg-[#0a0f16] shadow-[0_24px_70px_rgba(11,16,22,0.18)] lg:col-span-2'
                        : 'group relative overflow-hidden rounded-[2.2rem] border border-[#0b1016]/10 bg-[#0a0f16] shadow-[0_24px_70px_rgba(11,16,22,0.18)]'
                    }
                  >
                    <div
                      aria-hidden="true"
                      className={
                        index === 0
                          ? 'aspect-[1.55] w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]'
                          : 'aspect-[0.86] w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]'
                      }
                      style={{ backgroundImage: `url("${getCover(event)}")` }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,15,0.08)_0%,rgba(7,10,15,0.18)_38%,rgba(7,10,15,0.9)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/48">
                        {event.city || 'Event'}
                      </div>
                      <div
                        className={
                          index === 0
                            ? 'mt-3 font-display text-[clamp(2.4rem,3vw,3.6rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em] text-white'
                            : 'mt-3 font-display text-[1.7rem] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white'
                        }
                      >
                        {event.name}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/72">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-white/48" />
                          {formatPublicDate(event.starts_at, locale, {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-white/48" />
                          {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
