import type { CampaignRunRow } from '@/features/campaigns/types'
import { CAMPAIGN_CHANNEL_LABELS, CAMPAIGN_RUN_STATUS_LABELS } from '@/features/campaigns/types'
import { formatDate } from '@/shared/lib'

interface CampaignRunsTableProps {
  runs: CampaignRunRow[]
}

function statusClasses(status: CampaignRunRow['status']) {
  switch (status) {
    case 'completed':
      return 'bg-status-success/10 text-status-success'
    case 'failed':
    case 'cancelled':
      return 'bg-status-error/10 text-status-error'
    case 'resolving':
    case 'sending':
      return 'bg-brand-blue/10 text-brand-blue'
    case 'paused':
      return 'bg-text-muted/10 text-text-muted'
    case 'pending':
    default:
      return 'bg-status-warning/10 text-status-warning'
  }
}

export function CampaignRunsTable({ runs }: CampaignRunsTableProps) {
  if (runs.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUMA EXECUCAO</div>
        <p className="mt-2 text-sm text-text-muted">Lance um draft para acompanhar o processamento e a entrega por canal.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Execucao', 'Status', 'Canal', 'Audiencia', 'Progresso', 'Iniciada em'].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{run.name}</div>
                <div className="text-[11px] text-text-muted">
                  {run.draft?.name ?? 'Sem draft'} {run.segment?.name ? `• ${run.segment.name}` : ''}
                </div>
              </td>
              <td className="table-cell">
                <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-mono uppercase tracking-wide ${statusClasses(run.status)}`}>
                  {CAMPAIGN_RUN_STATUS_LABELS[run.status]}
                </span>
              </td>
              <td className="table-cell text-xs text-text-secondary">{CAMPAIGN_CHANNEL_LABELS[run.channel]}</td>
              <td className="table-cell font-mono text-brand-acid">{run.summary.audience_count.toLocaleString('pt-BR')}</td>
              <td className="table-cell">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>{run.summary.progress_percentage}%</span>
                    <span>
                      {run.summary.processed_count}/{run.summary.audience_count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-surface">
                    <div className="h-full rounded-full bg-brand-acid transition-all" style={{ width: `${run.summary.progress_percentage}%` }} />
                  </div>
                </div>
              </td>
              <td className="table-cell text-[11px] text-text-muted">{run.started_at ? formatDate(run.started_at, 'dd/MM/yyyy HH:mm') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
