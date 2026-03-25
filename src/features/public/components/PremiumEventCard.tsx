import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { formatDate, formatCurrency } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumBadge } from './PremiumBadge'
import { PublicReveal } from './PublicReveal'

interface PremiumEventCardProps {
  event: PublicEventSummary
  priority?: boolean
  index?: number
}

function getFallbackImage(event: PublicEventSummary) {
  return event.cover_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80&fit=crop'
}

function getStatusLabel(status: string) {
  if (status === 'ongoing') return 'Ao vivo'
  if (status === 'published') return 'Proxima experiencia'
  return status
}

export function PremiumEventCard({ event, priority = false, index = 0 }: PremiumEventCardProps) {
  const coverImage = getEventAssetUrl(event.mediaPresentation.coverAsset) || getFallbackImage(event)

  return (
    <PublicReveal delayMs={index * 80}>
      <a
        href={`/e/${event.slug}`}
        className="group block overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_90px_rgba(46,34,17,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_110px_rgba(46,34,17,0.14)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={coverImage}
            alt={event.name}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#201913]/70 via-[#201913]/18 to-transparent" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <PremiumBadge tone="default">{getStatusLabel(event.status)}</PremiumBadge>
            {event.category ? <PremiumBadge tone="muted">{event.category}</PremiumBadge> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/70">
              {formatDate(event.starts_at, "dd 'de' MMMM")}
            </div>
            <div className="mt-2 font-serif text-3xl font-semibold leading-[0.96]">
              {event.name}
            </div>
            {event.subtitle ? (
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/82">
                {event.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 p-5 text-[#5f5549]">
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#947d52]" />
              <span>{formatDate(event.starts_at, "dd 'de' MMMM 'de' yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#947d52]" />
              <span>{[event.venue_name, event.city].filter(Boolean).join(' · ')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[#efe3d1] pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[#947d52]" />
              <span>
                {event.sold_tickets.toLocaleString('pt-BR')} vendidos
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1f1a15]">
                {event.minPrice === null ? 'Sob consulta' : event.minPrice === 0 ? 'Inscricao gratuita' : `a partir de ${formatCurrency(event.minPrice)}`}
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec0] text-[#1f1a15] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}
