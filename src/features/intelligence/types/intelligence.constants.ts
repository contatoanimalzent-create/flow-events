import type { IntelligenceAlertSeverity, IntelligenceAlertStatus, IntelligenceAlertType, IntelligenceRecommendationPriority } from './intelligence.types'

export const INTELLIGENCE_ALERT_TYPE_LABELS: Record<IntelligenceAlertType, string> = {
  sales: 'Comercial',
  operations: 'Operacao',
  financial: 'Financeiro',
  audience: 'Audiencia',
}

export const INTELLIGENCE_ALERT_SEVERITY_LABELS: Record<IntelligenceAlertSeverity, string> = {
  critical: 'Critico',
  warning: 'Atencao',
  info: 'Informativo',
}

export const INTELLIGENCE_ALERT_STATUS_LABELS: Record<IntelligenceAlertStatus, string> = {
  active: 'Ativo',
  acknowledged: 'Reconhecido',
}

export const INTELLIGENCE_RECOMMENDATION_PRIORITY_LABELS: Record<IntelligenceRecommendationPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
}
