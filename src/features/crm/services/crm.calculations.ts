import type {
  CrmEventOption,
  CrmOverview,
  CustomerAttendanceHistoryRow,
  CustomerAttendanceStatus,
  CustomerDetailBundle,
  CustomerLifecycleStatus,
  CustomerListRow,
  CustomerMetrics,
  CustomerOrderHistoryRow,
} from '@/features/crm/types'
import type { PersistedCustomerEventProfileSnapshot, PersistedCustomerSnapshot, StoredCustomerRecord } from './crm.payloads'
import { normalizeCustomerId } from './crm.payloads'

interface RawOrder {
  id: string
  event_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string | null
  buyer_cpf?: string | null
  total_amount: number
  status: string
  payment_method?: string | null
  paid_at?: string | null
  created_at: string
}

interface RawPayment {
  order_id: string
  status: string
  amount: number
}

interface RawDigitalTicket {
  id: string
  order_id: string
  event_id: string
  status: string
  checked_in_at?: string | null
}

interface RawCheckin {
  digital_ticket_id?: string | null
  result: string
  is_exit: boolean
  checked_in_at: string
}

interface RawEvent {
  id: string
  name: string
  starts_at: string
  status?: string | null
}

export interface BuildCrmOverviewParams {
  orders: RawOrder[]
  payments: RawPayment[]
  digitalTickets: RawDigitalTicket[]
  checkins: RawCheckin[]
  events: RawEvent[]
  storedCustomers: StoredCustomerRecord[]
}

export interface CrmCalculatedSnapshot {
  overview: CrmOverview
  detailMap: Record<string, CustomerDetailBundle>
  customerSnapshots: PersistedCustomerSnapshot[]
  customerEventSnapshots: PersistedCustomerEventProfileSnapshot[]
}

const CLOSED_ORDER_STATUSES = new Set(['paid', 'refunded', 'chargeback'])
const COMMERCIAL_ORDER_STATUSES = new Set(['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'chargeback'])

function toTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function pickLatestDate(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => toTimestamp(right) - toTimestamp(left))[0] ?? null
}

function pickEarliestDate(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => toTimestamp(left) - toTimestamp(right))[0] ?? null
}

function determineCustomerStatus(params: {
  totalOrders: number
  totalRevenue: number
  attendedEventsCount: number
  noShowCount: number
  lastPurchaseAt?: string | null
}): CustomerLifecycleStatus {
  const { totalOrders, totalRevenue, attendedEventsCount, noShowCount, lastPurchaseAt } = params
  const daysSinceLastPurchase = lastPurchaseAt ? (Date.now() - new Date(lastPurchaseAt).getTime()) / 86_400_000 : Infinity

  if (totalOrders <= 1 && daysSinceLastPurchase <= 30) {
    return 'new'
  }

  if (attendedEventsCount >= 2 || totalOrders >= 3 || totalRevenue >= 1000) {
    return 'loyal'
  }

  if (daysSinceLastPurchase <= 60) {
    return 'active'
  }

  if (noShowCount > 0 && noShowCount >= attendedEventsCount) {
    return 'at_risk'
  }

  return 'inactive'
}

function determineAttendanceStatus(params: {
  eventStartsAt?: string | null
  attendedCount: number
  noShowCount: number
}): CustomerAttendanceStatus {
  const { eventStartsAt, attendedCount, noShowCount } = params
  const eventTimestamp = eventStartsAt ? new Date(eventStartsAt).getTime() : 0

  if (eventTimestamp > Date.now()) {
    return 'upcoming'
  }

  if (attendedCount > 0) {
    return 'attended'
  }

  if (noShowCount > 0) {
    return 'no_show'
  }

  return 'ticket_issued'
}

function buildEventOptions(events: RawEvent[]): CrmEventOption[] {
  return [...events]
    .sort((left, right) => toTimestamp(right.starts_at) - toTimestamp(left.starts_at))
    .map((event) => ({
      id: event.id,
      name: event.name,
      starts_at: event.starts_at,
      status: event.status ?? null,
    }))
}

export function buildCrmOverview(params: BuildCrmOverviewParams): CrmCalculatedSnapshot {
  const { orders, payments, digitalTickets, checkins, events, storedCustomers } = params
  const eventMap = new Map(events.map((event) => [event.id, event]))
  const storedCustomerMap = new Map(storedCustomers.map((customer) => [customer.email, customer]))
  const ticketsByOrder = new Map<string, RawDigitalTicket[]>()
  const paymentByOrder = new Map<string, RawPayment>()
  const successfulCheckinTicketIds = new Set(
    checkins
      .filter((checkin) => checkin.result === 'success' && !checkin.is_exit)
      .map((checkin) => checkin.digital_ticket_id)
      .filter((value): value is string => Boolean(value)),
  )

  for (const payment of payments) {
    const existing = paymentByOrder.get(payment.order_id)

    if (!existing || (existing.status !== 'paid' && payment.status === 'paid')) {
      paymentByOrder.set(payment.order_id, payment)
    }
  }

  for (const ticket of digitalTickets) {
    const orderTickets = ticketsByOrder.get(ticket.order_id) ?? []
    orderTickets.push(ticket)
    ticketsByOrder.set(ticket.order_id, orderTickets)
  }

  const ordersByCustomer = new Map<string, RawOrder[]>()

  for (const order of orders) {
    const customerId = normalizeCustomerId(order.buyer_email)

    if (!customerId) {
      continue
    }

    const customerOrders = ordersByCustomer.get(customerId) ?? []
    customerOrders.push(order)
    ordersByCustomer.set(customerId, customerOrders)
  }

  const customers: CustomerListRow[] = []
  const detailMap: Record<string, CustomerDetailBundle> = {}
  const customerSnapshots: PersistedCustomerSnapshot[] = []
  const customerEventSnapshots: PersistedCustomerEventProfileSnapshot[] = []

  for (const [customerId, customerOrders] of ordersByCustomer.entries()) {
    const sortedOrders = [...customerOrders].sort((left, right) => toTimestamp(right.created_at) - toTimestamp(left.created_at))
    const commercialOrders = sortedOrders.filter((order) => COMMERCIAL_ORDER_STATUSES.has(order.status))
    const paidOrders = sortedOrders.filter((order) => CLOSED_ORDER_STATUSES.has(order.status) || paymentByOrder.get(order.id)?.status === 'paid')
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalOrders = commercialOrders.length
    const averageTicket = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0
    const storedCustomer = storedCustomerMap.get(customerId)
    const lastPaidOrder = [...paidOrders].sort((left, right) => toTimestamp(right.paid_at ?? right.created_at) - toTimestamp(left.paid_at ?? left.created_at))[0]
    const lastPurchaseAt = lastPaidOrder?.paid_at ?? lastPaidOrder?.created_at ?? sortedOrders[0]?.created_at ?? null
    const firstOrderAt = pickEarliestDate(sortedOrders.map((order) => order.created_at))

    const orderHistory: CustomerOrderHistoryRow[] = sortedOrders.map((order) => {
      const payment = paymentByOrder.get(order.id)
      const orderTickets = ticketsByOrder.get(order.id) ?? []
      const event = eventMap.get(order.event_id)

      return {
        id: order.id,
        event_id: order.event_id,
        event_name: event?.name ?? 'Evento removido',
        event_starts_at: event?.starts_at ?? null,
        status: order.status,
        payment_status: payment?.status ?? (order.status === 'paid' ? 'paid' : 'pending'),
        payment_method: order.payment_method ?? null,
        total_amount: order.total_amount,
        tickets_count: orderTickets.length,
        created_at: order.created_at,
        paid_at: order.paid_at ?? null,
      }
    })

    const orderEventIds = [...new Set(sortedOrders.map((order) => order.event_id))]
    const attendanceHistory: CustomerAttendanceHistoryRow[] = orderEventIds
      .map((eventId) => {
        const event = eventMap.get(eventId)
        const eventOrders = sortedOrders.filter((order) => order.event_id === eventId)
        const eventTickets = eventOrders.flatMap((order) => ticketsByOrder.get(order.id) ?? [])
        const attendedCount = eventTickets.filter((ticket) => Boolean(ticket.checked_in_at) || successfulCheckinTicketIds.has(ticket.id)).length
        const eventHasPassed = event?.starts_at ? new Date(event.starts_at).getTime() <= Date.now() : false
        const noShowCount = eventHasPassed ? Math.max(0, eventTickets.length - attendedCount) : 0
        const grossRevenue = eventOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const netRevenue = eventOrders
          .filter((order) => CLOSED_ORDER_STATUSES.has(order.status) || paymentByOrder.get(order.id)?.status === 'paid')
          .reduce((sum, order) => sum + order.total_amount, 0)
        const firstInteractionAt = pickEarliestDate(eventOrders.map((order) => order.created_at))
        const lastInteractionAt = pickLatestDate([
          ...eventOrders.map((order) => order.paid_at ?? order.created_at),
          ...eventTickets.map((ticket) => ticket.checked_in_at),
        ])

        return {
          event_id: eventId,
          event_name: event?.name ?? 'Evento removido',
          event_starts_at: event?.starts_at ?? null,
          tickets_count: eventTickets.length,
          attended_count: attendedCount,
          no_show_count: noShowCount,
          gross_revenue: grossRevenue,
          net_revenue: netRevenue,
          status: determineAttendanceStatus({
            eventStartsAt: event?.starts_at ?? null,
            attendedCount,
            noShowCount,
          }),
          first_interaction_at: firstInteractionAt,
          last_interaction_at: lastInteractionAt,
        }
      })
      .sort((left, right) => toTimestamp(right.last_interaction_at ?? right.event_starts_at) - toTimestamp(left.last_interaction_at ?? left.event_starts_at))

    const attendedEventsCount = attendanceHistory.filter((item) => item.attended_count > 0).length
    const noShowCount = attendanceHistory.reduce((sum, item) => sum + item.no_show_count, 0)
    const lastAttendanceAt = pickLatestDate(
      sortedOrders.flatMap((order) =>
        (ticketsByOrder.get(order.id) ?? [])
          .filter((ticket) => Boolean(ticket.checked_in_at) || successfulCheckinTicketIds.has(ticket.id))
          .map((ticket) => ticket.checked_in_at ?? null),
      ),
    )
    const status = determineCustomerStatus({
      totalOrders,
      totalRevenue,
      attendedEventsCount,
      noShowCount,
      lastPurchaseAt,
    })
    const latestEvent = attendanceHistory[0]
    const latestOrder = sortedOrders[0]

    const customer: CustomerListRow = {
      id: customerId,
      record_id: storedCustomer?.id ?? null,
      full_name: storedCustomer?.full_name || latestOrder?.buyer_name || 'Cliente sem nome',
      email: customerId,
      phone: storedCustomer?.phone ?? latestOrder?.buyer_phone ?? null,
      document: storedCustomer?.document ?? latestOrder?.buyer_cpf ?? null,
      tags: storedCustomer?.tags ?? [],
      notes: storedCustomer?.notes ?? null,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_ticket: averageTicket,
      attended_events_count: attendedEventsCount,
      no_show_count: noShowCount,
      first_order_at: storedCustomer?.first_order_at ?? firstOrderAt,
      last_purchase_at: storedCustomer?.last_order_at ?? lastPurchaseAt,
      last_attendance_at: lastAttendanceAt,
      last_event_name: latestEvent?.event_name ?? null,
      last_event_at: latestEvent?.event_starts_at ?? null,
      status,
      event_ids: attendanceHistory.map((item) => item.event_id),
    }

    const metrics: CustomerMetrics = {
      total_orders: customer.total_orders,
      total_revenue: customer.total_revenue,
      average_ticket: customer.average_ticket,
      attended_events_count: customer.attended_events_count,
      no_show_count: customer.no_show_count,
      last_purchase_at: customer.last_purchase_at,
      last_attendance_at: customer.last_attendance_at,
    }

    detailMap[customerId] = {
      customer,
      metrics,
      orderHistory,
      attendanceHistory,
    }

    customers.push(customer)
    customerSnapshots.push({
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
    })

    for (const eventProfile of attendanceHistory) {
      customerEventSnapshots.push({
        customer_email: customer.email,
        event_id: eventProfile.event_id,
        orders_count: orderHistory.filter((order) => order.event_id === eventProfile.event_id).length,
        tickets_count: eventProfile.tickets_count,
        attended_count: eventProfile.attended_count,
        no_show_count: eventProfile.no_show_count,
        gross_revenue: eventProfile.gross_revenue,
        net_revenue: eventProfile.net_revenue,
        first_interaction_at: eventProfile.first_interaction_at ?? null,
        last_interaction_at: eventProfile.last_interaction_at ?? null,
      })
    }
  }

  const sortedCustomers = [...customers].sort((left, right) => toTimestamp(right.last_purchase_at ?? right.first_order_at) - toTimestamp(left.last_purchase_at ?? left.first_order_at))
  const totalRevenue = sortedCustomers.reduce((sum, customer) => sum + customer.total_revenue, 0)

  return {
    overview: {
      events: buildEventOptions(events),
      customers: sortedCustomers,
      summary: {
        total_customers: sortedCustomers.length,
        active_customers: sortedCustomers.filter((customer) => customer.status === 'new' || customer.status === 'active' || customer.status === 'loyal').length,
        repeat_customers: sortedCustomers.filter((customer) => customer.total_orders >= 2).length,
        total_revenue: totalRevenue,
        average_ticket: sortedCustomers.length > 0 ? Number((totalRevenue / sortedCustomers.length).toFixed(2)) : 0,
        no_show_risk_customers: sortedCustomers.filter((customer) => customer.no_show_count > 0 && customer.status === 'at_risk').length,
      },
    },
    detailMap,
    customerSnapshots,
    customerEventSnapshots,
  }
}
