import type { EventAsset, TicketBatch, TicketType } from '@/lib/supabase'
import type { EventMediaPresentation } from '@/features/event-media'

export interface PublicEventRecord {
  id: string
  organization_id: string
  slug: string
  name: string
  subtitle: string
  short_description: string
  full_description: string
  category: string
  starts_at: string
  ends_at: string
  doors_open_at: string
  venue_name: string
  venue_address: Record<string, string>
  total_capacity: number
  sold_tickets: number
  checked_in_count: number
  age_rating: string
  cover_url?: string | null
  settings: Record<string, unknown>
  is_free: boolean
  registration_mode: 'tickets' | 'registration' | 'both'
  fee_type: 'fixed' | 'percentage'
  fee_value: number
  absorb_fee: boolean
  status: string
}

export interface PublicTicketType extends TicketType {
  batches: TicketBatch[]
}

export interface PublicEventSummary extends PublicEventRecord {
  mediaPresentation: EventMediaPresentation
  minPrice: number | null
  city: string
  state: string
}

export interface PublicEventDetail {
  event: PublicEventRecord
  ticketTypes: PublicTicketType[]
  assets: EventAsset[]
  mediaPresentation: EventMediaPresentation
}
