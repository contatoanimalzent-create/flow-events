import { useEffect, useMemo, useState } from 'react'
import { ExitLeadCaptureDialog, SocialProofBlock } from '@/features/growth'
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
        label: 'Participantes em jornada',
        value: events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString('pt-BR'),
      },
      { label: 'Experiencias publicas', value: String(events.length) },
      { label: 'Cidades em curadoria', value: String(cityCount) },
      {
        label: 'Capacidade combinada',
        value: events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0).toLocaleString('pt-BR'),
      },
    ]
  }, [events])

  const seoImage = heroEvent?.mediaPresentation.heroAsset?.thumbnail_url ?? heroEvent?.mediaPresentation.coverAsset?.secure_url ?? heroEvent?.cover_url ?? null

  useSeoMeta({
    title: 'Animalz Events | Premium experiences ecosystem',
    description: 'Descubra experiencias premium, cultura e lifestyle em uma camada que une narrativa publica, operacao, monetizacao e crescimento.',
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
              title="Preparando a curadoria publica"
              description="Estamos carregando as experiencias, seus assets e os sinais que sustentam a narrativa premium da homepage."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <>
          <EditorialIntroSection />
          <SocialProofBlock
            title="A prova do produto aparece na demanda, nao em promessas vazias."
            description="Participantes, experiencias ativas e capacidade real mostram que a plataforma sustenta descoberta, conversao e operacao em escala."
            items={[
              {
                label: 'Participantes',
                value: events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString('pt-BR'),
                note: 'Pessoas que ja entraram em jornadas reais apoiadas pela base do produto.',
              },
              {
                label: 'Eventos ativos',
                value: events.length.toLocaleString('pt-BR'),
                note: 'Curadoria viva para alimentar descoberta, social proof e compartilhamento organico.',
              },
              {
                label: 'Capacidade aberta',
                value: events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0).toLocaleString('pt-BR'),
                note: 'Escala suficiente para parecer plataforma global, nao um catalogo pequeno.',
              },
            ]}
          />
          <FeaturedEventsSection events={featuredEvents} />
          <ExperienceVisualSection events={featuredEvents} />
          <DiscoverSection events={discoverEvents} categories={categories} />
          <ConversionCTASection onLogin={onLogin} />
        </>
      )}
      <ExitLeadCaptureDialog source="public_home_exit" />
    </PublicLayout>
  )
}
