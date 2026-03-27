import { ArrowUpRight } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { usePublicLocale } from '../lib/public-locale'
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
  const { isPortuguese } = usePublicLocale()
  const visibleEvents = events.slice(0, 4)

  if (visibleEvents.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1920px]">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(180deg,#02050a_0%,#040a13_100%)] px-8 py-12 shadow-[0_30px_90px_rgba(0,0,0,0.34)] md:px-12 md:py-14 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(115,160,255,0.15))]" />
              <div className="absolute inset-x-0 bottom-10 h-[2px] bg-white/14 blur-[2px]" />
              <div className="absolute -left-10 top-12 h-[2px] w-44 rotate-[-10deg] bg-white/30 blur-[1px]" />
              <div className="absolute left-[20%] top-[35%] h-[2px] w-32 rotate-[8deg] bg-white/20 blur-[1px]" />
              <div className="absolute right-[18%] top-[22%] h-[2px] w-40 rotate-[-6deg] bg-white/26 blur-[1px]" />
              <div className="absolute right-[8%] top-[62%] h-[2px] w-28 rotate-[5deg] bg-white/24 blur-[1px]" />
              <div className="absolute left-[34%] bottom-[23%] h-[2px] w-36 rotate-[-12deg] bg-white/20 blur-[1px]" />
            </div>

            <div className="relative z-10 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div className="max-w-xl">
                <div className="text-[11px] uppercase tracking-[0.36em] text-white/42">
                  {isPortuguese ? 'Capitulos da temporada' : 'Season chapters'}
                </div>
                <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.05em] text-white">
                  {isPortuguese ? 'Eventos apresentados como momentos de uma narrativa maior.' : 'Events presented as moments inside a larger narrative.'}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-8 text-white/64">
                  {isPortuguese
                    ? 'Cada evento entra como um capitulo visual, com profundidade, atmosfera e uma leitura muito mais editorial do calendario.'
                    : 'Each event appears as a visual chapter, with depth, atmosphere and a far more editorial reading of the calendar.'}
                </p>
              </div>

              <div className="relative min-h-[30rem]">
                {visibleEvents.map((event, index) => {
                  const transforms = [
                    'left-[8%] top-[18%] w-[10rem] rotate-[-6deg] md:w-[12rem] lg:left-[10%]',
                    'left-[26%] top-[6%] w-[13rem] rotate-[4deg] md:w-[16rem] lg:left-[30%]',
                    'left-[52%] top-[18%] w-[11rem] rotate-[-3deg] md:w-[13rem] lg:left-[58%]',
                    'left-[34%] top-[46%] w-[12rem] rotate-[2deg] md:w-[14rem] lg:left-[44%]',
                  ]

                  return (
                    <a
                      key={event.id}
                      href={`/e/${event.slug}`}
                      className={`group absolute overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition-all duration-500 hover:z-20 hover:-translate-y-3 hover:rotate-0 hover:border-white/24 ${transforms[index] ?? transforms[0]}`}
                    >
                      <img
                        src={getCover(event)}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,11,0.04)_0%,rgba(3,6,11,0.18)_38%,rgba(3,6,11,0.82)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/44">
                          {event.city || (isPortuguese ? 'Experiencia' : 'Experience')}
                        </div>
                        <div className="mt-2 flex items-end justify-between gap-3">
                          <div className="font-display text-[1.3rem] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
                            {event.name}
                          </div>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] text-white">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
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
