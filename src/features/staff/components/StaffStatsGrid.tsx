import { Briefcase, CheckCircle2, MapPinned, UserCheck, Users } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'
import type { StaffSummaryStats } from '@/features/staff/types'

interface StaffStatsGridProps {
  stats: StaffSummaryStats
}

export function StaffStatsGrid({ stats }: StaffStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
      {[
        { label: 'Total', value: stats.total, icon: Users, color: 'text-text-primary' },
        { label: 'Confirmados', value: stats.confirmed, icon: CheckCircle2, color: 'text-status-success' },
        { label: 'Em campo', value: stats.active, icon: UserCheck, color: 'text-brand-acid' },
        { label: 'Alocados', value: stats.allocatedToGates, icon: MapPinned, color: 'text-brand-blue' },
        { label: 'Custo diario', value: formatCurrency(stats.totalDailyCost), icon: Briefcase, color: 'text-brand-blue' },
      ].map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="metric-card min-h-[148px]">
            <div className="flex items-start justify-between gap-3">
              <span className="metric-label">{stat.label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <div className={`metric-value text-[1.85rem] ${stat.color}`}>{stat.value}</div>
            <div className="mt-3 text-[11px] text-text-muted">Equipe, alocacao e custo em um unico painel.</div>
          </div>
        )
      })}
    </div>
  )
}
