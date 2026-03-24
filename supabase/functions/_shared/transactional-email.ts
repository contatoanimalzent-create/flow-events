interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface TicketSummary {
  ticketNumber: string
  holderName: string | null
  holderEmail: string | null
  qrToken: string
  status: string
}

interface OrderEmailPayload {
  orderId: string
  eventName: string
  buyerName: string
  buyerEmail: string
  totalAmount: number
  tickets: TicketSummary[]
}

export interface EmailSendResult {
  status: 'sent' | 'skipped'
  providerMessageId: string | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function buildOrderConfirmationEmail(payload: OrderEmailPayload) {
  return {
    subject: `Pedido confirmado - ${payload.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #080808; color: #f5f5f0; padding: 24px;">
        <h1 style="margin: 0 0 12px;">Pedido confirmado</h1>
        <p>Ola ${payload.buyerName || 'cliente'},</p>
        <p>Seu pagamento do pedido <strong>#${payload.orderId.slice(0, 8).toUpperCase()}</strong> foi confirmado para <strong>${payload.eventName}</strong>.</p>
        <p>Total pago: <strong>${formatCurrency(payload.totalAmount)}</strong></p>
        <p>Seus ingressos digitais estao logo abaixo neste e-mail e tambem foram enviados separadamente.</p>
      </div>
    `,
    text: `Pedido confirmado para ${payload.eventName}. Total pago: ${formatCurrency(payload.totalAmount)}.`,
  }
}

export function buildTicketsEmail(payload: OrderEmailPayload) {
  const ticketsHtml = payload.tickets
    .map(
      (ticket) => `
        <li style="margin-bottom: 12px;">
          <strong>${ticket.ticketNumber}</strong><br />
          Titular: ${ticket.holderName ?? ticket.holderEmail ?? payload.buyerName}<br />
          Token QR: ${ticket.qrToken}<br />
          Status: ${ticket.status}
        </li>
      `,
    )
    .join('')

  const ticketsText = payload.tickets
    .map(
      (ticket) =>
        `${ticket.ticketNumber} - ${ticket.holderName ?? ticket.holderEmail ?? payload.buyerName} - token ${ticket.qrToken} - ${ticket.status}`,
    )
    .join('\n')

  return {
    subject: `Ingressos digitais - ${payload.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #080808; color: #f5f5f0; padding: 24px;">
        <h1 style="margin: 0 0 12px;">Seus ingressos digitais</h1>
        <p>Pedido <strong>#${payload.orderId.slice(0, 8).toUpperCase()}</strong> - ${payload.eventName}</p>
        <ul style="padding-left: 18px;">${ticketsHtml}</ul>
      </div>
    `,
    text: `Ingressos digitais de ${payload.eventName}\n${ticketsText}`,
  }
}

export async function sendResendEmail({ to, subject, html, text }: SendEmailParams): Promise<EmailSendResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Animalz Events <tickets@animalz.events>'

  if (!apiKey) {
    return {
      status: 'skipped',
      providerMessageId: null,
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend error: ${body}`)
  }

  const data = await response.json()

  return {
    status: 'sent',
    providerMessageId: data.id ?? null,
  }
}
