import { PulseDiscovery } from '@/features/public/components/PulseDiscovery'

export function EventsCatalogPage({ onLogin }: { onLogin: () => void }) {
  return <PulseDiscovery onLogin={onLogin} catalog />
}
