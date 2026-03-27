import { useMemo } from 'react'
import { LoadingState } from '@/shared/components'
import {
  EventsHero,
  EventsScheduleList,
  ExploreMoreSection,
  FeaturedEventBanner,
  PublicLayout,
  PublicReveal,
  RelatedExperiencesGrid,
  usePublicEvents,
} from '@/features/public'
import { useSeoMeta } from '@/shared/lib'

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  const heroEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime())
        .slice(0, 4),
    [events],
  )

  const featuredCollection = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets).slice(0, 4),
    [events],
  )

  const cityCount = useMemo(() => new Set(events.map((event) => event.city).filter(Boolean)).size, [events])
  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category).filter(Boolean)))
        .slice(0, 6)
        .map((category) => String(category)),
    [events],
  )

  const seoImage =
    heroEvent?.mediaPresentation.heroAsset?.thumbnail_url ??
    heroEvent?.mediaPresentation.coverAsset?.secure_url ??
    heroEvent?.cover_url ??
    null

  useSeoMeta({
    title: 'Animalz Events | Premium experiences platform',
    description: 'Descubra experiencias, compre com confianca e navegue por uma agenda premium de eventos ao vivo.',
    image: seoImage,
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title="Carregando experiencias"
              description="Buscando os proximos eventos da plataforma."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <>
          {heroEvent ? (
            <section className="px-5 pb-8 pt-8 md:px-10 lg:px-16 lg:pb-12">
              <div className="mx-auto max-w-7xl">
                <PublicReveal>
                  <div className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[#080b10] shadow-[0_32px_100px_rgba(0,0,0,0.34)]">
                    <div className="absolute inset-0">
                      <img
                        src={seoImage ?? heroEvent.cover_url ?? ''}
                        alt={heroEvent.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,45,45,0.2),transparent_26%),linear-gradient(90deg,rgba(4,6,9,0.96)_0%,rgba(4,6,9,0.82)_40%,rgba(4,6,9,0.34)_72%,rgba(4,6,9,0.78)_100%)]" />
                    </div>

                    <div className="relative z-10 grid min-h-[39rem] gap-8 px-8 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:px-14 lg:py-14">
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/62">
                            Animalz Experiences
                          </div>
                          <h1 className="mt-6 max-w-4xl font-display text-[clamp(4.2rem,9vw,8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.04em] text-white">
                            Descubra a proxima experiencia antes do restante do publico.
                          </h1>
                          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                            Agenda premium, destaque comercial forte e compra clara desde a primeira dobra.
                          </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <a
                            href={`/e/${heroEvent.slug}`}
                            className="inline-flex items-center rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
                          >
                            Ver evento principal
                          </a>
                          <a
                            href="/events"
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-white"
                          >
                            Explorar agenda
                          </a>
                        </div>
                      </div>

                      <div className="grid gap-4 self-end">
                        {[
                          { label: 'Evento em destaque', value: heroEvent.name },
                          { label: 'Cidades ativas', value: `${cityCount} cidades` },
                          { label: 'Experiencias publicas', value: `${events.length} eventos` },
                          { label: 'Categorias', value: `${categories.length} curadorias` },
                        ].map((item) => (
                          <div key={item.label} className="rounded-[1.7rem] border border-white/10 bg-black/28 p-5 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.28em] text-white/42">{item.label}</div>
                            <div className="mt-3 font-display text-[1.9rem] font-semibold uppercase leading-[0.94] tracking-[-0.03em] text-white">
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
          ) : (
            <EventsHero eventCount={events.length} cityCount={cityCount} categories={categories} />
          )}

          {heroEvent ? <FeaturedEventBanner event={heroEvent} /> : null}

          <section className="px-5 py-6 md:px-10 lg:px-16 lg:py-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-4 lg:grid-cols-3">
                {featuredCollection.slice(0, 3).map((event, index) => (
                  <PublicReveal key={event.id} delayMs={index * 70}>
                    <a
                      href={`/e/${event.slug}`}
                      className="group flex min-h-[13rem] flex-col justify-between rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1"
                    >
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/46">
                          {index === 0 ? 'Selling fast' : index === 1 ? 'Premium access' : 'New release'}
                        </div>
                        <div className="mt-4 font-display text-[2rem] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-white">
                          {event.name}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/62">
                          {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                        </p>
                      </div>
                      <div className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#ff6a5c]">
                        Ver detalhes
                      </div>
                    </a>
                  </PublicReveal>
                ))}
              </div>
            </div>
          </section>

          <EventsScheduleList
            events={upcomingEvents}
            title="Upcoming schedule"
            subtitle="Uma agenda vertical, clara e forte para percorrer proximas datas, comparar venues e abrir cada experiencia com contexto comercial."
          />

          <RelatedExperiencesGrid events={featuredCollection} title="Explore featured access" />
          <ExploreMoreSection currentEventId={heroEvent?.id ?? ''} events={events} />
        </>
      )}
    </PublicLayout>
  )
}
