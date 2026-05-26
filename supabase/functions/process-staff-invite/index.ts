import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface InviteToken {
  id: string
  token: string
  organization_id: string
  event_id: string
  role_type: string
  team_id: string | null
  shift_id: string | null
  custom_fields: unknown
  expires_at: string | null
  is_active: boolean
  used_count: number
  max_uses: number | null
  created_by: string | null
  // v3 batch fields
  send_status: string
  target_email: string | null
  target_name: string | null
  sent_at: string | null
  send_error: string | null
}

interface ApplicationBody {
  token: string
  full_name: string
  email: string
  phone?: string
  document_number?: string
  birth_date?: string
  bio?: string
  experience?: string
  t_shirt_size?: string
  custom_field_answers?: Record<string, unknown>
  terms_accepted: boolean
}

interface BatchResult {
  id: string
  target_email: string | null
  status: 'sent' | 'failed' | 'skipped' | 'expired' | 'already_sent'
  error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addCors(init: ResponseInit = {}): ResponseInit {
  return { ...init, headers: { ...corsHeaders, ...((init.headers as Record<string, string>) ?? {}) } }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeCPF(value?: string | null): string | null {
  const clean = (value ?? '').replace(/\D/g, '')
  return clean || null
}

function formatCPF(value?: string | null): string | null {
  const cpf = normalizeCPF(value)
  if (!cpf) return null
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
}

function isValidCPF(value?: string | null): boolean {
  const cpf = normalizeCPF(value)
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (Number(cpf[9]) !== digit) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return Number(cpf[10]) === digit
}

function staffEventDateLabel(inviteToken: string, eventName?: string | null, startsAt?: string | null): string | null {
  if (inviteToken === 'bsb5' || eventName?.toLowerCase() === 'bsb fight 5') {
    return '28, 29 e 30 de maio de 2026'
  }

  return startsAt ?? null
}

function splitFullName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().replace(/\s+/g, ' ').split(' ')
  const firstName = parts.shift() ?? fullName.trim()
  const lastName = parts.length > 0 ? parts.join(' ') : null
  return { firstName, lastName }
}

/** Validate a token record is usable right now */
function validateTokenRecord(
  token: InviteToken,
): { valid: true } | { valid: false; error: string; status: number } {
  if (!token.is_active) {
    return { valid: false, error: 'This invite link is no longer active', status: 410 }
  }
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    return { valid: false, error: 'This invite link has expired', status: 410 }
  }
  if (token.max_uses !== null && token.used_count >= token.max_uses) {
    return { valid: false, error: 'This invite link has reached its maximum number of uses', status: 410 }
  }
  return { valid: true }
}

/** Build branded HTML email for staff invite */
function buildInviteEmailHtml(params: {
  targetName: string | null
  eventName: string
  teamName: string | null
  shiftName: string | null
  roleType: string
  inviteUrl: string
  expiresAt: string | null
}): string {
  const { targetName, eventName, teamName, shiftName, roleType, inviteUrl, expiresAt } = params
  const greeting = targetName ? `Olá, ${targetName}!` : 'Olá!'
  const expiryLine = expiresAt
    ? `<p style="color:#888;font-size:13px;margin-top:8px;">Este convite expira em ${new Date(expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>`
    : ''
  const teamLine = teamName ? `<p style="margin:4px 0;color:#fff8ef;font-size:15px;">🏷️ Equipe: <strong>${teamName}</strong></p>` : ''
  const shiftLine = shiftName ? `<p style="margin:4px 0;color:#fff8ef;font-size:15px;">🕐 Turno: <strong>${shiftName}</strong></p>` : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Convite para Staff, ${eventName}</title>
</head>
<body style="margin:0;padding:0;background:#050507;font-family:'Manrope',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0e0e12;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#d4ff00;padding:24px 32px;text-align:center;">
            <span style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;color:#050507;letter-spacing:2px;">FLOW EVENTS</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="font-size:24px;font-weight:700;color:#fff8ef;margin:0 0 8px 0;">${greeting}</h1>
            <p style="color:#aaa;font-size:15px;margin:0 0 24px 0;">Você foi convidado(a) para fazer parte da equipe do evento:</p>

            <div style="background:#18181f;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 12px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:22px;color:#d4ff00;letter-spacing:1px;">${eventName}</p>
              <p style="margin:4px 0;color:#fff8ef;font-size:15px;">🎯 Função: <strong>${roleType}</strong></p>
              ${teamLine}
              ${shiftLine}
            </div>

            <p style="color:#aaa;font-size:14px;margin:0 0 28px 0;">
              Clique no botão abaixo para preencher sua candidatura e confirmar sua participação. O processo leva menos de 2 minutos.
            </p>

            <div style="text-align:center;margin-bottom:28px;">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#d4ff00;color:#050507;font-weight:700;font-size:16px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                Aceitar Convite
              </a>
            </div>

            ${expiryLine}

            <hr style="border:none;border-top:1px solid #222;margin:28px 0;"/>
            <p style="color:#666;font-size:12px;margin:0;">
              Se você não esperava este convite, pode ignorar este e-mail com segurança.<br/>
              Este convite é pessoal e intransferível.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a0e;padding:16px 32px;text-align:center;">
            <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} Flow Events · Powered by flow.events</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch processor
// ─────────────────────────────────────────────────────────────────────────────

async function runBatch(admin: ReturnType<typeof createSupabaseAdminClient>): Promise<Response> {
  const now = new Date()
  const nowIso = now.toISOString()

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
  const RESEND_FROM    = Deno.env.get('RESEND_FROM_EMAIL') ?? 'no-reply@flow.events'
  const APP_URL        = Deno.env.get('APP_URL') ?? 'https://app.flow.events'

  const stats = { processed: 0, sent: 0, expired: 0, failed: 0, skipped: 0 }
  const results: BatchResult[] = []

  // Fetch up to 50 pending invite links that have a target_email
  const { data: pendingLinks, error: fetchError } = await admin
    .from('staff_invite_links')
    .select('id, token, event_id, role_type, team_id, shift_id, expires_at, is_active, used_count, max_uses, send_status, target_email, target_name, sent_at, send_error, created_by')
    .eq('send_status', 'pending')
    .limit(50)

  if (fetchError) {
    console.error('[process-staff-invite] batch fetch error:', fetchError)
    return jsonResponse({ error: 'Failed to fetch pending invites', details: fetchError.message }, 500)
  }

  if (!pendingLinks || pendingLinks.length === 0) {
    return jsonResponse({ message: 'No pending invites to process', ...stats })
  }

  for (const link of pendingLinks) {
    stats.processed++

    // ── No target_email → skip ──────────────────────────────────────────────
    if (!link.target_email) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'skipped', updated_at: nowIso })
        .eq('id', link.id)
      stats.skipped++
      results.push({ id: link.id, target_email: null, status: 'skipped' })
      continue
    }

    // ── Expired → mark expired ───────────────────────────────────────────────
    if (link.expires_at && new Date(link.expires_at) < now) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'expired', updated_at: nowIso })
        .eq('id', link.id)

      await admin.from('communications_log').insert({
        channel:          'email',
        recipient_email:  link.target_email,
        subject:          'Staff invite expired',
        status:           'failed',
        metadata: {
          invite_link_id: link.id,
          reason:         'expired',
        },
        sent_at: nowIso,
      })

      stats.expired++
      results.push({ id: link.id, target_email: link.target_email, status: 'expired' })
      continue
    }

    // ── Idempotency: check if already sent via communications_log ───────────
    const { data: existingLog } = await admin
      .from('communications_log')
      .select('id')
      .eq('status', 'sent')
      .eq('recipient_email', link.target_email)
      .filter('metadata->>invite_link_id', 'eq', link.id)
      .maybeSingle()

    if (existingLog) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'sent', updated_at: nowIso })
        .eq('id', link.id)
      stats.sent++
      results.push({ id: link.id, target_email: link.target_email, status: 'already_sent' })
      continue
    }

    // ── Fetch enrichment data ────────────────────────────────────────────────
    const [{ data: event }, { data: team }, { data: shift }] = await Promise.all([
      admin.from('events').select('name').eq('id', link.event_id).maybeSingle(),
      link.team_id
        ? admin.from('staff_teams').select('name').eq('id', link.team_id).maybeSingle()
        : Promise.resolve({ data: null }),
      link.shift_id
        ? admin.from('staff_shifts').select('name').eq('id', link.shift_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const eventName = (event as { name?: string } | null)?.name ?? 'Flow Event'
    const teamName  = (team  as { name?: string } | null)?.name ?? null
    const shiftName = (shift as { name?: string } | null)?.name ?? null

    const inviteUrl = `${APP_URL}/invite/${link.token}`

    const html = buildInviteEmailHtml({
      targetName: link.target_name ?? null,
      eventName,
      teamName,
      shiftName,
      roleType: link.role_type,
      inviteUrl,
      expiresAt: link.expires_at,
    })

    // ── Send via Resend ──────────────────────────────────────────────────────
    let sendError: string | null = null
    let sendSuccess = false

    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    RESEND_FROM,
          to:      [link.target_email],
          subject: `Você foi convidado para a equipe de ${eventName}`,
          html,
        }),
      })

      if (!resendRes.ok) {
        const errBody = await resendRes.text()
        sendError = `Resend HTTP ${resendRes.status}: ${errBody}`
      } else {
        sendSuccess = true
      }
    } catch (err: unknown) {
      sendError = err instanceof Error ? err.message : 'Unknown send error'
    }

    // ── Update staff_invite_links ────────────────────────────────────────────
    await admin
      .from('staff_invite_links')
      .update({
        send_status: sendSuccess ? 'sent' : 'failed',
        sent_at:     sendSuccess ? nowIso : null,
        send_error:  sendError,
        updated_at:  nowIso,
      })
      .eq('id', link.id)

    // ── Insert communications_log ────────────────────────────────────────────
    await admin.from('communications_log').insert({
      channel:          'email',
      recipient_email:  link.target_email,
      subject:          `Convite para equipe, ${eventName}`,
      status:           sendSuccess ? 'sent' : 'failed',
      error_message:    sendError,
      metadata: {
        invite_link_id: link.id,
        event_id:       link.event_id,
        role_type:      link.role_type,
        team_id:        link.team_id,
        shift_id:       link.shift_id,
      },
      sent_at: nowIso,
    })

    if (sendSuccess) {
      stats.sent++
      results.push({ id: link.id, target_email: link.target_email, status: 'sent' })
    } else {
      stats.failed++
      results.push({ id: link.id, target_email: link.target_email, status: 'failed', error: sendError ?? undefined })
    }
  }

  return jsonResponse({ ...stats, results })
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const admin = createSupabaseAdminClient()

  // =========================================================================
  // GET, retrieve invite info OR trigger batch via cron webhook
  // =========================================================================
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const tokenParam = url.searchParams.get('token')
    const runParam   = url.searchParams.get('run')

    // Cron trigger: GET ?run=batch — require cron secret (fail-closed)
    if (runParam === 'batch') {
      const expected = Deno.env.get('CRON_SECRET') ?? ''
      const incoming = req.headers.get('x-cron-secret') ?? ''
      if (!expected || incoming !== expected) {
        return Response.json({ error: 'Unauthorized' }, addCors({ status: 401 }))
      }
      return await runBatch(admin)
    }

    if (!tokenParam) {
      return Response.json({ error: 'token query parameter is required' }, addCors({ status: 400 }))
    }

    try {
      const { data: inviteLink, error } = await admin
        .from('staff_invite_links')
        .select('id, token, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by, send_status, target_email, target_name')
        .eq('token', tokenParam)
        .single()

      if (error || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      const { data: event } = await admin
        .from('events')
        .select('id, name, starts_at, ends_at, venue_name, cover_url, organization_id')
        .eq('id', inviteLink.event_id)
        .single()

      let team: { id: string; name: string } | null = null
      if (inviteLink.team_id) {
        const { data } = await admin.from('staff_teams').select('id, name').eq('id', inviteLink.team_id).single()
        team = data ?? null
      }

      let shift: { id: string; name: string; starts_at: string; ends_at: string } | null = null
      if (inviteLink.shift_id) {
        const { data } = await admin.from('staff_shifts').select('id, name, starts_at, ends_at').eq('id', inviteLink.shift_id).single()
        shift = data ?? null
      }

      return Response.json(
        {
          event_name:       event?.name ?? 'Evento',
          event_date:       staffEventDateLabel(inviteLink.token, event?.name, event?.starts_at),
          event_location:   event?.venue_name ?? null,
          role:             inviteLink.role_type,
          team:             team?.name ?? null,
          shift:            shift?.name ?? null,
          shift_starts_at:  shift?.starts_at ?? null,
          shift_ends_at:    shift?.ends_at ?? null,
          custom_fields:    inviteLink.custom_fields ?? [],
          invite: {
            token:           inviteLink.token,
            role_type:       inviteLink.role_type,
            custom_fields:   inviteLink.custom_fields ?? [],
            expires_at:      inviteLink.expires_at,
            is_active:       inviteLink.is_active,
            spots_remaining: inviteLink.max_uses !== null ? Math.max(0, inviteLink.max_uses - inviteLink.used_count) : null,
          },
          event: event
            ? {
                id:              event.id,
                name:            event.name,
                starts_at:       event.starts_at,
                ends_at:         event.ends_at,
                venue_name:      event.venue_name,
                cover_image_url: event.cover_url,
              }
            : null,
          team,
          shift,
        },
        addCors({ status: 200 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] GET error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  // =========================================================================
  // POST
  // =========================================================================
  if (req.method === 'POST') {
    let rawBody: Record<string, unknown>
    try {
      rawBody = await req.json()
    } catch {
      // Empty body → treat as batch trigger
      rawBody = {}
    }

    const action = rawBody.action as string | undefined

    // ── Mode 1: run-batch ────────────────────────────────────────────────────
    if (action === 'run-batch') {
      return await runBatch(admin)
    }

    // ── Mode 2: send-invite-email (single) ───────────────────────────────────
    if (action === 'send-invite-email') {
      const { invite_link_id, target_email, organization_id } = rawBody as {
        invite_link_id?: string
        target_email?: string
        organization_id?: string
      }

      if (!invite_link_id || !target_email) {
        return jsonResponse({ error: 'invite_link_id and target_email are required' }, 400)
      }

      // Patch target_email onto the link and mark it pending so the batch picks it up
      const nowIso = new Date().toISOString()
      const { error: patchError } = await admin
        .from('staff_invite_links')
        .update({ target_email, send_status: 'pending', updated_at: nowIso })
        .eq('id', invite_link_id)

      if (patchError) {
        return jsonResponse({ error: 'Failed to update invite link', details: patchError.message }, 500)
      }

      // Run single-link batch (re-use runBatch, the link will be the only pending one with this email)
      // For simplicity, just run the full batch; idempotency prevents double-sends
      return await runBatch(admin)
    }

    // ── Mode 3: submit application ───────────────────────────────────────────
    const body = rawBody as Partial<ApplicationBody>

    const missing: string[] = []
    if (!body.token)             missing.push('token')
    if (!body.full_name)         missing.push('full_name')
    if (!body.email)             missing.push('email')
    if (!normalizeCPF(body.document_number)) missing.push('document_number')
    if (body.terms_accepted !== true) missing.push('terms_accepted (must be true)')

    if (missing.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        addCors({ status: 400 }),
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email!)) {
      return Response.json({ error: 'Invalid email format' }, addCors({ status: 400 }))
    }

    if (!isValidCPF(body.document_number)) {
      return Response.json({ error: 'CPF invalido. Informe o CPF real da propria pessoa.' }, addCors({ status: 400 }))
    }

    try {
      const { data: inviteLink, error: inviteError } = await admin
        .from('staff_invite_links')
        .select('id, token, organization_id, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by, send_status, target_email, target_name')
        .eq('token', body.token!)
        .single()

      if (inviteError || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      const cpf = formatCPF(body.document_number)
      const email = body.email!.toLowerCase().trim()
      const { data: existingStaff } = await admin
        .from('staff_members')
        .select('id, status')
        .eq('event_id', inviteLink.event_id)
        .or(`email.eq.${email},cpf.eq.${cpf}`)
        .maybeSingle()

      if (existingStaff) {
        return Response.json(
          { error: 'Este staff ja esta confirmado para este evento.', existing_status: existingStaff.status },
          addCors({ status: 409 }),
        )
      }

      const now = new Date().toISOString()
      const { firstName, lastName } = splitFullName(body.full_name!)

      const { data: staffMember, error: staffError } = await admin
        .from('staff_members')
        .insert({
          organization_id: inviteLink.organization_id,
          event_id:        inviteLink.event_id,
          first_name:      firstName,
          last_name:       lastName,
          email,
          phone:           body.phone ?? null,
          cpf,
          role_title:      inviteLink.role_type ?? 'staff',
          department:      inviteLink.team_id ? 'Equipe operacional' : null,
          status:          'confirmed',
          is_active:       true,
          permissions:     ['checkin.scan'],
          notes:           [
            'Confirmado via link publico de staff.',
            'Permissoes obrigatorias: camera, localizacao e notificacoes.',
            'Foto de presenca diaria obrigatoria no evento.',
            body.bio ? `Experiencia: ${body.bio}` : null,
            body.t_shirt_size ? `Camiseta: ${body.t_shirt_size}` : null,
          ].filter(Boolean).join('\n'),
          qr_token:        crypto.randomUUID(),
          created_at:      now,
          updated_at:      now,
        })
        .select('id')
        .single()

      if (staffError || !staffMember) {
        console.error('[process-staff-invite] staff insert error:', staffError)
        return Response.json(
          { error: 'Failed to confirm staff member', details: staffError?.message },
          addCors({ status: 500 }),
        )
      }

      await admin
        .from('staff_invite_links')
        .update({ used_count: (inviteLink.used_count ?? 0) + 1, updated_at: now })
        .eq('id', inviteLink.id)

      await admin.from('notification_jobs').insert({
        type:     'staff_confirmed',
        event_id: inviteLink.event_id,
        payload: {
          staff_member_id: staffMember.id,
          staff_name:      body.full_name!.trim(),
          staff_email:     email,
          staff_phone:     body.phone ?? null,
          role_type:       inviteLink.role_type,
          team_id:         inviteLink.team_id ?? null,
          shift_id:        inviteLink.shift_id ?? null,
          invite_link_id:  inviteLink.id,
          requires_camera: true,
          requires_location: true,
          requires_notifications: true,
          arrival_photo_required: true,
          message:         'Ative camera, localizacao e notificacoes. Ao chegar no evento, tire a foto de presenca pelo Pulse.',
        },
        status:     'pending',
        created_at: now,
      }).then(({ error }) => {
        if (error) console.warn('[process-staff-invite] notification_jobs insert failed:', error.message)
      })

      return Response.json(
        {
          success:         true,
          staff_member_id: staffMember.id,
          message:         'Staff member confirmed.',
        },
        addCors({ status: 201 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] POST error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  return Response.json({ error: 'Method not allowed' }, addCors({ status: 405 }))
})
