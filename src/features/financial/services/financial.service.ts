import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type {
  EventFinancialClosureRow,
  EventPayoutRow,
  FinancialCostEntryRow,
  FinancialForecastRow,
  FinancialOverview,
  UpsertEventFinancialClosureInput,
  UpsertEventPayoutInput,
  UpsertFinancialCostEntryInput,
  UpsertFinancialForecastInput,
} from '@/features/financial/types'
import { buildEmptyFinancialOverview, buildFinancialOverview } from './financial.calculations'
import { assertFinancialResult, FinancialServiceError } from './financial.errors'
import {
  buildEventFinancialClosurePayload,
  buildEventPayoutPayload,
  buildFinancialCostEntryPayload,
  buildFinancialForecastPayload,
  mapEventFinancialClosureRow,
  mapEventPayoutRow,
  mapFinancialCostEntryRow,
  mapFinancialForecastRow,
  mapOrderFinancialSnapshot,
  mapPaymentFinancialSnapshot,
  mapStaffFinancialSnapshot,
  mapSupplierFinancialSnapshot,
  mapTransactionalMessageFinancialSnapshot,
} from './financial.payloads'

const financialApi = createApiClient('financial')

export const financialService = {
  async getFinancialOverview(organizationId: string): Promise<FinancialOverview> {
    return financialApi.query('get_financial_overview', async () => {
      const eventsResult = await supabase
        .from('events')
        .select('id,name,starts_at,status,total_capacity,sold_tickets')
        .eq('organization_id', organizationId)
        .order('starts_at', { ascending: false })

      assertFinancialResult(eventsResult)

      const events = filterExampleEvents(((eventsResult.data as Record<string, unknown>[] | null) ?? []).map((event) => ({
        id: String(event.id),
        name: String(event.name ?? ''),
        starts_at: String(event.starts_at ?? ''),
        status: (event.status as string | null | undefined) ?? null,
        total_capacity: event.total_capacity == null ? null : Number(event.total_capacity),
        sold_tickets: event.sold_tickets == null ? null : Number(event.sold_tickets),
      })))

      if (events.length === 0) {
        return buildEmptyFinancialOverview()
      }

      const eventIds = events.map((event) => event.id)

      const [ordersResult, costEntriesResult, suppliersResult, staffResult, payoutsResult, forecastsResult, closuresResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id,event_id,buyer_name,buyer_email,status,payment_method,subtotal,discount_amount,fee_amount,total_amount,created_at')
          .eq('organization_id', organizationId)
          .in('event_id', eventIds),
        supabase.from('cost_entries').select('*').eq('organization_id', organizationId),
        supabase.from('suppliers').select('id,event_id,company_name,contract_value,status').eq('organization_id', organizationId),
        supabase.from('staff_members').select('id,event_id,status,daily_rate,is_active,checked_in_at').eq('organization_id', organizationId),
        supabase.from('event_payouts').select('*').eq('organization_id', organizationId),
        supabase.from('financial_forecasts').select('*').eq('organization_id', organizationId),
        supabase.from('event_financial_closures').select('*').eq('organization_id', organizationId),
      ])

      assertFinancialResult(ordersResult)
      assertFinancialResult(costEntriesResult)
      assertFinancialResult(suppliersResult)
      assertFinancialResult(staffResult)
      assertFinancialResult(payoutsResult)
      assertFinancialResult(forecastsResult)
      assertFinancialResult(closuresResult)

      const orders = ((ordersResult.data as Record<string, unknown>[] | null) ?? []).map(mapOrderFinancialSnapshot)
      const orderIds = orders.map((order) => order.id)

      let paymentsRows: Record<string, unknown>[] = []
      let transactionalMessageRows: Record<string, unknown>[] = []

      if (orderIds.length > 0) {
        const [paymentsResult, transactionalMessagesResult] = await Promise.all([
          supabase.from('payments').select('id,order_id,event_id,status,amount,provider,paid_at,failed_at,refunded_at,created_at').in('order_id', orderIds),
          supabase.from('transactional_messages').select('id,order_id,event_id,template_key,status').in('order_id', orderIds),
        ])

        assertFinancialResult(paymentsResult)
        assertFinancialResult(transactionalMessagesResult)

        paymentsRows = (paymentsResult.data as Record<string, unknown>[] | null) ?? []
        transactionalMessageRows = (transactionalMessagesResult.data as Record<string, unknown>[] | null) ?? []
      }

      return buildFinancialOverview({
        events,
        orders,
        payments: paymentsRows.map(mapPaymentFinancialSnapshot),
        costs: ((costEntriesResult.data as Record<string, unknown>[] | null) ?? []).map(mapFinancialCostEntryRow),
        suppliers: ((suppliersResult.data as Record<string, unknown>[] | null) ?? []).map(mapSupplierFinancialSnapshot),
        staff: ((staffResult.data as Record<string, unknown>[] | null) ?? []).map(mapStaffFinancialSnapshot),
        transactionalMessages: transactionalMessageRows.map(mapTransactionalMessageFinancialSnapshot),
        payouts: ((payoutsResult.data as Record<string, unknown>[] | null) ?? []).map(mapEventPayoutRow),
        forecasts: ((forecastsResult.data as Record<string, unknown>[] | null) ?? []).map(mapFinancialForecastRow),
        closures: ((closuresResult.data as Record<string, unknown>[] | null) ?? []).map(mapEventFinancialClosureRow),
      })
    }, { organizationId })
  },

  async listCostEntries(organizationId: string, eventId?: string): Promise<FinancialCostEntryRow[]> {
    return financialApi.query('list_cost_entries', async () => {
      let query = supabase.from('cost_entries').select('*').eq('organization_id', organizationId).order('due_date', { ascending: true })

      if (eventId) {
        query = query.eq('event_id', eventId)
      }

      const result = await query
      assertFinancialResult(result)

      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapFinancialCostEntryRow)
    }, { organizationId, eventId: eventId ?? null })
  },

  async listEventPayouts(organizationId: string): Promise<EventPayoutRow[]> {
    return financialApi.query('list_event_payouts', async () => {
      const result = await supabase.from('event_payouts').select('*').eq('organization_id', organizationId).order('scheduled_at', { ascending: true })
      assertFinancialResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapEventPayoutRow)
    }, { organizationId })
  },

  async listFinancialForecasts(organizationId: string): Promise<FinancialForecastRow[]> {
    return financialApi.query('list_financial_forecasts', async () => {
      const result = await supabase.from('financial_forecasts').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false })
      assertFinancialResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapFinancialForecastRow)
    }, { organizationId })
  },

  async listEventFinancialClosures(organizationId: string): Promise<EventFinancialClosureRow[]> {
    return financialApi.query('list_event_financial_closures', async () => {
      const result = await supabase
        .from('event_financial_closures')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })

      assertFinancialResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapEventFinancialClosureRow)
    }, { organizationId })
  },

  async saveCostEntry(input: UpsertFinancialCostEntryInput) {
    return financialApi.mutation('save_cost_entry', async () => {
      const payload = buildFinancialCostEntryPayload(input.values, input.organizationId, input.eventId)
      const result = input.costEntryId
        ? await supabase.from('cost_entries').update(payload).eq('id', input.costEntryId).select('*').single()
        : await supabase.from('cost_entries').insert(payload).select('*').single()

      assertFinancialResult(result)

      if (!result.data) {
        throw new FinancialServiceError('Nao foi possivel salvar o lancamento financeiro.', 'financial_cost_entry_save_failed')
      }

      return mapFinancialCostEntryRow(result.data as Record<string, unknown>)
    }, { organizationId: input.organizationId, eventId: input.eventId ?? null, costEntryId: input.costEntryId ?? null })
  },

  async saveEventPayout(input: UpsertEventPayoutInput) {
    return financialApi.mutation('save_event_payout', async () => {
      const payload = buildEventPayoutPayload(input.values, input.organizationId)
      const result = input.payoutId
        ? await supabase.from('event_payouts').update(payload).eq('id', input.payoutId).select('*').single()
        : await supabase.from('event_payouts').upsert(payload, { onConflict: 'event_id' }).select('*').single()

      assertFinancialResult(result)

      if (!result.data) {
        throw new FinancialServiceError('Nao foi possivel salvar o repasse do evento.', 'event_payout_save_failed')
      }

      return mapEventPayoutRow(result.data as Record<string, unknown>)
    }, { organizationId: input.organizationId, payoutId: input.payoutId ?? null })
  },

  async saveFinancialForecast(input: UpsertFinancialForecastInput) {
    return financialApi.mutation('save_financial_forecast', async () => {
      const payload = buildFinancialForecastPayload(input.values, input.organizationId)
      const result = input.forecastId
        ? await supabase.from('financial_forecasts').update(payload).eq('id', input.forecastId).select('*').single()
        : await supabase.from('financial_forecasts').upsert(payload, { onConflict: 'event_id' }).select('*').single()

      assertFinancialResult(result)

      if (!result.data) {
        throw new FinancialServiceError('Nao foi possivel salvar o forecast financeiro.', 'financial_forecast_save_failed')
      }

      return mapFinancialForecastRow(result.data as Record<string, unknown>)
    }, { organizationId: input.organizationId, forecastId: input.forecastId ?? null })
  },

  async saveEventFinancialClosure(input: UpsertEventFinancialClosureInput) {
    return financialApi.mutation('save_event_financial_closure', async () => {
      const payload = buildEventFinancialClosurePayload(input.values, input.organizationId)
      const result = input.closureId
        ? await supabase.from('event_financial_closures').update(payload).eq('id', input.closureId).select('*').single()
        : await supabase.from('event_financial_closures').upsert(payload, { onConflict: 'event_id' }).select('*').single()

      assertFinancialResult(result)

      if (!result.data) {
        throw new FinancialServiceError('Nao foi possivel salvar o fechamento do evento.', 'event_financial_closure_save_failed')
      }

      return mapEventFinancialClosureRow(result.data as Record<string, unknown>)
    }, { organizationId: input.organizationId, closureId: input.closureId ?? null })
  },

  async deleteCostEntry(costEntryId: string) {
    return financialApi.mutation('delete_cost_entry', async () => {
      const result = await supabase.from('cost_entries').delete().eq('id', costEntryId)
      assertFinancialResult(result)
    }, { costEntryId })
  },
}
