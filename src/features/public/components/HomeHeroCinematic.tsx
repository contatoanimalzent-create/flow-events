import { ArrowRight, Plus } from 'lucide-react'
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
    <section className="px-4 pb-8 pt-4 md:px-8 lg:px-12 lg:pb-10 lg:pt-5">
      <div className="mx-auto max-w-[1920px]">
        <div className="relative min-h-[calc(100svh-2rem)] overflow-hidden rounded-[2.9rem] border border-white/10 bg-[#05080d] shadow-[0_36px_120px_rgba(0,0,0,0.4)]">
          {heroEvent ? (
            <>
              <EventHeroMedia
                eventName={heroEvent.name}
                coverAsset={heroEvent.mediaPresentation.coverAsset}
                heroAsset={heroEvent.mediaPresentation.heroAsset}
                fallbackImage={fallbackImage}
                scrollY={scrollY}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,7,12,0.24)_0%,rgba(4,7,12,0.05)_28%,rgba(4,7,12,0.06)_70%,rgba(4,7,12,0.42)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.16)_0%,rgba(4,7,12,0)_22%,rgba(4,7,12,0.64)_100%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#05080d_0%,#0b111a_100%)]" />
          )}

          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '120px 120px',
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_12%_78%,rgba(255,45,45,0.18),transparent_24%)]" />

          <div className="relative z-10 flex min-h-[calc(100svh-2rem)] flex-col justify-between p-6 text-white md:p-10 lg:p-12">
            <div className="flex items-start justify-end">
              {heroEvent ? (
                <PublicReveal delayMs={120}>
                  <a
                    href={`/e/${heroEvent.slug}`}
                    className="inline-flex items-center gap-3 rounded-[1.2rem] border border-white/12 bg-[#9ec9fb] px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#07101a] transition-all duration-300 hover:-translate-y-1"
                  >
                    <Plus className="h-4 w-4" />
                    {isPortuguese ? 'Conhecer o evento' : 'Know the event'}
                  </a>
                </PublicReveal>
              ) : null}
            </div>

            <div className="pb-8">
              <PublicReveal>
                <div className="max-w-6xl">
                  <div className="text-[11px] uppercase tracking-[0.38em] text-white/46">
                    {heroEvent?.category || (isPortuguese ? 'Animalz experiences' : 'Animalz experiences')}
                  </div>
                  <h1 className="mt-4 font-display text-[clamp(5rem,13vw,12rem)] font-semibold uppercase leading-[0.82] tracking-[-0.08em] text-white">
                    {isPortuguese ? 'BEYOND ACCESS' : 'BEYOND ACCESS'}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                    {isPortuguese
                      ? 'Uma camada premium para descobrir, comprar e viver eventos com linguagem de marca, ritmo comercial e atmosfera real.'
                      : 'A premium layer for discovering, buying and living events with brand-led storytelling, stronger commercial rhythm and real atmosphere.'}
                  </p>
                </div>
              </PublicReveal>

              <PublicReveal delayMs={140}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/events"
                    className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-white/[0.06] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1]"
                  >
                    {isPortuguese ? 'Explorar capitulos' : 'Explore chapters'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/create-event"
                    className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-[0.16em] text-white/82 transition-all duration-300 hover:-translate-y-1 hover:border-white/24 hover:text-white"
                  >
                    {isPortuguese ? 'Publicar experiencia' : 'Launch an experience'}
                  </a>
                </div>
              </PublicReveal>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <PublicReveal delayMs={200}>
                <div className="text-sm uppercase tracking-[0.28em] text-white/54">
                  {heroEvent?.name || (isPortuguese ? 'Curadoria em andamento' : 'Curated selection in motion')}
                </div>
              </PublicReveal>

              <PublicReveal delayMs={240}>
                <div className="flex flex-col items-center gap-3 text-white/72">
                  <span className="text-sm font-medium uppercase tracking-[0.22em]">
                    {isPortuguese ? 'Role para explorar' : 'Scroll to explore'}
                  </span>
                  <span className="h-16 w-px bg-white/32" />
                </div>
              </PublicReveal>

              <PublicReveal delayMs={280}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.4rem] border border-white/10 bg-black/18 px-4 py-4 text-right backdrop-blur-sm">
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
