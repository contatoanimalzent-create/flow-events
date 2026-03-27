import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from '@/shared/components'
import {
  EventChaptersShowcase,
  ExploreMoreSection,
  FeaturedEventsSection,
  HomeHeroCinematic,
  PublicLayout,
  RelatedExperiencesGrid,
  usePublicEvents,
} from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )

  const featuredCollection = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets).slice(0, 5),
    [events],
  )

  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category).filter(Boolean)))
        .slice(0, 8)
        .map((category) => String(category)),
    [events],
  )

  const stats = useMemo(
    () => [
      { label: isPortuguese ? 'Eventos' : 'Events', value: `${events.length}` },
      {
        label: isPortuguese ? 'Participantes' : 'Participants',
        value: `${events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString(isPortuguese ? 'pt-BR' : 'en-US')}`,
      },
      {
        label: isPortuguese ? 'Cidades' : 'Cities',
        value: `${new Set(events.map((event) => event.city).filter(Boolean)).size}`,
      },
    ],
    [events, isPortuguese],
  )

  const seoImage =
    heroEvent?.mediaPresentation.heroAsset?.thumbnail_url ??
    heroEvent?.mediaPresentation.coverAsset?.secure_url ??
    heroEvent?.cover_url ??
    null

  useSeoMeta({
    title: isPortuguese ? 'Animalz Experiences | Premium event discovery' : 'Animalz Experiences | Premium event discovery',
    description: isPortuguese
      ? 'Uma camada de experiencias com hero cinematografico, descoberta editorial e compra premium.'
      : 'An experiences layer with cinematic hero media, editorial discovery and premium purchase flow.',
    image: seoImage,
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title={isPortuguese ? 'Carregando experiencias' : 'Loading experiences'}
              description={
                isPortuguese
                  ? 'Buscando os proximos eventos da plataforma.'
                  : 'Loading the next experiences available on the platform.'
              }
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <>
          <HomeHeroCinematic heroEvent={heroEvent} scrollY={scrollY} stats={stats} />
          <EventChaptersShowcase events={featuredCollection} />
          <FeaturedEventsSection events={featuredCollection} />
          <RelatedExperiencesGrid
            events={featuredCollection}
            title={isPortuguese ? 'Explore recommended chapters' : 'Explore recommended chapters'}
          />
          <ExploreMoreSection currentEventId={heroEvent?.id ?? ''} events={events} />
        </>
      )}
    </PublicLayout>
  )
}
