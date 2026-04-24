import { INTELLIGENCE_RECOMMENDATION_PRIORITY_LABELS } from '@/features/intelligence/types'
import type { IntelligenceRecommendation } from '@/features/intelligence/types'

interface IntelligenceRecommendationsListProps {
  recommendations: IntelligenceRecommendation[]
}

export function IntelligenceRecommendationsList({ recommendations }: IntelligenceRecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM RECOMENDACOES</div>
        <p className="mt-2 text-sm text-text-muted">As recomendações acionaveis vao aparecer aqui conforme surgirem sinais relevantes.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {recommendations.map((recommendation) => (
        <div key={recommendation.id} className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="font-display text-lg text-text-primary">{recommendation.title}</div>
            <span className="text-[10px] font-mono text-brand-acid">{INTELLIGENCE_RECOMMENDATION_PRIORITY_LABELS[recommendation.priority]}</span>
          </div>
          <div className="mt-2 text-sm text-text-secondary">{recommendation.description}</div>
          <div className="mt-3 text-[11px] font-mono text-text-muted">{recommendation.event_name}</div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] text-text-muted">{recommendation.source_alert_ids.length} alerta(s) relacionados</div>
            <button className="btn-secondary text-xs">{recommendation.action_label}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
