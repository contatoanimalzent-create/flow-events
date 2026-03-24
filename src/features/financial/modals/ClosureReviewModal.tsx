import { useState } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import { EMPTY_FINANCIAL_CLOSURE_FORM, FINANCIAL_CLOSURE_STATUS_LABELS } from '@/features/financial/types'
import type { FinancialEventOption, FinancialEventReport, UpsertEventFinancialClosureInput } from '@/features/financial/types'

interface ClosureReviewModalProps {
  organizationId: string
  events: FinancialEventOption[]
  initialReport?: FinancialEventReport | null
  defaultEventId?: string
  onClose: () => void
  onSave: (input: UpsertEventFinancialClosureInput) => Promise<void>
  saving: boolean
}

export function ClosureReviewModal({
  organizationId,
  events,
  initialReport,
  defaultEventId = '',
  onClose,
  onSave,
  saving,
}: ClosureReviewModalProps) {
  const [values, setValues] = useState(
    initialReport
      ? {
          event_id: initialReport.event_id,
          status: initialReport.closure_status,
          payments_reconciled: initialReport.payments_reconciled,
          costs_recorded: initialReport.costs_recorded,
          payouts_reviewed: initialReport.payouts_reviewed,
          divergences_resolved: initialReport.divergences_resolved,
          result_validated: initialReport.result_validated,
          closed_at: initialReport.closure_closed_at ? initialReport.closure_closed_at.slice(0, 10) : '',
          notes: initialReport.closure_notes ?? '',
        }
      : { ...EMPTY_FINANCIAL_CLOSURE_FORM, event_id: defaultEventId },
  )
  const [error, setError] = useState('')

  function setField(field: keyof typeof values, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!values.event_id) {
      setError('Selecione um evento para registrar o fechamento.')
      return
    }

    setError('')

    await onSave({
      organizationId,
      closureId: initialReport?.closure_id ?? undefined,
      values,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-xl overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            {initialReport ? 'FECHAMENTO DO EVENTO' : 'NOVO FECHAMENTO'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Evento</label>
              <select className="input" value={values.event_id} onChange={(event) => setField('event_id', event.target.value)}>
                <option value="">Selecione um evento</option>
                {events.map((eventOption) => (
                  <option key={eventOption.id} value={eventOption.id}>
                    {eventOption.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={values.status} onChange={(event) => setField('status', event.target.value)}>
                {Object.entries(FINANCIAL_CLOSURE_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['payments_reconciled', 'Pagamentos conciliados'],
              ['costs_recorded', 'Custos lancados'],
              ['payouts_reviewed', 'Repasse revisado'],
              ['divergences_resolved', 'Divergencias resolvidas'],
              ['result_validated', 'Resultado validado'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-3 rounded-sm border border-bg-border bg-bg-surface px-3 py-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={Boolean(values[field as keyof typeof values])}
                  onChange={(event) => setField(field as keyof typeof values, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label className="input-label">Fechado em</label>
            <input type="date" className="input" value={values.closed_at} onChange={(event) => setField('closed_at', event.target.value)} />
          </div>

          <div>
            <label className="input-label">Observacoes</label>
            <textarea className="input resize-none" rows={3} value={values.notes} onChange={(event) => setField('notes', event.target.value)} />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : null}
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
