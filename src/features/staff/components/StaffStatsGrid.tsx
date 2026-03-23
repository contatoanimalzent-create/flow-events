import { Briefcase, CheckCircle2, MapPinned, UserCheck, Users } from 'lucide-react'
import { formatCurrency } from '@/shared/lib'
import type { StaffSummaryStats } from '@/features/staff/types'

interface StaffStatsGridProps {
  stats: StaffSummaryStats
}

export function StaffStatsGrid({ stats }: StaffStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {[
        { label: 'Total', value: stats.total, icon: Users, color: 'text-text-primary' },
        { label: 'Confirmados', value: stats.confirmed, icon: CheckCircle2, color: 'text-status-success' },
        { label: 'Em campo', value: stats.active, icon: UserCheck, color: 'text-brand-acid' },
        { label: 'Alocados', value: stats.allocatedToGates, icon: MapPinned, color: 'text-brand-blue' },
        { label: 'Custo diario', value: formatCurrency(stats.totalDailyCost), icon: Briefcase, color: 'text-brand-blue' },
      ].map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{stat.label}</span>
              <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
            </div>
            <div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
          </div>
        )
      })}
    </div>
  )
}
