import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { formatPublicCurrency, formatPublicDate, usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

interface PremiumEventCardProps {
  event: PublicEventSummary
  priority?: boolean
  index?: number
  className?: string
}

function getFallbackImage(event: PublicEventSummary) {
  return (
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80&fit=crop'
  )
}

export function PremiumEventCard({
  event,
  priority = false,
  index = 0,
  className,
}: PremiumEventCardProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const coverImage = getFallbackImage(event)

  return (
    <PublicReveal delayMs={index * 70} className={className}>
      <a
        href={`/e/${event.slug}`}
        aria-label={event.name}
        className="group relative block h-full min-h-[26rem] overflow-hidden rounded-2xl border border-white/8 bg-[#12100f] transition-all duration-500 hover:border-[#4285F4]/20"
      >
        <img
          src={coverImage}
          alt={event.name}
          loading={priority ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070607] via-[#070607]/40 to-transparent" />

        <div className="absolute left-4 top-4 z-10">
          {event.category ? (
            <span className="inline-flex items-center rounded-full bg-[#4285F4]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4285F4] backdrop-blur-sm">
              {event.category}
            </span>
          ) : null}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
          <div className="font-display text-[1.8rem] font-bold leading-[0.95] tracking-tight text-white">
            {event.name}
          </div>
          {event.subtitle ? (
            <p className="mt-2 max-w-sm text-sm text-white/50">{event.subtitle}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatPublicDate(event.starts_at, locale, { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {[event.venue_name, event.city].filter(Boolean).join(' · ')}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
            <span className="text-sm font-medium text-white/60">
              {event.minPrice === null
                ? isPortuguese ? 'Sob consulta' : 'On request'
                : event.minPrice === 0
                  ? isPortuguese ? 'Acesso livre' : 'Free access'
                  : `${isPortuguese ? 'A partir de' : 'From'} ${formatPublicCurrency(event.minPrice, locale)}`}
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all group-hover:border-[#4285F4]/30 group-hover:text-[#4285F4]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}
