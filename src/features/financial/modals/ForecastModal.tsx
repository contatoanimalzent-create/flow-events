import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { EMPTY_FINANCIAL_FORECAST_FORM, FINANCIAL_FORECAST_RISK_LABELS } from '@/features/financial/types'
import type { FinancialEventOption, FinancialEventReport, UpsertFinancialForecastInput } from '@/features/financial/types'
import { FormField, FormGrid, FormSection, ModalBody, ModalFooter, ModalHeader, ModalShell } from '@/shared/components'

interface ForecastModalProps {
  organizationId: string
  events: FinancialEventOption[]
  initialReport?: FinancialEventReport | null
  defaultEventId?: string
  onClose: () => void
  onSave: (input: UpsertFinancialForecastInput) => Promise<void>
  saving: boolean
}

export function ForecastModal({ organizationId, events, initialReport, defaultEventId = '', onClose, onSave, saving }: ForecastModalProps) {
  const [values, setValues] = useState(
    initialReport
      ? {
          event_id: initialReport.event_id,
          projected_revenue: String(initialReport.projected_revenue || ''),
          projected_cost: String(initialReport.projected_cost || ''),
          risk_status: initialReport.risk_status,
          notes: initialReport.forecast_notes ?? '',
        }
      : { ...EMPTY_FINANCIAL_FORECAST_FORM, event_id: defaultEventId },
  )
  const [error, setError] = useState('')

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!values.event_id) {
      setError('Selecione um evento para registrar o forecast.')
      return
    }

    if (Number.isNaN(Number(values.projected_revenue)) || Number.isNaN(Number(values.projected_cost))) {
      setError('Receita e custo projetados precisam ser numericos.')
      return
    }

    setError('')

    await onSave({
      organizationId,
      forecastId: initialReport?.forecast_id ?? undefined,
      values,
    })
  }

  return (
    <ModalShell size="lg">
      <ModalHeader
        eyebrow="Financeiro"
        title={
          <>
            {initialReport ? 'Editar forecast' : 'Novo forecast'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Projete receita, custo e risco executivo do evento sem mudar a logica financeira existente."
        onClose={onClose}
      />

      <ModalBody>
        <FormSection title="Visao projetada">
          <FormField label="Evento">
            <select className="input" value={values.event_id} onChange={(event) => setField('event_id', event.target.value)}>
              <option value="">Selecione um evento</option>
              {events.map((eventOption) => (
                <option key={eventOption.id} value={eventOption.id}>
                  {eventOption.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormGrid>
            <FormField label="Receita projetada">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input"
                value={values.projected_revenue}
                onChange={(event) => setField('projected_revenue', event.target.value)}
              />
            </FormField>
            <FormField label="Custo projetado">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input"
                value={values.projected_cost}
                onChange={(event) => setField('projected_cost', event.target.value)}
              />
            </FormField>
          </FormGrid>

          <FormField label="Risco executivo">
            <select className="input" value={values.risk_status} onChange={(event) => setField('risk_status', event.target.value)}>
              {Object.entries(FINANCIAL_FORECAST_RISK_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

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
          {saving ? 'Salvando...' : 'Salvar forecast'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
