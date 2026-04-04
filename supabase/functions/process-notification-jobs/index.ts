import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotificationChannel = 'email' | 'whatsapp' | 'sms'
type JobStatus = 'queued' | 'processing' | 'done' | 'failed'

type JobType =
  | 'registration_confirmed'
  | 'registration_approved'
  | 'credential_ready'
  | 'shift_reminder'
  | 'event_reminder'
  | 'order_confirmed'
  | 'checkin_confirmed'
  | 'payment_failed'
  | 'custom'

interface Recipient {
  name: string
  email?: string
  phone?: string        // E.164 format for WhatsApp/SMS
  profile_id?: string
}

interface NotificationJob {
  id: string
  job_type: JobType
  channels: NotificationChannel[]
  recipients: Recipient[]
  template_vars: Record<string, string>
  status: JobStatus
  attempts: number
  max_attempts: number
  scheduled_for: string
  organization_id: string
  event_id?: string | null
  metadata?: Record<string, unknown> | null
  last_error?: string | null
  created_at: string
}

interface DispatchResult {
  jobId: string
  success: boolean
  channelResults: ChannelResult[]
  error?: string
}

interface ChannelResult {
  channel: NotificationChannel
  recipientIndex: number
  success: boolean
  error?: string
}

interface ProcessSummary {
  processed: number
  succeeded: number
  failed: number
  results: DispatchResult[]
}

// ---------------------------------------------------------------------------
// Template variable builders
// ---------------------------------------------------------------------------

/**
 * Merge job-level template_vars with per-recipient context (name).
 * Each job_type may require different vars — this normalizes them.
 */
function buildTemplateVars(
  jobType: JobType,
  jobVars: Record<string, string>,
  recipient: Recipient,
): Record<string, string> {
  const base: Record<string, string> = {
    name: recipient.name,
    ...jobVars,
  }

  switch (jobType) {
    case 'registration_confirmed':
      return {
        name:        base.name,
        event_name:  base.event_name  ?? '',
        event_date:  base.event_date  ?? '',
        ...base,
      }

    case 'registration_approved':
      return {
        name:           base.name,
        event_name:     base.event_name     ?? '',
        credential_url: base.credential_url ?? '',
        ...base,
      }

    case 'credential_ready':
      return {
        name:            base.name,
        event_name:      base.event_name      ?? '',
        qr_token:        base.qr_token        ?? '',
        credential_type: base.credential_type ?? '',
        ...base,
      }

    case 'shift_reminder':
      return {
        name:             base.name,
        shift_name:       base.shift_name       ?? '',
        shift_start_time: base.shift_start_time ?? '',
        location:         base.location         ?? '',
        ...base,
      }

    case 'event_reminder':
      return {
        name:       base.name,
        event_name: base.event_name ?? '',
        event_date: base.event_date ?? '',
        event_url:  base.event_url  ?? '',
        ...base,
      }

    case 'order_confirmed':
      return {
        name:         base.name,
        event_name:   base.event_name   ?? '',
        order_id:     base.order_id     ?? '',
        total_amount: base.total_amount ?? '',
        ...base,
      }

    case 'checkin_confirmed':
      return {
        name:       base.name,
        event_name: base.event_name ?? '',
        gate_name:  base.gate_name  ?? '',
        checked_at: base.checked_at ?? '',
        ...base,
      }

    case 'payment_failed':
      return {
        name:         base.name,
        event_name:   base.event_name   ?? '',
        order_id:     base.order_id     ?? '',
        failure_reason: base.failure_reason ?? '',
        ...base,
      }

    case 'custom':
    default:
      return base
  }
}

// ---------------------------------------------------------------------------
// Channel dispatchers
// ---------------------------------------------------------------------------

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const internalServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

/** POST to an internal Edge Function using the service-role key */
async function callInternalFunction(
  fnPath: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; body: unknown }> {
  const url = `${supabaseUrl}/functions/v1/${fnPath}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${internalServiceKey}`,
      apikey: internalServiceKey,
    },
    body: JSON.stringify(payload),
  })

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = { raw: await res.text() }
  }

  return { ok: res.ok, body }
}

async function dispatchEmail(
  job: NotificationJob,
  recipient: Recipient,
  templateVars: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  if (!recipient.email) {
    return { success: false, error: 'recipient has no email address' }
  }

  try {
    const { ok, body } = await callInternalFunction('send-transactional-email', {
      job_id:        job.id,
      job_type:      job.job_type,
      organization_id: job.organization_id,
      event_id:      job.event_id,
      to:            recipient.email,
      recipient_name: recipient.name,
      template_key:  job.job_type,
      template_vars: templateVars,
    })

    if (!ok) {
      const errMsg = typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : 'send-transactional-email returned non-200'
      return { success: false, error: errMsg }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'unknown email dispatch error',
    }
  }
}

async function dispatchWhatsApp(
  job: NotificationJob,
  recipient: Recipient,
  templateVars: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  if (!recipient.phone) {
    return { success: false, error: 'recipient has no phone number' }
  }

  try {
    const { ok, body } = await callInternalFunction('send-whatsapp', {
      to:              recipient.phone,
      template_slug:   job.job_type,
      template_vars:   templateVars,
      organization_id: job.organization_id,
      event_id:        job.event_id,
      profile_id:      recipient.profile_id,
    })

    if (!ok) {
      const errMsg = typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : 'send-whatsapp returned non-200'
      return { success: false, error: errMsg }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'unknown whatsapp dispatch error',
    }
  }
}

// ---------------------------------------------------------------------------
// Per-job processor
// ---------------------------------------------------------------------------

async function processJob(job: NotificationJob): Promise<DispatchResult> {
  const channelResults: ChannelResult[] = []

  for (let ri = 0; ri < job.recipients.length; ri++) {
    const recipient = job.recipients[ri]
    const vars = buildTemplateVars(job.job_type, job.template_vars, recipient)

    for (const channel of job.channels) {
      let result: { success: boolean; error?: string }

      if (channel === 'email') {
        result = await dispatchEmail(job, recipient, vars)
      } else if (channel === 'whatsapp') {
        result = await dispatchWhatsApp(job, recipient, vars)
      } else {
        // Unsupported channel — skip gracefully
        result = { success: false, error: `unsupported channel: ${channel}` }
      }

      channelResults.push({
        channel,
        recipientIndex: ri,
        success: result.success,
        error: result.error,
      })
    }
  }

  const allSucceeded = channelResults.every((r) => r.success)
  const anySucceeded = channelResults.some((r) => r.success)

  return {
    jobId: job.id,
    success: allSucceeded || (channelResults.length > 0 && anySucceeded),
    channelResults,
    error: allSucceeded
      ? undefined
      : channelResults
          .filter((r) => !r.success)
          .map((r) => `[${r.channel} recipient#${r.recipientIndex}] ${r.error ?? 'unknown'}`)
          .join('; '),
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST (from cron webhook) or GET (manual trigger)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: corsHeaders },
    )
  }

  const supabase = createSupabaseAdminClient()
  const now = new Date().toISOString()

  const summary: ProcessSummary = {
    processed: 0,
    succeeded: 0,
    failed:    0,
    results:   [],
  }

  try {
    // 1. Fetch a batch of queued jobs that are due.
    //    Supabase JS v2 does not expose a direct column-vs-column filter,
    //    so we over-fetch (status=queued, scheduled_for <= now, limit 50)
    //    and filter attempts < max_attempts in JS.
    const { data: rawJobs, error: jobsErr } = await supabase
      .from('notification_jobs')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(50)

    if (jobsErr) {
      console.error('[process-notification-jobs] fetch error', jobsErr)
      return Response.json(
        { error: jobsErr.message, ...summary },
        { status: 500, headers: corsHeaders },
      )
    }

    // Keep only jobs that haven't exhausted retries; cap batch at 10
    const eligibleJobs = ((rawJobs ?? []) as NotificationJob[])
      .filter((j) => j.attempts < j.max_attempts)
      .slice(0, 10)

    if (eligibleJobs.length === 0) {
      return Response.json({ message: 'No jobs to process', ...summary }, { headers: corsHeaders })
    }

    // 2. Process each job
    for (const job of eligibleJobs) {
      summary.processed++

      // Mark as processing + increment attempts
      const { error: updateErr } = await supabase
        .from('notification_jobs')
        .update({
          status:        'processing' as JobStatus,
          attempts:      job.attempts + 1,
          updated_at:    new Date().toISOString(),
        })
        .eq('id', job.id)
        .eq('status', 'queued')  // optimistic lock — only update if still queued

      if (updateErr) {
        // Another worker may have picked this up — skip
        console.warn(`[process-notification-jobs] skip job ${job.id}: ${updateErr.message}`)
        summary.processed--
        continue
      }

      let dispatchResult: DispatchResult

      try {
        dispatchResult = await processJob(job)
      } catch (err: unknown) {
        dispatchResult = {
          jobId: job.id,
          success: false,
          channelResults: [],
          error: err instanceof Error ? err.message : 'unhandled exception in processJob',
        }
      }

      summary.results.push(dispatchResult)

      const newAttempts = job.attempts + 1
      const exhausted   = newAttempts >= job.max_attempts

      if (dispatchResult.success) {
        // Mark done
        await supabase
          .from('notification_jobs')
          .update({
            status:     'done' as JobStatus,
            updated_at: new Date().toISOString(),
            last_error: null,
          })
          .eq('id', job.id)

        summary.succeeded++
      } else {
        // Failed — requeue for retry or mark as failed if exhausted
        await supabase
          .from('notification_jobs')
          .update({
            status:     (exhausted ? 'failed' : 'queued') as JobStatus,
            last_error: dispatchResult.error ?? 'unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)

        summary.failed++

        console.error(
          `[process-notification-jobs] job ${job.id} failed (attempt ${newAttempts}/${job.max_attempts}): ${dispatchResult.error}`,
        )
      }
    }

    return Response.json(
      {
        ok:        true,
        processed: summary.processed,
        succeeded: summary.succeeded,
        failed:    summary.failed,
        results:   summary.results,
      },
      { headers: corsHeaders },
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[process-notification-jobs] fatal error', err)
    return Response.json(
      { error: msg, ...summary },
      { status: 500, headers: corsHeaders },
    )
  }
})
