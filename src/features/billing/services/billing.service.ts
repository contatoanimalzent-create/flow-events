import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import {
  calculateFeeBreakdown,
  getRemainingLimit,
  hasAvailableLimit,
  resolveActiveFeatures,
} from './billing.calculations'
import type {
  BillingEventFeeConfigSummary,
  BillingFeatureKey,
  BillingFeeType,
  BillingOverview,
  BillingPlanGateSnapshot,
  BillingRevenuePoint,
  BillingSubscriptionPlan,
  BillingUsageOverview,
} from '@/features/billing/types'

const billingApi = createApiClient('billing')
const REVENUE_ORDER_STATUSES = new Set(['paid', 'refunded', 'chargeback'])

interface OrganizationPlanRow {
  id: string
  name: string
  plan?: string | null
  subscription_plan_id?: string | null
  feature_flags?: Record<string, boolean> | null
  subscription_plan?: Record<string, unknown> | Array<Record<string, unknown>> | null
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function mapSubscriptionPlan(row: Record<string, unknown>): BillingSubscriptionPlan {
  const rawLimits = (row.limits as Record<string, unknown> | null | undefined) ?? {}

  return {
    id: String(row.id),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    billingCycle: (row.billing_cycle as BillingSubscriptionPlan['billingCycle']) ?? 'monthly',
    features: (((row.features as unknown[] | null | undefined) ?? []).map((feature) => String(feature)) as BillingFeatureKey[]),
    limits: {
      events: rawLimits.events == null ? null : Number(rawLimits.events),
      ticketsPerEvent: rawLimits.tickets_per_event == null ? null : Number(rawLimits.tickets_per_event),
    },
    isActive: Boolean(row.is_active ?? true),
  }
}

function buildFallbackPlan(slug = 'starter'): BillingSubscriptionPlan {
  const fallbackPlans: Record<string, BillingSubscriptionPlan> = {
    starter: {
      id: 'starter',
      slug: 'starter',
      name: 'Starter',
      description: 'Camada inicial com fee padrao e limites basicos.',
      price: 0,
      billingCycle: 'monthly',
      features: ['standard_checkout'],
      limits: { events: 2, ticketsPerEvent: 4 },
      isActive: true,
    },
    pro: {
      id: 'pro',
      slug: 'pro',
      name: 'Pro',
      description: 'Operacao em crescimento com checkout premium e analytics.',
      price: 149,
      billingCycle: 'monthly',
      features: ['standard_checkout', 'premium_checkout', 'advanced_analytics', 'campaign_automation', 'priority_support'],
      limits: { events: 12, ticketsPerEvent: 12 },
      isActive: true,
    },
    business: {
      id: 'business',
      slug: 'business',
      name: 'Business',
      description: 'White-label, dominios e integracoes para operacoes maiores.',
      price: 499,
      billingCycle: 'monthly',
      features: ['standard_checkout', 'premium_checkout', 'advanced_analytics', 'campaign_automation', 'priority_support', 'white_label', 'api_access', 'custom_domain'],
      limits: { events: 48, ticketsPerEvent: 24 },
      isActive: true,
    },
    enterprise: {
      id: 'enterprise',
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'Fee e limites negociados para escala global.',
      price: 0,
      billingCycle: 'custom',
      features: ['standard_checkout', 'premium_checkout', 'advanced_analytics', 'campaign_automation', 'priority_support', 'white_label', 'api_access', 'custom_domain', 'enterprise_support', 'sso'],
      limits: { events: null, ticketsPerEvent: null },
      isActive: true,
    },
  }

  return fallbackPlans[slug] ?? fallbackPlans.starter
}

function buildRevenueSeries(orders: Array<Record<string, unknown>>, monthlySubscriptionRevenue: number): BillingRevenuePoint[] {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
  const grouped = new Map<string, BillingRevenuePoint>()

  for (const order of orders) {
    const date = new Date(String(order.created_at ?? new Date().toISOString()))
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const current = grouped.get(key) ?? { label: formatter.format(date), sold: 0, fees: 0, platformRevenue: 0 }
    current.sold += Number(order.subtotal ?? 0)
    current.fees += Number(order.fee_amount ?? 0)
    current.platformRevenue += Number(order.fee_amount ?? 0)
    grouped.set(key, current)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
    .map(([, point]) => ({
      label: point.label,
      sold: roundCurrency(point.sold),
      fees: roundCurrency(point.fees),
      platformRevenue: roundCurrency(point.platformRevenue + monthlySubscriptionRevenue),
    }))
}

function buildUsageOverview(params: {
  eventCount: number
  ticketTypeCount: number
  ticketTypesByEvent: Map<string, number>
  plan: BillingSubscriptionPlan
}): BillingUsageOverview {
  const maxTicketTypesPerEvent = Math.max(0, ...Array.from(params.ticketTypesByEvent.values()))

  return {
    eventCount: params.eventCount,
    eventLimit: params.plan.limits.events,
    remainingEvents: getRemainingLimit(params.plan.limits.events, params.eventCount),
    ticketTypeCount: params.ticketTypeCount,
    maxTicketTypesPerEvent,
    ticketsPerEventLimit: params.plan.limits.ticketsPerEvent,
    remainingTicketsPerEvent: getRemainingLimit(params.plan.limits.ticketsPerEvent, maxTicketTypesPerEvent),
  }
}

async function getOrganizationPlanRecord(organizationId: string) {
  const result = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      plan,
      subscription_plan_id,
      feature_flags,
      subscription_plan:subscription_plans (
        id,
        slug,
        name,
        description,
        price,
        billing_cycle,
        features,
        limits,
        is_active
      )
    `)
    .eq('id', organizationId)
    .single()

  if (result.error) {
    throw result.error
  }

  return result.data as unknown as OrganizationPlanRow
}

export const billingService = {
  async listSubscriptionPlans(): Promise<BillingSubscriptionPlan[]> {
    return billingApi.query('list_subscription_plans', async () => {
      const result = await supabase
        .from('subscription_plans')
        .select('id,slug,name,description,price,billing_cycle,features,limits,is_active')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (result.error) {
        throw result.error
      }

      return (((result.data as Record<string, unknown>[] | null) ?? []).map(mapSubscriptionPlan))
    })
  },

  async getOverview(organizationId: string): Promise<BillingOverview> {
    return billingApi.query('get_overview', async () => {
      const organization = await getOrganizationPlanRecord(organizationId)
      const joinedPlan = Array.isArray(organization.subscription_plan) ? organization.subscription_plan[0] : organization.subscription_plan
      const currentPlan = joinedPlan
        ? mapSubscriptionPlan(joinedPlan)
        : buildFallbackPlan(organization.plan ?? 'starter')

      const [eventsResult, ordersResult] = await Promise.all([
        supabase
          .from('events')
          .select('id,name,starts_at,status,sold_tickets,fee_type,fee_value,absorb_fee')
          .eq('organization_id', organizationId)
          .order('starts_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id,event_id,subtotal,fee_amount,customer_fee_amount,absorbed_fee_amount,status,created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true }),
      ])

      if (eventsResult.error) {
        throw eventsResult.error
      }

      if (ordersResult.error) {
        throw ordersResult.error
      }

      const events = filterExampleEvents(((eventsResult.data as Record<string, unknown>[] | null) ?? []))
      const eventIds = events.map((event) => String(event.id))
      const ticketTypesResult = eventIds.length > 0
        ? await supabase.from('ticket_types').select('id,event_id').in('event_id', eventIds)
        : { data: [], error: null }

      if (ticketTypesResult.error) {
        throw ticketTypesResult.error
      }

      const ticketTypes = ((ticketTypesResult.data as Record<string, unknown>[] | null) ?? [])
      const revenueOrders = (((ordersResult.data as Record<string, unknown>[] | null) ?? [])).filter((order) =>
        REVENUE_ORDER_STATUSES.has(String(order.status ?? '')),
      )

      const ticketTypesByEvent = new Map<string, number>()
      for (const ticketType of ticketTypes) {
        const eventId = String(ticketType.event_id ?? '')
        ticketTypesByEvent.set(eventId, (ticketTypesByEvent.get(eventId) ?? 0) + 1)
      }

      const usage = buildUsageOverview({
        eventCount: events.length,
        ticketTypeCount: ticketTypes.length,
        ticketTypesByEvent,
        plan: currentPlan,
      })

      const featureFlags = (organization.feature_flags as Partial<Record<BillingFeatureKey, boolean>> | null) ?? {}
      const activeFeatures = resolveActiveFeatures(currentPlan, featureFlags)
      const totalSold = roundCurrency(revenueOrders.reduce((sum, order) => sum + Number(order.subtotal ?? 0), 0))
      const generatedFees = roundCurrency(revenueOrders.reduce((sum, order) => sum + Number(order.fee_amount ?? 0), 0))
      const monthlySubscriptionRevenue = roundCurrency(currentPlan.price)
      const platformRevenue = roundCurrency(generatedFees + monthlySubscriptionRevenue)
      const activeEvents = events.filter((event) => ['published', 'ongoing'].includes(String(event.status ?? ''))).length
      const absorbedEvents = events.filter((event) => Boolean(event.absorb_fee)).length

      return {
        organization: {
          organizationId: organization.id,
          organizationName: organization.name,
          currentPlan,
          featureFlags,
          activeFeatures,
        },
        summary: {
          totalSold,
          generatedFees,
          platformRevenue,
          monthlySubscriptionRevenue,
          activeEvents,
          absorbedEvents,
          averageTakeRate: totalSold > 0 ? Number(((generatedFees / totalSold) * 100).toFixed(1)) : 0,
        },
        usage,
        revenueSeries: buildRevenueSeries(revenueOrders, monthlySubscriptionRevenue),
        eventFeeConfigurations: events.map((event): BillingEventFeeConfigSummary => ({
          eventId: String(event.id),
          eventName: String(event.name ?? ''),
          startsAt: String(event.starts_at ?? ''),
          soldTickets: Number(event.sold_tickets ?? 0),
          feeType: (event.fee_type as BillingEventFeeConfigSummary['feeType']) ?? 'percentage',
          feeValue: Number(event.fee_value ?? 0),
          absorbFee: Boolean(event.absorb_fee),
          status: String(event.status ?? 'draft'),
        })),
      }
    }, { organizationId })
  },

  async getPlanGateSnapshot(organizationId: string, eventId?: string): Promise<BillingPlanGateSnapshot> {
    return billingApi.query('get_plan_gate_snapshot', async () => {
      const organization = await getOrganizationPlanRecord(organizationId)
      const joinedPlan = Array.isArray(organization.subscription_plan) ? organization.subscription_plan[0] : organization.subscription_plan
      const currentPlan = joinedPlan
        ? mapSubscriptionPlan(joinedPlan)
        : buildFallbackPlan(organization.plan ?? 'starter')

      const { data: organizationEvents, count: eventCount, error: eventCountError } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)

      if (eventCountError) {
        throw eventCountError
      }

      const organizationEventIds = filterExampleEvents((((organizationEvents as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
      })))).map((row) => row.id)
      const { data: ticketRows, error: ticketRowsError } = organizationEventIds.length > 0
        ? await supabase.from('ticket_types').select('event_id').in('event_id', organizationEventIds)
        : { data: [], error: null }

      if (ticketRowsError) {
        throw ticketRowsError
      }

      const ticketTypesByEvent = new Map<string, number>()
      for (const row of ((ticketRows as Record<string, unknown>[] | null) ?? [])) {
        const currentEventId = String(row.event_id ?? '')
        ticketTypesByEvent.set(currentEventId, (ticketTypesByEvent.get(currentEventId) ?? 0) + 1)
      }

      const usage = buildUsageOverview({
        eventCount: Number(eventCount ?? 0),
        ticketTypeCount: ((ticketRows as unknown[] | null) ?? []).length,
        ticketTypesByEvent,
        plan: currentPlan,
      })

      const currentEventTicketCount = eventId ? ticketTypesByEvent.get(eventId) ?? 0 : usage.maxTicketTypesPerEvent
      const featureFlags = (organization.feature_flags as Partial<Record<BillingFeatureKey, boolean>> | null) ?? {}

      return {
        organization: {
          organizationId: organization.id,
          organizationName: organization.name,
          currentPlan,
          featureFlags,
          activeFeatures: resolveActiveFeatures(currentPlan, featureFlags),
        },
        usage,
        canCreateEvent: hasAvailableLimit(currentPlan.limits.events, Number(eventCount ?? 0)),
        canCreateTicketType: hasAvailableLimit(currentPlan.limits.ticketsPerEvent, currentEventTicketCount),
      }
    }, { organizationId, eventId: eventId ?? null })
  },

  async updateOrganizationPlan(organizationId: string, planId: string) {
    return billingApi.mutation('update_organization_plan', async () => {
      const planResult = await supabase
        .from('subscription_plans')
        .select('id,slug,name,description,price,billing_cycle,features,limits,is_active')
        .eq('id', planId)
        .single()

      if (planResult.error || !planResult.data) {
        throw planResult.error ?? new Error('Plano nao encontrado')
      }

      const plan = mapSubscriptionPlan(planResult.data as Record<string, unknown>)
      const result = await supabase
        .from('organizations')
        .update({
          subscription_plan_id: plan.id,
          plan: plan.slug,
        })
        .eq('id', organizationId)

      if (result.error) {
        throw result.error
      }

      return plan
    }, { organizationId, planId })
  },

  calculateFeePreview(input: {
    subtotal: number
    quantity: number
    feeType?: BillingFeeType | null
    feeValue?: number | null
    absorbFee?: boolean | null
  }) {
    return calculateFeeBreakdown(input)
  },
}
