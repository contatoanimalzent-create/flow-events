import { useMutation } from '@tanstack/react-query'
import { sendPaymentConfirmationEmail, EmailSendResponse } from '../services/email.service'

/**
 * Hook to send order confirmation email
 * Typically called after successful payment/order creation
 */
export function useSendConfirmationEmail() {
  return useMutation<EmailSendResponse, Error, string>({
    mutationFn: async (orderId: string) => {
      const result = await sendPaymentConfirmationEmail(orderId)

      if (!result.ok && result.error) {
        throw new Error(result.error)
      }

      return result
    },
    onError: (error) => {
      console.error('[useSendConfirmationEmail] Error sending email:', error)
    },
    onSuccess: (result) => {
      console.log('[useSendConfirmationEmail] Email sent successfully:', result.messageId)
    },
  })
}

/**
 * Hook to resend confirmation email (admin action)
 */
export function useResendConfirmationEmail() {
  return useMutation<
    EmailSendResponse,
    Error,
    { orderId: string; email?: string }
  >({
    mutationFn: async ({ orderId, email }) => {
      const { resendConfirmationEmail } = await import(
        '../services/email.service'
      )
      const result = await resendConfirmationEmail(orderId, email)

      if (!result.ok && result.error) {
        throw new Error(result.error)
      }

      return result
    },
    onError: (error) => {
      console.error('[useResendConfirmationEmail] Error:', error)
    },
  })
}
