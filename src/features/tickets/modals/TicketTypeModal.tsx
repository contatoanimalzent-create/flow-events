import { AlertCircle, Loader2 } from 'lucide-react'
import { useTicketForm } from '@/features/tickets/hooks'
import { TICKET_COLOR_OPTIONS } from '@/features/tickets/types'
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
    <ModalShell size="lg">
      <ModalHeader
        eyebrow="Tickets"
        title={
          <>
            {ticketId ? 'Editar tipo' : 'Novo tipo'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Defina posicionamento, beneficios e regras operacionais do ingresso."
        onClose={onClose}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : (
        <>
          <ModalBody>
            <FormSection title="Informações principais">
              <FormField label="Nome do ingresso" required>
                <input
                  className="input"
                  placeholder="ex: VIP, Pista, Camarote..."
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  autoFocus
                />
              </FormField>

              <FormField label="Descricao">
                <input
                  className="input"
                  placeholder="Descrição breve"
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                />
              </FormField>

              <FormGrid>
                <FormField label="Setor / Área">
                  <input
                    className="input"
                    placeholder="ex: Pista A, Setor Norte"
                    value={form.sector}
                    onChange={(event) => setField('sector', event.target.value)}
                  />
                </FormField>
                <FormField label="Max. por pedido">
                  <input
                    type="number"
                    className="input"
                    min={1}
                    max={20}
                    value={form.max_per_order}
                    onChange={(event) => setField('max_per_order', event.target.value)}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Identidade e beneficios">
              <FormField label="Cor identificadora">
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {TICKET_COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setField('color', color.value)}
                      className={cn(
                        'h-9 w-9 rounded-full border-2 border-transparent transition-all',
                        form.color === color.value && 'scale-105 border-white ring-2 ring-brand-acid/35 ring-offset-2 ring-offset-bg-secondary',
                      )}
                      style={{ background: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </FormField>

              <FormField label="Beneficios" hint="Use uma linha por beneficio para facilitar a leitura na venda pública.">
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder={'Acesso VIP\nOpen bar\nEstacionamento'}
                  value={form.benefits}
                  onChange={(event) => setField('benefits', event.target.value)}
                />
              </FormField>
            </FormSection>

            <FormSection title="Regras operacionais">
              <div className="space-y-3">
                <FormToggleCard
                  title="Ingresso nominal"
                  description="Vincula o ingresso ao nome do comprador para operação e suporte."
                  checked={form.is_nominal}
                  onToggle={() => setField('is_nominal', !form.is_nominal)}
                />
                <FormToggleCard
                  title="Permite transferência"
                  description="Autoriza troca de titularidade sem alterar a lógica atual do checkout."
                  checked={form.is_transferable}
                  onToggle={() => setField('is_transferable', !form.is_transferable)}
                />
              </div>
            </FormSection>

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
              {saving ? 'Salvando...' : ticketId ? 'Salvar tipo' : 'Criar tipo'}
            </button>
          </ModalFooter>
        </>
      )}
    </ModalShell>
  )
}
