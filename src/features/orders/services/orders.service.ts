import { supabase } from '@/lib/supabase'
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
  buildOrderDraftPayload,
  buildOrderItemPayloads,
  mapDigitalTicketRow,
  mapOrderItemRow,
  mapOrderRow,
} from './orders.payloads'

export const ordersService = {
  async listOrderEvents(organizationId: string): Promise<OrdersEventScope[]> {
    const result = await supabase
      .from('events')
      .select('id,name')
      .eq('organization_id', organizationId)
      .order('starts_at', { ascending: false })

    assertOrdersResult(result)
    return ((result.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ''),
    }))
  },

  async listOrdersByEvent(eventId: string): Promise<OrderRow[]> {
    const result = await supabase.from('orders').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    assertOrdersResult(result)
    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapOrderRow)
  },

  async getOrderById(orderId: string): Promise<OrderRow | null> {
    const result = await supabase.from('orders').select('*').eq('id', orderId).single()
    assertOrdersResult(result)
    return result.data ? mapOrderRow(result.data as Record<string, unknown>) : null
  },

  async listOrderItemsByOrder(orderId: string): Promise<OrderItemRow[]> {
    const result = await supabase
      .from('order_items')
      .select('*, ticket_type:ticket_types(name), batch:ticket_batches(name)')
      .eq('order_id', orderId)

    assertOrdersResult(result)
    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapOrderItemRow)
  },

  async createOrderDraft(input: CreateOrderDraftInput): Promise<OrderRow> {
    const orderInsertResult = await supabase.from('orders').insert(buildOrderDraftPayload(input)).select('*').single()
    assertOrdersResult(orderInsertResult)

    const createdOrder = orderInsertResult.data ? mapOrderRow(orderInsertResult.data as Record<string, unknown>) : null

    if (!createdOrder) {
      throw new OrdersServiceError('N\u00e3o foi poss\u00edvel criar o pedido', 'order_draft_creation_failed')
    }

    if (input.items.length > 0) {
      const addItemsResult = await supabase.from('order_items').insert(buildOrderItemPayloads(createdOrder.id, input.items))
      assertOrdersResult(addItemsResult)
    }

    return createdOrder
  },

  async addOrderItems(orderId: string, items: CreateOrderDraftInput['items']) {
    const result = await supabase.from('order_items').insert(buildOrderItemPayloads(orderId, items))
    assertOrdersResult(result)
  },

  async confirmOrder(orderId: string, paymentMethod?: OrderRow['payment_method']) {
    const result = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_method: paymentMethod ?? 'pix',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*')
      .single()

    assertOrdersResult(result)
    return result.data ? mapOrderRow(result.data as Record<string, unknown>) : null
  },

  async cancelOrder(orderId: string) {
    const result = await supabase.from('orders').update({ status: 'cancelled' satisfies OrderStatus }).eq('id', orderId)
    assertOrdersResult(result)
  },

  async listDigitalTicketsByOrder(orderId: string): Promise<DigitalTicketRow[]> {
    const result = await supabase.from('digital_tickets').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
    assertOrdersResult(result)
    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapDigitalTicketRow)
  },

  async getDigitalTicketById(digitalTicketId: string): Promise<DigitalTicketRow | null> {
    const result = await supabase.from('digital_tickets').select('*').eq('id', digitalTicketId).single()
    assertOrdersResult(result)
    return result.data ? mapDigitalTicketRow(result.data as Record<string, unknown>) : null
  },

  async issueDigitalTicketsForOrder(orderId: string): Promise<DigitalTicketRow[]> {
    const existingTickets = await this.listDigitalTicketsByOrder(orderId)

    if (existingTickets.length > 0) {
      return existingTickets
    }

    const [order, orderItems] = await Promise.all([this.getOrderById(orderId), this.listOrderItemsByOrder(orderId)])

    if (!order) {
      throw new OrdersServiceError('Pedido n\u00e3o encontrado para emiss\u00e3o', 'order_not_found')
    }

    if (orderItems.length === 0) {
      throw new OrdersServiceError('Pedido sem itens n\u00e3o pode emitir ingressos', 'order_has_no_items')
    }

    const insertResult = await supabase.from('digital_tickets').insert(buildDigitalTicketInsertPayload(order, orderItems))
    assertOrdersResult(insertResult)

    return this.listDigitalTicketsByOrder(orderId)
  },

  async getOrderDetailBundle(orderId: string): Promise<OrderDetailBundle> {
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
  },
}
