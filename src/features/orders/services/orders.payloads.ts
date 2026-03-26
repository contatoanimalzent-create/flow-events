import type {
  CreateOrderDraftInput,
  DigitalTicketRow,
  OrderDraftItemInput,
  OrderItemRow,
  OrderPaymentStatus,
  OrderRow,
  OrderStatus,
} from '@/features/orders/types'

function nowIso() {
  return new Date().toISOString()
}

export function mapOrderStatusToPaymentStatus(status: OrderStatus): OrderPaymentStatus {
  switch (status) {
    case 'paid':
      return 'paid'
    case 'processing':
      return 'authorized'
    case 'failed':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    case 'refunded':
      return 'refunded'
    case 'chargeback':
      return 'chargeback'
    case 'expired':
      return 'expired'
    case 'pending':
      return 'pending'
    case 'draft':
    default:
      return 'unpaid'
  }
}

export function buildOrderDraftTotals(input: CreateOrderDraftInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const discountAmount = input.discount_amount ?? 0
  const platformFeeAmount = input.platform_fee_amount ?? input.fee_amount ?? 0
  const customerFeeAmount = input.customer_fee_amount ?? input.fee_amount ?? 0
  const absorbedFeeAmount = input.absorbed_fee_amount ?? Math.max(platformFeeAmount - customerFeeAmount, 0)
  const totalAmount = subtotal - discountAmount + customerFeeAmount

  return {
    subtotal,
    discountAmount,
    feeAmount: platformFeeAmount,
    platformFeeAmount,
    customerFeeAmount,
    absorbedFeeAmount,
    feeType: input.fee_type ?? 'percentage',
    feeValue: input.fee_value ?? 0,
    absorbFee: input.absorb_fee ?? false,
    totalAmount,
  }
}

export function buildOrderDraftPayload(input: CreateOrderDraftInput) {
  const totals = buildOrderDraftTotals(input)

  return {
    organization_id: input.organization_id,
    event_id: input.event_id,
    buyer_name: input.buyer.name.trim(),
    buyer_email: input.buyer.email.trim(),
    buyer_phone: input.buyer.phone?.trim() || null,
    buyer_cpf: input.buyer.cpf?.trim() || null,
    subtotal: totals.subtotal,
    discount_amount: totals.discountAmount,
    fee_amount: totals.feeAmount,
    platform_fee_amount: totals.platformFeeAmount,
    customer_fee_amount: totals.customerFeeAmount,
    absorbed_fee_amount: totals.absorbedFeeAmount,
    fee_type: totals.feeType,
    fee_value: totals.feeValue,
    absorb_fee: totals.absorbFee,
    total_amount: totals.totalAmount,
    status: 'draft',
    payment_method: input.payment_method ?? null,
    expires_at: input.expires_at ?? null,
    notes: input.notes ?? null,
  }
}

export function buildOrderItemPayloads(orderId: string, items: OrderDraftItemInput[]) {
  return items.map((item) => ({
    order_id: orderId,
    ticket_type_id: item.ticket_type_id,
    batch_id: item.batch_id ?? null,
    holder_name: item.holder_name?.trim() || null,
    holder_email: item.holder_email?.trim() || null,
    unit_price: item.unit_price,
    quantity: item.quantity,
    total_price: item.total_price ?? item.unit_price * item.quantity,
  }))
}

export function mapOrderRow(row: Record<string, unknown>): OrderRow {
  const status = (row.status as OrderStatus | undefined) ?? 'pending'

  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: String(row.event_id),
    buyer_name: String(row.buyer_name ?? ''),
    buyer_email: String(row.buyer_email ?? ''),
    buyer_phone: (row.buyer_phone as string | null | undefined) ?? null,
    buyer_cpf: (row.buyer_cpf as string | null | undefined) ?? null,
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    fee_amount: Number(row.fee_amount ?? 0),
    platform_fee_amount: Number(row.platform_fee_amount ?? row.fee_amount ?? 0),
    customer_fee_amount: Number(row.customer_fee_amount ?? row.fee_amount ?? 0),
    absorbed_fee_amount: Number(row.absorbed_fee_amount ?? 0),
    fee_type: (row.fee_type as OrderRow['fee_type']) ?? 'percentage',
    fee_value: Number(row.fee_value ?? 0),
    absorb_fee: Boolean(row.absorb_fee),
    total_amount: Number(row.total_amount ?? 0),
    status,
    payment_status: mapOrderStatusToPaymentStatus(status),
    payment_method: (row.payment_method as OrderRow['payment_method']) ?? null,
    source_channel: (row.source_channel as string | null | undefined) ?? null,
    expires_at: (row.expires_at as string | null | undefined) ?? null,
    paid_at: (row.paid_at as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    stripe_payment_intent: (row.stripe_payment_intent as string | null | undefined) ?? null,
    stripe_session_id: (row.stripe_session_id as string | null | undefined) ?? null,
    pagarme_order_id: (row.pagarme_order_id as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
  }
}

export function mapOrderItemRow(row: Record<string, unknown>): OrderItemRow {
  const ticketType = row.ticket_type as { name?: string } | null | undefined
  const batch = row.batch as { name?: string } | null | undefined

  return {
    id: String(row.id),
    order_id: String(row.order_id),
    ticket_type_id: String(row.ticket_type_id),
    batch_id: (row.batch_id as string | null | undefined) ?? null,
    holder_name: (row.holder_name as string | null | undefined) ?? null,
    holder_email: (row.holder_email as string | null | undefined) ?? null,
    unit_price: Number(row.unit_price ?? 0),
    quantity: Number(row.quantity ?? 0),
    total_price: Number(row.total_price ?? 0),
    ticket_type: ticketType?.name ? { name: ticketType.name } : undefined,
    batch: batch?.name ? { name: batch.name } : undefined,
  }
}

export function mapDigitalTicketRow(row: Record<string, unknown>): DigitalTicketRow {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    order_item_id: (row.order_item_id as string | null | undefined) ?? null,
    ticket_type_id: String(row.ticket_type_id),
    batch_id: (row.batch_id as string | null | undefined) ?? null,
    event_id: String(row.event_id),
    ticket_number: String(row.ticket_number ?? ''),
    qr_token: String(row.qr_token ?? ''),
    status: (row.status as DigitalTicketRow['status']) ?? 'pending',
    holder_name: (row.holder_name as string | null | undefined) ?? null,
    holder_email: (row.holder_email as string | null | undefined) ?? null,
    transferred_to_name: (row.transferred_to_name as string | null | undefined) ?? null,
    transferred_to_email: (row.transferred_to_email as string | null | undefined) ?? null,
    transfer_requested_at: (row.transfer_requested_at as string | null | undefined) ?? null,
    checked_in_at: (row.checked_in_at as string | null | undefined) ?? null,
    email_sent_at: (row.email_sent_at as string | null | undefined) ?? null,
    is_vip: Boolean(row.is_vip),
    created_at: (row.created_at as string | undefined) ?? nowIso(),
  }
}

export function buildDigitalTicketInsertPayload(order: OrderRow, orderItems: OrderItemRow[]) {
  const buyerName = order.buyer_name
  const buyerEmail = order.buyer_email

  return orderItems.flatMap((item, itemIndex) =>
    Array.from({ length: item.quantity }, (_, quantityIndex) => ({
      order_id: order.id,
      order_item_id: item.id,
      ticket_type_id: item.ticket_type_id,
      batch_id: item.batch_id ?? null,
      event_id: order.event_id,
      ticket_number: `TK-${Date.now()}-${itemIndex}-${quantityIndex}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      qr_token: crypto.randomUUID(),
      status: 'confirmed',
      is_vip: false,
      holder_name: item.holder_name ?? buyerName,
      holder_email: item.holder_email ?? buyerEmail,
    })),
  )
}
