import { supabase } from '@/lib/supabase'
import type {
  FinancialCostEntryRow,
  FinancialOverview,
  UpsertFinancialCostEntryInput,
} from '@/features/financial/types'
import { assertFinancialResult, FinancialServiceError } from './financial.errors'
import {
  buildFinancialCostEntryPayload,
  mapFinancialCostEntryRow,
  mapOrderFinancialSnapshot,
  mapPaymentFinancialSnapshot,
  mapStaffFinancialSnapshot,
  mapSupplierFinancialSnapshot,
  mapTransactionalMessageFinancialSnapshot,
} from './financial.payloads'
import { buildFinancialOverview } from './financial.calculations'

export const financialService = {
  async getFinancialOverview(organizationId: string): Promise<FinancialOverview> {
    const eventsResult = await supabase
      .from('events')
      .select('id,name,starts_at')
      .eq('organization_id', organizationId)
      .order('starts_at', { ascending: false })

    assertFinancialResult(eventsResult)

    const events = ((eventsResult.data as Record<string, unknown>[] | null) ?? []).map((event) => ({
      id: String(event.id),
      name: String(event.name ?? ''),
      starts_at: String(event.starts_at ?? ''),
    }))

    if (events.length === 0) {
      return {
        events: [],
        reports: [],
        reconciliation_rows: [],
        unallocated_costs: 0,
        gross_sales: 0,
        net_sales: 0,
        approved_payments_amount: 0,
        approved_payments_count: 0,
        failed_payments_amount: 0,
        refunded_amount: 0,
        chargeback_amount: 0,
        operational_costs: 0,
        result: 0,
        margin_percent: 0,
        divergence_count: 0,
        pending_reconciliation_count: 0,
      }
    }

    const eventIds = events.map((event) => event.id)

    const [ordersResult, costEntriesResult, suppliersResult, staffResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id,event_id,buyer_name,buyer_email,status,payment_method,subtotal,discount_amount,fee_amount,total_amount,created_at')
        .eq('organization_id', organizationId)
        .in('event_id', eventIds),
      supabase
        .from('cost_entries')
        .select('*')
        .eq('organization_id', organizationId),
      supabase
        .from('suppliers')
        .select('id,event_id,company_name,contract_value,status')
        .eq('organization_id', organizationId),
      supabase
        .from('staff_members')
        .select('id,event_id,status,daily_rate,is_active,checked_in_at')
        .eq('organization_id', organizationId),
    ])

    assertFinancialResult(ordersResult)
    assertFinancialResult(costEntriesResult)
    assertFinancialResult(suppliersResult)
    assertFinancialResult(staffResult)

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
    })
  },

  async listCostEntries(organizationId: string, eventId?: string): Promise<FinancialCostEntryRow[]> {
    let query = supabase
      .from('cost_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .order('due_date', { ascending: true })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const result = await query
    assertFinancialResult(result)

    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapFinancialCostEntryRow)
  },

  async saveCostEntry(input: UpsertFinancialCostEntryInput) {
    const payload = buildFinancialCostEntryPayload(input.values, input.organizationId, input.eventId)
    const result = input.costEntryId
      ? await supabase.from('cost_entries').update(payload).eq('id', input.costEntryId).select('*').single()
      : await supabase.from('cost_entries').insert(payload).select('*').single()

    assertFinancialResult(result)

    if (!result.data) {
      throw new FinancialServiceError('Nao foi possivel salvar o lancamento financeiro.', 'financial_cost_entry_save_failed')
    }

    return mapFinancialCostEntryRow(result.data as Record<string, unknown>)
  },

  async deleteCostEntry(costEntryId: string) {
    const result = await supabase.from('cost_entries').delete().eq('id', costEntryId)
    assertFinancialResult(result)
  },
}
