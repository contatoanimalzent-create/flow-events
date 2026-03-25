import { Loader2, ShoppingCart } from 'lucide-react'
import { useCreateOrderDraft } from '@/features/orders/hooks'
import type { CreateOrderDraftInput } from '@/features/orders/types'
import { formatCurrency, formatNumber } from '@/shared/lib'

interface OrderDraftFoundationCardProps {
  eventId: string
  draft: CreateOrderDraftInput
  onCreated?: (orderId: string) => void
}

export function OrderDraftFoundationCard({ eventId, draft, onCreated }: OrderDraftFoundationCardProps) {
  const createOrderDraft = useCreateOrderDraft(eventId)
  const totalItems = draft.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = draft.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  async function handleCreateDraft() {
    const order = await createOrderDraft.mutateAsync(draft)
    onCreated?.(order.id)
  }

  return (
    <div className="surface-panel space-y-5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted">Checkout foundation</div>
          <div className="mt-2 font-display text-2xl text-text-primary">Rascunho de pedido</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
          <ShoppingCart className="h-5 w-5 text-brand-acid" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-bg-border bg-bg-secondary p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted">Itens</div>
          <div className="mt-2 text-xl font-semibold text-text-primary">{formatNumber(totalItems)}</div>
        </div>
        <div className="rounded-2xl border border-bg-border bg-bg-secondary p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted">Subtotal</div>
          <div className="mt-2 text-xl font-semibold text-text-primary">{formatCurrency(subtotal)}</div>
        </div>
      </div>

      <button onClick={() => void handleCreateDraft()} disabled={createOrderDraft.isPending} className="btn-primary w-full text-sm">
        {createOrderDraft.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Criar pedido em rascunho'}
      </button>

      {createOrderDraft.error instanceof Error && (
        <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">
          {createOrderDraft.error.message}
        </div>
      )}
    </div>
  )
}
