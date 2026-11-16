// Campeonato Nacional de Speedsoft · Capital Strike — pré-cadastro de times pelo Pulse.
//
// POST /                      cadastro público (mesmo contrato do formulário dos sites):
//                             grava como 'pendente' e manda o e-mail de "pré-cadastro recebido".
// POST /?action=aprovar       { ids: uuid[] } + header x-speedsoft-admin: emite um ingresso
//                             nominal com QR por atleta (approve_speedsoft_registration) e
//                             manda o QR para cada um.
// POST /?action=recusar       { ids: uuid[] } + header x-speedsoft-admin.
import QRCode from 'npm:qrcode@1.5.4'
import { createClient } from 'npm:@supabase/supabase-js@2'

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
const LOGO = 'https://capitalstrike.com.br/assets/images/logo-capital-strike-email.png?v=20260616-2'
const SITE = 'https://capitalstrikespeedsoft.com'

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
const isPhone = (v: string) => v.replace(/\D/g, '').length >= 10
const isCpf = (v: string) => v.replace(/\D/g, '').length === 11
function isDate(v: string) {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return false
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (y < 1940 || y > new Date().getUTCFullYear()) return false
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return dt.getUTCDate() === d && dt.getUTCMonth() === mo - 1 && dt.getUTCFullYear() === y
}
function esc(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}
const primeiroNome = (n: string) => n.trim().split(/\s+/)[0] || 'combatente'

async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function validarPessoa(raw: Pessoa, rotulo: string) {
  const p = {
    nome: str(raw.nome), email: str(raw.email), telefone: str(raw.telefone),
    dataNascimento: str(raw.dataNascimento), cpf: str(raw.cpf), categoria: str(raw.categoria), endereco: str(raw.endereco),
  }
  if (!p.nome) throw new Error(`${rotulo}: nome obrigatório`)
  if (!p.email || !isEmail(p.email)) throw new Error(`${rotulo}: e-mail obrigatório`)
  if (!p.telefone || !isPhone(p.telefone)) throw new Error(`${rotulo}: telefone inválido`)
  if (!p.dataNascimento || !isDate(p.dataNascimento)) throw new Error(`${rotulo}: data de nascimento inválida`)
  if (!p.cpf || !isCpf(p.cpf)) throw new Error(`${rotulo}: CPF obrigatório`)
  if (!p.endereco) throw new Error(`${rotulo}: endereço obrigatório`)
  return p
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
  const slug = equipe.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team'
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

function moldura(conteudo: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#070707;font-family:Arial,Helvetica,sans-serif;color:#f8f5e8;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070707;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0d0d0d;border:1px solid #2a2412;border-radius:22px;overflow:hidden;">
${conteudo}
<tr><td style="padding:22px 28px 30px;border-top:1px solid rgba(249,174,0,.18);font-size:15px;line-height:1.6;color:#b8b2a3;background:#090909;">
Atenciosamente,<br><strong style="color:#ffffff;">Organização do Campeonato de Speedsoft</strong><br>
<span style="font-size:12px;color:#6e675e;">19 e 20 de dezembro de 2026 · Brasília/DF · <a href="${SITE}" style="color:#f9ae00;">capitalstrikespeedsoft.com</a></span>
</td></tr></table></td></tr></table></body></html>`
}

function emailRecebido(nome: string, modalidade: string) {
  const html = moldura(`
<tr><td style="padding:30px 28px 18px;text-align:center;background:linear-gradient(135deg,#050505 0%,#111111 52%,#2a2008 100%);">
<img src="${LOGO}" alt="Capital Strike" width="300" style="display:block;margin:0 auto 22px;max-width:86%;height:auto;border:0;">
<div style="display:inline-block;border:1px solid rgba(249,174,0,.45);background:rgba(249,174,0,.12);color:#f9ae00;border-radius:999px;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Pré-cadastro recebido</div>
<h1 style="margin:18px 0 0;font-size:30px;line-height:1.14;color:#ffffff;text-transform:uppercase;letter-spacing:.03em;">${esc(primeiroNome(nome))}, você entrou no radar.</h1>
</td></tr>
<tr><td style="padding:26px 28px 10px;font-size:16px;line-height:1.7;color:#d7d3c5;">
Olá, <strong style="color:#ffffff;">${esc(nome)}</strong>. Recebemos o seu pré-cadastro para o <strong style="color:#f9ae00;">Campeonato de Speedsoft Capital Strike</strong>.
A cultura competitiva do Airsoft está ganhando uma arena de alto nível, e o seu nome já chegou para a nossa organização analisar.
</td></tr>
<tr><td style="padding:10px 28px 22px;"><div style="border:1px solid rgba(249,174,0,.35);border-radius:16px;padding:18px;background:linear-gradient(135deg,rgba(249,174,0,.16),rgba(255,255,255,.03));">
<div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#f9ae00;margin-bottom:8px;font-weight:700;">Modalidade selecionada</div>
<div style="font-size:23px;font-weight:900;color:#ffffff;text-transform:uppercase;">${esc(modalidade)}</div></div></td></tr>
<tr><td style="padding:0 28px 14px;font-size:16px;line-height:1.7;color:#d7d3c5;">A nossa equipe vai analisar as informações enviadas e entrar em contato com mais informações. Quando o cadastro for aprovado, cada atleta recebe o próprio QR Code por e-mail.</td></tr>
<tr><td style="padding:0 28px 26px;font-size:16px;line-height:1.7;color:#d7d3c5;">Se você preencheu alguma informação incorreta, responda este e-mail informando o que precisa ser ajustado.</td></tr>`)
  const text = `${primeiroNome(nome)}, recebemos o seu pré-cadastro para o Campeonato de Speedsoft Capital Strike.\n\nModalidade selecionada:\n${modalidade}\n\nA nossa equipe vai analisar as informações enviadas e entrar em contato. Quando o cadastro for aprovado, cada atleta recebe o próprio QR Code por e-mail.\n\nSe você preencheu alguma informação incorreta, responda este e-mail.\n\nAtenciosamente,\nOrganização do Campeonato de Speedsoft`
  return { subject: `${primeiroNome(nome)}, recebemos seu pré-cadastro | Campeonato de Speedsoft`, html, text }
}

function emailIngresso(nome: string, modalidade: string, equipe: string | null, numero: string, qr: string) {
  const html = moldura(`
<tr><td style="padding:30px 28px 10px;text-align:center;background:linear-gradient(135deg,#050505 0%,#111111 52%,#2a2008 100%);">
<img src="${LOGO}" alt="Capital Strike" width="240" style="display:block;margin:0 auto 20px;max-width:70%;height:auto;border:0;">
<div style="display:inline-block;border:1px solid rgba(249,174,0,.45);background:rgba(249,174,0,.12);color:#f9ae00;border-radius:999px;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Inscrição aprovada</div>
<h1 style="margin:18px 0 0;font-size:28px;line-height:1.14;color:#ffffff;text-transform:uppercase;">${esc(primeiroNome(nome))}, você está dentro.</h1>
</td></tr>
<tr><td align="center" style="padding:22px 28px 6px;">
<div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#f9ae00;font-weight:700;">${esc(modalidade)}${equipe ? ` · ${esc(equipe)}` : ''}</div>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:16px;"><tr><td style="background:#ffffff;border-radius:14px;padding:12px;">
<img src="${qr}" width="210" height="210" alt="QR Code ${esc(numero)}" style="display:block;width:210px;height:210px;border:0;"></td></tr></table>
<div style="font-family:'Courier New',monospace;font-size:15px;letter-spacing:2px;color:#f4ead1;margin-top:12px;">${esc(numero)}</div>
<div style="font-size:12px;color:#8b8378;margin-top:4px;">${esc(nome)}</div>
</td></tr>
<tr><td style="padding:18px 28px 26px;font-size:15px;line-height:1.7;color:#d7d3c5;">Este QR é pessoal e será usado no credenciamento do campeonato. Guarde este e-mail. O local e os horários oficiais serão enviados pela organização.</td></tr>`)
  const text = `${nome}, sua inscrição no Campeonato de Speedsoft Capital Strike foi aprovada.\nModalidade: ${modalidade}${equipe ? ` · ${equipe}` : ''}\nIngresso: ${numero}\n\nAbra a versão completa deste e-mail para ver o QR Code, que será usado no credenciamento.\n\n19 e 20 de dezembro de 2026 · Brasília/DF`
  return { subject: `Inscrição aprovada · ${numero} | Campeonato de Speedsoft`, html, text }
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
        const m = emailIngresso(t.holder_name, MODALIDADES[reg!.modalidade as ModalidadeId].nome, reg!.squad_nome, t.ticket_number, qr)
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
    if (!evento || !['published', 'ongoing'].includes(evento.status)) throw new Error('Pré-cadastro indisponível no momento')

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
      logo_url: logoUrl,
      cidade: str(body.cidade) || null,
      uf: str(body.uf) || null,
      responsavel_nome: resp.nome,
      responsavel_email: resp.email.toLowerCase(),
      responsavel_telefone: resp.telefone,
      responsavel_data_nascimento: resp.dataNascimento,
      jogadores: [jogador(resp, def.equipe), ...integrantes.map((p) => jogador(p, false))],
      observacoes: str(body.observacoes) || null,
      aceite_termos: true,
      status: 'pendente',
      source_site: str(body.sourceSite) || origem.replace(/^https?:\/\//, '') || null,
      ip_hash: ipHash,
    }).select('id, created_at, modalidade').single()
    if (error) throw new Error(`Falha ao salvar pré-cadastro: ${error.message}`)

    const m = emailRecebido(resp.nome, def.nome)
    const envio = await enviarEmail(resp.email, m.subject, m.html, m.text)
    await registrarEnvio(evento.id, null, 'speedsoft-pre-cadastro-recebido', resp.email, envio, { registration_id: inserido.id })
    if (!envio.ok) console.error('e-mail de confirmação falhou', envio.body)

    return json({ success: true, registration: inserido, email: { sent: envio.ok, id: envio.id } })
  } catch (err) {
    console.error('speedsoft-pre-cadastro', err)
    return json({ success: false, error: err instanceof Error ? err.message : 'Erro inesperado' }, 400)
  }
})
