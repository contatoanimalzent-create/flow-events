import { supabase } from '@/lib/supabase'
import { financialService } from '@/features/financial/services'
import type { AcknowledgeIntelligenceAlertInput, IntelligenceAlertStateRow, IntelligenceOverview } from '@/features/intelligence/types'
import { buildIntelligenceOverview } from './intelligence.calculations'
import { assertIntelligenceResult, IntelligenceServiceError } from './intelligence.errors'
import { buildAlertAcknowledgementPayload, mapIntelligenceAlertStateRow } from './intelligence.payloads'

export const intelligenceService = {
  async getOverview(organizationId: string): Promise<IntelligenceOverview> {
    const eventsResult = await supabase
      .from('events')
      .select('id,name,starts_at,status,sold_tickets,checked_in_count')
      .eq('organization_id', organizationId)
      .in('status', ['published', 'ongoing', 'finished', 'archived'])
      .order('starts_at', { ascending: false })

    assertIntelligenceResult(eventsResult)

    const events = ((eventsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ''),
      starts_at: String(row.starts_at ?? ''),
      status: String(row.status ?? 'draft'),
      sold_tickets: Number(row.sold_tickets ?? 0),
      checked_in_count: Number(row.checked_in_count ?? 0),
    }))

    if (events.length === 0) {
      return {
        health_scores: [],
        alerts: [],
        recommendations: [],
        summary: {
          average_overall_health: 0,
          active_alerts_count: 0,
          acknowledged_alerts_count: 0,
          critical_alerts_count: 0,
          high_risk_events_count: 0,
        },
      }
    }

    const eventIds = events.map((event) => event.id)

    const [batchesResult, gatesResult, staffResult, checkinsResult, alertStatesResult, financialOverview] = await Promise.all([
      supabase.from('ticket_batches').select('id,event_id,name,quantity,sold_count,reserved_count,is_active').in('event_id', eventIds),
      supabase.from('gates').select('id,event_id,name,is_active,device_count,throughput_per_hour').in('event_id', eventIds),
      supabase.from('staff_members').select('id,event_id,gate_id,status,is_active').eq('organization_id', organizationId).in('event_id', eventIds),
      supabase.from('checkins').select('id,event_id,gate_id,result,checked_in_at,is_exit').in('event_id', eventIds).order('checked_in_at', { ascending: false }).limit(2000),
      supabase.from('intelligence_alert_states').select('*').eq('organization_id', organizationId),
      financialService.getFinancialOverview(organizationId),
    ])

    assertIntelligenceResult(batchesResult)
    assertIntelligenceResult(gatesResult)
    assertIntelligenceResult(staffResult)
    assertIntelligenceResult(checkinsResult)
    assertIntelligenceResult(alertStatesResult)

    return buildIntelligenceOverview({
      events,
      financialReports: financialOverview.reports,
      batches: ((batchesResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        event_id: String(row.event_id),
        name: String(row.name ?? ''),
        quantity: Number(row.quantity ?? 0),
        sold_count: Number(row.sold_count ?? 0),
        reserved_count: Number(row.reserved_count ?? 0),
        is_active: Boolean(row.is_active),
      })),
      gates: ((gatesResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        event_id: String(row.event_id),
        name: String(row.name ?? ''),
        is_active: Boolean(row.is_active),
        device_count: Number(row.device_count ?? 0),
        throughput_per_hour: Number(row.throughput_per_hour ?? 0),
      })),
      staff: ((staffResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        event_id: String(row.event_id ?? ''),
        gate_id: (row.gate_id as string | null | undefined) ?? null,
        status: String(row.status ?? ''),
        is_active: Boolean(row.is_active),
      })),
      checkins: ((checkinsResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
        id: String(row.id),
        event_id: String(row.event_id),
        gate_id: (row.gate_id as string | null | undefined) ?? null,
        result: String(row.result ?? ''),
        checked_in_at: String(row.checked_in_at ?? ''),
        is_exit: Boolean(row.is_exit),
      })),
      alertStates: ((alertStatesResult.data as Record<string, unknown>[] | null) ?? []).map(mapIntelligenceAlertStateRow),
    })
  },

  async listAlertStates(organizationId: string): Promise<IntelligenceAlertStateRow[]> {
    const result = await supabase.from('intelligence_alert_states').select('*').eq('organization_id', organizationId).order('updated_at', { ascending: false })
    assertIntelligenceResult(result)
    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapIntelligenceAlertStateRow)
  },

  async acknowledgeAlert(input: AcknowledgeIntelligenceAlertInput) {
    if (!input.alertId) {
      throw new IntelligenceServiceError('Alerta invalido para acknowledgement.', 'alert_acknowledgement_invalid')
    }

    const result = await supabase
      .from('intelligence_alert_states')
      .upsert(buildAlertAcknowledgementPayload(input), { onConflict: 'organization_id,alert_id' })
      .select('*')
      .single()

    assertIntelligenceResult(result)
    return result.data ? mapIntelligenceAlertStateRow(result.data as Record<string, unknown>) : null
  },
}
