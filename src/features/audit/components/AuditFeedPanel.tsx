import { Activity } from 'lucide-react'
import { useAuditTrail } from '@/features/audit/hooks/useAuditTrail'
import type { AuditEntityType } from '@/features/audit/types/audit.types'
import { PaginationControls } from '@/shared/components'
import { SelectInput } from '@/shared/components/ui'
import { formatDate } from '@/shared/lib'

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  event: 'Evento',
  event_media_asset: 'Mídia do evento',
  order: 'Pedido',
  payment: 'Pagamento',
  ticket: 'Ingresso',
  staff: 'Staff',
  campaign: 'Campanha',
  financial: 'Financeiro',
}

export function AuditFeedPanel() {
  const audit = useAuditTrail()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <SelectInput
          value={audit.entityType}
          onChange={(v) => audit.setEntityType(v as AuditEntityType | 'all')}
          options={[
            { value: 'all', label: 'Todos tipos' },
            ...Object.entries(ENTITY_LABELS).map(([key, label]) => ({ value: key, label })),
          ]}
        />
        <SelectInput
          value={audit.userId}
          onChange={audit.setUserId}
          options={[
            { value: 'all', label: 'Todos usuários' },
            ...audit.users.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
        <SelectInput
          value={audit.eventId}
          onChange={audit.setEventId}
          options={[
            { value: 'all', label: 'Todos eventos' },
            ...audit.events.map((event) => ({ value: event.id, label: event.label })),
          ]}
        />
      </div>

      {audit.entries.length === 0 ? (
        <div className="rounded-2xl border border-bg-border bg-white/80 p-5 text-center text-sm text-text-muted">Nenhuma atividade auditável registrada ainda.</div>
      ) : (
        <div className="space-y-2">
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {audit.entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-bg-border bg-white/80 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Activity className="h-3.5 w-3.5 text-brand-acid" />
                    {entry.title}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted">{formatDate(entry.created_at, 'dd/MM HH:mm')}</span>
                </div>
                <div className="text-[12px] leading-6 text-text-muted">
                  {entry.description ?? `${ENTITY_LABELS[entry.entity_type]} - ${entry.action_type}`}
                  {entry.user_name ? ` - ${entry.user_name}` : ''}
                </div>
              </div>
            ))}
          </div>
          <PaginationControls pagination={audit.pagination} onPageChange={audit.setPage} compact />
        </div>
      )}
    </div>
  )
}
