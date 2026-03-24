import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { financialKeys, financialQueries } from '@/features/financial/services'
import type { FinancialOverview } from '@/features/financial/types'
import type { FinancialCostCategory, FinancialCostStatus, FinancialTab } from '@/features/financial/types'

function buildEmptyOverview(): FinancialOverview {
  return {
    events: [],
    reports: [],
    reconciliation_rows: [],
    unallocated_costs: 0,
    gross_sales: 0,
    net_sales: 0,
    approved_payments_amount: 0,
    approved_payments_count: 0,
    failed_payments_amount: 0,
    refunded_amount: 0,
    chargeback_amount: 0,
    operational_costs: 0,
    result: 0,
    margin_percent: 0,
    divergence_count: 0,
    pending_reconciliation_count: 0,
  }
}

export function useFinancialDashboard(organizationId?: string | null) {
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [tab, setTab] = useState<FinancialTab>('overview')
  const [categoryFilter, setCategoryFilter] = useState<'all' | FinancialCostCategory>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | FinancialCostStatus>('all')
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  const overviewQuery = useQuery({
    ...(organizationId
      ? financialQueries.overview(organizationId)
      : {
          queryKey: financialKeys.overview('empty'),
          queryFn: async () => buildEmptyOverview(),
        }),
    enabled: Boolean(organizationId),
  })

  const costEntriesQuery = useQuery({
    ...(organizationId
      ? financialQueries.costs(organizationId, selectedEventId === 'all' ? undefined : selectedEventId)
      : {
          queryKey: financialKeys.costs('empty'),
          queryFn: async () => [],
        }),
    enabled: Boolean(organizationId),
  })

  const overview = overviewQuery.data
  const costEntries = costEntriesQuery.data ?? []

  const filteredCostEntries = useMemo(
    () =>
      costEntries.filter((entry) => {
        if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
          return false
        }

        if (statusFilter !== 'all' && entry.status !== statusFilter) {
          return false
        }

        return true
      }),
    [categoryFilter, costEntries, statusFilter],
  )

  const selectedEventReport = useMemo(() => {
    if (!overview || selectedEventId === 'all') {
      return null
    }

    return overview.reports.find((report) => report.event_id === selectedEventId) ?? null
  }, [overview, selectedEventId])

  return {
    tab,
    setTab,
    selectedEventId,
    setSelectedEventId,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    expandedEventId,
    setExpandedEventId,
    overview,
    reports: overview?.reports ?? [],
    reconciliationRows: overview?.reconciliation_rows ?? [],
    events: overview?.events ?? [],
    filteredCostEntries,
    selectedEventReport,
    loading: overviewQuery.isPending || costEntriesQuery.isPending,
    error:
      (overviewQuery.error instanceof Error ? overviewQuery.error.message : '') ||
      (costEntriesQuery.error instanceof Error ? costEntriesQuery.error.message : ''),
    refresh: async () => {
      await Promise.all([overviewQuery.refetch(), costEntriesQuery.refetch()])
    },
  }
}
