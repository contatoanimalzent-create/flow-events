import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import {
  formatPublicDate,
  formatPublicNumber,
  usePublicLocale,
} from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

interface EventChaptersShowcaseProps {
  events: PublicEventSummary[]
}

function getCover(event: PublicEventSummary) {
  return (
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80&fit=crop'
  )
}

export function EventChaptersShowcase({ events }: EventChaptersShowcaseProps) {
  const { isPortuguese, locale } = usePublicLocale()
  const visibleEvents = events.slice(0, 4)
  const primaryEvent = visibleEvents[0]
  const supportingEvents = visibleEvents.slice(1)

  if (!primaryEvent) {
    return null
  }

  return (
    <section className="px-5 py-12 md:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-[linear-gradient(180deg,#02050a_0%,#050914_100%)] px-6 py-8 shadow-[0_34px_100px_rgba(0,0,0,0.34)] md:px-10 md:py-10 lg:px-14 lg:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(110,154,255,0.14),transparent_24%),radial-gradient(circle_at_72%_24%,rgba(255,45,45,0.15),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(122,164,255,0.12))]" />
            <div className="pointer-events-none absolute left-[8%] top-10 h-[2px] w-40 rotate-[-8deg] bg-white/24 blur-[1px]" />
            <div className="pointer-events-none absolute right-[14%] top-[22%] h-[2px] w-48 rotate-[7deg] bg-white/18 blur-[1px]" />
            <div className="pointer-events-none absolute left-[38%] bottom-[24%] h-[2px] w-40 rotate-[-10deg] bg-white/16 blur-[1px]" />

            <div className="relative z-10 grid gap-10 xl:grid-cols-[0.72fr_1.28fr] xl:items-center">
              <div className="max-w-xl">
                <div className="text-[11px] uppercase tracking-[0.36em] text-white/42">
                  {isPortuguese ? 'Season chapters' : 'Season chapters'}
                </div>
                <h2 className="mt-5 max-w-lg font-display text-[clamp(3.2rem,5vw,6rem)] font-semibold uppercase leading-[0.86] tracking-[-0.06em] text-white">
                  {isPortuguese
                    ? 'Eventos tratados como capitulos de uma temporada.'
                    : 'Events treated as chapters inside a season.'}
                </h2>
                <p className="mt-6 max-w-md text-base leading-8 text-white/62">
                  {isPortuguese
                    ? 'Cada momento entra com imagem forte, contexto claro e ritmo visual para transformar calendario em narrativa.'
                    : 'Each moment enters with stronger imagery, clear context and a visual rhythm that turns schedule into narrative.'}
                </p>

                <div className="mt-8 grid gap-3 sm:max-w-md sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                      {isPortuguese ? 'Capitulos' : 'Chapters'}
                    </div>
                    <div className="mt-2 font-display text-[2rem] font-semibold leading-none text-white">
                      {visibleEvents.length}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                      {isPortuguese ? 'Publico' : 'Audience'}
                    </div>
                    <div className="mt-2 font-display text-[2rem] font-semibold leading-none text-white">
                      {formatPublicNumber(
                        visibleEvents.reduce((sum, event) => sum + event.sold_tickets, 0),
                        locale,
                      )}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                      {isPortuguese ? 'Cidades' : 'Cities'}
                    </div>
                    <div className="mt-2 font-display text-[2rem] font-semibold leading-none text-white">
                      {new Set(visibleEvents.map((event) => event.city).filter(Boolean)).size}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[34rem] md:min-h-[40rem]">
                <a
                  href={`/e/${primaryEvent.slug}`}
                  className="group absolute left-0 top-0 z-20 w-[68%] overflow-hidden rounded-[2rem] border border-white/12 bg-[#08101a] shadow-[0_28px_90px_rgba(0,0,0,0.42)] transition-transform duration-500 hover:-translate-y-2"
                >
                  <div
                    aria-hidden="true"
                    className="aspect-[0.86] w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url("${getCover(primaryEvent)}")` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.08)_0%,rgba(4,7,12,0.24)_36%,rgba(4,7,12,0.92)_100%)]" />

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80">
                        {primaryEvent.city || (isPortuguese ? 'Experiencia' : 'Experience')}
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] text-white transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-4 font-display text-[clamp(2rem,3vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-white">
                      {primaryEvent.name}
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-white/72">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-white/48" />
                        {formatPublicDate(primaryEvent.starts_at, locale, {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/48" />
                        {[primaryEvent.venue_name, primaryEvent.city].filter(Boolean).join(' / ')}
                      </div>
                    </div>
                  </div>
                </a>

                {supportingEvents.map((event, index) => {
                  const positions = [
                    'right-[6%] top-[2%] w-[38%] rotate-[3deg]',
                    'right-0 top-[34%] w-[34%] rotate-[-4deg]',
                    'left-[46%] bottom-[2%] w-[36%] rotate-[2deg]',
                  ]

                  return (
                    <a
                      key={event.id}
                      href={`/e/${event.slug}`}
                      className={`group absolute z-10 overflow-hidden rounded-[1.6rem] border border-white/12 bg-[#08101a] shadow-[0_20px_60px_rgba(0,0,0,0.34)] transition-all duration-500 hover:z-30 hover:-translate-y-2 hover:rotate-0 ${positions[index] ?? positions[0]}`}
                    >
                      <div
                        aria-hidden="true"
                        className="aspect-[0.88] w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.05]"
                        style={{ backgroundImage: `url("${getCover(event)}")` }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.04)_0%,rgba(4,7,12,0.18)_36%,rgba(4,7,12,0.88)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/44">
                          {event.city || (isPortuguese ? 'Evento' : 'Event')}
                        </div>
                        <div className="mt-2 font-display text-[1.35rem] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
                          {event.name}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
