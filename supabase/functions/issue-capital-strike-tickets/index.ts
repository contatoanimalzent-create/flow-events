import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { generateQRCodeUrl, sendResendEmail } from '../_shared/transactional-email.ts'

const EVENT_ID = '2b7682c0-15f7-4909-954b-8ee8f086978c'
const ORG_ID = '00000000-0000-0000-0000-000000000001'
const GROUP_LINKS = {
  COALIZAO: 'https://chat.whatsapp.com/D5AotUXrtdlKBZaK3UIZt5?mode=gi_t',
  ALIANCA: 'https://chat.whatsapp.com/IZAAyIdnUN2C8N2GNPJIO7?mode=gi_t',
  OPERADORES: 'https://chat.whatsapp.com/HVk2nBYhvjNA72vmnrcnmv',
} as const
const CAPITAL_STRIKE_ASSETS = {
  LOGO: 'https://raw.githubusercontent.com/contatoanimalzent-create/flow-events/main/public/capital-strike/logo-a-origem.png',
  PATCH_COALIZAO: 'https://raw.githubusercontent.com/contatoanimalzent-create/flow-events/main/public/capital-strike/patch-coalizao.png',
  PATCH_ALIANCA: 'https://raw.githubusercontent.com/contatoanimalzent-create/flow-events/main/public/capital-strike/patch-alianca.png',
} as const

const ARMY_CONFIG: Record<string, { ticketTypeId: string; batchId: string }> = {
  COALIZAO: {
    ticketTypeId: '6b9a13da-a497-4a60-a9dd-fd6bcf308eb0',
    batchId: '0586c69f-f529-41cb-9e6b-5cc30eda43fe',
  },
  ALIANCA: {
    ticketTypeId: '6128428c-c717-4a75-a0f4-c79b235b6459',
    batchId: 'a7672134-a054-4bb3-b812-79110453be5f',
  },
}

interface Inscricao {
  id: string
  source: 'inscricoes' | 'capital_strike_registrations'
  nome_completo: string
  email: string
  telefone: string
  cpf: string | null
  exercito: string
  categoria: string
  kit_status: string
  shirt_size?: string | null
  confirmado: boolean
}

function buildEmailAlias(email: string, suffix: string) {
  const [local, domain] = email.toLowerCase().trim().split('@')
  if (!local || !domain) return email.toLowerCase().trim()
  return `${local.replace(/\+.*/, '')}+${suffix}@${domain}`
}

function normalizeArmy(value?: string | null) {
  const normalized = (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (normalized.includes('COALIZ')) return 'COALIZAO'
  if (normalized.includes('ALIAN')) return 'ALIANCA'
  return normalized
}

function armyLabelFromKey(armyKey: string) {
  return armyKey === 'COALIZAO' ? 'Coalizão' : 'Aliança'
}

function deriveKitStatus(value?: string | null) {
  const normalized = (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (normalized.includes('SEM') && normalized.includes('KIT')) return 'Sem kit'
  if (normalized.includes('COM') && normalized.includes('KIT')) return 'Com kit'
  if (normalized.includes('KIT')) return 'Com kit'
  return 'Não informado'
}

function normalizeCpfForStorage(value?: string | null) {
  const digits = value ? value.replace(/[^0-9]/g, '') : ''
  return digits.length === 11 ? digits : null
}

function buildShortCode(qrToken: string) {
  return qrToken.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
}

function buildTicketMetadata(inscricao: Inscricao, armyKey: string, qrToken?: string) {
  return {
    event_key: 'capital-strike-a-origem',
    registration_id: inscricao.id,
    registration_source: inscricao.source,
    army_key: armyKey,
    army_label: armyLabelFromKey(armyKey),
    category: inscricao.categoria,
    registration_category: inscricao.categoria,
    kit_status: inscricao.kit_status,
    shirt_size: inscricao.shirt_size ?? null,
    tamanho_camiseta: inscricao.shirt_size ?? null,
    short_code: qrToken ? buildShortCode(qrToken) : null,
  }
}

function parseRequestedIds(ids: string[] | null, source: Inscricao['source']) {
  if (!ids || ids.length === 0) return null
  const prefix = `${source}:`
  const parsed = ids
    .map((id) => id.startsWith(prefix) ? id.slice(prefix.length) : id.includes(':') ? null : id)
    .filter((id): id is string => Boolean(id))
  return parsed.length > 0 ? parsed : []
}

async function fetchLegacyInscricoes(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  ids: string[] | null,
  includeUnconfirmed = false,
): Promise<Inscricao[]> {
  if (ids && ids.length === 0) return []
  let query = supabase
    .from('inscricoes')
    .select('id, nome_completo, email, telefone, cpf, exercito, categoria, tamanho_camiseta, confirmado')
    .order('nome_completo', { ascending: true })

  if (!includeUnconfirmed) query = query.eq('confirmado', true)
  if (ids && ids.length > 0) query = query.in('id', ids)

  const { data, error } = await query
  if (error) {
    if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) return []
    throw new Error(`Erro ao buscar inscricoes: ${error.message}`)
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    source: 'inscricoes',
    nome_completo: String(row.nome_completo ?? ''),
    email: String(row.email ?? ''),
    telefone: String(row.telefone ?? ''),
    cpf: row.cpf ? String(row.cpf) : null,
    exercito: normalizeArmy(String(row.exercito ?? '')),
    categoria: String(row.categoria ?? 'OPERADOR'),
    kit_status: deriveKitStatus(String(row.categoria ?? '')),
    shirt_size: row.tamanho_camiseta ? String(row.tamanho_camiseta) : null,
    confirmado: Boolean(row.confirmado),
  }))
}

async function fetchCapitalStrikeRegistrations(supabase: ReturnType<typeof createSupabaseAdminClient>, ids: string[] | null): Promise<Inscricao[]> {
  if (ids && ids.length === 0) return []
  let query = supabase
    .from('capital_strike_registrations')
    .select('id, full_name, email, phone, cpf, army, squad, kit_status')
    .order('full_name', { ascending: true })

  if (ids && ids.length > 0) query = query.in('id', ids)

  const { data, error } = await query
  if (error) {
    if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) return []
    throw new Error(`Erro ao buscar registros Capital Strike: ${error.message}`)
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    source: 'capital_strike_registrations',
    nome_completo: String(row.full_name ?? ''),
    email: String(row.email ?? ''),
    telefone: String(row.phone ?? ''),
    cpf: row.cpf ? String(row.cpf) : null,
    exercito: normalizeArmy(String(row.army ?? '')),
    categoria: String(row.squad ?? 'OPERADOR'),
    kit_status: String(row.kit_status ?? 'Não informado'),
    shirt_size: null,
    confirmado: true,
  }))
}

function dedupeByEmail(inscricoes: Inscricao[]) {
  const byEmail = new Map<string, Inscricao>()
  for (const inscricao of inscricoes) {
    const email = inscricao.email.toLowerCase().trim()
    if (!email) continue
    if (!byEmail.has(email)) byEmail.set(email, inscricao)
  }
  return Array.from(byEmail.values()).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, 'pt-BR'))
}

function sortRegistrations(inscricoes: Inscricao[]) {
  return [...inscricoes].sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, 'pt-BR'))
}

async function fetchExistingTickets(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const pageSize = 1000
  const rows: Array<Record<string, unknown>> = []

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('digital_tickets')
      .select('id, holder_email, qr_token, ticket_number, email_sent_at, metadata, created_at')
      .eq('event_id', EVENT_ID)
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`Erro ao buscar tickets existentes: ${error.message}`)

    const page = (data ?? []) as Array<Record<string, unknown>>
    rows.push(...page)
    if (page.length < pageSize) break
  }

  return rows
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const body = await req.json()
    const mode: 'generate' | 'send' | 'generate_and_send' = body.mode ?? 'generate_and_send'
    const inscricaoIds: string[] | null = body.inscricao_ids ?? null
    const dryRun: boolean = body.dry_run ?? false
    const testSend: boolean = body.test_send === true
    const testDeliveryEmail = typeof body.test_email === 'string' ? body.test_email.toLowerCase().trim() : ''
    const includeUnconfirmed: boolean = body.include_unconfirmed === true

    let inscricoes: Inscricao[]
    if (testSend) {
      if (!testDeliveryEmail || !testDeliveryEmail.includes('@')) {
        throw new Error('test_email obrigatorio para envio de teste')
      }

      inscricoes = [
        {
          id: 'test-coalizao',
          source: 'capital_strike_registrations',
          nome_completo: 'Teste QR Coalizao',
          email: buildEmailAlias(testDeliveryEmail, 'teste-coalizao'),
          telefone: '',
          cpf: null,
          exercito: 'COALIZAO',
          categoria: 'OPERADOR',
          kit_status: 'Não informado',
          confirmado: true,
        },
        {
          id: 'test-alianca',
          source: 'capital_strike_registrations',
          nome_completo: 'Teste QR Alianca',
          email: buildEmailAlias(testDeliveryEmail, 'teste-alianca'),
          telefone: '',
          cpf: null,
          exercito: 'ALIANCA',
          categoria: 'OPERADOR',
          kit_status: 'Não informado',
          confirmado: true,
        },
      ]
    } else {
      const [legacyInscricoes, capitalRegistrations] = await Promise.all([
        fetchLegacyInscricoes(supabase, parseRequestedIds(inscricaoIds, 'inscricoes'), includeUnconfirmed),
        fetchCapitalStrikeRegistrations(supabase, parseRequestedIds(inscricaoIds, 'capital_strike_registrations')),
      ])
      const allRegistrations = [...legacyInscricoes, ...capitalRegistrations]
      inscricoes = includeUnconfirmed ? sortRegistrations(allRegistrations) : dedupeByEmail(allRegistrations)
    }

    if (inscricoes.length === 0) {
      return Response.json({ ok: true, message: 'Nenhuma inscrição confirmada encontrada', stats: { total: 0 } }, { headers: corsHeaders })
    }

    // 2. Check which inscricoes already have digital_tickets.
    // registration_source + registration_id is the stable idempotency key; email is fallback only.
    const existingTickets = await fetchExistingTickets(supabase)

    const existingByEmail = new Map<string, { id: string; qr_token: string; ticket_number: string; email_sent_at: string | null }>()
    const existingByRegistration = new Map<string, { id: string; qr_token: string; ticket_number: string; email_sent_at: string | null }>()
    for (const t of (existingTickets ?? []) as Array<Record<string, unknown>>) {
      const existing = {
        id: String(t.id),
        qr_token: String(t.qr_token),
        ticket_number: String(t.ticket_number),
        email_sent_at: t.email_sent_at ? String(t.email_sent_at) : null,
      }
      const metadata = (t.metadata ?? {}) as Record<string, unknown>
      const source = String(metadata.registration_source ?? '')
      const registrationId = String(metadata.registration_id ?? '')
      if (source && registrationId && !existingByRegistration.has(`${source}:${registrationId}`)) {
        existingByRegistration.set(`${source}:${registrationId}`, existing)
      }
      const email = String(t.holder_email ?? '').toLowerCase().trim()
      if (email && !existingByEmail.has(email)) existingByEmail.set(email, existing)
    }

    const stats = { total: inscricoes.length, already_had_ticket: 0, tickets_created: 0, emails_sent: 0, errors: [] as string[] }
    const results: Array<{ inscricao_id: string; nome: string; email: string; ticket_id: string; qr_token: string; qr_url: string | null; email_sent: boolean }> = []

    for (const inscricao of inscricoes as Inscricao[]) {
      const email = inscricao.email.toLowerCase().trim()
      const cpfDigits = normalizeCpfForStorage(inscricao.cpf)
      const armyKey = inscricao.exercito.toUpperCase()
      const config = ARMY_CONFIG[armyKey]

      if (!config) {
        stats.errors.push(`Exército desconhecido para ${inscricao.nome_completo}: ${inscricao.exercito}`)
        continue
      }

      let ticketId: string
      let qrToken: string
      let ticketNumber: string

      const existing = existingByRegistration.get(`${inscricao.source}:${inscricao.id}`) ?? existingByEmail.get(email)

      if (existing) {
        stats.already_had_ticket++
        ticketId = existing.id
        qrToken = existing.qr_token
        ticketNumber = existing.ticket_number
      } else if (mode === 'send') {
        // send-only mode: skip inscricoes without tickets
        continue
      } else {
        if (dryRun) {
          results.push({ inscricao_id: inscricao.id, nome: inscricao.nome_completo, email, ticket_id: 'dry-run', qr_token: 'dry-run', qr_url: null, email_sent: false })
          stats.tickets_created++
          continue
        }

        // Create order
        const orderId = crypto.randomUUID()
        const orderItemId = crypto.randomUUID()
        qrToken = crypto.randomUUID()
        ticketNumber = `CS-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
        const newTicketMetadata = buildTicketMetadata(inscricao, armyKey, qrToken)

        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          event_id: EVENT_ID,
          organization_id: ORG_ID,
          buyer_name: inscricao.nome_completo,
          buyer_email: email,
          buyer_phone: inscricao.telefone,
          buyer_cpf: null,
          subtotal: 0,
          total_amount: 0,
          status: 'paid',
          payment_method: 'free',
          paid_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          source_channel: 'capital-strike-registration',
          metadata: {
            inscricao_id: inscricao.id,
            inscricao_source: inscricao.source,
            exercito: inscricao.exercito,
            categoria: inscricao.categoria,
            test_send: testSend,
            delivery_email: testSend ? testDeliveryEmail : null,
          },
        })

        if (orderError) {
          stats.errors.push(`Erro order para ${inscricao.nome_completo}: ${orderError.message}`)
          continue
        }

        const { error: itemError } = await supabase.from('order_items').insert({
          id: orderItemId,
          order_id: orderId,
          ticket_type_id: config.ticketTypeId,
          batch_id: config.batchId,
          event_id: EVENT_ID,
          holder_name: inscricao.nome_completo,
          holder_email: email,
          holder_cpf: cpfDigits,
          holder_phone: inscricao.telefone,
          unit_price: 0,
          quantity: 1,
          total_price: 0,
          subtotal: 0,
          discount_amount: 0,
          fee_amount: 0,
          total_amount: 0,
        })

        if (itemError) {
          stats.errors.push(`Erro order_item para ${inscricao.nome_completo}: ${itemError.message}`)
          continue
        }

        const { data: ticketData, error: ticketError } = await supabase.from('digital_tickets').insert({
          order_id: orderId,
          order_item_id: orderItemId,
          ticket_type_id: config.ticketTypeId,
          batch_id: config.batchId,
          event_id: EVENT_ID,
          ticket_number: ticketNumber,
          qr_token: qrToken,
          holder_name: inscricao.nome_completo,
          holder_email: email,
          holder_cpf: cpfDigits,
          status: 'confirmed',
          is_vip: false,
          metadata: newTicketMetadata,
        }).select('id').single()

        if (ticketError) {
          stats.errors.push(`Erro ticket para ${inscricao.nome_completo}: ${ticketError.message}`)
          continue
        }

        ticketId = (ticketData as Record<string, unknown>).id as string
        stats.tickets_created++
        const createdTicket = { id: ticketId, qr_token: qrToken, ticket_number: ticketNumber, email_sent_at: null }
        existingByRegistration.set(`${inscricao.source}:${inscricao.id}`, createdTicket)
        existingByEmail.set(email, createdTicket)
      }

      const ticketMetadata = buildTicketMetadata(inscricao, armyKey, qrToken)

      if (!dryRun) {
        await supabase
          .from('digital_tickets')
          .update({ metadata: ticketMetadata })
          .eq('id', ticketId)
      }

      // Send email
      let emailSent = false
      let qrUrlForResult: string | null = null
      if (mode !== 'generate' && !dryRun) {
        try {
          const manualCode = buildShortCode(qrToken)
          const qrUrl = await generateQRCodeUrl(manualCode)
          qrUrlForResult = qrUrl

          const armyLabel = armyLabelFromKey(armyKey)
          const armyColor = armyKey === 'COALIZAO' ? '#F59E0B' : '#3B82F6'
          const armyBg = armyKey === 'COALIZAO' ? '#78350F' : '#1E3A5F'

          const html = buildCapitalStrikeEmail({
            nome: inscricao.nome_completo,
            exercito: armyLabel,
            exercitoColor: armyColor,
            exercitoBg: armyBg,
            categoria: inscricao.categoria,
            ticketNumber,
            manualCode,
            qrToken,
            qrUrl,
            armyGroupLink: armyKey === 'COALIZAO' ? GROUP_LINKS.COALIZAO : GROUP_LINKS.ALIANCA,
            operatorsGroupLink: GROUP_LINKS.OPERADORES,
          })

          const deliveryEmail = testSend ? testDeliveryEmail : email
          const result = await sendResendEmail({
            to: deliveryEmail,
            subject: `${testSend ? '[TESTE] ' : ''}Seu QR Code - Capital Strike: A Origem | ${armyLabel}`,
            html,
            text: `Ola ${inscricao.nome_completo},\n\nSeu credenciamento para Capital Strike - A Origem esta confirmado!\nExercito: ${armyLabel}\nCategoria: ${inscricao.categoria}\nTicket: ${ticketNumber}\nCodigo manual: ${manualCode}\n\nQR Code: ${qrUrl ?? manualCode}\n\nEntre nos grupos oficiais:\nGrupo ${armyLabel}: ${armyKey === 'COALIZAO' ? GROUP_LINKS.COALIZAO : GROUP_LINKS.ALIANCA}\nGrupo Operadores: ${GROUP_LINKS.OPERADORES}\n\nApresente o QR Code deste email na entrada do evento.\n\nNos vemos no campo de batalha!`,
          })

          if (result.status === 'sent') {
            emailSent = true
            stats.emails_sent++

            await supabase
              .from('digital_tickets')
              .update({ email_sent_at: new Date().toISOString() })
              .eq('id', ticketId)
          }
        } catch (emailErr: unknown) {
          const msg = emailErr instanceof Error ? emailErr.message : String(emailErr)
          stats.errors.push(`Erro email para ${inscricao.nome_completo}: ${msg}`)
        }
      }

      results.push({
        inscricao_id: inscricao.id,
        nome: inscricao.nome_completo,
        email: testSend ? testDeliveryEmail : email,
        ticket_id: ticketId,
        qr_token: qrToken,
        qr_url: qrUrlForResult,
        email_sent: emailSent,
      })
    }

    return Response.json({ ok: true, stats, results: results.slice(0, 20) }, { headers: corsHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[issue-capital-strike-tickets]', message)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})

function buildCapitalStrikeEmail(params: {
  nome: string
  exercito: string
  exercitoColor: string
  exercitoBg: string
  categoria: string
  ticketNumber: string
  manualCode: string
  qrToken: string
  qrUrl: string | null
  armyGroupLink: string
  operatorsGroupLink: string
}) {
  const { nome, exercito, exercitoColor, exercitoBg, categoria, ticketNumber, manualCode, qrToken, qrUrl, armyGroupLink, operatorsGroupLink } = params
  const firstName = nome.split(' ')[0]
  const isCoalizao = exercito === 'Coalizão'
  const accentDark = isCoalizao ? '#92400E' : '#1E3A8A'
  const patchUrl = isCoalizao ? CAPITAL_STRIKE_ASSETS.PATCH_COALIZAO : CAPITAL_STRIKE_ASSETS.PATCH_ALIANCA
  const qrLinkHtml = qrUrl
    ? `<div style="margin-top:16px;">
        <a href="${qrUrl}" target="_blank" rel="noopener"
          style="display:inline-block;text-decoration:none;border-radius:10px;border:1px solid ${exercitoColor}66;color:${exercitoColor};background:${exercitoColor}11;padding:10px 16px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
          Abrir link do QR Code
        </a>
      </div>`
    : `<div style="margin-top:16px;font-size:12px;color:${exercitoColor};font-weight:800;letter-spacing:1px;">Codigo: ${manualCode}</div>`

  const qrImage = qrUrl
    ? `<img src="${qrUrl}" alt="QR Code" width="240" height="240" style="display:block;border-radius:12px;" />`
    : `<div style="width:240px;height:240px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:20px;font-weight:900;color:#000;letter-spacing:3px;">${manualCode}</span>
      </div>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]><style>table,td{font-family:Arial,sans-serif!important;}v\\:*{behavior:url(#default#VML);}o\\:*{behavior:url(#default#VML);}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#000000;">
<tr><td align="center" style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" style="max-width:620px;width:100%;background:#060606;">

<!-- ═══ HERO BANNER ═══ -->
<tr><td style="padding:0;background:linear-gradient(135deg, #000000 0%, ${accentDark} 50%, #000000 100%);">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <!-- Top accent line -->
    <tr><td style="height:5px;background:linear-gradient(90deg, transparent 0%, ${exercitoColor} 20%, ${exercitoColor} 80%, transparent 100%);"></td></tr>
    <!-- Spacer -->
    <tr><td style="height:48px;"></td></tr>
    <!-- Subtitle pre-header -->
    <tr><td align="center" style="padding:0 40px;">
      <div style="display:inline-block;padding:6px 20px;border:1px solid ${exercitoColor}55;border-radius:24px;background:${exercitoColor}15;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};">Opera&ccedil;&atilde;o T&aacute;tica de Airsoft</span>
      </div>
    </td></tr>
    <tr><td style="height:20px;"></td></tr>
    <!-- Main title -->
    <tr><td align="center" style="padding:0 32px;">
      <img src="${CAPITAL_STRIKE_ASSETS.LOGO}" alt="Capital Strike - A Origem" width="360" style="display:block;width:100%;max-width:360px;height:auto;margin:0 auto;" />
      <div style="margin-top:12px;font-size:14px;font-style:italic;color:rgba(255,255,255,0.5);letter-spacing:1px;">&#x201C;Toda guerra tem um come&ccedil;o&#x201D;</div>
    </td></tr>
    <tr><td style="height:28px;"></td></tr>
    <!-- Date/location pills -->
    <tr><td align="center" style="padding:0 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0 6px;">
            <div style="display:inline-block;padding:8px 18px;border-radius:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);">
              <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#FFFFFF;">&#x1F4C5; 05&ndash;07 Jun 2026</span>
            </div>
          </td>
          <td style="padding:0 6px;">
            <div style="display:inline-block;padding:8px 18px;border-radius:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);">
              <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#FFFFFF;">&#x1F4CD; Bras&iacute;lia/DF</span>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="height:40px;"></td></tr>
    <!-- Bottom fade line -->
    <tr><td style="height:2px;background:linear-gradient(90deg, transparent 0%, ${exercitoColor}66 50%, transparent 100%);"></td></tr>
  </table>
</td></tr>

<!-- ═══ GREETING + STATUS ═══ -->
<tr><td style="padding:36px 36px 0 36px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td>
        <div style="font-size:18px;color:#FFFFFF;line-height:1.6;">
          E a&iacute;, <strong>${firstName}</strong>!
        </div>
        <div style="font-size:15px;color:rgba(255,255,255,0.6);line-height:1.7;margin-top:8px;">
          Seu credenciamento est&aacute; <strong style="color:${exercitoColor};">confirmado</strong>. Apresente o QR&nbsp;Code abaixo na entrada do evento.
        </div>
      </td>
    </tr>
  </table>
</td></tr>

<!-- ═══ ARMY & ROLE CARD ═══ -->
<tr><td style="padding:24px 36px 0 36px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:linear-gradient(135deg, ${exercitoBg} 0%, ${accentDark}88 100%);border:2px solid ${exercitoColor}44;border-radius:16px;">
    <tr>
      <td style="padding:20px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="82" valign="middle">
              <img src="${patchUrl}" alt="Patch ${exercito}" width="72" height="72" style="display:block;width:72px;height:72px;border-radius:16px;border:2px solid ${exercitoColor}55;object-fit:contain;background:#050505;" />
            </td>
            <td style="padding-left:16px;" valign="middle">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${exercitoColor}99;">Ex&eacute;rcito</div>
              <div style="font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:${exercitoColor};margin-top:2px;">${exercito}</div>
            </td>
            <td align="right" valign="middle">
              <div style="display:inline-block;padding:8px 20px;border-radius:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);">Categoria</div>
                <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#FFFFFF;margin-top:2px;">${categoria}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td></tr>

<!-- GROUP LINKS -->
<tr><td style="padding:24px 36px 0 36px;">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:5px;color:${exercitoColor};margin-bottom:16px;">Grupos Oficiais</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
    <tr>
      <td style="padding:22px 24px;">
        <div style="font-size:14px;color:rgba(255,255,255,0.72);line-height:1.6;margin-bottom:18px;">
          Entre no grupo do seu ex&eacute;rcito e tamb&eacute;m no grupo geral dos Operadores para receber instru&ccedil;&otilde;es oficiais.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:6px 0;">
              <a href="${armyGroupLink}" target="_blank" rel="noopener"
                style="display:block;text-decoration:none;background:${exercitoColor};color:#050505;border-radius:12px;padding:14px 18px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-align:center;">
                Entrar no grupo ${exercito}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0 0 0;">
              <a href="${operatorsGroupLink}" target="_blank" rel="noopener"
                style="display:block;text-decoration:none;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#ffffff;border-radius:12px;padding:14px 18px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-align:center;">
                Entrar no grupo Operadores
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td></tr>

<!-- ═══ QR CODE ═══ -->
<tr><td style="padding:32px 36px 0 36px;">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:5px;color:${exercitoColor};margin-bottom:20px;">Credencial Digital</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:24px;">
    <tr><td style="padding:36px 24px;" align="center">
      <!-- QR glow wrapper -->
      <div style="padding:16px;background:#ffffff;border-radius:20px;display:inline-block;box-shadow:0 0 60px ${exercitoColor}33, 0 0 120px ${exercitoColor}11;">
        ${qrImage}
      </div>
      <!-- Name -->
      <div style="margin-top:24px;font-size:18px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">
        ${nome}
      </div>
      <!-- Ticket number -->
      <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.35);font-family:'Courier New',Courier,monospace;letter-spacing:2px;">
        ${ticketNumber}
      </div>
      <div style="margin-top:10px;display:inline-block;padding:8px 14px;border-radius:10px;background:${exercitoColor}22;border:1px solid ${exercitoColor}55;font-size:14px;font-weight:900;color:#FFFFFF;font-family:'Courier New',Courier,monospace;letter-spacing:3px;">
        ${manualCode}
      </div>
      <!-- Status badge -->
      <div style="margin-top:20px;">
        <div style="display:inline-block;padding:8px 28px;border-radius:30px;background:linear-gradient(135deg, ${exercitoColor}33 0%, ${exercitoColor}11 100%);border:1px solid ${exercitoColor}55;">
          <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:${exercitoColor};">&#x2713; Confirmado</span>
        </div>
      </div>
      ${qrLinkHtml}
    </td></tr>
  </table>
</td></tr>

<!-- ═══ EVENT INTEL ═══ -->
<tr><td style="padding:32px 36px 0 36px;">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:5px;color:${exercitoColor};margin-bottom:20px;">Briefing da Opera&ccedil;&atilde;o</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
    <!-- Row 1: Data -->
    <tr>
      <td style="padding:20px 24px 0 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="32" valign="top" style="font-size:18px;line-height:1;">&#x1F4C5;</td>
            <td style="padding-left:8px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);">Data</div>
              <div style="font-size:14px;font-weight:600;color:#FFFFFF;margin-top:3px;">05 a 07 de Junho de 2026</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Row 2: Local -->
    <tr>
      <td style="padding:16px 24px 0 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="32" valign="top" style="font-size:18px;line-height:1;">&#x1F4CD;</td>
            <td style="padding-left:8px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);">Local</div>
              <div style="font-size:14px;font-weight:600;color:#FFFFFF;margin-top:3px;">Bras&iacute;lia/DF</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Row 3: Credenciamento -->
    <tr>
      <td style="padding:16px 24px 20px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="32" valign="top" style="font-size:18px;line-height:1;">&#x23F0;</td>
            <td style="padding-left:8px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);">Credenciamento</div>
              <div style="font-size:14px;font-weight:600;color:#FFFFFF;margin-top:3px;">A partir das 08h00 (hor&aacute;rio de Bras&iacute;lia)</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td></tr>

<!-- ═══ INSTRUCTIONS ═══ -->
<tr><td style="padding:28px 36px 0 36px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:linear-gradient(135deg, ${exercitoColor}0D 0%, transparent 100%);border:1px solid ${exercitoColor}22;border-radius:16px;">
    <tr><td style="padding:24px 28px;">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};margin-bottom:18px;">Procedimento de Acesso</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="32" valign="top"><div style="width:26px;height:26px;border-radius:8px;background:${exercitoColor}22;border:1px solid ${exercitoColor}44;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:${exercitoColor};">1</div></td>
              <td style="padding-left:12px;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.5;">Chegue com anteced&ecirc;ncia ao local</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="32" valign="top"><div style="width:26px;height:26px;border-radius:8px;background:${exercitoColor}22;border:1px solid ${exercitoColor}44;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:${exercitoColor};">2</div></td>
              <td style="padding-left:12px;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.5;">Abra este e-mail no celular</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="32" valign="top"><div style="width:26px;height:26px;border-radius:8px;background:${exercitoColor}22;border:1px solid ${exercitoColor}44;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:${exercitoColor};">3</div></td>
              <td style="padding-left:12px;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.5;">Apresente o QR&nbsp;Code no credenciamento</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="32" valign="top"><div style="width:26px;height:26px;border-radius:8px;background:${exercitoColor}22;border:1px solid ${exercitoColor}44;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:${exercitoColor};">4</div></td>
              <td style="padding-left:12px;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.5;">Receba seu kit e entre em posi&ccedil;&atilde;o!</td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- ═══ WARNING ═══ -->
<tr><td style="padding:24px 36px 0 36px;">
  <div style="font-size:11px;color:rgba(255,255,255,0.3);line-height:1.7;border-left:3px solid ${exercitoColor}44;padding-left:16px;">
    <strong style="color:rgba(255,255,255,0.5);">Importante:</strong>
    Este QR&nbsp;Code &eacute; pessoal e intransfer&iacute;vel. Cada operador deve apresentar o seu pr&oacute;prio c&oacute;digo no credenciamento.
  </div>
</td></tr>

<!-- ═══ CTA ═══ -->
<tr><td style="padding:40px 36px 0 36px;" align="center">
  <div style="height:1px;background:linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);margin-bottom:36px;"></div>
  <div style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};line-height:1.4;">
    Nos vemos no<br>campo de batalha!
  </div>
  <div style="margin-top:8px;font-size:32px;">&#x26A1;</div>
</td></tr>

<!-- ═══ FOOTER ═══ -->
<tr><td style="padding:40px 36px 36px 36px;">
  <div style="height:1px;background:linear-gradient(90deg, transparent, ${exercitoColor}33, transparent);margin-bottom:28px;"></div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td>
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};">Capital Strike</div>
        <div style="margin-top:4px;font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:1px;">A Origem &bull; 2026</div>
      </td>
      <td align="right" valign="bottom">
        <div style="font-size:10px;color:rgba(255,255,255,0.2);">capitalstrike.com.br</div>
      </td>
    </tr>
  </table>
  <div style="margin-top:20px;font-size:10px;color:rgba(255,255,255,0.15);text-align:center;">
    Powered by Pulse Events &bull; &copy; 2026
  </div>
</td></tr>

<!-- Bottom accent line -->
<tr><td style="height:5px;background:linear-gradient(90deg, transparent 0%, ${exercitoColor} 20%, ${exercitoColor} 80%, transparent 100%);"></td></tr>

</table>
</td></tr>
</table>

</body>
</html>`
}
