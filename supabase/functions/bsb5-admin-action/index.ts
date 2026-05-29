import { createClient } from 'npm:@supabase/supabase-js@2'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const BSB5_SLUG = 'bsb-fight-5'
const ALLOWED_EMAILS = new Set(['walteciojr@gmail.com', 'hds.vieira@gmail.com'])

type Action = 'create_staff' | 'manual_checkin' | 'manual_checkout'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function splitName(value?: string | null): { firstName: string; lastName: string | null } {
  const normalized = (value ?? '').trim().replace(/\s+/g, ' ')
  if (!normalized) return { firstName: 'Sem nome', lastName: null }
  const parts = normalized.split(' ')
  return { firstName: parts.shift() ?? normalized, lastName: parts.length ? parts.join(' ') : null }
}

function normalizeCpf(value?: string | null): string | null {
  const digits = (value ?? '').replace(/\D/g, '')
  return digits.length === 11 ? digits : null
}

function normalizePhone(value?: string | null): string | null {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('55') && digits.length >= 12) return digits.slice(2)
  return digits.slice(0, 11)
}

function parsePoint(raw: unknown): { latitude: number; longitude: number } | null {
  if (typeof raw !== 'string') return null
  const match = raw.match(/\(?\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)?/)
  if (!match) return null
  return { longitude: Number(match[1]), latitude: Number(match[2]) }
}

function todayStartUTC(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return new Date(Date.UTC(Number(value('year')), Number(value('month')) - 1, Number(value('day')), 3, 0, 0, 0)).toISOString()
}

async function requireAllowedUser(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false as const, response: json({ error: 'Login obrigatório.' }, 401) }
  }

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data, error } = await userClient.auth.getUser()
  const email = data.user?.email?.toLowerCase() ?? ''
  if (error || !data.user || !ALLOWED_EMAILS.has(email)) {
    return { ok: false as const, response: json({ error: 'Acesso não autorizado.' }, 403) }
  }

  return { ok: true as const, userId: data.user.id, email }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  const allowed = await requireAllowedUser(req)
  if (!allowed.ok) return allowed.response

  const admin = createSupabaseAdminClient()
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const action = body.action as Action | undefined

  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id, organization_id, name, venue_coordinates')
    .eq('slug', BSB5_SLUG)
    .maybeSingle()

  if (eventError || !event) return json({ error: 'Evento BSB FIGHT 5 não encontrado.' }, 404)

  if (action === 'create_staff') {
    const { firstName, lastName } = splitName(String(body.full_name ?? ''))
    const now = new Date().toISOString()
    const payload = {
      organization_id: event.organization_id,
      event_id: event.id,
      first_name: firstName,
      last_name: lastName,
      email: typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null,
      phone: normalizePhone(typeof body.phone === 'string' ? body.phone : null),
      cpf: normalizeCpf(typeof body.cpf === 'string' ? body.cpf : null),
      role_title: typeof body.role_title === 'string' && body.role_title.trim() ? body.role_title.trim() : 'Apoio',
      company: typeof body.company === 'string' && body.company.trim() ? body.company.trim() : null,
      area: typeof body.area === 'string' && body.area.trim() ? body.area.trim() : null,
      shift_label: typeof body.shift_label === 'string' && body.shift_label.trim() ? body.shift_label.trim() : null,
      notes: [
        typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
        `Cadastro manual por ${allowed.email}`,
      ].filter(Boolean).join(' | '),
      status: 'active',
      is_active: true,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await admin
      .from('staff_members')
      .insert(payload)
      .select('id,first_name,last_name,cpf,email,phone,role_title,company,area,notes,shift_label,pix_key,status,is_active,checked_in_at,checked_out_at,created_at')
      .single()

    if (error) return json({ error: error.message }, 400)
    return json({ staff: data })
  }

  if (action === 'manual_checkin' || action === 'manual_checkout') {
    const staffMemberId = String(body.staff_member_id ?? '')
    const type = action === 'manual_checkin' ? 'checkin' : 'checkout'
    if (!staffMemberId) return json({ error: 'Selecione um colaborador.' }, 400)

    const { data: staffMember, error: staffError } = await admin
      .from('staff_members')
      .select('id,event_id,first_name,last_name,status')
      .eq('id', staffMemberId)
      .maybeSingle()

    if (staffError || !staffMember || staffMember.event_id !== event.id) {
      return json({ error: 'Colaborador não encontrado neste evento.' }, 404)
    }

    const { data: todayRecords, error: recordsError } = await admin
      .from('staff_checkins')
      .select('id,type,created_at')
      .eq('staff_member_id', staffMemberId)
      .gte('created_at', todayStartUTC())
      .order('created_at', { ascending: false })
      .limit(1)

    if (recordsError) return json({ error: recordsError.message }, 500)
    const last = todayRecords?.[0] ?? null
    const hasOpenCheckin = last?.type === 'checkin'

    if (type === 'checkin' && hasOpenCheckin) {
      return json({ error: 'Essa pessoa já tem entrada aberta hoje. Registre a saída antes de nova entrada.' }, 409)
    }
    if (type === 'checkout' && !hasOpenCheckin) {
      return json({ error: 'Essa pessoa não tem entrada aberta hoje.' }, 409)
    }

    const venue = parsePoint(event.venue_coordinates)
    const now = new Date().toISOString()
    const { data: record, error: insertError } = await admin
      .from('staff_checkins')
      .insert({
        staff_member_id: staffMemberId,
        event_id: event.id,
        type,
        photo_url: null,
        latitude: venue?.latitude ?? 0,
        longitude: venue?.longitude ?? 0,
        accuracy_meters: null,
        distance_from_venue_meters: 0,
        created_at: now,
      })
      .select()
      .single()

    if (insertError) return json({ error: insertError.message }, 400)

    const update = type === 'checkin'
      ? { checked_in_at: now, checked_out_at: null }
      : { checked_out_at: now }

    const { data: updatedStaff, error: updateError } = await admin
      .from('staff_members')
      .update(update)
      .eq('id', staffMemberId)
      .select('id,first_name,last_name,cpf,email,phone,role_title,company,area,notes,shift_label,pix_key,status,is_active,checked_in_at,checked_out_at,created_at')
      .single()

    if (updateError) return json({ error: updateError.message }, 500)

    return json({ checkin: record, staff: updatedStaff })
  }

  return json({ error: 'Ação inválida.' }, 400)
})
