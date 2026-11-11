import { PulseDiscovery } from '@/features/public/components/PulseDiscovery'

export function HomePage({ onLogin }: { onLogin?: () => void }) {
  return <PulseDiscovery onLogin={onLogin} />
}
