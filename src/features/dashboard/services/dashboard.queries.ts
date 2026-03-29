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
      // Cache: mantém dados por 5 min antes de refetch automático
      staleTime: 5 * 60 * 1000,
      // Tenta refetch a cada 10 min em background
      refetchInterval: 10 * 60 * 1000,
      // Não refetch quando tab fica inativa
      refetchOnWindowFocus: false,
      // Se houver erro, retenta em 30s
      retry: 1,
      retryDelay: 30_000,
    }),
}
