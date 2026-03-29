import type { OrderRow } from '@/features/orders/types'

export interface EmailTemplateData {
  order: OrderRow
  eventName: string
  eventDate: string
  eventLocation?: string
  qrCodeDataUrl: string // base64 encoded QR code
  recipientName: string
  exerciseType?: string // "AIRSOFT / EXPERIÊNCIA TÁTICA" etc
}

export function generateConfirmationEmailHTML(data: EmailTemplateData): string {
  const { order, eventName, eventDate, qrCodeDataUrl, recipientName, exerciseType } = data

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; border-bottom: 3px solid #d4a574; }
    .header img { max-width: 280px; height: auto; margin-bottom: 20px; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .header p { color: #d4a574; font-size: 14px; margin-top: 8px; letter-spacing: 1px; }

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
    <!-- Header -->
    <div class="header">
      <img src="https://www.capitalstrike.com.br/logo.png" alt="Capital Strike - A Origem" style="max-width: 300px;">
      <h1>Inscrição Confirmada</h1>
      <p>Sua participação está garantida</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">
        Olá <strong>${recipientName}</strong>,
      </p>

      <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
        Sua inscrição para o evento foi <strong style="color: #d4a574;">confirmada com sucesso</strong>! Você está pronto para participar de uma experiência única e inesquecível.
      </p>

      <!-- Informações do Evento -->
      <div class="info-block">
        <h3>📅 Detalhes do Evento</h3>
        <p><strong>Evento:</strong> ${eventName}</p>
        <p><strong>Data & Hora:</strong> ${eventDate}</p>
        ${exerciseType ? `<p><strong>Modalidade:</strong> ${exerciseType}</p>` : ''}
        <p><strong>ID da Inscrição:</strong> <strong style="color: #d4a574;">${order.id.slice(0, 8).toUpperCase()}</strong></p>
      </div>

      <!-- QR Code Section -->
      <div class="qr-section">
        <h3>🎖️ Seu QR Code de Acesso</h3>
        <p style="color: #666; font-size: 13px; margin-bottom: 20px;">Apresente este código no dia do evento para check-in</p>
        <div class="qr-code">
          <img src="${qrCodeDataUrl}" alt="QR Code de Check-in">
        </div>
      </div>

      <!-- Instructions -->
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

      <!-- Contact Info -->
      <p style="color: #666; font-size: 13px; line-height: 1.6;">
        <strong>Tem dúvidas?</strong><br>
        Entre em contato conosco: suporte@capitalstrike.com.br<br>
        Visite nossa página: <a href="https://www.capitalstrike.com.br/" style="color: #d4a574; text-decoration: none;">www.capitalstrike.com.br</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>CAPITAL STRIKE — A ORIGEM</strong></p>
      <p>A experiência tática definitiva</p>
      <p style="margin-top: 15px; font-size: 11px;">© 2026 Capital Strike. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`
}

// Email simples em texto (para fallback)
export function generateConfirmationEmailText(data: EmailTemplateData): string {
  const { order, eventName, eventDate, recipientName, exerciseType } = data

  return `CAPITAL STRIKE - A ORIGEM
Inscrição Confirmada

Olá ${recipientName},

Sua inscrição para o evento foi confirmada com sucesso!

=== DETALHES DO EVENTO ===
Evento: ${eventName}
Data & Hora: ${eventDate}
${exerciseType ? `Modalidade: ${exerciseType}` : ''}
ID da Inscrição: ${order.id.slice(0, 8).toUpperCase()}

=== SEU QR CODE ===
Um código QR personalizado foi gerado para seu acesso.
Você receberá a imagem do QR code em um anexo ou na versão HTML deste email.

=== COMO FUNCIONA NO DIA DO EVENTO ===
1. Chegue 15 minutos antes do horário marcado
2. Apresente este email ou abra o QR code no seu celular
3. Escaneie o código para check-in automático
4. Receba seu número e instruções finais
5. Divirta-se! 🎯

IMPORTANTE: Este QR code é pessoal e intransferível. Não compartilhe com terceiros.

Tem dúvidas?
suporte@capitalstrike.com.br
https://www.capitalstrike.com.br/

Obrigado por participar da CAPITAL STRIKE - A ORIGEM!`
}
