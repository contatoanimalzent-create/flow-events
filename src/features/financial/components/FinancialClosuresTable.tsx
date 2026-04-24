import { cn, formatDate } from '@/shared/lib'
import { FINANCIAL_CLOSURE_STATUS_LABELS, FINANCIAL_FORECAST_RISK_LABELS } from '@/features/financial/types'
import type { FinancialEventReport } from '@/features/financial/types'

interface FinancialClosuresTableProps {
  reports: FinancialEventReport[]
  onReviewClosure: (report: FinancialEventReport) => void
}

function getClosureStatusColor(status: FinancialEventReport['closure_status']) {
  if (status === 'closed') {
    return 'text-status-success'
  }

  if (status === 'in_closure') {
    return 'text-status-warning'
  }

  return 'text-brand-blue'
}

export function FinancialClosuresTable({ reports, onReviewClosure }: FinancialClosuresTableProps) {
  if (reports.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM FECHAMENTOS</div>
        <p className="mt-2 text-sm text-text-muted">A operação financeira por evento aparecerá aqui assim que houver movimento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.event_id} className="card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="font-display text-lg leading-none text-text-primary">{report.event_name}</div>
              <div className="mt-1 text-[11px] font-mono text-text-muted">{formatDate(report.starts_at, 'dd/MM/yyyy')}</div>
            </div>

            <div className="grid gap-4 text-sm md:grid-cols-3 lg:min-w-[620px]">
              <div>
                <div className="text-[10px] font-mono uppercase text-text-muted">Fechamento</div>
                <div className={`mt-1 font-semibold ${getClosureStatusColor(report.closure_status)}`}>
                  {FINANCIAL_CLOSURE_STATUS_LABELS[report.closure_status]}
                </div>
                <div className="mt-1 text-[11px] text-text-muted">{report.closure_closed_at ? `Concluido em ${formatDate(report.closure_closed_at, 'dd/MM/yyyy')}` : 'Ainda em aberto'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-text-muted">Checklist</div>
                <div className="mt-1 text-[12px] text-text-secondary">
                  {report.closure_pending_count === 0 ? 'Pronto para fechamento final' : `${report.closure_pending_count} pendências restantes`}
                </div>
                <div className="mt-1 text-[11px] text-text-muted">{FINANCIAL_FORECAST_RISK_LABELS[report.risk_status]}</div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-text-muted">Pendencias</div>
                  <div className={cn('mt-1 text-[12px]', report.closure_pending_count === 0 ? 'text-status-success' : 'text-status-warning')}>
                    {report.closure_pending_items[0] ?? 'Nenhuma pendencia crítica'}
                  </div>
                </div>
                <button onClick={() => onReviewClosure(report)} className="btn-secondary shrink-0 text-xs">
                  Revisar
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-[12px] text-text-secondary md:grid-cols-5">
            {[
              { label: 'Pagamentos conciliados', done: report.payments_reconciled },
              { label: 'Custos lancados', done: report.costs_recorded },
              { label: 'Repasse revisado', done: report.payouts_reviewed },
              { label: 'Divergencias resolvidas', done: report.divergences_resolved },
              { label: 'Resultado validado', done: report.result_validated },
            ].map((item) => (
              <div key={item.label} className="rounded-sm border border-bg-border bg-bg-surface px-3 py-2">
                <div className="text-[10px] font-mono uppercase text-text-muted">{item.label}</div>
                <div className={cn('mt-1 font-semibold', item.done ? 'text-status-success' : 'text-status-warning')}>
                  {item.done ? 'OK' : 'Pendente'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
