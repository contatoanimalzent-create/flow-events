import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type { AuditEntry, AuditFilters } from '@/features/audit/types/audit.types'

const auditApi = createApiClient('audit')

function storageKey(organizationId: string) {
  return `animalz:audit:${organizationId}`
}

function readAuditEntries(organizationId: string): AuditEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey(organizationId))
    return raw ? (JSON.parse(raw) as AuditEntry[]) : []
  } catch {
    return []
  }
}

function writeAuditEntries(organizationId: string, entries: AuditEntry[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey(organizationId), JSON.stringify(entries.slice(0, 200)))
}

function mapAuditEntityType(entityType?: string | null): AuditEntry['entity_type'] {
  switch (entityType) {
    case 'event':
    case 'event_media_asset':
    case 'order':
    case 'payment':
    case 'ticket':
    case 'staff':
    case 'campaign':
    case 'financial':
      return entityType
    default:
      return 'event'
  }
}

function mapAuditAction(action?: string | null): AuditEntry['action_type'] {
  if (!action) {
    return 'update'
  }

  if (action.includes('create') || action.includes('issued') || action.includes('published')) {
    return 'create'
  }

  if (action.includes('delete')) {
    return 'delete'
  }

  if (action.includes('execute') || action.includes('launch')) {
    return 'execute'
  }

  if (action.includes('status')) {
    return 'status_change'
  }

  if (action.includes('issue')) {
    return 'issue'
  }

  return 'update'
}

function mapAuditLogRow(row: Record<string, unknown>): AuditEntry {
  const newData = (row.new_data as Record<string, unknown> | null | undefined) ?? null
  const metadata = (row.metadata as Record<string, unknown> | null | undefined) ?? null

  return {
    id: String(row.id ?? ''),
    organization_id: String(row.organization_id ?? ''),
    user_id: (row.user_id as string | null | undefined) ?? null,
    user_name: metadata?.user_name ? String(metadata.user_name) : null,
    event_id: (row.event_id as string | null | undefined) ?? null,
    entity_type: mapAuditEntityType((row.entity_type as string | null | undefined) ?? null),
    entity_id: (row.entity_id as string | null | undefined) ?? null,
    action_type: mapAuditAction((row.action as string | null | undefined) ?? null),
    title: newData?.title ? String(newData.title) : String((row.action as string | null | undefined) ?? 'Atividade registrada'),
    description: newData?.description ? String(newData.description) : null,
    metadata,
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

async function listPersistedAuditEntries(organizationId: string): Promise<AuditEntry[]> {
  const result = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (result.error) {
    return []
  }

  return (((result.data as Array<Record<string, unknown>> | null) ?? [])).map(mapAuditLogRow)
}

export const auditService = {
  async record(entry: Omit<AuditEntry, 'id' | 'created_at'>) {
    return auditApi.request('record_audit_entry', async () => {
      const createdEntry: AuditEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        created_at: new Date().toISOString(),
      }

      const entries = readAuditEntries(entry.organization_id)
      writeAuditEntries(entry.organization_id, [createdEntry, ...entries])
      return createdEntry
    }, { organizationId: entry.organization_id, entityType: entry.entity_type, entityId: entry.entity_id ?? null })
  },

  async list(filters: AuditFilters) {
    return auditApi.request('list_audit_entries', async () => {
      const persistedEntries = await listPersistedAuditEntries(filters.organizationId)
      const combinedEntries = [...persistedEntries, ...readAuditEntries(filters.organizationId)]
      const deduplicatedEntries = Array.from(new Map(combinedEntries.map((entry) => [entry.id, entry])).values())

      return deduplicatedEntries.filter((entry) => {
        if (filters.userId && entry.user_id !== filters.userId) {
          return false
        }

        if (filters.eventId && entry.event_id !== filters.eventId) {
          return false
        }

        if (filters.entityType && filters.entityType !== 'all' && entry.entity_type !== filters.entityType) {
          return false
        }

        return true
      }).sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    }, { organizationId: filters.organizationId, userId: filters.userId ?? null, eventId: filters.eventId ?? null, entityType: filters.entityType ?? null })
  },
}
