import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardKeys, dashboardQueries } from '@/features/dashboard/services'
import type { DashboardOverview, DashboardPeriodFilter } from '@/features/dashboard/types'

const EMPTY_DASHBOARD: DashboardOverview = {
  organization_id: '',
  events: [],
  summary: {
    grossRevenue: 0,
    netRevenue: 0,
    marginPercent: 0,
    activeEvents: 0,
    runningCampaigns: 0,
    criticalAlerts: 0,
    totalCheckins: 0,
    totalCustomers: 0,
  },
  revenueSeries: [],
  conversionSeries: [],
  eventRanking: [],
  customerRanking: [],
  performance: [],
}

export function useDashboardOverview(organizationId?: string | null) {
  const [period, setPeriod] = useState<DashboardPeriodFilter>('30d')
  const [selectedEventId, setSelectedEventId] = useState('all')

  const overviewQuery = useQuery({
    ...(organizationId
      ? dashboardQueries.overview(organizationId, period, selectedEventId)
      : {
          queryKey: dashboardKeys.overview('empty', period, selectedEventId),
          queryFn: async () => EMPTY_DASHBOARD,
        }),
    enabled: Boolean(organizationId),
  })

  return {
    overview: overviewQuery.data ?? EMPTY_DASHBOARD,
    period,
    setPeriod,
    selectedEventId,
    setSelectedEventId,
    eventOptions: overviewQuery.data?.events ?? [],
    loading: overviewQuery.isPending,
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : '',
    refresh: overviewQuery.refetch,
  }
}
