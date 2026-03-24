import Stripe from 'npm:stripe@14'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import {
  buildOrderConfirmationEmail,
  buildTicketsEmail,
  sendResendEmail,
} from '../_shared/transactional-email.ts'

function nowIso() {
  return new Date().toISOString()
}

function buildTicketNumber() {
  return `TK-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

async function insertWebhookEvent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  event: Stripe.Event,
) {
  const result = await supabase
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

  if (!result.error) {
    return {
      id: result.data?.id ?? null,
      shouldProcess: true,
    }
  }

  if (result.error.code === '23505') {
    const existingResult = await supabase
      .from('payment_webhook_events')
      .select('id,processing_status')
      .eq('provider', 'stripe')
      .eq('provider_event_id', event.id)
      .single()

    if (existingResult.error) {
      throw existingResult.error
    }

    const existing = existingResult.data as { id: string; processing_status: string } | null

    if (!existing) {
      return {
        id: null,
        shouldProcess: false,
      }
    }

    return {
      id: existing.id,
      shouldProcess: existing.processing_status !== 'processed' && existing.processing_status !== 'ignored',
    }
  }

  throw result.error
}

async function updateWebhookEvent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  webhookEventId: string,
  payload: Record<string, unknown>,
) {
  await supabase.from('payment_webhook_events').update(payload).eq('id', webhookEventId)
}

async function upsertTicketsForOrder(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderId: string,
) {
  const existingTickets = await supabase.from('digital_tickets').select('id').eq('order_id', orderId).limit(1)

  if (((existingTickets.data as unknown[]) ?? []).length > 0) {
    return
  }

  const [{ data: order }, { data: orderItems }] = await Promise.all([
    supabase.from('orders').select('id,event_id,buyer_name,buyer_email').eq('id', orderId).single(),
    supabase
      .from('order_items')
      .select('id,ticket_type_id,batch_id,holder_name,holder_email,quantity')
      .eq('order_id', orderId),
  ])

  if (!order) {
    throw new Error('Order not found for ticket issuance')
  }

  const tickets = ((orderItems as Array<Record<string, unknown>> | null) ?? []).flatMap((item) =>
    Array.from({ length: Number(item.quantity ?? 0) }, () => ({
      order_id: order.id,
      order_item_id: String(item.id),
      ticket_type_id: String(item.ticket_type_id),
      batch_id: (item.batch_id as string | null | undefined) ?? null,
      event_id: String(order.event_id),
      ticket_number: buildTicketNumber(),
      qr_token: crypto.randomUUID(),
      status: 'confirmed',
      is_vip: false,
      holder_name: (item.holder_name as string | null | undefined) ?? order.buyer_name ?? null,
      holder_email: (item.holder_email as string | null | undefined) ?? order.buyer_email ?? null,
    })),
  )

  if (tickets.length > 0) {
    const insertResult = await supabase.from('digital_tickets').insert(tickets)
    if (insertResult.error) {
      throw insertResult.error
    }
  }
}

async function sendTransactionalEmails(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderId: string,
) {
  const [{ data: order }, { data: digitalTickets }] = await Promise.all([
    supabase
      .from('orders')
      .select('id,event_id,buyer_name,buyer_email,total_amount')
      .eq('id', orderId)
      .single(),
    supabase
      .from('digital_tickets')
      .select('ticket_number,holder_name,holder_email,qr_token,status')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
  ])

  if (!order?.buyer_email) {
    return
  }

  const { data: event } = await supabase.from('events').select('name').eq('id', order.event_id).single()

  const payload = {
    orderId: order.id,
    eventName: event?.name ?? 'Animalz Event',
    buyerName: order.buyer_name ?? '',
    buyerEmail: order.buyer_email ?? '',
    totalAmount: Number(order.total_amount ?? 0),
    tickets: ((digitalTickets as Array<Record<string, unknown>> | null) ?? []).map((ticket) => ({
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

    await supabase.from('transactional_messages').insert({
      order_id: order.id,
      event_id: order.event_id,
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
  }
}

async function updatePaymentByIntent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  paymentIntentId: string,
  payload: Record<string, unknown>,
) {
  const result = await supabase
    .from('payments')
    .update(payload)
    .eq('payment_intent_id', paymentIntentId)
    .select('id,order_id')
    .single()

  return result.data as { id: string; order_id: string } | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const supabase = createSupabaseAdminClient()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (error: any) {
    console.error('[stripe-webhook] Invalid signature', error.message)
    return new Response('Invalid signature', { status: 400, headers: corsHeaders })
  }

  let webhookEventId: string | null = null

  try {
    const webhookEvent = await insertWebhookEvent(supabase, event)
    webhookEventId = webhookEvent.id

    if (!webhookEventId || !webhookEvent.shouldProcess) {
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const payment = await updatePaymentByIntent(supabase, paymentIntent.id, {
          status: 'paid',
          charge_id: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
          paid_at: nowIso(),
          metadata: paymentIntent.metadata ?? {},
        })

        const orderId = paymentIntent.metadata?.order_id ?? payment?.order_id

        if (!orderId) {
          throw new Error('Payment intent without order reference')
        }

        const paymentMethod = paymentIntent.metadata?.installments && Number(paymentIntent.metadata.installments) > 0
          ? `card_${paymentIntent.metadata.installments}x`
          : 'pix'

        const confirmResult = await supabase.rpc('confirm_order_and_capture_inventory', {
          p_order_id: orderId,
          p_payment_method: paymentMethod,
        })

        if (confirmResult.error && !String(confirmResult.error.message ?? '').toLowerCase().includes('paid')) {
          throw confirmResult.error
        }

        await upsertTicketsForOrder(supabase, orderId)
        await sendTransactionalEmails(supabase, orderId)

        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'processed',
          processed_at: nowIso(),
          order_id: orderId,
          payment_id: payment?.id ?? null,
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const payment = await updatePaymentByIntent(supabase, paymentIntent.id, {
          status: 'failed',
          failed_at: nowIso(),
          metadata: paymentIntent.metadata ?? {},
        })

        const orderId = paymentIntent.metadata?.order_id ?? payment?.order_id

        if (orderId) {
          await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
        }

        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'processed',
          processed_at: nowIso(),
          order_id: orderId ?? null,
          payment_id: payment?.id ?? null,
        })
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const payment = await updatePaymentByIntent(supabase, paymentIntent.id, {
          status: 'cancelled',
          metadata: paymentIntent.metadata ?? {},
        })

        const orderId = paymentIntent.metadata?.order_id ?? payment?.order_id

        if (orderId) {
          await supabase.rpc('release_order_inventory', {
            p_order_id: orderId,
            p_target_status: 'cancelled',
          })
        }

        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'processed',
          processed_at: nowIso(),
          order_id: orderId ?? null,
          payment_id: payment?.id ?? null,
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null

        if (!paymentIntentId) {
          break
        }

        const payment = await updatePaymentByIntent(supabase, paymentIntentId, {
          status: 'refunded',
          charge_id: charge.id,
          refunded_at: nowIso(),
        })

        if (payment?.order_id) {
          await supabase.from('orders').update({ status: 'refunded' }).eq('id', payment.order_id)
          await supabase.from('digital_tickets').update({ status: 'refunded' }).eq('order_id', payment.order_id)
        }

        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'processed',
          processed_at: nowIso(),
          order_id: payment?.order_id ?? null,
          payment_id: payment?.id ?? null,
        })
        break
      }

      default:
        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'ignored',
          processed_at: nowIso(),
        })
        break
    }
  } catch (error: any) {
    console.error('[stripe-webhook] processing error', error)

    if (webhookEventId) {
      await updateWebhookEvent(supabase, webhookEventId, {
        processing_status: 'failed',
        error_message: error.message ?? 'Unknown processing error',
        processed_at: nowIso(),
      })
    }

    return new Response('error', { status: 500, headers: corsHeaders })
  }

  return new Response('ok', { status: 200, headers: corsHeaders })
})
