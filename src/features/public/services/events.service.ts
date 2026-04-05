import { buildEventMediaPresentation } from '@/features/event-media'
import type { EventAsset, TicketBatch } from '@/lib/supabase'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type { PublicEventRecord, PublicEventSummary } from '@/features/public/types/public.types'

const PUBLIC_EVENT_STATUSES = ['published', 'ongoing'] as const

export interface EventsListFilters {
  date?: string
  location?: string
}

function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

function normalizeValue(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function toDayKey(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString().slice(0, 10)
}

function matchesFilters(event: PublicEventSummary, filters: EventsListFilters) {
  if (filters.date) {
    const filterDay = toDayKey(filters.date)
    const eventDay = toDayKey(event.starts_at)

    if (filterDay && eventDay !== filterDay) {
      return false
    }
  }

  if (filters.location) {
    const needle = normalizeValue(filters.location)
    const haystack = normalizeValue([event.venue_name, event.city, event.state].filter(Boolean).join(' '))

    if (needle && !haystack.includes(needle)) {
      return false
    }
  }

  return true
}

async function fetchCollection<T>(table: string, query: URLSearchParams) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
    },
  })

  const rawBody = await response.text()
  let payload: unknown = null

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = rawBody
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : typeof payload === 'object' && payload !== null && 'error_description' in payload && typeof payload.error_description === 'string'
          ? payload.error_description
          : typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : typeof payload === 'string'
              ? payload
            : `Unable to fetch ${table}`

    throw new Error(message)
  }

  return Array.isArray(payload) ? (payload as T[]) : []
}

function mapEventSummary(event: PublicEventRecord, assets: EventAsset[], batches: TicketBatch[]): PublicEventSummary {
  const mediaPresentation = buildEventMediaPresentation(assets, event)
  const activeBatches = batches.filter((batch) => batch.is_active && batch.is_visible && batch.price >= 0)
  const prices = activeBatches.map((batch) => batch.price).filter((price) => price > 0)

  return {
    ...event,
    mediaPresentation,
    minPrice: prices.length > 0 ? Math.min(...prices) : event.is_free ? 0 : null,
    city: event.venue_address?.city ?? '',
    state: event.venue_address?.state ?? '',
  }
}

export const eventsService = {
  async list(filters: EventsListFilters = {}): Promise<PublicEventSummary[]> {
    const eventsQuery = new URLSearchParams({
      select: '*',
      status: `in.(${PUBLIC_EVENT_STATUSES.join(',')})`,
      order: 'starts_at.asc',
    })

    const events = await fetchCollection<PublicEventRecord>('events', eventsQuery)
    const eventRows = filterExampleEvents(events)

    if (eventRows.length === 0) {
      return []
    }

    const eventIds = eventRows.map((event) => event.id)
    const inFilter = `in.(${eventIds.join(',')})`

    const batchesQuery = new URLSearchParams({
      select: '*',
      event_id: inFilter,
      is_active: 'eq.true',
      order: 'position.asc',
    })

    const assetsQuery = new URLSearchParams({
      select: '*',
      event_id: inFilter,
      is_active: 'eq.true',
      order: 'sort_order.asc',
    })

    const [batches, assets] = await Promise.all([
      fetchCollection<TicketBatch>('ticket_batches', batchesQuery),
      fetchCollection<EventAsset>('event_assets', assetsQuery),
    ])

    return eventRows
      .map((event) =>
        mapEventSummary(
          event,
          assets.filter((asset) => asset.event_id === event.id),
          batches.filter((batch) => batch.event_id === event.id),
        ),
      )
      .filter((event) => matchesFilters(event, filters))
  },
}
