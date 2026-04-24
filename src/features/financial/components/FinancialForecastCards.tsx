import { AlertTriangle, BarChart3, LineChart, ShieldAlert } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'
import type { FinancialOverview } from '@/features/financial/types'

interface FinancialForecastCardsProps {
  overview: FinancialOverview
}

export function FinancialForecastCards({ overview }: FinancialForecastCardsProps) {
  const cards = [
    {
      label: 'Receita projetada',
      value: formatCurrency(overview.total_projected_revenue),
      sublabel: 'Forecast consolidado dos eventos',
      icon: LineChart,
      color: 'text-brand-blue',
    },
    {
      label: 'Custo projetado',
      value: formatCurrency(overview.total_projected_cost),
      sublabel: 'Base esperada para operação',
      icon: BarChart3,
      color: 'text-status-warning',
    },
    {
      label: 'Margem projetada',
      value: formatCurrency(overview.total_projected_margin),
      sublabel: `${overview.events_ready_to_close_count} eventos prontos para fechar`,
      icon: ShieldAlert,
      color: overview.total_projected_margin >= 0 ? 'text-brand-acid' : 'text-status-error',
    },
    {
      label: 'Eventos em risco',
      value: String(overview.events_at_risk_count),
      sublabel: 'Monitorar receita, custo e divergências',
      icon: AlertTriangle,
      color: overview.events_at_risk_count > 0 ? 'text-status-error' : 'text-status-success',
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
