import { useState } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import {
  EMPTY_FINANCIAL_COST_ENTRY_FORM,
  FINANCIAL_COST_CATEGORY_LABELS,
  FINANCIAL_COST_STATUS_LABELS,
} from '@/features/financial/types'
import type { FinancialCostEntryRow, FinancialEventOption, UpsertFinancialCostEntryInput } from '@/features/financial/types'

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
      setError('Descricao e obrigatoria.')
      return
    }

    if (!values.amount || Number.isNaN(Number(values.amount))) {
      setError('Informe um valor valido.')
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-lg overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            {initialCostEntry ? 'EDITAR LANCAMENTO' : 'NOVO LANCAMENTO'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
          <div>
            <label className="input-label">Descricao *</label>
            <input className="input" value={values.description} onChange={(event) => setField('description', event.target.value)} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Categoria</label>
              <select className="input" value={values.category} onChange={(event) => setField('category', event.target.value)}>
                {Object.entries(FINANCIAL_COST_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={values.status} onChange={(event) => setField('status', event.target.value)}>
                {Object.entries(FINANCIAL_COST_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor (R$)</label>
              <input type="number" min={0} step={0.01} className="input" value={values.amount} onChange={(event) => setField('amount', event.target.value)} />
            </div>
            <div>
              <label className="input-label">Vencimento</label>
              <input type="date" className="input" value={values.due_date} onChange={(event) => setField('due_date', event.target.value)} />
            </div>
          </div>

          {events.length > 0 && (
            <div>
              <label className="input-label">Evento vinculado</label>
              <select className="input" value={eventId} onChange={(event) => setEventId(event.target.value)}>
                <option value="">Custo corporativo nao alocado</option>
                {events.map((eventOption) => (
                  <option key={eventOption.id} value={eventOption.id}>
                    {eventOption.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Observacoes</label>
            <textarea className="input resize-none" rows={3} value={values.notes} onChange={(event) => setField('notes', event.target.value)} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void handleSave()} disabled={saving} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
