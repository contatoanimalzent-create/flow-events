import { ArrowRight, CalendarDays, MapPin, Plus } from 'lucide-react'
import { EventHeroMedia, getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'
import { AnimalzBrandMark } from './AnimalzBrandMark'

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
    <section className="px-4 pb-8 pt-4 md:px-8 lg:px-12 lg:pb-12 lg:pt-6">
      <div className="mx-auto max-w-[1920px]">
        <div className="relative min-h-[calc(100svh-2rem)] overflow-hidden rounded-[2.8rem] border border-[#0b1016]/12 bg-[#0a0f16] shadow-[0_36px_120px_rgba(11,16,22,0.18)]">
          {heroEvent ? (
            <>
              <EventHeroMedia
                eventName={heroEvent.name}
                coverAsset={heroEvent.mediaPresentation.coverAsset}
                heroAsset={heroEvent.mediaPresentation.heroAsset}
                fallbackImage={fallbackImage}
                scrollY={scrollY}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,15,0.78)_0%,rgba(7,10,15,0.34)_26%,rgba(7,10,15,0.08)_60%,rgba(7,10,15,0.62)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,15,0.18)_0%,rgba(7,10,15,0.02)_22%,rgba(7,10,15,0.78)_100%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#05080d_0%,#0b111a_100%)]" />
          )}

          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '124px 124px',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_12%_78%,rgba(211,155,95,0.22),transparent_24%)]" />

          <div className="relative z-10 flex min-h-[calc(100svh-2rem)] flex-col justify-between p-6 text-white md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <PublicReveal>
                <div className="max-w-6xl">
                  <AnimalzBrandMark inverse compact className="mb-10" />
                  <div className="text-[11px] uppercase tracking-[0.38em] text-white/56">
                    {heroEvent?.category || 'Animalz curated experiences'}
                  </div>
                  <h1 className="mt-4 max-w-[11ch] font-display text-[clamp(4.4rem,11vw,10.4rem)] font-semibold uppercase leading-[0.8] tracking-[-0.08em] text-white">
                    EVENTS WITH A LUXURY PULSE
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/74 md:text-lg">
                    {isPortuguese
                      ? 'Animalz nao e uma vitrine de ingressos. E uma camada editorial para descoberta, compra e presenca de marca em experiencias que pedem mais impacto visual e mais desejo.'
                      : 'Animalz is not a ticket shelf. It is an editorial layer for discovery, purchase and brand presence in experiences that demand more visual impact and more desire.'}
                  </p>
                </div>
              </PublicReveal>

              <PublicReveal delayMs={120}>
                <div className="self-start rounded-[2rem] border border-white/12 bg-black/20 p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/48">
                    Current spotlight
                  </div>
                  <div className="mt-4 font-display text-[2.1rem] font-semibold uppercase leading-[0.88] tracking-[-0.04em] text-white">
                    {heroEvent?.name || 'Animalz'}
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-white/72">
                    {heroEvent?.starts_at ? (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-white/48" />
                        <span>{new Date(heroEvent.starts_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      </div>
                    ) : null}
                    {(heroEvent?.venue_name || heroEvent?.city) ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/48" />
                        <span>{[heroEvent?.venue_name, heroEvent?.city].filter(Boolean).join(' / ')}</span>
                      </div>
                    ) : null}
                  </div>
                  {heroEvent ? (
                    <a
                      href={`/e/${heroEvent.slug}`}
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#f4efe8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#0b1016] transition-all duration-300 hover:-translate-y-1"
                    >
                      <Plus className="h-4 w-4" />
                      Open event
                    </a>
                  ) : null}
                </div>
              </PublicReveal>
            </div>

            <div className="pb-8">
              <PublicReveal delayMs={140}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/events"
                    className="inline-flex items-center gap-3 rounded-full bg-[#ff4b36] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-1"
                  >
                    Explore the calendar
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/create-event"
                    className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-[0.16em] text-white/82 transition-all duration-300 hover:-translate-y-1 hover:border-white/24 hover:text-white"
                  >
                    Launch with Animalz
                  </a>
                </div>
              </PublicReveal>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <PublicReveal delayMs={200}>
                <div className="text-sm uppercase tracking-[0.28em] text-white/54">
                  {heroEvent?.name || 'Selection in motion'}
                </div>
              </PublicReveal>

              <PublicReveal delayMs={240}>
                <div className="flex flex-col items-center gap-3 text-white/72">
                  <span className="text-sm font-medium uppercase tracking-[0.22em]">Scroll to explore</span>
                  <span className="h-16 w-px bg-white/32" />
                </div>
              </PublicReveal>

              <PublicReveal delayMs={280}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4 text-right backdrop-blur-sm">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/48">{stat.label}</div>
                      <div className="mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.04em] text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </PublicReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
