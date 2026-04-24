import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST body accepted by this function.
 *
 * Field names match the user-facing API spec:
 *   { to, templateKey, variables, organizationId }
 */
interface RequestBody {
  /** Recipient phone number, E.164 (e.g. "+5511999990000") or plain digits */
  to: string
  /** Key column value in whatsapp_templates for this organization */
  templateKey: string
  /** Named values for {{placeholder}} tokens in the template body */
  variables?: Record<string, string | number | boolean>
  /** UUID of the organization that owns the template */
  organizationId: string
  /** Optional: stored in communications_log.metadata for correlation */
  eventId?: string | null
  /**
   * If true and the WhatsApp send fails, retry as a plain SMS.
   * Requires TWILIO_WHATSAPP_NUMBER to also be usable as a SMS sender.
   */
  fallbackSms?: boolean
}

interface TwilioMessageResponse {
  sid: string
  status: string
  error_code?: number | null
  error_message?: string | null
}

type ChannelUsed = 'whatsapp' | 'sms'

// ─────────────────────────────────────────────────────────────────────────────
// TwilioError, structured error from the Twilio REST API
// ─────────────────────────────────────────────────────────────────────────────

class TwilioError extends Error {
  readonly code: number
  readonly raw: unknown

  constructor(message: string, code: number, raw: unknown) {
    super(message)
    this.name = 'TwilioError'
    this.code = code
    this.raw = raw
  }
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

/**
 * Normalise a raw phone string to E.164.
 * Strips any leading "whatsapp:" prefix, then ensures a "+" prefix.
 */
function normalizePhone(raw: string): string {
  let p = raw.trim()
  if (p.startsWith('whatsapp:')) p = p.slice('whatsapp:'.length)
  if (!p.startsWith('+')) p = `+${p}`
  return p
}

/**
 * Replace every {{key}} token in `template` with the matching value from
 * `vars`.  Unresolved tokens are kept verbatim so callers can detect them.
 */
function interpolate(
  template: string,
  vars: Record<string, string | number | boolean>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

/**
 * POST a message to the Twilio Messages API.
 * Throws `TwilioError` on non-2xx responses.
 */
async function twilioSend(params: {
  accountSid: string
  authToken: string
  from: string        // must include "whatsapp:" prefix for WA channel
  to: string          // must include "whatsapp:" prefix for WA channel
  body: string
}): Promise<TwilioMessageResponse> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${params.accountSid}/Messages.json`

  const form = new URLSearchParams({
    From: params.from,
    To:   params.to,
    Body: params.body,
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${btoa(`${params.accountSid}:${params.authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  const json = (await res.json()) as TwilioMessageResponse

  if (!res.ok) {
    throw new TwilioError(
      json.error_message ?? `Twilio HTTP ${res.status}`,
      json.error_code ?? res.status,
      json,
    )
  }

  return json
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {

  // ── CORS preflight ─────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405)
  }

  // ── Env vars (fail-fast) ───────────────────────────────────────────────────
  const ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const AUTH_TOKEN  = Deno.env.get('TWILIO_AUTH_TOKEN')
  const WA_NUMBER   = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // "+14155238886" or "whatsapp:+14155..."

  if (!ACCOUNT_SID || !AUTH_TOKEN || !WA_NUMBER) {
    console.error('[send-whatsapp] Missing Twilio env vars')
    return jsonResponse(
      { error: 'Server configuration error: Twilio credentials not set.', code: 'TWILIO_CONFIG_MISSING' },
      500,
    )
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.', code: 'INVALID_JSON' }, 400)
  }

  const {
    to,
    templateKey,
    variables   = {},
    organizationId,
    eventId     = null,
    fallbackSms = false,
  } = body

  // ── Validate required fields ───────────────────────────────────────────────
  const missing: string[] = []
  if (!to             || typeof to             !== 'string') missing.push('to')
  if (!templateKey    || typeof templateKey    !== 'string') missing.push('templateKey')
  if (!organizationId || typeof organizationId !== 'string') missing.push('organizationId')

  if (missing.length > 0) {
    return jsonResponse({ error: `Missing required fields: ${missing.join(', ')}.` }, 400)
  }

  const recipientPhone = normalizePhone(to)

  // Basic E.164 sanity check after normalisation
  if (!/^\+\d{7,15}$/.test(recipientPhone)) {
    return jsonResponse(
      { error: `"to" must be a valid phone number in E.164 format (e.g. +5511999990000). Got: ${to}` },
      400,
    )
  }

  const admin  = createSupabaseAdminClient()
  const nowIso = new Date().toISOString()

  // ── 1. Fetch template (key + body are the only columns in current schema) ──
  const { data: template, error: tmplErr } = await admin
    .from('whatsapp_templates')
    .select('id, key, body')
    .eq('organization_id', organizationId)
    .eq('key', templateKey)
    .maybeSingle()

  if (tmplErr) {
    console.error('[send-whatsapp] template lookup error:', tmplErr)
    return jsonResponse({ error: 'Database error while fetching template.', code: 'DB_ERROR' }, 500)
  }

  if (!template) {
    return jsonResponse(
      { error: `WhatsApp template "${templateKey}" not found for this organization.`, code: 'TEMPLATE_NOT_FOUND' },
      404,
    )
  }

  // ── 2. Interpolate {{placeholders}} ───────────────────────────────────────
  const renderedBody = interpolate(template.body, variables)

  const unresolved = [...renderedBody.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
  if (unresolved.length > 0) {
    console.warn('[send-whatsapp] Unresolved placeholders after interpolation:', unresolved)
  }

  // ── 3. Build Twilio addresses ──────────────────────────────────────────────
  const fromNormalized = normalizePhone(WA_NUMBER)
  const waFrom = `whatsapp:${fromNormalized}`
  const waTo   = `whatsapp:${recipientPhone}`

  // ── 4. Send via Twilio (WhatsApp, with optional SMS fallback) ──────────────
  let twilioRes: TwilioMessageResponse | null = null
  let channelUsed: ChannelUsed = 'whatsapp'
  let sendError: string | null = null

  try {
    twilioRes = await twilioSend({
      accountSid: ACCOUNT_SID,
      authToken:  AUTH_TOKEN,
      from:       waFrom,
      to:         waTo,
      body:       renderedBody,
    })
  } catch (waErr: unknown) {
    const waMsg = waErr instanceof TwilioError
      ? `[${waErr.code}] ${waErr.message}`
      : waErr instanceof Error ? waErr.message : String(waErr)

    console.warn('[send-whatsapp] WhatsApp send failed:', waMsg)
    sendError = waMsg

    // ── SMS fallback ─────────────────────────────────────────────────────────
    if (fallbackSms) {
      console.info('[send-whatsapp] Retrying as SMS for:', recipientPhone)
      channelUsed = 'sms'
      const smsFrom = fromNormalized  // plain E.164, no whatsapp: prefix

      try {
        twilioRes = await twilioSend({
          accountSid: ACCOUNT_SID,
          authToken:  AUTH_TOKEN,
          from:       smsFrom,
          to:         recipientPhone,
          body:       renderedBody,
        })
        sendError = null  // SMS succeeded, clear error
      } catch (smsErr: unknown) {
        const smsMsg = smsErr instanceof TwilioError
          ? `[${smsErr.code}] ${smsErr.message}`
          : smsErr instanceof Error ? smsErr.message : String(smsErr)

        console.error('[send-whatsapp] SMS fallback also failed:', smsMsg)
        sendError = `WhatsApp: ${waMsg} | SMS fallback: ${smsMsg}`
      }
    }
  }

  const finalStatus: 'sent' | 'failed' = sendError ? 'failed' : 'sent'

  // ── 5. Log to communications_log ──────────────────────────────────────────
  const { data: logRow, error: logErr } = await admin
    .from('communications_log')
    .insert({
      organization_id: organizationId,
      template_key:    templateKey,
      channel:         'whatsapp',
      recipient:       recipientPhone,
      recipient_phone: recipientPhone,
      status:          finalStatus,
      message_sid:     twilioRes?.sid   ?? null,
      body_preview:    renderedBody.slice(0, 500),
      error_message:   sendError,
      sent_at:         finalStatus === 'sent' ? nowIso : null,
      metadata: {
        template_id:             template.id,
        variables,
        event_id:                eventId,
        channel_used:            channelUsed,
        twilio_status:           twilioRes?.status ?? null,
        fallback_sms_attempted:  fallbackSms,
        whatsapp_failed:         channelUsed === 'sms',
        unresolved_placeholders: unresolved.length > 0 ? unresolved : null,
      },
    })
    .select('id')
    .single()

  if (logErr) {
    // Non-fatal, delivery already attempted; don't fail the whole request
    console.warn('[send-whatsapp] communications_log insert failed:', logErr.message)
  }

  // ── 6. Return result ───────────────────────────────────────────────────────
  if (finalStatus === 'failed') {
    return jsonResponse(
      {
        success:               false,
        status:                'failed',
        message_sid:           null,
        communications_log_id: logRow?.id ?? null,
        error:                 sendError,
      },
      502,
    )
  }

  return jsonResponse({
    success:               true,
    status:                twilioRes?.status ?? 'sent',
    message_sid:           twilioRes?.sid    ?? null,
    communications_log_id: logRow?.id        ?? null,
    to:                    recipientPhone,
    channel_used:          channelUsed,
    template_key:          templateKey,
    ...(unresolved.length > 0 ? { unresolved_placeholders: unresolved } : {}),
  })
})
