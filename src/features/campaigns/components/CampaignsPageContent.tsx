import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Plus, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useCampaignsDashboard, useCampaignsMutations } from '@/features/campaigns/hooks'
import { CampaignDraftModal, SegmentBuilderModal } from '@/features/campaigns/modals'
import type { AudienceSegmentFormValues, AudienceSegmentRow, CampaignDraftFormValues, CampaignDraftRow } from '@/features/campaigns/types'
import { cn } from '@/shared/lib'
import { AudiencePreviewCard } from './AudiencePreviewCard'
import { CampaignDraftsTable } from './CampaignDraftsTable'
import { CampaignsSummaryGrid } from './CampaignsSummaryGrid'
import { SegmentsTable } from './SegmentsTable'

function emptySegmentValues(): AudienceSegmentFormValues {
  return {
    name: '',
    description: '',
    purchased_event_id: '',
    attended_event_id: '',
    bought_not_attended_event_id: '',
    min_total_revenue: '',
    inactive_days: '',
    min_orders: '',
    city: '',
    state: '',
    tag: '',
    min_average_ticket: '',
    max_average_ticket: '',
  }
}

function valuesFromSegment(segment: AudienceSegmentRow): AudienceSegmentFormValues {
  const rules = segment.filter_definition
  return {
    name: segment.name,
    description: segment.description ?? '',
    purchased_event_id: rules.purchased_event_id ?? '',
    attended_event_id: rules.attended_event_id ?? '',
    bought_not_attended_event_id: rules.bought_not_attended_event_id ?? '',
    min_total_revenue: rules.min_total_revenue != null ? String(rules.min_total_revenue) : '',
    inactive_days: rules.inactive_days != null ? String(rules.inactive_days) : '',
    min_orders: rules.min_orders != null ? String(rules.min_orders) : '',
    city: rules.city ?? '',
    state: rules.state ?? '',
    tag: rules.tag ?? '',
    min_average_ticket: rules.min_average_ticket != null ? String(rules.min_average_ticket) : '',
    max_average_ticket: rules.max_average_ticket != null ? String(rules.max_average_ticket) : '',
  }
}

function emptyDraftValues(segmentId?: string): CampaignDraftFormValues {
  return {
    name: '',
    segment_id: segmentId ?? '',
    event_id: '',
    channel: 'email',
    subject: '',
    message_body: '',
    scheduled_at: '',
  }
}

function valuesFromDraft(draft: CampaignDraftRow): CampaignDraftFormValues {
  return {
    name: draft.name,
    segment_id: draft.segment_id ?? '',
    event_id: draft.event_id ?? '',
    channel: draft.channel,
    subject: draft.subject ?? '',
    message_body: draft.message_body ?? '',
    scheduled_at: draft.scheduled_at ? draft.scheduled_at.slice(0, 16) : '',
  }
}

export function CampaignsPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const profile = useAuthStore((state) => state.profile)
  const dashboard = useCampaignsDashboard(organization?.id)
  const mutations = useCampaignsMutations({ organizationId: organization?.id })
  const [showSegmentModal, setShowSegmentModal] = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [editingSegment, setEditingSegment] = useState<AudienceSegmentRow | null>(null)
  const [editingDraft, setEditingDraft] = useState<CampaignDraftRow | null>(null)
  const [segmentValues, setSegmentValues] = useState<AudienceSegmentFormValues>(emptySegmentValues())
  const [draftValues, setDraftValues] = useState<CampaignDraftFormValues>(emptyDraftValues())

  const selectedSegmentPreview = useMemo(() => {
    const segment = dashboard.overview?.segments.find((item) => item.id === dashboard.selectedSegmentId)
    if (!segment) {
      return null
    }

    return {
      audience_count: segment.audience_count,
      total_revenue: 0,
      average_ticket: 0,
      high_value_customers: 0,
      no_show_customers: 0,
      sample_customers: [],
    }
  }, [dashboard.overview?.segments, dashboard.selectedSegmentId])

  if (!organization) {
    return null
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="reveal flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            CAMPAIGNS<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">
            Segmentos, audiencia acionavel e campanhas draft conectadas ao CRM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          {dashboard.tab === 'segments' ? (
            <button
              onClick={() => {
                setEditingSegment(null)
                setSegmentValues(emptySegmentValues())
                setShowSegmentModal(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Novo segmento
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingDraft(null)
                setDraftValues(emptyDraftValues())
                setShowDraftModal(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Novo draft
            </button>
          )}
        </div>
      </div>

      <CampaignsSummaryGrid
        summary={dashboard.overview?.summary ?? { saved_segments: 0, draft_campaigns: 0, addressable_customers: 0, high_value_customers: 0 }}
      />

      <div className="reveal flex items-center gap-1 border-b border-bg-border">
        {([
          { key: 'segments', label: 'Segmentos' },
          { key: 'drafts', label: 'Campaign drafts' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => dashboard.setTab(tab.key)}
            className={cn(
              'border-b-2 -mb-px px-4 py-3 text-xs font-medium transition-all',
              dashboard.tab === tab.key ? 'border-brand-acid text-brand-acid' : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {dashboard.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : dashboard.error ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-status-error" />
          <div className="font-display text-2xl text-text-primary">ERRO AO CARREGAR CAMPAIGNS</div>
          <p className="mt-2 text-sm text-text-muted">{dashboard.error}</p>
        </div>
      ) : dashboard.tab === 'segments' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
          <SegmentsTable
            segments={dashboard.overview?.segments ?? []}
            onPreview={(segment) => {
              dashboard.setSelectedSegmentId(segment.id)
              setEditingSegment(segment)
              setSegmentValues(valuesFromSegment(segment))
              setShowSegmentModal(true)
            }}
            onEdit={(segment) => {
              setEditingSegment(segment)
              setSegmentValues(valuesFromSegment(segment))
              setShowSegmentModal(true)
            }}
            onCreateDraft={(segment) => {
              setEditingDraft(null)
              setDraftValues(emptyDraftValues(segment.id))
              setShowDraftModal(true)
            }}
            onDelete={(segment) => void mutations.deleteSegment(segment.id)}
          />
          <AudiencePreviewCard preview={selectedSegmentPreview} />
        </div>
      ) : (
        <CampaignDraftsTable
          drafts={dashboard.overview?.drafts ?? []}
          onEdit={(draft) => {
            setEditingDraft(draft)
            setDraftValues(valuesFromDraft(draft))
            setShowDraftModal(true)
          }}
          onDelete={(draft) => void mutations.deleteDraft(draft.id)}
        />
      )}

      {showSegmentModal ? (
        <SegmentBuilderModal
          organizationId={organization.id}
          events={dashboard.overview?.events ?? []}
          values={segmentValues}
          saving={mutations.savingSegment}
          segment={editingSegment}
          onChange={setSegmentValues}
          onClose={() => {
            setShowSegmentModal(false)
            setEditingSegment(null)
          }}
          onSave={async () => {
            const payload = {
              organizationId: organization.id,
              segmentId: editingSegment?.id,
              createdBy: profile?.id ?? null,
              values: segmentValues,
            }

            if (editingSegment) {
              await mutations.updateSegment(payload)
            } else {
              await mutations.createSegment(payload)
            }

            setShowSegmentModal(false)
            setEditingSegment(null)
          }}
        />
      ) : null}

      {showDraftModal ? (
        <CampaignDraftModal
          events={dashboard.overview?.events ?? []}
          segments={dashboard.overview?.segments ?? []}
          draft={editingDraft}
          values={draftValues}
          saving={mutations.savingDraft}
          onChange={setDraftValues}
          onClose={() => {
            setShowDraftModal(false)
            setEditingDraft(null)
          }}
          onSave={async () => {
            const payload = {
              organizationId: organization.id,
              draftId: editingDraft?.id,
              createdBy: profile?.id ?? null,
              values: draftValues,
            }

            if (editingDraft) {
              await mutations.updateDraft(payload)
            } else {
              await mutations.createDraft(payload)
            }

            setShowDraftModal(false)
            setEditingDraft(null)
          }}
        />
      ) : null}
    </div>
  )
}
