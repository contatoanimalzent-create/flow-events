import Stripe from 'npm:stripe@14'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

const PROCESSING_RATE = 0.018

function toStripeAmount(value: number) {
  return Math.round(value * 100)
}

function getInstallmentsFromMethod(paymentMethod?: string | null) {
  if (!paymentMethod) {
    return 0
  }

  const match = paymentMethod.match(/^card_(\d+)x$/)
  return match ? Number(match[1]) : 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
    const supabase = createSupabaseAdminClient()

    const { orderId, paymentMethod, buyerEmail, buyerName } = await req.json()

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400, headers: corsHeaders })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id,event_id,organization_id,buyer_name,buyer_email,total_amount,subtotal,fee_amount,payment_method,status,stripe_payment_intent')
      .eq('id', orderId)
      .single()

    if (!order) {
      return Response.json({ error: 'Pedido nao encontrado' }, { status: 404, headers: corsHeaders })
    }

    if (order.status === 'paid') {
      return Response.json({ error: 'Pedido ja pago' }, { status: 409, headers: corsHeaders })
    }

    const [{ data: event }, { data: organization }] = await Promise.all([
      supabase.from('events').select('id,name,organization_id').eq('id', order.event_id).single(),
      supabase.from('organizations').select('stripe_account_id').eq('id', order.organization_id).single(),
    ])

    if (!event) {
      return Response.json({ error: 'Evento nao encontrado' }, { status: 404, headers: corsHeaders })
    }

    const installments = getInstallmentsFromMethod(paymentMethod ?? order.payment_method)
    const totalAmount = Number(order.total_amount ?? 0)
    const subtotal = Number(order.subtotal ?? 0)
    const feeAmount = Number(order.fee_amount ?? 0)
    const amount = toStripeAmount(totalAmount)
    const applicationFeeAmount = toStripeAmount(feeAmount + subtotal * PROCESSING_RATE)

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id,payment_intent_id,status')
      .eq('order_id', order.id)
      .eq('provider', 'stripe')
      .maybeSingle()

    if (amount <= 0) {
      return Response.json({ error: 'Pedido sem valor para cobrar' }, { status: 422, headers: corsHeaders })
    }

    if (
      existingPayment?.payment_intent_id &&
      (existingPayment.status === 'pending' || existingPayment.status === 'failed' || order.status === 'pending')
    ) {
      const existingIntent = await stripe.paymentIntents.retrieve(existingPayment.payment_intent_id)

      if (existingIntent.client_secret) {
        return Response.json(
          {
            orderId: order.id,
            paymentId: existingPayment.id ?? null,
            paymentIntentId: existingIntent.id,
            clientSecret: existingIntent.client_secret,
            provider: 'stripe',
          },
          { headers: corsHeaders },
        )
      }
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
      receipt_email: buyerEmail ?? order.buyer_email ?? undefined,
      metadata: {
        order_id: String(order.id),
        event_id: String(order.event_id),
        organization_id: String(order.organization_id),
        installments: String(installments),
        buyer_name: buyerName ?? order.buyer_name ?? '',
        buyer_email: buyerEmail ?? order.buyer_email ?? '',
      },
    }

    if (organization?.stripe_account_id) {
      paymentIntentParams.application_fee_amount = applicationFeeAmount
      paymentIntentParams.transfer_data = { destination: organization.stripe_account_id }
    }

    if (installments > 1) {
      paymentIntentParams.payment_method_options = {
        card: { installments: { enabled: true } },
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    const { data: payment } = await supabase
      .from('payments')
      .upsert(
        {
          order_id: order.id,
          organization_id: order.organization_id,
          event_id: order.event_id,
          provider: 'stripe',
          payment_intent_id: paymentIntent.id,
          status: 'pending',
          amount: totalAmount,
          currency: 'brl',
          metadata: {
            installments,
            payment_method: paymentMethod ?? order.payment_method ?? null,
          },
        },
        { onConflict: 'order_id,provider' },
      )
      .select('id')
      .single()

    await supabase
      .from('orders')
      .update({
        status: 'pending',
        payment_method: paymentMethod ?? order.payment_method ?? (installments > 0 ? `card_${installments}x` : 'pix'),
        stripe_payment_intent: paymentIntent.id,
      })
      .eq('id', order.id)

    return Response.json(
      {
        orderId: order.id,
        paymentId: payment?.id ?? null,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        provider: 'stripe',
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    console.error('[stripe-payment-intent]', error)
    return Response.json({ error: error.message ?? 'Unexpected error' }, { status: 500, headers: corsHeaders })
  }
})
