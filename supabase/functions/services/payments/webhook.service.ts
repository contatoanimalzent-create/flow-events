import Stripe from 'npm:stripe@14'
import { createSupabaseAdminClient } from '../../_shared/supabase-admin.ts'
import {
  buildOrderConfirmationEmail,
  buildTicketsEmail,
  sendResendEmail,
} from '../../_shared/transactional-email.ts'

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>

interface RegisteredWebhookEvent {
  webhookEventId: string | null
  isDuplicate: boolean
}

interface PaymentLookup {
  id: string
  order_id: string
  status: string
}

function nowIso() {
  return new Date().toISOString()
}

function buildTicketNumber() {
  return `TK-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function isMissingRow(error: { code?: string | null } | null | undefined) {
  return error?.code === 'PGRST116'
}

export function createStripeClient() {
  return new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
}

export function validateStripeWebhookSignature(params: {
  body: string
  signature: string
  stripe: Stripe
}) {
  return params.stripe.webhooks.constructEvent(params.body, params.signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
}

export async function registerStripeWebhookEvent(
  supabase: SupabaseAdminClient,
  event: Stripe.Event,
): Promise<RegisteredWebhookEvent> {
  const existingResult = await supabase
    .from('payment_webhook_events')
    .select('id')
    .eq('provider', 'stripe')
    .eq('provider_event_id', event.id)
    .maybeSingle()

  if (existingResult.error && !isMissingRow(existingResult.error)) {
    throw existingResult.error
  }

  if (existingResult.data?.id) {
    return {
      webhookEventId: String(existingResult.data.id),
      isDuplicate: true,
    }
  }

  const insertResult = await supabase
    .from('payment_webhook_events')
    .insert({
      provider: 'stripe',
      provider_event_id: event.id,
      event_type: event.type,
      payload: event,
      processing_status: 'received',
    })
    .select('id')
    .single()

  if (insertResult.error?.code === '23505') {
    return {
      webhookEventId: null,
      isDuplicate: true,
    }
  }

  if (insertResult.error) {
    throw insertResult.error
  }

  return {
    webhookEventId: String(insertResult.data?.id ?? ''),
    isDuplicate: false,
  }
}

export async function updateWebhookEvent(
  supabase: SupabaseAdminClient,
  webhookEventId: string,
  payload: Record<string, unknown>,
) {
  const result = await supabase.from('payment_webhook_events').update(payload).eq('id', webhookEventId)

  if (result.error) {
    throw result.error
  }
}

async function getPaymentByIntent(supabase: SupabaseAdminClient, paymentIntentId: string): Promise<PaymentLookup | null> {
  const result = await supabase
    .from('payments')
    .select('id,order_id,status')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (result.error && !isMissingRow(result.error)) {
    throw result.error
  }

  if (!result.data) {
    return null
  }

  return {
    id: String(result.data.id),
    order_id: String(result.data.order_id),
    status: String(result.data.status ?? 'pending'),
  }
}

async function updatePaymentByIntent(
  supabase: SupabaseAdminClient,
  paymentIntentId: string,
  payload: Record<string, unknown>,
) {
  const result = await supabase
    .from('payments')
    .update(payload)
    .eq('payment_intent_id', paymentIntentId)
    .select('id,order_id,status')
    .maybeSingle()

  if (result.error && !isMissingRow(result.error)) {
    throw result.error
  }

  if (!result.data) {
    return null
  }

  return {
    id: String(result.data.id),
    order_id: String(result.data.order_id),
    status: String(result.data.status ?? 'pending'),
  }
}

function resolveOrderId(paymentIntent: Stripe.PaymentIntent, payment: PaymentLookup | null) {
  return paymentIntent.metadata?.order_id ?? payment?.order_id ?? null
}

function resolvePaymentMethod(paymentIntent: Stripe.PaymentIntent) {
  const explicitMethod = paymentIntent.metadata?.payment_method?.trim()

  if (explicitMethod) {
    return explicitMethod
  }

  const installments = Number(paymentIntent.metadata?.installments ?? 0)

  if (paymentIntent.payment_method_types.includes('card')) {
    return installments > 0 ? `card_${installments}x` : 'card'
  }

  if (paymentIntent.payment_method_types.includes('pix')) {
    return 'pix'
  }

  return 'stripe'
}

async function confirmOrderAndCaptureInventory(
  supabase: SupabaseAdminClient,
  orderId: string,
  paymentMethod: string,
) {
  const result = await supabase.rpc('confirm_order_and_capture_inventory', {
    p_order_id: orderId,
    p_payment_method: paymentMethod,
  })

  if (result.error && !String(result.error.message ?? '').toLowerCase().includes('paid')) {
    throw result.error
  }

  return result.data as Record<string, unknown> | null
}

async function releaseOrderInventory(
  supabase: SupabaseAdminClient,
  orderId: string,
  targetStatus: 'cancelled' | 'expired' = 'cancelled',
) {
  const result = await supabase.rpc('release_order_inventory', {
    p_order_id: orderId,
    p_target_status: targetStatus,
  })

  if (result.error && !String(result.error.message ?? '').toLowerCase().includes('already')) {
    throw result.error
  }
}

async function issueDigitalTicketsForOrder(
  supabase: SupabaseAdminClient,
  orderId: string,
) {
  const existingTicketsResult = await supabase.from('digital_tickets').select('id').eq('order_id', orderId).limit(1)

  if (existingTicketsResult.error) {
    throw existingTicketsResult.error
  }

  if (((existingTicketsResult.data as unknown[]) ?? []).length > 0) {
    return
  }

  const [orderResult, orderItemsResult] = await Promise.all([
    supabase.from('orders').select('id,event_id,buyer_name,buyer_email').eq('id', orderId).single(),
    supabase
      .from('order_items')
      .select('id,ticket_type_id,batch_id,holder_name,holder_email,quantity')
      .eq('order_id', orderId),
  ])

  if (orderResult.error) {
    throw orderResult.error
  }

  if (orderItemsResult.error) {
    throw orderItemsResult.error
  }

  const order = orderResult.data as Record<string, unknown> | null

  if (!order) {
    throw new Error('Order not found for ticket issuance')
  }

  const tickets = ((orderItemsResult.data as Array<Record<string, unknown>> | null) ?? []).flatMap((item) =>
    Array.from({ length: Number(item.quantity ?? 0) }, () => ({
      order_id: String(order.id),
      order_item_id: String(item.id),
      ticket_type_id: String(item.ticket_type_id),
      batch_id: (item.batch_id as string | null | undefined) ?? null,
      event_id: String(order.event_id),
      ticket_number: buildTicketNumber(),
      qr_token: crypto.randomUUID(),
      status: 'confirmed',
      is_vip: false,
      holder_name: (item.holder_name as string | null | undefined) ?? (order.buyer_name ? String(order.buyer_name) : null),
      holder_email: (item.holder_email as string | null | undefined) ?? (order.buyer_email ? String(order.buyer_email) : null),
    })),
  )

  if (tickets.length === 0) {
    return
  }

  const insertResult = await supabase.from('digital_tickets').insert(tickets)

  if (insertResult.error) {
    throw insertResult.error
  }
}

async function sendTransactionalEmails(
  supabase: SupabaseAdminClient,
  orderId: string,
) {
  const [orderResult, digitalTicketsResult] = await Promise.all([
    supabase.from('orders').select('id,event_id,buyer_name,buyer_email,total_amount').eq('id', orderId).single(),
    supabase
      .from('digital_tickets')
      .select('ticket_number,holder_name,holder_email,qr_token,status')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
  ])

  if (orderResult.error) {
    throw orderResult.error
  }

  if (digitalTicketsResult.error) {
    throw digitalTicketsResult.error
  }

  const order = orderResult.data as Record<string, unknown> | null

  if (!order?.buyer_email) {
    return
  }

  const eventResult = await supabase.from('events').select('name').eq('id', order.event_id).single()

  if (eventResult.error) {
    throw eventResult.error
  }

  const payload = {
    orderId: String(order.id),
    eventName: String((eventResult.data as Record<string, unknown> | null)?.name ?? 'Animalz Event'),
    buyerName: String(order.buyer_name ?? ''),
    buyerEmail: String(order.buyer_email ?? ''),
    totalAmount: Number(order.total_amount ?? 0),
    tickets: ((digitalTicketsResult.data as Array<Record<string, unknown>> | null) ?? []).map((ticket) => ({
      ticketNumber: String(ticket.ticket_number ?? ''),
      holderName: (ticket.holder_name as string | null | undefined) ?? null,
      holderEmail: (ticket.holder_email as string | null | undefined) ?? null,
      qrToken: String(ticket.qr_token ?? ''),
      status: String(ticket.status ?? 'confirmed'),
    })),
  }

  const templates = [
    { key: 'order-confirmation', content: buildOrderConfirmationEmail(payload) },
    { key: 'tickets-issued', content: buildTicketsEmail(payload) },
  ] as const

  for (const template of templates) {
    const result = await sendResendEmail({
      to: payload.buyerEmail,
      subject: template.content.subject,
      html: template.content.html,
      text: template.content.text,
    })

    const insertResult = await supabase.from('transactional_messages').insert({
      order_id: payload.orderId,
      event_id: String(order.event_id),
      channel: 'email',
      template_key: template.key,
      provider: 'resend',
      provider_message_id: result.providerMessageId,
      recipient: payload.buyerEmail,
      status: result.status,
      metadata: {
        automatic: true,
        ticket_count: payload.tickets.length,
      },
      sent_at: result.status === 'sent' ? nowIso() : null,
    })

    if (insertResult.error) {
      throw insertResult.error
    }
  }
}

async function processPaymentIntentSucceeded(
  supabase: SupabaseAdminClient,
  paymentIntent: Stripe.PaymentIntent,
) {
  const currentPayment = await getPaymentByIntent(supabase, paymentIntent.id)
  const orderId = resolveOrderId(paymentIntent, currentPayment)

  if (!orderId) {
    throw new Error('Payment intent without order reference')
  }

  await confirmOrderAndCaptureInventory(supabase, orderId, resolvePaymentMethod(paymentIntent))

  const payment = await updatePaymentByIntent(supabase, paymentIntent.id, {
    status: 'paid',
    charge_id: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
    paid_at: nowIso(),
    metadata: paymentIntent.metadata ?? {},
  })

  await issueDigitalTicketsForOrder(supabase, orderId)
  await sendTransactionalEmails(supabase, orderId)

  return {
    orderId,
    paymentId: payment?.id ?? currentPayment?.id ?? null,
    status: 'processed' as const,
  }
}

async function processPaymentIntentFailed(
  supabase: SupabaseAdminClient,
  paymentIntent: Stripe.PaymentIntent,
) {
  const currentPayment = await getPaymentByIntent(supabase, paymentIntent.id)

  if (currentPayment?.status === 'paid') {
    return {
      orderId: currentPayment.order_id,
      paymentId: currentPayment.id,
      status: 'ignored' as const,
    }
  }

  const payment = await updatePaymentByIntent(supabase, paymentIntent.id, {
    status: 'failed',
    failed_at: nowIso(),
    metadata: paymentIntent.metadata ?? {},
  })

  const orderId = resolveOrderId(paymentIntent, payment ?? currentPayment)

  if (orderId) {
    await releaseOrderInventory(supabase, orderId, 'cancelled')
  }

  return {
    orderId: orderId ?? null,
    paymentId: payment?.id ?? currentPayment?.id ?? null,
    status: 'processed' as const,
  }
}

export async function processStripeWebhookEvent(
  supabase: SupabaseAdminClient,
  event: Stripe.Event,
) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return processPaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
    case 'payment_intent.payment_failed':
      return processPaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent)
    default:
      return {
        orderId: null,
        paymentId: null,
        status: 'ignored' as const,
      }
  }
}
