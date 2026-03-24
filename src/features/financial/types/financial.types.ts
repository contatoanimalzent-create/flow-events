export type FinancialTab = 'overview' | 'forecast' | 'payouts' | 'closure' | 'costs' | 'dre' | 'reconciliation'

export type FinancialCostCategory = 'staff' | 'suppliers' | 'marketing' | 'infrastructure' | 'taxes' | 'platform' | 'other'
export type FinancialCostStatus = 'planned' | 'committed' | 'paid' | 'cancelled'
export type ReconciliationStatus = 'matched' | 'pending' | 'divergent'
export type FinancialPayoutStatus = 'draft' | 'scheduled' | 'paid' | 'held' | 'divergent'
export type ForecastRiskStatus = 'low' | 'medium' | 'high'
export type FinancialClosureStatus = 'open' | 'in_closure' | 'closed'

export interface FinancialEventOption {
  id: string
  name: string
  starts_at: string
  status?: string | null
  total_capacity?: number | null
  sold_tickets?: number | null
}

export interface FinancialCostEntryRow {
  id: string
  organization_id: string
  event_id?: string | null
  description: string
  category: FinancialCostCategory
  amount: number
  due_date?: string | null
  paid_date?: string | null
  status: FinancialCostStatus
  notes?: string | null
  created_at: string
}

export interface FinancialCostEntryFormValues {
  description: string
  category: FinancialCostCategory
  amount: string
  due_date: string
  paid_date: string
  status: FinancialCostStatus
  notes: string
}

export interface UpsertFinancialCostEntryInput {
  organizationId: string
  eventId?: string | null
  costEntryId?: string
  values: FinancialCostEntryFormValues
}

export interface EventPayoutRow {
  id: string
  organization_id: string
  event_id: string
  gross_sales: number
  refunds_amount: number
  chargeback_amount: number
  platform_fees: number
  retained_amount: number
  payable_amount: number
  event_organizer_net: number
  status: FinancialPayoutStatus
  scheduled_at?: string | null
  paid_out_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialPayoutFormValues {
  event_id: string
  gross_sales: string
  platform_fees: string
  retained_amount: string
  payable_amount: string
  status: FinancialPayoutStatus
  scheduled_at: string
  paid_out_at: string
  notes: string
}

export interface UpsertEventPayoutInput {
  organizationId: string
  payoutId?: string
  values: FinancialPayoutFormValues
}

export interface FinancialForecastRow {
  id: string
  organization_id: string
  event_id: string
  projected_revenue: number
  projected_cost: number
  projected_margin: number
  projected_margin_percent: number
  risk_status: ForecastRiskStatus
  assumptions?: Record<string, unknown> | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialForecastFormValues {
  event_id: string
  projected_revenue: string
  projected_cost: string
  risk_status: ForecastRiskStatus
  notes: string
}

export interface UpsertFinancialForecastInput {
  organizationId: string
  forecastId?: string
  values: FinancialForecastFormValues
}

export interface EventFinancialClosureRow {
  id: string
  organization_id: string
  event_id: string
  status: FinancialClosureStatus
  payments_reconciled: boolean
  costs_recorded: boolean
  payouts_reviewed: boolean
  divergences_resolved: boolean
  result_validated: boolean
  closed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialClosureFormValues {
  event_id: string
  status: FinancialClosureStatus
  payments_reconciled: boolean
  costs_recorded: boolean
  payouts_reviewed: boolean
  divergences_resolved: boolean
  result_validated: boolean
  closed_at: string
  notes: string
}

export interface UpsertEventFinancialClosureInput {
  organizationId: string
  closureId?: string
  values: FinancialClosureFormValues
}

export interface OrderFinancialSnapshot {
  id: string
  event_id: string
  buyer_name: string
  buyer_email: string
  status: string
  payment_method?: string | null
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  created_at: string
}

export interface PaymentFinancialSnapshot {
  id: string
  order_id: string
  event_id?: string | null
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  provider: string
  paid_at?: string | null
  failed_at?: string | null
  refunded_at?: string | null
  created_at: string
}

export interface SupplierFinancialSnapshot {
  id: string
  event_id?: string | null
  company_name: string
  contract_value?: number | null
  status: string
}

export interface StaffFinancialSnapshot {
  id: string
  event_id?: string | null
  status: string
  daily_rate?: number | null
  is_active?: boolean
  checked_in_at?: string | null
}

export interface TransactionalMessageFinancialSnapshot {
  id: string
  order_id?: string | null
  event_id?: string | null
  template_key: string
  status: 'queued' | 'sent' | 'failed' | 'skipped'
}

export interface FinancialReconciliationRow {
  order_id: string
  event_id: string
  event_name: string
  buyer_name: string
  buyer_email: string
  amount: number
  order_status: string
  payment_status: string | null
  payment_provider: string | null
  reconciliation_status: ReconciliationStatus
  issue_label: string
  created_at: string
}

export interface FinancialEventReport {
  event_id: string
  event_name: string
  starts_at: string
  gross_sales: number
  discounts: number
  fees: number
  approved_payments_amount: number
  approved_payments_count: number
  failed_payments_amount: number
  failed_payments_count: number
  refunded_amount: number
  refunded_count: number
  chargeback_amount: number
  net_sales: number
  manual_costs: number
  supplier_costs: number
  staff_costs: number
  operational_costs: number
  result: number
  margin_percent: number
  pending_orders_count: number
  reconciliation_pending_count: number
  reconciliation_divergent_count: number
  order_confirmation_emails_sent: number
  ticket_emails_sent: number
  payout_id?: string | null
  payout_status: FinancialPayoutStatus
  payout_scheduled_at?: string | null
  payout_paid_out_at?: string | null
  payout_notes?: string | null
  platform_fees: number
  retained_amount: number
  payable_amount: number
  event_organizer_net: number
  payout_divergent: boolean
  forecast_id?: string | null
  forecast_notes?: string | null
  projected_revenue: number
  projected_cost: number
  projected_margin: number
  projected_margin_percent: number
  realized_vs_projected_revenue: number
  realized_vs_projected_cost: number
  realized_vs_projected_result: number
  risk_status: ForecastRiskStatus
  closure_id?: string | null
  closure_status: FinancialClosureStatus
  closure_closed_at?: string | null
  closure_notes?: string | null
  payments_reconciled: boolean
  costs_recorded: boolean
  payouts_reviewed: boolean
  divergences_resolved: boolean
  result_validated: boolean
  closure_pending_items: string[]
  closure_pending_count: number
}

export interface FinancialOverview {
  events: FinancialEventOption[]
  reports: FinancialEventReport[]
  reconciliation_rows: FinancialReconciliationRow[]
  unallocated_costs: number
  gross_sales: number
  net_sales: number
  approved_payments_amount: number
  approved_payments_count: number
  failed_payments_amount: number
  refunded_amount: number
  chargeback_amount: number
  operational_costs: number
  result: number
  margin_percent: number
  divergence_count: number
  pending_reconciliation_count: number
  total_projected_revenue: number
  total_projected_cost: number
  total_projected_margin: number
  total_payable_amount: number
  total_retained_amount: number
  total_event_organizer_net: number
  scheduled_payouts_count: number
  paid_payouts_count: number
  events_at_risk_count: number
  events_ready_to_close_count: number
}
