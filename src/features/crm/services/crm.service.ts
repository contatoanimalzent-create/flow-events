import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type {
  CrmOverview,
  CustomerDetailBundle,
  CustomerListRow,
  CustomerMetrics,
  CustomerOrderHistoryRow,
  UpdateCustomerNotesInput,
  UpdateCustomerTagsInput,
} from '@/features/crm/types'
import { buildCrmOverview, type CrmCalculatedSnapshot } from './crm.calculations'
import { assertCrmResult, CrmServiceError } from './crm.errors'
import {
  buildCustomerEventProfileUpsertPayload,
  buildCustomerUpsertPayload,
  mapStoredCustomerRecord,
  normalizeCustomerId,
} from './crm.payloads'

const crmApi = createApiClient('crm')

function isTableMissingError(message?: string) {
  const normalizedMessage = String(message ?? '').toLowerCase()
  return normalizedMessage.includes('does not exist') || normalizedMessage.includes('could not find the table')
}

function isPermissionError(message?: string) {
  const normalizedMessage = String(message ?? '').toLowerCase()
  return normalizedMessage.includes('permission denied') || normalizedMessage.includes('insufficient privilege')
}

async function listStoredCustomers(organizationId: string) {
  return crmApi.query('list_stored_customers', async () => {
    const result = await supabase.from('customers').select('*').eq('organization_id', organizationId)

    if (result.error) {
      if (isTableMissingError(result.error.message)) {
        return []
      }

      throw new CrmServiceError(result.error.message)
    }

    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapStoredCustomerRecord)
  }, { organizationId })
}

async function persistCustomerSnapshots(snapshot: CrmCalculatedSnapshot, organizationId: string) {
  return crmApi.mutation('persist_customer_snapshots', async () => {
    if (snapshot.customerSnapshots.length === 0) {
      return
    }

    const customersResult = await supabase
      .from('customers')
      .upsert(
        snapshot.customerSnapshots.map((item) => buildCustomerUpsertPayload(item, organizationId)),
        { onConflict: 'organization_id,email' },
      )
      .select('id,email')

    if (customersResult.error) {
      if (isTableMissingError(customersResult.error.message)) {
        return
      }

      throw new CrmServiceError(customersResult.error.message)
    }

    const customerIdByEmail = new Map(
      (((customersResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => [normalizeCustomerId(String(row.email ?? '')), String(row.id)]),
    )

    const eventProfilePayloads = snapshot.customerEventSnapshots
      .map((item) => {
        const customerId = customerIdByEmail.get(normalizeCustomerId(item.customer_email))
        return customerId ? buildCustomerEventProfileUpsertPayload(item, organizationId, customerId) : null
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    if (eventProfilePayloads.length === 0) {
      return
    }

    const profilesResult = await supabase
      .from('customer_event_profiles')
      .upsert(eventProfilePayloads, { onConflict: 'organization_id,customer_id,event_id' })

    if (profilesResult.error && !isTableMissingError(profilesResult.error.message)) {
      throw new CrmServiceError(profilesResult.error.message)
    }
  }, { organizationId, customerCount: snapshot.customerSnapshots.length })
}

async function buildSnapshot(organizationId: string) {
  return crmApi.query('build_snapshot', async () => {
    const [ordersResult, paymentsResult, digitalTicketsResult, checkinsResult, eventsResult, storedCustomers] = await Promise.all([
      supabase
        .from('orders')
        .select('id,event_id,buyer_name,buyer_email,buyer_phone,buyer_cpf,total_amount,status,payment_method,paid_at,created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }),
      supabase.from('payments').select('order_id,status,amount').eq('organization_id', organizationId),
      supabase.from('digital_tickets').select('id,order_id,event_id,status,checked_in_at'),
      // Limita checkins aos últimos 30 dias (vs 5000 sem limite)
      supabase.from('checkins')
        .select('digital_ticket_id,result,is_exit,checked_in_at')
        .gte('checked_in_at', new Date(Date.now() - 30 * 86_400_000).toISOString())
        .order('checked_in_at', { ascending: false })
        .limit(1000),
      supabase.from('events').select('id,name,starts_at,status').eq('organization_id', organizationId).order('starts_at', { ascending: false }),
      listStoredCustomers(organizationId),
    ])

    assertCrmResult(ordersResult)
    assertCrmResult(paymentsResult)
    if (digitalTicketsResult.error && !isTableMissingError(digitalTicketsResult.error.message) && !isPermissionError(digitalTicketsResult.error.message)) {
      throw new CrmServiceError(digitalTicketsResult.error.message)
    }
    assertCrmResult(checkinsResult)
    assertCrmResult(eventsResult)

    const resolvedDigitalTickets = digitalTicketsResult.error ? [] : ((digitalTicketsResult.data as Record<string, unknown>[] | null) ?? [])

    const orderIds = new Set((((ordersResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => String(row.id)))

    const snapshot = buildCrmOverview({
      orders: (((ordersResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
        id: String(row.id),
        event_id: String(row.event_id ?? ''),
        buyer_name: String(row.buyer_name ?? ''),
        buyer_email: normalizeCustomerId(String(row.buyer_email ?? '')),
        buyer_phone: (row.buyer_phone as string | null | undefined) ?? null,
        buyer_cpf: (row.buyer_cpf as string | null | undefined) ?? null,
        total_amount: Number(row.total_amount ?? 0),
        status: String(row.status ?? 'draft'),
        payment_method: (row.payment_method as string | null | undefined) ?? null,
        paid_at: (row.paid_at as string | null | undefined) ?? null,
        created_at: String(row.created_at ?? new Date().toISOString()),
      })),
      payments: (((paymentsResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
        order_id: String(row.order_id ?? ''),
        status: String(row.status ?? 'pending'),
        amount: Number(row.amount ?? 0),
      })),
      digitalTickets: resolvedDigitalTickets
        .filter((row) => orderIds.has(String(row.order_id)))
        .map((row) => ({
          id: String(row.id),
          order_id: String(row.order_id ?? ''),
          event_id: String(row.event_id ?? ''),
          status: String(row.status ?? 'confirmed'),
          checked_in_at: (row.checked_in_at as string | null | undefined) ?? null,
        })),
      checkins: (((checkinsResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
        digital_ticket_id: (row.digital_ticket_id as string | null | undefined) ?? null,
        result: String(row.result ?? 'invalid'),
        is_exit: Boolean(row.is_exit),
        checked_in_at: String(row.checked_in_at ?? new Date().toISOString()),
      })),
      events: filterExampleEvents((((eventsResult.data as Record<string, unknown>[] | null) ?? []))).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        starts_at: String(row.starts_at ?? ''),
        status: (row.status as string | null | undefined) ?? null,
      })),
      storedCustomers,
    })

    await persistCustomerSnapshots(snapshot, organizationId)

    return snapshot
  }, { organizationId })
}

async function ensurePersistedCustomerRecord(organizationId: string, customerId: string) {
  return crmApi.mutation('ensure_persisted_customer_record', async () => {
    const snapshot = await buildSnapshot(organizationId)
    const customer = snapshot.detailMap[normalizeCustomerId(customerId)]?.customer

    if (!customer) {
      throw new CrmServiceError('Cliente nao encontrado', 'customer_not_found')
    }

    const result = await supabase
      .from('customers')
      .upsert(
        buildCustomerUpsertPayload(
          {
            email: customer.email,
            full_name: customer.full_name,
            phone: customer.phone ?? null,
            document: customer.document ?? null,
            tags: customer.tags,
            notes: customer.notes ?? null,
            first_order_at: customer.first_order_at ?? null,
            last_order_at: customer.last_purchase_at ?? null,
            total_orders: customer.total_orders,
            total_spent: customer.total_revenue,
          },
          organizationId,
        ),
        { onConflict: 'organization_id,email' },
      )
      .select('*')
      .single()

    if (result.error) {
      throw new CrmServiceError(result.error.message)
    }

    return result.data as Record<string, unknown>
  }, { organizationId, customerId })
}

export const crmService = {
  async getOverview(organizationId: string): Promise<CrmOverview> {
    return crmApi.query('get_overview', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.overview
    }, { organizationId })
  },

  async listCustomers(organizationId: string): Promise<CustomerListRow[]> {
    return crmApi.query('list_customers', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.overview.customers
    }, { organizationId })
  },

  async getCustomerById(organizationId: string, customerId: string): Promise<CustomerListRow | null> {
    return crmApi.query('get_customer_by_id', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.detailMap[normalizeCustomerId(customerId)]?.customer ?? null
    }, { organizationId, customerId })
  },

  async getCustomerOrderHistory(organizationId: string, customerId: string): Promise<CustomerOrderHistoryRow[]> {
    return crmApi.query('get_customer_order_history', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.detailMap[normalizeCustomerId(customerId)]?.orderHistory ?? []
    }, { organizationId, customerId })
  },

  async getCustomerAttendanceHistory(organizationId: string, customerId: string) {
    return crmApi.query('get_customer_attendance_history', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.detailMap[normalizeCustomerId(customerId)]?.attendanceHistory ?? []
    }, { organizationId, customerId })
  },

  async getCustomerMetrics(organizationId: string, customerId: string): Promise<CustomerMetrics | null> {
    return crmApi.query('get_customer_metrics', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return snapshot.detailMap[normalizeCustomerId(customerId)]?.metrics ?? null
    }, { organizationId, customerId })
  },

  async getCustomerDetailBundle(organizationId: string, customerId: string): Promise<CustomerDetailBundle> {
    return crmApi.query('get_customer_detail_bundle', async () => {
      const snapshot = await buildSnapshot(organizationId)
      return (
        snapshot.detailMap[normalizeCustomerId(customerId)] ?? {
          customer: null,
          metrics: null,
          orderHistory: [],
          attendanceHistory: [],
        }
      )
    }, { organizationId, customerId })
  },

  async updateCustomerTags(input: UpdateCustomerTagsInput) {
    return crmApi.mutation('update_customer_tags', async () => {
      const current = await ensurePersistedCustomerRecord(input.organizationId, input.customerId)

      const result = await supabase
        .from('customers')
        .update({
          tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
        })
        .eq('id', String(current.id))
        .select('*')
        .single()

      assertCrmResult(result)
      return result.data
    }, { organizationId: input.organizationId, customerId: input.customerId, tagsCount: input.tags.length })
  },

  async updateCustomerNotes(input: UpdateCustomerNotesInput) {
    return crmApi.mutation('update_customer_notes', async () => {
      const current = await ensurePersistedCustomerRecord(input.organizationId, input.customerId)

      const result = await supabase
        .from('customers')
        .update({
          notes: input.notes.trim() || null,
        })
        .eq('id', String(current.id))
        .select('*')
        .single()

      assertCrmResult(result)
      return result.data
    }, { organizationId: input.organizationId, customerId: input.customerId })
  },
}
