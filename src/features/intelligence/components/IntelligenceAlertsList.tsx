import { cn } from '@/shared/lib'
import { INTELLIGENCE_ALERT_SEVERITY_LABELS, INTELLIGENCE_ALERT_STATUS_LABELS, INTELLIGENCE_ALERT_TYPE_LABELS } from '@/features/intelligence/types'
import type { IntelligenceAlert } from '@/features/intelligence/types'

interface IntelligenceAlertsListProps {
  alerts: IntelligenceAlert[]
  onAcknowledge: (alert: IntelligenceAlert) => void
}

function getSeverityColor(severity: IntelligenceAlert['severity']) {
  if (severity === 'critical') return 'text-status-error'
  if (severity === 'warning') return 'text-status-warning'
  return 'text-brand-blue'
}

export function IntelligenceAlertsList({ alerts, onAcknowledge }: IntelligenceAlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM ALERTAS</div>
        <p className="mt-2 text-sm text-text-muted">Nenhum alerta dentro do filtro atual.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('text-xs font-semibold', getSeverityColor(alert.severity))}>
                  {INTELLIGENCE_ALERT_SEVERITY_LABELS[alert.severity]}
                </span>
                <span className="text-[10px] font-mono text-text-muted">{INTELLIGENCE_ALERT_TYPE_LABELS[alert.type]}</span>
                <span className="text-[10px] font-mono text-text-muted">{INTELLIGENCE_ALERT_STATUS_LABELS[alert.status]}</span>
              </div>
              <div className="mt-1 text-[13px] font-semibold text-text-primary">{alert.title}</div>
              <div className="mt-1 text-[12px] text-text-secondary">{alert.description}</div>
              <div className="mt-2 text-[11px] text-text-muted">
                {alert.event_name}
                {alert.metric_label && alert.metric_value ? ` · ${alert.metric_label}: ${alert.metric_value}` : ''}
              </div>
              <div className="mt-2 text-[12px] text-brand-acid">{alert.recommendation}</div>
              {alert.notes ? <div className="mt-2 text-[11px] text-text-muted">Obs: {alert.notes}</div> : null}
            </div>

            <div className="shrink-0">
              {alert.status === 'active' ? (
                <button onClick={() => onAcknowledge(alert)} className="btn-secondary text-xs">
                  Reconhecer
                </button>
              ) : (
                <div className="text-[11px] font-mono text-status-success">Reconhecido</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
