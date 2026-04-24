// Supabase Edge Function, stripe-checkout
// Deploy: supabase functions deploy stripe-checkout
// Env vars needed (set via Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY   → sk_live_... or sk_test_...
//   SUPABASE_URL        → auto-injected
//   SUPABASE_ANON_KEY   → auto-injected

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ADMIN_FEE_RATE  = 0.05    // 5% do comprador → Animalz Events
const PROCESSING_RATE = 0.018   // 1.8% do produtor → Animalz Events

const CARD_RATES: Record<number, number> = {
  1: 0.0299, 2: 0.0520, 3: 0.0620, 4: 0.0720, 5: 0.0820,
  6: 0.0920, 7: 0.1120, 8: 0.1220, 9: 0.1320, 10: 0.1420,
  11: 0.1520, 12: 0.1620,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ── Auth check ────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    })

    // Service-role client for admin lookups (events, orgs, ticket types)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()
    const { eventId, ticketTypeId, quantity = 1, installments = 0, buyerEmail, successUrl, cancelUrl } = body

    // ── Quantity validation ───────────────────────────────────
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return Response.json(
        { error: 'Quantidade inválida. Máximo 10 ingressos por tipo.' },
        { status: 400, headers: corsHeaders },
      )
    }

    // ── Fetch event + ticket type ──────────────────────────────
    const { data: event, error: evErr } = await supabase
      .from('events')
      .select('id, name, organization_id, cover_url, slug')
      .eq('id', eventId)
      .single()

    if (evErr || !event) {
      return Response.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: ticketType, error: ttErr } = await supabase
      .from('ticket_types')
      .select('id, name, price, currency')
      .eq('id', ticketTypeId)
      .single()

    if (ttErr || !ticketType) {
      return Response.json({ error: 'Tipo de ingresso não encontrado' }, { status: 404 })
    }

    // ── Fetch producer's Stripe Connect account ────────────────
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', event.organization_id)
      .single()

    const faceValue    = ticketType.price                             // em centavos se currency = BRL
    const currency     = (ticketType.currency ?? 'brl').toLowerCase()

    // ── All-in fee calculation ─────────────────────────────────
    const adminFee      = Math.round(faceValue * ADMIN_FEE_RATE)
    const cardRate      = installments > 1 ? (CARD_RATES[installments] ?? CARD_RATES[12]) : 0
    const cardFee       = Math.round(faceValue * cardRate)
    const unitAmount    = faceValue + adminFee + cardFee              // o que o comprador paga
    const processingFee = Math.round(faceValue * PROCESSING_RATE)
    const producerNet   = faceValue - processingFee
    const flowFee       = adminFee + processingFee                    // receita total Animalz Events

    const totalAmount = unitAmount * quantity

    // ── Build Stripe Checkout Session ─────────────────────────
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: buyerEmail,
      payment_method_types: installments === 0 ? ['card'] : ['card'],  // PIX via payment_method_options
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: `${ticketType.name}, ${event.name}`,
              description: installments > 1
                ? `${installments}x de R$ ${(unitAmount / installments / 100).toFixed(2)} (juros de parcelamento inclusos)`
                : 'Ingresso, preço total sem taxas surpresa',
              images: event.cover_url ? [event.cover_url] : [],
            },
          },
          quantity,
        },
      ],
      metadata: {
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        quantity: String(quantity),
        installments: String(installments),
        face_value: String(faceValue),
        flow_fee: String(flowFee),
        producer_net: String(producerNet * quantity),
      },
    }

    // ── Split: if producer has Stripe Connect account ──────────
    if (org?.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: flowFee * quantity,  // Animalz Events retém
        transfer_data: {
          destination: org.stripe_account_id,         // produtor recebe o restante
        },
      }
    }

    // ── PIX (Stripe suporta via payment_method_options) ────────
    if (installments === 0) {
      sessionParams.payment_method_types = ['card', 'boleto']
      // PIX nativo: adicionar quando disponível na sua região Stripe
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // ── Reserve inventory via RPC (uses authenticated user's client) ────
    const { data: orderId, error: rpcError } = await supabaseUser.rpc(
      'create_order_draft_with_reservations',
      {
        p_payload: {
          organization_id: event.organization_id,
          event_id: eventId,
          buyer_name: '',
          buyer_email: buyerEmail ?? '',
          buyer_phone: '',
          buyer_cpf: '',
          subtotal: faceValue * quantity,
          discount_amount: 0,
          fee_amount: flowFee * quantity,
          total_amount: totalAmount,
          status: 'pending',
          payment_method: installments === 0 ? 'pix' : `card_${installments}x`,
          source_channel: 'online',
          notes: `Stripe session: ${session.id}`,
          items: [
            {
              ticket_type_id: ticketTypeId,
              quantity,
              unit_price: faceValue,
            },
          ],
        },
      },
    )

    if (rpcError) {
      console.error('[stripe-checkout] RPC error:', rpcError)
      return Response.json(
        { error: rpcError.message ?? 'Falha ao reservar ingressos' },
        { status: 500, headers: corsHeaders },
      )
    }

    return Response.json(
      { sessionId: session.id, url: session.url, orderId },
      { headers: corsHeaders },
    )
  } catch (err: any) {
    console.error('[stripe-checkout]', err)
    return Response.json(
      { error: err.message ?? 'Erro interno' },
      { status: 500, headers: corsHeaders },
    )
  }
})
