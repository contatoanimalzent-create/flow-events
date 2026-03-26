import { ArrowRight, CalendarDays, MapPin, Sparkles, Users } from 'lucide-react'
import { EventHeroMedia, getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'

interface HomeHeroCinematicProps {
  heroEvent: PublicEventSummary | null
  scrollY: number
  stats: Array<{ label: string; value: string }>
  onLogin?: () => void
}

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2200&q=80&fit=crop'

export function HomeHeroCinematic({ heroEvent, scrollY, stats }: HomeHeroCinematicProps) {
  const fallbackImage =
    getEventAssetUrl(heroEvent?.mediaPresentation.coverAsset) || heroEvent?.cover_url || fallbackHeroImage

  return (
    <section className="px-5 pb-8 pt-6 md:px-10 md:pb-10 lg:px-16 lg:pb-12 lg:pt-8">
      <div className="mx-auto">
        <div className="relative min-h-[calc(100svh-7.5rem)] overflow-hidden rounded-[2.5rem] border border-white/70 bg-[#221b15] shadow-[0_32px_120px_rgba(41,29,15,0.18)]">
          {heroEvent ? (
            <>
              <EventHeroMedia
                eventName={heroEvent.name}
                coverAsset={heroEvent.mediaPresentation.coverAsset}
                heroAsset={heroEvent.mediaPresentation.heroAsset}
                fallbackImage={fallbackImage}
                scrollY={scrollY}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(243,230,205,0.22),transparent_28%),linear-gradient(112deg,rgba(21,14,8,0.88)_0%,rgba(21,14,8,0.46)_42%,rgba(21,14,8,0.2)_62%,rgba(21,14,8,0.72)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,13,9,0.18)_0%,rgba(18,13,9,0)_24%,rgba(18,13,9,0.68)_100%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f2debf,transparent_30%),radial-gradient(circle_at_80%_18%,rgba(214,187,145,0.34),transparent_24%),linear-gradient(135deg,#f4efe7_0%,#ebe0d0_45%,#efe8dc_100%)]" />
          )}

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '140px 140px',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.95))',
            }}
          />

          <div className="relative z-10 flex min-h-[calc(100svh-7.5rem)] flex-col justify-between p-7 text-white md:p-10 lg:p-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PublicReveal className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/82 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ingressos e experiencias
                </span>
              </PublicReveal>

              {heroEvent ? (
                <PublicReveal delayMs={120} className="hidden rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/74 backdrop-blur-md md:flex">
                  {heroEvent.status === 'ongoing' ? 'Evento em andamento' : 'Em destaque'}
                </PublicReveal>
              ) : null}
            </div>

            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.12fr)_21rem] xl:items-end">
              <div className="max-w-4xl">
                <PublicReveal>
                  <h1 className="max-w-5xl font-display text-[clamp(4.4rem,10vw,8.7rem)] font-semibold leading-[0.84] tracking-[-0.05em] text-white">
                    Descubra eventos que valem a experiencia.
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
                    Compre ingressos, garanta seu lugar e viva os melhores eventos de cultura, gastronomia, musica e lifestyle.
                  </p>
                </PublicReveal>

                <PublicReveal className="mt-8 flex flex-wrap items-center gap-4" delayMs={120}>
                  <a
                    href="/events"
                    className="inline-flex items-center gap-3 rounded-full bg-[#f8f3ea] px-6 py-3 text-sm font-semibold text-[#1f1a15] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(21,14,8,0.24)]"
                  >
                    Ver todos os eventos
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/create-event"
                    className="inline-flex items-center gap-3 rounded-full border border-white/36 bg-white/6 px-6 py-3 text-sm font-medium text-white transition-all duration-500 hover:-translate-y-1 hover:bg-white/14"
                  >
                    Sou produtor
                  </a>
                  {heroEvent ? (
                    <a
                      href={`/e/${heroEvent.slug}`}
                      className="inline-flex items-center gap-3 rounded-full border border-white/24 bg-white/6 px-6 py-3 text-sm font-medium text-white/90 transition-all duration-500 hover:-translate-y-1 hover:bg-white/14"
                    >
                      Ver evento em destaque
                    </a>
                  ) : null}
                </PublicReveal>
              </div>

              {heroEvent ? (
                <PublicReveal delayMs={180}>
                  <div className="rounded-[2rem] border border-white/14 bg-white/10 p-5 backdrop-blur-md">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-white/56">Em destaque</div>
                    <div className="mt-4 font-display text-4xl font-semibold leading-[0.92] text-white">
                      {heroEvent.name}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/74">
                      {heroEvent.subtitle || heroEvent.short_description || 'Garanta seu ingresso e viva uma experiencia inesquecivel.'}
                    </p>

                    <div className="mt-6 grid gap-3">
                      {[
                        {
                          icon: CalendarDays,
                          label: 'Data',
                          value: new Date(heroEvent.starts_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }),
                        },
                        {
                          icon: MapPin,
                          label: 'Local',
                          value: [heroEvent.venue_name, heroEvent.city].filter(Boolean).join(' / '),
                        },
                        {
                          icon: Users,
                          label: 'Ingressos vendidos',
                          value: heroEvent.sold_tickets.toLocaleString('pt-BR'),
                        },
                      ].map((item) => {
                        const Icon = item.icon

                        return (
                          <div key={item.label} className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-black/10 px-4 py-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10">
                              <Icon className="h-4 w-4 text-white/84" />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.24em] text-white/48">{item.label}</div>
                              <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </PublicReveal>
              ) : null}
            </div>

            <PublicReveal delayMs={220}>
              <div className="grid gap-3 border-t border-white/12 pt-5 md:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-md"
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/46">{stat.label}</div>
                    <div className="mt-3 font-display text-3xl font-semibold leading-none text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </PublicReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
