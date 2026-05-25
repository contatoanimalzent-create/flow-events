import type { AppMode } from '../context/app-context.types'

export interface UserEvent {
  id: string
  name: string
  slug: string
  starts_at: string
  ends_at: string | null
  status: string
  venue_name: string | null
  cover_url: string | null
  organization_id: string
  availableModes: AppMode[]
}
