import { supabase } from '@/lib/supabase'
import { crmService } from '@/features/crm/services'
import type {
  AudienceSegmentRow,
  CampaignAudiencePreview,
  CampaignDraftRow,
  CampaignEventOption,
  CampaignsOverview,
  UpsertAudienceSegmentInput,
  UpsertCampaignDraftInput,
} from '@/features/campaigns/types'
import { buildAudienceCustomers, buildCampaignsOverview, previewAudience } from './campaigns.calculations'
import { assertCampaignsResult, CampaignsServiceError } from './campaigns.errors'
import {
  buildAudienceSegmentPayload,
  buildAudienceSegmentRules,
  buildCampaignDraftPayload,
  mapAudienceSegmentRow,
  mapCampaignDraftRow,
} from './campaigns.payloads'
import { parseStringArray } from '@/features/crm/services/crm.payloads'

function isTableMissingError(message?: string) {
  const normalizedMessage = String(message ?? '').toLowerCase()
  return normalizedMessage.includes('does not exist') || normalizedMessage.includes('could not find the table')
}

async function ensureCrmSynced(organizationId: string) {
  await crmService.getOverview(organizationId)
}

async function listAudienceCustomers(organizationId: string) {
  await ensureCrmSynced(organizationId)

  const [customersResult, profilesResult] = await Promise.all([
    supabase.from('customers').select('*').eq('organization_id', organizationId),
    supabase.from('customer_event_profiles').select('*').eq('organization_id', organizationId),
  ])

  assertCampaignsResult(customersResult)
  assertCampaignsResult(profilesResult)

  return buildAudienceCustomers({
    customers: (((customersResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
      id: String(row.id),
      full_name: String(row.full_name ?? ''),
      email: String(row.email ?? ''),
      phone: (row.phone as string | null | undefined) ?? null,
      city: (row.city as string | null | undefined) ?? null,
      state: (row.state as string | null | undefined) ?? null,
      tags: parseStringArray(row.tags),
      total_orders: Number(row.total_orders ?? 0),
      total_spent: Number(row.total_spent ?? 0),
      last_order_at: (row.last_order_at as string | null | undefined) ?? null,
    })),
    profiles: (((profilesResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
      customer_id: String(row.customer_id ?? ''),
      event_id: String(row.event_id ?? ''),
      attended_count: Number(row.attended_count ?? 0),
      no_show_count: Number(row.no_show_count ?? 0),
      net_revenue: Number(row.net_revenue ?? 0),
    })),
  })
}

async function listSegmentsSafe(organizationId: string): Promise<AudienceSegmentRow[]> {
  const result = await supabase.from('audience_segments').select('*').eq('organization_id', organizationId).order('updated_at', { ascending: false })

  if (result.error) {
    if (isTableMissingError(result.error.message)) {
      return []
    }

    throw new CampaignsServiceError(result.error.message)
  }

  return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapAudienceSegmentRow)
}

async function listDraftsSafe(organizationId: string): Promise<CampaignDraftRow[]> {
  const result = await supabase
    .from('campaign_drafts')
    .select('*, segment:audience_segments(id,name), event:events(id,name)')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })

  if (result.error) {
    if (isTableMissingError(result.error.message)) {
      return []
    }

    throw new CampaignsServiceError(result.error.message)
  }

  return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapCampaignDraftRow)
}

export const campaignsService = {
  async listSegments(organizationId: string): Promise<AudienceSegmentRow[]> {
    return listSegmentsSafe(organizationId)
  },

  async getSegmentById(segmentId: string): Promise<AudienceSegmentRow | null> {
    const result = await supabase.from('audience_segments').select('*').eq('id', segmentId).single()

    if (result.error) {
      if ((result.error as { code?: string }).code === 'PGRST116') {
        return null
      }

      throw new CampaignsServiceError(result.error.message)
    }

    return result.data ? mapAudienceSegmentRow(result.data as Record<string, unknown>) : null
  },

  async previewSegmentAudience(organizationId: string, rules: AudienceSegmentRow['filter_definition']): Promise<CampaignAudiencePreview> {
    const customers = await listAudienceCustomers(organizationId)
    return previewAudience(customers, rules)
  },

  async createSegment(input: UpsertAudienceSegmentInput) {
    const preview = await this.previewSegmentAudience(input.organizationId, buildAudienceSegmentRules(input.values))
    const result = await supabase
      .from('audience_segments')
      .insert(buildAudienceSegmentPayload(input.values, input.organizationId, preview.audience_count, input.createdBy))
      .select('*')
      .single()

    assertCampaignsResult(result)
    return result.data ? mapAudienceSegmentRow(result.data as Record<string, unknown>) : null
  },

  async updateSegment(input: UpsertAudienceSegmentInput) {
    if (!input.segmentId) {
      throw new CampaignsServiceError('Segmento invalido para atualizacao', 'segment_update_invalid')
    }

    const preview = await this.previewSegmentAudience(input.organizationId, buildAudienceSegmentRules(input.values))
    const result = await supabase
      .from('audience_segments')
      .update(buildAudienceSegmentPayload(input.values, input.organizationId, preview.audience_count, input.createdBy))
      .eq('id', input.segmentId)
      .select('*')
      .single()

    assertCampaignsResult(result)
    return result.data ? mapAudienceSegmentRow(result.data as Record<string, unknown>) : null
  },

  async deleteSegment(segmentId: string) {
    const result = await supabase.from('audience_segments').delete().eq('id', segmentId)
    assertCampaignsResult(result)
  },

  async listCampaignDrafts(organizationId: string): Promise<CampaignDraftRow[]> {
    return listDraftsSafe(organizationId)
  },

  async createCampaignDraft(input: UpsertCampaignDraftInput) {
    const segment = input.values.segment_id ? await this.getSegmentById(input.values.segment_id) : null
    const rules = segment?.filter_definition ?? {}
    const preview = await this.previewSegmentAudience(input.organizationId, rules)
    const result = await supabase
      .from('campaign_drafts')
      .insert(buildCampaignDraftPayload(input.values, input.organizationId, preview.audience_count, input.createdBy))
      .select('*, segment:audience_segments(id,name), event:events(id,name)')
      .single()

    assertCampaignsResult(result)
    return result.data ? mapCampaignDraftRow(result.data as Record<string, unknown>) : null
  },

  async updateCampaignDraft(input: UpsertCampaignDraftInput) {
    if (!input.draftId) {
      throw new CampaignsServiceError('Draft invalido para atualizacao', 'campaign_draft_update_invalid')
    }

    const segment = input.values.segment_id ? await this.getSegmentById(input.values.segment_id) : null
    const rules = segment?.filter_definition ?? {}
    const preview = await this.previewSegmentAudience(input.organizationId, rules)
    const result = await supabase
      .from('campaign_drafts')
      .update(buildCampaignDraftPayload(input.values, input.organizationId, preview.audience_count, input.createdBy))
      .eq('id', input.draftId)
      .select('*, segment:audience_segments(id,name), event:events(id,name)')
      .single()

    assertCampaignsResult(result)
    return result.data ? mapCampaignDraftRow(result.data as Record<string, unknown>) : null
  },

  async deleteCampaignDraft(draftId: string) {
    const result = await supabase.from('campaign_drafts').delete().eq('id', draftId)
    assertCampaignsResult(result)
  },

  async listEvents(organizationId: string): Promise<CampaignEventOption[]> {
    const result = await supabase.from('events').select('id,name,starts_at,status').eq('organization_id', organizationId).order('starts_at', { ascending: false })
    assertCampaignsResult(result)

    return ((result.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ''),
      starts_at: String(row.starts_at ?? ''),
      status: (row.status as string | null | undefined) ?? null,
    }))
  },

  async getOverview(organizationId: string): Promise<CampaignsOverview> {
    const [events, segments, drafts, audienceCustomers] = await Promise.all([
      this.listEvents(organizationId),
      listSegmentsSafe(organizationId),
      listDraftsSafe(organizationId),
      listAudienceCustomers(organizationId),
    ])

    return buildCampaignsOverview({
      events,
      segments,
      drafts,
      addressableCustomers: audienceCustomers.length,
      highValueCustomers: audienceCustomers.filter((customer) => customer.total_revenue >= 500).length,
    })
  },
}
