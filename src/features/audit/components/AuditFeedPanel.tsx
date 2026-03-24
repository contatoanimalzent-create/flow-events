import { Activity } from 'lucide-react'
import { useAuditTrail } from '@/features/audit/hooks/useAuditTrail'
import type { AuditEntityType } from '@/features/audit/types/audit.types'
import { PaginationControls } from '@/shared/components'
import { formatDate } from '@/shared/lib'

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  event: 'Evento',
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
        <select className="input h-9 text-xs" value={audit.entityType} onChange={(event) => audit.setEntityType(event.target.value as AuditEntityType | 'all')}>
          <option value="all">Todos tipos</option>
          {Object.entries(ENTITY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select className="input h-9 text-xs" value={audit.userId} onChange={(event) => audit.setUserId(event.target.value)}>
          <option value="all">Todos usuarios</option>
          {audit.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <select className="input h-9 text-xs" value={audit.eventId} onChange={(event) => audit.setEventId(event.target.value)}>
          <option value="all">Todos eventos</option>
          {audit.events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.label}
            </option>
          ))}
        </select>
      </div>

      {audit.entries.length === 0 ? (
        <div className="rounded-sm border border-bg-border bg-bg-card p-4 text-center text-sm text-text-muted">Nenhuma atividade auditavel registrada ainda.</div>
      ) : (
        <div className="space-y-2">
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {audit.entries.map((entry) => (
              <div key={entry.id} className="rounded-sm border border-bg-border bg-bg-card p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Activity className="h-3.5 w-3.5 text-brand-acid" />
                    {entry.title}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{formatDate(entry.created_at, 'dd/MM HH:mm')}</span>
                </div>
                <div className="text-[11px] text-text-muted">
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
