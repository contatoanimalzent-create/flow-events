import type { AppMode } from '@/core/context/app-context.types'

export function buildModeFromPath(path: string): AppMode | null {
  if (path.includes('/operator')) return 'operator'
  if (path.includes('/staff')) return 'staff'
  if (path.includes('/supervisor')) return 'supervisor'
  if (path.includes('/attendee')) return 'attendee'
  if (path.includes('/promoter')) return 'promoter'
  return null
}

/** Props shared by every page rendered inside PulseApp */
export interface PulsePageProps {
  onNavigate: (path: string) => void
}
