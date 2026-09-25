import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Save,
  Search,
  ShieldAlert,
  Swords,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OPERATIONAL_STAFF_ROLE_GROUPS } from '@/modules/staff/staffRoles'

const ALLOWED_EMAILS = ['walteciojr@gmail.com', 'hds.vieira@gmail.com']

const CONSOLE_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-admin-console`

// A chave vem no proprio endereco (?k=...). Com ela o painel abre sem senha e
// tudo passa pela edge function, que confere a chave. Sem ela, vale o login.
function chaveDoLink(): string {
  try {
    return new URLSearchParams(window.location.search).get('k')?.trim() ?? ''
  } catch {
    return ''
  }
}

type Papel = 'equipe' | 'atleta' | 'corner'

interface Pessoa {
  papel: Papel
  id: string
  nome: string
  cpf: string | null
  telefone: string | null
  email: string | null
  equipe: string | null
  foto: string | null
  // equipe
  funcao?: string | null
  status?: string | null
  // atleta e corner
  lado?: string | null
  categoria?: string | null
  peso?: number | null
  cidade?: string | null
  uf?: string | null
  de_quem?: string | null
  athlete_id?: string | null
}

interface Ponto {
  id: string
  type: 'checkin' | 'checkout'
  work_role: string | null
  created_at: string
  distance_from_venue_meters: number | null
  photo_url: string | null
}

const COR: Record<string, string> = { azul: '#2E6BFF', vermelho: '#FF3B3B' }
const BADGE: Record<Papel, { texto: string; cor: string }> = {
  equipe: { texto: 'EQUIPE', cor: '#D4FF00' },
  atleta: { texto: 'ATLETA', cor: '#FF8A3D' },
  corner: { texto: 'CORNER', cor: '#9B8CFF' },
}

function soDigitos(v: string) {
  return v.replace(/\D/g, '')
}

function semAcento(v: string) {
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function hora(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

async function chamarConsole(
  chave: string,
  eventSlug: string,
  action: string,
  extra: Record<string, unknown> = {},
) {
  const res = await fetch(CONSOLE_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: chave, event_slug: eventSlug, action, ...extra }),
  })
  const corpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(corpo?.error ?? 'Não foi possível completar a ação.')
  return corpo
}

export default function EventSearchAdminPage({
  eventSlug,
  onNavigate,
}: {
  eventSlug: string
  onNavigate?: (to: string) => void
}) {
  const chave = useMemo(() => chaveDoLink(), [])
  const [carregando, setCarregando] = useState(true)
  const [liberado, setLiberado] = useState(false)
  const [emailAtual, setEmailAtual] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string>('')
  const [eventName, setEventName] = useState<string>('')

  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [termo, setTermo] = useState('')
  const [filtro, setFiltro] = useState<'todos' | Papel>('todos')
  const [selecionada, setSelecionada] = useState<Pessoa | null>(null)
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [recado, setRecado] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState<Partial<Pessoa>>({})

  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loginOcupado, setLoginOcupado] = useState(false)
  const [loginErro, setLoginErro] = useState<string | null>(null)

  // ── carrega tudo ──────────────────────────────────────────────────────────
  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      if (chave) {
        const dados = await chamarConsole(chave, eventSlug, 'load')
        setLiberado(true)
        setEventId(dados.event.id)
        setEventName(dados.event.name)

        const lista: Pessoa[] = []
        for (const s of dados.staff ?? []) {
          lista.push({
            papel: 'equipe', id: s.id,
            nome: [s.first_name, s.last_name].filter(Boolean).join(' '),
            cpf: s.cpf, telefone: s.phone, email: s.email,
            equipe: s.company, foto: s.photo_url,
            funcao: s.role_title, status: s.status,
          })
        }
        const mapa = new Map((dados.athletes ?? []).map((a: Record<string, unknown>) => [a.id, a]))
        for (const a of dados.athletes ?? []) {
          lista.push({
            papel: a.kind === 'athlete' ? 'atleta' : 'corner', id: a.id,
            nome: a.full_name, cpf: a.cpf, telefone: a.phone, email: a.email,
            equipe: a.gym, foto: a.photo_url, lado: a.corner_color,
            categoria: a.weight_class, peso: a.weight_kg,
            cidade: a.city, uf: a.state, athlete_id: a.athlete_id,
            de_quem: a.athlete_id
              ? ((mapa.get(a.athlete_id) as { full_name?: string } | undefined)?.full_name ?? null)
              : null,
          })
        }
        setPessoas(lista)
        return
      }

      const { data: auth } = await supabase.auth.getUser()
      const email = auth.user?.email?.toLowerCase() ?? ''
      setEmailAtual(email || null)
      if (!auth.user || !ALLOWED_EMAILS.includes(email)) {
        setLiberado(false)
        return
      }
      setLiberado(true)

      const { data: ev, error: eventError } = await supabase
        .from('events').select('id,name').eq('slug', eventSlug).maybeSingle()
      if (eventError) throw eventError
      if (!ev) throw new Error('Evento não encontrado ou sem permissão de acesso.')
      setEventId(ev.id)
      setEventName(ev.name)

      const [equipe, atletas] = await Promise.all([
        supabase.from('staff_members')
          .select('id,first_name,last_name,cpf,phone,email,role_title,company,status,photo_url')
          .eq('event_id', ev.id).eq('is_active', true),
        supabase.from('event_athletes')
          .select('id,kind,full_name,cpf,phone,email,gym,photo_url,corner_color,weight_class,weight_kg,city,state,athlete_id')
          .eq('event_id', ev.id).eq('status', 'active'),
      ])
      if (equipe.error) throw equipe.error
      if (atletas.error) throw atletas.error

      const lista: Pessoa[] = []

      for (const s of equipe.data ?? []) {
        lista.push({
          papel: 'equipe', id: s.id,
          nome: [s.first_name, s.last_name].filter(Boolean).join(' '),
          cpf: s.cpf, telefone: s.phone, email: s.email,
          equipe: s.company, foto: s.photo_url,
          funcao: s.role_title, status: s.status,
        })
      }

      const porId = new Map((atletas.data ?? []).map((a) => [a.id, a]))
      for (const a of atletas.data ?? []) {
        lista.push({
          papel: a.kind === 'athlete' ? 'atleta' : 'corner', id: a.id,
          nome: a.full_name, cpf: a.cpf, telefone: a.phone, email: a.email,
          equipe: a.gym, foto: a.photo_url, lado: a.corner_color,
          categoria: a.weight_class, peso: a.weight_kg,
          cidade: a.city, uf: a.state, athlete_id: a.athlete_id,
          de_quem: a.athlete_id ? (porId.get(a.athlete_id)?.full_name ?? null) : null,
        })
      }

      setPessoas(lista)
    } catch (err) {
      setRecado({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Não foi possível carregar os cadastros. Tente atualizar a página.' })
    } finally {
      if (!silencioso) setCarregando(false)
    }
  }, [eventSlug, chave])

  useEffect(() => { void carregar() }, [carregar])

  useEffect(() => {
    if (!liberado) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') void carregar(true)
    }, 20_000)
    return () => window.clearInterval(t)
  }, [liberado, carregar])

  // ── pontos da pessoa escolhida ────────────────────────────────────────────
  const carregarPontos = useCallback(async (p: Pessoa) => {
    if (p.papel !== 'equipe') { setPontos([]); return }
    if (chave) {
      try {
        const r = await chamarConsole(chave, eventSlug, 'points', { staff_member_id: p.id })
        setPontos((r.points ?? []) as Ponto[])
      } catch {
        setPontos([])
      }
      return
    }
    const { data } = await supabase
      .from('staff_checkins')
      .select('id,type,work_role,created_at,distance_from_venue_meters,photo_url')
      .eq('staff_member_id', p.id)
      .order('created_at', { ascending: false })
    setPontos((data ?? []) as Ponto[])
  }, [chave, eventSlug])

  function escolher(p: Pessoa) {
    setSelecionada(p)
    setEditando(false)
    setRascunho({})
    setRecado(null)
    void carregarPontos(p)
  }

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoginOcupado(true); setLoginErro(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(), password: loginSenha,
    })
    setLoginOcupado(false)
    if (error) { setLoginErro('E-mail ou senha inválidos.'); return }
    void carregar()
  }

  // ── manutencao ────────────────────────────────────────────────────────────
  async function salvar() {
    if (!selecionada) return
    setOcupado('salvar'); setRecado(null)
    try {
      if (!(rascunho.nome ?? selecionada.nome).trim()) throw new Error('Informe o nome antes de salvar.')
      if (chave) {
        await chamarConsole(chave, eventSlug, 'update_person', {
          papel: selecionada.papel,
          id: selecionada.id,
          dados: {
            nome: rascunho.nome ?? selecionada.nome,
            cpf: rascunho.cpf ?? selecionada.cpf,
            telefone: rascunho.telefone ?? selecionada.telefone,
            equipe: rascunho.equipe ?? selecionada.equipe,
            funcao: rascunho.funcao ?? selecionada.funcao,
            lado: rascunho.lado ?? selecionada.lado,
            categoria: rascunho.categoria ?? selecionada.categoria,
          },
        })
      } else if (selecionada.papel === 'equipe') {
        const partes = (rascunho.nome ?? selecionada.nome).trim().split(/\s+/)
        const { error } = await supabase.from('staff_members').update({
          first_name: partes[0],
          last_name: partes.slice(1).join(' ') || null,
          cpf: rascunho.cpf ?? selecionada.cpf,
          phone: rascunho.telefone ?? selecionada.telefone,
          role_title: rascunho.funcao ?? selecionada.funcao,
          company: rascunho.equipe ?? selecionada.equipe,
        }).eq('id', selecionada.id).eq('event_id', eventId).select('id').single()
        if (error) throw error
      } else {
        const { error } = await supabase.from('event_athletes').update({
          full_name: (rascunho.nome ?? selecionada.nome).trim(),
          cpf: rascunho.cpf ?? selecionada.cpf,
          phone: rascunho.telefone ?? selecionada.telefone,
          gym: rascunho.equipe ?? selecionada.equipe,
          corner_color: rascunho.lado ?? selecionada.lado,
          weight_class: rascunho.categoria ?? selecionada.categoria,
        }).eq('id', selecionada.id).eq('event_id', eventId).select('id').single()
        if (error) throw error
      }
      setRecado({ tipo: 'ok', texto: 'Alteração salva.' })
      setEditando(false)
      await carregar(true)
      setSelecionada((atual) => atual ? { ...atual, ...rascunho } as Pessoa : atual)
    } catch (err) {
      setRecado({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Não foi possível salvar.' })
    } finally {
      setOcupado(null)
    }
  }

  async function remover() {
    if (!selecionada || selecionada.papel === 'equipe') return
    const confirma = window.confirm(
      `Remover ${selecionada.nome} do evento?\n\nO registro não é apagado, fica marcado como cancelado e some das listas. Dá para desfazer.`)
    if (!confirma) return
    setOcupado('remover')
    try {
      if (chave) {
        await chamarConsole(chave, eventSlug, 'cancel_athlete', { id: selecionada.id })
        setRecado({ tipo: 'ok', texto: `${selecionada.nome} removido do evento.` })
        setSelecionada(null)
        await carregar(true)
        return
      }
      const { error } = await supabase.from('event_athletes')
        .update({ status: 'cancelled' }).eq('id', selecionada.id).eq('event_id', eventId).select('id').single()
      if (error) throw error
      setRecado({ tipo: 'ok', texto: `${selecionada.nome} removido do evento.` })
      setSelecionada(null)
      await carregar(true)
    } catch (err) {
      setRecado({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Não foi possível remover.' })
    } finally {
      setOcupado(null)
    }
  }

  async function pontoManual(tipo: 'checkin' | 'checkout') {
    if (!selecionada || selecionada.papel !== 'equipe') return
    setOcupado(tipo); setRecado(null)
    try {
      if (chave) {
        await chamarConsole(chave, eventSlug, 'manual_point', {
          staff_member_id: selecionada.id, type: tipo,
        })
        setRecado({ tipo: 'ok', texto: tipo === 'checkin' ? 'Entrada registrada.' : 'Saída registrada.' })
        await carregarPontos(selecionada)
        await carregar(true)
        return
      }
      const { data, error } = await supabase.functions.invoke('bsb5-admin-action', {
        body: {
          action: tipo === 'checkin' ? 'manual_checkin' : 'manual_checkout',
          event_slug: eventSlug,
          staff_member_id: selecionada.id,
        },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setRecado({ tipo: 'ok', texto: tipo === 'checkin' ? 'Entrada registrada.' : 'Saída registrada.' })
      await carregarPontos(selecionada)
      await carregar(true)
    } catch (err) {
      setRecado({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Não foi possível registrar.' })
    } finally {
      setOcupado(null)
    }
  }

  // ── busca ─────────────────────────────────────────────────────────────────
  const resultados = useMemo(() => {
    const t = termo.trim()
    if (!t) return [] as Pessoa[]
    const digitos = soDigitos(t)
    const texto = semAcento(t)
    return pessoas
      .filter((p) => filtro === 'todos' || p.papel === filtro)
      .filter((p) => {
        if (digitos.length >= 3 && soDigitos(p.cpf ?? '').includes(digitos)) return true
        if (digitos.length >= 3 && /^[\d\s()+.\-]+$/.test(t) && soDigitos(p.telefone ?? '').includes(digitos)) return true
        if (texto.length >= 2 && semAcento(p.nome).includes(texto)) return true
        if (texto.length >= 2 && semAcento(p.email ?? '').includes(texto)) return true
        if (texto.length >= 2 && semAcento(p.equipe ?? '').includes(texto)) return true
        return false
      })
      .slice(0, 60)
  }, [pessoas, termo, filtro])

  const totais = useMemo(() => ({
    equipe: pessoas.filter((p) => p.papel === 'equipe').length,
    atleta: pessoas.filter((p) => p.papel === 'atleta').length,
    corner: pessoas.filter((p) => p.papel === 'corner').length,
  }), [pessoas])

  // ── telas ─────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4FF00]" />
      </div>
    )
  }

  if (!liberado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] px-5 py-8 text-white">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <ShieldAlert className="mb-4 h-9 w-9 text-[#D4FF00]" />
          <h1 className="text-2xl font-black tracking-tight">Busca e manutenção</h1>
          <p className="mt-2 text-sm text-slate-400">Entre com o e-mail autorizado.</p>
          {emailAtual && !ALLOWED_EMAILS.includes(emailAtual) && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-100">
              Sessão atual: {emailAtual}. Este e-mail não está liberado.
            </div>
          )}
          <label className="mt-5 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">E-mail</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Mail className="h-4 w-4 text-slate-500" />
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none" required />
            </div>
          </label>
          <label className="mt-3 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Senha</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Lock className="h-4 w-4 text-slate-500" />
              <input type="password" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none" required />
            </div>
          </label>
          {loginErro && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{loginErro}</div>
          )}
          <button type="submit" disabled={loginOcupado}
            className="mt-5 w-full rounded-2xl bg-[#D4FF00] py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:opacity-60">
            {loginOcupado ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  const p = selecionada

  return (
    <div className="min-h-screen bg-[#06070a] px-4 py-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => onNavigate?.(`/pulse/${eventSlug}/admin`)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Equipe
          </button>
          <button onClick={() => onNavigate?.(`/pulse/${eventSlug}/atletas`)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 hover:text-white">
            <Swords className="h-3.5 w-3.5" /> Atletas
          </button>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight">Busca e manutenção</h1>
        <p className="mt-1 text-sm text-slate-400">
          {eventName} &nbsp;·&nbsp; {totais.equipe} da equipe, {totais.atleta} atletas, {totais.corner} corners
        </p>

        {/* busca */}
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Nome, CPF, telefone, e-mail ou equipe"
            aria-label="Buscar por nome, CPF, telefone, e-mail ou equipe"
            className="min-w-0 flex-1 bg-transparent py-4 text-base text-white outline-none placeholder:text-slate-600"
            autoFocus
          />
          {termo && (
            <button onClick={() => setTermo('')} aria-label="Limpar busca" className="text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['todos', 'equipe', 'atleta', 'corner'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className="rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all"
              style={{
                borderColor: filtro === f ? '#D4FF00' : 'rgba(255,255,255,0.12)',
                background: filtro === f ? 'rgba(212,255,0,0.12)' : 'transparent',
                color: filtro === f ? '#D4FF00' : 'rgba(255,255,255,0.55)',
              }}>
              {f === 'todos' ? 'Todos' : BADGE[f].texto}
            </button>
          ))}
        </div>

        {recado && (
          <div className={`mt-4 flex items-start gap-2 rounded-2xl border p-3 text-sm ${
            recado.tipo === 'ok'
              ? 'border-[#D4FF00]/30 bg-[#D4FF00]/[0.08] text-[#eaffb0]'
              : 'border-red-400/25 bg-red-400/10 text-red-100'}`}>
            {recado.tipo === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {recado.texto}
          </div>
        )}

        {/* resultados */}
        {!termo && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Busque uma pessoa e abra sua ficha para consultar os pontos, corrigir dados ou registrar uma entrada ou saída manual.
          </p>
        )}

        {termo && resultados.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Ninguém encontrado. Tente nome, CPF, telefone, e-mail ou equipe.
          </p>
        )}

        <div className="mt-5 space-y-2">
          {resultados.map((r) => {
            const b = BADGE[r.papel]
            const ativa = p?.id === r.id
            return (
              <button key={`${r.papel}-${r.id}`} onClick={() => escolher(r)}
                className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all"
                style={{
                  borderColor: ativa ? b.cor : 'rgba(255,255,255,0.10)',
                  background: ativa ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                }}>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-[0.1em]"
                  style={{ background: `${b.cor}22`, color: b.cor }}>{b.texto}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{r.nome}</span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {[r.cpf, r.telefone, r.email, r.equipe, r.funcao, r.de_quem ? `corner de ${r.de_quem}` : null]
                      .filter(Boolean).join(' · ')}
                  </span>
                </span>
                {r.lado && (
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COR[r.lado] ?? '#666' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* ficha da pessoa */}
        {p && (
          <div className="mt-6 rounded-3xl border border-white/12 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {p.foto && (
                  <a href={p.foto} target="_blank" rel="noreferrer">
                    <img src={p.foto} alt={p.nome} loading="lazy" className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
                  </a>
                )}
                <div>
                  <h2 className="text-xl font-black leading-tight">{p.nome}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {BADGE[p.papel].texto}
                    {p.de_quem ? ` · corner de ${p.de_quem}` : ''}
                    {p.lado ? ` · canto ${p.lado}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelecionada(null)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* dados, edicao */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([
                ['nome', 'Nome'], ['cpf', 'CPF'], ['telefone', 'Telefone'], ['equipe', 'Equipe'],
                ...(p.papel === 'equipe' ? [['funcao', 'Função'] as const] : []),
                ...(p.papel !== 'equipe' ? [['categoria', 'Categoria'] as const, ['lado', 'Lado'] as const] : []),
              ] as Array<[keyof Pessoa, string]>).map(([campo, rotulo]) => (
                <label key={String(campo)} className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{rotulo}</span>
                  {editando ? (
                    campo === 'lado' ? (
                      <select
                        value={String(rascunho.lado ?? p.lado ?? '')}
                        onChange={(e) => setRascunho((d) => ({ ...d, lado: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
                        style={{ colorScheme: 'dark' }}>
                        <option value="">-</option>
                        <option value="azul">azul</option>
                        <option value="vermelho">vermelho</option>
                      </select>
                    ) : campo === 'funcao' ? (
                      <select
                        value={String(rascunho.funcao ?? p.funcao ?? '')}
                        onChange={(e) => setRascunho((d) => ({ ...d, funcao: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
                        style={{ colorScheme: 'dark' }}>
                        <option value="">-</option>
                        {OPERATIONAL_STAFF_ROLE_GROUPS.map((g) => (
                          <optgroup key={g.label} label={g.label}>
                            {g.roles.map((r) => <option key={r} value={r}>{r}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={String(rascunho[campo] ?? p[campo] ?? '')}
                        onChange={(e) => setRascunho((d) => ({ ...d, [campo]: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
                      />
                    )
                  ) : (
                    <span className="mt-1 block text-sm text-slate-200">
                      {String(p[campo] ?? '-') || '-'}
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {editando ? (
                <>
                  <button onClick={() => void salvar()} disabled={ocupado === 'salvar'}
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-black disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> {ocupado === 'salvar' ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button onClick={() => { setEditando(false); setRascunho({}) }}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
                    Cancelar
                  </button>
                </>
              ) : (
                <button onClick={() => { setEditando(true); setRascunho({}) }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
                  <Pencil className="h-3.5 w-3.5" /> Corrigir dados
                </button>
              )}

              {p.papel === 'equipe' && (
                <>
                  <button onClick={() => void pontoManual('checkin')} disabled={ocupado === 'checkin'}
                    className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-green-200 disabled:opacity-50">
                    <LogIn className="h-3.5 w-3.5" /> Entrada manual
                  </button>
                  <button onClick={() => void pontoManual('checkout')} disabled={ocupado === 'checkout'}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-blue-200 disabled:opacity-50">
                    <LogOut className="h-3.5 w-3.5" /> Saída manual
                  </button>
                </>
              )}

              {p.papel !== 'equipe' && (
                <button onClick={() => void remover()} disabled={ocupado === 'remover'}
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-red-200 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Remover do evento
                </button>
              )}
            </div>

            {/* pontos */}
            {p.papel === 'equipe' && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Pontos ({pontos.length})
                </p>
                {pontos.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">Nenhum ponto registrado.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {pontos.map((pt) => (
                      <li key={pt.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-bold"
                          style={{ color: pt.type === 'checkin' ? '#86efac' : '#93c5fd' }}>
                          {pt.type === 'checkin' ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                          {pt.type === 'checkin' ? 'Entrada' : 'Saída'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-500" /> {hora(pt.created_at)}
                        </span>
                        {pt.work_role && <span className="text-slate-400">{pt.work_role}</span>}
                        {pt.distance_from_venue_meters != null && (
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <MapPin className="h-3.5 w-3.5" /> {pt.distance_from_venue_meters} m
                          </span>
                        )}
                        {pt.photo_url && (
                          <a href={pt.photo_url} target="_blank" rel="noreferrer"
                            className="ml-auto text-xs font-semibold text-[#D4FF00] hover:underline">foto</a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {p.papel === 'atleta' && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Corners</p>
                <ul className="mt-2 space-y-1.5">
                  {pessoas.filter((c) => c.papel === 'corner' && c.athlete_id === p.id).map((c) => (
                    <li key={c.id}>
                      <button onClick={() => escolher(c)} className="text-sm text-slate-200 hover:text-[#D4FF00]">
                        <Users className="mr-1.5 inline h-3.5 w-3.5" />{c.nome}
                        <span className="text-slate-500"> · {c.cpf}</span>
                      </button>
                    </li>
                  ))}
                  {pessoas.filter((c) => c.papel === 'corner' && c.athlete_id === p.id).length === 0 && (
                    <li className="text-sm text-amber-300">Nenhum corner cadastrado.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
