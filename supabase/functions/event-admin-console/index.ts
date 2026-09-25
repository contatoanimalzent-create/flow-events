import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

// Painel administrativo aberto por link com chave, sem senha.
//
// A chave vem na URL do painel e e conferida aqui pelo sha256. O cliente nunca
// fala com o banco direto neste caminho: tudo passa por aqui, com service_role,
// e so as acoes desta lista existem.

type Acao = 'load' | 'points' | 'update_person' | 'cancel_athlete' | 'manual_point'

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  })
}

function fail(req: Request, msg: string, status: number, code?: string) {
  return json(req, { error: msg, ...(code ? { code } : {}) }, status)
}

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function soDigitos(v?: string | null) {
  return (v ?? '').replace(/\D/g, '')
}

function formatCpf(d: string) {
  return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : d
}

function inicioDoDiaUTC(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? ''
  const [y, m, d] = [Number(v('year')), Number(v('month')), Number(v('day'))]
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0)).toISOString()
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) })
  if (req.method !== 'POST') return fail(req, 'Método não permitido.', 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail(req, 'Requisição inválida.', 400)
  }

  const chave = String(body.access_key ?? '').trim()
  const eventSlug = String(body.event_slug ?? '').trim()
  const acao = body.action as Acao | undefined

  if (!chave || !eventSlug || !acao) {
    return fail(req, 'Acesso não autorizado.', 403, 'UNAUTHORIZED')
  }

  const admin = createSupabaseAdminClient()

  const { data: evento } = await admin
    .from('events').select('id, name, slug, venue_coordinates')
    .eq('slug', eventSlug).maybeSingle()
  if (!evento) return fail(req, 'Evento não encontrado.', 404)

  // ── confere a chave ───────────────────────────────────────────────────────
  const hash = await sha256(chave)
  const { data: registro } = await admin
    .from('event_access_keys')
    .select('id, uses')
    .eq('event_id', evento.id)
    .eq('key_hash', hash)
    .eq('is_active', true)
    .maybeSingle()

  if (!registro) return fail(req, 'Acesso não autorizado.', 403, 'UNAUTHORIZED')

  await admin.from('event_access_keys')
    .update({ last_used_at: new Date().toISOString(), uses: (registro.uses ?? 0) + 1 })
    .eq('id', registro.id)

  // ── acoes ─────────────────────────────────────────────────────────────────

  if (acao === 'load') {
    const [equipe, atletas] = await Promise.all([
      admin.from('staff_members')
        .select('id,first_name,last_name,cpf,phone,email,role_title,company,status,photo_url')
        .eq('event_id', evento.id).eq('is_active', true),
      admin.from('event_athletes')
        .select('id,kind,full_name,cpf,phone,email,gym,photo_url,corner_color,weight_class,weight_kg,city,state,athlete_id')
        .eq('event_id', evento.id).eq('status', 'active'),
    ])
    if (equipe.error) return fail(req, equipe.error.message, 500)
    if (atletas.error) return fail(req, atletas.error.message, 500)

    return json(req, {
      event: { id: evento.id, name: evento.name, slug: evento.slug },
      staff: equipe.data ?? [],
      athletes: atletas.data ?? [],
    })
  }

  if (acao === 'points') {
    const staffId = String(body.staff_member_id ?? '')
    if (!staffId) return fail(req, 'Informe a pessoa.', 400)
    const { data, error } = await admin
      .from('staff_checkins')
      .select('id,type,work_role,created_at,distance_from_venue_meters,photo_url')
      .eq('staff_member_id', staffId)
      .eq('event_id', evento.id)
      .order('created_at', { ascending: false })
    if (error) return fail(req, error.message, 500)
    return json(req, { points: data ?? [] })
  }

  if (acao === 'update_person') {
    const papel = String(body.papel ?? '')
    const id = String(body.id ?? '')
    const d = (body.dados ?? {}) as Record<string, string | null>
    if (!id) return fail(req, 'Informe a pessoa.', 400)

    const nome = (d.nome ?? '').trim()
    if (!nome) return fail(req, 'Informe o nome antes de salvar.', 400)

    const cpf = soDigitos(d.cpf)
    if (cpf && cpf.length !== 11) return fail(req, 'CPF deve ter 11 dígitos.', 400)

    if (papel === 'equipe') {
      const partes = nome.split(/\s+/)
      const { data, error } = await admin.from('staff_members').update({
        first_name: partes[0],
        last_name: partes.slice(1).join(' ') || null,
        cpf: cpf ? formatCpf(cpf) : null,
        phone: d.telefone || null,
        role_title: d.funcao || null,
        company: d.equipe || null,
      }).eq('id', id).eq('event_id', evento.id).select('id').maybeSingle()
      if (error) return fail(req, error.message, 400)
      if (!data) return fail(req, 'Pessoa não encontrada neste evento.', 404)
    } else {
      const { data, error } = await admin.from('event_athletes').update({
        full_name: nome,
        cpf: cpf ? formatCpf(cpf) : null,
        phone: d.telefone || null,
        gym: d.equipe || null,
        corner_color: d.lado || null,
        weight_class: d.categoria || null,
      }).eq('id', id).eq('event_id', evento.id).select('id').maybeSingle()
      if (error) return fail(req, error.message, 400)
      if (!data) return fail(req, 'Pessoa não encontrada neste evento.', 404)
    }
    return json(req, { success: true })
  }

  if (acao === 'cancel_athlete') {
    const id = String(body.id ?? '')
    if (!id) return fail(req, 'Informe a pessoa.', 400)
    const { data, error } = await admin.from('event_athletes')
      .update({ status: 'cancelled' })
      .eq('id', id).eq('event_id', evento.id).select('id').maybeSingle()
    if (error) return fail(req, error.message, 400)
    if (!data) return fail(req, 'Pessoa não encontrada neste evento.', 404)
    return json(req, { success: true })
  }

  if (acao === 'manual_point') {
    const staffId = String(body.staff_member_id ?? '')
    const tipo = body.type === 'checkout' ? 'checkout' : 'checkin'
    if (!staffId) return fail(req, 'Informe a pessoa.', 400)

    const { data: pessoa } = await admin.from('staff_members')
      .select('id,event_id').eq('id', staffId).maybeSingle()
    if (!pessoa || pessoa.event_id !== evento.id) {
      return fail(req, 'Pessoa não encontrada neste evento.', 404)
    }

    // Mesma regra do ponto do colaborador: vale o ultimo registro do evento,
    // nao o do dia, porque existe turno que vira a noite e mais de um por dia.
    const { data: ultimos } = await admin.from('staff_checkins')
      .select('id,type').eq('staff_member_id', staffId).eq('event_id', evento.id)
      .order('created_at', { ascending: false }).limit(1)
    const aberto = ultimos?.[0]?.type === 'checkin'

    if (tipo === 'checkin' && aberto) {
      return fail(req, 'Essa pessoa já tem entrada aberta. Registre a saída antes.', 409)
    }
    if (tipo === 'checkout' && !aberto) {
      return fail(req, 'Essa pessoa não tem entrada aberta.', 409)
    }

    const agora = new Date().toISOString()
    const { error } = await admin.from('staff_checkins').insert({
      staff_member_id: staffId,
      event_id: evento.id,
      type: tipo,
      photo_url: null,
      latitude: 0,
      longitude: 0,
      accuracy_meters: null,
      distance_from_venue_meters: 0,
      work_role: typeof body.work_role === 'string' ? body.work_role : null,
      created_at: agora,
      // deixa rastro de que nao veio do celular da pessoa
      device_info: { origem: 'painel', modo: 'manual', chave: registro.id },
    })
    if (error) return fail(req, error.message, 400)

    await admin.from('staff_members').update(
      tipo === 'checkin' ? { checked_in_at: agora, checked_out_at: null } : { checked_out_at: agora },
    ).eq('id', staffId)

    return json(req, { success: true })
  }

  return fail(req, 'Ação desconhecida.', 400)
})
