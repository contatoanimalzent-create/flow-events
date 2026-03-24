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
      sublabel: overview.unallocated_costs > 0 ? `${formatCurrency(overview.unallocated_costs)} nao alocados` : 'Tudo alocado por evento',
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div key={card.label} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
            <div className="mt-1 text-[11px] text-text-muted">{card.sublabel}</div>
          </div>
        )
      })}
    </div>
  )
}
