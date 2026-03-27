import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { formatPublicCurrency, formatPublicDate, formatPublicNumber, usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

interface FeaturedEventBannerProps {
  event: PublicEventSummary
  showLabel?: boolean
}

export function FeaturedEventBanner({ event, showLabel = true }: FeaturedEventBannerProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const coverImage = getEventAssetUrl(event.mediaPresentation?.coverAsset) || event.cover_url
  const priceLabel =
    event.minPrice === null
      ? isPortuguese ? 'Sob consulta' : 'On request'
      : event.minPrice === 0
        ? isPortuguese ? 'Acesso gratuito' : 'Free access'
        : isPortuguese
          ? `a partir de ${formatPublicCurrency(event.minPrice, locale)}`
          : `from ${formatPublicCurrency(event.minPrice, locale)}`

  return (
    <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[2.7rem] border border-white/8 bg-[#0b0f15] shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt={event.name}
                  className="absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[50%]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,12,0.98)_0%,rgba(6,8,12,0.92)_42%,rgba(6,8,12,0.32)_72%,rgba(6,8,12,0.18)_100%)]" />
              </>
            ) : null}

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: '96px 96px',
              }}
            />

            <div className="relative z-10 grid gap-10 p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 lg:p-14">
              <div className="max-w-3xl">
                {showLabel ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/66">
                    <span className="h-2 w-2 rounded-full bg-[#ff2d2d]" />
                    {isPortuguese ? 'Acesso em destaque' : 'Featured access'}
                  </span>
                ) : null}

                <h2 className="mt-6 font-display text-[clamp(3.2rem,6vw,5.6rem)] font-semibold uppercase leading-[0.84] tracking-[-0.04em] text-white">
                  {event.name}
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                  {event.subtitle || event.short_description || (isPortuguese
                    ? 'Uma experiencia pensada para transformar compra em expectativa e presenca em memoria.'
                    : 'An experience designed to turn purchase into anticipation and attendance into memory.')}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                  {[
                    {
                      icon: CalendarDays,
                      label: isPortuguese ? 'Date' : 'Date',
                      value: formatPublicDate(event.starts_at, locale, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }),
                    },
                    {
                      icon: MapPin,
                      label: isPortuguese ? 'Local' : 'Location',
                      value: [event.venue_name, event.city].filter(Boolean).join(' / '),
                    },
                    {
                      icon: Users,
                      label: isPortuguese ? 'Demanda' : 'Demand',
                      value: `${formatPublicNumber(event.sold_tickets, locale)} ${isPortuguese ? 'acessos vendidos' : 'accesses sold'}`,
                    },
                  ].map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff2d2d]/12">
                          <Icon className="h-4 w-4 text-[#ff6a5c]" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">{item.label}</div>
                          <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href={`/e/${event.slug}`}
                    className="inline-flex items-center gap-3 rounded-full bg-[#ff2d2d] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-1 hover:bg-[#ff4133]"
                  >
                    {isPortuguese ? 'Ver experiencia' : 'View experience'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <div className="text-sm text-white/70">{priceLabel}</div>
                </div>
              </div>

              <div className="grid gap-4 self-end">
                {[
                  { label: isPortuguese ? 'Status' : 'Status', value: event.status === 'ongoing' ? (isPortuguese ? 'Ao vivo' : 'Live') : isPortuguese ? 'Proxima janela' : 'Next release' },
                  { label: isPortuguese ? 'Categoria' : 'Category', value: event.category || (isPortuguese ? 'Experiencia premium' : 'Premium experience') },
                  { label: isPortuguese ? 'Compra' : 'Purchase', value: isPortuguese ? 'Fluxo protegido e direto' : 'Protected and direct flow' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-black/24 p-5 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/42">{item.label}</div>
                    <div className="mt-3 font-display text-[1.9rem] font-semibold leading-[0.94] tracking-[-0.03em] text-white">
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
