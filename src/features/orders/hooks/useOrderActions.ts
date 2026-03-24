import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderKeys, orderMutations } from '@/features/orders/services'
import { paymentKeys, paymentMutations } from '@/features/payments/services'
import { ticketKeys } from '@/features/tickets/services/tickets.queries'

interface UseOrderActionsParams {
  eventId?: string
}

export function useOrderActions({ eventId }: UseOrderActionsParams) {
  const queryClient = useQueryClient()

  async function invalidateOrderState(orderId: string) {
    const tasks = [
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
      queryClient.invalidateQueries({ queryKey: [...orderKeys.detail(orderId), 'bundle'] as const }),
    ]

    if (eventId) {
      tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.byEvent(eventId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) }))
    }

    tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.items(orderId) }))
    tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.digitalTickets(orderId) }))
    tasks.push(queryClient.invalidateQueries({ queryKey: paymentKeys.byOrder(orderId) }))
    tasks.push(queryClient.invalidateQueries({ queryKey: paymentKeys.messages(orderId) }))

    await Promise.all(tasks)
  }

  const confirmMutation = useMutation({
    ...orderMutations.confirm(),
    onSuccess: async (order) => {
      if (order) {
        await invalidateOrderState(order.id)
      }
    },
  })

  const cancelMutation = useMutation({
    ...orderMutations.cancel(),
    onSuccess: async (_, variables) => {
      await invalidateOrderState(variables.orderId)
    },
  })

  const issueDigitalTicketsMutation = useMutation({
    ...orderMutations.issueDigitalTickets(),
    onSuccess: async (_, variables) => {
      await invalidateOrderState(variables.orderId)
    },
  })

  const resendTicketsMutation = useMutation({
    ...paymentMutations.resendTickets(),
    onSuccess: async (_, variables) => {
      await invalidateOrderState(variables.orderId)
    },
  })

  async function confirmOrder(orderId: string) {
    await confirmMutation.mutateAsync({ orderId })
  }

  async function cancelOrder(orderId: string) {
    if (!confirm('Cancelar este pedido?')) {
      return false
    }

    await cancelMutation.mutateAsync({ orderId })
    return true
  }

  async function issueDigitalTickets(orderId: string) {
    await issueDigitalTicketsMutation.mutateAsync({ orderId })
  }

  async function resendTickets(orderId: string) {
    await resendTicketsMutation.mutateAsync({ orderId })
  }

  return {
    confirmOrder,
    cancelOrder,
    issueDigitalTickets,
    resendTickets,
    confirming: confirmMutation.isPending,
    cancelling: cancelMutation.isPending,
    issuing: issueDigitalTicketsMutation.isPending,
    resendingTickets: resendTicketsMutation.isPending,
  }
}
