import { supabase } from '@/lib/supabase'
import { buildEventMediaPresentation } from '@/features/event-media'
import type { EventAsset, TicketBatch, TicketType } from '@/lib/supabase'
import { filterExampleEvents, isExampleEvent } from '@/shared/lib/example-events'
import type { PublicEventDetail, PublicEventRecord, PublicEventSummary, PublicTicketType } from '@/features/public/types/public.types'

const PUBLIC_EVENT_STATUSES = ['published', 'ongoing']

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

async function listActiveAssets(eventIds: string[]) {
  if (eventIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('event_assets')
    .select('*')
    .in('event_id', eventIds)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export const publicEventsService = {
  async listPublicEvents(): Promise<PublicEventSummary[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .in('status', PUBLIC_EVENT_STATUSES)
      .order('starts_at', { ascending: true })

    if (error) {
      throw error
    }

    const eventRows = filterExampleEvents((events ?? []) as PublicEventRecord[])

    if (eventRows.length === 0) {
      return []
    }

    const eventIds = eventRows.map((event) => event.id)

    const [{ data: batches, error: batchError }, assets] = await Promise.all([
      supabase
        .from('ticket_batches')
        .select('*')
        .in('event_id', eventIds)
        .eq('is_active', true)
        .order('position', { ascending: true }),
      listActiveAssets(eventIds),
    ])

    if (batchError) {
      throw batchError
    }

    return eventRows.map((event) =>
      mapEventSummary(
        event,
        assets.filter((asset) => asset.event_id === event.id),
        (batches ?? []).filter((batch) => batch.event_id === event.id),
      ),
    )
  },

  async getPublicEventDetail(slug: string): Promise<PublicEventDetail | null> {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }

      throw error
    }

    const eventRecord = event as PublicEventRecord

    if (isExampleEvent(eventRecord)) {
      return null
    }

    const [{ data: ticketTypes, error: ticketTypesError }, { data: batches, error: batchesError }, assets] = await Promise.all([
      supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventRecord.id)
        .eq('is_active', true)
        .order('position', { ascending: true }),
      supabase
        .from('ticket_batches')
        .select('*')
        .eq('event_id', eventRecord.id)
        .order('position', { ascending: true }),
      listActiveAssets([eventRecord.id]),
    ])

    if (ticketTypesError) {
      throw ticketTypesError
    }

    if (batchesError) {
      throw batchesError
    }

    const mergedTicketTypes: PublicTicketType[] = ((ticketTypes ?? []) as TicketType[]).map((ticketType) => ({
      ...ticketType,
      batches: ((batches ?? []) as TicketBatch[]).filter((batch) => batch.ticket_type_id === ticketType.id),
    }))

    return {
      event: eventRecord,
      ticketTypes: mergedTicketTypes,
      assets,
      mediaPresentation: buildEventMediaPresentation(assets, eventRecord),
    }
  },
}
