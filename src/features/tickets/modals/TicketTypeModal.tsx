import { AlertCircle, Loader2, X } from 'lucide-react'
import { useTicketForm } from '@/features/tickets/hooks'
import { TICKET_COLOR_OPTIONS } from '@/features/tickets/types'
import { cn } from '@/shared/lib'

interface TicketTypeModalProps {
  eventId: string
  ticketId: string | null
  position: number
  onClose: () => void
  onSaved: () => void
}

export function TicketTypeModal({ eventId, ticketId, position, onClose, onSaved }: TicketTypeModalProps) {
  const { form, loading, saving, error, setField, handleSave } = useTicketForm({ eventId, ticketId, position, onSaved })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-lg overflow-hidden rounded-sm border border-bg-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none tracking-wide text-text-primary">
            {ticketId ? 'EDITAR TIPO' : 'NOVO TIPO'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : (
          <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
            <div>
              <label className="input-label">Nome do ingresso *</label>
              <input
                className="input"
                placeholder="ex: VIP, Pista, Camarote..."
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="input-label">Descri\u00e7\u00e3o</label>
              <input
                className="input"
                placeholder="Descri\u00e7\u00e3o breve"
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Setor / \u00c1rea</label>
                <input
                  className="input"
                  placeholder="ex: Pista A, Setor Norte"
                  value={form.sector}
                  onChange={(event) => setField('sector', event.target.value)}
                />
              </div>
              <div>
                <label className="input-label">M\u00e1x. por pedido</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={20}
                  value={form.max_per_order}
                  onChange={(event) => setField('max_per_order', event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Cor identificadora</label>
              <div className="mt-1 flex items-center gap-2">
                {TICKET_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setField('color', color.value)}
                    className={cn(
                      'h-7 w-7 rounded-sm transition-all',
                      form.color === color.value && 'scale-110 ring-2 ring-brand-acid ring-offset-2 ring-offset-bg-card',
                    )}
                    style={{ background: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Benef\u00edcios (um por linha)</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder={'Acesso VIP\nOpen bar\nEstacionamento'}
                value={form.benefits}
                onChange={(event) => setField('benefits', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              {[
                {
                  label: 'Ingresso nominal (com nome do comprador)',
                  value: form.is_nominal,
                  field: 'is_nominal' as const,
                },
                {
                  label: 'Permite transfer\u00eancia',
                  value: form.is_transferable,
                  field: 'is_transferable' as const,
                },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface p-3">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <button
                    onClick={() => setField(item.field, !item.value)}
                    className={cn(
                      'relative flex h-5 w-9 flex-shrink-0 rounded-full transition-all duration-200',
                      item.value ? 'bg-brand-acid' : 'bg-bg-border',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200',
                        item.value ? 'left-4' : 'left-0.5',
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : ticketId ? '\u2713 Salvar' : '\u2713 Criar tipo'}
          </button>
        </div>
      </div>
    </div>
  )
}
