import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { intelligenceKeys, intelligenceQueries } from '@/features/intelligence/services'
import type {
  IntelligenceAlertSeverity,
  IntelligenceAlertStatus,
  IntelligenceAlertType,
  IntelligenceOverview,
  IntelligenceTab,
} from '@/features/intelligence/types'

function buildEmptyOverview(): IntelligenceOverview {
  return {
    health_scores: [],
    alerts: [],
    recommendations: [],
    consistency: {
      issues: [],
      summary: {
        total_issues: 0,
        critical_issues: 0,
        warning_issues: 0,
        open_issues: 0,
        resolved_issues: 0,
      },
    },
    summary: {
      average_overall_health: 0,
      active_alerts_count: 0,
      acknowledged_alerts_count: 0,
      critical_alerts_count: 0,
      high_risk_events_count: 0,
      consistency_issues_count: 0,
      critical_consistency_issues_count: 0,
    },
  }
}

export function useIntelligenceDashboard(organizationId?: string | null) {
  const [tab, setTab] = useState<IntelligenceTab>('overview')
  const [selectedEventId, setSelectedEventId] = useState('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | IntelligenceAlertSeverity>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | IntelligenceAlertStatus>('active')
  const [typeFilter, setTypeFilter] = useState<'all' | IntelligenceAlertType>('all')

  const overviewQuery = useQuery({
    ...(organizationId
      ? intelligenceQueries.overview(organizationId)
      : {
          queryKey: intelligenceKeys.overview('empty'),
          queryFn: async () => buildEmptyOverview(),
        }),
    enabled: Boolean(organizationId),
  })

  const overview = overviewQuery.data

  const filteredHealthScores = useMemo(() => {
    const healthScores = overview?.health_scores ?? []
    if (selectedEventId === 'all') {
      return healthScores
    }
    return healthScores.filter((item) => item.event_id === selectedEventId)
  }, [overview?.health_scores, selectedEventId])

  const filteredAlerts = useMemo(() => {
    const alerts = overview?.alerts ?? []
    return alerts.filter((alert) => {
      if (selectedEventId !== 'all' && alert.event_id !== selectedEventId) return false
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false
      if (typeFilter !== 'all' && alert.type !== typeFilter) return false
      return true
    })
  }, [overview?.alerts, selectedEventId, severityFilter, statusFilter, typeFilter])

  const filteredRecommendations = useMemo(() => {
    const recommendations = overview?.recommendations ?? []
    if (selectedEventId === 'all') {
      return recommendations
    }
    return recommendations.filter((recommendation) => recommendation.event_id === selectedEventId)
  }, [overview?.recommendations, selectedEventId])

  const filteredConsistencyIssues = useMemo(() => {
    const issues = overview?.consistency.issues ?? []
    if (selectedEventId === 'all') {
      return issues
    }

    return issues.filter((issue) => issue.event_id === selectedEventId)
  }, [overview?.consistency.issues, selectedEventId])

  const eventOptions = useMemo(
    () => (overview?.health_scores ?? []).map((health) => ({ id: health.event_id, name: health.event_name })),
    [overview?.health_scores],
  )

  return {
    tab,
    setTab,
    selectedEventId,
    setSelectedEventId,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    overview,
    eventOptions,
    filteredHealthScores,
    filteredAlerts,
    filteredRecommendations,
    filteredConsistencyIssues,
    loading: overviewQuery.isPending,
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : '',
    refresh: () => overviewQuery.refetch(),
  }
}
