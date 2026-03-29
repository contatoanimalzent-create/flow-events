import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
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
    <section className="px-5 py-16 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <PublicReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#d4ff00]/60">
                {isPortuguese ? 'Proximos eventos' : 'Upcoming events'}
              </div>
              <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.2rem)] font-bold uppercase leading-[0.92] tracking-tight text-white">
                {isPortuguese
                  ? 'Eventos selecionados para voce'
                  : 'Curated events for you'}
              </h2>
            </div>
            <a href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-all hover:text-[#d4ff00]">
              {isPortuguese ? 'Ver agenda completa' : 'Full calendar'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </PublicReveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {marqueeEvents.map((event, index) => (
            <PublicReveal key={event.id} delayMs={index * 100}>
              <a
                href={`/e/${event.slug}`}
                className={`group relative block overflow-hidden rounded-2xl border border-white/8 bg-[#0c0c10] transition-all duration-500 hover:border-[#d4ff00]/20 ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div
                  className={index === 0 ? 'aspect-[1.6] lg:aspect-[2]' : 'aspect-[1.4]'}
                >
                  <img
                    src={getCover(event)}
                    alt={event.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060609] via-[#060609]/30 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#d4ff00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d4ff00] backdrop-blur-sm">
                      {event.city || 'Event'}
                    </div>
                    <div
                      className={
                        index === 0
                          ? 'mt-3 font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[0.92] tracking-tight text-white'
                          : 'mt-3 font-display text-xl font-bold leading-tight tracking-tight text-white'
                      }
                    >
                      {event.name}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatPublicDate(event.starts_at, locale, { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {[event.venue_name, event.city].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </PublicReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
