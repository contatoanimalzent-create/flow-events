import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  EMPTY_FINANCIAL_COST_ENTRY_FORM,
  FINANCIAL_COST_CATEGORY_LABELS,
  FINANCIAL_COST_STATUS_LABELS,
} from '@/features/financial/types'
import type { FinancialCostEntryRow, FinancialEventOption, UpsertFinancialCostEntryInput } from '@/features/financial/types'
import { FormField, FormGrid, FormSection, ModalBody, ModalFooter, ModalHeader, ModalShell, SelectInput } from '@/shared/components'

interface CostEntryModalProps {
  organizationId: string
  events: FinancialEventOption[]
  initialCostEntry?: FinancialCostEntryRow | null
  defaultEventId?: string
  onClose: () => void
  onSave: (input: UpsertFinancialCostEntryInput) => Promise<void>
  saving: boolean
}

export function CostEntryModal({
  organizationId,
  events,
  initialCostEntry,
  defaultEventId = '',
  onClose,
  onSave,
  saving,
}: CostEntryModalProps) {
  const [values, setValues] = useState(
    initialCostEntry
      ? {
          description: initialCostEntry.description,
          category: initialCostEntry.category,
          amount: String(initialCostEntry.amount ?? ''),
          due_date: initialCostEntry.due_date ? initialCostEntry.due_date.slice(0, 10) : '',
          paid_date: initialCostEntry.paid_date ? initialCostEntry.paid_date.slice(0, 10) : '',
          status: initialCostEntry.status,
          notes: initialCostEntry.notes ?? '',
        }
      : { ...EMPTY_FINANCIAL_COST_ENTRY_FORM },
  )
  const [eventId, setEventId] = useState(initialCostEntry?.event_id ?? defaultEventId)
  const [error, setError] = useState('')

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!values.description.trim()) {
      setError('Descrição e obrigatória.')
      return
    }

    if (!values.amount || Number.isNaN(Number(values.amount))) {
      setError('Informe um valor válido.')
      return
    }

    setError('')

    await onSave({
      organizationId,
      eventId: eventId || null,
      costEntryId: initialCostEntry?.id,
      values,
    })
  }

  return (
    <ModalShell size="lg">
      <ModalHeader
        eyebrow="Financeiro"
        title={
          <>
            {initialCostEntry ? 'Editar lancamento' : 'Novo lancamento'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Registre custos operacionais com melhor leitura, contexto e vinculacao por evento."
        onClose={onClose}
      />

      <ModalBody>
        <FormSection title="Lancamento financeiro">
          <FormField label="Descricao" required>
            <input className="input" value={values.description} onChange={(event) => setField('description', event.target.value)} autoFocus />
          </FormField>

          <FormGrid>
            <FormField label="Categoria">
              <SelectInput
                value={values.category}
                onChange={(v) => setField('category', v)}
                options={Object.entries(FINANCIAL_COST_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label }))}
              />
            </FormField>
            <FormField label="Status">
              <SelectInput
                value={values.status}
                onChange={(v) => setField('status', v)}
                options={Object.entries(FINANCIAL_COST_STATUS_LABELS).map(([key, label]) => ({ value: key, label }))}
              />
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Valor (R$)">
              <input type="number" min={0} step={0.01} className="input" value={values.amount} onChange={(event) => setField('amount', event.target.value)} />
            </FormField>
            <FormField label="Vencimento">
              <input type="date" className="input" value={values.due_date} onChange={(event) => setField('due_date', event.target.value)} />
            </FormField>
          </FormGrid>

          {events.length > 0 ? (
            <FormField label="Evento vinculado">
              <SelectInput
                value={eventId}
                onChange={setEventId}
                placeholder="Custo corporativo não alocado"
                options={[
                  { value: '', label: 'Custo corporativo não alocado' },
                  ...events.map((eventOption) => ({ value: eventOption.id, label: eventOption.name })),
                ]}
              />
            </FormField>
          ) : null}

          <FormField label="Observacoes">
            <textarea className="input resize-none" rows={4} value={values.notes} onChange={(event) => setField('notes', event.target.value)} />
          </FormField>
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
          {saving ? 'Salvando...' : 'Salvar lancamento'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
