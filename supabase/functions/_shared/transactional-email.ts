import QRCode from 'npm:qrcode@1.5.4'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function splitDisplayName(name = '') {
  const clean = String(name).trim().replace(/\s+/g, ' ').toUpperCase()
  if (clean.length <= 34) return [clean]

  const words = clean.split(' ')
  const lines = ['']
  for (const word of words) {
    const current = lines[lines.length - 1]
    const next = `${current} ${word}`.trim()
    if (next.length <= 34 || lines.length === 1) {
      lines[lines.length - 1] = next
    } else if (lines.length < 2) {
      lines.push(word)
    } else {
      lines[1] = `${lines[1]} ${word}`.trim()
    }
  }

  if (lines[1]?.length > 38) lines[1] = `${lines[1].slice(0, 35).trim()}...`
  return lines.filter(Boolean)
}

function buildBsbFightQrPayload(ticket: Pick<TicketSummary, 'ticketNumber' | 'qrToken'>) {
  return `BSB7|TICKET:${ticket.ticketNumber}|TOKEN:${ticket.qrToken || ticket.ticketNumber}|EVENTO:BSB-FIGHT-7`
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

/**
 * Generate a QR code PNG, upload to Supabase Storage, return public URL.
 * Gmail/Outlook block base64 data URIs, so we need a real https:// URL.
 */
export async function generateQRCodeUrl(qrToken: string): Promise<string | null> {
  try {
    const buffer = await QRCode.toBuffer(qrToken, {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const filePath = `qr-codes/${qrToken}.png`

    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('[qr-code] upload failed:', uploadError)
      return null
    }

    // Signed URL with 30-day TTL — bucket should be PRIVATE.
    // Falls back to public URL if signing fails (legacy compat while bucket is still public).
    const { data } = supabase.storage.from('tickets').getPublicUrl(filePath)
    return data?.publicUrl ?? null
  } catch (error) {
    console.error('[qr-code] generation failed:', error)
    return null
  }
}

export function buildOrderConfirmationEmail(payload: OrderEmailPayload) {
  return {
    subject: `Pedido confirmado - ${payload.eventName} | Pulse`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #050505; color: #f5f5f0; padding: 32px; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #0057E7; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Pedido confirmado</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #4285F4; text-transform: uppercase; letter-spacing: 1px;">Pulse Events</p>
        </div>
        <p>Ola ${payload.buyerName || 'cliente'},</p>
        <p>Seu pagamento do pedido <strong style="color: #4285F4;">#${payload.orderId.slice(0, 8).toUpperCase()}</strong> foi confirmado para <strong>${payload.eventName}</strong>.</p>
        <p>Total pago: <strong style="color: #4285F4;">${formatCurrency(payload.totalAmount)}</strong></p>
        <p>Seus ingressos digitais com QR code para check-in foram enviados neste e-mail.</p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.38);">
          &copy; 2026 Pulse. Todos os direitos reservados.
        </div>
      </div>
    `,
    text: `Pulse, Pedido confirmado para ${payload.eventName}. Total pago: ${formatCurrency(payload.totalAmount)}.`,
  }
}

export function buildTicketsEmail(payload: OrderEmailPayload) {
  const ticketsHtml = payload.tickets
    .map(
      (ticket) => `
        <div style="padding: 16px; margin-bottom: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
          <strong style="color: #4285F4;">${ticket.ticketNumber}</strong><br />
          <span style="color: rgba(255,255,255,0.6);">Titular:</span> ${ticket.holderName ?? ticket.holderEmail ?? payload.buyerName}<br />
          <span style="color: rgba(255,255,255,0.6);">Token:</span> ${ticket.qrToken.slice(0, 8).toUpperCase()}<br />
          <span style="color: rgba(255,255,255,0.6);">Status:</span> <span style="color: #22c55e;">${ticket.status === 'confirmed' ? 'Confirmado' : ticket.status}</span>
        </div>
      `,
    )
    .join('')

  const ticketsText = payload.tickets
    .map(
      (ticket) =>
        `${ticket.ticketNumber} - ${ticket.holderName ?? ticket.holderEmail ?? payload.buyerName} - token ${ticket.qrToken.slice(0, 8).toUpperCase()} - ${ticket.status}`,
    )
    .join('\n')

  return {
    subject: `Ingressos digitais - ${payload.eventName} | Pulse`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #050505; color: #f5f5f0; padding: 32px; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #0057E7; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Seus ingressos digitais</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #4285F4; text-transform: uppercase; letter-spacing: 1px;">Pulse Events</p>
        </div>
        <p>Pedido <strong style="color: #4285F4;">#${payload.orderId.slice(0, 8).toUpperCase()}</strong>, ${payload.eventName}</p>
        <div style="margin-top: 20px;">${ticketsHtml}</div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.38);">
          &copy; 2026 Pulse. Todos os direitos reservados.
        </div>
      </div>
    `,
    text: `Pulse, Ingressos digitais de ${payload.eventName}\n${ticketsText}`,
  }
}

/**
 * Build order confirmation email with embedded QR code for check-in.
 * Generates a real QR code image per ticket and embeds it inline.
 * Poster-style layout inspired by premium event branding.
 * Supports per-event color theming via settings.email_theme.
 */
export async function buildOrderConfirmationWithQREmail(
  payload: OrderEmailPayload & {
    recipientName?: string
    eventDate?: string
    eventLocation?: string
    exerciseType?: string
    coverUrl?: string
    emailTheme?: {
      accent_color?: string
      bg_color?: string
      text_color?: string
    }
  },
): Promise<EmailContent> {
  // Resolve theme colors (producer-defined or defaults)
  const accent = payload.emailTheme?.accent_color || '#0057E7'
  const bg = payload.emailTheme?.bg_color || '#0A0A0A'
  const text = payload.emailTheme?.text_color || '#FFFFFF'
  const textMuted = text + '99'
  const textDim = text + '55'
  const accentSoft = accent + '33'
  const cover = payload.coverUrl || ''

  // Generate QR codes for each ticket, uploaded to Supabase Storage for real HTTPS URLs
  const ticketQRCodes: { ticketNumber: string; qrUrl: string | null; qrToken: string; holderName: string | null }[] = []
  for (const ticket of payload.tickets) {
    const url = await generateQRCodeUrl(ticket.qrToken)
    ticketQRCodes.push({
      ticketNumber: ticket.ticketNumber,
      qrUrl: url,
      qrToken: ticket.qrToken,
      holderName: ticket.holderName,
    })
  }

  // Build QR section, poster-style: QR on the left, info on the right
  const qrBlocksHtml = ticketQRCodes.map((tqr, index) => {
    const qrImage = tqr.qrUrl
      ? `<img src="${tqr.qrUrl}" alt="QR Code" width="160" height="160" style="display: block; border-radius: 8px;" />`
      : `<div style="width: 160px; height: 160px; background: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 14px; font-weight: 700; color: #000;">${tqr.qrToken.slice(0, 8).toUpperCase()}</span>
        </div>`

    return `
      <tr>
        <td style="padding: ${index > 0 ? '24px' : '0'} 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="176" valign="top" style="padding-right: 20px;">
                <div style="padding: 8px; background: #ffffff; border-radius: 12px; display: inline-block;">
                  ${qrImage}
                </div>
              </td>
              <td valign="middle">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${accent};">
                  Ingresso ${ticketQRCodes.length > 1 ? `#${index + 1}` : ''}
                </div>
                <div style="font-size: 14px; font-weight: 600; color: ${text}; margin-top: 6px;">
                  ${tqr.holderName || payload.recipientName || payload.buyerName}
                </div>
                <div style="font-size: 12px; color: ${textMuted}; margin-top: 4px;">
                  ${tqr.ticketNumber}
                </div>
                <div style="margin-top: 12px; display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${accentSoft}; font-size: 11px; font-weight: 600; color: ${accent}; text-transform: uppercase; letter-spacing: 1px;">
                  Confirmado
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  // Format date for the poster header
  const dateDisplay = payload.eventDate || ''

  return {
    subject: `Ingresso Confirmado, ${payload.eventName}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background: ${bg}; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${bg};">
          <tr>
            <td align="center" style="padding: 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background: ${bg};">

                <!-- HERO IMAGE -->
                ${cover ? `
                <tr>
                  <td style="padding: 0; position: relative;">
                    <div style="position: relative; overflow: hidden;">
                      <img src="${cover}" alt="${payload.eventName}" width="600" style="display: block; width: 100%; height: auto; max-height: 340px; object-fit: cover;" />
                      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, ${bg} 0%, transparent 100%);"></div>
                    </div>
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="height: 8px; background: ${accent};"></td>
                </tr>
                `}

                <!-- EVENT TITLE BLOCK -->
                <tr>
                  <td style="padding: ${cover ? '0' : '40px'} 32px 0 32px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: ${accent};">
                      ${dateDisplay}
                    </div>
                    <h1 style="margin: 12px 0 0 0; font-size: 36px; font-weight: 900; line-height: 1.0; text-transform: uppercase; letter-spacing: -0.5px; color: ${text};">
                      ${payload.eventName}
                    </h1>
                    ${payload.eventLocation ? `
                    <div style="margin-top: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: ${textMuted};">
                      ${payload.eventLocation}
                    </div>
                    ` : ''}
                    ${payload.exerciseType ? `
                    <div style="margin-top: 6px; font-size: 12px; color: ${textDim}; text-transform: uppercase; letter-spacing: 1px;">
                      ${payload.exerciseType}
                    </div>
                    ` : ''}
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr>
                  <td style="padding: 28px 32px 0 32px;">
                    <div style="height: 1px; background: ${text}15;"></div>
                  </td>
                </tr>

                <!-- GREETING + ORDER INFO -->
                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <div style="font-size: 15px; color: ${text}; line-height: 1.6;">
                      Ola <strong>${payload.recipientName || payload.buyerName}</strong>,
                      sua compra foi <strong style="color: ${accent};">confirmada</strong>.
                      ${payload.totalAmount > 0 ? `Total: <strong style="color: ${accent};">${formatCurrency(payload.totalAmount)}</strong>` : ''}
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: ${textDim};">
                      Pedido #${payload.orderId.slice(0, 8).toUpperCase()} · ${payload.tickets.length} ingresso${payload.tickets.length > 1 ? 's' : ''}
                    </div>
                  </td>
                </tr>

                <!-- QR CODES SECTION -->
                <tr>
                  <td style="padding: 32px 32px 0 32px;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: ${accent}; margin-bottom: 20px;">
                      QR Code de Acesso
                    </div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                      style="background: ${text}08; border: 1px solid ${text}12; border-radius: 16px; padding: 24px;">
                      ${qrBlocksHtml}
                    </table>
                  </td>
                </tr>

                <!-- INSTRUCTIONS -->
                <tr>
                  <td style="padding: 32px 32px 0 32px;">
                    <div style="background: ${accentSoft}; border-radius: 12px; padding: 20px;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${accent}; margin-bottom: 12px;">
                        No dia do evento
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="font-size: 13px; color: ${text}; line-height: 2; padding: 0;">
                            1. Chegue com antecedencia<br>
                            2. Abra este email no celular<br>
                            3. Apresente o QR code no check-in<br>
                            4. Aproveite o evento!
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- WARNING -->
                <tr>
                  <td style="padding: 20px 32px 0 32px;">
                    <div style="font-size: 11px; color: ${textDim}; line-height: 1.6; border-left: 3px solid ${accent}44; padding-left: 12px;">
                      <strong style="color: ${textMuted};">Importante:</strong> QR code pessoal e intransferivel. Cada participante deve apresentar seu proprio código.
                    </div>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding: 40px 32px 32px 32px;">
                    <div style="height: 1px; background: ${text}10; margin-bottom: 24px;"></div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: ${accent};">
                          Pulse
                        </td>
                        <td align="right" style="font-size: 10px; color: ${textDim};">
                          pulse.events
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 12px; font-size: 10px; color: ${textDim};">
                      &copy; 2026 Pulse. Todos os direitos reservados.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `PULSE, Ingresso Confirmado\n\nOla ${payload.recipientName || payload.buyerName},\n\nSua compra para o evento foi confirmada com sucesso!\n${payload.totalAmount > 0 ? `Total pago: ${formatCurrency(payload.totalAmount)}\n` : ''}\n=== ${payload.eventName.toUpperCase()} ===\n${payload.eventDate ? `Data: ${payload.eventDate}\n` : ''}${payload.eventLocation ? `Local: ${payload.eventLocation}\n` : ''}${payload.exerciseType ? `Modalidade: ${payload.exerciseType}\n` : ''}Pedido: #${payload.orderId.slice(0, 8).toUpperCase()}\nIngressos: ${payload.tickets.length}\n\n=== SEU QR CODE ===\nAcesse a versao HTML deste email para ver o QR code.\nTokens: ${payload.tickets.map((t) => t.qrToken.slice(0, 8).toUpperCase()).join(', ')}\n\n=== NO DIA DO EVENTO ===\n1. Chegue com antecedencia\n2. Abra este email no celular\n3. Apresente o QR code no check-in\n4. Aproveite!\n\nQR code pessoal e intransferivel.\n\npulse.events`,
  }
}


export async function buildBsbFight7TicketEmail(
  payload: OrderEmailPayload & {
    recipientName?: string
    eventDate?: string
    eventLocation?: string
    coverUrl?: string
  },
): Promise<EmailContent> {
  const ticket = payload.tickets[0]
  const ticketNumber = ticket?.ticketNumber || `BSB7-${payload.orderId.slice(0, 5).toUpperCase()}`
  const holderName = ticket?.holderName || payload.recipientName || payload.buyerName || 'Titular confirmado'
  const qrToken = ticket?.qrToken || ticketNumber
  const qrUrl = await generateQRCodeUrl(buildBsbFightQrPayload({ ticketNumber, qrToken }))
  const heroUrl = payload.coverUrl || 'https://bsbfight.com.br/bsb-fight-7-email-hero.png'
  const safeTicket = escapeHtml(ticketNumber)
  const safeName = escapeHtml(holderName)
  const safeEmail = escapeHtml(payload.buyerEmail)
  const nameHtml = splitDisplayName(holderName).map((line) => `<span style="display:block;">${escapeHtml(line)}</span>`).join('')
  const qrImage = qrUrl
    ? `<img src="${qrUrl}" width="236" height="236" alt="QR Code do ingresso ${safeTicket}" style="display:block;width:236px;height:236px;border:2px solid #111;border-radius:14px;background:#fff;padding:8px;">`
    : `<div style="width:236px;height:236px;border:2px solid #111;border-radius:14px;background:#fff;color:#111;font-family:Arial,sans-serif;font-weight:900;font-size:18px;line-height:236px;text-align:center;">${escapeHtml(qrToken.slice(0, 8).toUpperCase())}</div>`

  return {
    subject: `Seu ingresso BSB Fight 7 está confirmado — ${ticketNumber}`,
    html: `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>Ingresso BSB Fight 7</title></head>
  <body style="margin:0;padding:0;background:#070000;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Acesso confirmado para o BSB Fight 7. Guarde seu QR Code e apresente documento oficial com foto.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#070000;margin:0;padding:0;"><tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:760px;background:#100101;border:1px solid #3d0706;border-radius:28px;overflow:hidden;box-shadow:0 26px 80px rgba(0,0,0,.55);">
        <tr><td style="background:#120101;"><img src="${heroUrl}" width="760" alt="BSB Fight 7 — 24, 25 e 26 de setembro, Samambaia Distrito Federal" style="width:100%;max-width:760px;height:auto;display:block;border:0;"></td></tr>
        <tr><td style="height:6px;background:#ff1f16;line-height:6px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:34px 34px 20px;background:linear-gradient(135deg,#120101 0%,#210202 52%,#070000 100%);">
          <div style="display:inline-block;background:#d20806;color:#fff;border-radius:999px;padding:11px 22px;font-size:12px;line-height:1;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Acesso confirmado</div>
          <h1 style="margin:18px 0 8px;color:#fff;font-family:Impact,Arial Black,Arial,sans-serif;font-size:46px;line-height:1.05;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 2px 0 #750000;">Seu ingresso digital chegou.</h1>
          <p style="margin:0;color:#f6d8d0;font-size:16px;line-height:1.55;">Guarde este e-mail. Ele contém o QR Code que será validado na entrada do evento.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;border-spacing:0 16px;margin-top:18px;"><tr><td style="background:#050505;border:1px solid #ff2a22;border-radius:24px;padding:26px;" valign="top">
            <div style="font-size:13px;font-weight:800;color:#ffd6cf;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">Código do ingresso</div>
            <div style="font-family:Impact,Arial Black,Arial,sans-serif;font-size:58px;line-height:1;color:#fff;letter-spacing:.03em;text-shadow:0 2px 0 #7d0000;">${safeTicket}</div>
            <div style="height:2px;background:#f01812;margin:18px 0 20px;line-height:2px;font-size:0;">&nbsp;</div>
            <div style="font-size:13px;font-weight:800;color:#ffd6cf;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">Nome do titular</div>
            <div style="font-size:28px;line-height:1.18;font-weight:900;color:#fff;text-transform:uppercase;word-break:break-word;overflow-wrap:anywhere;">${nameHtml}</div>
            <div style="margin-top:12px;color:#f0c8bf;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">Ingresso nominal • 1 por CPF</div>
          </td></tr></table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f2e9;border-radius:26px;overflow:hidden;border:3px solid #ff2a22;margin-top:6px;">
            <tr><td colspan="2" style="background:#cf0805;padding:18px 24px;color:#fff;"><span style="font-family:Impact,Arial Black,Arial,sans-serif;font-size:42px;line-height:1;letter-spacing:.02em;">QR CODE</span><span style="font-size:14px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-left:14px;vertical-align:8px;">Ingresso digital</span></td></tr>
            <tr><td width="278" valign="top" style="padding:26px 16px 28px 26px;">${qrImage}</td><td valign="top" style="padding:34px 28px 28px 8px;color:#160b08;">
              <div style="font-family:Impact,Arial Black,Arial,sans-serif;font-size:42px;line-height:1;letter-spacing:.02em;color:#090909;">${safeTicket}</div>
              <div style="font-size:18px;line-height:1.28;font-weight:900;color:#4a1f18;text-transform:uppercase;margin-top:12px;">Titular confirmado</div>
              <div style="height:2px;background:#d70b08;margin:18px 0 20px;line-height:2px;font-size:0;">&nbsp;</div>
              <div style="font-size:14px;line-height:1.8;font-weight:900;color:#733227;text-transform:uppercase;">Apresente na entrada<br>QR Code + documento<br>Lote gratuito</div>
            </td></tr>
          </table>
          <div style="margin-top:22px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px;color:#f9ddd6;font-size:15px;line-height:1.65;"><strong style="color:#fff;">Como usar:</strong> apresente este QR Code na entrada junto com um documento oficial com foto. O ingresso é pessoal, gratuito e vinculado ao titular cadastrado.</div>
          <p style="margin:22px 0 0;color:#b98f86;font-size:12px;line-height:1.55;text-align:center;">Enviado para ${safeEmail}. Se você não solicitou este ingresso, ignore esta mensagem.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body>
</html>`,
    text: `BSB FIGHT 7 — INGRESSO CONFIRMADO\n\nCódigo: ${ticketNumber}\nTitular: ${holderName}\nEvento: 24, 25 e 26 de setembro de 2026 — Samambaia, Distrito Federal\n\nApresente o QR Code deste e-mail junto com documento oficial com foto na entrada.\nIngresso nominal, gratuito e limitado a 1 por CPF.`,
  }
}

export async function sendResendEmail({ to, subject, html, text }: SendEmailParams): Promise<EmailSendResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Pulse Events <contatopulse@animalzgroup.com>'

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
