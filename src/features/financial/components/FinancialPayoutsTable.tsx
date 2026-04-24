import { cn, formatCurrency, formatDate } from '@/shared/lib'
import { FINANCIAL_PAYOUT_STATUS_LABELS } from '@/features/financial/types'
import type { FinancialEventReport } from '@/features/financial/types'

interface FinancialPayoutsTableProps {
  reports: FinancialEventReport[]
  onEditPayout: (report: FinancialEventReport) => void
}

function getStatusColor(status: FinancialEventReport['payout_status']) {
  if (status === 'paid') {
    return 'text-status-success'
  }

  if (status === 'divergent') {
    return 'text-status-error'
  }

  if (status === 'held') {
    return 'text-status-warning'
  }

  return 'text-brand-blue'
}

export function FinancialPayoutsTable({ reports, onEditPayout }: FinancialPayoutsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUM REPASSE</div>
        <p className="mt-2 text-sm text-text-muted">Assim que os eventos venderem, os repasses aparecerao aqui para revisao.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Evento', 'Payable', 'Retido', 'Liquido organizador', 'Status', 'Agenda', 'Ações'].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.event_id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{report.event_name}</div>
                <div className="text-[11px] font-mono text-text-muted">{formatDate(report.starts_at, 'dd/MM/yyyy')}</div>
              </td>
              <td className="table-cell font-mono text-text-primary">{formatCurrency(report.payable_amount)}</td>
              <td className="table-cell">
                <div className="font-mono text-status-warning">{formatCurrency(report.retained_amount)}</div>
                <div className="text-[11px] text-text-muted">Taxa {formatCurrency(report.platform_fees)}</div>
              </td>
              <td className="table-cell">
                <div className={cn('font-mono font-semibold', report.event_organizer_net >= 0 ? 'text-status-success' : 'text-status-error')}>
                  {formatCurrency(report.event_organizer_net)}
                </div>
                {report.payout_divergent ? <div className="text-[11px] text-status-error">Divergencia de repasse</div> : null}
              </td>
              <td className={`table-cell text-xs font-semibold ${getStatusColor(report.payout_status)}`}>
                {FINANCIAL_PAYOUT_STATUS_LABELS[report.payout_status]}
              </td>
              <td className="table-cell text-[11px] font-mono text-text-muted">
                {report.payout_paid_out_at ? `Pago ${formatDate(report.payout_paid_out_at, 'dd/MM/yyyy')}` : report.payout_scheduled_at ? formatDate(report.payout_scheduled_at, 'dd/MM/yyyy') : '-'}
              </td>
              <td className="table-cell">
                <button onClick={() => onEditPayout(report)} className="btn-secondary text-xs">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
