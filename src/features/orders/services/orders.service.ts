import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type {
  CreateOrderDraftInput,
  DigitalTicketRow,
  OrderDetailBundle,
  OrdersEventScope,
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from '@/features/orders/types'
import { assertOrdersResult, OrdersServiceError } from './orders.errors'
import {
  buildDigitalTicketInsertPayload,
  buildOrderItemPayloads,
  mapDigitalTicketRow,
  mapOrderItemRow,
  mapOrderRow,
} from './orders.payloads'
import {
  buildDefaultOrderExpiration,
  confirmOrderAndCaptureInventory,
  createOrderDraftWithReservations,
  expireStaleOrderDrafts,
  releaseOrderInventory,
} from './orders.inventory'

const ordersApi = createApiClient('orders')

export const ordersService = {
  async listOrderEvents(organizationId: string): Promise<OrdersEventScope[]> {
    return ordersApi.query('list_order_events', async () => {
      const result = await supabase
        .from('events')
        .select('id,name')
        .eq('organization_id', organizationId)
        .order('starts_at', { ascending: false })

      assertOrdersResult(result)
      return filterExampleEvents(((result.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
      })))
    }, { organizationId })
  },

  async listOrdersByEvent(eventId: string): Promise<OrderRow[]> {
    return ordersApi.query('list_orders_by_event', async () => {
      const result = await supabase.from('orders').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      assertOrdersResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapOrderRow)
    }, { eventId })
  },

  async getOrderById(orderId: string): Promise<OrderRow | null> {
    return ordersApi.query('get_order_by_id', async () => {
      const result = await supabase.from('orders').select('*').eq('id', orderId).single()
      assertOrdersResult(result)
      return result.data ? mapOrderRow(result.data as Record<string, unknown>) : null
    }, { orderId })
  },

  async listOrderItemsByOrder(orderId: string): Promise<OrderItemRow[]> {
    return ordersApi.query('list_order_items_by_order', async () => {
      const result = await supabase
        .from('order_items')
        .select('*, ticket_type:ticket_types(name), batch:ticket_batches(name)')
        .eq('order_id', orderId)

      assertOrdersResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapOrderItemRow)
    }, { orderId })
  },

  async createOrderDraft(input: CreateOrderDraftInput): Promise<OrderRow> {
    return ordersApi.mutation('create_order_draft', async () => {
      return createOrderDraftWithReservations({
        ...input,
        expires_at: input.expires_at ?? buildDefaultOrderExpiration(),
      })
    }, { organizationId: input.organization_id, eventId: input.event_id, itemsCount: input.items.length })
  },

  async addOrderItems(orderId: string, items: CreateOrderDraftInput['items']) {
    return ordersApi.mutation('add_order_items', async () => {
      const result = await supabase.from('order_items').insert(buildOrderItemPayloads(orderId, items))
      assertOrdersResult(result)
    }, { orderId, itemsCount: items.length })
  },

  async confirmOrder(orderId: string, paymentMethod?: OrderRow['payment_method']) {
    return ordersApi.mutation('confirm_order', async () => {
      return confirmOrderAndCaptureInventory(orderId, paymentMethod)
    }, { orderId, paymentMethod: paymentMethod ?? null })
  },

  async cancelOrder(orderId: string) {
    return ordersApi.mutation('cancel_order', async () => {
      const order = await this.getOrderById(orderId)

      if (!order) {
        throw new OrdersServiceError('Pedido nao encontrado', 'order_not_found')
      }

      if (order.status === 'paid') {
        const result = await supabase
          .from('orders')
          .update({ status: 'cancelled' satisfies OrderStatus })
          .eq('id', orderId)
          .select('*')
          .single()

        assertOrdersResult(result)
        return result.data ? mapOrderRow(result.data as Record<string, unknown>) : null
      }

      return releaseOrderInventory(orderId, 'cancelled')
    }, { orderId })
  },

  async expireOrder(orderId: string) {
    return ordersApi.mutation('expire_order', async () => releaseOrderInventory(orderId, 'expired'), { orderId })
  },

  async listDigitalTicketsByOrder(orderId: string): Promise<DigitalTicketRow[]> {
    return ordersApi.query('list_digital_tickets_by_order', async () => {
      const result = await supabase.from('digital_tickets').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
      assertOrdersResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapDigitalTicketRow)
    }, { orderId })
  },

  async getDigitalTicketById(digitalTicketId: string): Promise<DigitalTicketRow | null> {
    return ordersApi.query('get_digital_ticket_by_id', async () => {
      const result = await supabase.from('digital_tickets').select('*').eq('id', digitalTicketId).single()
      assertOrdersResult(result)
      return result.data ? mapDigitalTicketRow(result.data as Record<string, unknown>) : null
    }, { digitalTicketId })
  },

  async issueDigitalTicketsForOrder(orderId: string): Promise<DigitalTicketRow[]> {
    return ordersApi.mutation('issue_digital_tickets_for_order', async () => {
      // Use the SECURITY DEFINER RPC so anon users (public checkout) can issue tickets
      const rpcResult = await supabase.rpc('issue_digital_tickets_for_order', { p_order_id: orderId })

      if (!rpcResult.error) {
        return this.listDigitalTicketsByOrder(orderId)
      }

      // Fallback for authenticated org members (direct insert)
      if (rpcResult.error.code !== 'PGRST202' && !rpcResult.error.message?.toLowerCase().includes('could not find')) {
        throw new OrdersServiceError(rpcResult.error.message, 'order_ticket_issuance_failed')
      }

      const existingTickets = await this.listDigitalTicketsByOrder(orderId)
      if (existingTickets.length > 0) return existingTickets

      const [order, orderItems] = await Promise.all([this.getOrderById(orderId), this.listOrderItemsByOrder(orderId)])

      if (!order) throw new OrdersServiceError('Pedido nao encontrado para emissao', 'order_not_found')
      if (order.status !== 'paid') throw new OrdersServiceError('Somente pedidos pagos podem emitir ingressos digitais', 'order_not_paid')
      if (orderItems.length === 0) throw new OrdersServiceError('Pedido sem itens nao pode emitir ingressos', 'order_has_no_items')

      const insertResult = await supabase.from('digital_tickets').insert(buildDigitalTicketInsertPayload(order, orderItems))
      assertOrdersResult(insertResult)

      return this.listDigitalTicketsByOrder(orderId)
    }, { orderId })
  },

  async getOrderDetailBundle(orderId: string): Promise<OrderDetailBundle> {
    return ordersApi.query('get_order_detail_bundle', async () => {
      const [order, items, digitalTickets] = await Promise.all([
        this.getOrderById(orderId),
        this.listOrderItemsByOrder(orderId),
        this.listDigitalTicketsByOrder(orderId),
      ])

      return {
        order,
        items,
        digitalTickets,
      }
    }, { orderId })
  },

  async expireStaleDrafts(eventId?: string) {
    return ordersApi.mutation('expire_stale_drafts', async () => expireStaleOrderDrafts(eventId), { eventId: eventId ?? null })
  },
}
