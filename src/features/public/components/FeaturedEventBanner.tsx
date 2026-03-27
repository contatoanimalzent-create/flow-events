import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { formatCurrency } from '@/shared/lib'
import { PublicReveal } from './PublicReveal'

interface FeaturedEventBannerProps {
  event: PublicEventSummary
  showLabel?: boolean
}

export function FeaturedEventBanner({ event, showLabel = true }: FeaturedEventBannerProps) {
  const coverImage = getEventAssetUrl(event.mediaPresentation?.coverAsset) || event.cover_url
  const priceLabel =
    event.minPrice === null ? 'Sob consulta' : event.minPrice === 0 ? 'Acesso gratuito' : `a partir de ${formatCurrency(event.minPrice)}`

  return (
    <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[2.7rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(246,238,228,0.84))] shadow-[0_28px_90px_rgba(48,35,18,0.09)]">
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt={event.name}
                  className="absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[52%]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,242,234,0.98)_0%,rgba(247,242,234,0.92)_44%,rgba(247,242,234,0.25)_74%,rgba(247,242,234,0.05)_100%)]" />
              </>
            ) : null}

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(120,104,78,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,104,78,0.05) 1px, transparent 1px)',
                backgroundSize: '96px 96px',
              }}
            />

            <div className="relative z-10 grid gap-10 p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 lg:p-14">
              <div className="max-w-3xl">
                {showLabel ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dfcfb6] bg-white/86 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#7f7264]">
                    <span className="h-2 w-2 rounded-full bg-[#c49a50]" />
                    Evento em destaque
                  </span>
                ) : null}

                <h2 className="mt-6 font-display text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[0.84] tracking-[-0.05em] text-[#1f1a15]">
                  {event.name}
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5549] md:text-lg">
                  {event.subtitle || event.short_description || 'Uma experiencia pensada para transformar compra em expectativa e presenca em memoria.'}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                  {[
                    {
                      icon: CalendarDays,
                      label: 'Data',
                      value: new Date(event.starts_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }),
                    },
                    {
                      icon: MapPin,
                      label: 'Local',
                      value: [event.venue_name, event.city].filter(Boolean).join(' / '),
                    },
                    {
                      icon: Users,
                      label: 'Procura',
                      value: `${event.sold_tickets.toLocaleString('pt-BR')} acessos vendidos`,
                    },
                  ].map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-[1.5rem] border border-white/72 bg-white/82 px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ebdd]">
                          <Icon className="h-4 w-4 text-[#6d5324]" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-[#8e7f68]">{item.label}</div>
                          <div className="mt-1 text-sm font-medium text-[#1f1a15]">{item.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href={`/e/${event.slug}`}
                    className="inline-flex items-center gap-3 rounded-full bg-[#1f1a15] px-7 py-3.5 text-sm font-semibold text-[#f8f3ea] transition-all duration-500 hover:-translate-y-1"
                  >
                    Ver experiencia
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <div className="text-sm text-[#5f5549]">{priceLabel}</div>
                </div>
              </div>

              <div className="grid gap-4 self-end">
                {[
                  { label: 'Status', value: event.status === 'ongoing' ? 'Ao vivo' : 'Proxima data' },
                  { label: 'Categoria', value: event.category || 'Experiencia premium' },
                  { label: 'Compra', value: 'Checkout rapido e protegido' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] border border-white/72 bg-white/78 p-5">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#8e7f68]">{item.label}</div>
                    <div className="mt-3 font-display text-[1.9rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1f1a15]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
