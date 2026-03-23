import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { EventEditorRecord, EventFormData, EventRow, EventStatus } from '@/features/events/types'

const EVENT_LIST_SELECT =
  'id,name,slug,subtitle,category,status,starts_at,ends_at,venue_name,venue_address,total_capacity,sold_tickets,cover_url,created_at'

function buildEventPayload(form: EventFormData) {
  return {
    name: form.name.trim(),
    subtitle: form.subtitle || null,
    category: form.category || null,
    short_description: form.short_description || null,
    starts_at: form.starts_at,
    ends_at: form.ends_at || null,
    doors_open_at: form.doors_open_at || null,
    venue_name: form.venue_name || null,
    venue_address:
      form.venue_city || form.venue_street
        ? {
            street: form.venue_street,
            city: form.venue_city,
            state: form.venue_state,
            country: 'Brasil',
          }
        : null,
    total_capacity: form.total_capacity ? parseInt(form.total_capacity) : null,
    age_rating: form.age_rating,
    dress_code: form.dress_code || null,
    is_online: form.is_online,
    online_url: form.is_online ? form.online_url : null,
    cover_url: form.cover_url || null,
    settings: form.video_url ? { video_url: form.video_url } : {},
  }
}

export const eventsService = {
  async listEvents(organizationId: string): Promise<EventRow[]> {
    const { data } = await supabase
      .from('events')
      .select(EVENT_LIST_SELECT)
      .eq('organization_id', organizationId)
      .order('starts_at', { ascending: true })

    return data ?? []
  },

  async getEventById(eventId: string): Promise<EventEditorRecord | null> {
    const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
    return (data as EventEditorRecord | null) ?? null
  },

  async createEvent(organizationId: string, form: EventFormData) {
    const payload = buildEventPayload(form)

    const { error } = await supabase.from('events').insert({
      ...payload,
      slug: slugify(form.name),
      organization_id: organizationId,
      status: 'draft',
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  async updateEvent(eventId: string, form: EventFormData) {
    const payload = buildEventPayload(form)
    const { error } = await supabase.from('events').update(payload).eq('id', eventId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async deleteEvent(eventId: string) {
    const { error } = await supabase.from('events').delete().eq('id', eventId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async duplicateEvent(event: EventRow, organizationId: string) {
    const { error } = await supabase.from('events').insert({
      organization_id: organizationId,
      name: `${event.name} (cÃ³pia)`,
      slug: `${event.slug}-copia-${Date.now()}`,
      subtitle: event.subtitle,
      category: event.category,
      status: 'draft',
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      total_capacity: event.total_capacity,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  async togglePublishEvent(eventId: string, currentStatus: EventStatus) {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    const { error } = await supabase.from('events').update({ status: nextStatus }).eq('id', eventId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async uploadEventCover(organizationId: string, file: File): Promise<string | null> {
    const extension = file.name.split('.').pop()
    const path = `${organizationId}/${Date.now()}.${extension}`
    const { data, error } = await supabase.storage
      .from('event-covers')
      .upload(path, file, { upsert: true })

    if (error || !data) {
      return null
    }

    const { data: publicData } = supabase.storage.from('event-covers').getPublicUrl(data.path)
    return publicData.publicUrl
  },
}
