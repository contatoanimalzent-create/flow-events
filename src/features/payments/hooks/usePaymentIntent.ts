import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentKeys, paymentMutations } from '@/features/payments/services'
import { orderKeys } from '@/features/orders/services'

export function usePaymentIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    ...paymentMutations.createIntent(),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.byOrder(result.orderId) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(result.orderId) }),
      ])
    },
  })
}
