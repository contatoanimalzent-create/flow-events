import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

// Cadastro publico de atletas e corners de um evento.
//
// O atleta se cadastra e recebe um codigo curto. O corner informa esse codigo
// para se vincular. O limite de 2 corners por atleta e garantido no banco, pelo
// trigger enforce_corner_limit, nao aqui.

const PHOTO_BUCKET = 'staff-documents'
const MAX_PHOTO_BYTES = 6 * 1024 * 1024

// Sem 0/O, 1/I/L, 2/Z, 5/S, 8/B: o codigo e ditado por telefone e escrito a mao.
const CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679'
const CODE_LENGTH = 6

interface AthleteBody {
  event_slug: string
  kind: 'athlete' | 'corner'
  full_name: string
  cpf?: string
  phone?: string
  email?: string
  gym?: string
  city?: string
  state?: string
  notes?: string
  // atleta
  birth_date?: string
  instagram?: string
  sherdog_url?: string
  weight_class?: string
  weight_kg?: number | string
  record_wins?: number | string
  record_losses?: number | string
  record_draws?: number | string
  photo_base64?: string
  corner_color?: string
  // o atleta manda os corners dele junto, ate 2
  corners?: Array<{ full_name?: string; cpf?: string; gym?: string }>
  // corner avulso (fluxo antigo, mantido para nao quebrar link ja enviado)
  athlete_code?: string
}

type CornerColor = 'azul' | 'vermelho'

function normalizeCornerColor(value?: string | null): CornerColor | null {
  const raw = (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (raw === 'azul' || raw === 'blue') return 'azul'
  if (raw === 'vermelho' || raw === 'red') return 'vermelho'
  return null
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  })
}

function fail(req: Request, message: string, status: number, code?: string): Response {
  return json(req, { error: message, ...(code ? { code } : {}) }, status)
}

function normalizeCpf(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let digit = ((sum * 10) % 11) % 10
  if (Number(cpf[9]) !== digit) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  digit = ((sum * 10) % 11) % 10
  return Number(cpf[10]) === digit
}

function formatCpf(cpf: string): string {
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

function normalizeCode(value?: string | null): string {
  return (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function normalizeInstagram(value?: string | null): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null
  const handle = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim()
  return handle ? `@${handle}` : null
}

function normalizeUrl(value?: string | null): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
}

function toInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

async function uploadPhoto(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  eventId: string,
  base64: string,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const clean = base64.replace(/^data:image\/\w+;base64,/, '')
    const binary = atob(clean)
    if (binary.length > MAX_PHOTO_BYTES) {
      return { url: null, error: 'A foto passou de 6 MB. Tire outra com menos qualidade.' }
    }
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const path = `athletes/${eventId}/${crypto.randomUUID()}.jpg`
    const { error } = await admin.storage
      .from(PHOTO_BUCKET)
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false })

    if (error) return { url: null, error: error.message }

    const { data } = admin.storage.from(PHOTO_BUCKET).getPublicUrl(path)
    return { url: data?.publicUrl ?? null, error: null }
  } catch (err) {
    return { url: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ── GET: dados do evento, ou consulta de um codigo de atleta ─────────────────

async function handleGet(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const eventSlug = url.searchParams.get('event_slug') ?? ''
  const athleteCode = normalizeCode(url.searchParams.get('athlete_code'))

  if (!eventSlug) return fail(req, 'Informe o evento.', 400, 'MISSING_EVENT')

  const admin = createSupabaseAdminClient()

  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, name, slug, starts_at, ends_at, venue_name, organization_id')
    .eq('slug', eventSlug)
    .maybeSingle()

  if (eventErr) {
    console.error('[event-athlete-register] erro ao buscar evento:', eventErr)
    return fail(req, 'Erro interno ao buscar o evento.', 500, 'DB_ERROR')
  }
  if (!event) return fail(req, 'Evento não encontrado.', 404, 'EVENT_NOT_FOUND')

  if (!athleteCode) {
    return json(req, {
      event: {
        id: event.id,
        name: event.name,
        slug: event.slug,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        venue_name: event.venue_name,
      },
    })
  }

  const { data: athlete } = await admin
    .from('event_athletes')
    .select('id, full_name, gym')
    .eq('event_id', event.id)
    .eq('kind', 'athlete')
    .eq('status', 'active')
    .eq('athlete_code', athleteCode)
    .maybeSingle()

  if (!athlete) {
    return fail(req, 'Código de atleta não encontrado. Confira com o seu atleta.', 404, 'ATHLETE_CODE_NOT_FOUND')
  }

  const { data: corners } = await admin
    .from('event_athletes')
    .select('id, full_name, corner_color')
    .eq('athlete_id', athlete.id)
    .eq('kind', 'corner')
    .eq('status', 'active')

  const used = corners?.length ?? 0

  return json(req, {
    event: { id: event.id, name: event.name, slug: event.slug },
    athlete: { full_name: athlete.full_name, gym: athlete.gym },
    corners_used: used,
    corners_left: Math.max(0, 2 - used),
    // O lado ja escolhido por quem se cadastrou antes, para o proximo corner do
    // mesmo atleta nao divergir sem querer.
    corner_color: corners?.find((c) => c.corner_color)?.corner_color ?? null,
  })
}

// ── POST: cadastro ───────────────────────────────────────────────────────────

async function handlePost(req: Request): Promise<Response> {
  let body: AthleteBody
  try {
    body = await req.json()
  } catch {
    return fail(req, 'Corpo da requisição inválido.', 400, 'INVALID_JSON')
  }

  const kind = body.kind
  if (kind !== 'athlete' && kind !== 'corner') {
    return fail(req, 'Informe se o cadastro é de atleta ou de corner.', 400, 'INVALID_KIND')
  }

  const fullName = (body.full_name ?? '').trim().replace(/\s+/g, ' ')
  if (fullName.length < 3 || !fullName.includes(' ')) {
    return fail(req, 'Informe o nome completo.', 400, 'INVALID_NAME')
  }

  const cpf = normalizeCpf(body.cpf)
  if (!isValidCpf(cpf)) {
    return fail(req, 'Informe um CPF válido.', 400, 'INVALID_CPF')
  }

  const admin = createSupabaseAdminClient()

  const { data: event, error: eventErr } = await admin
    .from('events')
    .select('id, name, slug, organization_id')
    .eq('slug', body.event_slug ?? '')
    .maybeSingle()

  if (eventErr) {
    console.error('[event-athlete-register] erro ao buscar evento:', eventErr)
    return fail(req, 'Erro interno ao buscar o evento.', 500, 'DB_ERROR')
  }
  if (!event) return fail(req, 'Evento não encontrado.', 404, 'EVENT_NOT_FOUND')

  const { data: existing } = await admin
    .from('event_athletes')
    .select('id, kind, full_name, athlete_code')
    .eq('event_id', event.id)
    .eq('cpf', formatCpf(cpf))
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return json(req, {
      code: 'already_registered',
      already_registered: true,
      message: 'Este CPF já está cadastrado neste evento.',
      kind: existing.kind,
      full_name: existing.full_name,
      athlete_code: existing.athlete_code,
    }, 409)
  }

  const common = {
    organization_id: event.organization_id,
    event_id: event.id,
    full_name: fullName,
    cpf: formatCpf(cpf),
    phone: (body.phone ?? '').replace(/\D/g, '') || null,
    email: (body.email ?? '').toLowerCase().trim() || null,
    gym: (body.gym ?? '').trim() || null,
    city: (body.city ?? '').trim() || null,
    state: (body.state ?? '').trim().toUpperCase() || null,
    notes: (body.notes ?? '').trim() || null,
  }

  // ── Corner ────────────────────────────────────────────────────────────────
  if (kind === 'corner') {
    const code = normalizeCode(body.athlete_code)
    if (!code) return fail(req, 'Informe o código do seu atleta.', 400, 'MISSING_ATHLETE_CODE')

    const cornerColor = normalizeCornerColor(body.corner_color)
    if (!cornerColor) {
      return fail(req, 'Escolha se você é corner azul ou corner vermelho.', 400, 'MISSING_CORNER_COLOR')
    }

    const { data: athlete } = await admin
      .from('event_athletes')
      .select('id, full_name')
      .eq('event_id', event.id)
      .eq('kind', 'athlete')
      .eq('status', 'active')
      .eq('athlete_code', code)
      .maybeSingle()

    if (!athlete) {
      return fail(req, 'Código de atleta não encontrado. Confira com o seu atleta.', 404, 'ATHLETE_CODE_NOT_FOUND')
    }

    const { data: corner, error: cornerErr } = await admin
      .from('event_athletes')
      .insert({ ...common, kind: 'corner', athlete_id: athlete.id, corner_color: cornerColor })
      .select('id, corner_color')
      .single()

    if (cornerErr || !corner) {
      const msg = cornerErr?.message ?? ''
      if (msg.includes('ja tem 2 corners')) {
        return fail(req, `${athlete.full_name} já tem 2 corners cadastrados. Fale com a produção.`, 409, 'CORNER_LIMIT_REACHED')
      }
      if (cornerErr?.code === '23505') {
        return fail(req, 'Este CPF já está cadastrado neste evento.', 409, 'ALREADY_REGISTERED')
      }
      console.error('[event-athlete-register] erro ao inserir corner:', cornerErr)
      return fail(req, 'Não foi possível concluir o cadastro. Tente novamente.', 500, 'INSERT_ERROR')
    }

    return json(req, {
      success: true,
      kind: 'corner',
      id: corner.id,
      athlete_name: athlete.full_name,
      corner_color: corner.corner_color,
      message: `Cadastro de corner ${cornerColor} confirmado para ${athlete.full_name}.`,
    }, 201)
  }

  // ── Atleta ────────────────────────────────────────────────────────────────
  let photoUrl: string | null = null
  if (body.photo_base64) {
    const uploaded = await uploadPhoto(admin, event.id, body.photo_base64)
    if (uploaded.error) {
      console.error('[event-athlete-register] falha no upload da foto:', uploaded.error)
      return fail(req, uploaded.error, 400, 'PHOTO_UPLOAD_FAILED')
    }
    photoUrl = uploaded.url
  }

  if (!photoUrl) {
    return fail(req, 'A foto do atleta é obrigatória.', 400, 'PHOTO_REQUIRED')
  }

  const athleteColor = normalizeCornerColor(body.corner_color)
  if (!athleteColor) {
    return fail(req, 'Escolha se você é o corner azul ou o vermelho.', 400, 'MISSING_CORNER_COLOR')
  }

  const athleteRow = {
    ...common,
    kind: 'athlete' as const,
    corner_color: athleteColor,
    photo_url: photoUrl,
    birth_date: (body.birth_date ?? '').trim() || null,
    instagram: normalizeInstagram(body.instagram),
    sherdog_url: normalizeUrl(body.sherdog_url),
    weight_class: (body.weight_class ?? '').trim() || null,
    weight_kg: toNumber(body.weight_kg),
    record_wins: toInt(body.record_wins),
    record_losses: toInt(body.record_losses),
    record_draws: toInt(body.record_draws),
  }

  // Colisao de codigo e improvavel, mas o unique index e por evento: tenta de novo.
  for (let attempt = 0; attempt < 6; attempt++) {
    const athleteCode = generateCode()
    const { data: created, error: insertErr } = await admin
      .from('event_athletes')
      .insert({ ...athleteRow, athlete_code: athleteCode })
      .select('id, athlete_code')
      .single()

    if (!insertErr && created) {
      // Os corners que o proprio atleta informou. Ate 2, e herdam o lado dele.
      const wanted = (body.corners ?? [])
        .map((c) => ({
          full_name: (c?.full_name ?? '').trim().replace(/\s+/g, ' '),
          cpf: normalizeCpf(c?.cpf),
          gym: (c?.gym ?? '').trim(),
        }))
        .filter((c) => c.full_name || c.cpf)
        .slice(0, 2)

      const corners: Array<{ full_name: string; ok: boolean; reason?: string }> = []

      for (const c of wanted) {
        if (!c.full_name.includes(' ')) {
          corners.push({ full_name: c.full_name, ok: false, reason: 'Informe o nome completo do corner.' })
          continue
        }
        if (!isValidCpf(c.cpf)) {
          corners.push({ full_name: c.full_name, ok: false, reason: 'CPF do corner inválido.' })
          continue
        }

        const { error: cornerErr } = await admin.from('event_athletes').insert({
          organization_id: event.organization_id,
          event_id: event.id,
          kind: 'corner',
          full_name: c.full_name,
          cpf: formatCpf(c.cpf),
          gym: c.gym || common.gym,
          corner_color: athleteColor,
          athlete_id: created.id,
        })

        if (cornerErr) {
          const msg = cornerErr.message ?? ''
          corners.push({
            full_name: c.full_name,
            ok: false,
            reason: msg.includes('ja tem 2 corners')
              ? 'Limite de 2 corners atingido.'
              : cornerErr.code === '23505'
                ? 'Este CPF já está cadastrado neste evento.'
                : 'Não foi possível cadastrar este corner.',
          })
          console.error('[event-athlete-register] erro ao inserir corner do atleta:', cornerErr)
          continue
        }

        corners.push({ full_name: c.full_name, ok: true })
      }

      return json(req, {
        success: true,
        kind: 'athlete',
        id: created.id,
        athlete_code: created.athlete_code,
        corner_color: athleteColor,
        corners,
        corners_ok: corners.filter((c) => c.ok).length,
        message: 'Cadastro de atleta confirmado.',
      }, 201)
    }

    const isCodeCollision = insertErr?.code === '23505' && (insertErr.message ?? '').includes('event_athletes_code_uk')
    if (isCodeCollision) continue

    if (insertErr?.code === '23505') {
      return fail(req, 'Este CPF já está cadastrado neste evento.', 409, 'ALREADY_REGISTERED')
    }

    console.error('[event-athlete-register] erro ao inserir atleta:', insertErr)
    return fail(req, 'Não foi possível concluir o cadastro. Tente novamente.', 500, 'INSERT_ERROR')
  }

  return fail(req, 'Não foi possível gerar o código do atleta. Tente novamente.', 500, 'CODE_GENERATION_FAILED')
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    if (req.method === 'GET') return await handleGet(req)
    if (req.method === 'POST') return await handlePost(req)
    return fail(req, 'Método não permitido.', 405, 'METHOD_NOT_ALLOWED')
  } catch (err) {
    console.error('[event-athlete-register] erro inesperado:', err)
    return fail(req, 'Erro interno. Tente novamente.', 500, 'INTERNAL_ERROR')
  }
})
