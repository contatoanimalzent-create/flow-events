import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumBadge } from './PremiumBadge'
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

function getStatusLabel(status: string) {
  if (status === 'ongoing') return 'Ao vivo'
  if (status === 'published') return 'Proximo acesso'
  return 'Experiencia'
}

export function PremiumEventCard({
  event,
  priority = false,
  index = 0,
  className,
}: PremiumEventCardProps) {
  const coverImage = getFallbackImage(event)

  return (
    <PublicReveal delayMs={index * 70} className={className}>
      <a
        href={`/e/${event.slug}`}
        className="group relative block h-full min-h-[31rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[#1d1712] shadow-[0_24px_70px_rgba(46,34,17,0.12)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_95px_rgba(46,34,17,0.16)]"
      >
        <img
          src={coverImage}
          alt={event.name}
          loading={priority ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.08)_0%,rgba(19,14,10,0.18)_32%,rgba(19,14,10,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,226,200,0.22),transparent_30%)]" />

        <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
          <PremiumBadge tone="default" className="border-white/20 bg-white/12 text-white">
            {getStatusLabel(event.status)}
          </PremiumBadge>
          {event.category ? (
            <PremiumBadge tone="default" className="border-white/20 bg-black/12 text-white/80">
              {event.category}
            </PremiumBadge>
          ) : null}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-7">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/62">
            {new Date(event.starts_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="mt-3 font-display text-[2.4rem] font-semibold leading-[0.9] tracking-[-0.04em] text-white">
            {event.name}
          </div>
          {event.subtitle ? (
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/76">{event.subtitle}</p>
          ) : null}

          <div className="mt-5 grid gap-2 text-sm text-white/72">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/58" />
              <span>
                {new Date(event.starts_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white/58" />
              <span>{[event.venue_name, event.city].filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/12 pt-5">
            <span className="text-sm font-medium text-white/82">
              {event.minPrice === null
                ? 'Sob consulta'
                : event.minPrice === 0
                  ? 'Inscricao gratuita'
                  : `a partir de ${formatCurrency(event.minPrice)}`}
            </span>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}
