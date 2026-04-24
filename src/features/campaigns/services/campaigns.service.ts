import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { crmService } from '@/features/crm/services'
import type {
  AudienceSegmentRow,
  CampaignAudiencePreview,
  CampaignDeliveryRow,
  CampaignDraftRow,
  CampaignEventOption,
  CampaignRunRow,
  CampaignsOverview,
  LaunchCampaignInput,
  UpsertAudienceSegmentInput,
  UpsertCampaignDraftInput,
} from '@/features/campaigns/types'
import { buildAudienceCustomers, buildCampaignsOverview, previewAudience, resolveAudienceCustomers } from './campaigns.calculations'
import { assertCampaignsResult, CampaignsServiceError } from './campaigns.errors'
import {
  buildAudienceResolutionJobPayload,
  buildCampaignDeliverySummary,
  buildCampaignRecipientPayload,
  buildCampaignRunInsertPayload,
  buildAudienceSegmentPayload,
  buildAudienceSegmentRules,
  buildCampaignDraftPayload,
  mapAudienceSegmentRow,
  mapCampaignDraftRow,
  mapCampaignRunRow,
} from './campaigns.payloads'
import { parseStringArray } from '@/features/crm/services/crm.payloads'
import { CAMPAIGN_SEND_BATCH_LIMIT } from '@/features/campaigns/types'

const campaignsApi = createApiClient('campaigns')

function isTableMissingError(message?: string) {
  const normalizedMessage = String(message ?? '').toLowerCase()
  return normalizedMessage.includes('does not exist') || normalizedMessage.includes('could not find the table')
}

async function ensureCrmSynced(organizationId: string) {
  return campaignsApi.query('ensure_crm_synced', async () => {
    await crmService.getOverview(organizationId)
  }, { organizationId })
}

function nowIso() {
  return new Date().toISOString()
}

async function listAudienceCustomers(organizationId: string) {
  return campaignsApi.query('list_audience_customers', async () => {
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
  }, { organizationId })
}

async function listSegmentsSafe(organizationId: string): Promise<AudienceSegmentRow[]> {
  return campaignsApi.query('list_segments_safe', async () => {
    const result = await supabase.from('audience_segments').select('*').eq('organization_id', organizationId).order('updated_at', { ascending: false })

    if (result.error) {
      if (isTableMissingError(result.error.message)) {
        return []
      }

      throw new CampaignsServiceError(result.error.message)
    }

    return ((result.data as Record<string, unknown>[] | null) ?? []).map(mapAudienceSegmentRow)
  }, { organizationId })
}

async function listDraftsSafe(organizationId: string): Promise<CampaignDraftRow[]> {
  return campaignsApi.query('list_drafts_safe', async () => {
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
  }, { organizationId })
}

async function getCampaignDraftById(draftId: string): Promise<CampaignDraftRow | null> {
  return campaignsApi.query('get_campaign_draft_by_id', async () => {
    const result = await supabase
      .from('campaign_drafts')
      .select('*, segment:audience_segments(id,name), event:events(id,name)')
      .eq('id', draftId)
      .single()

    if (result.error) {
      if ((result.error as { code?: string }).code === 'PGRST116') {
        return null
      }

      throw new CampaignsServiceError(result.error.message)
    }

    return result.data ? mapCampaignDraftRow(result.data as Record<string, unknown>) : null
  }, { draftId })
}

async function listRunsSafe(organizationId: string): Promise<CampaignRunRow[]> {
  return campaignsApi.query('list_runs_safe', async () => {
    const result = await supabase
      .from('campaign_runs')
      .select('*, draft:campaign_drafts(id,name), segment:audience_segments(id,name), event:events(id,name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (result.error) {
      if (isTableMissingError(result.error.message)) {
        return []
      }

      throw new CampaignsServiceError(result.error.message)
    }

    return ((result.data as Record<string, unknown>[] | null) ?? []).map((row) => mapCampaignRunRow(row))
  }, { organizationId })
}

export const campaignsService = {
  async listSegments(organizationId: string): Promise<AudienceSegmentRow[]> {
    return campaignsApi.query('list_segments', async () => listSegmentsSafe(organizationId), { organizationId })
  },

  async getSegmentById(segmentId: string): Promise<AudienceSegmentRow | null> {
    return campaignsApi.query('get_segment_by_id', async () => {
      const result = await supabase.from('audience_segments').select('*').eq('id', segmentId).single()

      if (result.error) {
        if ((result.error as { code?: string }).code === 'PGRST116') {
          return null
        }

        throw new CampaignsServiceError(result.error.message)
      }

      return result.data ? mapAudienceSegmentRow(result.data as Record<string, unknown>) : null
    }, { segmentId })
  },

  async previewSegmentAudience(organizationId: string, rules: AudienceSegmentRow['filter_definition']): Promise<CampaignAudiencePreview> {
    return campaignsApi.query('preview_segment_audience', async () => {
      const customers = await listAudienceCustomers(organizationId)
      return previewAudience(customers, rules)
    }, { organizationId })
  },

  async createSegment(input: UpsertAudienceSegmentInput) {
    return campaignsApi.mutation('create_segment', async () => {
      const preview = await this.previewSegmentAudience(input.organizationId, buildAudienceSegmentRules(input.values))
      const result = await supabase
        .from('audience_segments')
        .insert(buildAudienceSegmentPayload(input.values, input.organizationId, preview.audience_count, input.createdBy))
        .select('*')
        .single()

      assertCampaignsResult(result)
      return result.data ? mapAudienceSegmentRow(result.data as Record<string, unknown>) : null
    }, { organizationId: input.organizationId, createdBy: input.createdBy ?? null })
  },

  async updateSegment(input: UpsertAudienceSegmentInput) {
    return campaignsApi.mutation('update_segment', async () => {
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
    }, { organizationId: input.organizationId, segmentId: input.segmentId })
  },

  async deleteSegment(segmentId: string) {
    return campaignsApi.mutation('delete_segment', async () => {
      const result = await supabase.from('audience_segments').delete().eq('id', segmentId)
      assertCampaignsResult(result)
    }, { segmentId })
  },

  async listCampaignDrafts(organizationId: string): Promise<CampaignDraftRow[]> {
    return campaignsApi.query('list_campaign_drafts', async () => listDraftsSafe(organizationId), { organizationId })
  },

  async listCampaignRuns(organizationId: string): Promise<CampaignRunRow[]> {
    return campaignsApi.query('list_campaign_runs', async () => listRunsSafe(organizationId), { organizationId })
  },

  async createCampaignDraft(input: UpsertCampaignDraftInput) {
    return campaignsApi.mutation('create_campaign_draft', async () => {
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
    }, { organizationId: input.organizationId, createdBy: input.createdBy ?? null })
  },

  async updateCampaignDraft(input: UpsertCampaignDraftInput) {
    return campaignsApi.mutation('update_campaign_draft', async () => {
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
    }, { organizationId: input.organizationId, draftId: input.draftId })
  },

  async deleteCampaignDraft(draftId: string) {
    return campaignsApi.mutation('delete_campaign_draft', async () => {
      const result = await supabase.from('campaign_drafts').delete().eq('id', draftId)
      assertCampaignsResult(result)
    }, { draftId })
  },

  async launchCampaign(input: LaunchCampaignInput) {
    return campaignsApi.mutation('launch_campaign', async () => {
      const draft = await getCampaignDraftById(input.draftId)

      if (!draft || draft.organization_id !== input.organizationId) {
        throw new CampaignsServiceError('Draft invalido para lancamento', 'campaign_launch_invalid_draft')
      }

      const segment = draft.segment_id ? await this.getSegmentById(draft.segment_id) : null
      const rules = segment?.filter_definition ?? {}
      const audienceCustomers = await listAudienceCustomers(input.organizationId)
      const resolvedAudience = resolveAudienceCustomers(audienceCustomers, rules)
      const runResult = await supabase
        .from('campaign_runs')
        .insert(buildCampaignRunInsertPayload({ organizationId: input.organizationId, draft, launchedBy: input.launchedBy ?? null }))
        .select('*, draft:campaign_drafts(id,name), segment:audience_segments(id,name), event:events(id,name)')
        .single()

      assertCampaignsResult(runResult)

      if (!runResult.data) {
        throw new CampaignsServiceError('Não foi possível iniciar a execução da campanha', 'campaign_launch_failed')
      }

      const initialRun = mapCampaignRunRow(runResult.data as Record<string, unknown>)
      let resolutionJobId: string | null = null

      try {
        const jobResult = await supabase
          .from('audience_resolution_jobs')
          .insert(
            buildAudienceResolutionJobPayload({
              organizationId: input.organizationId,
              segmentId: draft.segment_id ?? null,
              campaignRunId: initialRun.id,
              draft,
            }),
          )
          .select('*')
          .single()

        assertCampaignsResult(jobResult)
        resolutionJobId = jobResult.data ? String((jobResult.data as Record<string, unknown>).id ?? '') : null

        const createdAt = nowIso()
        const recipientRows: CampaignDeliveryRow[] = resolvedAudience.map((customer, index) => {
          const payload = buildCampaignRecipientPayload({
            organizationId: input.organizationId,
            campaignRunId: initialRun.id,
            customer,
            draft,
          })

          return {
            id: `pending-${index}`,
            organization_id: input.organizationId,
            campaign_run_id: initialRun.id,
            customer_id: payload.customer_id ?? null,
            recipient_email: payload.recipient_email ?? null,
            recipient_phone: payload.recipient_phone ?? null,
            status: payload.status,
            error_message: payload.error_message ?? null,
            provider_message_id: null,
            payload_snapshot: (payload.payload_snapshot as Record<string, unknown> | null | undefined) ?? null,
            sent_at: null,
            delivered_at: null,
            failed_at: null,
            created_at: createdAt,
            updated_at: createdAt,
            customer: null,
          }
        })

        for (let index = 0; index < recipientRows.length; index += CAMPAIGN_SEND_BATCH_LIMIT) {
          const batch = recipientRows.slice(index, index + CAMPAIGN_SEND_BATCH_LIMIT).map(({ customer, ...row }) => row)
          const result = await supabase.from('campaign_run_recipients').insert(batch)
          assertCampaignsResult(result)
        }

        const summary = buildCampaignDeliverySummary(recipientRows, resolvedAudience.length)
        const completedAt = summary.pending_count > 0 ? null : nowIso()
        const runStatus: CampaignRunRow['status'] = summary.pending_count > 0 ? 'pending' : 'completed'

        if (resolutionJobId) {
          const resolutionUpdateResult = await supabase
            .from('audience_resolution_jobs')
            .update({
              status: 'completed',
              result_count: resolvedAudience.length,
              completed_at: nowIso(),
            })
            .eq('id', resolutionJobId)

          assertCampaignsResult(resolutionUpdateResult)
        }

        const updateResult = await supabase
          .from('campaign_runs')
          .update({
            status: runStatus,
            audience_count: resolvedAudience.length,
            sent_count: summary.sent_count,
            delivered_count: summary.delivered_count,
            failed_count: summary.failed_count,
            skipped_count: summary.skipped_count,
            completed_at: completedAt,
          })
          .eq('id', initialRun.id)
          .select('*, draft:campaign_drafts(id,name), segment:audience_segments(id,name), event:events(id,name)')
          .single()

        assertCampaignsResult(updateResult)

        return updateResult.data ? mapCampaignRunRow(updateResult.data as Record<string, unknown>, recipientRows) : initialRun
      } catch (error) {
        if (resolutionJobId) {
          const resolutionFailureResult = await supabase
            .from('audience_resolution_jobs')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Falha ao resolver audiencia',
              completed_at: nowIso(),
            })
            .eq('id', resolutionJobId)

          assertCampaignsResult(resolutionFailureResult)
        }

        const runFailureResult = await supabase
          .from('campaign_runs')
          .update({
            status: 'failed',
            completed_at: nowIso(),
          })
          .eq('id', initialRun.id)

        assertCampaignsResult(runFailureResult)
        throw error
      }
    }, { organizationId: input.organizationId, draftId: input.draftId, launchedBy: input.launchedBy ?? null })
  },

  async listEvents(organizationId: string): Promise<CampaignEventOption[]> {
    return campaignsApi.query('list_events', async () => {
      const result = await supabase.from('events').select('id,name,starts_at,status').eq('organization_id', organizationId).order('starts_at', { ascending: false })
      assertCampaignsResult(result)

      return filterExampleEvents(((result.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        starts_at: String(row.starts_at ?? ''),
        status: (row.status as string | null | undefined) ?? null,
      }))
    }, { organizationId })
  },

  async getOverview(organizationId: string): Promise<CampaignsOverview> {
    return campaignsApi.query('get_overview', async () => {
      const [events, segments, drafts, runs, audienceCustomers] = await Promise.all([
        this.listEvents(organizationId),
        listSegmentsSafe(organizationId),
        listDraftsSafe(organizationId),
        listRunsSafe(organizationId),
        listAudienceCustomers(organizationId),
      ])

      return buildCampaignsOverview({
        events,
        segments,
        drafts,
        runs,
        addressableCustomers: audienceCustomers.length,
        highValueCustomers: audienceCustomers.filter((customer) => customer.total_revenue >= 500).length,
      })
    }, { organizationId })
  },
}
