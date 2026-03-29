import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type { AppLocale } from '@/shared/i18n/app-locale'
import { slugify } from '@/shared/lib'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type {
  CaptureLeadInput,
  GrowthOverview,
  ReferralBenefitType,
  ReferralConversionRecord,
  ReferralLinkRecord,
  RegisterReferralConversionInput,
} from '@/features/growth/types/growth.types'

const growthApi = createApiClient('growth')

function normalizeLocale(locale?: AppLocale): AppLocale {
  return locale === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function translate(locale: AppLocale | undefined, english: string, portuguese: string) {
  return normalizeLocale(locale) === 'pt-BR' ? portuguese : english
}

function formatCurrency(value: number, locale?: AppLocale) {
  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatNumber(value: number, locale?: AppLocale) {
  return new Intl.NumberFormat(normalizeLocale(locale)).format(value)
}

function formatSourceLabel(source: string | null | undefined, locale?: AppLocale) {
  switch (source) {
    case 'public_referral':
      return translate(locale, 'shared referral link', 'link compartilhado de indicacao')
    case 'public_checkout':
      return translate(locale, 'public checkout', 'compra publica')
    case 'free_checkout':
      return translate(locale, 'free checkout', 'compra gratuita')
    case 'public_event_page':
      return translate(locale, 'public event page', 'pagina publica do evento')
    default:
      return source ?? translate(locale, 'product flow', 'fluxo do produto')
  }
}

function getOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'https://animalz.events'
}

export function buildEventShareUrl(slug: string, referralCode?: string | null) {
  const url = new URL(`/e/${slug}`, getOrigin())

  if (referralCode) {
    url.searchParams.set('ref', referralCode)
  }

  return url.toString()
}

function buildReferralCode(eventName: string) {
  return `${slugify(eventName).slice(0, 18)}-${crypto.randomUUID().slice(0, 8)}`
}

async function resolveNotificationUserId(organizationId: string) {
  const [memberResult, profileResult] = await Promise.all([
    supabase.from('organization_members').select('user_id').eq('organization_id', organizationId).eq('is_active', true).limit(1).maybeSingle(),
    supabase.from('profiles').select('id').eq('organization_id', organizationId).limit(1).maybeSingle(),
  ])

  return memberResult.data?.user_id ?? profileResult.data?.id ?? null
}

async function createInternalRemarketingSignal(params: {
  organizationId: string
  eventId: string
  title: string
  body: string
  referenceType: string
  referenceId: string
  payload: Record<string, unknown>
}) {
  try {
    const notificationUserId = await resolveNotificationUserId(params.organizationId)

    if (notificationUserId) {
      await supabase.from('internal_notifications').insert({
        organization_id: params.organizationId,
        user_id: notificationUserId,
        type: 'growth',
        severity: 'info',
        title: params.title,
        body: params.body,
        action_url: '/growth',
        reference_type: params.referenceType,
        reference_id: params.referenceId,
        is_read: false,
      })
    }

    const automationRuleResult = await supabase
      .from('campaign_automation_rules')
      .select('id,trigger_type')
      .eq('organization_id', params.organizationId)
      .eq('is_active', true)
      .in('trigger_type', ['custom', 'order_confirmed', 'ticket_purchased'])
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (automationRuleResult.data?.id) {
      await supabase.from('campaign_automation_executions').insert({
        organization_id: params.organizationId,
        rule_id: automationRuleResult.data.id,
        trigger_type: automationRuleResult.data.trigger_type,
        trigger_entity_type: params.referenceType,
        trigger_entity_id: params.referenceId,
        trigger_payload: params.payload,
        scheduled_for: new Date().toISOString(),
        status: 'pending',
      })
    }
  } catch {
    // remarketing is best-effort on public flows
  }
}

function mapReferralLink(row: Record<string, unknown>): ReferralLinkRecord {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: String(row.event_id),
    referrer_id: String(row.referrer_id),
    code: String(row.code),
    benefit_type: (row.benefit_type as ReferralBenefitType | undefined) ?? 'discount',
    benefit_value: Number(row.benefit_value ?? 0),
    benefit_description: (row.benefit_description as string | null | undefined) ?? null,
    conversion_count: Number(row.conversion_count ?? 0),
    revenue_generated: Number(row.revenue_generated ?? 0),
    is_active: Boolean(row.is_active),
    metadata: (row.metadata as Record<string, unknown> | null | undefined) ?? {},
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  }
}

function mapReferralConversion(row: Record<string, unknown>): ReferralConversionRecord {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    referral_link_id: String(row.referral_link_id),
    referrer_id: String(row.referrer_id),
    event_id: String(row.event_id),
    order_id: String(row.order_id),
    buyer_email: (row.buyer_email as string | null | undefined) ?? null,
    conversion: Boolean(row.conversion ?? true),
    gross_amount: Number(row.gross_amount ?? 0),
    reward_status: (row.reward_status as ReferralConversionRecord['reward_status'] | undefined) ?? 'pending',
    metadata: (row.metadata as Record<string, unknown> | null | undefined) ?? {},
    created_at: String(row.created_at),
  }
}

function formatBenefitLabel(link: ReferralLinkRecord, locale?: AppLocale) {
  if (link.benefit_type === 'discount') {
    return translate(locale, `${formatCurrency(link.benefit_value, locale)} discount`, `${formatCurrency(link.benefit_value, locale)} de desconto`)
  }

  if (link.benefit_type === 'cashback') {
    return translate(locale, `${formatCurrency(link.benefit_value, locale)} cashback`, `${formatCurrency(link.benefit_value, locale)} de cashback`)
  }

  if (link.benefit_type === 'future_credit') {
    return translate(locale, `${formatCurrency(link.benefit_value, locale)} in future credit`, `${formatCurrency(link.benefit_value, locale)} em credito futuro`)
  }

  return translate(locale, 'Future VIP benefit', 'Beneficio VIP futuro')
}

export const growthService = {
  buildEventShareUrl,

  async getOrCreateReferralLink(params: {
    organizationId: string
    eventId: string
    eventName: string
    eventSlug: string
    referrerId: string
    benefitType?: ReferralBenefitType
    benefitValue?: number
    locale?: AppLocale
  }) {
    return growthApi.request('get_or_create_referral_link', async () => {
      const existingResult = await supabase
        .from('referral_links')
        .select('*')
        .eq('organization_id', params.organizationId)
        .eq('event_id', params.eventId)
        .eq('referrer_id', params.referrerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingResult.error) {
        throw existingResult.error
      }

      let linkRow = existingResult.data as Record<string, unknown> | null

      if (!linkRow) {
        const insertResult = await supabase
          .from('referral_links')
          .insert({
            organization_id: params.organizationId,
            event_id: params.eventId,
            referrer_id: params.referrerId,
            code: buildReferralCode(params.eventName),
            benefit_type: params.benefitType ?? 'discount',
            benefit_value: params.benefitValue ?? 20,
            benefit_description: translate(
              params.locale,
              'Automatic benefit for the next purchase cycle.',
              'Beneficio automatico para o proximo ciclo de compra.',
            ),
            metadata: {
              event_slug: params.eventSlug,
              channel: 'public_share',
            },
          })
          .select('*')
          .single()

        if (insertResult.error) {
          throw insertResult.error
        }

        linkRow = insertResult.data as Record<string, unknown>
      }

      const link = mapReferralLink(linkRow)

      return {
        ...link,
        shareUrl: buildEventShareUrl(params.eventSlug, link.code),
      }
    }, { organizationId: params.organizationId, eventId: params.eventId, referrerId: params.referrerId })
  },

  async captureLead(input: CaptureLeadInput) {
    return growthApi.request('capture_growth_lead', async () => {
      const result = await supabase
        .from('growth_leads')
        .insert({
          organization_id: input.organizationId ?? null,
          event_id: input.eventId ?? null,
          email: input.email.trim().toLowerCase(),
          full_name: input.fullName?.trim() || null,
          source: input.source,
          metadata: input.metadata ?? {},
        })
        .select('*')
        .single()

      if (result.error) {
        throw result.error
      }

      if (input.organizationId) {
        await createInternalRemarketingSignal({
          organizationId: input.organizationId,
          eventId: input.eventId ?? '',
          title: translate(input.locale, 'New lead captured in the public layer', 'Novo contato capturado na camada publica'),
          body: translate(
            input.locale,
            `${input.email.trim().toLowerCase()} entered the organic flow through ${formatSourceLabel(input.source, input.locale)}.`,
            `${input.email.trim().toLowerCase()} entrou na esteira organica por ${formatSourceLabel(input.source, input.locale)}.`,
          ),
          referenceType: 'growth_lead',
          referenceId: String(result.data.id),
          payload: {
            source: input.source,
            email: input.email.trim().toLowerCase(),
            event_id: input.eventId ?? null,
          },
        })
      }

      return result.data
    }, { organizationId: input.organizationId ?? null, eventId: input.eventId ?? null, source: input.source })
  },

  async registerReferralConversion(input: RegisterReferralConversionInput) {
    return growthApi.request('register_referral_conversion', async () => {
      if (!input.referralCode) {
        return null
      }

      const linkResult = await supabase
        .from('referral_links')
        .select('*')
        .eq('organization_id', input.organizationId)
        .eq('event_id', input.eventId)
        .eq('code', input.referralCode)
        .eq('is_active', true)
        .maybeSingle()

      if (linkResult.error) {
        throw linkResult.error
      }

      if (!linkResult.data) {
        return null
      }

      const existingConversion = await supabase
        .from('referral_conversions')
        .select('id')
        .eq('order_id', input.orderId)
        .maybeSingle()

      if (existingConversion.error) {
        throw existingConversion.error
      }

      if (existingConversion.data?.id) {
        return null
      }

      const conversionResult = await supabase
        .from('referral_conversions')
        .insert({
          organization_id: input.organizationId,
          referral_link_id: linkResult.data.id,
          referrer_id: linkResult.data.referrer_id,
          event_id: input.eventId,
          order_id: input.orderId,
          buyer_email: input.buyerEmail ?? null,
          conversion: true,
          gross_amount: input.grossAmount,
          reward_status: 'pending',
          metadata: {
            source: input.source ?? 'public_checkout',
            referral_code: input.referralCode,
          },
        })
        .select('*')
        .single()

      if (conversionResult.error) {
        throw conversionResult.error
      }

      await createInternalRemarketingSignal({
        organizationId: input.organizationId,
        eventId: input.eventId,
        title: translate(input.locale, 'New conversion via referral', 'Nova conversao por indicacao'),
        body: translate(
          input.locale,
          `${input.buyerEmail ?? 'A buyer'} converted through a shareable event link.`,
          `${input.buyerEmail ?? 'Um comprador'} converteu por um link compartilhavel do evento.`,
        ),
        referenceType: 'referral_conversion',
        referenceId: String(conversionResult.data.id),
        payload: {
          order_id: input.orderId,
          event_id: input.eventId,
          referral_code: input.referralCode,
          gross_amount: input.grossAmount,
        },
      })

      return mapReferralConversion(conversionResult.data as Record<string, unknown>)
    }, { organizationId: input.organizationId, eventId: input.eventId, orderId: input.orderId })
  },

  async getGrowthOverview(organizationId: string, locale?: AppLocale): Promise<GrowthOverview> {
    return growthApi.query('get_growth_overview', async () => {
      const [eventsResult, ordersResult, linksResult, conversionsResult, leadsResult] = await Promise.all([
        supabase.from('events').select('id,name,slug,starts_at,status,sold_tickets').eq('organization_id', organizationId).order('starts_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id,event_id,total_amount,buyer_name,source_channel,created_at,status')
          .eq('organization_id', organizationId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(16),
        supabase.from('referral_links').select('*').eq('organization_id', organizationId).order('conversion_count', { ascending: false }).limit(8),
        supabase.from('referral_conversions').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(12),
        supabase.from('growth_leads').select('id,email,source,created_at,status').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(12),
      ])

      if (eventsResult.error) throw eventsResult.error
      if (ordersResult.error) throw ordersResult.error
      if (linksResult.error) throw linksResult.error
      if (conversionsResult.error) throw conversionsResult.error
      if (leadsResult.error) throw leadsResult.error

      const events = filterExampleEvents((eventsResult.data ?? []) as Array<Record<string, unknown>>)
      const orders = (ordersResult.data ?? []) as Array<Record<string, unknown>>
      const links = ((linksResult.data ?? []) as Array<Record<string, unknown>>).map(mapReferralLink)
      const conversions = ((conversionsResult.data ?? []) as Array<Record<string, unknown>>).map(mapReferralConversion)
      const leads = (leadsResult.data ?? []) as Array<Record<string, unknown>>
      const eventNameById = new Map(events.map((event) => [String(event.id), String(event.name ?? translate(locale, 'Event', 'Evento'))]))
      const eventSlugById = new Map(events.map((event) => [String(event.id), String(event.slug ?? '')]))
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)
      const referralRevenue = conversions.reduce((sum, conversion) => sum + conversion.gross_amount, 0)
      const activeEvents = events.filter((event) => ['published', 'ongoing'].includes(String(event.status ?? ''))).length
      const soldTickets = events.reduce((sum, event) => sum + Number(event.sold_tickets ?? 0), 0)

      const metrics = [
        {
          label: translate(locale, 'Captured revenue', 'Receita capturada'),
          value: formatCurrency(totalRevenue, locale),
          note: translate(locale, 'Paid orders sustaining the organic layer and repurchase cycle.', 'Pedidos pagos que sustentam a camada organica e o ciclo de recompra.'),
        },
        {
          label: translate(locale, 'Referral revenue', 'Receita por indicacao'),
          value: formatCurrency(referralRevenue, locale),
          note: translate(locale, 'Conversions attributed to shareable links and active viral loops.', 'Conversoes atribuidas a links compartilhaveis e ciclos virais ativos.'),
        },
        {
          label: translate(locale, 'Captured leads', 'Contatos capturados'),
          value: formatNumber(leads.length, locale),
          note: translate(locale, 'Demand preserved through exit capture and invitations from the public layer.', 'Demandas salvas pela captura de saida e convites da camada publica.'),
        },
        {
          label: translate(locale, 'Live experiences', 'Experiencias em movimento'),
          value: formatNumber(activeEvents, locale),
          note: translate(locale, `${formatNumber(soldTickets, locale)} attendees have already gone through events in this operation.`, `${formatNumber(soldTickets, locale)} participantes ja passaram por eventos desta operacao.`),
        },
      ]

      const referralLinks = links.map((link) => ({
        id: link.id,
        code: link.code,
        eventName: eventNameById.get(link.event_id) ?? translate(locale, 'Event', 'Evento'),
        benefitLabel: formatBenefitLabel(link, locale),
        conversions: link.conversion_count,
        revenue: link.revenue_generated,
        shareUrl: buildEventShareUrl(eventSlugById.get(link.event_id) ?? '', link.code),
      }))

      const recentSignals = [
        ...conversions.map((conversion) => ({
          id: `conversion-${conversion.id}`,
          title: translate(locale, 'Referral conversion', 'Conversao por indicacao'),
          description: translate(
            locale,
            `${conversion.buyer_email ?? 'New buyer'} converted ${formatCurrency(conversion.gross_amount, locale)} in ${eventNameById.get(conversion.event_id) ?? 'the main event'}.`,
            `${conversion.buyer_email ?? 'Novo comprador'} converteu ${formatCurrency(conversion.gross_amount, locale)} no evento ${eventNameById.get(conversion.event_id) ?? 'principal'}.`,
          ),
          timestamp: conversion.created_at,
          tone: 'success' as const,
        })),
        ...leads.map((lead) => ({
          id: `lead-${String(lead.id)}`,
          title: translate(locale, 'Lead ready for follow-up', 'Contato pronto para acompanhamento'),
          description: translate(
            locale,
            `${String(lead.email ?? 'Lead')} came in through ${formatSourceLabel(String(lead.source ?? 'public_capture'), locale)} and can already move into campaigns.`,
            `${String(lead.email ?? 'Contato')} entrou por ${formatSourceLabel(String(lead.source ?? 'captura_publica'), locale)} e ja pode seguir para campanhas.`,
          ),
          timestamp: String(lead.created_at ?? new Date().toISOString()),
          tone: 'neutral' as const,
        })),
        ...orders.slice(0, 5).map((order) => ({
          id: `order-${String(order.id)}`,
          title: translate(locale, 'Recent sale recorded', 'Venda recente registrada'),
          description: translate(
            locale,
            `${String(order.buyer_name ?? 'Buyer')} came through ${formatSourceLabel(String(order.source_channel ?? 'public_event_page'), locale)} with ${formatCurrency(Number(order.total_amount ?? 0), locale)}.`,
            `${String(order.buyer_name ?? 'Comprador')} entrou por ${formatSourceLabel(String(order.source_channel ?? 'public_event_page'), locale)} com ${formatCurrency(Number(order.total_amount ?? 0), locale)}.`,
          ),
          timestamp: String(order.created_at ?? new Date().toISOString()),
          tone: String(order.source_channel ?? '').includes('referral') ? 'success' as const : 'warning' as const,
        })),
      ]
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
        .slice(0, 10)

      return {
        metrics,
        referralLinks,
        recentSignals,
      }
    }, { organizationId })
  },
}
