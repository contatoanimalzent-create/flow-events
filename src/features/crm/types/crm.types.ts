export type CustomerLifecycleStatus = 'new' | 'active' | 'loyal' | 'at_risk' | 'inactive'

export type CustomerAttendanceStatus = 'upcoming' | 'attended' | 'no_show' | 'ticket_issued'

export type CrmPeriodFilter = '30d' | '90d' | '180d' | 'all'

export interface CrmEventOption {
  id: string
  name: string
  starts_at: string
  status?: string | null
}

export interface CustomerListRow {
  id: string
  record_id?: string | null
  full_name: string
  email: string
  phone?: string | null
  document?: string | null
  tags: string[]
  notes?: string | null
  total_orders: number
  total_revenue: number
  average_ticket: number
  attended_events_count: number
  no_show_count: number
  first_order_at?: string | null
  last_purchase_at?: string | null
  last_attendance_at?: string | null
  last_event_name?: string | null
  last_event_at?: string | null
  status: CustomerLifecycleStatus
  event_ids: string[]
}

export interface CustomerMetrics {
  total_orders: number
  total_revenue: number
  average_ticket: number
  attended_events_count: number
  no_show_count: number
  last_purchase_at?: string | null
  last_attendance_at?: string | null
}

export interface CustomerOrderHistoryRow {
  id: string
  event_id: string
  event_name: string
  event_starts_at?: string | null
  status: string
  payment_status: string
  payment_method?: string | null
  total_amount: number
  tickets_count: number
  created_at: string
  paid_at?: string | null
}

export interface CustomerAttendanceHistoryRow {
  event_id: string
  event_name: string
  event_starts_at?: string | null
  tickets_count: number
  attended_count: number
  no_show_count: number
  gross_revenue: number
  net_revenue: number
  status: CustomerAttendanceStatus
  first_interaction_at?: string | null
  last_interaction_at?: string | null
}

export interface CustomerDetailBundle {
  customer: CustomerListRow | null
  metrics: CustomerMetrics | null
  orderHistory: CustomerOrderHistoryRow[]
  attendanceHistory: CustomerAttendanceHistoryRow[]
}

export interface CrmOverviewSummary {
  total_customers: number
  active_customers: number
  repeat_customers: number
  total_revenue: number
  average_ticket: number
  no_show_risk_customers: number
}

export interface CrmOverview {
  events: CrmEventOption[]
  customers: CustomerListRow[]
  summary: CrmOverviewSummary
}

export interface UpdateCustomerTagsInput {
  organizationId: string
  customerId: string
  tags: string[]
}

export interface UpdateCustomerNotesInput {
  organizationId: string
  customerId: string
  notes: string
}
