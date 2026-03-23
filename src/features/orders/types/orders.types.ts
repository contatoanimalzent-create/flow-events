export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'chargeback'
  | 'expired'

export type OrderPaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'chargeback'
  | 'expired'

export type OrderPaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'boleto'
  | 'free'
  | `card_${number}x`

export type DigitalTicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used' | 'transferred' | 'expired'

export interface OrdersEventScope {
  id: string
  name: string
}

export interface OrderBuyerSnapshot {
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
}

export interface OrderRow {
  id: string
  organization_id: string
  event_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string | null
  buyer_cpf?: string | null
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  status: OrderStatus
  payment_status: OrderPaymentStatus
  payment_method?: OrderPaymentMethod | null
  source_channel?: string | null
  expires_at?: string | null
  paid_at?: string | null
  notes?: string | null
  stripe_payment_intent?: string | null
  stripe_session_id?: string | null
  pagarme_order_id?: string | null
  created_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  ticket_type_id: string
  batch_id?: string | null
  holder_name?: string | null
  holder_email?: string | null
  unit_price: number
  quantity: number
  total_price: number
  ticket_type?: {
    name: string
  }
  batch?: {
    name: string
  }
}

export interface DigitalTicketRow {
  id: string
  order_id: string
  order_item_id?: string | null
  ticket_type_id: string
  batch_id?: string | null
  event_id: string
  ticket_number: string
  qr_token: string
  status: DigitalTicketStatus
  holder_name?: string | null
  holder_email?: string | null
  transferred_to_name?: string | null
  transferred_to_email?: string | null
  transfer_requested_at?: string | null
  checked_in_at?: string | null
  email_sent_at?: string | null
  is_vip: boolean
  created_at?: string
}

export interface OrderDraftItemInput {
  ticket_type_id: string
  batch_id?: string | null
  holder_name?: string | null
  holder_email?: string | null
  unit_price: number
  quantity: number
  total_price?: number
}

export interface CheckoutCartItem {
  ticket_type_id: string
  batch_id: string
  ticket_name: string
  batch_name: string
  price: number
  quantity: number
  color?: string | null
  max_per_order?: number | null
}

export interface CheckoutBuyerForm {
  name: string
  email: string
  cpf: string
  phone: string
}

export type CheckoutDraftStatus = 'idle' | 'draft_created' | 'confirmed' | 'cancelled' | 'expired'

export interface CreateOrderDraftInput {
  organization_id: string
  event_id: string
  buyer: OrderBuyerSnapshot
  items: OrderDraftItemInput[]
  discount_amount?: number
  fee_amount?: number
  payment_method?: OrderPaymentMethod | null
  source_channel?: string | null
  expires_at?: string | null
  notes?: string | null
}

export interface OrderSummaryStats {
  confirmedRevenue: number
  paidOrders: number
  pendingOrders: number
  todayOrders: number
}

export interface OrderListFilters {
  status: 'all' | OrderStatus
  payment_method: 'all' | OrderPaymentMethod
  search: string
}

export interface OrderDetailBundle {
  order: OrderRow | null
  items: OrderItemRow[]
  digitalTickets: DigitalTicketRow[]
}

export interface CheckoutSummary {
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  quantity: number
}
