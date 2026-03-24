import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { campaignsKeys, campaignsQueries } from '@/features/campaigns/services'
import { buildAudienceSegmentRules } from '@/features/campaigns/services/campaigns.payloads'
import type { AudienceSegmentFormValues, AudienceSegmentRow, CampaignEventOption } from '@/features/campaigns/types'
import { AudiencePreviewCard } from '@/features/campaigns/components/AudiencePreviewCard'

interface SegmentBuilderModalProps {
  organizationId: string
  events: CampaignEventOption[]
  values: AudienceSegmentFormValues
  saving: boolean
  segment?: AudienceSegmentRow | null
  onChange: (values: AudienceSegmentFormValues) => void
  onClose: () => void
  onSave: () => Promise<void>
}

export function SegmentBuilderModal({
  organizationId,
  events,
  values,
  saving,
  segment,
  onChange,
  onClose,
  onSave,
}: SegmentBuilderModalProps) {
  const rules = useMemo(() => buildAudienceSegmentRules(values), [values])
  const previewQuery = useQuery({
    ...(organizationId
      ? campaignsQueries.preview(organizationId, rules)
      : {
          queryKey: campaignsKeys.preview('empty', 'preview'),
          queryFn: async () => ({ audience_count: 0, total_revenue: 0, average_ticket: 0, high_value_customers: 0, no_show_customers: 0, sample_customers: [] }),
        }),
    enabled: Boolean(organizationId),
  })

  function updateField<Key extends keyof AudienceSegmentFormValues>(key: Key, value: AudienceSegmentFormValues[Key]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-start justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="font-display text-2xl leading-none text-text-primary">
              {segment ? 'EDITAR SEGMENTO' : 'NOVO SEGMENTO'}<span className="text-brand-acid">.</span>
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Filtros combinaveis com preview de audiencia em tempo real.</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="input-label">Nome do segmento</label>
                <input className="input" value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder="ex: No-show Festival SP" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Descricao</label>
                <textarea className="input min-h-24 resize-none" value={values.description} onChange={(event) => updateField('description', event.target.value)} />
              </div>
              <div>
                <label className="input-label">Compraram evento</label>
                <select className="input" value={values.purchased_event_id} onChange={(event) => updateField('purchased_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Fizeram check-in</label>
                <select className="input" value={values.attended_event_id} onChange={(event) => updateField('attended_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Compraram e nao compareceram</label>
                <select className="input" value={values.bought_not_attended_event_id} onChange={(event) => updateField('bought_not_attended_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Tag</label>
                <input className="input" value={values.tag} onChange={(event) => updateField('tag', event.target.value)} placeholder="vip, recorrente..." />
              </div>
              <div>
                <label className="input-label">Cidade</label>
                <input className="input" value={values.city} onChange={(event) => updateField('city', event.target.value)} />
              </div>
              <div>
                <label className="input-label">Estado</label>
                <input className="input" value={values.state} onChange={(event) => updateField('state', event.target.value)} />
              </div>
              <div>
                <label className="input-label">Minimo gasto</label>
                <input className="input" value={values.min_total_revenue} onChange={(event) => updateField('min_total_revenue', event.target.value)} placeholder="500" />
              </div>
              <div>
                <label className="input-label">Minimo pedidos</label>
                <input className="input" value={values.min_orders} onChange={(event) => updateField('min_orders', event.target.value)} placeholder="2" />
              </div>
              <div>
                <label className="input-label">Inativos ha X dias</label>
                <input className="input" value={values.inactive_days} onChange={(event) => updateField('inactive_days', event.target.value)} placeholder="60" />
              </div>
              <div>
                <label className="input-label">Ticket medio minimo</label>
                <input className="input" value={values.min_average_ticket} onChange={(event) => updateField('min_average_ticket', event.target.value)} placeholder="80" />
              </div>
              <div>
                <label className="input-label">Ticket medio maximo</label>
                <input className="input" value={values.max_average_ticket} onChange={(event) => updateField('max_average_ticket', event.target.value)} placeholder="350" />
              </div>
            </div>
          </div>

          <div className="overflow-y-auto border-l border-bg-border p-6">
            {previewQuery.isPending ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
              </div>
            ) : (
              <AudiencePreviewCard preview={previewQuery.data ?? null} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={() => void onSave()} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Salvando...' : 'Salvar segmento'}
          </button>
        </div>
      </div>
    </div>
  )
}
