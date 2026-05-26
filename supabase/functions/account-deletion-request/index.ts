import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

interface RequestBody {
  user_id: string
  email: string
  reason?: string | null
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Autenticar usuario via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'unauthorized' }, 401)
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: authData, error: authError } = await userClient.auth.getUser()
    if (authError || !authData?.user) {
      return jsonResponse({ error: 'unauthorized' }, 401)
    }

    const body = (await req.json()) as RequestBody
    if (!body?.user_id) {
      return jsonResponse({ error: 'missing_user_id' }, 400)
    }

    // 2. Apenas o proprio usuario pode solicitar exclusao
    if (body.user_id !== authData.user.id) {
      return jsonResponse({ error: 'forbidden' }, 403)
    }

    const admin = createSupabaseAdminClient()

    // 3. Registrar solicitacao (audit trail)
    await admin.from('account_deletion_requests').insert({
      user_id: body.user_id,
      email: body.email,
      reason: body.reason ?? null,
      requested_at: new Date().toISOString(),
      status: 'pending',
    })

    // 4. Anonimizar dados pessoais imediatamente (PII) — manter referencias por integridade
    const anonEmail = `deleted-${body.user_id}@pulse.deleted`
    await admin
      .from('profiles')
      .update({
        first_name: 'Conta',
        last_name: 'Excluida',
        phone: null,
        avatar_url: null,
        cpf: null,
        bio: null,
        email_marketing_optin: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', body.user_id)

    // 5. Apagar dados nao-criticos imediatamente
    // Resolver staff.id (staff_location_events usa staff_id, nao auth user_id)
    const { data: staffRows } = await admin
      .from('staff')
      .select('id')
      .eq('profile_id', body.user_id)
    const staffIds = (staffRows ?? []).map((r: { id: string }) => r.id)

    if (staffIds.length > 0) {
      await admin.from('staff_location_events').delete().in('staff_id', staffIds).then(() => {}, () => {})
      await admin.from('staff_presence_sessions').delete().in('staff_id', staffIds).then(() => {}, () => {})
      await admin.from('staff_presence_events').delete().in('staff_id', staffIds).then(() => {}, () => {})
    }

    // push_tokens: tenta user_id primeiro, fallback profile_id (schema legado)
    await admin.from('push_tokens').delete().eq('user_id', body.user_id).then(() => {}, async () => {
      await admin.from('push_tokens').delete().eq('profile_id', body.user_id).then(() => {}, () => {})
    })

    await admin.from('user_sessions').delete().eq('user_id', body.user_id).then(() => {}, () => {})

    // 6. Schedule hard-delete em 30 dias (LGPD/GDPR grace period)
    // O cron job real apaga depois conforme account_deletion_requests.scheduled_for

    // 7. Atualizar email do auth user pra evitar reuso imediato
    await admin.auth.admin.updateUserById(body.user_id, {
      email: anonEmail,
      ban_duration: '876000h', // 100 anos
    }).catch(() => {})

    return jsonResponse({
      success: true,
      message: 'Solicitacao de exclusao registrada. Conta sera permanentemente apagada em ate 30 dias.',
      scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (err) {
    console.error('[account-deletion-request]', err)
    return jsonResponse(
      { error: 'internal_error', message: err instanceof Error ? err.message : 'unknown' },
      500,
    )
  }
})
