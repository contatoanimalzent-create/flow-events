import { AlertTriangle, ShieldAlert, Users } from 'lucide-react'
import { cn, formatDate } from '@/shared/lib'
import type { CommandCenterSnapshot } from '@/features/checkin/types'

interface CommandCenterOverviewProps {
  snapshot: CommandCenterSnapshot
}

export function CommandCenterOverview({ snapshot }: CommandCenterOverviewProps) {
  return (
    <div className="space-y-4 reveal">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Command Center</div>
          <div className="text-sm text-text-secondary">Portarias, equipe alocada e alertas operacionais em tempo real</div>
        </div>
        <div className="text-[11px] font-mono text-text-muted">{snapshot.alerts.length} alertas</div>
      </div>

      {snapshot.alerts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {snapshot.alerts.map((alert) => {
            const Icon = alert.severity === 'critical' ? ShieldAlert : AlertTriangle
            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-sm border p-4',
                  alert.severity === 'critical'
                    ? 'border-status-error/20 bg-status-error/8'
                    : 'border-status-warning/20 bg-status-warning/8',
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', alert.severity === 'critical' ? 'text-status-error' : 'text-status-warning')} />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{alert.title}</div>
                    <div className="mt-1 text-xs text-text-secondary">{alert.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.gateSummaries.map((summary) => (
          <div
            key={summary.gate.id}
            className={cn(
              'card p-4',
              summary.alert_level === 'critical'
                ? 'border-status-error/25'
                : summary.alert_level === 'warning'
                  ? 'border-status-warning/25'
                  : 'border-brand-acid/20',
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-text-primary">{summary.gate.name}</div>
                <div className="text-[11px] text-text-muted">
                  {summary.gate.gate_type === 'mixed'
                    ? 'Entrada / Saida'
                    : summary.gate.gate_type === 'entry'
                      ? 'Entrada'
                      : 'Saida'}
                  {' · '}
                  {summary.gate.operational_status}
                </div>
              </div>
              <span
                className={cn(
                  'rounded-sm px-2 py-1 text-[10px] font-mono uppercase',
                  summary.alert_level === 'critical'
                    ? 'bg-status-error/10 text-status-error'
                    : summary.alert_level === 'warning'
                      ? 'bg-status-warning/10 text-status-warning'
                      : 'bg-brand-acid/10 text-brand-acid',
                )}
              >
                {summary.alert_level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-sm border border-bg-border bg-bg-surface/60 p-2">
                <div className="text-text-muted">Equipe</div>
                <div className="mt-1 font-semibold text-text-primary">
                  {summary.active_staff_count}/{summary.assigned_staff_count}
                </div>
              </div>
              <div className="rounded-sm border border-bg-border bg-bg-surface/60 p-2">
                <div className="text-text-muted">Sucesso 1h</div>
                <div className="mt-1 font-semibold text-text-primary">{summary.recent_success_count}</div>
              </div>
              <div className="rounded-sm border border-bg-border bg-bg-surface/60 p-2">
                <div className="text-text-muted">Invalidas 15m</div>
                <div className="mt-1 font-semibold text-text-primary">{summary.recent_invalid_attempts}</div>
              </div>
              <div className="rounded-sm border border-bg-border bg-bg-surface/60 p-2">
                <div className="text-text-muted">Capacidade/h</div>
                <div className="mt-1 font-semibold text-text-primary">{summary.gate.throughput_per_hour || '—'}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                <Users className="h-3.5 w-3.5" />
                Staff alocado
              </div>
              {summary.assigned_staff.length > 0 ? (
                summary.assigned_staff.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{member.name}</span>
                    <span className="text-text-muted">{member.role_title || member.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-muted">Sem equipe alocada</div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-text-muted">
              Ultima atividade: {summary.last_activity_at ? formatDate(summary.last_activity_at, 'dd/MM HH:mm:ss') : 'sem movimento'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
