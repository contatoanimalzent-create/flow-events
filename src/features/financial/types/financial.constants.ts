import type { FinancialCostCategory, FinancialCostEntryFormValues, FinancialCostStatus } from './financial.types'

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

export const EMPTY_FINANCIAL_COST_ENTRY_FORM: FinancialCostEntryFormValues = {
  description: '',
  category: 'suppliers',
  amount: '',
  due_date: '',
  paid_date: '',
  status: 'planned',
  notes: '',
}
