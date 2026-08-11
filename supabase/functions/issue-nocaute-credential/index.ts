import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import {
  generateQRCodeUrl,
  sendResendEmail,
} from '../_shared/transactional-email.ts'

const SOURCE = 'seminarios_nocaute'
const EVENT_SLUG = 'seminarios-nocaute-fabricio-werdum'
const NOCAUTE_LOGO = 'https://seminarionocaute.com/brand/logo-horizontal.png'
const NOCAUTE_SITE = 'https://seminarionocaute.com'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character] ?? character)
}

function buildNocauteEmail(params: {
  fullName: string
  registrationCode: string
  qrToken: string
  qrUrl: string | null
  modality?: string | null
}) {
  const name = escapeHtml(params.fullName)
  const firstName = escapeHtml(params.fullName.trim().split(/\s+/)[0] || params.fullName)
  const code = escapeHtml(params.registrationCode)
  const modality = params.modality ? escapeHtml(params.modality) : ''
  const qr = params.qrUrl
    ? `<img src="${params.qrUrl}" width="232" height="232" alt="QR Code da inscri&ccedil;&atilde;o" style="display:block;width:232px;height:232px;border:0;" />`
    : `<div style="font:800 26px Arial,sans-serif;letter-spacing:3px;color:#050505;padding:88px 20px;">${code}</div>`

  return {
    subject: `Inscrição confirmada — Fabrício Werdum | Seminários Nocaute`,
    html: `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#050505;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#050505;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#101010;border:1px solid #2b2b2b;">
<tr><td style="height:6px;background:#e50914;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:34px 32px 28px;"><img src="${NOCAUTE_LOGO}" width="260" alt="Semin&aacute;rios Nocaute" style="display:block;width:260px;max-width:78%;height:auto;border:0;"></td></tr>
<tr><td style="padding:0 32px;"><div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#e50914;">Inscri&ccedil;&atilde;o confirmada</div>
<h1 style="margin:12px 0 0;font-size:42px;line-height:1.08;letter-spacing:-1px;text-transform:uppercase;color:#ffffff;">Fabr&iacute;cio Werdum</h1>
<p style="margin:18px 0 0;font-size:17px;line-height:1.65;color:#c7c7c7;">${firstName}, sua vaga est&aacute; confirmada. Este &eacute; o seu acesso oficial ao Semin&aacute;rios Nocaute.</p></td></tr>
<tr><td style="padding:28px 32px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #303030;border-bottom:1px solid #303030;"><tr>
<td style="padding:20px 8px 20px 0;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777;">Data e hor&aacute;rio</div><div style="margin-top:6px;font-size:15px;font-weight:700;color:#fff;">29 AGO 2026 &middot; 10H</div></td>
<td style="padding:20px 0 20px 8px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777;">Local</div><div style="margin-top:6px;font-size:15px;font-weight:700;color:#fff;">Cais do Lago &middot; Bras&iacute;lia/DF</div></td>
</tr></table></td></tr>
<tr><td align="center" style="padding:34px 32px 0;"><div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#e50914;">Seu QR Code</div>
<div style="display:inline-block;margin-top:18px;padding:14px;background:#ffffff;">${qr}</div>
<div style="margin-top:18px;font-size:12px;letter-spacing:2px;color:#777;">C&Oacute;DIGO DE INSCRI&Ccedil;&Atilde;O</div>
<div style="margin-top:6px;font:800 24px 'Courier New',monospace;letter-spacing:2px;color:#ffffff;">${code}</div>
<div style="margin-top:8px;font-size:14px;color:#b5b5b5;">${name}${modality ? ` &middot; ${modality}` : ''}</div></td></tr>
<tr><td style="padding:32px;"><div style="background:#1a1a1a;border-left:4px solid #e50914;padding:20px 22px;color:#d0d0d0;font-size:14px;line-height:1.7;"><strong style="color:#fff;">No dia:</strong> abra este e-mail no celular e apresente o QR Code no credenciamento. O c&oacute;digo &eacute; pessoal e intransfer&iacute;vel.</div></td></tr>
<tr><td align="center" style="padding:0 32px 34px;"><a href="${NOCAUTE_SITE}" style="display:inline-block;background:#e50914;color:#ffffff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:15px 24px;">Ver o evento</a></td></tr>
<tr><td style="padding:22px 32px;border-top:1px solid #2b2b2b;color:#686868;font-size:10px;line-height:1.6;text-align:center;">SEMIN&Aacute;RIOS NOCAUTE<br>Credencial e check-in emitidos pelo Pulse.</td></tr>
</table></td></tr></table></body></html>`,
    text: `SEMINÁRIOS NOCAUTE — INSCRIÇÃO CONFIRMADA\n\nOlá, ${params.fullName}.\nSua vaga para o seminário com Fabrício Werdum está confirmada.\n\n29 de agosto de 2026, às 10h\nCais do Lago — Setor de Clubes Sul, Brasília/DF\n\nCódigo: ${params.registrationCode}\nQR Code: ${params.qrUrl ?? params.qrToken}\n\nApresente este e-mail no credenciamento.\n${NOCAUTE_SITE}`,
  }
}

type Payload = {
  registrationId: string
  registrationCode: string
  fullName: string
  email: string
  phone: string
  cpf?: string | null
  modality?: string | null
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function authorized(req: Request) {
  const expected = Deno.env.get('NOCAUTE_INTEGRATION_KEY')
  const supplied = req.headers.get('x-pulse-integration-key')
  return Boolean(expected && supplied && expected.length >= 32 && supplied === expected)
}

function validPayload(value: unknown): value is Payload {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return ['registrationId', 'registrationCode', 'fullName', 'email', 'phone']
    .every((key) => typeof item[key] === 'string' && String(item[key]).trim().length > 0)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405)
  if (!authorized(req)) return json({ ok: false, error: 'unauthorized' }, 401)

  try {
    const payload: unknown = await req.json()
    if (!validPayload(payload)) return json({ ok: false, error: 'invalid_payload' }, 422)

    const supabase = createSupabaseAdminClient()
    const email = payload.email.trim().toLowerCase()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id,organization_id,name,starts_at,venue_name,venue_address,cover_url,settings')
      .eq('slug', EVENT_SLUG)
      .single()
    if (eventError || !event) throw new Error('Evento Nocaute nao configurado no Pulse')

    const { data: existing } = await supabase
      .from('digital_tickets')
      .select('id,ticket_number,qr_token,qr_url,email_sent_at')
      .eq('metadata->>external_source', SOURCE)
      .eq('metadata->>external_registration_id', payload.registrationId)
      .maybeSingle()

    if (existing?.id) {
      let emailStatus = existing.email_sent_at ? 'sent' : 'pending'
      let qrUrl = existing.qr_url as string | null

      if (!existing.email_sent_at) {
        qrUrl = qrUrl ?? await generateQRCodeUrl(existing.qr_token)
        const content = buildNocauteEmail({
          fullName: payload.fullName,
          registrationCode: existing.ticket_number,
          qrToken: existing.qr_token,
          qrUrl,
          modality: payload.modality,
        })
        const delivery = await sendResendEmail({ to: email, ...content })
        emailStatus = delivery.status
        await supabase.from('digital_tickets').update({
          qr_url: qrUrl,
          email_sent_at: delivery.status === 'sent' ? new Date().toISOString() : null,
          last_resent_at: new Date().toISOString(),
        }).eq('id', existing.id)
      }

      return json({
        ok: true,
        already: true,
        ticketId: existing.id,
        ticketNumber: existing.ticket_number,
        qrUrl,
        emailStatus,
      })
    }

    const { data: ticketType, error: typeError } = await supabase
      .from('ticket_types')
      .select('id')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('position')
      .limit(1)
      .single()
    if (typeError || !ticketType) throw new Error('Tipo de ingresso Nocaute nao configurado')

    const { data: batch, error: batchError } = await supabase
      .from('ticket_batches')
      .select('id')
      .eq('event_id', event.id)
      .eq('ticket_type_id', ticketType.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    if (batchError || !batch) throw new Error('Lote Nocaute nao configurado')

    const orderId = crypto.randomUUID()
    const orderItemId = crypto.randomUUID()
    const ticketId = crypto.randomUUID()
    const qrToken = crypto.randomUUID()
    const ticketNumber = payload.registrationCode
    // O cadastro de origem continua sendo a fonte de verdade do CPF. O Pulse
    // não duplica esse dado porque a normalização legada da tabela de pedidos
    // conflita com a constraint que exige somente dígitos.
    const cpf = null
    const metadata = {
      external_source: SOURCE,
      external_registration_id: payload.registrationId,
      registration_code: payload.registrationCode,
      modality: payload.modality ?? null,
    }

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId, event_id: event.id, organization_id: event.organization_id,
      buyer_name: payload.fullName, buyer_email: email, buyer_phone: payload.phone,
      buyer_cpf: cpf, subtotal: 0, total_amount: 0, status: 'paid',
      paid_at: new Date().toISOString(), confirmed_at: new Date().toISOString(),
      source_channel: SOURCE, metadata,
    })
    if (orderError) throw orderError

    const { error: itemError } = await supabase.from('order_items').insert({
      id: orderItemId, order_id: orderId, ticket_type_id: ticketType.id,
      batch_id: batch.id, event_id: event.id, holder_name: payload.fullName,
      holder_email: email, holder_cpf: cpf, holder_phone: payload.phone,
      unit_price: 0, quantity: 1, total_price: 0, subtotal: 0,
      discount_amount: 0, fee_amount: 0, total_amount: 0,
    })
    if (itemError) throw itemError

    const { error: ticketError } = await supabase.from('digital_tickets').insert({
      id: ticketId, order_id: orderId, order_item_id: orderItemId,
      ticket_type_id: ticketType.id, batch_id: batch.id, event_id: event.id,
      ticket_number: ticketNumber, qr_token: qrToken, holder_name: payload.fullName,
      holder_email: email, holder_cpf: cpf, status: 'confirmed', metadata,
    })
    if (ticketError) throw ticketError

    const qrUrl = await generateQRCodeUrl(qrToken)
    const emailContent = buildNocauteEmail({
      fullName: payload.fullName,
      registrationCode: ticketNumber,
      qrToken,
      qrUrl,
      modality: payload.modality,
    })
    const delivery = await sendResendEmail({ to: email, ...emailContent })
    const emailSentAt = delivery.status === 'sent' ? new Date().toISOString() : null

    await supabase.from('digital_tickets').update({ qr_url: qrUrl, email_sent_at: emailSentAt }).eq('id', ticketId)

    return json({ ok: true, already: false, ticketId, ticketNumber, qrUrl, emailStatus: delivery.status })
  } catch (error) {
    const reference = crypto.randomUUID().slice(0, 10)
    console.error(`[issue-nocaute-credential:${reference}]`, error instanceof Error ? error.message : 'unknown')
    return json({ ok: false, error: 'issuance_failed', reference }, 500)
  }
})
