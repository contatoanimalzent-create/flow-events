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
  event_code?: string
}

export interface EventEmailTheme {
  accent_color?: string
  bg_color?: string
  text_color?: string
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
    email_theme?: EventEmailTheme
  }
  is_private?: boolean
  access_password?: string | null
  waitlist_enabled?: boolean
  max_tickets_per_order?: number | null
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
  email_accent_color: string
  email_bg_color: string
  email_text_color: string
  is_private: boolean
  access_password: string
  waitlist_enabled: boolean
  max_tickets_per_order: string
}

export type EventListFilter = 'all' | EventStatus

export type EventViewMode = 'grid' | 'list'

export interface EventStatusConfig {
  label: string
  dot: string
  text: string
}
