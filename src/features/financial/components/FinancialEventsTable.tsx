import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FinancialEventReport } from '@/features/financial/types'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

interface FinancialEventsTableProps {
  reports: FinancialEventReport[]
  expandedEventId: string | null
  onToggleEvent: (eventId: string) => void
}

export function FinancialEventsTable({ reports, expandedEventId, onToggleEvent }: FinancialEventsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="surface-panel p-16 text-center">
        <div className="font-display text-2xl text-text-primary">Nenhum evento com DRE</div>
        <p className="mt-2 text-sm text-text-muted">Crie eventos e movimente vendas para gerar a visão financeira.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const expanded = expandedEventId === report.event_id
        const profitable = report.result >= 0

        return (
          <div key={report.event_id} className="surface-panel overflow-hidden">
            <button
              type="button"
              onClick={() => onToggleEvent(report.event_id)}
              className="flex w-full items-center justify-between gap-6 p-5 text-left transition-colors hover:bg-bg-secondary/70"
            >
              <div>
                <div className="font-display text-[1.65rem] leading-none tracking-[-0.03em] text-text-primary">
                  {report.event_name}
                </div>
                <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.22em] text-text-muted">
                  {formatDate(report.starts_at, 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-right md:block">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Receita liquida</div>
                  <div className="font-mono text-sm font-bold text-status-success">{formatCurrency(report.net_sales)}</div>
                </div>
                <div className="hidden text-right md:block">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Custos</div>
                  <div className="font-mono text-sm font-bold text-status-error">
                    {formatCurrency(report.operational_costs)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Resultado</div>
                  <div className={cn('font-mono text-sm font-bold', profitable ? 'text-brand-acid' : 'text-status-error')}>
                    {formatCurrency(report.result)}
                  </div>
                </div>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                )}
              </div>
            </button>

            {expanded && (
              <div className="border-t border-bg-border p-5">
                <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-text-muted">DRE simplificado</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 rounded-2xl border border-bg-border bg-bg-secondary/75 p-4 text-sm">
                    <div className="flex justify-between border-b border-bg-border py-1">
                      <span className="font-mono text-[11px] uppercase text-text-muted">Receita bruta</span>
                      <span className="font-mono font-bold text-status-success">{formatCurrency(report.gross_sales)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Descontos</span>
                      <span className="font-mono text-text-primary">-{formatCurrency(report.discounts)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Taxas recuperadas</span>
                      <span className="font-mono text-text-primary">{formatCurrency(report.fees)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-bg-border py-2">
                      <span className="font-semibold text-text-primary">Receita liquida</span>
                      <span className="font-mono font-bold text-status-success">{formatCurrency(report.net_sales)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Pagamentos aprovados</span>
                      <span className="font-mono text-text-primary">{report.approved_payments_count}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Falhas</span>
                      <span className="font-mono text-status-warning">{report.failed_payments_count}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Reembolsos</span>
                      <span className="font-mono text-status-error">{formatCurrency(report.refunded_amount)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 rounded-2xl border border-bg-border bg-bg-secondary/75 p-4 text-sm">
                    <div className="flex justify-between border-b border-bg-border py-1">
                      <span className="font-mono text-[11px] uppercase text-text-muted">Custos operacionais</span>
                      <span className="font-mono font-bold text-status-error">
                        {formatCurrency(report.operational_costs)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Custos de equipe</span>
                      <span className="font-mono text-text-primary">{formatCurrency(report.staff_costs)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Custos de fornecedores</span>
                      <span className="font-mono text-text-primary">{formatCurrency(report.supplier_costs)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Custos manuais</span>
                      <span className="font-mono text-text-primary">{formatCurrency(report.manual_costs)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-bg-border py-2">
                      <span className="font-semibold text-text-primary">Resultado</span>
                      <span className={cn('font-mono font-bold', profitable ? 'text-brand-acid' : 'text-status-error')}>
                        {formatCurrency(report.result)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Margem</span>
                      <span className={cn('font-mono', profitable ? 'text-brand-acid' : 'text-status-error')}>
                        {report.margin_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Divergencias</span>
                      <span className="font-mono text-status-warning">{report.reconciliation_divergent_count}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[12px]">
                      <span className="text-text-secondary">Pendencias</span>
                      <span className="font-mono text-brand-blue">{report.reconciliation_pending_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
