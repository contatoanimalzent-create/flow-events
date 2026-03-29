import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { financialService } from '@/features/financial/services'
import type { AcknowledgeIntelligenceAlertInput, IntelligenceAlertStateRow, IntelligenceOverview } from '@/features/intelligence/types'
import { buildIntelligenceOverview } from './intelligence.calculations'
import { buildConsistencyIssues } from './intelligence.consistency'
import { assertIntelligenceResult, IntelligenceServiceError } from './intelligence.errors'
import { buildAlertAcknowledgementPayload, mapIntelligenceAlertStateRow } from './intelligence.payloads'

const intelligenceApi = createApiClient('intelligence')

export const intelligenceService = {
  async getOverview(organizationId: string): Promise<IntelligenceOverview> {
    return intelligenceApi.request('get_overview', async () => {
      const eventsResult = await supabase
        .from('events')
        .select('id,name,starts_at,status,sold_tickets,checked_in_count')
        .eq('organization_id', organizationId)
        .in('status', ['published', 'ongoing', 'finished', 'archived'])
        .order('starts_at', { ascending: false })

      assertIntelligenceResult(eventsResult)

      const events = filterExampleEvents(((eventsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        starts_at: String(row.starts_at ?? ''),
        status: String(row.status ?? 'draft'),
        sold_tickets: Number(row.sold_tickets ?? 0),
        checked_in_count: Number(row.checked_in_count ?? 0),
      })))

      if (events.length === 0) {
        return {
          health_scores: [],
          alerts: [],
          recommendations: [],
          consistency: {
            issues: [],
            summary: {
              total_issues: 0,
              critical_issues: 0,
              warning_issues: 0,
              open_issues: 0,
              resolved_issues: 0,
            },
          },
          summary: {
            average_overall_health: 0,
            active_alerts_count: 0,
            acknowledged_alerts_count: 0,
            critical_alerts_count: 0,
            high_risk_events_count: 0,
            consistency_issues_count: 0,
            critical_consistency_issues_count: 0,
          },
        }
      }

      const eventIds = events.map((event) => event.id)

      const [
        batchesResult,
        gatesResult,
        staffResult,
        checkinsResult,
        alertStatesResult,
        financialOverview,
        ordersResult,
        paymentsResult,
        digitalTicketsResult,
        campaignRunsResult,
        campaignRecipientsResult,
        customersResult,
        customerProfilesResult,
      ] = await Promise.all([
        supabase.from('ticket_batches').select('id,event_id,name,quantity,sold_count,reserved_count,is_active').in('event_id', eventIds),
        supabase.from('gates').select('id,event_id,name,is_active,device_count,throughput_per_hour').in('event_id', eventIds),
        supabase.from('staff_members').select('id,event_id,gate_id,status,is_active').eq('organization_id', organizationId).in('event_id', eventIds),
        supabase.from('checkins').select('id,event_id,gate_id,digital_ticket_id,result,checked_in_at,is_exit').in('event_id', eventIds).order('checked_in_at', { ascending: false }).limit(2000),
        supabase.from('intelligence_alert_states').select('*').eq('organization_id', organizationId),
        financialService.getFinancialOverview(organizationId),
        supabase.from('orders').select('id,event_id,status,total_amount,created_at').eq('organization_id', organizationId).in('event_id', eventIds),
        supabase.from('payments').select('id,order_id,event_id,status').eq('organization_id', organizationId),
        supabase.from('digital_tickets').select('id,event_id,order_item_id,created_at').in('event_id', eventIds),
        supabase.from('campaign_runs').select('id,event_id,name,audience_count,created_at').eq('organization_id', organizationId),
        supabase.from('campaign_run_recipients').select('id,campaign_run_id').eq('organization_id', organizationId),
        supabase.from('customers').select('id,full_name,total_orders,created_at').eq('organization_id', organizationId),
        supabase.from('customer_event_profiles').select('customer_id').eq('organization_id', organizationId),
      ])

      assertIntelligenceResult(batchesResult)
      assertIntelligenceResult(gatesResult)
      assertIntelligenceResult(staffResult)
      assertIntelligenceResult(checkinsResult)
      assertIntelligenceResult(alertStatesResult)
      assertIntelligenceResult(ordersResult)
      assertIntelligenceResult(paymentsResult)
      assertIntelligenceResult(digitalTicketsResult)
      assertIntelligenceResult(campaignRunsResult)
      assertIntelligenceResult(campaignRecipientsResult)
      assertIntelligenceResult(customersResult)
      assertIntelligenceResult(customerProfilesResult)

      const orderIds = ((ordersResult.data as Record<string, unknown>[] | null) ?? []).map((row) => String(row.id))
      const orderItemsResult = orderIds.length > 0
        ? await supabase.from('order_items').select('id').in('order_id', orderIds)
        : { data: [], error: null }

      assertIntelligenceResult(orderItemsResult)

      const overview = buildIntelligenceOverview({
        events,
        financialReports: financialOverview.reports,
        batches: ((batchesResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id),
          name: String(row.name ?? ''),
          quantity: Number(row.quantity ?? 0),
          sold_count: Number(row.sold_count ?? 0),
          reserved_count: Number(row.reserved_count ?? 0),
          is_active: Boolean(row.is_active),
        })),
        gates: ((gatesResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id),
          name: String(row.name ?? ''),
          is_active: Boolean(row.is_active),
          device_count: Number(row.device_count ?? 0),
          throughput_per_hour: Number(row.throughput_per_hour ?? 0),
        })),
        staff: ((staffResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id ?? ''),
          gate_id: (row.gate_id as string | null | undefined) ?? null,
          status: String(row.status ?? ''),
          is_active: Boolean(row.is_active),
        })),
        checkins: ((checkinsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id),
          gate_id: (row.gate_id as string | null | undefined) ?? null,
          result: String(row.result ?? ''),
          checked_in_at: String(row.checked_in_at ?? ''),
          is_exit: Boolean(row.is_exit),
        })),
        alertStates: ((alertStatesResult.data as Record<string, unknown>[] | null) ?? []).map(mapIntelligenceAlertStateRow),
      })

      const consistency = buildConsistencyIssues({
        events: events.map((event) => ({ id: event.id, name: event.name })),
        orders: ((ordersResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id ?? ''),
          status: String(row.status ?? ''),
          total_amount: Number(row.total_amount ?? 0),
          created_at: String(row.created_at ?? new Date().toISOString()),
        })),
        payments: ((paymentsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          order_id: String(row.order_id ?? ''),
          event_id: (row.event_id as string | null | undefined) ?? null,
          status: String(row.status ?? ''),
        })),
        digitalTickets: ((digitalTicketsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: (row.event_id as string | null | undefined) ?? null,
          order_item_id: (row.order_item_id as string | null | undefined) ?? null,
          created_at: String(row.created_at ?? new Date().toISOString()),
        })),
        orderItemIds: ((orderItemsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => String(row.id)),
        checkins: ((checkinsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: String(row.event_id ?? ''),
          digital_ticket_id: (row.digital_ticket_id as string | null | undefined) ?? null,
          result: String(row.result ?? ''),
          is_exit: Boolean(row.is_exit),
          checked_in_at: String(row.checked_in_at ?? new Date().toISOString()),
        })),
        campaignRuns: ((campaignRunsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          event_id: (row.event_id as string | null | undefined) ?? null,
          name: String(row.name ?? ''),
          audience_count: Number(row.audience_count ?? 0),
          created_at: String(row.created_at ?? new Date().toISOString()),
        })),
        campaignRecipients: ((campaignRecipientsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          campaign_run_id: String(row.campaign_run_id ?? ''),
        })),
        customers: ((customersResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          id: String(row.id),
          full_name: String(row.full_name ?? 'Customer'),
          total_orders: Number(row.total_orders ?? 0),
          created_at: String(row.created_at ?? new Date().toISOString()),
        })),
        customerProfiles: ((customerProfilesResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
          customer_id: String(row.customer_id ?? ''),
        })),
        financialOverview,
      })

      return {
        ...overview,
        consistency,
        summary: {
          ...overview.summary,
          consistency_issues_count: consistency.summary.total_issues,
          critical_consistency_issues_count: consistency.summary.critical_issues,
        },
      }
    }, { organizationId })
  },

  async listAlertStates(organizationId: string): Promise<IntelligenceAlertStateRow[]> {
    return intelligenceApi.request('list_alert_states', async () => {
      const result = await supabase.from('intelligence_alert_states').select('*').eq('organization_id', organizationId).order('updated_at', { ascending: false })
      assertIntelligenceResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapIntelligenceAlertStateRow)
    }, { organizationId })
  },

  async acknowledgeAlert(input: AcknowledgeIntelligenceAlertInput) {
    return intelligenceApi.request('acknowledge_alert', async () => {
      if (!input.alertId) {
        throw new IntelligenceServiceError('Alerta invalido para acknowledgement.', 'alert_acknowledgement_invalid')
      }

      const result = await supabase
        .from('intelligence_alert_states')
        .upsert(buildAlertAcknowledgementPayload(input), { onConflict: 'organization_id,alert_id' })
        .select('*')
        .single()

      assertIntelligenceResult(result)
      return result.data ? mapIntelligenceAlertStateRow(result.data as Record<string, unknown>) : null
    }, { organizationId: input.organizationId, alertId: input.alertId })
  },
}
