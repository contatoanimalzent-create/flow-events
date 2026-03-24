import type {
  AudienceSegmentRules,
  CampaignAudienceCustomerRow,
  CampaignAudienceCustomerRowInternal,
  CampaignAudiencePreview,
  CampaignDeliveryRow,
  CampaignDraftRow,
  CampaignEventOption,
  CampaignRunRow,
  CampaignRunSummary,
  CampaignsOverview,
  AudienceSegmentRow,
} from '@/features/campaigns/types'

interface StoredCustomerRecord {
  id: string
  full_name: string
  email: string
  phone?: string | null
  city?: string | null
  state?: string | null
  tags: string[]
  total_orders: number
  total_spent: number
  last_order_at?: string | null
}

interface StoredCustomerEventProfile {
  customer_id: string
  event_id: string
  attended_count: number
  no_show_count: number
  net_revenue: number
}

function toTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function normalizeText(value?: string | null) {
  return String(value ?? '').trim().toLowerCase()
}

function averageTicket(customer: StoredCustomerRecord) {
  return customer.total_orders > 0 ? Number((customer.total_spent / customer.total_orders).toFixed(2)) : 0
}

function customerMatchesRules(customer: CampaignAudienceCustomerRowInternal, rules: AudienceSegmentRules) {
  if (rules.purchased_event_id && !customer.matched_events.includes(rules.purchased_event_id)) {
    return false
  }

  if (rules.attended_event_id && !customer.attended_events.includes(rules.attended_event_id)) {
    return false
  }

  if (rules.bought_not_attended_event_id && !customer.no_show_events.includes(rules.bought_not_attended_event_id)) {
    return false
  }

  if (rules.min_total_revenue != null && customer.total_revenue < rules.min_total_revenue) {
    return false
  }

  if (rules.min_orders != null && customer.total_orders < rules.min_orders) {
    return false
  }

  if (rules.inactive_days != null && rules.inactive_days > 0) {
    const inactiveSince = Date.now() - rules.inactive_days * 86_400_000

    if (customer.last_order_at && new Date(customer.last_order_at).getTime() > inactiveSince) {
      return false
    }
  }

  if (rules.city && normalizeText(customer.city) !== normalizeText(rules.city)) {
    return false
  }

  if (rules.state && normalizeText(customer.state) !== normalizeText(rules.state)) {
    return false
  }

  if (rules.tag && !customer.tags.some((tag) => normalizeText(tag) === normalizeText(rules.tag))) {
    return false
  }

  if (rules.min_average_ticket != null && customer.average_ticket < rules.min_average_ticket) {
    return false
  }

  if (rules.max_average_ticket != null && customer.average_ticket > rules.max_average_ticket) {
    return false
  }

  return true
}

export function buildAudienceCustomers(params: {
  customers: StoredCustomerRecord[]
  profiles: StoredCustomerEventProfile[]
}): CampaignAudienceCustomerRowInternal[] {
  const profilesByCustomer = new Map<string, StoredCustomerEventProfile[]>()

  for (const profile of params.profiles) {
    const bucket = profilesByCustomer.get(profile.customer_id) ?? []
    bucket.push(profile)
    profilesByCustomer.set(profile.customer_id, bucket)
  }

  return params.customers.map((customer) => {
    const profiles = profilesByCustomer.get(customer.id) ?? []
    const attendedEvents = profiles.filter((profile) => profile.attended_count > 0).map((profile) => profile.event_id)
    const noShowEvents = profiles.filter((profile) => profile.no_show_count > 0).map((profile) => profile.event_id)

    return {
      id: customer.email,
      customer_record_id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone ?? null,
      city: customer.city ?? null,
      state: customer.state ?? null,
      tags: customer.tags,
      total_orders: customer.total_orders,
      total_revenue: customer.total_spent,
      average_ticket: averageTicket(customer),
      last_order_at: customer.last_order_at ?? null,
      attended_events_count: profiles.reduce((sum, profile) => sum + profile.attended_count, 0),
      no_show_count: profiles.reduce((sum, profile) => sum + profile.no_show_count, 0),
      matched_events: profiles.map((profile) => profile.event_id),
      attended_events: attendedEvents,
      no_show_events: noShowEvents,
    }
  })
}

export function resolveAudienceCustomers(
  customers: CampaignAudienceCustomerRowInternal[],
  rules: AudienceSegmentRules,
): CampaignAudienceCustomerRowInternal[] {
  return customers
    .filter((customer) => customerMatchesRules(customer, rules))
    .sort((left, right) => right.total_revenue - left.total_revenue || toTimestamp(right.last_order_at) - toTimestamp(left.last_order_at))
}

export function previewAudience(
  customers: CampaignAudienceCustomerRowInternal[],
  rules: AudienceSegmentRules,
): CampaignAudiencePreview {
  const matched = resolveAudienceCustomers(customers, rules)
  const totalRevenue = matched.reduce((sum, customer) => sum + customer.total_revenue, 0)

  return {
    audience_count: matched.length,
    total_revenue: totalRevenue,
    average_ticket: matched.length > 0 ? Number((totalRevenue / matched.length).toFixed(2)) : 0,
    high_value_customers: matched.filter((customer) => customer.total_revenue >= 500).length,
    no_show_customers: matched.filter((customer) => customer.no_show_count > 0).length,
    sample_customers: matched.slice(0, 8),
  }
}

export function buildCampaignRunSummary(params: {
  audienceCount: number
  sentCount?: number
  deliveredCount?: number
  failedCount?: number
  skippedCount?: number
  cancelledCount?: number
}): CampaignRunSummary {
  const sentCount = params.sentCount ?? 0
  const deliveredCount = params.deliveredCount ?? 0
  const failedCount = params.failedCount ?? 0
  const skippedCount = params.skippedCount ?? 0
  const cancelledCount = params.cancelledCount ?? 0
  const processedCount = sentCount + deliveredCount + failedCount + skippedCount + cancelledCount
  const pendingCount = Math.max(params.audienceCount - processedCount, 0)

  return {
    audience_count: params.audienceCount,
    pending_count: pendingCount,
    sent_count: sentCount,
    delivered_count: deliveredCount,
    failed_count: failedCount,
    skipped_count: skippedCount,
    cancelled_count: cancelledCount,
    processed_count: processedCount,
    progress_percentage: params.audienceCount > 0 ? Math.round((processedCount / params.audienceCount) * 100) : 0,
  }
}

export function calculateCampaignRunSummary(deliveries: CampaignDeliveryRow[], audienceCount = deliveries.length): CampaignRunSummary {
  const counters = deliveries.reduce(
    (accumulator, delivery) => {
      switch (delivery.status) {
        case 'sent':
          accumulator.sent_count += 1
          break
        case 'delivered':
          accumulator.delivered_count += 1
          break
        case 'failed':
          accumulator.failed_count += 1
          break
        case 'skipped':
          accumulator.skipped_count += 1
          break
        case 'cancelled':
          accumulator.cancelled_count += 1
          break
        case 'pending':
        default:
          accumulator.pending_count += 1
          break
      }

      return accumulator
    },
    {
      pending_count: 0,
      sent_count: 0,
      delivered_count: 0,
      failed_count: 0,
      skipped_count: 0,
      cancelled_count: 0,
    },
  )

  const summary = buildCampaignRunSummary({
    audienceCount,
    sentCount: counters.sent_count,
    deliveredCount: counters.delivered_count,
    failedCount: counters.failed_count,
    skippedCount: counters.skipped_count,
    cancelledCount: counters.cancelled_count,
  })

  summary.pending_count = Math.max(summary.pending_count, counters.pending_count)

  return summary
}

export function decorateCampaignRun(run: Omit<CampaignRunRow, 'summary'>, deliveries: CampaignDeliveryRow[] = []): CampaignRunRow {
  return {
    ...run,
    summary:
      deliveries.length > 0
        ? calculateCampaignRunSummary(deliveries, run.audience_count)
        : buildCampaignRunSummary({
            audienceCount: run.audience_count,
            sentCount: run.sent_count,
            deliveredCount: run.delivered_count,
            failedCount: run.failed_count,
            skippedCount: run.skipped_count,
            cancelledCount: run.status === 'cancelled' ? Math.max(run.audience_count - run.sent_count - run.delivered_count - run.failed_count - run.skipped_count, 0) : 0,
          }),
  }
}

export function buildCampaignsOverview(params: {
  events: CampaignEventOption[]
  segments: AudienceSegmentRow[]
  drafts: CampaignDraftRow[]
  runs: CampaignRunRow[]
  addressableCustomers: number
  highValueCustomers: number
}): CampaignsOverview {
  return {
    events: params.events,
    segments: params.segments,
    drafts: params.drafts,
    runs: params.runs,
    summary: {
      saved_segments: params.segments.length,
      draft_campaigns: params.drafts.length,
      active_runs: params.runs.filter((run) => run.status === 'pending' || run.status === 'resolving' || run.status === 'sending' || run.status === 'paused').length,
      addressable_customers: params.addressableCustomers,
      high_value_customers: params.highValueCustomers,
    },
  }
}
