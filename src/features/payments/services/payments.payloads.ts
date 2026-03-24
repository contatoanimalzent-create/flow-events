import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentMethodDescriptor,
  PaymentRow,
  TransactionalMessageRow,
} from '@/features/payments/types'

function nowIso() {
  return new Date().toISOString()
}

export function mapPaymentRow(row: Record<string, unknown>): PaymentRow {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    organization_id: (row.organization_id as string | null | undefined) ?? null,
    event_id: (row.event_id as string | null | undefined) ?? null,
    provider: (row.provider as PaymentRow['provider']) ?? 'stripe',
    payment_intent_id: (row.payment_intent_id as string | null | undefined) ?? null,
    charge_id: (row.charge_id as string | null | undefined) ?? null,
    status: (row.status as PaymentRow['status']) ?? 'pending',
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? 'brl'),
    metadata: (row.metadata as Record<string, unknown> | null | undefined) ?? {},
    paid_at: (row.paid_at as string | null | undefined) ?? null,
    failed_at: (row.failed_at as string | null | undefined) ?? null,
    refunded_at: (row.refunded_at as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function mapTransactionalMessageRow(row: Record<string, unknown>): TransactionalMessageRow {
  return {
    id: String(row.id),
    order_id: (row.order_id as string | null | undefined) ?? null,
    event_id: (row.event_id as string | null | undefined) ?? null,
    channel: (row.channel as TransactionalMessageRow['channel']) ?? 'email',
    template_key: String(row.template_key ?? ''),
    provider: String(row.provider ?? 'resend'),
    provider_message_id: (row.provider_message_id as string | null | undefined) ?? null,
    recipient: String(row.recipient ?? ''),
    status: (row.status as TransactionalMessageRow['status']) ?? 'queued',
    metadata: (row.metadata as Record<string, unknown> | null | undefined) ?? {},
    sent_at: (row.sent_at as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
  }
}

function normalizePaymentMethod(paymentMethod?: PaymentMethodDescriptor | null) {
  return paymentMethod ?? 'pix'
}

export function buildPaymentIntentInput(input: CreatePaymentIntentInput) {
  return {
    orderId: input.orderId,
    paymentMethod: normalizePaymentMethod(input.paymentMethod),
    buyerEmail: input.buyerEmail,
    buyerName: input.buyerName,
  }
}

export function mapPaymentIntentResult(result: Record<string, unknown>): PaymentIntentResult {
  return {
    orderId: String(result.orderId ?? ''),
    paymentId: (result.paymentId as string | null | undefined) ?? null,
    paymentIntentId: (result.paymentIntentId as string | null | undefined) ?? null,
    clientSecret: String(result.clientSecret ?? ''),
    provider: (result.provider as PaymentIntentResult['provider']) ?? 'stripe',
  }
}
