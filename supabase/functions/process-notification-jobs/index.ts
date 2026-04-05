import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type JobStatus  = 'pending' | 'running' | 'completed' | 'failed'
type Channel    = 'email' | 'whatsapp'
type CommStatus = 'sent' | 'failed'

interface NotificationJob {
  id:                  string
  organization_id:     string
  template_key:        string
  audience_segment_id: string | null
  channel:             Channel
  event_id:            string | null
  variables:           Record<string, string | number | boolean>
  scheduled_at:        string
  status:              JobStatus
  processed_count:     number
  failed_count:        number
}

interface AudienceSegment {
  id:                string
  organization_id:   string
  name:              string
  filter_definition: FilterDefinition
}

/**
 * filter_definition JSONB shapes:
 *
 *   staff_members source:
 *     { "source": "staff_members",
 *       "filters": { "event_id"?: string, "status"?: string,
 *                    "is_active"?: boolean, "role_title"?: string } }
 *
 *   manual source:
 *     { "source": "manual", "emails"?: string[], "phones"?: string[] }
 */
interface FilterDefinition {
  source:   'staff_members' | 'manual'
  filters?: {
    event_id?:   string
    status?:     string
    is_active?:  boolean
    role_title?: string
  }
  emails?:  string[]
  phones?:  string[]
}

interface Contact {
  email?: string | null
  phone?: string | null
  name?:  string | null
}

interface EmailTemplate {
  id:      string
  key:     string
  subject: string
  html:    string
  text?:   string | null
}

interface WhatsappTemplate {
  id:   string
  key:  string
  body: string
}

interface SendResult {
  contact:    Contact
  status:     CommStatus
  message_id: string | null
  error?:     string
}

interface Env {
  resendApiKey:     string
  resendFrom:       string
  twilioAccountSid: string
  twilioAuthToken:  string
  twilioWaNumber:   string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function interpolate(tmpl: string, vars: Record<string, string | number | boolean>): string {
  return tmpl.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

function normalizePhone(raw: string): string {
  let p = raw.trim()
  if (p.startsWith('whatsapp:')) p = p.slice(9)
  if (!p.startsWith('+')) p = '+' + p
  return p
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider: Resend (email)
// ─────────────────────────────────────────────────────────────────────────────

async function sendEmail(params: {
  to: string; subject: string; html: string; text?: string | null; from: string; apiKey: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + params.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: params.from, to: [params.to],
        subject: params.subject, html: params.html,
        ...(params.text ? { text: params.text } : {}),
      }),
    })
    if (!res.ok) {
      const b = await res.text()
      return { ok: false, id: null, error: 'Resend HTTP ' + res.status + ': ' + b }
    }
    const d = (await res.json()) as { id?: string }
    return { ok: true, id: d.id ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider: Twilio (WhatsApp)
// ─────────────────────────────────────────────────────────────────────────────

async function sendWhatsApp(params: {
  to: string; body: string; accountSid: string; authToken: string; fromNumber: string
}): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  try {
    const url  = 'https://api.twilio.com/2010-04-01/Accounts/' + params.accountSid + '/Messages.json'
    const form = new URLSearchParams({
      From: 'whatsapp:' + normalizePhone(params.fromNumber),
      To:   'whatsapp:' + normalizePhone(params.to),
      Body: params.body,
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  'Basic ' + btoa(params.accountSid + ':' + params.authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    const d = (await res.json()) as { sid?: string; error_message?: string }
    if (!res.ok) {
      return { ok: false, id: null, error: 'Twilio HTTP ' + res.status + ': ' + (d.error_message ?? JSON.stringify(d)) }
    }
    return { ok: true, id: d.sid ?? null, error: null }
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience resolver
// ─────────────────────────────────────────────────────────────────────────────

async function resolveAudience(
  admin:   ReturnType<typeof createSupabaseAdminClient>,
  segment: AudienceSegment,
  job:     NotificationJob,
): Promise<Contact[]> {
  const fd = segment.filter_definition

  if (fd.source === 'manual') {
    const contacts: Contact[] = []
    for (const email of fd.emails ?? []) contacts.push({ email, phone: null, name: null })
    for (const phone of fd.phones ?? []) contacts.push({ email: null, phone, name: null })
    return contacts
  }

  if (fd.source === 'staff_members') {
    const filters = fd.filters ?? {}
    // Build query step by step to avoid TypeScript generic complaints
    const baseQ = admin
      .from('staff_members')
      .select('first_name, last_name, email, phone')
      .eq('organization_id', job.organization_id)

    const eventId = filters.event_id ?? job.event_id
    const q1 = eventId ? baseQ.eq('event_id', eventId) : baseQ
    const q2 = filters.status     ? q1.eq('status', filters.status) : q1
    const q3 = filters.is_active !== undefined ? q2.eq('is_active', filters.is_active) : q2
    const q4 = filters.role_title ? q3.eq('role_title', filters.role_title) : q3

    const { data, error } = await q4
    if (error) {
      console.error('[process-notification-jobs] resolveAudience error:', error)
      return []
    }
    return (data ?? []).map((sm: { first_name: string; last_name?: string | null; email?: string | null; phone?: string | null }) => ({
      name:  ([sm.first_name, sm.last_name].filter(Boolean).join(' ')) || null,
      email: sm.email ?? null,
      phone: sm.phone ?? null,
    }))
  }

  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// Send to one contact, with idempotency guard
// ─────────────────────────────────────────────────────────────────────────────

async function sendToContact(
  admin:        ReturnType<typeof createSupabaseAdminClient>,
  job:          NotificationJob,
  contact:      Contact,
  emailTmpl:    EmailTemplate | null,
  whatsappTmpl: WhatsappTemplate | null,
  env:          Env,
  nowIso:       string,
): Promise<SendResult> {
  const recipient = job.channel === 'email' ? contact.email! : contact.phone!

  // ── Idempotency: already sent this job+recipient combination? ─────────────
  const { data: existing } = await admin
    .from('communications_log')
    .select('id')
    .eq('notification_job_id', job.id)
    .eq('recipient', recipient)
    .eq('status', 'sent')
    .maybeSingle()

  if (existing) {
    return { contact, status: 'sent', message_id: null }
  }

  // ── Merge variables: job.variables + per-contact name ────────────────────
  const vars: Record<string, string | number | boolean> = {
    name:       contact.name ?? '',
    first_name: contact.name?.split(' ')[0] ?? '',
    ...job.variables,
  }

  let ok           = false
  let messageId:   string | null = null
  let errorMsg:    string | null = null
  let bodyPreview: string | null = null
  let subject:     string | null = null

  if (job.channel === 'email' && emailTmpl) {
    const rs = interpolate(emailTmpl.subject, vars)
    const rh = interpolate(emailTmpl.html, vars)
    const rt = emailTmpl.text ? interpolate(emailTmpl.text, vars) : null
    subject     = rs
    bodyPreview = rh.replace(/<[^>]+>/g, '').slice(0, 500)
    const r = await sendEmail({ to: recipient, subject: rs, html: rh, text: rt, from: env.resendFrom, apiKey: env.resendApiKey })
    ok = r.ok; messageId = r.id; errorMsg = r.error
  }

  if (job.channel === 'whatsapp' && whatsappTmpl) {
    const rb = interpolate(whatsappTmpl.body, vars)
    bodyPreview = rb.slice(0, 500)
    const r = await sendWhatsApp({ to: recipient, body: rb, accountSid: env.twilioAccountSid, authToken: env.twilioAuthToken, fromNumber: env.twilioWaNumber })
    ok = r.ok; messageId = r.id; errorMsg = r.error
  }

  const commStatus: CommStatus = ok ? 'sent' : 'failed'

  await admin.from('communications_log').insert({
    organization_id:     job.organization_id,
    notification_job_id: job.id,
    template_key:        job.template_key,
    channel:             job.channel,
    recipient,
    recipient_email:     job.channel === 'email'    ? recipient : null,
    recipient_phone:     job.channel === 'whatsapp' ? recipient : null,
    subject,
    body_preview:        bodyPreview,
    message_sid:         messageId,
    status:              commStatus,
    error_message:       errorMsg,
    sent_at:             ok ? nowIso : null,
    metadata: {
      contact_name: contact.name,
      job_id:       job.id,
      template_key: job.template_key,
      variables:    vars,
    },
  })

  return { contact, status: commStatus, message_id: messageId, error: errorMsg ?? undefined }
}

// ─────────────────────────────────────────────────────────────────────────────
// Process one job end-to-end
// ─────────────────────────────────────────────────────────────────────────────

async function processJob(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  job:   NotificationJob,
  env:   Env,
): Promise<{ processed: number; failed: number; error?: string }> {
  const nowIso = new Date().toISOString()

  // Atomic claim — UPDATE WHERE status='pending' prevents concurrent double-claim
  const { data: claimed } = await admin
    .from('notification_jobs')
    .update({ status: 'running' as JobStatus, started_at: nowIso })
    .eq('id', job.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (!claimed) {
    console.warn('[process-notification-jobs] Job ' + job.id + ' already claimed — skipping')
    return { processed: 0, failed: 0 }
  }

  // Fetch template
  let emailTmpl:    EmailTemplate | null    = null
  let whatsappTmpl: WhatsappTemplate | null = null

  if (job.channel === 'email') {
    const { data } = await admin
      .from('email_templates')
      .select('id, key, subject, html, text')
      .eq('organization_id', job.organization_id)
      .eq('key', job.template_key)
      .maybeSingle()
    emailTmpl = data as EmailTemplate | null
  } else {
    const { data } = await admin
      .from('whatsapp_templates')
      .select('id, key, body')
      .eq('organization_id', job.organization_id)
      .eq('key', job.template_key)
      .maybeSingle()
    whatsappTmpl = data as WhatsappTemplate | null
  }

  if (!emailTmpl && !whatsappTmpl) {
    const msg = 'Template "' + job.template_key + '" not found for channel "' + job.channel + '"'
    await admin.from('notification_jobs').update({
      status: 'failed' as JobStatus, completed_at: nowIso, error_message: msg,
    }).eq('id', job.id)
    return { processed: 0, failed: 0, error: msg }
  }

  // Resolve audience
  let contacts: Contact[] = []

  if (job.audience_segment_id) {
    const { data: segment } = await admin
      .from('audience_segments')
      .select('id, organization_id, name, filter_definition')
      .eq('id', job.audience_segment_id)
      .maybeSingle()

    if (segment) {
      contacts = await resolveAudience(admin, segment as AudienceSegment, job)
    }
  }

  if (contacts.length === 0) {
    const msg = job.audience_segment_id
      ? 'Segment ' + job.audience_segment_id + ' resolved to 0 contacts'
      : 'No audience_segment_id on job'
    await admin.from('notification_jobs').update({
      status: 'completed' as JobStatus, completed_at: nowIso,
      error_message: msg, processed_count: 0,
    }).eq('id', job.id)
    return { processed: 0, failed: 0 }
  }

  // Filter by channel capability
  const eligible = contacts.filter((c) =>
    job.channel === 'email' ? !!c.email : !!c.phone,
  )

  console.info('[process-notification-jobs] Job ' + job.id + ': ' + eligible.length + ' eligible (' + job.channel + ')')

  // Send in batches of 10
  const BATCH = 10
  let processed = 0
  let failed    = 0

  for (let i = 0; i < eligible.length; i += BATCH) {
    const batch   = eligible.slice(i, i + BATCH)
    const settled = await Promise.allSettled(
      batch.map((c) => sendToContact(admin, job, c, emailTmpl, whatsappTmpl, env, nowIso)),
    )
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        if (r.value.status === 'sent') processed++
        else failed++
      } else {
        failed++
        console.error('[process-notification-jobs] sendToContact threw:', r.reason)
      }
    }
  }

  const finalStatus: JobStatus = failed > 0 && processed === 0 ? 'failed' : 'completed'
  await admin.from('notification_jobs').update({
    status:          finalStatus,
    completed_at:    nowIso,
    processed_count: processed,
    failed_count:    failed,
    error_message:   failed > 0 ? (failed + '/' + (processed + failed) + ' sends failed') : null,
  }).eq('id', job.id)

  return { processed, failed }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset jobs stuck in 'running' > 10 minutes (e.g. function crash)
// ─────────────────────────────────────────────────────────────────────────────

async function resetStuckJobs(admin: ReturnType<typeof createSupabaseAdminClient>): Promise<number> {
  const stuckBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data } = await admin
    .from('notification_jobs')
    .update({ status: 'pending' as JobStatus, started_at: null })
    .eq('status', 'running')
    .lt('started_at', stuckBefore)
    .select('id')
  return data?.length ?? 0
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405)
  }

  // Auth: x-cron-secret header (enforced only when CRON_SECRET env var is set)
  const CRON_SECRET = Deno.env.get('CRON_SECRET')
  if (CRON_SECRET) {
    const incoming = req.headers.get('x-cron-secret') ?? ''
    if (incoming !== CRON_SECRET) {
      return jsonResponse({ error: 'Unauthorized.' }, 401)
    }
  }

  const env: Env = {
    resendApiKey:     Deno.env.get('RESEND_API_KEY')        ?? '',
    resendFrom:       Deno.env.get('RESEND_FROM_EMAIL')     ?? 'no-reply@flow.events',
    twilioAccountSid: Deno.env.get('TWILIO_ACCOUNT_SID')    ?? '',
    twilioAuthToken:  Deno.env.get('TWILIO_AUTH_TOKEN')     ?? '',
    twilioWaNumber:   Deno.env.get('TWILIO_WHATSAPP_NUMBER') ?? '',
  }

  const admin  = createSupabaseAdminClient()
  const nowIso = new Date().toISOString()

  // 0. Reset stuck jobs
  const resetCount = await resetStuckJobs(admin)
  if (resetCount > 0) console.info('[process-notification-jobs] Reset ' + resetCount + ' stuck jobs')

  // 1. Fetch pending jobs with scheduled_at <= now
  const { data: pendingJobs, error: fetchError } = await admin
    .from('notification_jobs')
    .select('id, organization_id, template_key, audience_segment_id, channel, event_id, variables, scheduled_at, status, processed_count, failed_count')
    .eq('status', 'pending')
    .lte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(20)

  if (fetchError) {
    console.error('[process-notification-jobs] fetch error:', fetchError)
    return jsonResponse({ error: 'DB error fetching pending jobs', details: fetchError.message }, 500)
  }

  if (!pendingJobs || pendingJobs.length === 0) {
    return jsonResponse({ message: 'No pending jobs', jobs_processed: 0, reset_stuck: resetCount })
  }

  // 2. Process each job sequentially (jobs can have large audiences — avoid timeout)
  const results: Array<{ job_id: string; processed: number; failed: number; error?: string }> = []

  for (const job of pendingJobs) {
    try {
      const r = await processJob(admin, job as NotificationJob, env)
      results.push({ job_id: job.id, ...r })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[process-notification-jobs] Job ' + job.id + ' threw:', msg)
      await admin.from('notification_jobs').update({
        status: 'failed' as JobStatus, completed_at: nowIso, error_message: msg,
      }).eq('id', job.id)
      results.push({ job_id: job.id, processed: 0, failed: 0, error: msg })
    }
  }

  return jsonResponse({
    jobs_evaluated:  pendingJobs.length,
    jobs_processed:  results.length,
    messages_sent:   results.reduce((s, r) => s + r.processed, 0),
    messages_failed: results.reduce((s, r) => s + r.failed, 0),
    reset_stuck:     resetCount,
    results,
  })
})
