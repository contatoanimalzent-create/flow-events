import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campaignsKeys, campaignsQueries } from '@/features/campaigns/services'
import type { CampaignsOverview } from '@/features/campaigns/types'
import { paginateItems } from '@/shared/api'

const EMPTY_OVERVIEW: CampaignsOverview = {
  events: [],
  segments: [],
  drafts: [],
  runs: [],
  summary: {
    saved_segments: 0,
    draft_campaigns: 0,
    active_runs: 0,
    addressable_customers: 0,
    high_value_customers: 0,
  },
}

export function useCampaignsDashboard(organizationId?: string | null) {
  const [tab, setTab] = useState<'segments' | 'drafts' | 'runs'>('segments')
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [segmentsPage, setSegmentsPage] = useState(1)
  const [draftsPage, setDraftsPage] = useState(1)
  const [runsPage, setRunsPage] = useState(1)

  const overviewQuery = useQuery({
    ...(organizationId ? campaignsQueries.overview(organizationId) : { queryKey: campaignsKeys.overview('empty'), queryFn: async () => EMPTY_OVERVIEW }),
    enabled: Boolean(organizationId),
  })

  useEffect(() => {
    if (tab === 'segments') {
      setSegmentsPage(1)
    }
    if (tab === 'drafts') {
      setDraftsPage(1)
    }
    if (tab === 'runs') {
      setRunsPage(1)
    }
  }, [tab])

  const paginatedSegments = useMemo(() => paginateItems(overviewQuery.data?.segments ?? [], { page: segmentsPage, pageSize: 8 }), [overviewQuery.data?.segments, segmentsPage])
  const paginatedDrafts = useMemo(() => paginateItems(overviewQuery.data?.drafts ?? [], { page: draftsPage, pageSize: 8 }), [overviewQuery.data?.drafts, draftsPage])
  const paginatedRuns = useMemo(() => paginateItems(overviewQuery.data?.runs ?? [], { page: runsPage, pageSize: 8 }), [overviewQuery.data?.runs, runsPage])

  return {
    tab,
    setTab,
    selectedSegmentId,
    setSelectedSegmentId,
    overview: overviewQuery.data,
    paginatedSegments: paginatedSegments.items,
    paginatedDrafts: paginatedDrafts.items,
    paginatedRuns: paginatedRuns.items,
    segmentsPagination: paginatedSegments.pagination,
    draftsPagination: paginatedDrafts.pagination,
    runsPagination: paginatedRuns.pagination,
    setSegmentsPage,
    setDraftsPage,
    setRunsPage,
    loading: overviewQuery.isPending,
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : '',
    refresh: overviewQuery.refetch,
  }
}
