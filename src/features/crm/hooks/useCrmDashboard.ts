import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { crmKeys, crmQueries } from '@/features/crm/services'
import type { CrmPeriodFilter, CustomerLifecycleStatus } from '@/features/crm/types'

function isWithinPeriod(value?: string | null, period?: CrmPeriodFilter) {
  if (!value || !period || period === 'all') {
    return true
  }

  const days = Number(period.replace('d', ''))
  const threshold = Date.now() - days * 86_400_000
  return new Date(value).getTime() >= threshold
}

export function useCrmDashboard(organizationId?: string | null) {
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerLifecycleStatus>('all')
  const [periodFilter, setPeriodFilter] = useState<CrmPeriodFilter>('90d')
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const overviewQuery = useQuery({
    ...(organizationId
      ? crmQueries.overview(organizationId)
      : {
          queryKey: crmKeys.overview('empty'),
          queryFn: async () => ({
            events: [],
            customers: [],
            summary: {
              total_customers: 0,
              active_customers: 0,
              repeat_customers: 0,
              total_revenue: 0,
              average_ticket: 0,
              no_show_risk_customers: 0,
            },
          }),
        }),
    enabled: Boolean(organizationId),
  })

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return (overviewQuery.data?.customers ?? []).filter((customer) => {
      if (selectedEventId !== 'all' && !customer.event_ids.includes(selectedEventId)) {
        return false
      }

      if (statusFilter !== 'all' && customer.status !== statusFilter) {
        return false
      }

      if (!isWithinPeriod(customer.last_purchase_at ?? customer.first_order_at, periodFilter)) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return (
        customer.full_name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch) ||
        customer.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
      )
    })
  }, [overviewQuery.data?.customers, periodFilter, search, selectedEventId, statusFilter])

  const summary = useMemo(() => {
    const totalRevenue = filteredCustomers.reduce((sum, customer) => sum + customer.total_revenue, 0)

    return {
      total_customers: filteredCustomers.length,
      active_customers: filteredCustomers.filter((customer) => customer.status === 'new' || customer.status === 'active' || customer.status === 'loyal').length,
      repeat_customers: filteredCustomers.filter((customer) => customer.total_orders >= 2).length,
      total_revenue: totalRevenue,
      average_ticket: filteredCustomers.length > 0 ? Number((totalRevenue / filteredCustomers.length).toFixed(2)) : 0,
      no_show_risk_customers: filteredCustomers.filter((customer) => customer.no_show_count > 0 && customer.status === 'at_risk').length,
    }
  }, [filteredCustomers])

  return {
    events: overviewQuery.data?.events ?? [],
    customers: filteredCustomers,
    summary,
    selectedEventId,
    setSelectedEventId,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    search,
    setSearch,
    selectedCustomerId,
    setSelectedCustomerId,
    loading: overviewQuery.isPending,
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : '',
    refresh: overviewQuery.refetch,
  }
}
