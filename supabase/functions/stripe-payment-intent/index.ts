// Supabase Edge Function — stripe-payment-intent
// Creates a PaymentIntent for transparent/embedded checkout (no Stripe redirect)
// Deploy: supabase functions deploy stripe-payment-intent

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const ADMIN_FEE_RATE  = 0.05
const PROCESSING_RATE = 0.018
const CARD_RATES: Record<number, number> = {
  1: 0.0299, 2: 0.0520, 3: 0.0620, 4: 0.0720, 5: 0.0820,
  6: 0.0920, 7: 0.1120, 8: 0.1220, 9: 0.1320, 10: 0.1420,
  11: 0.1520, 12: 0.1620,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { eventId, ticketTypeId, quantity = 1, installments = 0, buyerEmail, buyerName } = await req.json()

    // ── Fetch event + ticket type ────────────────────────────
    const [{ data: event }, { data: ticketType }] = await Promise.all([
      supabase.from('events').select('id, name, organization_id').eq('id', eventId).single(),
      supabase.from('ticket_types').select('id, name, price, currency').eq('id', ticketTypeId).single(),
    ])

    if (!event || !ticketType) {
      return Response.json({ error: 'Evento ou ingresso não encontrado' }, { status: 404, headers: corsHeaders })
    }

    // ── Fetch producer Stripe account ────────────────────────
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', event.organization_id)
      .single()

    const faceValue     = ticketType.price  // in cents
    const currency      = (ticketType.currency ?? 'brl').toLowerCase()
    const adminFee      = Math.round(faceValue * ADMIN_FEE_RATE)
    const cardRate      = installments > 1 ? (CARD_RATES[installments] ?? CARD_RATES[12]) : 0
    const cardFee       = Math.round(faceValue * cardRate)
    const unitAmount    = faceValue + adminFee + cardFee
    const processingFee = Math.round(faceValue * PROCESSING_RATE)
    const animalzFee    = (adminFee + processingFee) * quantity

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount:   unitAmount * quantity,
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: buyerEmail,
      metadata: {
        event_id:       eventId,
        ticket_type_id: ticketTypeId,
        quantity:       String(quantity),
        installments:   String(installments),
        face_value:     String(faceValue),
        animalz_fee:    String(animalzFee),
        buyer_name:     buyerName ?? '',
        buyer_email:    buyerEmail ?? '',
      },
    }

    // Split automático se produtor tem conta Stripe Connect
    if (org?.stripe_account_id) {
      piParams.application_fee_amount = animalzFee
      piParams.transfer_data          = { destination: org.stripe_account_id }
    }

    // Parcelamento: Stripe Installments (disponível no Brasil)
    if (installments > 1) {
      piParams.payment_method_options = {
        card: { installments: { enabled: true } },
      }
    }

    const pi = await stripe.paymentIntents.create(piParams)

    // ── Create pending order ─────────────────────────────────
    const { data: order } = await supabase.from('orders').insert({
      event_id:         eventId,
      organization_id:  event.organization_id,
      buyer_email:      buyerEmail ?? '',
      buyer_name:       buyerName ?? '',
      subtotal:         faceValue * quantity,
      discount_amount:  0,
      fee_amount:       animalzFee,
      total_amount:     unitAmount * quantity,
      status:           'pending',
      payment_method:   installments === 0 ? 'pix' : `card_${installments}x`,
      stripe_payment_intent: pi.id,
    }).select('id').single()

    return Response.json(
      { clientSecret: pi.client_secret, orderId: order?.id },
      { headers: corsHeaders },
    )
  } catch (err: any) {
    console.error('[payment-intent]', err)
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders })
  }
})
