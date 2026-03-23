import { useQuery } from '@tanstack/react-query'
import { orderKeys, orderQueries } from '@/features/orders/services'

export function useOrderDetails(orderId?: string | null) {
  const detailBundleQuery = useQuery({
    ...(orderId
      ? orderQueries.detailBundle(orderId)
      : {
          queryKey: [...orderKeys.detail('empty'), 'bundle'] as const,
          queryFn: async () => ({ order: null, items: [], digitalTickets: [] }),
        }),
    enabled: Boolean(orderId),
  })

  const detail = detailBundleQuery.data ?? {
    order: null,
    items: [],
    digitalTickets: [],
  }

  return {
    order: detail.order,
    items: detail.items,
    digitalTickets: detail.digitalTickets,
    loading: detailBundleQuery.isPending,
    error: detailBundleQuery.error instanceof Error ? detailBundleQuery.error.message : '',
  }
}
