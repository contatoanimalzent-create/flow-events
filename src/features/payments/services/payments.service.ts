import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentRow,
  ResendTicketsInput,
  TransactionalMessageRow,
} from '@/features/payments/types'
import { assertPaymentsResult, PaymentServiceError } from './payments.errors'
import {
  buildPaymentIntentInput,
  mapPaymentIntentResult,
  mapPaymentRow,
  mapTransactionalMessageRow,
} from './payments.payloads'

const paymentsApi = createApiClient('payments')

export const paymentsService = {
  async getPaymentByOrderId(orderId: string): Promise<PaymentRow | null> {
    return paymentsApi.request('get_payment_by_order_id', async () => {
      const result = await supabase.from('payments').select('*').eq('order_id', orderId).maybeSingle()
      assertPaymentsResult(result)
      return result.data ? mapPaymentRow(result.data as Record<string, unknown>) : null
    }, { orderId })
  },

  async listTransactionalMessagesByOrder(orderId: string): Promise<TransactionalMessageRow[]> {
    return paymentsApi.request('list_transactional_messages_by_order', async () => {
      const result = await supabase
        .from('transactional_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })

      assertPaymentsResult(result)
      return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapTransactionalMessageRow)
    }, { orderId })
  },

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    return paymentsApi.request('create_payment_intent', async () => {
      const { data, error } = await supabase.functions.invoke('stripe-payment-intent', {
        body: buildPaymentIntentInput(input),
      })

      if (error) {
        throw new PaymentServiceError(error.message, 'payment_intent_creation_failed')
      }

      if (!data || typeof data !== 'object') {
        throw new PaymentServiceError('Resposta invalida do gateway de pagamento', 'payment_intent_invalid_response')
      }

      const payload = data as Record<string, unknown>

      if (payload.error) {
        throw new PaymentServiceError(String(payload.error), 'payment_intent_creation_failed')
      }

      return mapPaymentIntentResult(payload)
    }, { orderId: input.orderId })
  },

  async resendTickets(input: ResendTicketsInput): Promise<{ ok: boolean; status: string }> {
    return paymentsApi.request('resend_tickets', async () => {
      const { data, error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          orderId: input.orderId,
          templateKey: 'tickets-issued',
          recipientEmail: input.recipientEmail ?? null,
        },
      })

      if (error) {
        throw new PaymentServiceError(error.message, 'transactional_email_failed')
      }

      if (!data || typeof data !== 'object') {
        throw new PaymentServiceError('Resposta invalida ao reenviar ingressos', 'transactional_email_invalid_response')
      }

      const payload = data as Record<string, unknown>

      if (payload.error) {
        throw new PaymentServiceError(String(payload.error), 'transactional_email_failed')
      }

      return {
        ok: Boolean(payload.ok),
        status: String(payload.status ?? 'queued'),
      }
    }, { orderId: input.orderId })
  },
}
