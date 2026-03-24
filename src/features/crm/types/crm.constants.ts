import type { CustomerAttendanceStatus, CustomerLifecycleStatus, CrmPeriodFilter } from './crm.types'

export const CRM_CUSTOMER_STATUS_LABELS: Record<CustomerLifecycleStatus, string> = {
  new: 'Novo',
  active: 'Ativo',
  loyal: 'Recorrente',
  at_risk: 'Em risco',
  inactive: 'Inativo',
}

export const CRM_ATTENDANCE_STATUS_LABELS: Record<CustomerAttendanceStatus, string> = {
  upcoming: 'Evento futuro',
  attended: 'Compareceu',
  no_show: 'No-show',
  ticket_issued: 'Ingresso emitido',
}

export const CRM_PERIOD_FILTER_LABELS: Record<CrmPeriodFilter, string> = {
  '30d': '30 dias',
  '90d': '90 dias',
  '180d': '180 dias',
  all: 'Todo periodo',
}
