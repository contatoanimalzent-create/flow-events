import { useState } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import { EMPTY_FINANCIAL_PAYOUT_FORM, FINANCIAL_PAYOUT_STATUS_LABELS } from '@/features/financial/types'
import type { FinancialEventOption, FinancialEventReport, UpsertEventPayoutInput } from '@/features/financial/types'

interface PayoutModalProps {
  organizationId: string
  events: FinancialEventOption[]
  initialReport?: FinancialEventReport | null
  defaultEventId?: string
  onClose: () => void
  onSave: (input: UpsertEventPayoutInput) => Promise<void>
  saving: boolean
}

export function PayoutModal({ organizationId, events, initialReport, defaultEventId = '', onClose, onSave, saving }: PayoutModalProps) {
  const [values, setValues] = useState(
    initialReport
      ? {
          event_id: initialReport.event_id,
          gross_sales: String(initialReport.approved_payments_amount || initialReport.gross_sales || ''),
          platform_fees: String(initialReport.platform_fees || ''),
          retained_amount: String(initialReport.retained_amount || ''),
          payable_amount: String(initialReport.payable_amount || ''),
          status: initialReport.payout_status,
          scheduled_at: initialReport.payout_scheduled_at ? initialReport.payout_scheduled_at.slice(0, 10) : '',
          paid_out_at: initialReport.payout_paid_out_at ? initialReport.payout_paid_out_at.slice(0, 10) : '',
          notes: initialReport.payout_notes ?? '',
        }
      : { ...EMPTY_FINANCIAL_PAYOUT_FORM, event_id: defaultEventId },
  )
  const [error, setError] = useState('')

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!values.event_id) {
      setError('Selecione um evento para registrar o repasse.')
      return
    }

    for (const field of ['gross_sales', 'platform_fees', 'retained_amount', 'payable_amount'] as const) {
      if (Number.isNaN(Number(values[field]))) {
        setError('Preencha os valores financeiros com numeros validos.')
        return
      }
    }

    setError('')

    await onSave({
      organizationId,
      payoutId: initialReport?.payout_id ?? undefined,
      values,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-lg overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            {initialReport ? 'REVISAR REPASSE' : 'NOVO REPASSE'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Base recebivel</label>
              <input type="number" min={0} step={0.01} className="input" value={values.gross_sales} onChange={(event) => setField('gross_sales', event.target.value)} />
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={values.status} onChange={(event) => setField('status', event.target.value)}>
                {Object.entries(FINANCIAL_PAYOUT_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label">Retido</label>
              <input type="number" min={0} step={0.01} className="input" value={values.retained_amount} onChange={(event) => setField('retained_amount', event.target.value)} />
            </div>
            <div>
              <label className="input-label">Taxa plataforma</label>
              <input type="number" min={0} step={0.01} className="input" value={values.platform_fees} onChange={(event) => setField('platform_fees', event.target.value)} />
            </div>
            <div>
              <label className="input-label">Payable</label>
              <input type="number" min={0} step={0.01} className="input" value={values.payable_amount} onChange={(event) => setField('payable_amount', event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Agendado para</label>
              <input type="date" className="input" value={values.scheduled_at} onChange={(event) => setField('scheduled_at', event.target.value)} />
            </div>
            <div>
              <label className="input-label">Pago em</label>
              <input type="date" className="input" value={values.paid_out_at} onChange={(event) => setField('paid_out_at', event.target.value)} />
            </div>
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
