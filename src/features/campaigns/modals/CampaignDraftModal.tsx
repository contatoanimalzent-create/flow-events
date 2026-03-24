import type { AudienceSegmentRow, CampaignDraftFormValues, CampaignDraftRow, CampaignEventOption } from '@/features/campaigns/types'
import { CAMPAIGN_CHANNEL_LABELS } from '@/features/campaigns/types'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-start justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="font-display text-2xl leading-none text-text-primary">
              {draft ? 'EDITAR DRAFT' : 'NOVO DRAFT'}<span className="text-brand-acid">.</span>
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Prepare campanhas comerciais em cima dos segmentos salvos.</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="input-label">Nome</label>
            <input className="input" value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder="ex: Reengajamento no-show VIP" />
          </div>
          <div>
            <label className="input-label">Segmento</label>
            <select className="input" value={values.segment_id} onChange={(event) => updateField('segment_id', event.target.value)}>
              <option value="">Selecione</option>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Evento</label>
            <select className="input" value={values.event_id} onChange={(event) => updateField('event_id', event.target.value)}>
              <option value="">Opcional</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Canal</label>
            <select className="input" value={values.channel} onChange={(event) => updateField('channel', event.target.value as CampaignDraftFormValues['channel'])}>
              {Object.entries(CAMPAIGN_CHANNEL_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Agendamento</label>
            <input type="datetime-local" className="input" value={values.scheduled_at} onChange={(event) => updateField('scheduled_at', event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Assunto</label>
            <input className="input" value={values.subject} onChange={(event) => updateField('subject', event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Mensagem</label>
            <textarea className="input min-h-32 resize-none" value={values.message_body} onChange={(event) => updateField('message_body', event.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={() => void onSave()} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Salvando...' : 'Salvar draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
