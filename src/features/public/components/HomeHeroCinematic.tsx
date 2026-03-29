import { ArrowRight, CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { EventHeroMedia, getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

interface HomeHeroCinematicProps {
  heroEvent: PublicEventSummary | null
  scrollY: number
  stats: Array<{ label: string; value: string }>
}

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2200&q=80&fit=crop'

export function HomeHeroCinematic({ heroEvent, scrollY, stats }: HomeHeroCinematicProps) {
  const { isPortuguese } = usePublicLocale()
  const fallbackImage =
    getEventAssetUrl(heroEvent?.mediaPresentation.coverAsset) || heroEvent?.cover_url || fallbackHeroImage

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background */}
      {heroEvent ? (
        <>
          <EventHeroMedia
            eventName={heroEvent.name}
            coverAsset={heroEvent.mediaPresentation.coverAsset}
            heroAsset={heroEvent.mediaPresentation.heroAsset}
            fallbackImage={fallbackImage}
            scrollY={scrollY}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070607]/95 via-[#070607]/60 to-[#070607]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070607] via-transparent to-[#070607]/40" />
        </>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#070607]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(214,42,11,0.09),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(174,147,111,0.05),transparent_50%)]" />
        </div>
      )}

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(174,147,111,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(174,147,111,0.18) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          <PublicReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ae936f]/20 bg-[#ae936f]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ae936f]">
              <Sparkles className="h-3.5 w-3.5" />
              {isPortuguese ? 'Plataforma de eventos premium' : 'Premium events platform'}
            </div>
          </PublicReveal>

          <PublicReveal delayMs={80}>
            <h1 className="mt-8 max-w-[14ch] font-display text-[clamp(3rem,8vw,7rem)] font-bold uppercase leading-[0.88] tracking-tight text-white">
              {isPortuguese
                ? <>Onde cada evento vira <span className="text-[#d62a0b]">experiencia.</span></>
                : <>Where every event becomes an <span className="text-[#d62a0b]">experience.</span></>
              }
            </h1>
          </PublicReveal>

          <PublicReveal delayMs={140}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50">
              {isPortuguese
                ? 'Descubra, compre e viva eventos unicos. Uma plataforma feita para quem busca algo alem do comum.'
                : 'Discover, buy and live unique events. A platform built for those who seek something beyond ordinary.'}
            </p>
          </PublicReveal>

          <PublicReveal delayMs={200}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/events"
                className="group inline-flex items-center gap-2 rounded-full bg-[#d62a0b] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#ebe7e0] transition-all duration-300 hover:bg-[#e14425] hover:shadow-[0_0_30px_rgba(214,42,11,0.25)]"
              >
                {isPortuguese ? 'Explorar eventos' : 'Explore events'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/create-event"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/24 hover:text-white"
              >
                {isPortuguese ? 'Criar evento' : 'Create event'}
              </a>
            </div>
          </PublicReveal>
        </div>

        {/* Bottom: featured event card + stats */}
        <div className="mx-auto mt-auto w-full max-w-[1440px] pt-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            {/* Featured event card */}
            {heroEvent ? (
              <PublicReveal delayMs={240}>
                <a
                  href={`/e/${heroEvent.slug}`}
                  className="group flex items-center gap-5 rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm transition-all hover:border-[#ae936f]/20 hover:bg-white/[0.06]"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#ae936f]/10">
                    <CalendarDays className="h-6 w-6 text-[#ae936f]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ae936f]/70">
                      {isPortuguese ? 'Em destaque' : 'Spotlight'}
                    </div>
                    <div className="mt-1 truncate text-lg font-bold text-white">{heroEvent.name}</div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-white/40">
                      {heroEvent.starts_at ? (
                        <span>{new Date(heroEvent.starts_at).toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      ) : null}
                      {heroEvent.city ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {heroEvent.city}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 flex-shrink-0 text-white/20 transition-all group-hover:text-[#d62a0b] group-hover:translate-x-1" />
                </a>
              </PublicReveal>
            ) : null}

            {/* Stats */}
            <PublicReveal delayMs={300}>
              <div className="flex gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-center backdrop-blur-sm">
                    <div className="font-display text-2xl font-bold text-[#ae936f]">{stat.value}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">{stat.label}</div>
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
