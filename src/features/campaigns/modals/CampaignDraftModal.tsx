import { Loader2 } from 'lucide-react'
import type { AudienceSegmentRow, CampaignDraftFormValues, CampaignDraftRow, CampaignEventOption } from '@/features/campaigns/types'
import { CAMPAIGN_CHANNEL_LABELS } from '@/features/campaigns/types'
import { FormField, FormGrid, FormSection, ModalBody, ModalFooter, ModalHeader, ModalShell } from '@/shared/components'

interface CampaignDraftModalProps {
  events: CampaignEventOption[]
  segments: AudienceSegmentRow[]
  draft?: CampaignDraftRow | null
  values: CampaignDraftFormValues
  saving: boolean
  onChange: (values: CampaignDraftFormValues) => void
  onClose: () => void
  onSave: () => Promise<void>
}

export function CampaignDraftModal({ events, segments, draft, values, saving, onChange, onClose, onSave }: CampaignDraftModalProps) {
  function updateField<Key extends keyof CampaignDraftFormValues>(key: Key, value: CampaignDraftFormValues[Key]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <ModalShell size="2xl">
      <ModalHeader
        eyebrow="Campaigns"
        title={
          <>
            {draft ? 'Editar draft' : 'Novo draft'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Prepare campanhas comerciais com hierarquia mais clara entre audiencia, mensagem e agenda."
        onClose={onClose}
      />

      <ModalBody>
        <FormSection title="Configuração da campanha">
          <FormGrid>
            <FormField label="Nome">
              <input className="input" value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder="ex: Reengajamento no-show VIP" />
            </FormField>
            <FormField label="Canal">
              <select className="input" value={values.channel} onChange={(event) => updateField('channel', event.target.value as CampaignDraftFormValues['channel'])}>
                {Object.entries(CAMPAIGN_CHANNEL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Segmento">
              <select className="input" value={values.segment_id} onChange={(event) => updateField('segment_id', event.target.value)}>
                <option value="">Selecione</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Evento">
              <select className="input" value={values.event_id} onChange={(event) => updateField('event_id', event.target.value)}>
                <option value="">Opcional</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </FormField>
          </FormGrid>

          <FormField label="Agendamento">
            <input type="datetime-local" className="input" value={values.scheduled_at} onChange={(event) => updateField('scheduled_at', event.target.value)} />
          </FormField>
        </FormSection>

        <FormSection title="Mensagem">
          <FormField label="Assunto">
            <input className="input" value={values.subject} onChange={(event) => updateField('subject', event.target.value)} />
          </FormField>
          <FormField label="Mensagem">
            <textarea className="input min-h-36 resize-none" value={values.message_body} onChange={(event) => updateField('message_body', event.target.value)} />
          </FormField>
        </FormSection>
      </ModalBody>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button onClick={() => void onSave()} disabled={saving} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : 'Salvar draft'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
