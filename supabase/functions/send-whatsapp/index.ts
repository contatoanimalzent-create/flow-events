import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SendWhatsAppPayload {
  to: string                                   // E.164 format, e.g. +5511999999999
  template_slug: string
  template_vars: Record<string, string>
  organization_id: string
  event_id?: string
  profile_id?: string
  fallback_sms?: boolean                       // default false
}

interface TwilioMessageResponse {
  sid: string
  status: string
  error_code?: number | null
  error_message?: string | null
}

type ChannelUsed = 'whatsapp' | 'sms'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Replace {{key}} placeholders in a template string with vars values */
function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

/**
 * Send a message via Twilio REST API.
 * fromNumber should include the 'whatsapp:' prefix for WhatsApp channel.
 * toNumber should include 'whatsapp:' prefix for WhatsApp, plain E.164 for SMS.
 */
async function sendViaTwilio(params: {
  accountSid: string
  authToken: string
  from: string
  to: string
  body: string
  contentSid?: string
}): Promise<TwilioMessageResponse> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${params.accountSid}/Messages.json`

  const formData = new URLSearchParams()
  formData.append('From', params.from)
  formData.append('To', params.to)

  // If a ContentSid is provided (Meta template), use it; otherwise send body directly
  if (params.contentSid) {
    formData.append('ContentSid', params.contentSid)
    // ContentSid approach can still include a Body for fallback rendering
    formData.append('Body', params.body)
  } else {
    formData.append('Body', params.body)
  }

  const credentials = btoa(`${params.accountSid}:${params.authToken}`)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const json = await response.json() as TwilioMessageResponse

  if (!response.ok) {
    throw new TwilioError(
      json.error_message ?? `Twilio responded with HTTP ${response.status}`,
      json.error_code ?? response.status,
      json,
    )
  }

  return json
}

class TwilioError extends Error {
  code: number
  raw: unknown

  constructor(message: string, code: number, raw: unknown) {
    super(message)
    this.name = 'TwilioError'
    this.code = code
    this.raw = raw
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  // -------------------------------------------------------------------------
  // Read env vars early so we can fail fast
  // -------------------------------------------------------------------------
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // e.g. whatsapp:+14155238886

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.error('[send-whatsapp] Missing Twilio environment variables')
    return Response.json(
      { error: 'Server misconfiguration: Twilio credentials not set' },
      { status: 500, headers: corsHeaders },
    )
  }

  let body: SendWhatsAppPayload
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
  }

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  const requiredFields: (keyof SendWhatsAppPayload)[] = ['to', 'template_slug', 'template_vars', 'organization_id']
  const missing = requiredFields.filter((f) => !body[f])
  if (missing.length > 0) {
    return Response.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400, headers: corsHeaders })
  }

  // Validate E.164 format
  if (!/^\+\d{7,15}$/.test(body.to)) {
    return Response.json({ error: 'to must be in E.164 format (e.g. +5511999999999)' }, { status: 400, headers: corsHeaders })
  }

  const supabase = createSupabaseAdminClient()
  const now = new Date().toISOString()

  try {
    // -----------------------------------------------------------------------
    // 1. Fetch the WhatsApp template
    // -----------------------------------------------------------------------
    const { data: template, error: templateError } = await supabase
      .from('whatsapp_templates')
      .select('id, slug, body_template, meta_template_name, meta_content_sid, is_active, language_code')
      .eq('slug', body.template_slug)
      .single()

    if (templateError || !template) {
      return Response.json(
        { error: `Template '${body.template_slug}' not found` },
        { status: 404, headers: corsHeaders },
      )
    }

    if (!template.is_active) {
      return Response.json(
        { error: `Template '${body.template_slug}' is not active` },
        { status: 422, headers: corsHeaders },
      )
    }

    // -----------------------------------------------------------------------
    // 2. Interpolate the template body
    // -----------------------------------------------------------------------
    const messageBody = interpolateTemplate(template.body_template, body.template_vars)

    // -----------------------------------------------------------------------
    // 3. Attempt WhatsApp send
    // -----------------------------------------------------------------------
    let twilioResponse: TwilioMessageResponse | null = null
    let channelUsed: ChannelUsed = 'whatsapp'
    let sendError: string | null = null

    const whatsappTo = `whatsapp:${body.to}`
    const whatsappFrom = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
      ? TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`

    try {
      twilioResponse = await sendViaTwilio({
        accountSid: TWILIO_ACCOUNT_SID,
        authToken: TWILIO_AUTH_TOKEN,
        from: whatsappFrom,
        to: whatsappTo,
        body: messageBody,
        contentSid: template.meta_content_sid ?? undefined,
      })
    } catch (waError: unknown) {
      const errorMsg = waError instanceof Error ? waError.message : String(waError)
      console.warn('[send-whatsapp] WhatsApp send failed:', errorMsg)
      sendError = errorMsg

      // -------------------------------------------------------------------
      // 4. SMS fallback
      // -------------------------------------------------------------------
      if (body.fallback_sms) {
        console.info('[send-whatsapp] Attempting SMS fallback for:', body.to)
        channelUsed = 'sms'

        // For SMS we need a regular Twilio number (not whatsapp: prefixed)
        const smsFrom = TWILIO_WHATSAPP_NUMBER.replace(/^whatsapp:/, '')

        try {
          twilioResponse = await sendViaTwilio({
            accountSid: TWILIO_ACCOUNT_SID,
            authToken: TWILIO_AUTH_TOKEN,
            from: smsFrom,
            to: body.to, // plain E.164, no whatsapp: prefix
            body: messageBody,
          })
          sendError = null // SMS succeeded
        } catch (smsError: unknown) {
          const smsErrorMsg = smsError instanceof Error ? smsError.message : String(smsError)
          console.error('[send-whatsapp] SMS fallback also failed:', smsErrorMsg)
          sendError = `WhatsApp: ${errorMsg} | SMS fallback: ${smsErrorMsg}`
        }
      }
    }

    // -----------------------------------------------------------------------
    // 5. Determine final status
    // -----------------------------------------------------------------------
    const messageStatus: string = sendError
      ? 'failed'
      : (twilioResponse?.status ?? 'sent')

    // -----------------------------------------------------------------------
    // 6. Insert into communications_log
    // -----------------------------------------------------------------------
    const { data: logRow, error: logError } = await supabase
      .from('communications_log')
      .insert({
        organization_id: body.organization_id,
        event_id: body.event_id ?? null,
        profile_id: body.profile_id ?? null,
        channel: 'whatsapp',
        template_slug: body.template_slug,
        template_vars: body.template_vars,
        recipient_phone: body.to,
        provider: 'twilio',
        provider_message_id: twilioResponse?.sid ?? null,
        status: messageStatus,
        channel_used: channelUsed,
        error_message: sendError,
        sent_at: sendError ? null : now,
        created_at: now,
        metadata: {
          template_id: template.id,
          language_code: template.language_code ?? null,
          meta_template_name: template.meta_template_name ?? null,
          fallback_sms: body.fallback_sms ?? false,
          whatsapp_failed: channelUsed === 'sms',
        },
      })
      .select('id')
      .single()

    if (logError) {
      console.warn('[send-whatsapp] communications_log insert failed:', logError.message)
    }

    // -----------------------------------------------------------------------
    // 7. Return result
    // -----------------------------------------------------------------------
    if (sendError && !twilioResponse) {
      return Response.json(
        {
          success: false,
          error: sendError,
          log_id: logRow?.id ?? null,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    return Response.json(
      {
        success: true,
        sid: twilioResponse?.sid ?? null,
        status: twilioResponse?.status ?? messageStatus,
        channel_used: channelUsed,
        log_id: logRow?.id ?? null,
      },
      { status: 200, headers: corsHeaders },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[send-whatsapp] unhandled error:', err)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
