import { BadgeDollarSign, CalendarCheck2, Receipt, TriangleAlert, Users } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'

interface CustomerMetricsGridProps {
  summary: {
    total_customers: number
    active_customers: number
    repeat_customers: number
    total_revenue: number
    average_ticket: number
    no_show_risk_customers: number
  }
}

export function CustomerMetricsGrid({ summary }: CustomerMetricsGridProps) {
  const cards = [
    { label: 'Customers', value: summary.total_customers.toLocaleString('pt-BR'), icon: Users, color: 'text-brand-blue' },
    { label: 'Ativos', value: summary.active_customers.toLocaleString('pt-BR'), icon: CalendarCheck2, color: 'text-status-success' },
    { label: 'Receita', value: formatCurrency(summary.total_revenue), icon: BadgeDollarSign, color: 'text-brand-acid' },
    { label: 'Ticket medio', value: formatCurrency(summary.average_ticket), icon: Receipt, color: 'text-brand-purple' },
    { label: 'Recorrentes', value: summary.repeat_customers.toLocaleString('pt-BR'), icon: Users, color: 'text-brand-teal' },
    { label: 'Risco no-show', value: summary.no_show_risk_customers.toLocaleString('pt-BR'), icon: TriangleAlert, color: 'text-status-warning' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="metric-card reveal min-h-[148px]">
            <div className="flex items-start justify-between gap-3">
              <span className="metric-label">{card.label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className={`metric-value text-[1.85rem] ${card.color}`}>{card.value}</div>
            <div className="mt-3 text-[11px] text-text-muted">Base viva de relacionamento e recorrencia.</div>
          </div>
        )
      })}
    </div>
  )
}
