import { Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import type { TicketBatch } from '@/features/tickets/types'
import { cn, formatCurrency, formatDate, formatNumber } from '@/shared/lib'

interface TicketBatchRowProps {
  batch: TicketBatch
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

export function TicketBatchRow({ batch, onEdit, onDelete, onToggle }: TicketBatchRowProps) {
  const soldPercentage = batch.quantity > 0 ? Math.round((batch.sold_count / batch.quantity) * 100) : 0
  const available = batch.quantity - batch.sold_count - batch.reserved_count

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-sm border px-3 py-2.5 transition-all',
        batch.is_active ? 'border-brand-acid/20 bg-brand-acid/3' : 'border-bg-border bg-bg-surface/50 opacity-60',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary">{batch.name}</span>
          {batch.is_active && (
            <span className="rounded-sm bg-brand-acid/15 px-1.5 py-0.5 text-[9px] font-mono text-brand-acid">ATIVO</span>
          )}
          {batch.auto_open_next && (
            <span className="rounded-sm bg-bg-border px-1.5 py-0.5 text-[9px] font-mono text-text-muted">AUTO</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4 text-[11px] font-mono text-text-muted">
          <span className="font-semibold text-brand-acid">{formatCurrency(batch.price)}</span>
          <span>
            {formatNumber(batch.sold_count)}/{formatNumber(batch.quantity)} vendidos
          </span>
          <span className="text-status-success">{formatNumber(available)} dispon\u00edveis</span>
          {batch.ends_at && <span>at\u00e9 {formatDate(batch.ends_at, 'dd/MM HH:mm')}</span>}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-border">
          <div className="h-full rounded-full bg-brand-acid" style={{ width: `${soldPercentage}%` }} />
        </div>
        <span className="w-8 text-[10px] font-mono text-text-muted">{soldPercentage}%</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button onClick={onToggle} className="rounded-sm p-1 text-text-muted transition-all hover:text-brand-acid">
          {batch.is_active ? <ToggleRight className="h-3.5 w-3.5 text-brand-acid" /> : <ToggleLeft className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onEdit} className="rounded-sm p-1 text-text-muted transition-all hover:text-text-primary">
          <Edit2 className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="rounded-sm p-1 text-text-muted transition-all hover:text-status-error">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
