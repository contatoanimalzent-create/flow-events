import { Activity, AlertTriangle, DoorOpen, Users } from 'lucide-react'
import { cn, formatNumber } from '@/shared/lib'
import type { CheckinStats } from '@/features/checkin/types'

interface CheckinStatsGridProps {
  stats: CheckinStats
}

export function CheckinStatsGrid({ stats }: CheckinStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 reveal md:grid-cols-5">
      {[
        { label: 'Dentro agora', value: formatNumber(stats.currentOccupancy), icon: Users, color: 'text-brand-acid', big: true },
        { label: 'Total entradas', value: formatNumber(stats.totalIn), icon: DoorOpen, color: 'text-status-success' },
        { label: 'Total saidas', value: formatNumber(stats.totalOut), icon: DoorOpen, color: 'text-brand-blue' },
        { label: 'Taxa de sucesso', value: `${stats.successRate}%`, icon: Activity, color: 'text-status-success' },
        { label: 'Tentativas invalidas', value: formatNumber(stats.invalidAttempts), icon: AlertTriangle, color: 'text-status-error' },
      ].map((stat) => {
        const Icon = stat.icon

        return (
          <div key={stat.label} className={cn('card p-4', stat.big && 'md:col-span-1 border-brand-acid/20')}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{stat.label}</span>
              <Icon className={cn('h-3.5 w-3.5', stat.color)} />
            </div>
            <div className={cn(stat.big ? 'text-3xl' : 'text-xl', 'font-semibold', stat.color)}>{stat.value}</div>
          </div>
        )
      })}
    </div>
  )
}
