import { slugify } from '@/shared/lib'
import type { EventFormData, EventRow } from '@/features/events/types'

export const EVENT_LIST_SELECT =
  'id,name,slug,subtitle,category,status,starts_at,ends_at,venue_name,venue_address,total_capacity,sold_tickets,cover_url,fee_type,fee_value,absorb_fee,created_at,event_code'

function toOptionalString(value: string) {
  return value.trim() || null
}

function buildVenueAddress(form: EventFormData) {
  if (!form.venue_city && !form.venue_street) {
    return null
  }

  return {
    street: form.venue_street.trim(),
    city: form.venue_city.trim(),
    state: form.venue_state.trim(),
    country: 'Brasil',
  }
}

export function buildEventPayload(form: EventFormData) {
  return {
    name: form.name.trim(),
    subtitle: toOptionalString(form.subtitle),
    category: toOptionalString(form.category),
    short_description: toOptionalString(form.short_description),
    starts_at: form.starts_at,
    ends_at: toOptionalString(form.ends_at),
    doors_open_at: toOptionalString(form.doors_open_at),
    venue_name: toOptionalString(form.venue_name),
    venue_address: buildVenueAddress(form),
    total_capacity: form.total_capacity ? parseInt(form.total_capacity, 10) : null,
    age_rating: form.age_rating,
    dress_code: toOptionalString(form.dress_code),
    is_online: form.is_online,
    online_url: form.is_online ? toOptionalString(form.online_url) : null,
    cover_url: toOptionalString(form.cover_url),
    fee_type: form.fee_type,
    fee_value: Number(form.fee_value || 0),
    absorb_fee: form.absorb_fee,
    is_private: form.is_private,
    access_password: form.is_private ? toOptionalString(form.access_password) : null,
    waitlist_enabled: form.waitlist_enabled,
    max_tickets_per_order: form.max_tickets_per_order ? parseInt(form.max_tickets_per_order, 10) : null,
    settings: {
      ...(form.video_url ? { video_url: form.video_url.trim() } : {}),
      email_theme: {
        accent_color: form.email_accent_color || '#0057E7',
        bg_color: form.email_bg_color || '#0A0A0A',
        text_color: form.email_text_color || '#FFFFFF',
      },
    },
  }
}

export function buildCreateEventPayload(form: EventFormData, organizationId: string) {
  return {
    ...buildEventPayload(form),
    slug: slugify(form.name),
    organization_id: organizationId,
    status: 'draft',
  }
}

export function buildDuplicateEventPayload(event: EventRow, organizationId: string) {
  return {
    organization_id: organizationId,
    name: `${event.name} (c\u00f3pia)`,
    slug: `${event.slug}-copia-${Date.now()}`,
    subtitle: event.subtitle,
    category: event.category,
    status: 'draft',
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    venue_name: event.venue_name,
    venue_address: event.venue_address,
    total_capacity: event.total_capacity,
    fee_type: event.fee_type,
    fee_value: event.fee_value,
    absorb_fee: event.absorb_fee,
  }
}
