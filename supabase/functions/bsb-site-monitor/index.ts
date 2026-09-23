// Vigilância 24h do site do BSB Fight (bsbfight.com.br).
// Chamada a cada 5 minutos pelo pg_cron (ver migration bsb_site_monitor_cron).
// Confere domínios, páginas, arquivos do site, API de ingressos, a retirada de ponta a
// ponta (/api/health) e erros no navegador das pessoas. Quando algo quebra, manda
// e-mail de alerta; quando volta, manda e-mail de "voltou". Enquanto continuar
// quebrado, lembra a cada hora.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE = 'https://www.bsbfight.com.br'
// Só bsbfight.com.br é do BSB Fight. O bsbfight.com é de terceiro e não é vigiado.
const ROOT_HOSTS = [
  'https://bsbfight.com.br/',
  'https://www.bsbfight.com.br/',
  'https://qr.bsbfight.com.br/',
]
const PAGES = [
  '/edicoes',
  '/edicoes/5/card',
  '/ranking',
  '/ingressos',
  '/programacao',
  '/impacto-social',
  '/contato',
  '/patrocinadores',
]
const STATIC_FILES = ['/hero-poster.jpg', '/bsb-fight-logo.png', '/hero-video.mp4']
const CLIENT_ERROR_THRESHOLD = 10 // erros de navegador em 15 minutos
const REMIND_EVERY_MS = 60 * 60 * 1000

type Check = { key: string; label: string; ok: boolean; detail: string }

async function timedFetch(url: string, init: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timer)
  }
}

// Uma nova tentativa antes de dar como quebrado, para não alarmar por oscilação de rede.
// Cada checagem trata os próprios erros e nunca lança exceção.
async function withRetry(run: () => Promise<Check>): Promise<Check> {
  const first = await run()
  if (first.ok) return first
  await new Promise((resolve) => setTimeout(resolve, 8000))
  return run()
}

function pageCheck(url: string, key: string, label: string): () => Promise<Check> {
  return async () => {
    try {
      const response = await timedFetch(url)
      const html = await response.text()
      const ok = response.status === 200 && html.includes('id="root"') && /<script[^>]+src="\/assets\//.test(html)
      return { key, label, ok, detail: ok ? 'ok' : `HTTP ${response.status}${html.includes('id="root"') ? '' : ', página sem o app'}` }
    } catch (error) {
      return { key, label, ok: false, detail: error instanceof Error ? error.message : String(error) }
    }
  }
}

async function assetChecks(): Promise<Check[]> {
  const response = await timedFetch(`${SITE}/`)
  const html = await response.text()
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1])
  if (!assets.length) {
    return [{ key: 'arquivos_app', label: 'Arquivos do site (JS/CSS)', ok: false, detail: 'nenhum arquivo do app encontrado na página' }]
  }
  const results = await Promise.all(
    [...new Set(assets)].map(async (path) => {
      const asset = await timedFetch(`${SITE}${path}`).catch(() => null)
      return { path, status: asset?.status ?? 0 }
    }),
  )
  const broken = results.filter((item) => item.status !== 200)
  const statics = await Promise.all(
    STATIC_FILES.map(async (path) => {
      const file = await timedFetch(`${SITE}${path}`, { method: 'HEAD' }).catch(() => null)
      return { path, status: file?.status ?? 0 }
    }),
  )
  const brokenStatics = statics.filter((item) => item.status !== 200)
  return [
    {
      key: 'arquivos_app',
      label: 'Arquivos do site (JS/CSS)',
      ok: broken.length === 0,
      detail: broken.length ? broken.map((item) => `${item.path} HTTP ${item.status}`).join(', ') : 'ok',
    },
    {
      key: 'arquivos_midia',
      label: 'Vídeo, poster e logo',
      ok: brokenStatics.length === 0,
      detail: brokenStatics.length ? brokenStatics.map((item) => `${item.path} HTTP ${item.status}`).join(', ') : 'ok',
    },
  ]
}

function apiValidationCheck(host: string, key: string, label: string): () => Promise<Check> {
  return async () => {
    try {
      const response = await timedFetch(`${host}/api/ingressos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const body = await response.json().catch(() => null)
      const ok = response.status === 422 && body?.ok === false && Boolean(body?.fieldErrors)
      return { key, label, ok, detail: ok ? 'ok' : `HTTP ${response.status}` }
    } catch (error) {
      return { key, label, ok: false, detail: error instanceof Error ? error.message : String(error) }
    }
  }
}

async function healthCheck(): Promise<Check> {
  try {
    const response = await timedFetch(`${SITE}/api/health`, {}, 25000)
    const body = await response.json().catch(() => null)
    const failing = body?.checks
      ? Object.entries(body.checks)
          .filter(([name, value]) => value === false || (name === 'retirada_erro' && value))
          .map(([name, value]) => (name === 'retirada_erro' ? `erro: ${value}` : name))
      : []
    const ok = response.status === 200 && body?.ok === true
    return {
      key: 'retirada_ponta_a_ponta',
      label: 'Retirada de ingresso de ponta a ponta',
      ok,
      detail: ok
        ? `ok${body?.healed?.length ? ` (corrigido sozinho: ${JSON.stringify(body.healed)})` : ''}`
        : `HTTP ${response.status} ${body?.error ?? ''} ${failing.join(', ')} ${body?.checks?.emails_com_falha_30min ? `e-mails com falha: ${body.checks.emails_com_falha_30min}` : ''}`.trim(),
    }
  } catch (error) {
    return { key: 'retirada_ponta_a_ponta', label: 'Retirada de ingresso de ponta a ponta', ok: false, detail: error instanceof Error ? error.message : String(error) }
  }
}

async function clientErrorCheck(supabase: ReturnType<typeof createClient>): Promise<Check> {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('site_client_errors')
    .select('message, path')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    return { key: 'erros_navegador', label: 'Erros no navegador das pessoas', ok: true, detail: `não consegui ler: ${error.message}` }
  }
  const rows = data ?? []
  const counts = new Map<string, number>()
  for (const row of rows) {
    const label = `${row.message} (${row.path})`
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const ok = rows.length < CLIENT_ERROR_THRESHOLD
  return {
    key: 'erros_navegador',
    label: 'Erros no navegador das pessoas',
    ok,
    detail: rows.length ? `${rows.length} em 15 min. Mais comuns: ${top.map(([msg, n]) => `${n}x ${msg}`).join(' | ')}` : 'nenhum',
  }
}

async function sendAlert(subject: string, lines: string[]) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const to = (Deno.env.get('MONITOR_ALERT_EMAILS') ?? '').split(',').map((item) => item.trim()).filter(Boolean)
  if (!apiKey || !to.length) return { sent: false, reason: 'sem RESEND_API_KEY ou MONITOR_ALERT_EMAILS' }
  const from = Deno.env.get('MONITOR_FROM_EMAIL') ?? Deno.env.get('RESEND_FROM_EMAIL') ?? 'Pulse Events <contatopulse@animalzgroup.com>'
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">${subject}</h2>
    <ul>${lines.map((line) => `<li>${line.replace(/</g, '&lt;')}</li>`).join('')}</ul>
    <p style="color:#666;font-size:13px">Vigilância automática do bsbfight.com.br (a cada 5 minutos).</p>
  </div>`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, text: `${subject}\n\n${lines.join('\n')}` }),
  })
  return { sent: response.ok, reason: response.ok ? null : await response.text() }
}

Deno.serve(async (req) => {
  const expected = Deno.env.get('MONITOR_KEY')
  if (!expected || req.headers.get('x-monitor-key') !== expected) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 })
  }

  const started = Date.now()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const checks: Check[] = []
  const pageRuns = [
    ...ROOT_HOSTS.map((url) => pageCheck(url, `dominio:${new URL(url).host}`, `Domínio ${new URL(url).host}`)),
    ...PAGES.map((path) => pageCheck(`${SITE}${path}`, `pagina:${path}`, `Página ${path}`)),
    apiValidationCheck(SITE, 'api:www', 'API de ingressos (site principal)'),
    apiValidationCheck('https://qr.bsbfight.com.br', 'api:qr', 'API de ingressos (link do QR)'),
  ]
  checks.push(...(await Promise.all(pageRuns.map((run) => withRetry(run)))))
  checks.push(...(await assetChecks().catch((error) => [{ key: 'arquivos_app', label: 'Arquivos do site (JS/CSS)', ok: false, detail: String(error) }])))
  checks.push(await withRetry(healthCheck))
  checks.push(await clientErrorCheck(supabase))

  // Estado anterior de cada checagem, para alertar só em mudança (e lembrar a cada hora).
  const { data: previousRows } = await supabase.from('site_monitor_state').select('*')
  const previous = new Map((previousRows ?? []).map((row) => [row.check_key, row]))
  const now = new Date()
  const newlyBroken: Check[] = []
  const recovered: Check[] = []
  const stillBrokenReminder: Check[] = []

  for (const check of checks) {
    const before = previous.get(check.key)
    if (!check.ok && (!before || before.ok)) newlyBroken.push(check)
    else if (check.ok && before && !before.ok) recovered.push(check)
    else if (!check.ok && before && !before.ok) {
      const lastAlert = before.last_alert_at ? new Date(before.last_alert_at).getTime() : 0
      if (now.getTime() - lastAlert >= REMIND_EVERY_MS) stillBrokenReminder.push(check)
    }
  }

  const alertedKeys = new Set<string>()
  if (newlyBroken.length || stillBrokenReminder.length) {
    const broken = [...newlyBroken, ...stillBrokenReminder]
    const subject = newlyBroken.length
      ? `🚨 BSB Fight: ${newlyBroken.length} problema(s) no site`
      : `⚠️ BSB Fight: problema continua no site`
    const result = await sendAlert(subject, broken.map((check) => `${check.label}: ${check.detail}`))
    if (result.sent) broken.forEach((check) => alertedKeys.add(check.key))
  }
  if (recovered.length) {
    await sendAlert(`✅ BSB Fight: voltou ao normal`, recovered.map((check) => `${check.label}: ok`))
  }

  await supabase.from('site_monitor_state').upsert(
    checks.map((check) => {
      const before = previous.get(check.key)
      const changed = !before || before.ok !== check.ok
      return {
        check_key: check.key,
        ok: check.ok,
        detail: check.detail.slice(0, 1000),
        since: changed ? now.toISOString() : before.since,
        last_run: now.toISOString(),
        last_alert_at: alertedKeys.has(check.key) ? now.toISOString() : check.ok ? null : before?.last_alert_at ?? null,
      }
    }),
  )

  const failures = checks.filter((check) => !check.ok)
  await supabase.from('site_monitor_runs').insert({
    ok: failures.length === 0,
    failures: failures.map(({ key, detail }) => ({ key, detail })),
    healed: checks.filter((check) => check.detail.includes('corrigido sozinho')).map(({ key, detail }) => ({ key, detail })),
    duration_ms: Date.now() - started,
  })

  return new Response(
    JSON.stringify({ ok: failures.length === 0, failures, total: checks.length, ms: Date.now() - started }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
