import type { AcknowledgeIntelligenceAlertInput, IntelligenceAlertStateRow } from '@/features/intelligence/types'

function nowIso() {
  return new Date().toISOString()
}

export function mapIntelligenceAlertStateRow(row: Record<string, unknown>): IntelligenceAlertStateRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    alert_id: String(row.alert_id ?? ''),
    status: (row.status as IntelligenceAlertStateRow['status']) ?? 'active',
    acknowledged_at: (row.acknowledged_at as string | null | undefined) ?? null,
    acknowledged_by: (row.acknowledged_by as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function buildAlertAcknowledgementPayload(input: AcknowledgeIntelligenceAlertInput) {
  return {
    organization_id: input.organizationId,
    event_id: input.eventId ?? null,
    alert_id: input.alertId,
    status: 'acknowledged' as const,
    acknowledged_at: new Date().toISOString(),
    acknowledged_by: input.acknowledgedBy ?? null,
    notes: input.notes?.trim() || null,
  }
}
