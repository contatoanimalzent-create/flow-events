import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Clipboard,
  Instagram,
  Link2,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  Swords,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ALLOWED_EMAILS = ['walteciojr@gmail.com', 'hds.vieira@gmail.com']

type CornerColor = 'azul' | 'vermelho'

interface AthleteRow {
  id: string
  kind: 'athlete' | 'corner'
  full_name: string
  cpf: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  gym: string | null
  city: string | null
  state: string | null
  athlete_code: string | null
  birth_date: string | null
  instagram: string | null
  sherdog_url: string | null
  weight_class: string | null
  weight_kg: number | null
  record_wins: number | null
  record_losses: number | null
  record_draws: number | null
  corner_color: CornerColor | null
  athlete_id: string | null
  created_at: string
}

interface EventRow {
  id: string
  name: string
  slug: string
}

const COLOR_HEX: Record<CornerColor, string> = { azul: '#2E6BFF', vermelho: '#FF3B3B' }

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function ageFrom(birth?: string | null): number | null {
  if (!birth) return null
  const d = new Date(birth)
  if (Number.isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
}

function record(a: AthleteRow): string | null {
  if (a.record_wins === null && a.record_losses === null && a.record_draws === null) return null
  return `${a.record_wins ?? 0}-${a.record_losses ?? 0}-${a.record_draws ?? 0}`
}

function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

export default function EventAthletesAdminPage({
  eventSlug,
  onNavigate,
}: {
  eventSlug: string
  onNavigate?: (to: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [event, setEvent] = useState<EventRow | null>(null)
  const [rows, setRows] = useState<AthleteRow[]>([])
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [colorFilter, setColorFilter] = useState<'all' | CornerColor>('all')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email?.toLowerCase() ?? ''
      setAuthEmail(email || null)

      if (!authData.user || !ALLOWED_EMAILS.includes(email)) {
        setAllowed(false)
        return
      }
      setAllowed(true)

      const { data: eventRow } = await supabase
        .from('events')
        .select('id,name,slug')
        .eq('slug', eventSlug)
        .maybeSingle()

      if (!eventRow) return
      setEvent(eventRow as EventRow)

      const { data } = await supabase
        .from('event_athletes')
        .select(
          'id,kind,full_name,cpf,phone,email,photo_url,gym,city,state,athlete_code,birth_date,instagram,sherdog_url,weight_class,weight_kg,record_wins,record_losses,record_draws,corner_color,athlete_id,created_at',
        )
        .eq('event_id', (eventRow as EventRow).id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      setRows((data ?? []) as AthleteRow[])
      setLastSync(new Date())
    } finally {
      if (!silent) setLoading(false)
    }
  }, [eventSlug])

  useEffect(() => { void load() }, [load])

  // Mesma logica do painel de staff: atualiza sozinho e pausa fora da aba.
  useEffect(() => {
    if (!allowed) return
    let timer: number | undefined
    const stop = () => {
      if (timer) window.clearInterval(timer)
      timer = undefined
    }
    const start = () => {
      stop()
      timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') void load(true)
      }, 15_000)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void load(true)
        start()
      } else {
        stop()
      }
    }
    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [allowed, load])

  async function loginAdmin(e: React.FormEvent) {
    e.preventDefault()
    setLoginBusy(true)
    setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    })
    setLoginBusy(false)
    if (error) {
      setLoginError('E-mail ou senha inválidos.')
      return
    }
    void load()
  }

  const athletes = useMemo(() => rows.filter((r) => r.kind === 'athlete'), [rows])
  const cornersByAthlete = useMemo(() => {
    const map = new Map<string, AthleteRow[]>()
    rows.filter((r) => r.kind === 'corner').forEach((corner) => {
      if (!corner.athlete_id) return
      const list = map.get(corner.athlete_id) ?? []
      list.push(corner)
      map.set(corner.athlete_id, list)
    })
    return map
  }, [rows])

  const filtered = useMemo(() => {
    const term = normalizeSearch(search)
    return athletes.filter((a) => {
      if (colorFilter !== 'all' && a.corner_color !== colorFilter) return false
      if (!term) return true
      const corners = cornersByAthlete.get(a.id) ?? []
      const haystack = normalizeSearch(
        [a.full_name, a.cpf, a.gym, a.city, a.athlete_code, ...corners.map((c) => `${c.full_name} ${c.cpf}`)]
          .filter(Boolean)
          .join(' '),
      )
      return haystack.includes(term)
    })
  }, [athletes, cornersByAthlete, colorFilter, search])

  const stats = useMemo(() => {
    const corners = rows.filter((r) => r.kind === 'corner')
    return {
      atletas: athletes.length,
      corners: corners.length,
      azul: athletes.filter((a) => a.corner_color === 'azul').length,
      vermelho: athletes.filter((a) => a.corner_color === 'vermelho').length,
      semCorner: athletes.filter((a) => (cornersByAthlete.get(a.id) ?? []).length === 0).length,
    }
  }, [athletes, cornersByAthlete, rows])

  function exportExcel() {
    const header = [
      'Tipo', 'Nome', 'CPF', 'Lado', 'Equipe', 'Categoria', 'Peso', 'Cartel',
      'Nascimento', 'Idade', 'WhatsApp', 'E-mail', 'Cidade', 'UF', 'Instagram', 'Sherdog', 'Atleta',
    ]
    const lines: string[][] = []
    filtered.forEach((a) => {
      lines.push([
        'Atleta', a.full_name, a.cpf ?? '', a.corner_color ?? '', a.gym ?? '', a.weight_class ?? '',
        a.weight_kg ? String(a.weight_kg) : '', record(a) ?? '', a.birth_date ?? '',
        ageFrom(a.birth_date)?.toString() ?? '', a.phone ?? '', a.email ?? '', a.city ?? '', a.state ?? '',
        a.instagram ?? '', a.sherdog_url ?? '', '',
      ])
      ;(cornersByAthlete.get(a.id) ?? []).forEach((c) => {
        lines.push([
          'Corner', c.full_name, c.cpf ?? '', c.corner_color ?? '', c.gym ?? '', '', '', '', '', '',
          c.phone ?? '', c.email ?? '', '', '', '', '', a.full_name,
        ])
      })
    })

    const table = [header, ...lines]
      .map((cols) => `<tr>${cols.map((c) => `<td>${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
      .join('')
    const html = `<html><head><meta charset="utf-8"></head><body><table>${table}</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `atletas-${event?.slug ?? eventSlug}.xls`
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4FF00]" />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] px-5 py-8 text-white">
        <form onSubmit={loginAdmin} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <ShieldAlert className="mb-4 h-9 w-9 text-[#D4FF00]" />
          <h1 className="text-2xl font-black tracking-tight">Atletas e corners</h1>
          <p className="mt-2 text-sm text-slate-400">
            Entre com o e-mail autorizado para ver os atletas deste evento.
          </p>

          {authEmail && !ALLOWED_EMAILS.includes(authEmail) && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-100">
              Sessão atual: {authEmail}. Este e-mail não está liberado para este painel.
            </div>
          )}

          <label className="mt-5 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">E-mail</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="admin@email.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="mt-3 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Senha</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {loginError && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginBusy}
            className="mt-5 w-full rounded-2xl bg-[#D4FF00] py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:opacity-60"
          >
            {loginBusy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  const statCards = [
    { label: 'Atletas', value: stats.atletas, Icon: Swords },
    { label: 'Corners', value: stats.corners, Icon: Users },
    { label: 'Canto azul', value: stats.azul, Icon: Swords },
    { label: 'Canto vermelho', value: stats.vermelho, Icon: Swords },
  ]

  return (
    <div className="min-h-screen bg-[#06070a] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => onNavigate?.(`/pulse/${eventSlug}/admin`)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Painel da equipe
        </button>
        <button
          onClick={() => onNavigate?.(`/pulse/${eventSlug}/busca`)}
          className="ml-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-white"
        >
          <Search className="h-3.5 w-3.5" /> Buscar pessoa
        </button>

        <h1 className="mt-4 text-3xl font-black tracking-tight">Atletas e corners</h1>
        <p className="mt-1 text-sm text-slate-400">{event?.name ?? eventSlug}</p>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Icon className="mb-3 h-5 w-5 text-[#D4FF00]" />
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </section>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4FF00]/25 bg-[#D4FF00]/[0.08] px-3 py-1 font-semibold text-[#D4FF00]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4FF00] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4FF00]" />
            </span>
            Ao vivo
          </span>
          <span>
            {lastSync
              ? `Atualizado as ${lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Carregando...'}
          </span>
          <span className="text-slate-500">Atualiza sozinho a cada 15 segundos.</span>
        </div>

        {stats.semCorner > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-200">
            {stats.semCorner === 1
              ? '1 atleta ainda não cadastrou nenhum corner.'
              : `${stats.semCorner} atletas ainda não cadastraram nenhum corner.`}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CPF, equipe ou cidade"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'azul', 'vermelho'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setColorFilter(value)}
                className="rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-all"
                style={{
                  borderColor: colorFilter === value
                    ? (value === 'all' ? '#D4FF00' : COLOR_HEX[value])
                    : 'rgba(255,255,255,0.10)',
                  color: colorFilter === value ? '#f5f0e8' : 'rgba(245,240,232,0.56)',
                  background: colorFilter === value
                    ? `${value === 'all' ? '#D4FF00' : COLOR_HEX[value]}26`
                    : 'rgba(255,255,255,0.04)',
                }}
              >
                {value === 'all' ? 'Todos' : value}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              <RefreshCw className="h-4 w-4" /> Atualizar
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              <Clipboard className="h-4 w-4" /> Excel
            </button>
          </div>
        </div>

        <section className="mt-5 space-y-4 pb-10">
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <Swords className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-400">
                {athletes.length === 0
                  ? 'Nenhum atleta cadastrado ainda. Assim que alguém usar o link, aparece aqui.'
                  : 'Nenhum atleta encontrado com esse filtro.'}
              </p>
            </div>
          )}

          {filtered.map((a) => {
            const corners = cornersByAthlete.get(a.id) ?? []
            const hex = a.corner_color ? COLOR_HEX[a.corner_color] : '#64748b'
            const idade = ageFrom(a.birth_date)

            return (
              <article
                key={a.id}
                className="rounded-3xl border bg-white/[0.04] p-4"
                style={{ borderColor: `${hex}44` }}
              >
                <div className="flex gap-4">
                  {a.photo_url ? (
                    <a href={a.photo_url} target="_blank" rel="noreferrer" className="shrink-0">
                      <img
                        src={a.photo_url}
                        alt={a.full_name}
                        className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-600">
                      <Swords className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black leading-tight">{a.full_name}</h2>
                      {a.corner_color && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                          style={{ background: `${hex}26`, color: '#f5f0e8' }}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: hex }} />
                          {a.corner_color}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {[
                        a.cpf,
                        a.weight_class,
                        a.weight_kg ? `${a.weight_kg} kg` : null,
                        record(a) ? `Cartel ${record(a)}` : null,
                        idade ? `${idade} anos` : null,
                      ].filter(Boolean).join(' · ')}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {[a.gym, [a.city, a.state].filter(Boolean).join('/'), a.phone, a.email]
                        .filter(Boolean).join(' · ')}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {a.instagram && (
                        <a
                          href={instagramUrl(a.instagram)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#D4FF00] hover:underline"
                        >
                          <Instagram className="h-3.5 w-3.5" /> {a.instagram}
                        </a>
                      )}
                      {a.sherdog_url && (
                        <a
                          href={a.sherdog_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#D4FF00] hover:underline"
                        >
                          <Link2 className="h-3.5 w-3.5" /> Sherdog
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Corners ({corners.length}/2)
                  </p>
                  {corners.length === 0 ? (
                    <p className="mt-2 text-xs text-amber-300">Nenhum corner cadastrado.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {corners.map((c) => (
                        <li key={c.id} className="text-sm text-slate-200">
                          {c.full_name}
                          <span className="text-xs text-slate-500">
                            {[c.cpf, c.gym].filter(Boolean).length > 0
                              ? ` · ${[c.cpf, c.gym].filter(Boolean).join(' · ')}`
                              : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}
