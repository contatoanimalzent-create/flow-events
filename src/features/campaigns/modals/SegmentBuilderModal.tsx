import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { AudiencePreviewCard } from '@/features/campaigns/components/AudiencePreviewCard'
import { campaignsKeys, campaignsQueries } from '@/features/campaigns/services'
import { buildAudienceSegmentRules } from '@/features/campaigns/services/campaigns.payloads'
import type { AudienceSegmentFormValues, AudienceSegmentRow, CampaignEventOption } from '@/features/campaigns/types'
import { FormField, FormGrid, FormSection, ModalBody, ModalFooter, ModalHeader, ModalShell } from '@/shared/components'

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
    <ModalShell size="6xl">
      <ModalHeader
        eyebrow="Campaigns"
        title={
          <>
            {segment ? 'Editar segmento' : 'Novo segmento'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Combine filtros de comportamento, cidade, gasto e presenca com preview vivo da audiencia."
        onClose={onClose}
      />

      <div className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[1.15fr_0.85fr]">
        <ModalBody className="border-r border-bg-border">
          <FormSection title="Identidade do segmento">
            <FormField label="Nome do segmento">
              <input className="input" value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder="ex: No-show Festival SP" />
            </FormField>
            <FormField label="Descricao">
              <textarea className="input min-h-24 resize-none" value={values.description} onChange={(event) => updateField('description', event.target.value)} />
            </FormField>
          </FormSection>

          <FormSection title="Comportamento de compra e presenca">
            <FormGrid>
              <FormField label="Compraram evento">
                <select className="input" value={values.purchased_event_id} onChange={(event) => updateField('purchased_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Fizeram check-in">
                <select className="input" value={values.attended_event_id} onChange={(event) => updateField('attended_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormGrid>

            <FormGrid>
              <FormField label="Compraram e nao compareceram">
                <select className="input" value={values.bought_not_attended_event_id} onChange={(event) => updateField('bought_not_attended_event_id', event.target.value)}>
                  <option value="">Todos</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tag">
                <input className="input" value={values.tag} onChange={(event) => updateField('tag', event.target.value)} placeholder="vip, recorrente..." />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Geo e valor">
            <FormGrid columns={3}>
              <FormField label="Cidade">
                <input className="input" value={values.city} onChange={(event) => updateField('city', event.target.value)} />
              </FormField>
              <FormField label="Estado">
                <input className="input" value={values.state} onChange={(event) => updateField('state', event.target.value)} />
              </FormField>
              <FormField label="Inativos ha X dias">
                <input className="input" value={values.inactive_days} onChange={(event) => updateField('inactive_days', event.target.value)} placeholder="60" />
              </FormField>
            </FormGrid>

            <FormGrid columns={3}>
              <FormField label="Minimo gasto">
                <input className="input" value={values.min_total_revenue} onChange={(event) => updateField('min_total_revenue', event.target.value)} placeholder="500" />
              </FormField>
              <FormField label="Minimo pedidos">
                <input className="input" value={values.min_orders} onChange={(event) => updateField('min_orders', event.target.value)} placeholder="2" />
              </FormField>
              <FormField label="Ticket medio minimo">
                <input className="input" value={values.min_average_ticket} onChange={(event) => updateField('min_average_ticket', event.target.value)} placeholder="80" />
              </FormField>
            </FormGrid>

            <FormField label="Ticket medio maximo">
              <input className="input" value={values.max_average_ticket} onChange={(event) => updateField('max_average_ticket', event.target.value)} placeholder="350" />
            </FormField>
          </FormSection>
        </ModalBody>

        <div className="overflow-y-auto px-6 py-6">
          <FormSection title="Preview da audiencia" description="Atualizado a partir das regras montadas no builder.">
            {previewQuery.isPending ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
              </div>
            ) : (
              <AudiencePreviewCard preview={previewQuery.data ?? null} />
            )}
          </FormSection>
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button onClick={() => void onSave()} disabled={saving} className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : 'Salvar segmento'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
