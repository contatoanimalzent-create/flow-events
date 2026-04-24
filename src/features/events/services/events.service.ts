import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents, isExampleEvent } from '@/shared/lib/example-events'
import type { EventEditorRecord, EventFormData, EventRow, EventStatus } from '@/features/events/types'
import { assertEventsResult, EventsServiceError } from './events.errors'
import { buildCreateEventPayload, buildDuplicateEventPayload, buildEventPayload, EVENT_LIST_SELECT } from './events.payloads'

const eventsApi = createApiClient('events')

export const eventsService = {
  async listEvents(organizationId: string): Promise<EventRow[]> {
    return eventsApi.request('list_events', async () => {
      const result = await supabase
        .from('events')
        .select(EVENT_LIST_SELECT)
        .eq('organization_id', organizationId)
        .order('starts_at', { ascending: true })

      assertEventsResult(result)
      return filterExampleEvents((result.data ?? []) as EventRow[])
    }, { organizationId })
  },

  async getEventById(eventId: string): Promise<EventEditorRecord | null> {
    return eventsApi.request('get_event_by_id', async () => {
      const result = await supabase.from('events').select('*').eq('id', eventId).single()
      assertEventsResult(result)
      const event = (result.data as EventEditorRecord | null) ?? null
      return isExampleEvent(event) ? null : event
    }, { eventId })
  },

  async createEvent(organizationId: string, form: EventFormData) {
    return eventsApi.request('create_event', async () => {
      const result = await supabase.from('events').insert(buildCreateEventPayload(form, organizationId))
      assertEventsResult(result)
    }, { organizationId })
  },

  async updateEvent(eventId: string, form: EventFormData) {
    return eventsApi.request('update_event', async () => {
      const result = await supabase.from('events').update(buildEventPayload(form)).eq('id', eventId)
      assertEventsResult(result)
    }, { eventId })
  },

  async deleteEvent(eventId: string) {
    return eventsApi.request('delete_event', async () => {
      const result = await supabase.from('events').delete().eq('id', eventId)
      assertEventsResult(result)
    }, { eventId })
  },

  async duplicateEvent(event: EventRow, organizationId: string) {
    return eventsApi.request('duplicate_event', async () => {
      const result = await supabase.from('events').insert(buildDuplicateEventPayload(event, organizationId))
      assertEventsResult(result)
    }, { organizationId, eventId: event.id })
  },

  async togglePublishEvent(eventId: string, currentStatus: EventStatus) {
    return eventsApi.request('toggle_publish_event', async () => {
      const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
      const result = await supabase.from('events').update({ status: nextStatus }).eq('id', eventId)
      assertEventsResult(result)
    }, { eventId, currentStatus })
  },

  async uploadEventCover(organizationId: string, file: File): Promise<string> {
    return eventsApi.request('upload_event_cover', async () => {
      const extension = file.name.split('.').pop()
      const path = `${organizationId}/${Date.now()}.${extension}`
      const result = await supabase.storage.from('event-covers').upload(path, file, { upsert: true })

      if (result.error || !result.data) {
        throw new EventsServiceError('Não foi possível enviar a capa do evento', 'event_cover_upload_failed')
      }

      const { data } = supabase.storage.from('event-covers').getPublicUrl(result.data.path)
      return data.publicUrl
    }, { organizationId, fileName: file.name })
  },
}
