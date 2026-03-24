import { useQuery } from '@tanstack/react-query'
import { paymentKeys, paymentQueries } from '@/features/payments/services'

export function useTransactionalMessages(orderId?: string | null) {
  const query = useQuery({
    ...(orderId
      ? paymentQueries.messagesByOrder(orderId)
      : {
          queryKey: paymentKeys.messages('empty'),
          queryFn: async () => [],
        }),
    enabled: Boolean(orderId),
  })

  return {
    messages: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : '',
    refetch: query.refetch,
  }
}
