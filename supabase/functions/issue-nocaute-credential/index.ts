import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import {
  buildOrderConfirmationWithQREmail,
  generateQRCodeUrl,
  sendResendEmail,
} from '../_shared/transactional-email.ts'

const SOURCE = 'seminarios_nocaute'
const EVENT_SLUG = 'seminarios-nocaute-fabricio-werdum'

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

    const { data: existing } = await supabase
      .from('digital_tickets')
      .select('id,ticket_number,qr_token,qr_url,email_sent_at')
      .eq('metadata->>external_source', SOURCE)
      .eq('metadata->>external_registration_id', payload.registrationId)
      .maybeSingle()

    if (existing?.id) {
      return json({
        ok: true,
        already: true,
        ticketId: existing.id,
        ticketNumber: existing.ticket_number,
        qrUrl: existing.qr_url,
        emailStatus: existing.email_sent_at ? 'sent' : 'pending',
      })
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id,organization_id,name,starts_at,venue_name,venue_address,cover_url,settings')
      .eq('slug', EVENT_SLUG)
      .single()
    if (eventError || !event) throw new Error('Evento Nocaute nao configurado no Pulse')

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
    const cpf = payload.cpf?.replace(/\D/g, '') || null
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
    const address = event.venue_address as Record<string, string> | null
    const theme = (event.settings as { email_theme?: Record<string, string> } | null)?.email_theme
    const emailContent = await buildOrderConfirmationWithQREmail({
      orderId,
      eventName: event.name,
      buyerName: payload.fullName,
      buyerEmail: email,
      recipientName: payload.fullName,
      totalAmount: 0,
      eventDate: '29 de agosto de 2026, as 10h',
      eventLocation: `${event.venue_name ?? 'Cais do Lago'} - ${address?.district ?? 'Setor de Clubes Sul'}, Brasilia/DF`,
      exerciseType: payload.modality ?? undefined,
      coverUrl: event.cover_url ?? undefined,
      emailTheme: theme,
      tickets: [{ ticketNumber, holderName: payload.fullName, holderEmail: email, qrToken, status: 'confirmed' }],
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
