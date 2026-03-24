import type {
  AudienceSegmentFormValues,
  AudienceSegmentRow,
  AudienceSegmentRules,
  CampaignDraftFormValues,
  CampaignDraftRow,
} from '@/features/campaigns/types'

function nowIso() {
  return new Date().toISOString()
}

function normalizeText(value: string) {
  return value.trim()
}

function toNumberOrNull(value: string) {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function toNullableText(value: string) {
  const normalized = normalizeText(value)
  return normalized || null
}

export function buildAudienceSegmentRules(values: AudienceSegmentFormValues): AudienceSegmentRules {
  return {
    purchased_event_id: toNullableText(values.purchased_event_id),
    attended_event_id: toNullableText(values.attended_event_id),
    bought_not_attended_event_id: toNullableText(values.bought_not_attended_event_id),
    min_total_revenue: toNumberOrNull(values.min_total_revenue),
    inactive_days: toNumberOrNull(values.inactive_days),
    min_orders: toNumberOrNull(values.min_orders),
    city: toNullableText(values.city),
    state: toNullableText(values.state),
    tag: toNullableText(values.tag),
    min_average_ticket: toNumberOrNull(values.min_average_ticket),
    max_average_ticket: toNumberOrNull(values.max_average_ticket),
  }
}

export function buildAudienceSegmentPayload(
  values: AudienceSegmentFormValues,
  organizationId: string,
  audienceCount: number,
  createdBy?: string | null,
) {
  return {
    organization_id: organizationId,
    name: normalizeText(values.name),
    description: toNullableText(values.description),
    filter_definition: buildAudienceSegmentRules(values),
    audience_count: audienceCount,
    last_previewed_at: nowIso(),
    created_by: createdBy ?? null,
  }
}

export function mapAudienceSegmentRow(row: Record<string, unknown>): AudienceSegmentRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name ?? ''),
    description: (row.description as string | null | undefined) ?? null,
    filter_definition: (row.filter_definition as AudienceSegmentRules | null | undefined) ?? {},
    audience_count: Number(row.audience_count ?? 0),
    last_previewed_at: (row.last_previewed_at as string | null | undefined) ?? null,
    created_by: (row.created_by as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function buildCampaignDraftPayload(
  values: CampaignDraftFormValues,
  organizationId: string,
  audienceCount: number,
  createdBy?: string | null,
) {
  return {
    organization_id: organizationId,
    segment_id: toNullableText(values.segment_id),
    event_id: toNullableText(values.event_id),
    name: normalizeText(values.name),
    channel: values.channel,
    status: 'draft',
    subject: toNullableText(values.subject),
    message_body: toNullableText(values.message_body),
    audience_count: audienceCount,
    scheduled_at: toNullableText(values.scheduled_at),
    created_by: createdBy ?? null,
  }
}

export function mapCampaignDraftRow(row: Record<string, unknown>): CampaignDraftRow {
  const segment = row.segment as Record<string, unknown> | null | undefined
  const event = row.event as Record<string, unknown> | null | undefined

  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    segment_id: (row.segment_id as string | null | undefined) ?? null,
    event_id: (row.event_id as string | null | undefined) ?? null,
    name: String(row.name ?? ''),
    channel: (row.channel as CampaignDraftRow['channel']) ?? 'email',
    status: String(row.status ?? 'draft'),
    subject: (row.subject as string | null | undefined) ?? null,
    message_body: (row.message_body as string | null | undefined) ?? null,
    audience_count: Number(row.audience_count ?? 0),
    scheduled_at: (row.scheduled_at as string | null | undefined) ?? null,
    created_by: (row.created_by as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
    segment: segment ? { id: String(segment.id ?? ''), name: String(segment.name ?? '') } : null,
    event: event ? { id: String(event.id ?? ''), name: String(event.name ?? '') } : null,
  }
}
