import { getCorsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth-guard.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { sendResendEmail } from '../_shared/transactional-email.ts'

type Action = 'request_code' | 'verify_code' | 'check_session'

interface RequestBody {
  action: Action
  event_id?: string
  event_slug?: string
  code?: string
  scanner_session?: string
}

const CODE_TTL_MS = 10 * 60 * 1000
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const MAX_REQUESTS_WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const DEFAULT_PRODUCER_EMAIL = 'walteciojr@gmail.com'
const ALLOWED_ROLES = new Set(['super_admin', 'org_admin', 'org_manager', 'checkin_operator'])
const ALLOWED_MEMBER_ROLES = new Set(['owner', 'admin', 'manager', 'checkin_operator'])

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  })
}

function normalizeEmail(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase()
}

function makeCode() {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0')
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashSecret(value: string, eventId: string, producerEmail: string) {
  const pepper = Deno.env.get('SCANNER_AUTH_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  return sha256(`${eventId}:${producerEmail}:${value}:${pepper}`)
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, Math.min(2, user.length))
  return `${visible}${'*'.repeat(Math.max(2, user.length - visible.length))}@${domain}`
}

async function resolveProducerEmail(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  organizationId: string,
  organizationEmail?: string | null,
) {
  const configuredProducerEmail = normalizeEmail(Deno.env.get('SCANNER_PRODUCER_EMAIL') ?? DEFAULT_PRODUCER_EMAIL)
  if (configuredProducerEmail) return configuredProducerEmail

  const orgEmail = normalizeEmail(organizationEmail)
  if (orgEmail) return orgEmail

  const { data: member } = await admin
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .in('role', ['owner', 'admin'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!member?.user_id) return ''

  const { data } = await admin.auth.admin.getUserById(member.user_id)
  return normalizeEmail(data.user?.email)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) })
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405)

  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json(req, { error: 'JSON invalido.' }, 400)
  }

  const admin = createSupabaseAdminClient()
  const eventQuery = admin
    .from('events')
    .select('id,name,organization_id,slug,organization:organizations(email)')
    .limit(1)

  const { data: events, error: eventError } = body.event_id
    ? await eventQuery.eq('id', body.event_id)
    : await eventQuery.eq('slug', String(body.event_slug ?? '').trim())

  const event = Array.isArray(events) ? events[0] : null
  if (eventError || !event) return json(req, { error: 'Evento nao encontrado.' }, 404)

  const organizationEmail = Array.isArray((event as any).organization)
    ? (event as any).organization[0]?.email
    : (event as any).organization?.email
  const producerEmail = await resolveProducerEmail(admin, event.organization_id, organizationEmail)

  if (!producerEmail || !producerEmail.includes('@')) {
    return json(req, { error: 'E-mail do produtor nao configurado para este evento.' }, 400)
  }

  const [{ data: profile }, { data: member }] = await Promise.all([
    admin.from('profiles').select('role,is_active').eq('id', auth.userId).maybeSingle(),
    admin
      .from('organization_members')
      .select('role,is_active')
      .eq('organization_id', event.organization_id)
      .eq('user_id', auth.userId)
      .maybeSingle(),
  ])

  const profileAllowed = Boolean(profile?.is_active !== false && ALLOWED_ROLES.has(String(profile?.role ?? '')))
  const memberAllowed = Boolean(member?.is_active !== false && ALLOWED_MEMBER_ROLES.has(String(member?.role ?? '')))

  if (!profileAllowed && !memberAllowed) {
    return json(req, { error: 'Usuario sem permissao para solicitar o scanner deste evento.' }, 403)
  }

  if (body.action === 'request_code') {
    const since = new Date(Date.now() - MAX_REQUESTS_WINDOW_MS).toISOString()
    const { count } = await admin
      .from('scanner_auth_codes')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('email', producerEmail)
      .gte('created_at', since)

    if ((count ?? 0) >= MAX_REQUESTS_PER_WINDOW) {
      return json(req, { error: 'Muitos codigos enviados. Tente novamente em alguns minutos.' }, 429)
    }

    const code = makeCode()
    const codeHash = await hashSecret(code, event.id, producerEmail)
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

    const { error: insertError } = await admin.from('scanner_auth_codes').insert({
      event_id: event.id,
      user_id: auth.userId,
      email: producerEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
    })

    if (insertError) return json(req, { error: 'Nao foi possivel gerar o codigo.' }, 500)

    const html = `
      <div style="font-family:Arial,sans-serif;background:#050816;color:#f8fafc;padding:28px;max-width:520px;margin:0 auto">
        <h1 style="font-size:22px;margin:0 0 12px">Codigo do scanner Pulse</h1>
        <p style="color:#cbd5e1;margin:0 0 18px">Use este codigo para liberar o scanner do evento <strong>${event.name}</strong>.</p>
        <div style="font-size:34px;letter-spacing:8px;font-weight:800;background:#111827;border:1px solid #334155;border-radius:12px;padding:18px;text-align:center">${code}</div>
        <p style="color:#94a3b8;font-size:12px;margin-top:18px">O codigo expira em 10 minutos. Entregue somente para a equipe autorizada.</p>
      </div>
    `

    await sendResendEmail({
      to: producerEmail,
      subject: `Codigo do scanner - ${event.name}`,
      html,
      text: `Codigo do scanner Pulse para ${event.name}: ${code}. Expira em 10 minutos.`,
    })

    return json(req, { ok: true, masked_email: maskEmail(producerEmail), expires_in_seconds: CODE_TTL_MS / 1000 })
  }

  if (body.action === 'verify_code') {
    const code = String(body.code ?? '').replace(/\D/g, '')
    if (code.length !== 6) return json(req, { error: 'Informe o codigo de 6 digitos.' }, 400)

    const nowIso = new Date().toISOString()
    const { data: latestCode } = await admin
      .from('scanner_auth_codes')
      .select('id,attempts')
      .eq('event_id', event.id)
      .eq('email', producerEmail)
      .is('consumed_at', null)
      .gte('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if ((latestCode?.attempts ?? 0) >= 5) {
      return json(req, { error: 'Codigo bloqueado. Solicite um novo.' }, 429)
    }

    const codeHash = await hashSecret(code, event.id, producerEmail)
    const { data: codeRow } = await admin
      .from('scanner_auth_codes')
      .select('id,attempts')
      .eq('event_id', event.id)
      .eq('email', producerEmail)
      .eq('code_hash', codeHash)
      .is('consumed_at', null)
      .gte('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!codeRow) {
      if (latestCode?.id) {
        await admin
          .from('scanner_auth_codes')
          .update({ attempts: (latestCode.attempts ?? 0) + 1 })
          .eq('id', latestCode.id)
      }
      return json(req, { error: 'Codigo invalido ou expirado.' }, 401)
    }

    const sessionToken = crypto.randomUUID()
    const sessionHash = await hashSecret(sessionToken, event.id, producerEmail)
    const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

    const { error: updateError } = await admin
      .from('scanner_auth_codes')
      .update({
        consumed_at: nowIso,
        attempts: (codeRow.attempts ?? 0) + 1,
        session_token_hash: sessionHash,
        session_expires_at: sessionExpiresAt,
      })
      .eq('id', codeRow.id)

    if (updateError) return json(req, { error: 'Nao foi possivel liberar o scanner.' }, 500)

    return json(req, {
      ok: true,
      event_id: event.id,
      event_name: event.name,
      scanner_session: sessionToken,
      expires_at: sessionExpiresAt,
    })
  }

  if (body.action === 'check_session') {
    const session = String(body.scanner_session ?? '').trim()
    if (!session) return json(req, { error: 'Sessao do scanner nao informada.' }, 401)

    const sessionHash = await hashSecret(session, event.id, producerEmail)
    const { data: sessionRow } = await admin
      .from('scanner_auth_codes')
      .select('id,session_expires_at')
      .eq('event_id', event.id)
      .eq('email', producerEmail)
      .eq('session_token_hash', sessionHash)
      .gte('session_expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (!sessionRow) return json(req, { error: 'Sessao do scanner expirada.' }, 401)

    return json(req, {
      ok: true,
      event_id: event.id,
      event_name: event.name,
      expires_at: sessionRow.session_expires_at,
    })
  }

  return json(req, { error: 'Acao invalida.' }, 400)
})
