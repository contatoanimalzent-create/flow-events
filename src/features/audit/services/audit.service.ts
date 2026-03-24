import type { AuditEntry, AuditFilters } from '@/features/audit/types/audit.types'

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
    const createdEntry: AuditEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
    }

    const entries = readAuditEntries(entry.organization_id)
    writeAuditEntries(entry.organization_id, [createdEntry, ...entries])
    return createdEntry
  },

  async list(filters: AuditFilters) {
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
  },
}
