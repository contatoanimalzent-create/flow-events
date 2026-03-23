import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderKeys, orderMutations } from '@/features/orders/services'
import type { CreateOrderDraftInput } from '@/features/orders/types'

export function useCreateOrderDraft(eventId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orderMutations.createDraft(),
    onSuccess: async (order) => {
      await Promise.all([
        eventId ? queryClient.invalidateQueries({ queryKey: orderKeys.byEvent(eventId) }) : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) }),
      ])
    },
  })
}
