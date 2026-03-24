import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { financialKeys, financialQueries } from '@/features/financial/services'
import { buildEmptyFinancialOverview } from '@/features/financial/services'
import type { FinancialCostCategory, FinancialCostStatus, FinancialTab } from '@/features/financial/types'
import { paginateItems } from '@/shared/api'

export function useFinancialDashboard(organizationId?: string | null) {
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [tab, setTab] = useState<FinancialTab>('overview')
  const [categoryFilter, setCategoryFilter] = useState<'all' | FinancialCostCategory>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | FinancialCostStatus>('all')
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [reportsPage, setReportsPage] = useState(1)
  const [reconciliationPage, setReconciliationPage] = useState(1)
  const [costsPage, setCostsPage] = useState(1)

  const overviewQuery = useQuery({
    ...(organizationId
      ? financialQueries.overview(organizationId)
      : {
          queryKey: financialKeys.overview('empty'),
          queryFn: async () => buildEmptyFinancialOverview(),
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

  const filteredReports = useMemo(() => {
    const reports = overview?.reports ?? []

    if (selectedEventId === 'all') {
      return reports
    }

    return reports.filter((report) => report.event_id === selectedEventId)
  }, [overview?.reports, selectedEventId])

  const filteredReconciliationRows = useMemo(() => {
    const rows = overview?.reconciliation_rows ?? []
    if (selectedEventId === 'all') {
      return rows
    }

    return rows.filter((row) => row.event_id === selectedEventId)
  }, [overview?.reconciliation_rows, selectedEventId])

  useEffect(() => {
    setReportsPage(1)
    setReconciliationPage(1)
    setCostsPage(1)
  }, [selectedEventId, categoryFilter, statusFilter, tab])

  const paginatedReports = useMemo(() => paginateItems(filteredReports, { page: reportsPage, pageSize: 6 }), [filteredReports, reportsPage])
  const paginatedReconciliationRows = useMemo(() => paginateItems(filteredReconciliationRows, { page: reconciliationPage, pageSize: 8 }), [filteredReconciliationRows, reconciliationPage])
  const paginatedCostEntries = useMemo(() => paginateItems(filteredCostEntries, { page: costsPage, pageSize: 10 }), [filteredCostEntries, costsPage])

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
    filteredReports,
    paginatedReports: paginatedReports.items,
    reportsPagination: paginatedReports.pagination,
    setReportsPage,
    reconciliationRows: filteredReconciliationRows,
    paginatedReconciliationRows: paginatedReconciliationRows.items,
    reconciliationPagination: paginatedReconciliationRows.pagination,
    setReconciliationPage,
    events: overview?.events ?? [],
    filteredCostEntries,
    paginatedCostEntries: paginatedCostEntries.items,
    costsPagination: paginatedCostEntries.pagination,
    setCostsPage,
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
