import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderKeys, orderQueries } from '@/features/orders/services'
import { paymentKeys, paymentQueries } from '@/features/payments/services'

interface UsePaymentStatusOptions {
  orderId?: string | null
  enabled?: boolean
  refetchIntervalMs?: number
}

export function usePaymentStatus({ orderId, enabled = true, refetchIntervalMs = 3000 }: UsePaymentStatusOptions) {
  const isEnabled = Boolean(orderId) && enabled

  const paymentQuery = useQuery({
    ...(orderId
      ? paymentQueries.byOrder(orderId)
      : {
          queryKey: paymentKeys.byOrder('empty'),
          queryFn: async () => null,
        }),
    enabled: isEnabled,
    refetchInterval: isEnabled ? refetchIntervalMs : false,
  })

  const orderQuery = useQuery({
    ...(orderId
      ? orderQueries.detail(orderId)
      : {
          queryKey: orderKeys.detail('empty'),
          queryFn: async () => null,
        }),
    enabled: isEnabled,
    refetchInterval: isEnabled ? refetchIntervalMs : false,
  })

  const status = useMemo(() => {
    const payment = paymentQuery.data
    const order = orderQuery.data

    const isPaid = order?.status === 'paid' || payment?.status === 'paid'
    const isFailed = order?.status === 'failed' || payment?.status === 'failed'
    const isCancelled = order?.status === 'cancelled' || payment?.status === 'cancelled'
    const isRefunded = order?.status === 'refunded' || payment?.status === 'refunded'
    const isExpired = order?.status === 'expired'
    const isPending =
      !isPaid &&
      !isFailed &&
      !isCancelled &&
      !isRefunded &&
      !isExpired &&
      Boolean(orderId)

    return {
      isPaid,
      isFailed,
      isCancelled,
      isRefunded,
      isExpired,
      isPending,
    }
  }, [orderId, orderQuery.data, paymentQuery.data])

  return {
    order: orderQuery.data ?? null,
    payment: paymentQuery.data ?? null,
    loading: paymentQuery.isPending || orderQuery.isPending,
    error:
      (paymentQuery.error instanceof Error ? paymentQuery.error.message : '') ||
      (orderQuery.error instanceof Error ? orderQuery.error.message : ''),
    refresh: async () => {
      await Promise.all([paymentQuery.refetch(), orderQuery.refetch()])
    },
    ...status,
  }
}
