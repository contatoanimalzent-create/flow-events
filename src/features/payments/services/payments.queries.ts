import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { CreatePaymentIntentInput, ResendTicketsInput } from '@/features/payments/types'
import { paymentsService } from './payments.service'

export const paymentKeys = {
  all: ['payments'] as const,
  byOrder: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
  messages: (orderId: string) => [...paymentKeys.byOrder(orderId), 'messages'] as const,
  actions: () => [...paymentKeys.all, 'actions'] as const,
}

export const paymentQueries = {
  byOrder: (orderId: string) =>
    queryOptions({
      queryKey: paymentKeys.byOrder(orderId),
      queryFn: () => paymentsService.getPaymentByOrderId(orderId),
    }),
  messagesByOrder: (orderId: string) =>
    queryOptions({
      queryKey: paymentKeys.messages(orderId),
      queryFn: () => paymentsService.listTransactionalMessagesByOrder(orderId),
    }),
}

export const paymentMutations = {
  createIntent: () =>
    mutationOptions({
      mutationKey: [...paymentKeys.actions(), 'create-intent'] as const,
      mutationFn: (input: CreatePaymentIntentInput) => paymentsService.createPaymentIntent(input),
    }),
  resendTickets: () =>
    mutationOptions({
      mutationKey: [...paymentKeys.actions(), 'resend-tickets'] as const,
      mutationFn: (input: ResendTicketsInput) => paymentsService.resendTickets(input),
    }),
}
