export type DashboardPeriodFilter = '7d' | '30d' | '90d' | '365d' | 'all'

export interface DashboardEventFilterOption {
  id: string
  name: string
  starts_at: string
  status?: string | null
  total_capacity?: number | null
  sold_tickets?: number | null
}

export interface DashboardExecutiveSummary {
  grossRevenue: number
  netRevenue: number
  marginPercent: number
  activeEvents: number
  runningCampaigns: number
  criticalAlerts: number
  totalCheckins: number
  totalCustomers: number
}

export interface DashboardRevenuePoint {
  label: string
  grossRevenue: number
  netRevenue: number
}

export interface DashboardConversionPoint {
  label: string
  eventId: string
  soldTickets: number
  capacity: number
  conversionRate: number
}

export interface DashboardEventRankingRow {
  event_id: string
  event_name: string
  starts_at: string
  gross_sales: number
  net_sales: number
  result: number
  margin_percent: number
  sold_tickets: number
}

export interface DashboardCustomerRankingRow {
  customer_id: string
  full_name: string
  email: string
  total_orders: number
  total_revenue: number
  status: string
  last_purchase_at?: string | null
}

export interface DashboardPerformanceItem {
  id: string
  label: string
  value: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}

export interface DashboardOverview {
  organization_id: string
  events: DashboardEventFilterOption[]
  summary: DashboardExecutiveSummary
  revenueSeries: DashboardRevenuePoint[]
  conversionSeries: DashboardConversionPoint[]
  eventRanking: DashboardEventRankingRow[]
  customerRanking: DashboardCustomerRankingRow[]
  performance: DashboardPerformanceItem[]
}
