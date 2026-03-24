import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import {
  createStripeClient,
  processStripeWebhookEvent,
  registerStripeWebhookEvent,
  updateWebhookEvent,
  validateStripeWebhookSignature,
} from '../services/payments/webhook.service.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const stripe = createStripeClient()
  const supabase = createSupabaseAdminClient()

  let event

  try {
    event = validateStripeWebhookSignature({
      body,
      signature,
      stripe,
    })
  } catch (error: any) {
    console.error('[stripe-webhook] invalid signature', error?.message ?? error)
    return new Response('Invalid signature', { status: 400, headers: corsHeaders })
  }

  let webhookEventId: string | null = null

  try {
    const registration = await registerStripeWebhookEvent(supabase, event)
    webhookEventId = registration.webhookEventId

    if (registration.isDuplicate) {
      console.log('[stripe-webhook] duplicate event ignored', event.id, event.type)
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    if (!webhookEventId) {
      throw new Error('Webhook event registration failed')
    }

    const result = await processStripeWebhookEvent(supabase, event)

    await updateWebhookEvent(supabase, webhookEventId, {
      processing_status: result.status,
      processed_at: new Date().toISOString(),
      order_id: result.orderId,
      payment_id: result.paymentId,
    })
  } catch (error: any) {
    console.error('[stripe-webhook] processing error', {
      eventId: event?.id ?? null,
      eventType: event?.type ?? null,
      error: error?.message ?? error,
    })

    if (webhookEventId) {
      try {
        await updateWebhookEvent(supabase, webhookEventId, {
          processing_status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: error?.message ?? 'Unknown processing error',
        })
      } catch (updateError) {
        console.error('[stripe-webhook] failed to persist webhook error state', updateError)
      }
    }

    return new Response('error', { status: 500, headers: corsHeaders })
  }

  return new Response('ok', { status: 200, headers: corsHeaders })
})
