// Campeonato Nacional de Speedsoft · Capital Strike — inscrição de times pelo Pulse.
//
// POST /                      cadastro público (mesmo contrato do formulário dos sites):
//                             grava como 'pendente' e manda o e-mail de "inscrição recebida".
// POST /?action=aprovar       { ids: uuid[] } + header x-speedsoft-admin: emite um ingresso
//                             nominal com QR por atleta (approve_speedsoft_registration) e
//                             manda o QR para cada um.
// POST /?action=recusar       { ids: uuid[] } + header x-speedsoft-admin.
// POST /?action=listar        {} + header x-speedsoft-admin: lista os cadastros do evento.
import QRCode from 'npm:qrcode@1.5.4'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { emailIngresso, emailRecebido } from './templates.ts'
import { cpfValido, dominioRecebeEmail, emailDescartavel, emailSugestao, enderecoProblema, formatarCpf, nomeProblema, normalizarNome, soDigitos, telefoneProblema } from './validacao.ts'

type ModalidadeId = 'squad_5x5' | 'speed_cqb' | 'pistola_squad_3x3' | 'pistola_individual'
type Pessoa = {
  nome?: unknown
  email?: unknown
  telefone?: unknown
  dataNascimento?: unknown
  cpf?: unknown
  categoria?: unknown
  endereco?: unknown
}

const EVENT_SLUG = 'capital-strike-speedsoft-2026'
const ORG_ID = '00000000-0000-0000-0000-000000000001'
const FROM = 'Campeonato de Speedsoft <noreply@capitalstrike.com.br>'

const MODALIDADES: Record<ModalidadeId, { nome: string; equipe: boolean; min: number }> = {
  squad_5x5: { nome: 'Team 5x5', equipe: true, min: 4 },
  speed_cqb: { nome: 'Speed CQB', equipe: true, min: 4 },
  pistola_squad_3x3: { nome: 'Team 3x3 Pistola', equipe: true, min: 2 },
  pistola_individual: { nome: 'Pistola Individual', equipe: false, min: 0 },
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-speedsoft-admin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
function isDate(v: string) {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return false
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (y < 1940 || y > new Date().getUTCFullYear()) return false
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return dt.getUTCDate() === d && dt.getUTCMonth() === mo - 1 && dt.getUTCFullYear() === y
}
async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function validarPessoa(raw: Pessoa, rotulo: string) {
  const p = {
    nome: str(raw.nome).replace(/\s+/g, ' '), email: str(raw.email).toLowerCase(), telefone: str(raw.telefone),
    dataNascimento: str(raw.dataNascimento), cpf: str(raw.cpf), categoria: str(raw.categoria), endereco: str(raw.endereco),
  }
  if (!p.nome) throw new Error(`${rotulo}: nome obrigatório`)
  if (p.nome.split(' ').length < 2 || /\d/.test(p.nome)) throw new Error(`${rotulo}: informe o nome completo`)
  const nomeRuim = nomeProblema(p.nome)
  if (nomeRuim) throw new Error(`${rotulo}: ${nomeRuim}`)
  if (!p.email || !isEmail(p.email)) throw new Error(`${rotulo}: e-mail inválido`)
  if (emailDescartavel(p.email)) throw new Error(`${rotulo}: e-mail temporário não é aceito. Use um e-mail seu, é por ele que chega o ingresso`)
  const sugestao = emailSugestao(p.email)
  if (sugestao) throw new Error(`${rotulo}: o e-mail termina em @${p.email.split('@')[1]}. Não seria @${sugestao}?`)
  const tel = telefoneProblema(p.telefone)
  if (!p.telefone || tel) throw new Error(`${rotulo}: telefone inválido (${tel ?? 'obrigatório'})`)
  if (!p.dataNascimento || !isDate(p.dataNascimento)) throw new Error(`${rotulo}: data de nascimento inválida`)
  if (!p.cpf || !cpfValido(p.cpf)) throw new Error(`${rotulo}: CPF inválido. Confira os números`)
  p.cpf = formatarCpf(p.cpf)
  if (!p.endereco) throw new Error(`${rotulo}: endereço obrigatório`)
  const enderecoRuim = enderecoProblema(p.endereco)
  if (enderecoRuim) throw new Error(`${rotulo}: ${enderecoRuim}`)
  return p
}

// Travas que dependem do cadastro inteiro e do que já existe no campeonato.
const LIMITE_TIMES_POR_CLUBE = 2

// "Jose da Silva" e "JOSE SILVA" são a mesma pessoa: compara primeiro e último nome.
function mesmoNome(a: string, b: string) {
  const partes = (v: string) => normalizarNome(v).split(' ').filter((p) => p.length > 2 && !['dos', 'das', 'del'].includes(p))
  const pa = partes(a)
  const pb = partes(b)
  return pa.length > 0 && pb.length > 0 && pa[0] === pb[0] && pa[pa.length - 1] === pb[pb.length - 1]
}
const nomeMascarado = (v: string) => {
  const [primeiro, ...resto] = v.trim().split(/\s+/)
  return [primeiro, ...resto.map((p) => `${p[0]}.`)].join(' ')
}

async function conferirDuplicidade(
  eventoId: string, modalidade: ModalidadeId, def: { nome: string; equipe: boolean }, equipe: string, clube: string,
  pessoas: Array<{ nome: string; email: string; cpf: string; dataNascimento: string }>,
) {
  const vistos = new Map<string, { nome: string; dataNascimento: string }>()
  for (const p of pessoas) {
    const c = soDigitos(p.cpf)
    if (vistos.has(c)) throw new Error(`O CPF ${p.cpf} aparece duas vezes (${vistos.get(c)!.nome} e ${p.nome}). Cada atleta precisa do próprio CPF`)
    vistos.set(c, { nome: p.nome, dataNascimento: p.dataNascimento })
  }

  const dominios = [...new Set(pessoas.map((p) => p.email))]
  const checagens = await Promise.all(dominios.map(async (e) => [e, await dominioRecebeEmail(e)] as const))
  const ruim = checagens.find(([, ok]) => !ok)
  if (ruim) throw new Error(`O e-mail ${ruim[0]} não existe ou o domínio não recebe mensagens. Confira o endereço`)

  // Todas as inscrições ativas do campeonato: a mesma pessoa pode jogar várias modalidades,
  // mas só um time por modalidade, e sempre com a mesma identidade.
  const { data: todas, error } = await admin.from('speedsoft_registrations')
    .select('modalidade, squad_nome, clube, jogadores').eq('event_id', eventoId).in('status', ['pendente', 'aprovado'])
  if (error) throw new Error('Não foi possível conferir os cadastros agora. Tente de novo em instantes')
  const existentes = (todas ?? []).filter((r) => r.modalidade === modalidade)

  if (def.equipe) {
    const nome = normalizarNome(equipe)
    if (existentes.some((r) => r.squad_nome && normalizarNome(r.squad_nome) === nome)) {
      throw new Error(`Já existe um Team chamado "${equipe}" no ${def.nome}. Escolha outro nome`)
    }
    const doClube = existentes.filter((r) => normalizarNome(r.clube ?? r.squad_nome ?? '') === normalizarNome(clube))
    if (doClube.length >= LIMITE_TIMES_POR_CLUBE) {
      throw new Error(`A equipe ${clube} já tem ${LIMITE_TIMES_POR_CLUBE} times inscritos no ${def.nome} (${doClube.map((r) => r.squad_nome).join(' e ')}). O limite é de ${LIMITE_TIMES_POR_CLUBE} times por equipe`)
    }
  }
  // Mesmo CPF já inscrito no campeonato: nome e nascimento precisam bater com a inscrição anterior.
  const anteriores = new Map<string, Array<{ nome: string; nasc: string }>>()
  for (const r of todas ?? []) {
    for (const j of (r.jogadores ?? []) as Array<{ cpf?: string; nome?: string; data_nascimento?: string }>) {
      const c = soDigitos(j.cpf ?? '')
      if (!c || !vistos.has(c)) continue
      if (!anteriores.has(c)) anteriores.set(c, [])
      anteriores.get(c)!.push({ nome: j.nome ?? '', nasc: j.data_nascimento ?? '' })
    }
  }
  for (const [c, lista] of anteriores) {
    const atual = vistos.get(c)!
    const mesmos = lista.filter((x) => mesmoNome(x.nome, atual.nome))
    if (!mesmos.length) {
      throw new Error(`O CPF de ${atual.nome} já está inscrito no campeonato em nome de outra pessoa (${nomeMascarado(lista[0].nome)}). Confira o CPF digitado`)
    }
    if (mesmos.every((x) => x.nasc && x.nasc !== atual.dataNascimento)) {
      throw new Error(`${atual.nome} já está inscrito em outra modalidade com outra data de nascimento. Use os mesmos dados nas duas inscrições`)
    }
  }

  for (const r of existentes) {
    for (const j of (r.jogadores ?? []) as Array<{ cpf?: string }>) {
      const c = soDigitos(j.cpf ?? '')
      if (c && vistos.has(c)) {
        throw new Error(`${vistos.get(c)!.nome} já está inscrito no ${def.nome}${r.squad_nome ? ` pelo Team ${r.squad_nome}` : ''}. O mesmo atleta não pode se inscrever duas vezes na mesma modalidade`)
      }
    }
  }

}

async function subirLogo(modalidade: ModalidadeId, equipe: string, logo: { fileName?: unknown; mimeType?: unknown; dataUrl?: unknown } | undefined) {
  if (!logo?.dataUrl) return null
  const mime = str(logo.mimeType)
  if (!['image/png', 'image/jpeg'].includes(mime)) throw new Error('Logo deve ser PNG ou JPG')
  const m = str(logo.dataUrl).match(/^data:image\/(png|jpeg);base64,(.+)$/)
  if (!m) throw new Error('Logo inválida')
  const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0))
  if (bin.byteLength > 5 * 1024 * 1024) throw new Error('Logo acima do limite de 5MB')
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  const slug = equipe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team'
  const path = `speedsoft/logos/${modalidade}/${slug}-${Date.now()}.${ext}`
  const { error } = await admin.storage.from('event-assets').upload(path, new Blob([bin], { type: mime }), { contentType: mime, upsert: false })
  if (error) throw new Error(`Falha no upload da logo: ${error.message}`)
  return admin.storage.from('event-assets').getPublicUrl(path).data.publicUrl
}

async function enviarEmail(to: string, subject: string, html: string, text: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
  })
  const body = await r.json().catch(() => ({}))
  return { ok: r.ok, id: (body as { id?: string })?.id ?? null, body }
}

async function registrarEnvio(eventId: string, orderId: string | null, template: string, to: string, res: { ok: boolean; id: string | null; body: unknown }, meta: Record<string, unknown>) {
  await admin.from('transactional_messages').insert({
    organization_id: ORG_ID, order_id: orderId, event_id: eventId, channel: 'email', template_key: template,
    provider: 'resend', provider_message_id: res.id, recipient: to, status: res.ok ? 'sent' : 'failed',
    metadata: { ...meta, error: res.ok ? null : res.body }, sent_at: res.ok ? new Date().toISOString() : null,
  })
}

async function urlQr(token: string) {
  const png = await QRCode.toBuffer(token, { width: 480, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0B0B0F', light: '#FFFFFF' } })
  const path = `qr-codes/speedsoft/${token.replace(/[^a-zA-Z0-9-]/g, '')}.png`
  const { error } = await admin.storage.from('tickets').upload(path, png, { contentType: 'image/png', upsert: true })
  if (error) throw new Error(`upload do QR falhou: ${error.message}`)
  return admin.storage.from('tickets').getPublicUrl(path).data.publicUrl
}

async function exigirAdmin(req: Request) {
  const segredo = req.headers.get('x-speedsoft-admin') ?? ''
  const esperado = Deno.env.get('SPEEDSOFT_ADMIN_SECRET') ?? ''
  if (!segredo || !esperado) return false
  return (await sha256Hex(segredo)) === (await sha256Hex(esperado))
}

async function aprovar(ids: string[]) {
  const resultado = []
  for (const id of ids) {
    const { data: res, error } = await admin.rpc('approve_speedsoft_registration', { p_id: id })
    if (error || !res?.ok) {
      resultado.push({ id, ok: false, error: error?.message ?? res?.error })
      continue
    }
    const { data: reg } = await admin.from('speedsoft_registrations').select('modalidade, squad_nome, event_id').eq('id', id).single()
    const { data: tickets } = await admin.from('digital_tickets')
      .select('id, ticket_number, qr_token, holder_name, holder_email').eq('order_id', res.order_id)
    const envios = []
    for (const t of tickets ?? []) {
      try {
        const qr = await urlQr(t.qr_token)
        const m = emailIngresso({ nome: t.holder_name, modalidade: MODALIDADES[reg!.modalidade as ModalidadeId].nome, equipe: reg!.squad_nome, numero: t.ticket_number, qr })
        const r = await enviarEmail(t.holder_email, m.subject, m.html, m.text)
        await registrarEnvio(reg!.event_id, res.order_id, 'speedsoft-ingresso-aprovado', t.holder_email, r, { ticket_number: t.ticket_number, registration_id: id })
        envios.push({ ticket: t.ticket_number, enviado: r.ok })
      } catch (err) {
        console.error('e-mail do ingresso falhou', err)
        envios.push({ ticket: t.ticket_number, enviado: false })
      }
    }
    resultado.push({ id, ok: true, order_id: res.order_id, ingressos: envios })
  }
  return resultado
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ success: false, error: 'Método não permitido' }, 405)

  const acao = new URL(req.url).searchParams.get('action')
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ success: false, error: 'Dados inválidos' }, 400)
  }

  if (acao === 'listar') {
    if (!(await exigirAdmin(req))) return json({ success: false, error: 'unauthorized' }, 401)
    const { data: evento } = await admin.from('events').select('id').eq('organization_id', ORG_ID).eq('slug', EVENT_SLUG).maybeSingle()
    const { data, error } = await admin.from('speedsoft_registrations')
      .select('id, created_at, modalidade, squad_nome, clube, logo_url, responsavel_nome, responsavel_email, responsavel_telefone, jogadores, observacoes, status, aprovado_em, source_site, order_id')
      .eq('event_id', evento?.id ?? '').order('created_at', { ascending: false })
    if (error) return json({ success: false, error: error.message }, 500)
    const pedidos = (data ?? []).map((r) => r.order_id).filter(Boolean)
    const { data: ingressos } = pedidos.length
      ? await admin.from('digital_tickets').select('order_id, ticket_number, holder_name, status').in('order_id', pedidos)
      : { data: [] }
    return json({
      success: true,
      cadastros: (data ?? []).map((r) => ({
        ...r,
        modalidade_nome: MODALIDADES[r.modalidade as ModalidadeId]?.nome ?? r.modalidade,
        ingressos: (ingressos ?? []).filter((t) => t.order_id === r.order_id),
      })),
    })
  }

  if (acao === 'aprovar' || acao === 'recusar') {
    if (!(await exigirAdmin(req))) return json({ success: false, error: 'unauthorized' }, 401)
    const ids = (Array.isArray(body.ids) ? body.ids : []).map(String).filter((i) => /^[0-9a-f-]{36}$/i.test(i)).slice(0, 20)
    if (!ids.length) return json({ success: false, error: 'Informe ids' }, 400)
    if (acao === 'recusar') {
      const { data, error } = await admin.from('speedsoft_registrations').update({ status: 'recusado' }).in('id', ids).eq('status', 'pendente').select('id')
      if (error) return json({ success: false, error: error.message }, 500)
      return json({ success: true, recusados: data?.map((r) => r.id) ?? [] })
    }
    return json({ success: true, resultado: await aprovar(ids) })
  }

  try {
    const { data: evento } = await admin.from('events').select('id, status')
      .eq('organization_id', ORG_ID).eq('slug', EVENT_SLUG).maybeSingle()
    if (!evento || !['published', 'ongoing'].includes(evento.status)) throw new Error('Inscrições indisponíveis no momento')

    const modalidade = str(body.modalidade) as ModalidadeId
    const def = MODALIDADES[modalidade]
    if (!def) throw new Error('Modalidade inválida')

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
    const ipHash = ip ? await sha256Hex(`speedsoft:${ip}`) : null
    if (ipHash) {
      const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { count } = await admin.from('speedsoft_registrations').select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash).gte('created_at', desde)
      if ((count ?? 0) >= 15) throw new Error('Muitas tentativas seguidas. Aguarde alguns minutos.')
    }

    const resp = validarPessoa(body as Pessoa, 'Responsável')
    const equipe = str(body.equipeNome)
    if (def.equipe && !equipe) throw new Error('Nome do Team obrigatório')

    const brutos = Array.isArray(body.integrantes) ? body.integrantes : []
    const integrantes = brutos.map((p, i) => validarPessoa(p as Pessoa, `Integrante ${i + 2}`))
    if (!def.equipe && integrantes.length) throw new Error('Modalidade individual não deve enviar integrantes')
    if (def.equipe && integrantes.length < def.min) throw new Error(`${def.nome} exige equipe com ${def.min + 1} atletas`)
    if (def.equipe && integrantes.length > def.min + 2) throw new Error(`${def.nome} aceita no máximo ${def.min + 3} atletas, contando os reservas`)

    // O formulário de capitalstrike.com.br não tem o campo: nesse caso a equipe é o próprio Team.
    const clube = def.equipe ? (str(body.clube).replace(/\s+/g, ' ') || equipe) : ''
    await conferirDuplicidade(evento.id, modalidade, def, equipe, clube, [resp, ...integrantes])

    const logoUrl = def.equipe ? await subirLogo(modalidade, equipe, body.logo as never) : null
    const jogador = (p: ReturnType<typeof validarPessoa>, capitao: boolean) => ({
      nome: p.nome, email: p.email, whatsapp: p.telefone, telefone: p.telefone, cpf: p.cpf,
      categoria: p.categoria, data_nascimento: p.dataNascimento, endereco: p.endereco, capitao,
    })
    const origem = req.headers.get('origin') ?? ''

    const { data: inserido, error } = await admin.from('speedsoft_registrations').insert({
      organization_id: ORG_ID,
      event_id: evento.id,
      modalidade,
      squad_nome: def.equipe ? equipe : null,
      clube: def.equipe ? clube : null,
      logo_url: logoUrl,
      cidade: str(body.cidade) || null,
      uf: str(body.uf) || null,
      responsavel_nome: resp.nome,
      responsavel_email: resp.email,
      responsavel_telefone: resp.telefone,
      responsavel_data_nascimento: resp.dataNascimento,
      jogadores: [jogador(resp, def.equipe), ...integrantes.map((p) => jogador(p, false))],
      observacoes: str(body.observacoes) || null,
      aceite_termos: true,
      status: 'pendente',
      source_site: str(body.sourceSite) || origem.replace(/^https?:\/\//, '') || null,
      ip_hash: ipHash,
    }).select('id, created_at, modalidade').single()
    if (error) throw new Error(`Falha ao salvar inscrição: ${error.message}`)

    const m = emailRecebido({ nome: resp.nome, modalidade: def.nome, equipe: def.equipe ? equipe : null, atletas: integrantes.length + 1 })
    const envio = await enviarEmail(resp.email, m.subject, m.html, m.text)
    await registrarEnvio(evento.id, null, 'speedsoft-pre-cadastro-recebido', resp.email, envio, { registration_id: inserido.id })
    if (!envio.ok) console.error('e-mail de confirmação falhou', envio.body)

    return json({ success: true, registration: inserido, email: { sent: envio.ok, id: envio.id } })
  } catch (err) {
    console.error('speedsoft-pre-cadastro', err)
    return json({ success: false, error: err instanceof Error ? err.message : 'Erro inesperado' }, 400)
  }
})
