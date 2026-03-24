export type PaymentProvider = 'stripe' | 'pagarme' | 'manual'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

export type PaymentMethodDescriptor = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'free' | `card_${number}x`

export interface PaymentRow {
  id: string
  order_id: string
  organization_id?: string | null
  event_id?: string | null
  provider: PaymentProvider
  payment_intent_id?: string | null
  charge_id?: string | null
  status: PaymentStatus
  amount: number
  currency: string
  metadata?: Record<string, unknown>
  paid_at?: string | null
  failed_at?: string | null
  refunded_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreatePaymentIntentInput {
  orderId: string
  paymentMethod?: PaymentMethodDescriptor | null
  buyerEmail?: string
  buyerName?: string
}

export interface PaymentIntentResult {
  orderId: string
  paymentId?: string | null
  paymentIntentId?: string | null
  clientSecret: string
  provider: PaymentProvider
}

export interface TransactionalMessageRow {
  id: string
  order_id?: string | null
  event_id?: string | null
  channel: 'email'
  template_key: string
  provider: string
  provider_message_id?: string | null
  recipient: string
  status: 'queued' | 'sent' | 'failed' | 'skipped'
  metadata?: Record<string, unknown>
  sent_at?: string | null
  created_at: string
}

export interface ResendTicketsInput {
  orderId: string
  recipientEmail?: string
}
