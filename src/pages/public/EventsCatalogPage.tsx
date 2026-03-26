import { EventsDiscoveryPage, usePublicEvents } from '@/features/public'
import { useSeoMeta } from '@/shared/lib'

export function EventsCatalogPage({ onLogin }: { onLogin: () => void }) {
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  useSeoMeta({
    title: 'Experiencias | Animalz Events',
    description: 'Descubra eventos premium em uma navegacao pensada como curadoria, nao como lista tecnica.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/events',
  })

  return (
    <>
      <EventsDiscoveryPage onLogin={onLogin} />
    </>
  )
}
