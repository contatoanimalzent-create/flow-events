export type FinancialTab = 'overview' | 'costs' | 'dre' | 'reconciliation'

export type FinancialCostCategory = 'staff' | 'suppliers' | 'marketing' | 'infrastructure' | 'taxes' | 'platform' | 'other'
export type FinancialCostStatus = 'planned' | 'committed' | 'paid' | 'cancelled'
export type ReconciliationStatus = 'matched' | 'pending' | 'divergent'

export interface FinancialEventOption {
  id: string
  name: string
  starts_at: string
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
}
