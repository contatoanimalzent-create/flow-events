export type IntelligenceTab = 'overview' | 'alerts' | 'recommendations' | 'consistency'
export type IntelligenceAlertType = 'sales' | 'operations' | 'financial' | 'audience'
export type IntelligenceAlertSeverity = 'critical' | 'warning' | 'info'
export type IntelligenceAlertStatus = 'active' | 'acknowledged'
export type IntelligenceRecommendationPriority = 'high' | 'medium' | 'low'
export type IntelligenceConsistencyIssueType = 'order_payment' | 'ticket_link' | 'checkin' | 'campaign' | 'crm' | 'financial'
export type IntelligenceConsistencyIssueStatus = 'open' | 'resolved'

export interface IntelligenceEventHealth {
  event_id: string
  event_name: string
  starts_at: string
  status: string
  sales_health_score: number
  ops_health_score: number
  finance_health_score: number
  audience_health_score: number
  overall_health_score: number
  active_alert_count: number
  critical_alert_count: number
  recommendation_count: number
  top_alert_title?: string | null
}

export interface IntelligenceAlert {
  id: string
  event_id: string
  event_name: string
  type: IntelligenceAlertType
  severity: IntelligenceAlertSeverity
  status: IntelligenceAlertStatus
  title: string
  description: string
  recommendation: string
  metric_label?: string | null
  metric_value?: string | null
  created_at: string
  acknowledged_at?: string | null
  notes?: string | null
}

export interface IntelligenceRecommendation {
  id: string
  event_id: string
  event_name: string
  priority: IntelligenceRecommendationPriority
  title: string
  description: string
  action_label: string
  source_alert_ids: string[]
}

export interface IntelligenceSummary {
  average_overall_health: number
  active_alerts_count: number
  acknowledged_alerts_count: number
  critical_alerts_count: number
  high_risk_events_count: number
  consistency_issues_count: number
  critical_consistency_issues_count: number
}

export interface IntelligenceConsistencyIssue {
  id: string
  type: IntelligenceConsistencyIssueType
  severity: IntelligenceAlertSeverity
  status: IntelligenceConsistencyIssueStatus
  title: string
  description: string
  event_id?: string | null
  event_name?: string | null
  entity_id?: string | null
  created_at: string
}

export interface IntelligenceConsistencySummary {
  total_issues: number
  critical_issues: number
  warning_issues: number
  open_issues: number
  resolved_issues: number
}

export interface IntelligenceOverview {
  health_scores: IntelligenceEventHealth[]
  alerts: IntelligenceAlert[]
  recommendations: IntelligenceRecommendation[]
  consistency: {
    issues: IntelligenceConsistencyIssue[]
    summary: IntelligenceConsistencySummary
  }
  summary: IntelligenceSummary
}

export interface IntelligenceAlertStateRow {
  id: string
  organization_id: string
  event_id?: string | null
  alert_id: string
  status: IntelligenceAlertStatus
  acknowledged_at?: string | null
  acknowledged_by?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface AcknowledgeIntelligenceAlertInput {
  organizationId: string
  alertId: string
  eventId?: string | null
  acknowledgedBy?: string | null
  notes?: string
}
