import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { formatCurrency } from '@/shared/lib'

interface EventScheduleCardProps {
  event: PublicEventSummary
  index?: number
}

export function EventScheduleCard({ event, index = 0 }: EventScheduleCardProps) {
  const eventDate = new Date(event.starts_at)
  const day = eventDate.toLocaleDateString('pt-BR', { day: '2-digit' })
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' })
  const year = eventDate.toLocaleDateString('pt-BR', { year: 'numeric' })

  const priceLabel =
    event.minPrice === null ? 'Sob consulta' : event.minPrice === 0 ? 'Acesso gratuito' : `a partir de ${formatCurrency(event.minPrice)}`
  const coverImage =
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&fit=crop'

  return (
    <a
      href={`/e/${event.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] shadow-[0_18px_55px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.34)]"
    >
      <div className="grid gap-0 lg:grid-cols-[13rem_minmax(0,1fr)_12rem]">
        <div className="relative min-h-[15rem] overflow-hidden lg:min-h-full">
          <img
            src={coverImage}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,6,0.18)_0%,rgba(3,4,6,0.82)_100%)]" />
          <div className="absolute inset-x-5 bottom-5 text-white">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/56">{month} {year}</div>
            <div className="mt-2 font-display text-[3.2rem] font-semibold leading-none">{day}</div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#ff2d2d]/24 bg-[#ff2d2d]/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white">
              {index < 3 ? 'High demand' : 'Now selling'}
            </span>
            {event.category ? (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/58">
                {event.category}
              </span>
            ) : null}
          </div>

          <h3 className="mt-5 font-display text-[clamp(2.2rem,3vw,3.2rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
            {event.name}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            {event.subtitle || event.short_description || 'Uma experiencia pensada para transformar data, venue e narrativa em desejo imediato.'}
          </p>

          <div className="mt-6 grid gap-3 text-sm text-white/68 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#ff6a5c]" />
              <span>
                {eventDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#ff6a5c]" />
              <span>{[event.venue_name, event.city].filter(Boolean).join(' / ')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-white/8 bg-black/16 p-6 lg:border-l lg:border-t-0">
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-white/44">Ticketing</div>
            <div className="mt-3 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-white">
              {priceLabel}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-white/62">
              <Ticket className="h-4 w-4 text-[#ff6a5c]" />
              {event.sold_tickets.toLocaleString('pt-BR')} acessos vendidos
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            Ver detalhes
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}
