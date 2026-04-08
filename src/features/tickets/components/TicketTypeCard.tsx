import { ChevronDown, ChevronUp, Edit2, GripVertical, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import type { TicketBatch, TicketTypeWithBatches } from '@/features/tickets/types'
import { cn, formatCurrency, formatNumber } from '@/shared/lib'
import { TicketBatchRow } from './TicketBatchRow'

interface TicketTypeCardProps {
  ticketType: TicketTypeWithBatches
  index: number
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onAddBatch: () => void
  onEditBatch: (batch: TicketBatch) => void
  onDeleteBatch: (batch: TicketBatch) => void
  onToggleBatch: (batch: TicketBatch) => void
}

export function TicketTypeCard({
  ticketType,
  index,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onAddBatch,
  onEditBatch,
  onDeleteBatch,
  onToggleBatch,
}: TicketTypeCardProps) {
  const totalQuantity = ticketType.batches.reduce((sum, batch) => sum + batch.quantity, 0)
  const totalSold = ticketType.batches.reduce((sum, batch) => sum + batch.sold_count, 0)
  const activeBatch = ticketType.batches.find((batch) => batch.is_active)
  const occupancy = totalQuantity > 0 ? Math.round((totalSold / totalQuantity) * 100) : 0

  return (
    <div
      className={cn('card reveal overflow-hidden transition-all duration-200', !ticketType.is_active && 'opacity-60')}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 p-4">
        <GripVertical className="h-4 w-4 shrink-0 text-text-muted" />

        <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: ticketType.color ?? '#0057E7' }} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg leading-none tracking-wide text-text-primary">{ticketType.name}</span>
            {ticketType.sector && (
              <span className="rounded-sm border border-bg-border px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
                {ticketType.sector}
              </span>
            )}
            {!ticketType.is_active && <span className="badge badge-muted text-[10px]">Inativo</span>}
          </div>
          {ticketType.description && <p className="mt-0.5 truncate text-xs text-text-muted">{ticketType.description}</p>}
        </div>

        <div className="hidden shrink-0 items-center gap-6 text-xs md:flex">
          <div className="text-center">
            <div className="font-mono font-medium text-text-primary">
              {formatNumber(totalSold)}/{formatNumber(totalQuantity)}
            </div>
            <div className="text-text-muted">vendidos</div>
          </div>
          <div className="text-center">
            <div className="font-mono font-medium text-brand-acid">{occupancy}%</div>
            <div className="text-text-muted">ocupa\u00e7\u00e3o</div>
          </div>
          {activeBatch && (
            <div className="text-center">
              <div className="font-mono font-medium text-text-primary">{formatCurrency(activeBatch.price)}</div>
              <div className="text-text-muted">lote atual</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-mono font-medium text-text-primary">{ticketType.batches.length}</div>
            <div className="text-text-muted">lotes</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button onClick={onToggleActive} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid">
            {ticketType.is_active ? <ToggleRight className="h-4 w-4 text-brand-acid" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button onClick={onEdit} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-status-error/8 hover:text-status-error">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onToggleExpand} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mx-4 h-px bg-bg-surface">
        <div className="h-full rounded-full bg-brand-acid transition-all duration-700" style={{ width: `${occupancy}%` }} />
      </div>

      {expanded && (
        <div className="mt-1 space-y-2 border-t border-bg-border p-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Lotes de venda</span>
            <button onClick={onAddBatch} className="flex items-center gap-1.5 text-xs font-mono text-brand-acid hover:underline">
              <Plus className="h-3 w-3" /> Novo lote
            </button>
          </div>

          {ticketType.batches.length === 0 && (
            <div className="py-6 text-center text-xs text-text-muted">
              Nenhum lote criado ainda {'\u2014'}{' '}
              <button onClick={onAddBatch} className="text-brand-acid hover:underline">
                criar primeiro lote
              </button>
            </div>
          )}

          {ticketType.batches.map((batch) => (
            <TicketBatchRow
              key={batch.id}
              batch={batch}
              onEdit={() => onEditBatch(batch)}
              onDelete={() => onDeleteBatch(batch)}
              onToggle={() => onToggleBatch(batch)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
