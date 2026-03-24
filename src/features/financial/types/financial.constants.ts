import type {
  FinancialClosureFormValues,
  FinancialClosureStatus,
  FinancialCostCategory,
  FinancialCostEntryFormValues,
  FinancialCostStatus,
  FinancialForecastFormValues,
  FinancialPayoutFormValues,
  FinancialPayoutStatus,
  ForecastRiskStatus,
} from './financial.types'

export const FINANCIAL_COST_CATEGORY_LABELS: Record<FinancialCostCategory, string> = {
  staff: 'Equipe',
  suppliers: 'Fornecedores',
  marketing: 'Marketing',
  infrastructure: 'Infraestrutura',
  taxes: 'Impostos e taxas',
  platform: 'Plataforma',
  other: 'Outros',
}

export const FINANCIAL_COST_STATUS_LABELS: Record<FinancialCostStatus, string> = {
  planned: 'Previsto',
  committed: 'Comprometido',
  paid: 'Pago',
  cancelled: 'Cancelado',
}

export const FINANCIAL_PAYOUT_STATUS_LABELS: Record<FinancialPayoutStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  paid: 'Pago',
  held: 'Retido',
  divergent: 'Divergente',
}

export const FINANCIAL_FORECAST_RISK_LABELS: Record<ForecastRiskStatus, string> = {
  low: 'Baixo risco',
  medium: 'Risco medio',
  high: 'Alto risco',
}

export const FINANCIAL_CLOSURE_STATUS_LABELS: Record<FinancialClosureStatus, string> = {
  open: 'Aberto',
  in_closure: 'Em fechamento',
  closed: 'Fechado',
}

export const EMPTY_FINANCIAL_COST_ENTRY_FORM: FinancialCostEntryFormValues = {
  description: '',
  category: 'suppliers',
  amount: '',
  due_date: '',
  paid_date: '',
  status: 'planned',
  notes: '',
}

export const EMPTY_FINANCIAL_PAYOUT_FORM: FinancialPayoutFormValues = {
  event_id: '',
  gross_sales: '',
  platform_fees: '',
  retained_amount: '',
  payable_amount: '',
  status: 'draft',
  scheduled_at: '',
  paid_out_at: '',
  notes: '',
}

export const EMPTY_FINANCIAL_FORECAST_FORM: FinancialForecastFormValues = {
  event_id: '',
  projected_revenue: '',
  projected_cost: '',
  risk_status: 'medium',
  notes: '',
}

export const EMPTY_FINANCIAL_CLOSURE_FORM: FinancialClosureFormValues = {
  event_id: '',
  status: 'open',
  payments_reconciled: false,
  costs_recorded: false,
  payouts_reviewed: false,
  divergences_resolved: false,
  result_validated: false,
  closed_at: '',
  notes: '',
}
