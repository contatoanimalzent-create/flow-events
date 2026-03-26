export type EventStatus =
  | 'draft'
  | 'review'
  | 'published'
  | 'ongoing'
  | 'finished'
  | 'archived'
  | 'cancelled'

export interface EventRow {
  id: string
  name: string
  slug: string
  subtitle?: string
  category?: string
  status: EventStatus
  starts_at: string
  ends_at?: string
  venue_name?: string
  venue_address?: Record<string, string>
  total_capacity?: number
  sold_tickets: number
  cover_url?: string
  fee_type: 'fixed' | 'percentage'
  fee_value: number
  absorb_fee: boolean
  created_at: string
}

export interface EventEditorRecord extends EventRow {
  short_description?: string
  doors_open_at?: string
  age_rating?: string
  dress_code?: string
  is_online?: boolean
  online_url?: string
  settings?: {
    video_url?: string
  }
}

export interface EventFormData {
  name: string
  subtitle: string
  category: string
  short_description: string
  starts_at: string
  ends_at: string
  doors_open_at: string
  venue_name: string
  venue_street: string
  venue_city: string
  venue_state: string
  total_capacity: string
  age_rating: string
  dress_code: string
  is_online: boolean
  online_url: string
  cover_url: string
  video_url: string
  fee_type: 'fixed' | 'percentage'
  fee_value: string
  absorb_fee: boolean
}

export type EventListFilter = 'all' | EventStatus

export type EventViewMode = 'grid' | 'list'

export interface EventStatusConfig {
  label: string
  dot: string
  text: string
}
