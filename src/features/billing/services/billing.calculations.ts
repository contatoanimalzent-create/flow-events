import type { BillingFeatureKey, BillingFeeBreakdown, BillingFeeType, BillingSubscriptionPlan } from '@/features/billing/types'

interface CalculateFeeBreakdownInput {
  subtotal: number
  quantity: number
  feeType?: BillingFeeType | null
  feeValue?: number | null
  absorbFee?: boolean | null
}

type FeatureFlags = Partial<Record<BillingFeatureKey, boolean>> | null | undefined

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function normalizeFeeConfig(input: {
  feeType?: BillingFeeType | null
  feeValue?: number | null
  absorbFee?: boolean | null
}) {
  return {
    feeType: input.feeType ?? 'percentage',
    feeValue: Number(input.feeValue ?? 0),
    absorbFee: Boolean(input.absorbFee),
  }
}

export function calculateFeeBreakdown(input: CalculateFeeBreakdownInput): BillingFeeBreakdown {
  const normalized = normalizeFeeConfig(input)
  const subtotal = roundCurrency(input.subtotal)
  const quantity = Math.max(Number(input.quantity ?? 0), 0)
  const rawPlatformFee =
    normalized.feeType === 'fixed'
      ? quantity * normalized.feeValue
      : subtotal * (normalized.feeValue / 100)
  const platformFeeAmount = roundCurrency(Math.max(rawPlatformFee, 0))
  const customerFeeAmount = normalized.absorbFee ? 0 : platformFeeAmount
  const absorbedFeeAmount = normalized.absorbFee ? platformFeeAmount : 0
  const totalAmount = roundCurrency(subtotal + customerFeeAmount)

  return {
    subtotal,
    quantity,
    feeType: normalized.feeType,
    feeValue: normalized.feeValue,
    absorbFee: normalized.absorbFee,
    platformFeeAmount,
    customerFeeAmount,
    absorbedFeeAmount,
    totalAmount,
  }
}

export function resolveFeatureAccess(
  plan: BillingSubscriptionPlan,
  featureFlags: FeatureFlags,
  featureKey: BillingFeatureKey,
) {
  const override = featureFlags?.[featureKey]

  if (override === true) {
    return true
  }

  if (override === false) {
    return false
  }

  return plan.features.includes(featureKey)
}

export function resolveActiveFeatures(plan: BillingSubscriptionPlan, featureFlags: FeatureFlags) {
  return ([
    'standard_checkout',
    'premium_checkout',
    'advanced_analytics',
    'campaign_automation',
    'priority_support',
    'white_label',
    'api_access',
    'custom_domain',
    'enterprise_support',
    'sso',
  ] as BillingFeatureKey[]).filter((featureKey) => resolveFeatureAccess(plan, featureFlags, featureKey))
}

export function hasAvailableLimit(limit: number | null, used: number) {
  return limit == null || used < limit
}

export function getRemainingLimit(limit: number | null, used: number) {
  return limit == null ? null : Math.max(limit - used, 0)
}
