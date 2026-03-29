import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import {
  buildOrderConfirmationEmail,
  buildOrderConfirmationWithQREmail,
  buildTicketsEmail,
  sendResendEmail,
} from '../_shared/transactional-email.ts'

type TransactionalTemplateKey =
  | 'order-confirmation'
  | 'order-confirmation-with-qr'
  | 'tickets-issued'

function buildTemplatePayload(
  templateKey: TransactionalTemplateKey,
  data: {
    orderId: string
    eventName: string
    buyerName: string
    buyerEmail: string
    totalAmount: number
    recipientName?: string
    eventDate?: string
    eventLocation?: string
    exerciseType?: string
    tickets: Array<{
      ticketNumber: string
      holderName: string | null
      holderEmail: string | null
      qrToken: string
      status: string
    }>
  },
) {
  switch (templateKey) {
    case 'order-confirmation-with-qr':
      return buildOrderConfirmationWithQREmail({
        orderId: data.orderId,
        eventName: data.eventName,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        totalAmount: data.totalAmount,
        recipientName: data.recipientName,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation,
        exerciseType: data.exerciseType,
        tickets: data.tickets,
      })
    case 'tickets-issued':
      return buildTicketsEmail(data)
    case 'order-confirmation':
    default:
      return buildOrderConfirmationEmail(data)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { orderId, templateKey = 'order-confirmation-with-qr', recipientEmail } = await req.json()

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400, headers: corsHeaders })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id,event_id,buyer_name,buyer_email,total_amount')
      .eq('id', orderId)
      .single()

    if (!order) {
      return Response.json({ error: 'Pedido nao encontrado' }, { status: 404, headers: corsHeaders })
    }

    // Fetch event details including date and location
    const [{ data: event }, { data: digitalTickets }] = await Promise.all([
      supabase
        .from('events')
        .select('id,name,starts_at,venue_address,venue_name,settings')
        .eq('id', order.event_id)
        .single(),
      supabase
        .from('digital_tickets')
        .select('ticket_number,holder_name,holder_email,qr_token,status')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true }),
    ])

    const destination = recipientEmail ?? order.buyer_email

    if (!destination) {
      return Response.json({ error: 'Pedido sem e-mail de destino' }, { status: 422, headers: corsHeaders })
    }

    // Format event date if available
    const eventDate = event?.starts_at
      ? new Date(event.starts_at).toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : undefined

    // Extract location from venue info
    const eventLocation = event?.venue_name
      ? `${event.venue_name}${event.venue_address ? ' - ' + event.venue_address : ''}`
      : undefined

    // Extract exercise type from settings if available
    const exerciseType = event?.settings
      ? ((event.settings as Record<string, unknown>)?.exercise_type as string | undefined)
      : undefined

    const content = buildTemplatePayload(templateKey, {
      orderId: order.id,
      eventName: event?.name ?? 'Animalz Event',
      buyerName: order.buyer_name ?? '',
      buyerEmail: order.buyer_email ?? '',
      totalAmount: Number(order.total_amount ?? 0),
      recipientName: order.buyer_name ?? undefined,
      eventDate,
      eventLocation,
      exerciseType,
      tickets: ((digitalTickets as Array<Record<string, unknown>> | null) ?? []).map((ticket) => ({
        ticketNumber: String(ticket.ticket_number ?? ''),
        holderName: (ticket.holder_name as string | null | undefined) ?? null,
        holderEmail: (ticket.holder_email as string | null | undefined) ?? null,
        qrToken: String(ticket.qr_token ?? ''),
        status: String(ticket.status ?? 'confirmed'),
      })),
    })

    const emailResult = await sendResendEmail({
      to: destination,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })

    const { data: message } = await supabase
      .from('transactional_messages')
      .insert({
        order_id: order.id,
        event_id: order.event_id,
        channel: 'email',
        template_key: templateKey,
        provider: 'resend',
        provider_message_id: emailResult.providerMessageId,
        recipient: destination,
        status: emailResult.status,
        metadata: {
          resent_manually: true,
          ticket_count: ((digitalTickets as unknown[]) ?? []).length,
        },
        sent_at: emailResult.status === 'sent' ? new Date().toISOString() : null,
      })
      .select('id,status')
      .single()

    return Response.json(
      {
        ok: true,
        messageId: message?.id ?? null,
        status: message?.status ?? emailResult.status,
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    console.error('[send-transactional-email]', error)
    return Response.json({ error: error.message ?? 'Unexpected error' }, { status: 500, headers: corsHeaders })
  }
})
