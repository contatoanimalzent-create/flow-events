import { supabase } from '@/lib/supabase'

export interface SendConfirmationEmailParams {
  orderId: string
  recipientEmail?: string
  templateKey?: 'order-confirmation' | 'order-confirmation-with-qr' | 'tickets-issued'
}

export interface EmailSendResponse {
  ok: boolean
  messageId: string | null
  status: 'sent' | 'skipped' | 'error'
  error?: string
}

/**
 * Send order confirmation email via Edge Function
 * Handles QR code generation server-side for better performance and security
 */
export async function sendOrderConfirmationEmail(
  params: SendConfirmationEmailParams,
): Promise<EmailSendResponse> {
  try {
    const { orderId, recipientEmail, templateKey = 'order-confirmation-with-qr' } = params

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        orderId,
        templateKey,
        recipientEmail,
      },
    })

    if (error) {
      console.error('[sendOrderConfirmationEmail] Edge Function error:', error)
      return {
        ok: false,
        messageId: null,
        status: 'error',
        error: error.message ?? 'Failed to send email',
      }
    }

    return {
      ok: data?.ok ?? false,
      messageId: data?.messageId ?? null,
      status: data?.status ?? 'skipped',
    }
  } catch (error) {
    console.error('[sendOrderConfirmationEmail] Exception:', error)
    return {
      ok: false,
      messageId: null,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send confirmation email after successful order payment
 * Wrapper with common defaults for order completion flow
 */
export async function sendPaymentConfirmationEmail(orderId: string): Promise<EmailSendResponse> {
  return sendOrderConfirmationEmail({
    orderId,
    templateKey: 'order-confirmation-with-qr',
  })
}

/**
 * Resend confirmation email manually (admin action)
 */
export async function resendConfirmationEmail(
  orderId: string,
  recipientEmail?: string,
): Promise<EmailSendResponse> {
  return sendOrderConfirmationEmail({
    orderId,
    recipientEmail,
    templateKey: 'order-confirmation-with-qr',
  })
}

/**
 * Check email sending status
 */
export async function getEmailStatus(messageId: string) {
  try {
    const { data, error } = await supabase
      .from('transactional_messages')
      .select('id,status,sent_at,created_at,provider_message_id')
      .eq('id', messageId)
      .single()

    if (error) throw error

    return {
      ok: true,
      status: data?.status,
      sentAt: data?.sent_at,
    }
  } catch (error) {
    console.error('[getEmailStatus] Error:', error)
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : 'Failed to check status',
    }
  }
}
