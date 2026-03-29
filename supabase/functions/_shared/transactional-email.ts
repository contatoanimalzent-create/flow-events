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

export interface EmailContent {
  subject: string
  html: string
  text: string
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

/**
 * Build order confirmation email with embedded QR code for check-in
 * Uses HTML email template with personalization and QR code
 */
export function buildOrderConfirmationWithQREmail(
  payload: OrderEmailPayload & {
    recipientName?: string
    eventDate?: string
    eventLocation?: string
    exerciseType?: string
  },
): EmailContent {
  const qrCodePlaceholder = '[QR_CODE_WILL_BE_EMBEDDED_HERE]'

  return {
    subject: `Inscrição Confirmada - ${payload.eventName}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; border-bottom: 3px solid #d4a574; }
          .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
          .header p { color: #d4a574; font-size: 14px; margin-top: 8px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; font-weight: 600; }
          .greeting strong { color: #d4a574; }
          .info-block { background: #f5f5f5; border-left: 4px solid #d4a574; padding: 20px; margin: 25px 0; border-radius: 4px; }
          .info-block h3 { color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .info-block p { color: #333; font-size: 16px; margin: 8px 0; }
          .info-block strong { color: #d4a574; }
          .qr-section { text-align: center; margin: 40px 0; padding: 30px; background: #f9f9f9; border-radius: 8px; }
          .qr-section h3 { color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
          .qr-code { display: inline-block; padding: 15px; background: #ffffff; border: 2px solid #d4a574; border-radius: 8px; }
          .qr-code img { max-width: 280px; height: 280px; display: block; }
          .instructions { background: #fff9f0; border: 1px solid #e6d4c1; padding: 20px; margin: 25px 0; border-radius: 4px; }
          .instructions h3 { color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .instructions ol { margin-left: 20px; color: #333; font-size: 14px; line-height: 1.6; }
          .instructions li { margin-bottom: 8px; }
          .footer { background: #1a1a1a; color: #d4a574; padding: 30px 20px; text-align: center; font-size: 12px; border-top: 2px solid #d4a574; }
          .footer p { margin: 5px 0; }
          .footer a { color: #d4a574; text-decoration: none; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #333; }
          .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Inscrição Confirmada</h1>
            <p>Sua participação está garantida</p>
          </div>

          <div class="content">
            <p class="greeting">
              Olá <strong>${payload.recipientName || payload.buyerName}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Sua inscrição para o evento foi <strong style="color: #d4a574;">confirmada com sucesso</strong>! Você está pronto para participar de uma experiência única e inesquecível.
            </p>

            <div class="info-block">
              <h3>📅 Detalhes do Evento</h3>
              <p><strong>Evento:</strong> ${payload.eventName}</p>
              ${payload.eventDate ? `<p><strong>Data & Hora:</strong> ${payload.eventDate}</p>` : ''}
              ${payload.eventLocation ? `<p><strong>Local:</strong> ${payload.eventLocation}</p>` : ''}
              ${payload.exerciseType ? `<p><strong>Modalidade:</strong> ${payload.exerciseType}</p>` : ''}
              <p><strong>ID da Inscrição:</strong> <strong style="color: #d4a574;">${payload.orderId.slice(0, 8).toUpperCase()}</strong></p>
            </div>

            <div class="qr-section">
              <h3>🎖️ Seu QR Code de Acesso</h3>
              <p style="color: #666; font-size: 13px; margin-bottom: 20px;">Apresente este código no dia do evento para check-in</p>
              <div class="qr-code">
                ${qrCodePlaceholder}
              </div>
            </div>

            <div class="instructions">
              <h3>Como Funciona no Dia do Evento</h3>
              <ol>
                <li>Chegue 15 minutos antes do horário marcado</li>
                <li>Apresente este email ou abra o QR code no seu celular</li>
                <li>Escaneie o código para check-in automático</li>
                <li>Receba seu número e instruções finais</li>
                <li>Divirta-se! 🎯</li>
              </ol>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Este QR code é pessoal e intransferível. Não compartilhe com terceiros. Cada participante deve fazer check-in com seu próprio código.
            </div>

            <div class="divider"></div>

            <p style="color: #666; font-size: 13px; line-height: 1.6;">
              <strong>Tem dúvidas?</strong><br>
              Entre em contato conosco: suporte@capitalstrike.com.br<br>
              Visite nossa página: <a href="https://www.capitalstrike.com.br/" style="color: #d4a574; text-decoration: none;">www.capitalstrike.com.br</a>
            </p>
          </div>

          <div class="footer">
            <p><strong>CAPITAL STRIKE — A ORIGEM</strong></p>
            <p>A experiência tática definitiva</p>
            <p style="margin-top: 15px; font-size: 11px;">© 2026 Capital Strike. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `CAPITAL STRIKE - A ORIGEM\nInscrição Confirmada\n\nOlá ${payload.recipientName || payload.buyerName},\n\nSua inscrição para o evento foi confirmada com sucesso!\n\n=== DETALHES DO EVENTO ===\nEvento: ${payload.eventName}\n${payload.eventDate ? `Data & Hora: ${payload.eventDate}` : ''}\n${payload.exerciseType ? `Modalidade: ${payload.exerciseType}` : ''}\nID da Inscrição: ${payload.orderId.slice(0, 8).toUpperCase()}\n\n=== SEU QR CODE ===\nUm código QR personalizado foi gerado para seu acesso.\nVocê receberá a imagem do QR code em um anexo ou na versão HTML deste email.\n\n=== COMO FUNCIONA NO DIA DO EVENTO ===\n1. Chegue 15 minutos antes do horário marcado\n2. Apresente este email ou abra o QR code no seu celular\n3. Escaneie o código para check-in automático\n4. Receba seu número e instruções finais\n5. Divirta-se! 🎯\n\nIMPORTANTE: Este QR code é pessoal e intransferível. Não compartilhe com terceiros.\n\nTem dúvidas?\nsuporte@capitalstrike.com.br\nhttps://www.capitalstrike.com.br/\n\nObrigado por participar da CAPITAL STRIKE - A ORIGEM!`,
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
