// Supabase Edge Function — stripe-webhook
// Deploy: supabase functions deploy stripe-webhook
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err: any) {
    console.error('[webhook] Invalid signature:', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const meta    = session.metadata ?? {}

      // ── Mark order as paid ────────────────────────────────────
      const { data: order } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: session.payment_method_types?.[0] ?? 'card',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('stripe_session_id', session.id)
        .select('id, event_id, organization_id')
        .single()

      if (order) {
        // ── Generate digital tickets ──────────────────────────
        const quantity = parseInt(meta.quantity ?? '1', 10)
        const tickets  = Array.from({ length: quantity }, () => ({
          order_id:       order.id,
          ticket_type_id: meta.ticket_type_id,
          event_id:       order.event_id,
          ticket_number:  `TK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          qr_token:       crypto.randomUUID(),
          status:         'confirmed',
          is_vip:         false,
          holder_name:    session.customer_details?.name ?? '',
          holder_email:   session.customer_details?.email ?? '',
        }))

        await supabase.from('digital_tickets').insert(tickets)

        // ── Update sold_tickets count on event ────────────────
        await supabase.rpc('increment_sold_tickets', {
          p_event_id: order.event_id,
          p_quantity: quantity,
        })
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_session_id', session.id)
      break
    }

    case 'charge.dispute.created': {
      // ── Chargeback recebido — alertar organização ─────────────
      const dispute = event.data.object as Stripe.Dispute
      console.warn('[webhook] Chargeback criado:', dispute.id, 'amount:', dispute.amount)
      // TODO: criar alerta em growth_insights ou notifications
      break
    }

    default:
      console.log('[webhook] Evento não tratado:', event.type)
  }

  return new Response('ok', { status: 200 })
})
