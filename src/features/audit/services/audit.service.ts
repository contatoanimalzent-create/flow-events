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
      return readAuditEntries(filters.organizationId).filter((entry) => {
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
      })
    }, { organizationId: filters.organizationId, userId: filters.userId ?? null, eventId: filters.eventId ?? null, entityType: filters.entityType ?? null })
  },
}
