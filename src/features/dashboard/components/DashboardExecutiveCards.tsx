import { Activity, AlertTriangle, DollarSign, Megaphone, Percent, Users } from 'lucide-react'
import type { DashboardExecutiveSummary } from '@/features/dashboard/types'
import { cn, formatCurrency, formatNumber } from '@/shared/lib'

interface DashboardExecutiveCardsProps {
  summary: DashboardExecutiveSummary
}

export function DashboardExecutiveCards({ summary }: DashboardExecutiveCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        { label: 'Receita bruta', value: formatCurrency(summary.grossRevenue), icon: DollarSign, color: 'text-brand-acid' },
        { label: 'Receita liquida', value: formatCurrency(summary.netRevenue), icon: Activity, color: 'text-status-success' },
        { label: 'Margem', value: `${summary.marginPercent.toFixed(1)}%`, icon: Percent, color: summary.marginPercent >= 0 ? 'text-brand-blue' : 'text-status-error' },
        { label: 'Eventos ativos', value: formatNumber(summary.activeEvents), icon: Users, color: 'text-brand-purple' },
        { label: 'Campanhas rodando', value: formatNumber(summary.runningCampaigns), icon: Megaphone, color: 'text-brand-blue' },
        { label: 'Alertas criticos', value: formatNumber(summary.criticalAlerts), icon: AlertTriangle, color: summary.criticalAlerts > 0 ? 'text-status-error' : 'text-status-success' },
        { label: 'Check-ins', value: formatNumber(summary.totalCheckins), icon: Activity, color: 'text-brand-teal' },
        { label: 'Clientes ativos', value: formatNumber(summary.totalCustomers), icon: Users, color: 'text-text-primary' },
      ].map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{card.label}</span>
              <Icon className={cn('h-4 w-4', card.color)} />
            </div>
            <div className={cn('text-xl font-semibold', card.color)}>{card.value}</div>
          </div>
        )
      })}
    </div>
  )
}
