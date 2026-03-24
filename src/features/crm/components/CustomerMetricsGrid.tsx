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
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        )
      })}
    </div>
  )
}
