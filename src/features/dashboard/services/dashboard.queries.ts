import { queryOptions } from '@tanstack/react-query'
import type { DashboardPeriodFilter } from '@/features/dashboard/types'
import { dashboardService } from './dashboard.service'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (organizationId: string, period: DashboardPeriodFilter, eventId: string) =>
    [...dashboardKeys.all, 'overview', organizationId, period, eventId] as const,
}

export const dashboardQueries = {
  overview: (organizationId: string, period: DashboardPeriodFilter, eventId: string) =>
    queryOptions({
      queryKey: dashboardKeys.overview(organizationId, period, eventId),
      queryFn: () => dashboardService.getOverview(organizationId, period, eventId),
    }),
}
