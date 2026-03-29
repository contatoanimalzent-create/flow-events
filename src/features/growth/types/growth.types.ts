import type { AppLocale } from '@/shared/i18n/app-locale'

export type ReferralBenefitType = 'discount' | 'cashback' | 'future_credit' | 'vip_upgrade'

export interface CaptureLeadInput {
  email: string
  fullName?: string
  organizationId?: string | null
  eventId?: string | null
  source: string
  metadata?: Record<string, unknown>
  locale?: AppLocale
}

export interface ReferralLinkRecord {
  id: string
  organization_id: string
  event_id: string
  referrer_id: string
  code: string
  benefit_type: ReferralBenefitType
  benefit_value: number
  benefit_description?: string | null
  conversion_count: number
  revenue_generated: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ReferralConversionRecord {
  id: string
  organization_id: string
  referral_link_id: string
  referrer_id: string
  event_id: string
  order_id: string
  buyer_email?: string | null
  conversion: boolean
  gross_amount: number
  reward_status: 'pending' | 'granted' | 'rejected' | 'expired'
  metadata: Record<string, unknown>
  created_at: string
}

export interface RegisterReferralConversionInput {
  organizationId: string
  eventId: string
  orderId: string
  buyerEmail?: string | null
  grossAmount: number
  referralCode?: string | null
  source?: string
  locale?: AppLocale
}

export interface GrowthOverviewMetric {
  label: string
  value: string
  note: string
}

export interface ReferralTopLink {
  id: string
  code: string
  eventName: string
  benefitLabel: string
  conversions: number
  revenue: number
  shareUrl: string
}

export interface GrowthRecentSignal {
  id: string
  title: string
  description: string
  timestamp: string
  tone: 'success' | 'warning' | 'neutral'
}

export interface GrowthOverview {
  metrics: GrowthOverviewMetric[]
  referralLinks: ReferralTopLink[]
  recentSignals: GrowthRecentSignal[]
}
