import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { buildDemoSeedData, demoSeedConstants } from './seed-factory.ts'

const DEMO_SEED_KEY = Deno.env.get('DEMO_SEED_KEY')

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders })
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function ensureAuthorized(request: Request) {
  if (!DEMO_SEED_KEY) {
    throw new Error('DEMO_SEED_KEY is not configured')
  }

  const providedKey = request.headers.get('x-demo-seed-key') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (providedKey !== DEMO_SEED_KEY) {
    const error = new Error('Invalid demo seed credentials')
    ;(error as Error & { status?: number }).status = 401
    throw error
  }
}

async function upsertRows(client: SupabaseAdminClient, table: string, rows: Record<string, unknown>[], chunkSize = 500) {
  for (const batch of chunk(rows, chunkSize)) {
    if (batch.length === 0) {
      continue
    }

    const result = await client.from(table).upsert(batch, { onConflict: 'id' })
    if (result.error) {
      throw new Error(`[${table}] ${result.error.message}`)
    }
  }
}

async function updateAttachedProfile(client: SupabaseAdminClient, profileId: string | null | undefined) {
  if (!profileId) {
    return
  }

  const result = await client
    .from('profiles')
    .update({ organization_id: demoSeedConstants.organizationId })
    .eq('id', profileId)

  if (result.error) {
    throw new Error(`[profiles] ${result.error.message}`)
  }
}

async function resetDemoData(client: SupabaseAdminClient) {
  const tablesByEvent = [
    'event_assets',
    'campaign_run_recipients',
    'audience_resolution_jobs',
    'campaign_runs',
    'campaign_drafts',
    'audience_segments',
    'campaigns',
    'customer_event_profiles',
    'intelligence_alert_states',
    'recommendation_logs',
    'operational_alerts',
    'event_health_snapshots',
    'event_financial_closures',
    'financial_forecasts',
    'event_payouts',
    'cost_entries',
    'suppliers',
    'products',
    'time_entries',
    'staff_members',
    'checkins',
    'digital_tickets',
    'transactional_messages',
    'payments',
    'order_items',
    'orders',
    'ticket_batches',
    'ticket_types',
    'gates',
    'audit_logs',
    'internal_notifications',
    'executive_dashboard_snapshots',
  ]

  for (const table of tablesByEvent) {
    const eventScopedResult = await client.from(table).delete().eq('event_id', demoSeedConstants.eventId)
    if (eventScopedResult.error && !eventScopedResult.error.message.toLowerCase().includes('column')) {
      throw new Error(`[${table}] ${eventScopedResult.error.message}`)
    }

    const organizationScopedResult = await client.from(table).delete().eq('organization_id', demoSeedConstants.organizationId)
    if (organizationScopedResult.error && !organizationScopedResult.error.message.toLowerCase().includes('column')) {
      throw new Error(`[${table}] ${organizationScopedResult.error.message}`)
    }
  }

  const deleteEventResult = await client.from('events').delete().eq('id', demoSeedConstants.eventId)
  if (deleteEventResult.error) {
    throw new Error(`[events] ${deleteEventResult.error.message}`)
  }

  const deleteOrganizationResult = await client.from('organizations').delete().eq('id', demoSeedConstants.organizationId)
  if (deleteOrganizationResult.error) {
    throw new Error(`[organizations] ${deleteOrganizationResult.error.message}`)
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    ensureAuthorized(request)

    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {}
    const reset = Boolean((body as { reset?: boolean }).reset)
    const attachProfileId = (body as { attachProfileId?: string | null }).attachProfileId ?? null
    const client = createSupabaseAdminClient()

    if (reset) {
      await resetDemoData(client)
    }

    const data = buildDemoSeedData({ attachProfileId })

    await upsertRows(client, 'organizations', [data.organization])
    await upsertRows(client, 'events', [data.event])
    await upsertRows(client, 'gates', data.gates)
    await upsertRows(client, 'ticket_types', data.ticketTypes)
    await upsertRows(client, 'ticket_batches', data.ticketBatches)
    await upsertRows(client, 'orders', data.orders)
    await upsertRows(client, 'order_items', data.orderItems)
    await upsertRows(client, 'payments', data.payments)
    await upsertRows(client, 'transactional_messages', data.transactionalMessages)
    await upsertRows(client, 'digital_tickets', data.digitalTickets)
    await upsertRows(client, 'checkins', data.checkins)
    await upsertRows(client, 'staff_members', data.staffMembers)
    await upsertRows(client, 'time_entries', data.timeEntries)
    await upsertRows(client, 'suppliers', data.suppliers)
    await upsertRows(client, 'products', data.products)
    await upsertRows(client, 'cost_entries', data.costEntries)
    await upsertRows(client, 'event_payouts', data.eventPayouts)
    await upsertRows(client, 'financial_forecasts', data.financialForecasts)
    await upsertRows(client, 'event_financial_closures', data.eventFinancialClosures)
    await upsertRows(client, 'event_health_snapshots', data.eventHealthSnapshots)
    await upsertRows(client, 'operational_alerts', data.operationalAlerts)
    await upsertRows(client, 'recommendation_logs', data.recommendationLogs)
    await upsertRows(client, 'intelligence_alert_states', data.intelligenceAlertStates)
    await upsertRows(client, 'customers', data.customers)
    await upsertRows(client, 'customer_event_profiles', data.customerEventProfiles)
    await upsertRows(client, 'audience_segments', data.audienceSegments)
    await upsertRows(client, 'campaign_drafts', data.campaignDrafts)
    await upsertRows(client, 'campaign_runs', data.campaignRuns)
    await upsertRows(client, 'campaign_run_recipients', data.campaignRunRecipients)
    await upsertRows(client, 'audience_resolution_jobs', data.audienceResolutionJobs)
    await upsertRows(client, 'campaigns', data.campaigns)
    await upsertRows(client, 'event_assets', data.eventAssets)
    await upsertRows(client, 'audit_logs', data.auditLogs)
    await upsertRows(client, 'internal_notifications', data.internalNotifications)
    await upsertRows(client, 'executive_dashboard_snapshots', data.executiveDashboardSnapshots)

    await updateAttachedProfile(client, attachProfileId)

    return json({
      success: true,
      reset,
      attachProfileId,
      summary: data.summary,
    })
  } catch (error) {
    const status = error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : 500
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected demo seed error',
      },
      status,
    )
  }
})
