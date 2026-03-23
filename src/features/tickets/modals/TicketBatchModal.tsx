import { AlertCircle, Loader2, X } from 'lucide-react'
import { useTicketBatchForm } from '@/features/tickets/hooks'
import { cn, formatCurrency, formatNumber } from '@/shared/lib'

interface TicketBatchModalProps {
  eventId: string
  ticketTypeId: string
  batchId: string | null
  position: number
  onClose: () => void
  onSaved: () => void
}

export function TicketBatchModal({ eventId, ticketTypeId, batchId, position, onClose, onSaved }: TicketBatchModalProps) {
  const { form, loading, saving, error, setField, handleSave } = useTicketBatchForm({
    eventId,
    ticketTypeId,
    batchId,
    position,
    onSaved,
  })

  const price = parseFloat(form.price) || 0
  const quantity = parseInt(form.quantity, 10) || 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-md overflow-hidden rounded-sm border border-bg-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none tracking-wide text-text-primary">
            {batchId ? 'EDITAR LOTE' : 'NOVO LOTE'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div>
              <label className="input-label">Nome do lote *</label>
              <input
                className="input"
                placeholder="ex: 1\u00ba Lote, Early Bird, \u00daltimo Lote"
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Pre\u00e7o (R$) *</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.price}
                  onChange={(event) => setField('price', event.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Quantidade *</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  placeholder="ex: 200"
                  value={form.quantity}
                  onChange={(event) => setField('quantity', event.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">In\u00edcio das vendas</label>
                <input type="datetime-local" className="input" value={form.starts_at} onChange={(event) => setField('starts_at', event.target.value)} />
              </div>
              <div>
                <label className="input-label">Fim das vendas</label>
                <input type="datetime-local" className="input" value={form.ends_at} onChange={(event) => setField('ends_at', event.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface p-3">
              <div>
                <div className="text-sm text-text-secondary">Abrir pr\u00f3ximo lote automaticamente</div>
                <div className="mt-0.5 text-[11px] text-text-muted">Quando este lote esgotar, o pr\u00f3ximo abre sozinho</div>
              </div>
              <button
                onClick={() => setField('auto_open_next', !form.auto_open_next)}
                className={cn(
                  'relative ml-4 flex h-5 w-9 flex-shrink-0 rounded-full transition-all duration-200',
                  form.auto_open_next ? 'bg-brand-acid' : 'bg-bg-border',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200',
                    form.auto_open_next ? 'left-4' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            {price > 0 && quantity > 0 && (
              <div className="space-y-1 rounded-sm border border-brand-acid/15 bg-bg-surface p-3 text-xs font-mono">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-text-muted">Resumo</div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Receita potencial</span>
                  <span className="font-semibold text-brand-acid">{formatCurrency(price * quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Pre\u00e7o por ingresso</span>
                  <span className="text-text-primary">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Capacidade do lote</span>
                  <span className="text-text-primary">{formatNumber(quantity)} ingressos</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void handleSave()} disabled={saving} className="btn-primary flex min-w-[120px] items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : batchId ? '\u2713 Salvar' : '\u2713 Criar lote'}
          </button>
        </div>
      </div>
    </div>
  )
}
