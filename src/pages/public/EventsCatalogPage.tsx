import { EventsDiscoveryPage, usePublicEvents } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

export function EventsCatalogPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  useSeoMeta({
    title: isPortuguese ? 'Experiencias | Animalz Events' : 'Experiences | Animalz Events',
    description: isPortuguese
      ? 'Descubra eventos premium em uma navegacao pensada como curadoria, nao como lista tecnica.'
      : 'Discover premium events through navigation built as curation, not as a technical list.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/events',
  })

  return (
    <>
      <EventsDiscoveryPage onLogin={onLogin} />
    </>
  )
}
