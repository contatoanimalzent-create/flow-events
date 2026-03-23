import { supabase } from '@/lib/supabase'
import type { EventEditorRecord, EventFormData, EventRow, EventStatus } from '@/features/events/types'
import { assertEventsResult, EventsServiceError } from './events.errors'
import { buildCreateEventPayload, buildDuplicateEventPayload, buildEventPayload, EVENT_LIST_SELECT } from './events.payloads'

export const eventsService = {
  async listEvents(organizationId: string): Promise<EventRow[]> {
    const result = await supabase
      .from('events')
      .select(EVENT_LIST_SELECT)
      .eq('organization_id', organizationId)
      .order('starts_at', { ascending: true })

    assertEventsResult(result)
    return result.data ?? []
  },

  async getEventById(eventId: string): Promise<EventEditorRecord | null> {
    const result = await supabase.from('events').select('*').eq('id', eventId).single()
    assertEventsResult(result)
    return (result.data as EventEditorRecord | null) ?? null
  },

  async createEvent(organizationId: string, form: EventFormData) {
    const result = await supabase.from('events').insert(buildCreateEventPayload(form, organizationId))
    assertEventsResult(result)
  },

  async updateEvent(eventId: string, form: EventFormData) {
    const result = await supabase.from('events').update(buildEventPayload(form)).eq('id', eventId)
    assertEventsResult(result)
  },

  async deleteEvent(eventId: string) {
    const result = await supabase.from('events').delete().eq('id', eventId)
    assertEventsResult(result)
  },

  async duplicateEvent(event: EventRow, organizationId: string) {
    const result = await supabase.from('events').insert(buildDuplicateEventPayload(event, organizationId))
    assertEventsResult(result)
  },

  async togglePublishEvent(eventId: string, currentStatus: EventStatus) {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    const result = await supabase.from('events').update({ status: nextStatus }).eq('id', eventId)
    assertEventsResult(result)
  },

  async uploadEventCover(organizationId: string, file: File): Promise<string> {
    const extension = file.name.split('.').pop()
    const path = `${organizationId}/${Date.now()}.${extension}`
    const result = await supabase.storage.from('event-covers').upload(path, file, { upsert: true })

    if (result.error || !result.data) {
      throw new EventsServiceError('N\u00e3o foi poss\u00edvel enviar a capa do evento', 'event_cover_upload_failed')
    }

    const { data } = supabase.storage.from('event-covers').getPublicUrl(result.data.path)
    return data.publicUrl
  },
}
