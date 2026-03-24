export type CampaignChannel = 'email' | 'whatsapp' | 'sms' | 'push'
export type CampaignRunStatus = 'pending' | 'resolving' | 'sending' | 'paused' | 'completed' | 'failed' | 'cancelled'
export type CampaignDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped' | 'cancelled'
export type AudienceJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface CampaignEventOption {
  id: string
  name: string
  starts_at: string
  status?: string | null
}

export interface AudienceSegmentRules {
  purchased_event_id?: string | null
  attended_event_id?: string | null
  bought_not_attended_event_id?: string | null
  min_total_revenue?: number | null
  inactive_days?: number | null
  min_orders?: number | null
  city?: string | null
  state?: string | null
  tag?: string | null
  min_average_ticket?: number | null
  max_average_ticket?: number | null
}

export interface AudienceSegmentRow {
  id: string
  organization_id: string
  name: string
  description?: string | null
  filter_definition: AudienceSegmentRules
  audience_count: number
  last_previewed_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface CampaignAudienceCustomerRow {
  id: string
  customer_record_id: string
  full_name: string
  email: string
  phone?: string | null
  city?: string | null
  state?: string | null
  tags: string[]
  total_orders: number
  total_revenue: number
  average_ticket: number
  last_order_at?: string | null
  attended_events_count: number
  no_show_count: number
  matched_events: string[]
}

export interface CampaignAudienceCustomerRowInternal extends CampaignAudienceCustomerRow {
  attended_events: string[]
  no_show_events: string[]
}

export interface CampaignAudiencePreview {
  audience_count: number
  total_revenue: number
  average_ticket: number
  high_value_customers: number
  no_show_customers: number
  sample_customers: CampaignAudienceCustomerRow[]
}

export interface CampaignDraftRow {
  id: string
  organization_id: string
  segment_id?: string | null
  event_id?: string | null
  name: string
  channel: CampaignChannel
  status: string
  subject?: string | null
  message_body?: string | null
  audience_count: number
  scheduled_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  segment?: {
    id: string
    name: string
  } | null
  event?: {
    id: string
    name: string
  } | null
}

export interface CampaignRunSummary {
  audience_count: number
  pending_count: number
  sent_count: number
  delivered_count: number
  failed_count: number
  skipped_count: number
  cancelled_count: number
  processed_count: number
  progress_percentage: number
}

export interface CampaignRunRow {
  id: string
  organization_id: string
  campaign_draft_id?: string | null
  segment_id?: string | null
  event_id?: string | null
  name: string
  channel: CampaignChannel
  status: CampaignRunStatus
  audience_count: number
  sent_count: number
  delivered_count: number
  failed_count: number
  skipped_count: number
  started_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  summary: CampaignRunSummary
  draft?: {
    id: string
    name: string
  } | null
  segment?: {
    id: string
    name: string
  } | null
  event?: {
    id: string
    name: string
  } | null
}

export interface CampaignDeliveryRow {
  id: string
  organization_id: string
  campaign_run_id: string
  customer_id?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  status: CampaignDeliveryStatus
  error_message?: string | null
  provider_message_id?: string | null
  payload_snapshot?: Record<string, unknown> | null
  sent_at?: string | null
  delivered_at?: string | null
  failed_at?: string | null
  created_at: string
  updated_at: string
  customer?: {
    id: string
    full_name: string
    email: string
  } | null
}

export interface AudienceResolutionJobRow {
  id: string
  organization_id: string
  segment_id?: string | null
  campaign_run_id?: string | null
  status: AudienceJobStatus
  input_snapshot: Record<string, unknown>
  result_count: number
  started_at?: string | null
  completed_at?: string | null
  error_message?: string | null
  created_at: string
  updated_at: string
}

export interface CampaignRunDetail {
  run: CampaignRunRow | null
  audience_job: AudienceResolutionJobRow | null
  deliveries: CampaignDeliveryRow[]
  summary: CampaignRunSummary
}

export interface CampaignsOverviewSummary {
  saved_segments: number
  draft_campaigns: number
  active_runs: number
  addressable_customers: number
  high_value_customers: number
}

export interface CampaignsOverview {
  events: CampaignEventOption[]
  segments: AudienceSegmentRow[]
  drafts: CampaignDraftRow[]
  runs: CampaignRunRow[]
  summary: CampaignsOverviewSummary
}

export interface AudienceSegmentFormValues {
  name: string
  description: string
  purchased_event_id: string
  attended_event_id: string
  bought_not_attended_event_id: string
  min_total_revenue: string
  inactive_days: string
  min_orders: string
  city: string
  state: string
  tag: string
  min_average_ticket: string
  max_average_ticket: string
}

export interface UpsertAudienceSegmentInput {
  organizationId: string
  segmentId?: string
  createdBy?: string | null
  values: AudienceSegmentFormValues
}

export interface CampaignDraftFormValues {
  name: string
  segment_id: string
  event_id: string
  channel: CampaignChannel
  subject: string
  message_body: string
  scheduled_at: string
}

export interface UpsertCampaignDraftInput {
  organizationId: string
  draftId?: string
  createdBy?: string | null
  values: CampaignDraftFormValues
}

export interface LaunchCampaignInput {
  organizationId: string
  draftId: string
  launchedBy?: string | null
}

export interface CampaignRunActionInput {
  organizationId: string
  runId: string
}
