import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderKeys, orderQueries } from '@/features/orders/services'
import { mapOrderStatusToPaymentStatus } from '@/features/orders/services'
import type { OrderPaymentMethod, OrderStatus } from '@/features/orders/types'

export function useOrdersList(organizationId?: string) {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | OrderPaymentMethod>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const eventsQuery = useQuery({
    ...(organizationId ? orderQueries.events(organizationId) : { queryKey: orderKeys.events('anonymous'), queryFn: async () => [] }),
    enabled: Boolean(organizationId),
  })

  const ordersQuery = useQuery({
    ...(selectedEventId ? orderQueries.listByEvent(selectedEventId) : { queryKey: orderKeys.byEvent('empty'), queryFn: async () => [] }),
    enabled: Boolean(selectedEventId),
  })

  useEffect(() => {
    const firstEventId = eventsQuery.data?.[0]?.id

    if (!firstEventId) {
      setSelectedEventId('')
      return
    }

    setSelectedEventId((current) => current || firstEventId)
  }, [eventsQuery.data])

  const events = eventsQuery.data ?? []
  const orders = ordersQuery.data ?? []
  const loading = eventsQuery.isPending || (Boolean(selectedEventId) && ordersQuery.isPending)
  const error =
    (eventsQuery.error instanceof Error ? eventsQuery.error.message : '') ||
    (ordersQuery.error instanceof Error ? ordersQuery.error.message : '')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const normalizedSearch = search.toLowerCase()
      const matchesSearch =
        !normalizedSearch ||
        order.buyer_name.toLowerCase().includes(normalizedSearch) ||
        order.buyer_email.toLowerCase().includes(normalizedSearch) ||
        order.buyer_cpf?.includes(normalizedSearch) ||
        order.id.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesMethod = methodFilter === 'all' || order.payment_method === methodFilter

      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [methodFilter, orders, search, statusFilter])

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => mapOrderStatusToPaymentStatus(order.status) === 'paid')
    const confirmedRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0)
    const pendingOrders = orders.filter((order) => order.status === 'pending').length
    const todayOrders = orders.filter((order) => {
      const createdAt = new Date(order.created_at)
      const now = new Date()
      return createdAt.getDate() === now.getDate() && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length

    return {
      confirmedRevenue,
      paidOrders: paidOrders.length,
      pendingOrders,
      todayOrders,
    }
  }, [orders])

  async function refreshOrders() {
    await Promise.all([eventsQuery.refetch(), ordersQuery.refetch()])
  }

  function openOrder(orderId: string) {
    setSelectedOrderId(orderId)
  }

  function closeOrder() {
    setSelectedOrderId(null)
  }

  return {
    events,
    selectedEventId,
    setSelectedEventId,
    orders,
    filteredOrders,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    selectedOrderId,
    openOrder,
    closeOrder,
    stats,
    refreshOrders,
  }
}
