import type {
  AudienceResolutionJobRow,
  AudienceSegmentFormValues,
  AudienceSegmentRow,
  AudienceSegmentRules,
  CampaignDeliveryRow,
  CampaignDraftFormValues,
  CampaignDraftRow,
  CampaignAudienceCustomerRowInternal,
  CampaignRunRow,
} from '@/features/campaigns/types'
import { calculateCampaignRunSummary, decorateCampaignRun } from './campaigns.calculations'

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

export function mapCampaignDeliveryRow(row: Record<string, unknown>): CampaignDeliveryRow {
  const customer = row.customer as Record<string, unknown> | null | undefined

  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    campaign_run_id: String(row.campaign_run_id ?? ''),
    customer_id: (row.customer_id as string | null | undefined) ?? null,
    recipient_email: (row.recipient_email as string | null | undefined) ?? null,
    recipient_phone: (row.recipient_phone as string | null | undefined) ?? null,
    status: (row.status as CampaignDeliveryRow['status']) ?? 'pending',
    error_message: (row.error_message as string | null | undefined) ?? null,
    provider_message_id: (row.provider_message_id as string | null | undefined) ?? null,
    payload_snapshot: (row.payload_snapshot as Record<string, unknown> | null | undefined) ?? null,
    sent_at: (row.sent_at as string | null | undefined) ?? null,
    delivered_at: (row.delivered_at as string | null | undefined) ?? null,
    failed_at: (row.failed_at as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
    customer: customer
      ? {
          id: String(customer.id ?? ''),
          full_name: String(customer.full_name ?? ''),
          email: String(customer.email ?? ''),
        }
      : null,
  }
}

export function mapAudienceResolutionJobRow(row: Record<string, unknown>): AudienceResolutionJobRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    segment_id: (row.segment_id as string | null | undefined) ?? null,
    campaign_run_id: (row.campaign_run_id as string | null | undefined) ?? null,
    status: (row.status as AudienceResolutionJobRow['status']) ?? 'pending',
    input_snapshot: (row.input_snapshot as Record<string, unknown> | null | undefined) ?? {},
    result_count: Number(row.result_count ?? 0),
    started_at: (row.started_at as string | null | undefined) ?? null,
    completed_at: (row.completed_at as string | null | undefined) ?? null,
    error_message: (row.error_message as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function mapCampaignRunRow(row: Record<string, unknown>, deliveries: CampaignDeliveryRow[] = []): CampaignRunRow {
  const draft = row.draft as Record<string, unknown> | null | undefined
  const segment = row.segment as Record<string, unknown> | null | undefined
  const event = row.event as Record<string, unknown> | null | undefined

  return decorateCampaignRun(
    {
      id: String(row.id),
      organization_id: String(row.organization_id),
      campaign_draft_id: (row.campaign_draft_id as string | null | undefined) ?? null,
      segment_id: (row.segment_id as string | null | undefined) ?? null,
      event_id: (row.event_id as string | null | undefined) ?? null,
      name: String(row.name ?? ''),
      channel: (row.channel as CampaignRunRow['channel']) ?? 'email',
      status: (row.status as CampaignRunRow['status']) ?? 'pending',
      audience_count: Number(row.audience_count ?? 0),
      sent_count: Number(row.sent_count ?? 0),
      delivered_count: Number(row.delivered_count ?? 0),
      failed_count: Number(row.failed_count ?? 0),
      skipped_count: Number(row.skipped_count ?? 0),
      started_at: (row.started_at as string | null | undefined) ?? null,
      completed_at: (row.completed_at as string | null | undefined) ?? null,
      cancelled_at: (row.cancelled_at as string | null | undefined) ?? null,
      created_by: (row.created_by as string | null | undefined) ?? null,
      created_at: String(row.created_at ?? nowIso()),
      updated_at: String(row.updated_at ?? nowIso()),
      draft: draft ? { id: String(draft.id ?? ''), name: String(draft.name ?? '') } : null,
      segment: segment ? { id: String(segment.id ?? ''), name: String(segment.name ?? '') } : null,
      event: event ? { id: String(event.id ?? ''), name: String(event.name ?? '') } : null,
    },
    deliveries,
  )
}

export function buildCampaignRunInsertPayload(params: {
  organizationId: string
  draft: CampaignDraftRow
  launchedBy?: string | null
}) {
  return {
    organization_id: params.organizationId,
    campaign_draft_id: params.draft.id,
    segment_id: params.draft.segment_id ?? null,
    event_id: params.draft.event_id ?? null,
    name: params.draft.name,
    channel: params.draft.channel,
    status: 'resolving',
    audience_count: 0,
    sent_count: 0,
    delivered_count: 0,
    failed_count: 0,
    skipped_count: 0,
    started_at: nowIso(),
    created_by: params.launchedBy ?? null,
  }
}

export function buildAudienceResolutionJobPayload(params: {
  organizationId: string
  segmentId?: string | null
  campaignRunId?: string | null
  draft: CampaignDraftRow
}) {
  return {
    organization_id: params.organizationId,
    segment_id: params.segmentId ?? null,
    campaign_run_id: params.campaignRunId ?? null,
    status: 'running',
    input_snapshot: {
      campaign_draft_id: params.draft.id,
      channel: params.draft.channel,
      segment_id: params.draft.segment_id ?? null,
      event_id: params.draft.event_id ?? null,
      scheduled_at: params.draft.scheduled_at ?? null,
    },
    result_count: 0,
    started_at: nowIso(),
  }
}

export function buildCampaignRecipientPayload(params: {
  organizationId: string
  campaignRunId: string
  customer: CampaignAudienceCustomerRowInternal
  draft: CampaignDraftRow
}) {
  const channel = params.draft.channel
  const email = params.customer.email || null
  const phone = params.customer.phone || null

  let status: CampaignDeliveryRow['status'] = 'pending'
  let errorMessage: string | null = null

  if (channel === 'email' && !email) {
    status = 'skipped'
    errorMessage = 'Cliente sem e-mail valido para envio'
  }

  if ((channel === 'whatsapp' || channel === 'sms') && !phone) {
    status = 'skipped'
    errorMessage = 'Cliente sem telefone valido para o canal selecionado'
  }

  if (channel === 'whatsapp' || channel === 'sms' || channel === 'push') {
    status = 'skipped'
    errorMessage = 'Canal ainda sem provider configurado para execucao'
  }

  return {
    organization_id: params.organizationId,
    campaign_run_id: params.campaignRunId,
    customer_id: params.customer.customer_record_id,
    recipient_email: email,
    recipient_phone: phone,
    status,
    error_message: errorMessage,
    payload_snapshot: {
      customer_name: params.customer.full_name,
      customer_email: email,
      customer_phone: phone,
      campaign_name: params.draft.name,
      campaign_channel: params.draft.channel,
      subject: params.draft.subject ?? null,
      message_body: params.draft.message_body ?? null,
      total_revenue: params.customer.total_revenue,
      total_orders: params.customer.total_orders,
      tags: params.customer.tags,
      matched_events: params.customer.matched_events,
    },
  }
}

export function buildCampaignDeliverySummary(deliveries: CampaignDeliveryRow[], audienceCount = deliveries.length) {
  return calculateCampaignRunSummary(deliveries, audienceCount)
}
