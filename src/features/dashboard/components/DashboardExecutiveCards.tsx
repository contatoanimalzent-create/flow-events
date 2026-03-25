import { Activity, AlertTriangle, DollarSign, Megaphone, Percent, Users } from 'lucide-react'
import type { DashboardExecutiveSummary } from '@/features/dashboard/types'
import { cn, formatCurrency, formatNumber } from '@/shared/lib'

interface DashboardExecutiveCardsProps {
  summary: DashboardExecutiveSummary
}

export function DashboardExecutiveCards({ summary }: DashboardExecutiveCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <div key={card.label} className="metric-card reveal min-h-[156px] transition-all duration-300 hover:-translate-y-1 hover:border-brand-acid/20">
            <div className="flex items-start justify-between gap-4">
              <div className="metric-label">{card.label}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
            </div>
            <div className={cn('metric-value text-[2rem]', card.color)}>{card.value}</div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted">
              <span>Visao consolidada</span>
              <span className="font-mono uppercase tracking-[0.24em]">Live</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
