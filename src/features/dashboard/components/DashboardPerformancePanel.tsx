import type { DashboardPerformanceItem } from '@/features/dashboard/types'
import { cn } from '@/shared/lib'

interface DashboardPerformancePanelProps {
  items: DashboardPerformanceItem[]
}

export function DashboardPerformancePanel({ items }: DashboardPerformancePanelProps) {
  const toneClasses: Record<DashboardPerformanceItem['tone'], string> = {
    default: 'text-text-primary',
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-error',
  }

  return (
    <div className="card p-5">
      <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-text-muted">Performance consolidada</div>
      {items.length === 0 ? (
        <div className="text-sm text-text-muted">Nenhum indicador consolidado disponível.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface px-3 py-2">
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className={cn('font-mono text-sm font-semibold', toneClasses[item.tone])}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
