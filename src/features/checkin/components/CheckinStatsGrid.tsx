import { Activity, AlertTriangle, DoorOpen, Users } from 'lucide-react'
import { cn, formatNumber } from '@/shared/lib'
import type { CheckinStats } from '@/features/checkin/types'

interface CheckinStatsGridProps {
  stats: CheckinStats
}

export function CheckinStatsGrid({ stats }: CheckinStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 reveal sm:grid-cols-2 md:grid-cols-5">
      {[
        { label: 'Dentro agora', value: formatNumber(stats.currentOccupancy), icon: Users, color: 'text-brand-acid', big: true },
        { label: 'Total entradas', value: formatNumber(stats.totalIn), icon: DoorOpen, color: 'text-status-success' },
        { label: 'Total saidas', value: formatNumber(stats.totalOut), icon: DoorOpen, color: 'text-brand-blue' },
        { label: 'Taxa de sucesso', value: `${stats.successRate}%`, icon: Activity, color: 'text-status-success' },
        { label: 'Tentativas invalidas', value: formatNumber(stats.invalidAttempts), icon: AlertTriangle, color: 'text-status-error' },
      ].map((stat) => {
        const Icon = stat.icon

        return (
          <div key={stat.label} className={cn('metric-card min-h-[150px]', stat.big && 'border-brand-acid/20')}>
            <div className="flex items-start justify-between gap-3">
              <span className="metric-label">{stat.label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={cn('h-3.5 w-3.5', stat.color)} />
              </div>
            </div>
            <div className={cn(stat.big ? 'metric-value text-[2.2rem]' : 'metric-value text-[1.85rem]', stat.color)}>{stat.value}</div>
            <div className="mt-3 text-[11px] text-text-muted">Leitura em tempo real da operação de acesso.</div>
          </div>
        )
      })}
    </div>
  )
}
