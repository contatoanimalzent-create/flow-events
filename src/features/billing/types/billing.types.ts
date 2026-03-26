export type BillingFeeType = 'fixed' | 'percentage'

export type BillingFeatureKey =
  | 'standard_checkout'
  | 'premium_checkout'
  | 'advanced_analytics'
  | 'campaign_automation'
  | 'priority_support'
  | 'white_label'
  | 'api_access'
  | 'custom_domain'
  | 'enterprise_support'
  | 'sso'

export interface BillingSubscriptionPlan {
  id: string
  slug: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'annual' | 'custom'
  features: BillingFeatureKey[]
  limits: {
    events: number | null
    ticketsPerEvent: number | null
  }
  isActive: boolean
}

export interface BillingOrganizationProfile {
  organizationId: string
  organizationName: string
  currentPlan: BillingSubscriptionPlan
  featureFlags: Partial<Record<BillingFeatureKey, boolean>>
  activeFeatures: BillingFeatureKey[]
}

export interface BillingFeeBreakdown {
  subtotal: number
  quantity: number
  feeType: BillingFeeType
  feeValue: number
  absorbFee: boolean
  platformFeeAmount: number
  customerFeeAmount: number
  absorbedFeeAmount: number
  totalAmount: number
}

export interface BillingRevenuePoint {
  label: string
  sold: number
  fees: number
  platformRevenue: number
}

export interface BillingUsageOverview {
  eventCount: number
  eventLimit: number | null
  remainingEvents: number | null
  ticketTypeCount: number
  maxTicketTypesPerEvent: number
  ticketsPerEventLimit: number | null
  remainingTicketsPerEvent: number | null
}

export interface BillingRevenueSummary {
  totalSold: number
  generatedFees: number
  platformRevenue: number
  monthlySubscriptionRevenue: number
  activeEvents: number
  absorbedEvents: number
  averageTakeRate: number
}

export interface BillingEventFeeConfigSummary {
  eventId: string
  eventName: string
  startsAt: string
  soldTickets: number
  feeType: BillingFeeType
  feeValue: number
  absorbFee: boolean
  status: string
}

export interface BillingOverview {
  organization: BillingOrganizationProfile
  summary: BillingRevenueSummary
  usage: BillingUsageOverview
  revenueSeries: BillingRevenuePoint[]
  eventFeeConfigurations: BillingEventFeeConfigSummary[]
}

export interface BillingPlanGateSnapshot {
  organization: BillingOrganizationProfile
  usage: BillingUsageOverview
  canCreateEvent: boolean
  canCreateTicketType: boolean
}
