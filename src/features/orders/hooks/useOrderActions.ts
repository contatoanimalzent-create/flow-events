import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { orderKeys, orderMutations } from '@/features/orders/services'
import { paymentKeys, paymentMutations } from '@/features/payments/services'
import { ticketKeys } from '@/features/tickets/services/tickets.queries'

interface UseOrderActionsParams {
  eventId?: string
}

export function useOrderActions({ eventId }: UseOrderActionsParams) {
  const queryClient = useQueryClient()
  const organizationId = useAuthStore((state) => state.organization?.id)
  const profile = useAuthStore((state) => state.profile)

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
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: eventId ?? null,
        entity_type: 'order',
        entity_id: orderId,
        action_type: 'status_change',
        title: 'Pedido confirmado',
      })
    }
  }

  async function cancelOrder(orderId: string) {
    await cancelMutation.mutateAsync({ orderId })
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: eventId ?? null,
        entity_type: 'order',
        entity_id: orderId,
        action_type: 'status_change',
        title: 'Pedido cancelado',
      })
    }
    return true
  }

  async function issueDigitalTickets(orderId: string) {
    await issueDigitalTicketsMutation.mutateAsync({ orderId })
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: eventId ?? null,
        entity_type: 'order',
        entity_id: orderId,
        action_type: 'issue',
        title: 'Ingressos digitais emitidos',
      })
    }
  }

  async function resendTickets(orderId: string) {
    await resendTicketsMutation.mutateAsync({ orderId })
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: eventId ?? null,
        entity_type: 'payment',
        entity_id: orderId,
        action_type: 'issue',
        title: 'Ingressos reenviados',
      })
    }
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
