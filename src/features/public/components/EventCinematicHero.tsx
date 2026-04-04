import { ArrowRight, CalendarDays, MapPin, Sparkles, Users } from 'lucide-react'
import type { EventMediaPresentation } from '@/features/event-media/types'
import { EventHeroMedia } from '@/features/event-media'
import type { PublicEventRecord } from '@/features/public/types/public.types'
import { formatPublicCurrency, formatPublicDate, formatPublicNumber, usePublicLocale } from '../lib/public-locale'
import { PremiumBadge } from './PremiumBadge'
import { PublicReveal } from './PublicReveal'

interface EventCinematicHeroProps {
  event: PublicEventRecord
  presentation: EventMediaPresentation
  fallbackImage: string
  scrollY: number
  isFreeMode: boolean
  minPrice: number
}

function getStatusLabel(status: string) {
  if (status === 'ongoing') return 'Ao vivo'
  if (status === 'published') return 'Proxima data'
  return 'Experiencia'
}

export function EventCinematicHero({
  event,
  presentation,
  fallbackImage,
  scrollY,
  isFreeMode,
  minPrice,
}: EventCinematicHeroProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const occupancy = event.total_capacity > 0 ? Math.round((event.sold_tickets / event.total_capacity) * 100) : 0

  return (
    <section className="px-5 pb-8 pt-6 md:px-10 lg:px-16 lg:pb-10 lg:pt-8">
      <div className="mx-auto">
        <div className="relative min-h-[calc(100svh-7.25rem)] overflow-hidden rounded-[2.8rem] border border-white/8 bg-[#080b10] shadow-[0_36px_120px_rgba(0,0,0,0.32)]">
          <EventHeroMedia
            eventName={event.name}
            coverAsset={presentation.coverAsset}
            heroAsset={presentation.heroAsset}
            fallbackImage={fallbackImage}
            scrollY={scrollY}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(92,30,178,0.26),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(199,155,68,0.16),transparent_20%),linear-gradient(104deg,rgba(5,7,10,0.9)_0%,rgba(5,7,10,0.56)_40%,rgba(5,7,10,0.22)_66%,rgba(5,7,10,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.08)_0%,rgba(5,7,10,0)_28%,rgba(5,7,10,0.9)_100%)]" />

          <div className="relative z-10 flex min-h-[calc(100svh-7.25rem)] flex-col justify-between p-7 text-white md:p-10 lg:p-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PublicReveal className="flex flex-wrap gap-3">
                  <PremiumBadge tone="default" className="border-white/16 bg-white/10 text-white">
                    {event.category || (isPortuguese ? 'Evento' : 'Event')}
                  </PremiumBadge>
                  <PremiumBadge tone="default" className="border-white/16 bg-black/12 text-white/84">
                    {event.status === 'ongoing' ? (isPortuguese ? 'Ao vivo' : 'Live') : event.status === 'published' ? (isPortuguese ? 'Proxima janela' : 'Next release') : (isPortuguese ? 'Experiencia' : 'Experience')}
                  </PremiumBadge>
                </PublicReveal>
            </div>

            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_23rem] xl:items-end">
              <div className="max-w-4xl">
                <PublicReveal>
                  <div className="text-[12px] uppercase tracking-[0.3em] text-white/74">
                    {isPortuguese ? 'Experiencia em destaque' : 'Featured experience'}
                  </div>
                  <h1 className="mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8.4rem)] font-semibold uppercase leading-[0.83] tracking-[-0.04em] text-white">
                    {event.name}
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
                    {event.subtitle ||
                      event.short_description ||
                      (isPortuguese
                        ? 'Garanta seu acesso em uma jornada de compra desenhada para grandes experiencias.'
                        : 'Secure your access through a purchase journey designed for premium live experiences.')}
                  </p>
                </PublicReveal>

                <PublicReveal className="mt-8 flex flex-wrap items-center gap-4" delayMs={120}>
                  <a
                    href="#tickets"
                    className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#5c1eb2_0%,#7d49e6_100%)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(92,30,178,0.28)]"
                  >
                    {isFreeMode ? (isPortuguese ? 'Garantir inscricao' : 'Reserve registration') : (isPortuguese ? 'Comprar ingressos' : 'Buy tickets')}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <div className="text-sm text-white/78">
                    {isFreeMode || minPrice === 0
                      ? isPortuguese ? 'Inscricao gratuita' : 'Free registration'
                      : isPortuguese
                        ? `a partir de ${formatPublicCurrency(minPrice, locale)}`
                        : `from ${formatPublicCurrency(minPrice, locale)}`}
                  </div>
                </PublicReveal>
              </div>

              <PublicReveal delayMs={180}>
                <div className="rounded-[2rem] border border-white/12 bg-black/28 p-5 backdrop-blur-md">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/54">
                    {isPortuguese ? 'Destaques do evento' : 'Event highlights'}
                  </div>
                  <div className="mt-4 grid gap-4">
                    {[
                      {
                        icon: CalendarDays,
                        label: isPortuguese ? 'Data' : 'Date',
                        value: formatPublicDate(event.starts_at, locale, {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }),
                      },
                      {
                        icon: MapPin,
                        label: isPortuguese ? 'Local' : 'Location',
                        value: [event.venue_name, event.venue_address?.city].filter(Boolean).join(' / '),
                      },
                      {
                        icon: Users,
                        label: isPortuguese ? 'Demanda' : 'Demand',
                        value: isPortuguese ? `${occupancy}% da capacidade ocupada` : `${occupancy}% of capacity committed`,
                      },
                      {
                        icon: Sparkles,
                        label: isPortuguese ? 'Acesso' : 'Access',
                        value: isFreeMode
                          ? isPortuguese ? 'Inscricao gratuita com QR code' : 'Free registration with QR code'
                          : `${formatPublicNumber(event.sold_tickets, locale)} ${isPortuguese ? 'ingressos vendidos' : 'tickets sold'}`,
                      },
                    ].map((item) => {
                      const Icon = item.icon

                      return (
                        <div key={item.label} className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#5c1eb2]/12">
                            <Icon className="h-4 w-4 text-[#d8c39a]" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">{item.label}</div>
                            <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </PublicReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
