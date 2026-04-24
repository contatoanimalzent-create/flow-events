import { AlertTriangle, DollarSign, Receipt, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'
import type { FinancialOverview } from '@/features/financial/types'

interface FinancialExecutiveCardsProps {
  overview: FinancialOverview
}

export function FinancialExecutiveCards({ overview }: FinancialExecutiveCardsProps) {
  const cards = [
    {
      label: 'Receita liquida',
      value: formatCurrency(overview.net_sales),
      sublabel: `${overview.approved_payments_count} pagamentos aprovados`,
      icon: TrendingUp,
      color: overview.net_sales >= 0 ? 'text-status-success' : 'text-status-error',
    },
    {
      label: 'Custos operacionais',
      value: formatCurrency(overview.operational_costs),
      sublabel: overview.unallocated_costs > 0 ? `${formatCurrency(overview.unallocated_costs)} não alocados` : 'Tudo alocado por evento',
      icon: Receipt,
      color: 'text-status-error',
    },
    {
      label: 'Resultado',
      value: formatCurrency(overview.result),
      sublabel: `Margem ${overview.margin_percent.toFixed(1)}%`,
      icon: DollarSign,
      color: overview.result >= 0 ? 'text-brand-acid' : 'text-status-error',
    },
    {
      label: 'Divergencias',
      value: String(overview.divergence_count),
      sublabel: `${overview.pending_reconciliation_count} pendencias em conciliacao`,
      icon: AlertTriangle,
      color: overview.divergence_count > 0 ? 'text-status-warning' : 'text-brand-blue',
    },
  ] as const

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div key={card.label} className="metric-card min-h-[164px]">
            <div className="flex items-start justify-between gap-3">
              <span className="metric-label">{card.label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className={`metric-value font-mono text-[2rem] ${card.color}`}>{card.value}</div>
            <div className="mt-3 text-[11px] leading-5 text-text-muted">{card.sublabel}</div>
          </div>
        )
      })}
    </div>
  )
}
