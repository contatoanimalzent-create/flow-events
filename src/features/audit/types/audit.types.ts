export type AuditEntityType = 'event' | 'event_media_asset' | 'order' | 'payment' | 'ticket' | 'staff' | 'campaign' | 'financial'

export type AuditActionType = 'create' | 'update' | 'delete' | 'status_change' | 'execute' | 'issue'

export interface AuditEntry {
  id: string
  organization_id: string
  user_id?: string | null
  user_name?: string | null
  event_id?: string | null
  entity_type: AuditEntityType
  entity_id?: string | null
  action_type: AuditActionType
  title: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface AuditFilters {
  organizationId: string
  userId?: string | null
  eventId?: string | null
  entityType?: AuditEntityType | 'all'
}
