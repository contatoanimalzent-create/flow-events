import { EventsDiscoveryPage } from '@/features/public'

export function EventsCatalogPage({ onLogin }: { onLogin: () => void }) {
  return <EventsDiscoveryPage onLogin={onLogin} />
}
