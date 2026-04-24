import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type { CreateOrderDraftInput, OrderDraftItemInput, OrderPaymentMethod, OrderRow, OrderStatus } from '@/features/orders/types'
import { OrdersServiceError, assertOrdersResult } from './orders.errors'
import { buildOrderDraftPayload, buildOrderItemPayloads, mapOrderRow } from './orders.payloads'

const ordersInventoryApi = createApiClient('orders-inventory')

const RPC_CREATE_DRAFT = 'create_order_draft_with_reservations'
const RPC_CONFIRM_ORDER = 'confirm_order_and_capture_inventory'
const RPC_RELEASE_ORDER = 'release_order_inventory'
const RPC_EXPIRE_DRAFTS = 'expire_stale_order_drafts'

const FALLBACK_RETRY_LIMIT = 3
export const DEFAULT_ORDER_DRAFT_TTL_MINUTES = 15

interface TicketBatchInventoryRow {
  id: string
  event_id: string
  quantity: number
  sold_count: number
  reserved_count: number
  is_active: boolean
}

function isMissingRpc(error: { message?: string; code?: string } | null | undefined) {
  if (!error) {
    return false
  }

  return error.code === 'PGRST202' || error.message?.toLowerCase().includes('function') || error.message?.toLowerCase().includes('could not find')
}

function toOrderRow(data: Record<string, unknown> | null | undefined, fallbackMessage: string) {
  if (!data) {
    throw new OrdersServiceError(fallbackMessage, 'order_not_found')
  }

  return mapOrderRow(data)
}

async function getBatchInventory(batchId: string) {
  return ordersInventoryApi.query('get_batch_inventory', async () => {
    const result = await supabase
      .from('ticket_batches')
      .select('id,event_id,quantity,sold_count,reserved_count,is_active')
      .eq('id', batchId)
      .single()

    assertOrdersResult(result)

    const row = result.data as TicketBatchInventoryRow | null

    if (!row) {
      throw new OrdersServiceError('Lote de ingresso não encontrado', 'ticket_batch_not_found')
    }

    return {
      id: row.id,
      event_id: row.event_id,
      quantity: Number(row.quantity ?? 0),
      sold_count: Number(row.sold_count ?? 0),
      reserved_count: Number(row.reserved_count ?? 0),
      is_active: Boolean(row.is_active),
    }
  }, { batchId })
}

async function updateEventSoldTickets(eventId: string, delta: number) {
  return ordersInventoryApi.mutation('update_event_sold_tickets', async () => {
    if (!delta) {
      return
    }

    for (let attempt = 0; attempt < FALLBACK_RETRY_LIMIT; attempt += 1) {
      const readResult = await supabase.from('events').select('sold_tickets').eq('id', eventId).single()
      assertOrdersResult(readResult)

      const currentSold = Number((readResult.data as { sold_tickets?: number } | null)?.sold_tickets ?? 0)
      const writeResult = await supabase
        .from('events')
        .update({ sold_tickets: currentSold + delta })
        .eq('id', eventId)
        .eq('sold_tickets', currentSold)
        .select('id')

      assertOrdersResult(writeResult)

      if (((writeResult.data as unknown[] | null) ?? []).length > 0) {
        return
      }
    }

    throw new OrdersServiceError('Não foi possível atualizar o total vendido do evento', 'event_sold_tickets_update_failed')
  }, { eventId, delta })
}

async function reserveBatchInventoryFallback(batchId: string, quantity: number) {
  return ordersInventoryApi.mutation('reserve_batch_inventory_fallback', async () => {
    for (let attempt = 0; attempt < FALLBACK_RETRY_LIMIT; attempt += 1) {
      const batch = await getBatchInventory(batchId)
      const available = batch.quantity - batch.sold_count - batch.reserved_count

      if (!batch.is_active) {
        throw new OrdersServiceError('O lote selecionado está inativo', 'ticket_batch_inactive')
      }

      if (available < quantity) {
        throw new OrdersServiceError('Não há disponibilidade suficiente neste lote', 'ticket_batch_inventory_unavailable')
      }

      const result = await supabase
        .from('ticket_batches')
        .update({ reserved_count: batch.reserved_count + quantity })
        .eq('id', batchId)
        .eq('reserved_count', batch.reserved_count)
        .eq('sold_count', batch.sold_count)
        .select('id')

      assertOrdersResult(result)

      if (((result.data as unknown[] | null) ?? []).length > 0) {
        return
      }
    }

    throw new OrdersServiceError('Falha ao reservar inventário do lote', 'ticket_batch_reservation_failed')
  }, { batchId, quantity })
}

async function releaseBatchInventoryFallback(batchId: string, quantity: number) {
  return ordersInventoryApi.mutation('release_batch_inventory_fallback', async () => {
    for (let attempt = 0; attempt < FALLBACK_RETRY_LIMIT; attempt += 1) {
      const batch = await getBatchInventory(batchId)
      const nextReserved = Math.max(batch.reserved_count - quantity, 0)

      const result = await supabase
        .from('ticket_batches')
        .update({ reserved_count: nextReserved })
        .eq('id', batchId)
        .eq('reserved_count', batch.reserved_count)
        .select('id')

      assertOrdersResult(result)

      if (((result.data as unknown[] | null) ?? []).length > 0) {
        return
      }
    }

    throw new OrdersServiceError('Falha ao liberar inventário reservado', 'ticket_batch_release_failed')
  }, { batchId, quantity })
}

async function captureBatchInventoryFallback(batchId: string, quantity: number) {
  return ordersInventoryApi.mutation('capture_batch_inventory_fallback', async () => {
    for (let attempt = 0; attempt < FALLBACK_RETRY_LIMIT; attempt += 1) {
      const batch = await getBatchInventory(batchId)

      if (batch.reserved_count < quantity) {
        throw new OrdersServiceError('A reserva do lote não está mais disponível para confirmação', 'ticket_batch_reservation_missing')
      }

      const result = await supabase
        .from('ticket_batches')
        .update({
          reserved_count: batch.reserved_count - quantity,
          sold_count: batch.sold_count + quantity,
        })
        .eq('id', batchId)
        .eq('reserved_count', batch.reserved_count)
        .eq('sold_count', batch.sold_count)
        .select('id')

      assertOrdersResult(result)

      if (((result.data as unknown[] | null) ?? []).length > 0) {
        return
      }
    }

    throw new OrdersServiceError('Falha ao capturar o inventário reservado', 'ticket_batch_capture_failed')
  }, { batchId, quantity })
}

async function reserveItemsFallback(items: OrderDraftItemInput[]) {
  return ordersInventoryApi.mutation('reserve_items_fallback', async () => {
    const reservedItems: OrderDraftItemInput[] = []

    try {
      for (const item of items) {
        if (item.batch_id && item.quantity > 0) {
          await reserveBatchInventoryFallback(item.batch_id, item.quantity)
          reservedItems.push(item)
        }
      }
    } catch (error) {
      for (const item of reservedItems.reverse()) {
        if (item.batch_id && item.quantity > 0) {
          try {
            await releaseBatchInventoryFallback(item.batch_id, item.quantity)
          } catch {
            // best-effort rollback
          }
        }
      }

      throw error
    }
  }, { itemsCount: items.length })
}

export function buildDefaultOrderExpiration(ttlMinutes = DEFAULT_ORDER_DRAFT_TTL_MINUTES) {
  return new Date(Date.now() + ttlMinutes * 60_000).toISOString()
}

export async function createOrderDraftWithReservations(input: CreateOrderDraftInput) {
  return ordersInventoryApi.mutation('create_order_draft_with_reservations', async () => {
    const payload = {
      ...buildOrderDraftPayload({
        ...input,
        expires_at: input.expires_at ?? buildDefaultOrderExpiration(),
      }),
      buyer: input.buyer,
      items: input.items,
    }

    const rpcResult = await supabase.rpc(RPC_CREATE_DRAFT, {
      p_payload: payload,
    })

    if (!rpcResult.error) {
      // RPC now returns full order as JSONB (avoids anon RLS block on orders SELECT)
      return toOrderRow(rpcResult.data as Record<string, unknown> | null, 'Não foi possível carregar o pedido criado')
    }

    if (!isMissingRpc(rpcResult.error)) {
      throw new OrdersServiceError(rpcResult.error.message, 'order_draft_creation_failed')
    }

    await reserveItemsFallback(input.items)

    const orderInsertResult = await supabase
      .from('orders')
      .insert(
        buildOrderDraftPayload({
          ...input,
          expires_at: input.expires_at ?? buildDefaultOrderExpiration(),
        }),
      )
      .select('*')
      .single()

    assertOrdersResult(orderInsertResult)

    const createdOrder = toOrderRow(orderInsertResult.data as Record<string, unknown> | null, 'Não foi possível criar o pedido')

    try {
      if (input.items.length > 0) {
        const addItemsResult = await supabase.from('order_items').insert(buildOrderItemPayloads(createdOrder.id, input.items))
        assertOrdersResult(addItemsResult)
      }
    } catch (error) {
      for (const item of input.items) {
        if (item.batch_id && item.quantity > 0) {
          try {
            await releaseBatchInventoryFallback(item.batch_id, item.quantity)
          } catch {
            // best-effort rollback
          }
        }
      }

      await supabase.from('orders').delete().eq('id', createdOrder.id)
      throw error
    }

    return createdOrder
  }, { organizationId: input.organization_id, eventId: input.event_id, itemsCount: input.items.length })
}

export async function confirmOrderAndCaptureInventory(orderId: string, paymentMethod?: OrderPaymentMethod | null) {
  return ordersInventoryApi.mutation('confirm_order_and_capture_inventory', async () => {
    const rpcResult = await supabase.rpc(RPC_CONFIRM_ORDER, {
      p_order_id: orderId,
      p_payment_method: paymentMethod ?? null,
    })

    if (!rpcResult.error) {
      return toOrderRow(rpcResult.data as Record<string, unknown> | null, 'Não foi possível confirmar o pedido')
    }

    if (!isMissingRpc(rpcResult.error)) {
      throw new OrdersServiceError(rpcResult.error.message, 'order_confirmation_failed')
    }

    const orderResult = await supabase.from('orders').select('*').eq('id', orderId).single()
    assertOrdersResult(orderResult)

    const order = toOrderRow(orderResult.data as Record<string, unknown> | null, 'Pedido não encontrado para confirmação')

    if (order.status === 'paid') {
      return order
    }

    if (order.status === 'cancelled' || order.status === 'expired') {
      throw new OrdersServiceError('Este pedido não pode mais ser confirmado', 'order_not_confirmable')
    }

    const itemsResult = await supabase.from('order_items').select('batch_id,quantity').eq('order_id', orderId)
    assertOrdersResult(itemsResult)

    const items = ((itemsResult.data as Array<{ batch_id?: string | null; quantity?: number }> | null) ?? []).map((item) => ({
      batch_id: item.batch_id ?? null,
      quantity: Number(item.quantity ?? 0),
    }))

    for (const item of items) {
      if (item.batch_id && item.quantity > 0) {
        await captureBatchInventoryFallback(item.batch_id, item.quantity)
      }
    }

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

    const updateResult = await supabase
      .from('orders')
      .update({
        status: 'paid' satisfies OrderStatus,
        payment_method: paymentMethod ?? order.payment_method ?? (order.total_amount === 0 ? 'free' : 'pix'),
        paid_at: new Date().toISOString(),
        expires_at: null,
      })
      .eq('id', orderId)
      .select('*')
      .single()

    assertOrdersResult(updateResult)

    await updateEventSoldTickets(order.event_id, totalQuantity)

    return toOrderRow(updateResult.data as Record<string, unknown> | null, 'Não foi possível atualizar o pedido confirmado')
  }, { orderId, paymentMethod: paymentMethod ?? null })
}

export async function releaseOrderInventory(orderId: string, targetStatus: Extract<OrderStatus, 'cancelled' | 'expired'>) {
  return ordersInventoryApi.mutation('release_order_inventory', async () => {
    const rpcResult = await supabase.rpc(RPC_RELEASE_ORDER, {
      p_order_id: orderId,
      p_target_status: targetStatus,
    })

    if (!rpcResult.error) {
      return toOrderRow(rpcResult.data as Record<string, unknown> | null, 'Não foi possível atualizar o pedido')
    }

    if (!isMissingRpc(rpcResult.error)) {
      throw new OrdersServiceError(rpcResult.error.message, 'order_inventory_release_failed')
    }

    const orderResult = await supabase.from('orders').select('*').eq('id', orderId).single()
    assertOrdersResult(orderResult)

    const order = toOrderRow(orderResult.data as Record<string, unknown> | null, 'Pedido não encontrado')

    if (order.status === 'cancelled' || order.status === 'expired') {
      return order
    }

    if (order.status === 'paid') {
      throw new OrdersServiceError('Pedidos pagos não podem liberar reserva automaticamente', 'paid_order_release_not_allowed')
    }

    const itemsResult = await supabase.from('order_items').select('batch_id,quantity').eq('order_id', orderId)
    assertOrdersResult(itemsResult)

    const items = ((itemsResult.data as Array<{ batch_id?: string | null; quantity?: number }> | null) ?? []).map((item) => ({
      batch_id: item.batch_id ?? null,
      quantity: Number(item.quantity ?? 0),
    }))

    for (const item of items) {
      if (item.batch_id && item.quantity > 0) {
        await releaseBatchInventoryFallback(item.batch_id, item.quantity)
      }
    }

    const updateResult = await supabase
      .from('orders')
      .update({
        status: targetStatus satisfies OrderStatus,
        expires_at: null,
      })
      .eq('id', orderId)
      .select('*')
      .single()

    assertOrdersResult(updateResult)
    return toOrderRow(updateResult.data as Record<string, unknown> | null, 'Não foi possível atualizar o pedido')
  }, { orderId, targetStatus })
}

export async function expireStaleOrderDrafts(eventId?: string) {
  return ordersInventoryApi.mutation('expire_stale_order_drafts', async () => {
    const rpcResult = await supabase.rpc(RPC_EXPIRE_DRAFTS, {
      p_event_id: eventId ?? null,
    })

    if (!rpcResult.error) {
      return Number(rpcResult.data ?? 0)
    }

    if (!isMissingRpc(rpcResult.error)) {
      throw new OrdersServiceError(rpcResult.error.message, 'order_expiration_failed')
    }

    const now = new Date().toISOString()
    let query = supabase
      .from('orders')
      .select('id')
      .in('status', ['draft', 'pending', 'failed'])
      .not('expires_at', 'is', null)
      .lte('expires_at', now)

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const result = await query
    assertOrdersResult(result)

    const orders = ((result.data as Array<{ id: string }> | null) ?? []).map((item) => item.id)

    for (const staleOrderId of orders) {
      await releaseOrderInventory(staleOrderId, 'expired')
    }

    return orders.length
  }, { eventId: eventId ?? null })
}
