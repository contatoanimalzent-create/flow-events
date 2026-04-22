import type { AppMode } from '../context/app-context.types'

export interface UserEvent {
  id: string
  name: string
  slug: string
  start_date: string
  end_date: string | null
  status: string
  venue_name: string | null
  cover_url: string | null
  organization_id: string
  availableModes: AppMode[]
}
