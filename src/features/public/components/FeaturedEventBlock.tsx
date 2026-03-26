import { ArrowRight, CalendarDays, MapPin, Star } from 'lucide-react'
import { EmptyState } from '@/shared/components'
import { formatCurrency } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'

interface FeaturedEventBlockProps {
  primaryEvent: PublicEventSummary | null
  secondaryEvents: PublicEventSummary[]
}

function getImage(event?: PublicEventSummary | null) {
  return (
    getEventAssetUrl(event?.mediaPresentation.coverAsset) ||
    event?.cover_url ||
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80&fit=crop'
  )
}

export function FeaturedEventBlock({ primaryEvent, secondaryEvents }: FeaturedEventBlockProps) {
  if (!primaryEvent) {
    return (
      <EmptyState
        title="Nenhuma experiencia pronta para destaque"
        description="Assim que o calendario publico tiver eventos ativos, esta curadoria editorial aparecera aqui automaticamente."
        className="min-h-[20rem]"
      />
    )
  }

  return (
    <section className="px-5 pb-8 md:px-10 lg:px-16 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <PublicReveal>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Curadoria editorial</div>
              <h2 className="mt-4 font-display text-[clamp(2.7rem,4vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                Um destaque principal para abrir a descoberta com presenca.
              </h2>
            </div>
          </PublicReveal>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          <PublicReveal>
            <a
              href={`/e/${primaryEvent.slug}`}
              className="group relative block min-h-[36rem] overflow-hidden rounded-[2.25rem] border border-white/70 bg-[#1d1712] shadow-[0_28px_90px_rgba(46,34,17,0.12)]"
            >
              <img
                src={getImage(primaryEvent)}
                alt={primaryEvent.name}
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.06)_0%,rgba(19,14,10,0.16)_34%,rgba(19,14,10,0.86)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,226,200,0.26),transparent_28%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white md:p-9">
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/82 backdrop-blur-md">
                    <Star className="h-3.5 w-3.5" />
                    Escolha da semana
                  </span>
                  {primaryEvent.category ? (
                    <span className="inline-flex rounded-full border border-white/16 bg-black/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/74 backdrop-blur-md">
                      {primaryEvent.category}
                    </span>
                  ) : null}
                </div>

                <div className="max-w-2xl">
                  <div className="font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
                    {primaryEvent.name}
                  </div>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/76">
                    {primaryEvent.subtitle || primaryEvent.short_description || 'Landing rica, assets reais e uma narrativa pronta para conversao.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/76">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-white/58" />
                      {new Date(primaryEvent.starts_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/58" />
                      {[primaryEvent.venue_name, primaryEvent.city].filter(Boolean).join(' / ')}
                    </span>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
                    Ver experiencia
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          </PublicReveal>

          <div className="grid gap-6">
            {secondaryEvents.map((event, index) => (
              <PublicReveal key={event.id} delayMs={index * 100 + 80}>
                <a
                  href={`/e/${event.slug}`}
                  className="group relative block min-h-[17rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[#1d1712] shadow-[0_22px_70px_rgba(46,34,17,0.1)]"
                >
                  <img
                    src={getImage(event)}
                    alt={event.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.06)_0%,rgba(19,14,10,0.18)_36%,rgba(19,14,10,0.86)_100%)]" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/62">
                      {new Date(event.starts_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="mt-3 font-display text-[2rem] font-semibold leading-[0.92] tracking-[-0.04em]">
                      {event.name}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/12 pt-4">
                      <span className="text-sm text-white/74">{[event.city, event.venue_name].filter(Boolean).join(' / ')}</span>
                      <span className="text-sm font-medium text-white/82">
                        {event.minPrice === null
                          ? 'Sob consulta'
                          : event.minPrice === 0
                            ? 'Inscricao gratuita'
                            : formatCurrency(event.minPrice)}
                      </span>
                    </div>
                  </div>
                </a>
              </PublicReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
