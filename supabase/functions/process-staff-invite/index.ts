import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface InviteToken {
  id: string
  token: string
  organization_id: string
  event_id: string
  role_type: string
  team_id: string | null
  shift_id: string | null
  custom_fields: unknown
  expires_at: string | null
  is_active: boolean
  used_count: number
  max_uses: number | null
  created_by: string | null
  // v3 batch fields
  send_status: string
  target_email: string | null
  target_name: string | null
  sent_at: string | null
  send_error: string | null
}

interface ApplicationBody {
  token: string
  full_name: string
  email: string
  phone?: string
  document_number?: string
  birth_date?: string
  bio?: string
  experience?: string
  t_shirt_size?: string
  role_title?: string
  company?: string
  pix_key?: string
  shift_label?: string
  custom_field_answers?: Record<string, unknown>
  terms_accepted: boolean
}

interface BatchResult {
  id: string
  target_email: string | null
  status: 'sent' | 'failed' | 'skipped' | 'expired' | 'already_sent'
  error?: string
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function addCors(init: ResponseInit = {}): ResponseInit {
  return { ...init, headers: { ...corsHeaders, ...((init.headers as Record<string, string>) ?? {}) } }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeCPF(value?: string | null): string | null {
  const clean = (value ?? '').replace(/\D/g, '')
  return clean || null
}

function formatCPF(value?: string | null): string | null {
  const cpf = normalizeCPF(value)
  if (!cpf) return null
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
}

function isValidCPF(value?: string | null): boolean {
  const cpf = normalizeCPF(value)
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (Number(cpf[9]) !== digit) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return Number(cpf[10]) === digit
}

function staffEventDateLabel(inviteToken: string, eventName?: string | null, startsAt?: string | null): string | null {
  if (inviteToken === 'bsb5' || eventName?.toLowerCase() === 'bsb fight 5') {
    return '28, 29 e 30 de maio de 2026'
  }

  return startsAt ?? null
}

function splitFullName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().replace(/\s+/g, ' ').split(' ')
  const firstName = parts.shift() ?? fullName.trim()
  const lastName = parts.length > 0 ? parts.join(' ') : null
  return { firstName, lastName }
}

function normalizeBrazilWhatsapp(value?: string | null): string | null {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  return digits.startsWith('+') ? digits : `+${digits}`
}

function normalizeBsbPhoneDigits(value?: string | null): string {
  let digits = (value ?? '').replace(/\D/g, '')
  if (digits.startsWith('0055')) digits = digits.slice(4)
  if (digits.startsWith('55')) digits = digits.slice(2)
  return digits.slice(0, 11)
}

function buildVenueLabel(venueName?: string | null, venueAddress?: Record<string, unknown> | null): string {
  const fullAddress = typeof venueAddress?.full_address === 'string' ? venueAddress.full_address : ''
  const city = typeof venueAddress?.city === 'string' ? venueAddress.city : ''
  const state = typeof venueAddress?.state === 'string' ? venueAddress.state : ''
  const cityState = [city, state].filter(Boolean).join(' - ')
  const address = fullAddress || cityState
  return [venueName, address].filter(Boolean).join(' | ')
}

async function queueStaffConfirmationNotifications(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  params: {
    organizationId: string
    eventId: string
    eventName: string
    eventSlug: string
    venueName: string | null
    venueAddress: Record<string, unknown> | null
    eventImageUrl: string | null
    staffMemberId: string
    staffName: string
    staffEmail: string
    staffPhone?: string | null
    roleType: string | null
    teamId: string | null
    shiftId: string | null
    inviteLinkId: string
    now: string
  },
) {
  const templateKey = 'staff-confirmed-permissions'
  const appUrl = (Deno.env.get('APP_URL') ?? 'https://pulse.animalzgroup.com').replace(/\/$/, '')
  const pointUrl = `${appUrl}/staff/ponto/${params.eventSlug}`
  const logoUrl = 'https://nrjizzfkhficvhiiqvtl.supabase.co/storage/v1/object/public/public-assets/brand/pulse-logo-principal-transparente.png'
  const defaultBsb5ImageUrl = 'https://nrjizzfkhficvhiiqvtl.supabase.co/storage/v1/object/public/staff-documents/bsb5/ponto-pulse.png'
  const venueLabel = buildVenueLabel(params.venueName, params.venueAddress)
  const eventImageUrl = params.eventImageUrl || (params.eventSlug === 'bsb-fight-5' ? defaultBsb5ImageUrl : '')
  const phone = normalizeBrazilWhatsapp(params.staffPhone)
  const audienceEmails = [params.staffEmail].filter(Boolean)
  const audiencePhones = phone ? [phone] : []
  const { firstName } = splitFullName(params.staffName)

  const variables = {
    staff_member_id: params.staffMemberId,
    first_name: firstName,
    staff_name: params.staffName,
    event_name: params.eventName,
    point_url: pointUrl,
    venue_name: venueLabel || 'Local do evento em confirmação',
    pulse_logo_url: logoUrl,
    event_image_url: eventImageUrl,
    role_type: params.roleType ?? 'staff',
    team_id: params.teamId ?? '',
    shift_id: params.shiftId ?? '',
    invite_link_id: params.inviteLinkId,
    requires_camera: true,
    requires_location: true,
    requires_notifications: true,
    arrival_photo_required: true,
    message: 'Ative câmera, localização e notificações. O ponto digital deve ser usado somente quando você estiver no local do evento.',
  }

  await admin.from('email_templates').upsert({
    organization_id: params.organizationId,
    key: templateKey,
    subject: '{{event_name}} | Dados confirmados e ponto digital',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#050507;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050507;padding:32px 14px;">
          <tr>
            <td align="center">
              <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#0d0d10;border:1px solid #242428;border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="background:#101014;padding:24px 28px;border-bottom:1px solid #25252a;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle">
                          <img src="{{pulse_logo_url}}" alt="Pulse" width="280" style="display:block;width:280px;max-width:82%;height:auto;border:0;">
                        </td>
                        <td align="right" valign="middle" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d4ff00;">
                          Ponto digital
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#050507;">
                    <img src="{{event_image_url}}" alt="{{event_name}}" width="620" style="display:block;width:100%;max-width:620px;height:auto;border:0;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 30px 8px;">
                    <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d4ff00;margin-bottom:14px;">Equipe confirmada</div>
                    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.12;font-weight:900;">{{event_name}}</h1>
                    <p style="margin:18px 0 0;color:#d7d7db;font-size:16px;line-height:1.65;">
                      Olá, <strong style="color:#ffffff;">{{first_name}}</strong>. Seus dados para trabalhar no evento foram confirmados. Este é o seu acesso ao ponto digital do Pulse.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 30px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#17171c;border:1px solid #2b2b31;border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#a7a7ad;margin-bottom:8px;">Local</div>
                          <div style="font-size:16px;line-height:1.5;color:#ffffff;font-weight:700;">{{venue_name}}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 30px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:50%;padding:0 8px 12px 0;" valign="top">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#121217;border:1px solid #2b2b31;border-radius:14px;">
                            <tr><td style="padding:16px;color:#d7d7db;font-size:14px;line-height:1.55;"><strong style="display:block;color:#ffffff;margin-bottom:6px;">Antes do ponto</strong>Ative câmera, localização e notificações no celular.</td></tr>
                          </table>
                        </td>
                        <td style="width:50%;padding:0 0 12px 8px;" valign="top">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#121217;border:1px solid #2b2b31;border-radius:14px;">
                            <tr><td style="padding:16px;color:#d7d7db;font-size:14px;line-height:1.55;"><strong style="display:block;color:#ffffff;margin-bottom:6px;">No evento</strong>Use o link somente quando estiver no local do evento.</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:8px 0 0;color:#d7d7db;font-size:15px;line-height:1.7;">
                      O ponto deve ser batido em todos os dias em que você trabalhar. Depois de concluir a entrada, apresente o comprovante no credenciamento para retirar sua pulseira.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:30px 30px 24px;">
                    <a href="{{point_url}}" style="display:inline-block;background:#d4ff00;color:#050507;text-decoration:none;font-size:16px;font-weight:900;padding:15px 26px;border-radius:10px;">
                      Abrir meu ponto digital
                    </a>
                    <div style="margin-top:16px;color:#8f8f96;font-size:12px;line-height:1.5;word-break:break-all;">
                      {{point_url}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 30px 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101014;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;color:#b9b9c0;font-size:13px;line-height:1.6;">
                          Dica: use o mesmo e-mail, CPF e WhatsApp informados no cadastro para acessar o ponto. Fora do local do evento, o sistema bloqueia o registro.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#08080a;padding:18px 30px;color:#696970;font-size:11px;line-height:1.5;">
                    Pulse Events | Comunicação automática para equipe credenciada.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `.trim(),
    text: 'Olá, {{first_name}}. Seus dados para trabalhar no evento {{event_name}} foram confirmados. Local: {{venue_name}}. Link do ponto: {{point_url}}. Use o ponto somente quando estiver no local do evento. Ative câmera, localização e notificações. O ponto deve ser batido em todos os dias em que você trabalhar. Depois da entrada, apresente o comprovante no credenciamento para retirar sua pulseira.',
  }, { onConflict: 'organization_id,key' }).then(({ error }) => {
    if (error) console.warn('[process-staff-invite] email template upsert failed:', error.message)
  })

  await admin.from('whatsapp_templates').upsert({
    organization_id: params.organizationId,
    key: templateKey,
    body: 'Olá, {{first_name}}. Seus dados para trabalhar no evento {{event_name}} foram confirmados. Local: {{venue_name}}. Link do ponto: {{point_url}}. Use o ponto somente quando estiver no local do evento.',
  }, { onConflict: 'organization_id,key' }).then(({ error }) => {
    if (error) console.warn('[process-staff-invite] whatsapp template upsert failed:', error.message)
  })

  const { data: segment, error: segmentError } = await admin
    .from('audience_segments')
    .insert({
      organization_id: params.organizationId,
      name: `Staff confirmado - ${params.staffName}`,
      description: 'Criado automaticamente pelo link publico de staff.',
      filter_definition: {
        source: 'manual',
        emails: audienceEmails,
        phones: audiencePhones,
      },
      audience_count: audienceEmails.length + audiencePhones.length,
      last_previewed_at: params.now,
      created_at: params.now,
      updated_at: params.now,
    })
    .select('id')
    .single()

  if (segmentError || !segment) {
    console.warn('[process-staff-invite] audience segment insert failed:', segmentError?.message)
    return
  }

  const jobs = [
    {
      organization_id: params.organizationId,
      template_key: templateKey,
      audience_segment_id: segment.id,
      scheduled_at: params.now,
      status: 'pending',
      channel: 'email',
      event_id: params.eventId,
      variables,
      created_at: params.now,
    },
    ...(audiencePhones.length > 0 ? [{
      organization_id: params.organizationId,
      template_key: templateKey,
      audience_segment_id: segment.id,
      scheduled_at: params.now,
      status: 'pending',
      channel: 'whatsapp',
      event_id: params.eventId,
      variables,
      created_at: params.now,
    }] : []),
  ]

  await admin.from('notification_jobs').insert(jobs).then(({ error }) => {
    if (error) console.warn('[process-staff-invite] notification_jobs insert failed:', error.message)
  })
}

async function triggerNotificationProcessor() {
  const cronSecret = Deno.env.get('CRON_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!cronSecret || !supabaseUrl) {
    console.warn('[process-staff-invite] notification processor not triggered: missing CRON_SECRET or SUPABASE_URL')
    return
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/process-notification-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
      },
      body: JSON.stringify({ source: 'staff-confirmation' }),
    })
    if (!res.ok) {
      console.warn('[process-staff-invite] notification processor failed:', await res.text())
    }
  } catch (err) {
    console.warn('[process-staff-invite] notification processor exception:', err)
  }
}

/** Validate a token record is usable right now */
function validateTokenRecord(
  token: InviteToken,
): { valid: true } | { valid: false; error: string; status: number } {
  if (!token.is_active) {
    return { valid: false, error: 'This invite link is no longer active', status: 410 }
  }
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    return { valid: false, error: 'This invite link has expired', status: 410 }
  }
  if (token.max_uses !== null && token.used_count >= token.max_uses) {
    return { valid: false, error: 'This invite link has reached its maximum number of uses', status: 410 }
  }
  return { valid: true }
}

/** Build branded HTML email for staff invite */
function buildInviteEmailHtml(params: {
  targetName: string | null
  eventName: string
  teamName: string | null
  shiftName: string | null
  roleType: string
  inviteUrl: string
  expiresAt: string | null
}): string {
  const { targetName, eventName, teamName, shiftName, roleType, inviteUrl, expiresAt } = params
  const greeting = targetName ? `Olá, ${targetName}!` : 'Olá!'
  const expiryLine = expiresAt
    ? `<p style="color:#888;font-size:13px;margin-top:8px;">Este convite expira em ${new Date(expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>`
    : ''
  const teamLine = teamName ? `<p style="margin:4px 0;color:#fff8ef;font-size:15px;">Equipe: <strong>${teamName}</strong></p>` : ''
  const shiftLine = shiftName ? `<p style="margin:4px 0;color:#fff8ef;font-size:15px;">Turno: <strong>${shiftName}</strong></p>` : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Convite para Staff, ${eventName}</title>
</head>
<body style="margin:0;padding:0;background:#050507;font-family:'Manrope',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0e0e12;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#d4ff00;padding:24px 32px;text-align:center;">
            <span style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;color:#050507;letter-spacing:2px;">FLOW EVENTS</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="font-size:24px;font-weight:700;color:#fff8ef;margin:0 0 8px 0;">${greeting}</h1>
            <p style="color:#aaa;font-size:15px;margin:0 0 24px 0;">Você foi convidado(a) para fazer parte da equipe do evento:</p>

            <div style="background:#18181f;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 12px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:22px;color:#d4ff00;letter-spacing:1px;">${eventName}</p>
              <p style="margin:4px 0;color:#fff8ef;font-size:15px;"> Função: <strong>${roleType}</strong></p>
              ${teamLine}
              ${shiftLine}
            </div>

            <p style="color:#aaa;font-size:14px;margin:0 0 28px 0;">
              Clique no botão abaixo para preencher sua candidatura e confirmar sua participação. O processo leva menos de 2 minutos.
            </p>

            <div style="text-align:center;margin-bottom:28px;">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#d4ff00;color:#050507;font-weight:700;font-size:16px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                Aceitar Convite
              </a>
            </div>

            ${expiryLine}

            <hr style="border:none;border-top:1px solid #222;margin:28px 0;"/>
            <p style="color:#666;font-size:12px;margin:0;">
              Se você não esperava este convite, pode ignorar este e-mail com segurança.<br/>
              Este convite é pessoal e intransferível.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a0e;padding:16px 32px;text-align:center;">
            <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} Flow Events · Powered by flow.events</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Batch processor
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function runBatch(admin: ReturnType<typeof createSupabaseAdminClient>): Promise<Response> {
  const now = new Date()
  const nowIso = now.toISOString()

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
  const RESEND_FROM    = Deno.env.get('RESEND_FROM_EMAIL') ?? 'no-reply@flow.events'
  const APP_URL        = Deno.env.get('APP_URL') ?? 'https://app.flow.events'

  const stats = { processed: 0, sent: 0, expired: 0, failed: 0, skipped: 0 }
  const results: BatchResult[] = []

  // Fetch up to 50 pending invite links that have a target_email
  const { data: pendingLinks, error: fetchError } = await admin
    .from('staff_invite_links')
    .select('id, token, event_id, role_type, team_id, shift_id, expires_at, is_active, used_count, max_uses, send_status, target_email, target_name, sent_at, send_error, created_by')
    .eq('send_status', 'pending')
    .limit(50)

  if (fetchError) {
    console.error('[process-staff-invite] batch fetch error:', fetchError)
    return jsonResponse({ error: 'Failed to fetch pending invites', details: fetchError.message }, 500)
  }

  if (!pendingLinks || pendingLinks.length === 0) {
    return jsonResponse({ message: 'No pending invites to process', ...stats })
  }

  for (const link of pendingLinks) {
    stats.processed++

    // â”€â”€ No target_email â†’ skip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!link.target_email) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'skipped', updated_at: nowIso })
        .eq('id', link.id)
      stats.skipped++
      results.push({ id: link.id, target_email: null, status: 'skipped' })
      continue
    }

    // â”€â”€ Expired â†’ mark expired â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (link.expires_at && new Date(link.expires_at) < now) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'expired', updated_at: nowIso })
        .eq('id', link.id)

      await admin.from('communications_log').insert({
        channel:          'email',
        recipient_email:  link.target_email,
        subject:          'Staff invite expired',
        status:           'failed',
        metadata: {
          invite_link_id: link.id,
          reason:         'expired',
        },
        sent_at: nowIso,
      })

      stats.expired++
      results.push({ id: link.id, target_email: link.target_email, status: 'expired' })
      continue
    }

    // â”€â”€ Idempotency: check if already sent via communications_log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: existingLog } = await admin
      .from('communications_log')
      .select('id')
      .eq('status', 'sent')
      .eq('recipient_email', link.target_email)
      .filter('metadata->>invite_link_id', 'eq', link.id)
      .maybeSingle()

    if (existingLog) {
      await admin
        .from('staff_invite_links')
        .update({ send_status: 'sent', updated_at: nowIso })
        .eq('id', link.id)
      stats.sent++
      results.push({ id: link.id, target_email: link.target_email, status: 'already_sent' })
      continue
    }

    // â”€â”€ Fetch enrichment data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [{ data: event }, { data: team }, { data: shift }] = await Promise.all([
      admin.from('events').select('name').eq('id', link.event_id).maybeSingle(),
      link.team_id
        ? admin.from('staff_teams').select('name').eq('id', link.team_id).maybeSingle()
        : Promise.resolve({ data: null }),
      link.shift_id
        ? admin.from('staff_shifts').select('name').eq('id', link.shift_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const eventName = (event as { name?: string } | null)?.name ?? 'Flow Event'
    const teamName  = (team  as { name?: string } | null)?.name ?? null
    const shiftName = (shift as { name?: string } | null)?.name ?? null

    const inviteUrl = `${APP_URL}/invite/${link.token}`

    const html = buildInviteEmailHtml({
      targetName: link.target_name ?? null,
      eventName,
      teamName,
      shiftName,
      roleType: link.role_type,
      inviteUrl,
      expiresAt: link.expires_at,
    })

    // â”€â”€ Send via Resend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let sendError: string | null = null
    let sendSuccess = false

    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    RESEND_FROM,
          to:      [link.target_email],
          subject: `Você foi convidado para a equipe de ${eventName}`,
          html,
        }),
      })

      if (!resendRes.ok) {
        const errBody = await resendRes.text()
        sendError = `Resend HTTP ${resendRes.status}: ${errBody}`
      } else {
        sendSuccess = true
      }
    } catch (err: unknown) {
      sendError = err instanceof Error ? err.message : 'Unknown send error'
    }

    // â”€â”€ Update staff_invite_links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await admin
      .from('staff_invite_links')
      .update({
        send_status: sendSuccess ? 'sent' : 'failed',
        sent_at:     sendSuccess ? nowIso : null,
        send_error:  sendError,
        updated_at:  nowIso,
      })
      .eq('id', link.id)

    // â”€â”€ Insert communications_log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await admin.from('communications_log').insert({
      channel:          'email',
      recipient_email:  link.target_email,
      subject:          `Convite para equipe, ${eventName}`,
      status:           sendSuccess ? 'sent' : 'failed',
      error_message:    sendError,
      metadata: {
        invite_link_id: link.id,
        event_id:       link.event_id,
        role_type:      link.role_type,
        team_id:        link.team_id,
        shift_id:       link.shift_id,
      },
      sent_at: nowIso,
    })

    if (sendSuccess) {
      stats.sent++
      results.push({ id: link.id, target_email: link.target_email, status: 'sent' })
    } else {
      stats.failed++
      results.push({ id: link.id, target_email: link.target_email, status: 'failed', error: sendError ?? undefined })
    }
  }

  return jsonResponse({ ...stats, results })
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main Handler
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const admin = createSupabaseAdminClient()

  // =========================================================================
  // GET, retrieve invite info OR trigger batch via cron webhook
  // =========================================================================
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const tokenParam = url.searchParams.get('token')
    const runParam   = url.searchParams.get('run')

    // Cron trigger: GET ?run=batch
    if (runParam === 'batch') {
      return await runBatch(admin)
    }

    if (!tokenParam) {
      return Response.json({ error: 'token query parameter is required' }, addCors({ status: 400 }))
    }

    try {
      const { data: inviteLink, error } = await admin
        .from('staff_invite_links')
        .select('id, organization_id, token, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by, send_status, target_email, target_name')
        .eq('token', tokenParam)
        .single()

      if (error || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      const { data: event } = await admin
        .from('events')
        .select('id, name, slug, starts_at, ends_at, venue_name, cover_url')
        .eq('id', inviteLink.event_id)
        .single()

      let team: { id: string; name: string } | null = null
      if (inviteLink.team_id) {
        const { data } = await admin.from('staff_teams').select('id, name').eq('id', inviteLink.team_id).single()
        team = data ?? null
      }

      let shift: { id: string; name: string; starts_at: string; ends_at: string } | null = null
      if (inviteLink.shift_id) {
        const { data } = await admin.from('staff_shifts').select('id, name, starts_at, ends_at').eq('id', inviteLink.shift_id).single()
        shift = data ?? null
      }

      return Response.json(
        {
          invite: {
            token:           inviteLink.token,
            role_type:       inviteLink.role_type,
            custom_fields:   inviteLink.custom_fields ?? [],
            expires_at:      inviteLink.expires_at,
            is_active:       inviteLink.is_active,
            spots_remaining: inviteLink.max_uses !== null ? Math.max(0, inviteLink.max_uses - inviteLink.used_count) : null,
          },
          event: event
            ? {
                id:              event.id,
                name:            event.name,
                slug:            event.slug,
                starts_at:       event.starts_at,
                ends_at:         event.ends_at,
                venue_name:      event.venue_name,
                cover_image_url: event.cover_url,
              }
            : null,
          team,
          shift,
        },
        addCors({ status: 200 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] GET error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  // =========================================================================
  // POST
  // =========================================================================
  if (req.method === 'POST') {
    let rawBody: Record<string, unknown>
    try {
      rawBody = await req.json()
    } catch {
      // Empty body â†’ treat as batch trigger
      rawBody = {}
    }

    const action = rawBody.action as string | undefined

    // â”€â”€ Mode 1: run-batch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const looksLikeStaffSubmission = Boolean(rawBody.token || rawBody.full_name || rawBody.email)

    if (action === 'run-batch' || (!action && !looksLikeStaffSubmission)) {
      return await runBatch(admin)
    }

    // â”€â”€ Mode 2: send-invite-email (single) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (action === 'send-invite-email') {
      const { invite_link_id, target_email, organization_id } = rawBody as {
        invite_link_id?: string
        target_email?: string
        organization_id?: string
      }

      if (!invite_link_id || !target_email) {
        return jsonResponse({ error: 'invite_link_id and target_email are required' }, 400)
      }

      // Patch target_email onto the link and mark it pending so the batch picks it up
      const nowIso = new Date().toISOString()
      const { error: patchError } = await admin
        .from('staff_invite_links')
        .update({ target_email, send_status: 'pending', updated_at: nowIso })
        .eq('id', invite_link_id)

      if (patchError) {
        return jsonResponse({ error: 'Failed to update invite link', details: patchError.message }, 500)
      }

      // Run single-link batch (re-use runBatch, the link will be the only pending one with this email)
      // For simplicity, just run the full batch; idempotency prevents double-sends
      return await runBatch(admin)
    }

    // â”€â”€ Mode 3: submit application â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const body = rawBody as Partial<ApplicationBody>

    const missing: string[] = []
    if (!body.token)             missing.push('token')
    if (!body.full_name)         missing.push('full_name')
    if (!body.email)             missing.push('email')
    if (!body.document_number)   missing.push('document_number')
    if (!body.pix_key)           missing.push('pix_key')
    if (body.terms_accepted !== true) missing.push('terms_accepted (must be true)')

    if (missing.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        addCors({ status: 400 }),
      )
    }

    const normalizedEmail = String(body.email ?? '').toLowerCase().trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return Response.json({ error: 'Invalid email format' }, addCors({ status: 400 }))
    }

    try {
      const { data: inviteLink, error: inviteError } = await admin
        .from('staff_invite_links')
        .select('id, organization_id, token, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by, send_status, target_email, target_name')
        .eq('token', body.token!)
        .single()

      if (inviteError || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      const cleanPhone = normalizeBsbPhoneDigits(body.phone)
      const cleanCpf = normalizeCPF(body.document_number)

      if (!isValidCPF(cleanCpf)) {
        return Response.json(
          { error: 'Informe um CPF valido.' },
          addCors({ status: 400 }),
        )
      }

      let existingStaff: { id: string } | null = null
      if (cleanCpf) {
        const { data } = await admin
          .from('staff_members')
          .select('id')
          .eq('event_id', inviteLink.event_id)
          .eq('cpf', cleanCpf)
          .maybeSingle()
        existingStaff = data
      } else {
        const { data } = await admin
          .from('staff_members')
          .select('id')
          .eq('event_id', inviteLink.event_id)
          .eq('email', normalizedEmail)
          .maybeSingle()
        existingStaff = data
      }

      if (existingStaff) {
        return Response.json(
          { error: 'Este cadastro ja existe para este evento.' },
          addCors({ status: 409 }),
        )
      }

      const now = new Date().toISOString()
      const nameParts = body.full_name!.trim().split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || null

      const { data: staffMember, error: staffError } = await admin
        .from('staff_members')
        .insert({
          organization_id:  inviteLink.organization_id ?? '00000000-0000-0000-0000-000000000001',
          event_id:         inviteLink.event_id,
          first_name:       firstName,
          last_name:        lastName,
          email:            normalizedEmail,
          phone:            cleanPhone || body.phone || null,
          cpf:              cleanCpf,
          role_title:       body.role_title || inviteLink.role_type || 'Staff',
          company:          body.company ?? null,
          pix_key:          body.pix_key ?? null,
          shift_label:      body.shift_label || ((body as Record<string, unknown>).shift_start && (body as Record<string, unknown>).shift_end ? `${(body as Record<string, unknown>).shift_start} - ${(body as Record<string, unknown>).shift_end}` : null),
          status:           'active',
          is_active:        true,
          notes:            body.bio ?? null,
          created_at:       now,
          updated_at:       now,
        })
        .select('id')
        .single()

      if (staffError || !staffMember) {
        console.error('[process-staff-invite] staff_member insert error:', staffError)
        return Response.json(
          { error: 'Failed to register staff member', details: staffError?.message },
          addCors({ status: 500 }),
        )
      }

      await admin
        .from('staff_invite_links')
        .update({ used_count: (inviteLink.used_count ?? 0) + 1, updated_at: now })
        .eq('id', inviteLink.id)

      const { data: eventInfo } = await admin
        .from('events')
        .select('name, slug, venue_name, venue_address, cover_url')
        .eq('id', inviteLink.event_id)
        .maybeSingle()

      await queueStaffConfirmationNotifications(admin, {
        organizationId: inviteLink.organization_id,
        eventId: inviteLink.event_id,
        eventName: eventInfo?.name ?? 'Evento',
        eventSlug: eventInfo?.slug ?? body.token!,
        venueName: eventInfo?.venue_name ?? null,
        venueAddress: (eventInfo?.venue_address as Record<string, unknown> | null | undefined) ?? null,
        eventImageUrl: (eventInfo?.cover_url as string | null | undefined) ?? null,
        staffMemberId: staffMember.id,
        staffName: body.full_name!.trim(),
        staffEmail: normalizedEmail,
        staffPhone: cleanPhone || body.phone || null,
        roleType: inviteLink.role_type,
        teamId: inviteLink.team_id ?? null,
        shiftId: inviteLink.shift_id ?? null,
        inviteLinkId: inviteLink.id,
        now,
      })
      await triggerNotificationProcessor()

      return Response.json(
        {
          success:        true,
          staff_id:       staffMember.id,
          message:        'Dados enviados com sucesso! Você receberá as informações do ponto em breve.',
        },
        addCors({ status: 201 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] POST error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  return Response.json({ error: 'Method not allowed' }, addCors({ status: 405 }))
})
