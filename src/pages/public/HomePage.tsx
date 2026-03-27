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
      <EventsHero eventCount={events.length} cityCount={cityCount} categories={categories} />

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
          {heroEvent ? <FeaturedEventBanner event={heroEvent} /> : null}

          <EventsScheduleList
            events={upcomingEvents}
            title="Proximos eventos"
            subtitle="Uma agenda clara para descobrir datas, venues e acessos com a mesma confianca de uma plataforma global de experiencias."
          />

          <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
            <div className="mx-auto max-w-7xl">
              <PublicReveal>
                <div className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(246,239,229,0.82))] px-8 py-10 shadow-[0_22px_70px_rgba(48,35,18,0.08)] md:px-10 md:py-12">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="max-w-3xl">
                      <div className="text-[11px] uppercase tracking-[0.34em] text-[#8e7f68]">Why Animalz</div>
                      <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                        Descoberta forte no topo. Conversao clara na ultima dobra.
                      </h2>
                      <p className="mt-4 text-base leading-8 text-[#5f5549] md:text-lg">
                        A camada publica foi desenhada para destacar o evento certo, deixar a agenda legivel e aproximar o clique de compra da decisao.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/events"
                        className="inline-flex items-center rounded-full bg-[#1f1a15] px-6 py-3.5 text-sm font-semibold text-[#f8f3ea]"
                      >
                        Explorar agenda
                      </a>
                      <a
                        href="/create-event"
                        className="inline-flex items-center rounded-full border border-[#d9ccb8] bg-white px-6 py-3.5 text-sm font-medium text-[#1f1a15]"
                      >
                        Quero publicar
                      </a>
                    </div>
                  </div>
                </div>
              </PublicReveal>
            </div>
          </section>

          <RelatedExperiencesGrid events={featuredCollection} title="Em destaque agora" />
          <ExploreMoreSection currentEventId={heroEvent?.id ?? ''} events={events} />
        </>
      )}
    </PublicLayout>
  )
}
