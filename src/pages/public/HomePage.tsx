import { useEffect, useMemo, useState } from 'react'
import { SocialProofBlock } from '@/features/growth'
import { LoadingState } from '@/shared/components'
import {
  ConversionCTASection,
  DiscoverSection,
  EditorialIntroSection,
  ExperienceVisualSection,
  FeaturedEventsSection,
  HomeHeroCinematic,
  PublicLayout,
  usePublicEvents,
} from '@/features/public'
import { useSeoMeta } from '@/shared/lib'

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const [scrollY, setScrollY] = useState(0)
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )

  const featuredEvents = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets).slice(0, 3),
    [events],
  )

  const discoverEvents = useMemo(() => {
    const featuredIds = new Set(featuredEvents.map((event) => event.id))
    return events.filter((event) => !featuredIds.has(event.id)).slice(0, 4)
  }, [events, featuredEvents])

  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category).filter(Boolean)))
        .slice(0, 6)
        .map((category) => String(category)),
    [events],
  )

  const stats = useMemo(() => {
    const cityCount = new Set(events.map((event) => event.city).filter(Boolean)).size

    return [
      {
        label: 'Participantes',
        value: events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString('pt-BR'),
      },
      { label: 'Eventos ativos', value: String(events.length) },
      { label: 'Cidades', value: String(cityCount) },
      {
        label: 'Vagas disponiveis',
        value: events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0).toLocaleString('pt-BR'),
      },
    ]
  }, [events])

  const seoImage = heroEvent?.mediaPresentation.heroAsset?.thumbnail_url ?? heroEvent?.mediaPresentation.coverAsset?.secure_url ?? heroEvent?.cover_url ?? null

  useSeoMeta({
    title: 'Animalz Events | Ingressos para eventos premium',
    description: 'Descubra e compre ingressos para os melhores eventos de cultura, gastronomia, musica e lifestyle.',
    image: seoImage,
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <HomeHeroCinematic heroEvent={heroEvent} scrollY={scrollY} stats={stats} onLogin={onLogin} />

      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title="Carregando eventos"
              description="Buscando os melhores eventos para voce."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <>
          <EditorialIntroSection />
          <SocialProofBlock
            title="Eventos reais. Experiencias que ficam na memoria."
            description="Numeros que refletem a confianca de quem ja comprou, participou e voltou."
            items={[
              {
                label: 'Participantes',
                value: events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString('pt-BR'),
                note: 'Pessoas que ja garantiram seu ingresso e viveram a experiencia.',
              },
              {
                label: 'Eventos ativos',
                value: events.length.toLocaleString('pt-BR'),
                note: 'Eventos publicados e disponiveis para compra ou inscricao gratuita.',
              },
              {
                label: 'Vagas disponiveis',
                value: events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0).toLocaleString('pt-BR'),
                note: 'Capacidade total em eventos abertos — reserve antes que esgote.',
              },
            ]}
          />
          <FeaturedEventsSection events={featuredEvents} />
          <ExperienceVisualSection events={featuredEvents} />
          <DiscoverSection events={discoverEvents} categories={categories} />
          <ConversionCTASection onLogin={onLogin} />
        </>
      )}
    </PublicLayout>
  )
}
