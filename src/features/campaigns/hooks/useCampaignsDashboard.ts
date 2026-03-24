import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campaignsKeys, campaignsQueries } from '@/features/campaigns/services'

export function useCampaignsDashboard(organizationId?: string | null) {
  const [tab, setTab] = useState<'segments' | 'drafts'>('segments')
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  const overviewQuery = useQuery({
    ...(organizationId
      ? campaignsQueries.overview(organizationId)
      : {
          queryKey: campaignsKeys.overview('empty'),
          queryFn: async () => ({
            events: [],
            segments: [],
            drafts: [],
            summary: {
              saved_segments: 0,
              draft_campaigns: 0,
              addressable_customers: 0,
              high_value_customers: 0,
            },
          }),
        }),
    enabled: Boolean(organizationId),
  })

  return {
    tab,
    setTab,
    selectedSegmentId,
    setSelectedSegmentId,
    overview: overviewQuery.data,
    loading: overviewQuery.isPending,
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : '',
    refresh: overviewQuery.refetch,
  }
}
