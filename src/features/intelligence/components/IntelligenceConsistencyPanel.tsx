import type { IntelligenceConsistencyIssue } from '@/features/intelligence/types'
import { formatDate } from '@/shared/lib'

interface IntelligenceConsistencyPanelProps {
  issues: IntelligenceConsistencyIssue[]
}

function severityClasses(severity: IntelligenceConsistencyIssue['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-status-error/10 text-status-error'
    case 'warning':
      return 'bg-status-warning/10 text-status-warning'
    case 'info':
    default:
      return 'bg-brand-blue/10 text-brand-blue'
  }
}

export function IntelligenceConsistencyPanel({ issues }: IntelligenceConsistencyPanelProps) {
  if (issues.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM ISSUES DE CONSISTENCIA</div>
        <p className="mt-2 text-sm text-text-muted">Nenhuma divergência relevante encontrada para o filtro atual.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Issues totais</div>
          <div className="mt-2 text-2xl font-mono font-bold text-text-primary">{issues.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Criticas</div>
          <div className="mt-2 text-2xl font-mono font-bold text-status-error">{issues.filter((issue) => issue.severity === 'critical').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Warnings</div>
          <div className="mt-2 text-2xl font-mono font-bold text-status-warning">{issues.filter((issue) => issue.severity === 'warning').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Abertas</div>
          <div className="mt-2 text-2xl font-mono font-bold text-brand-blue">{issues.filter((issue) => issue.status === 'open').length}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-bg-border">
            <tr>
              {['Issue', 'Tipo', 'Severidade', 'Evento', 'Detectado em'].map((header) => (
                <th key={header} className="table-header">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="table-row">
                <td className="table-cell">
                  <div className="text-[13px] font-medium text-text-primary">{issue.title}</div>
                  <div className="text-[11px] text-text-muted">{issue.description}</div>
                </td>
                <td className="table-cell text-xs uppercase text-text-secondary">{issue.type.replace('_', ' ')}</td>
                <td className="table-cell">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-mono uppercase tracking-wide ${severityClasses(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="table-cell text-xs text-text-secondary">{issue.event_name ?? 'Escopo global'}</td>
                <td className="table-cell text-[11px] font-mono text-text-muted">{formatDate(issue.created_at, 'dd/MM/yyyy HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
