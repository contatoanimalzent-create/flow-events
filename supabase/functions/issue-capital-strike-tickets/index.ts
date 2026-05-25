import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'
import { generateQRCodeUrl, sendResendEmail } from '../_shared/transactional-email.ts'

const EVENT_ID = '2b7682c0-15f7-4909-954b-8ee8f086978c'
const ORG_ID = '00000000-0000-0000-0000-000000000001'

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
  nome_completo: string
  email: string
  telefone: string
  cpf: string | null
  exercito: string
  categoria: string
  confirmado: boolean
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

    // 1. Fetch inscricoes (confirmed only)
    let query = supabase
      .from('inscricoes')
      .select('id, nome_completo, email, telefone, cpf, exercito, categoria, confirmado')
      .eq('confirmado', true)
      .order('nome_completo', { ascending: true })

    if (inscricaoIds && inscricaoIds.length > 0) {
      query = query.in('id', inscricaoIds)
    }

    const { data: inscricoes, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Erro ao buscar inscrições: ${fetchError.message}`)
    }

    if (!inscricoes || inscricoes.length === 0) {
      return Response.json({ ok: true, message: 'Nenhuma inscrição confirmada encontrada', stats: { total: 0 } }, { headers: corsHeaders })
    }

    // 2. Check which inscricoes already have digital_tickets (by matching email + event_id)
    const emails = inscricoes.map((i: Inscricao) => i.email.toLowerCase().trim())
    const { data: existingTickets } = await supabase
      .from('digital_tickets')
      .select('id, holder_email, qr_token, ticket_number, email_sent_at')
      .eq('event_id', EVENT_ID)
      .in('holder_email', emails)

    const existingByEmail = new Map<string, { id: string; qr_token: string; ticket_number: string; email_sent_at: string | null }>()
    for (const t of (existingTickets ?? []) as Array<Record<string, unknown>>) {
      const email = String(t.holder_email ?? '').toLowerCase().trim()
      if (email) {
        existingByEmail.set(email, {
          id: String(t.id),
          qr_token: String(t.qr_token),
          ticket_number: String(t.ticket_number),
          email_sent_at: t.email_sent_at ? String(t.email_sent_at) : null,
        })
      }
    }

    const stats = { total: inscricoes.length, already_had_ticket: 0, tickets_created: 0, emails_sent: 0, errors: [] as string[] }
    const results: Array<{ inscricao_id: string; nome: string; email: string; ticket_id: string; qr_token: string; email_sent: boolean }> = []

    for (const inscricao of inscricoes as Inscricao[]) {
      const email = inscricao.email.toLowerCase().trim()
      const armyKey = inscricao.exercito.toUpperCase()
      const config = ARMY_CONFIG[armyKey]

      if (!config) {
        stats.errors.push(`Exército desconhecido para ${inscricao.nome_completo}: ${inscricao.exercito}`)
        continue
      }

      let ticketId: string
      let qrToken: string
      let ticketNumber: string

      const existing = existingByEmail.get(email)

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
          results.push({ inscricao_id: inscricao.id, nome: inscricao.nome_completo, email, ticket_id: 'dry-run', qr_token: 'dry-run', email_sent: false })
          stats.tickets_created++
          continue
        }

        // Create order
        const orderId = crypto.randomUUID()
        const orderItemId = crypto.randomUUID()
        qrToken = crypto.randomUUID()
        ticketNumber = `CS-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`

        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          event_id: EVENT_ID,
          organization_id: ORG_ID,
          buyer_name: inscricao.nome_completo,
          buyer_email: email,
          buyer_phone: inscricao.telefone,
          buyer_cpf: inscricao.cpf,
          subtotal: 0,
          total_amount: 0,
          status: 'paid',
          payment_method: 'free',
          paid_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          source_channel: 'capital-strike-registration',
          metadata: { inscricao_id: inscricao.id, exercito: inscricao.exercito, categoria: inscricao.categoria },
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
          holder_cpf: inscricao.cpf,
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
          holder_cpf: inscricao.cpf,
          status: 'confirmed',
          is_vip: false,
        }).select('id').single()

        if (ticketError) {
          stats.errors.push(`Erro ticket para ${inscricao.nome_completo}: ${ticketError.message}`)
          continue
        }

        ticketId = (ticketData as Record<string, unknown>).id as string
        stats.tickets_created++
        existingByEmail.set(email, { id: ticketId, qr_token: qrToken, ticket_number: ticketNumber, email_sent_at: null })
      }

      // Send email
      let emailSent = false
      if (mode !== 'generate' && !dryRun) {
        try {
          const qrUrl = await generateQRCodeUrl(qrToken)

          const armyLabel = armyKey === 'COALIZAO' ? 'Coalizão' : 'Aliança'
          const armyColor = armyKey === 'COALIZAO' ? '#F59E0B' : '#3B82F6'
          const armyBg = armyKey === 'COALIZAO' ? '#78350F' : '#1E3A5F'

          const html = buildCapitalStrikeEmail({
            nome: inscricao.nome_completo,
            exercito: armyLabel,
            exercitoColor: armyColor,
            exercitoBg: armyBg,
            categoria: inscricao.categoria,
            ticketNumber,
            qrToken,
            qrUrl,
          })

          const result = await sendResendEmail({
            to: email,
            subject: `Seu QR Code - Capital Strike: A Origem | ${armyLabel}`,
            html,
            text: `Olá ${inscricao.nome_completo},\n\nSeu credenciamento para Capital Strike - A Origem está confirmado!\nExército: ${armyLabel}\nCategoria: ${inscricao.categoria}\nTicket: ${ticketNumber}\n\nApresente o QR Code deste email na entrada do evento.\n\nNos vemos no campo de batalha!`,
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
        email,
        ticket_id: ticketId,
        qr_token: qrToken,
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

// ── Email template ────────────────────────────────────────────────────────────

function buildCapitalStrikeEmail(params: {
  nome: string
  exercito: string
  exercitoColor: string
  exercitoBg: string
  categoria: string
  ticketNumber: string
  qrToken: string
  qrUrl: string | null
}) {
  const { nome, exercito, exercitoColor, exercitoBg, categoria, ticketNumber, qrToken, qrUrl } = params
  const firstName = nome.split(' ')[0]

  const qrImage = qrUrl
    ? `<img src="${qrUrl}" alt="QR Code" width="220" height="220" style="display: block; border-radius: 12px;" />`
    : `<div style="width:220px;height:220px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:18px;font-weight:900;color:#000;letter-spacing:2px;">${qrToken.slice(0, 8).toUpperCase()}</span>
      </div>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background:#000;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#000;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#0A0A0A;">

          <!-- TOP ACCENT BAR -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg, ${exercitoColor} 0%, ${exercitoColor}44 100%);"></td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="padding:40px 32px 0 32px;">
              <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};">
                Capital Strike
              </div>
              <h1 style="margin:8px 0 0 0;font-size:42px;font-weight:900;line-height:1.0;text-transform:uppercase;letter-spacing:-1px;color:#FFFFFF;">
                A Origem
              </h1>
              <div style="margin-top:16px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.5);">
                5 de Junho de 2026 &bull; Brasília/DF
              </div>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <div style="height:1px;background:rgba(255,255,255,0.08);"></div>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <div style="font-size:16px;color:#FFFFFF;line-height:1.7;">
                E aí, <strong>${firstName}</strong>! 🎯
              </div>
              <div style="font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;margin-top:8px;">
                Seu credenciamento para o <strong style="color:#fff;">Capital Strike: A Origem</strong> está <strong style="color:${exercitoColor};">confirmado</strong>.
                Apresente o QR Code abaixo na entrada do evento.
              </div>
            </td>
          </tr>

          <!-- ARMY BADGE -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="display:inline-block;padding:8px 20px;border-radius:30px;background:${exercitoBg};border:2px solid ${exercitoColor}44;">
                      <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:${exercitoColor};">
                        ${exercito === 'Coalizão' ? '🛡️' : '⚔️'} Exército ${exercito}
                      </span>
                    </div>
                    <div style="display:inline-block;margin-left:12px;padding:8px 16px;border-radius:30px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);">
                      <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.6);">
                        ${categoria}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR CODE SECTION -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:${exercitoColor};margin-bottom:20px;">
                QR Code de Acesso
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
                <tr>
                  <td style="padding:32px;" align="center">
                    <div style="padding:12px;background:#ffffff;border-radius:16px;display:inline-block;box-shadow:0 0 40px ${exercitoColor}22;">
                      ${qrImage}
                    </div>
                    <div style="margin-top:20px;font-size:14px;font-weight:700;color:#FFFFFF;">
                      ${nome}
                    </div>
                    <div style="margin-top:6px;font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">
                      ${ticketNumber}
                    </div>
                    <div style="margin-top:16px;display:inline-block;padding:6px 16px;border-radius:20px;background:${exercitoColor}22;font-size:11px;font-weight:700;color:${exercitoColor};text-transform:uppercase;letter-spacing:1.5px;">
                      Confirmado
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INSTRUCTIONS -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px;">
                <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:${exercitoColor};margin-bottom:16px;">
                  No dia do evento
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-size:14px;color:rgba(255,255,255,0.8);line-height:2.2;padding:0;">
                      1. Chegue com antecedência ao local<br>
                      2. Abra este e-mail no celular<br>
                      3. Apresente o QR Code no credenciamento<br>
                      4. Receba seu kit e entre em posição!
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- WARNING -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <div style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.7;border-left:3px solid ${exercitoColor}44;padding-left:14px;">
                <strong style="color:rgba(255,255,255,0.5);">Importante:</strong>
                Este QR Code é pessoal e intransferível. Cada operador deve apresentar o seu próprio código no credenciamento.
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 32px 0 32px;" align="center">
              <div style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:${exercitoColor};">
                Nos vemos no campo de batalha! ⚡
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:40px 32px 32px 32px;">
              <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:24px;"></div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:${exercitoColor};">
                    Capital Strike
                  </td>
                  <td align="right" style="font-size:10px;color:rgba(255,255,255,0.25);">
                    capitalstrike.com.br
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:10px;color:rgba(255,255,255,0.2);">
                Powered by Pulse Events &bull; &copy; 2026
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
