import { cn } from '@/shared/lib'
import type { IntelligenceEventHealth } from '@/features/intelligence/types'

interface IntelligenceHealthScoreGridProps {
  healthScores: IntelligenceEventHealth[]
}

function getScoreColor(score: number) {
  if (score < 50) return 'text-status-error'
  if (score < 70) return 'text-status-warning'
  return 'text-status-success'
}

export function IntelligenceHealthScoreGrid({ healthScores }: IntelligenceHealthScoreGridProps) {
  if (healthScores.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM HEALTH SCORE</div>
        <p className="mt-2 text-sm text-text-muted">Assim que os eventos gerarem sinais, a health layer aparecerá aqui.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {healthScores.map((health) => (
        <div key={health.event_id} className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-xl leading-none text-text-primary">{health.event_name}</div>
              <div className="mt-1 text-[11px] font-mono text-text-muted">{health.status.toUpperCase()}</div>
            </div>
            <div className={cn('text-3xl font-bold font-mono', getScoreColor(health.overall_health_score))}>{health.overall_health_score}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            {[
              ['Vendas', health.sales_health_score],
              ['Operacao', health.ops_health_score],
              ['Financeiro', health.finance_health_score],
              ['Audiencia', health.audience_health_score],
            ].map(([label, score]) => (
              <div key={label} className="rounded-sm border border-bg-border bg-bg-surface px-3 py-2">
                <div className="text-[10px] font-mono uppercase text-text-muted">{label}</div>
                <div className={cn('mt-1 font-mono text-lg font-bold', getScoreColor(Number(score)))}>{score}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-text-muted">
            <span className="rounded-sm border border-bg-border px-2 py-1">{health.active_alert_count} alertas ativos</span>
            <span className="rounded-sm border border-bg-border px-2 py-1">{health.critical_alert_count} críticos</span>
            <span className="rounded-sm border border-bg-border px-2 py-1">{health.recommendation_count} recomendacoes</span>
          </div>

          {health.top_alert_title ? <div className="mt-3 text-xs text-text-secondary">Prioridade atual: {health.top_alert_title}</div> : null}
        </div>
      ))}
    </div>
  )
}
