import { AlertCircle, Loader2 } from 'lucide-react'
import { useTicketBatchForm } from '@/features/tickets/hooks'
import {
  FormField,
  FormGrid,
  FormSection,
  FormToggleCard,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from '@/shared/components'
import { formatCurrency, formatNumber } from '@/shared/lib'

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
    <ModalShell size="md">
      <ModalHeader
        eyebrow="Batches"
        title={
          <>
            {batchId ? 'Editar lote' : 'Novo lote'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Defina o posicionamento comercial, janela de venda e capacidade do lote."
        onClose={onClose}
      />

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : (
        <>
          <ModalBody>
            <FormSection title="Configuracao comercial">
              <FormField label="Nome do lote" required>
                <input
                  className="input"
                  placeholder="ex: 1o Lote, Early Bird, Ultimo Lote"
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  autoFocus
                />
              </FormField>

              <FormGrid>
                <FormField label="Preco (R$)" required>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    step={0.01}
                    placeholder="0,00"
                    value={form.price}
                    onChange={(event) => setField('price', event.target.value)}
                  />
                </FormField>
                <FormField label="Quantidade" required>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    placeholder="ex: 200"
                    value={form.quantity}
                    onChange={(event) => setField('quantity', event.target.value)}
                  />
                </FormField>
              </FormGrid>

              <FormGrid>
                <FormField label="Inicio das vendas">
                  <input type="datetime-local" className="input" value={form.starts_at} onChange={(event) => setField('starts_at', event.target.value)} />
                </FormField>
                <FormField label="Fim das vendas">
                  <input type="datetime-local" className="input" value={form.ends_at} onChange={(event) => setField('ends_at', event.target.value)} />
                </FormField>
              </FormGrid>

              <FormToggleCard
                title="Abrir proximo lote automaticamente"
                description="Quando este lote esgotar, o proximo entra em venda sozinho."
                checked={form.auto_open_next}
                onToggle={() => setField('auto_open_next', !form.auto_open_next)}
              />
            </FormSection>

            {price > 0 && quantity > 0 ? (
              <FormSection title="Resumo financeiro" description="Estimativa rapida para conferencia comercial.">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Receita potencial</span>
                    <span className="font-semibold text-brand-acid">{formatCurrency(price * quantity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Preco por ingresso</span>
                    <span className="text-text-primary">{formatCurrency(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Capacidade do lote</span>
                    <span className="text-text-primary">{formatNumber(quantity)} ingressos</span>
                  </div>
                </div>
              </FormSection>
            ) : null}

            {error ? (
              <div className="flex items-center gap-2 rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <button onClick={onClose} className="btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={() => void handleSave()} disabled={saving} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Salvando...' : batchId ? 'Salvar lote' : 'Criar lote'}
            </button>
          </ModalFooter>
        </>
      )}
    </ModalShell>
  )
}
