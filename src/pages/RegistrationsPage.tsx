import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  Loader2,
  Mail,
  QrCode,
  Search,
  Shield,
  Swords,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'

type FactionFilter = 'all' | 'COALIZAO' | 'ALIANCA'

interface Inscricao {
  id: string
  nome_completo: string
  cpf: string | null
  email: string
  telefone: string
  nome_mae: string
  endereco: string
  cidade_estado: string
  time: string | null
  categoria: string
  enfermidade: string | null
  contato_emergencia: string
  exercito: string
  tamanho_camiseta: string | null
  confirmado: boolean
  created_at: string
}

const FACTION_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; label: string; icon: typeof Shield }> = {
  COALIZAO: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    dot: 'bg-yellow-400',
    label: 'Coalizão',
    icon: Shield,
  },
  ALIANCA: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    label: 'Aliança',
    icon: Swords,
  },
}

function exportToCSV(data: Inscricao[]) {
  const headers = ['Nome completo', 'CPF', 'E-mail', 'Telefone', 'Exército', 'Time', 'Categoria', 'Cidade/Estado', 'Camiseta', 'Confirmado', 'Cadastro']
  const rows = data.map((r) => [
    r.nome_completo,
    r.cpf ?? '',
    r.email,
    r.telefone,
    r.exercito,
    r.time ?? '',
    r.categoria,
    r.cidade_estado,
    r.tamanho_camiseta ?? '',
    r.confirmado ? 'Sim' : 'Não',
    new Date(r.created_at).toLocaleDateString('pt-BR'),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inscricoes-capital-strike-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatCard({ label, value, sub, color = 'default' }: { label: string; value: string | number; sub?: string; color?: 'default' | 'yellow' | 'sky' | 'green' | 'amber' }) {
  const colorMap = { default: 'text-[#ebe7e0]', yellow: 'text-yellow-300', sky: 'text-sky-300', green: 'text-emerald-400', amber: 'text-amber-400' }
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-widest text-[#8e847d]">{label}</div>
      <div className={cn('mt-2 font-display text-[2.4rem] leading-none tracking-tight', colorMap[color])}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-[#6b6560]">{sub}</div> : null}
    </div>
  )
}

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [faction, setFaction] = useState<FactionFilter>('all')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [selected, setSelected] = useState<Inscricao | null>(null)
  const [confirmadoFilter, setConfirmadoFilter] = useState<'all' | 'yes' | 'no'>('all')

  // QR sending state
  const [sendingQR, setSendingQR] = useState(false)
  const [sendProgress, setSendProgress] = useState<{ total: number; created: number; sent: number; errors: string[] } | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendMode, setSendMode] = useState<'generate' | 'send' | 'generate_and_send'>('generate_and_send')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('inscricoes')
          .select('*')
          .order('nome_completo', { ascending: true })

        if (fetchError) throw fetchError
        setRegistrations((data ?? []) as Inscricao[])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar inscrições')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const teams = useMemo(() => {
    return [...new Set(registrations.map((r) => r.time).filter(Boolean) as string[])].sort()
  }, [registrations])

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q || r.nome_completo.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.cpf ?? '').includes(search)
      const matchesFaction = faction === 'all' || r.exercito === faction
      const matchesTeam = selectedTeam === 'all' || r.time === selectedTeam
      const matchesConfirmado = confirmadoFilter === 'all' || (confirmadoFilter === 'yes' ? r.confirmado : !r.confirmado)
      return matchesSearch && matchesFaction && matchesTeam && matchesConfirmado
    })
  }, [registrations, search, faction, selectedTeam, confirmadoFilter])

  const stats = useMemo(() => {
    const confirmados = registrations.filter((r) => r.confirmado).length
    const coalizao = registrations.filter((r) => r.exercito === 'COALIZAO').length
    const alianca = registrations.filter((r) => r.exercito === 'ALIANCA').length
    return { total: registrations.length, confirmados, coalizao, alianca }
  }, [registrations])

  const handleSendQRCodes = useCallback(async () => {
    setSendingQR(true)
    setSendProgress(null)
    try {
      const confirmedIds = filtered.filter((r) => r.confirmado).map((r) => r.id)

      if (confirmedIds.length === 0) {
        setSendProgress({ total: 0, created: 0, sent: 0, errors: ['Nenhuma inscrição confirmada nos filtros atuais'] })
        return
      }

      const { data, error: fnError } = await supabase.functions.invoke('issue-capital-strike-tickets', {
        body: { mode: sendMode, inscricao_ids: confirmedIds },
      })

      if (fnError) throw fnError

      const result = data as { ok: boolean; stats: { total: number; tickets_created: number; emails_sent: number; errors: string[] } }
      setSendProgress({
        total: result.stats.total,
        created: result.stats.tickets_created,
        sent: result.stats.emails_sent,
        errors: result.stats.errors ?? [],
      })
    } catch (err) {
      setSendProgress({ total: 0, created: 0, sent: 0, errors: [err instanceof Error ? err.message : 'Erro desconhecido'] })
    } finally {
      setSendingQR(false)
    }
  }, [filtered, sendMode])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#ae936f]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  const confirmedCount = filtered.filter((r) => r.confirmado).length

  return (
    <div className="space-y-6 px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#ae936f]">Capital Strike - A Origem</div>
          <h1 className="mt-2 font-display text-[2.8rem] leading-none tracking-tight text-[#ebe7e0]">Inscrições</h1>
          <p className="mt-2 text-sm text-[#8e847d]">
            {stats.total} inscrições &bull; {stats.confirmados} confirmadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-[#ae936f]/30 bg-[#ae936f]/10 px-4 py-2.5 text-sm font-medium text-[#ae936f] transition-all hover:border-[#ae936f]/50 hover:bg-[#ae936f]/20"
          >
            <QrCode className="h-4 w-4" />
            Enviar QR Codes
          </button>
          <button
            type="button"
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-[#ebe7e0] transition-all hover:border-[#ae936f]/40 hover:bg-white/[0.07] disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} sub="inscrições recebidas" />
        <StatCard label="Confirmados" value={stats.confirmados} sub={`${stats.total ? Math.round((stats.confirmados / stats.total) * 100) : 0}%`} color="green" />
        <StatCard label="Coalizão" value={stats.coalizao} sub={`${stats.total ? Math.round((stats.coalizao / stats.total) * 100) : 0}% do total`} color="yellow" />
        <StatCard label="Aliança" value={stats.alianca} sub={`${stats.total ? Math.round((stats.alianca / stats.total) * 100) : 0}% do total`} color="sky" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6560]" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-[#ebe7e0] placeholder-[#6b6560] outline-none focus:border-[#ae936f]/40 focus:bg-white/[0.06]"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6560] hover:text-[#ebe7e0]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Faction filter */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
          {(['all', 'COALIZAO', 'ALIANCA'] as FactionFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFaction(item)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                faction === item
                  ? item === 'COALIZAO' ? 'bg-yellow-500/20 text-yellow-300'
                    : item === 'ALIANCA' ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-white/10 text-[#ebe7e0]'
                  : 'text-[#8e847d] hover:text-[#ebe7e0]',
              )}
            >
              {item === 'all' ? 'Todos' : FACTION_STYLES[item]?.label ?? item}
            </button>
          ))}
        </div>

        {/* Confirmado filter */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
          {([['all', 'Todos'], ['yes', 'Confirmados'], ['no', 'Pendentes']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setConfirmadoFilter(val)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                confirmadoFilter === val ? 'bg-white/10 text-[#ebe7e0]' : 'text-[#8e847d] hover:text-[#ebe7e0]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Team filter */}
        {teams.length > 0 && (
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none rounded-2xl border border-white/8 bg-white/[0.04] py-2.5 pl-4 pr-8 text-sm text-[#ebe7e0] outline-none focus:border-[#ae936f]/40"
            >
              <option value="all">Todos os times</option>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6560]" />
          </div>
        )}

        <div className="text-xs text-[#6b6560]">{filtered.length} de {registrations.length}</div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/6 bg-white/[0.02] py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-[#3a3630]" />
          <div className="text-sm text-[#6b6560]">
            {registrations.length === 0 ? 'Nenhuma inscrição recebida ainda.' : 'Nenhum resultado para os filtros aplicados.'}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-white/8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.02]">
                  {['Operador', 'Exército', 'Categoria', 'Time', 'Cidade/UF', 'Status', 'Cadastro'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6b6560]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filtered.map((r) => {
                  const fs = FACTION_STYLES[r.exercito]
                  return (
                    <tr key={r.id} className="group cursor-pointer transition-colors hover:bg-white/[0.03]" onClick={() => setSelected(r)}>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-[#ebe7e0]">{r.nome_completo}</div>
                        <div className="mt-0.5 text-xs text-[#6b6560]">{r.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {fs ? (
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', fs.bg, fs.border, fs.text)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', fs.dot)} />
                            {fs.label}
                          </span>
                        ) : (
                          <span className="text-xs text-[#6b6560]">{r.exercito}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#b8b0a8]">{r.categoria}</td>
                      <td className="px-4 py-3.5 text-sm text-[#b8b0a8]">{r.time ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm text-[#8e847d]">{r.cidade_estado}</td>
                      <td className="px-4 py-3.5">
                        {r.confirmado ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <Check className="h-3 w-3" /> Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#4a4540]">{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0f0d0c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 p-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#ae936f]">Detalhe da inscrição</div>
                <div className="mt-1 font-display text-[1.6rem] leading-none text-[#ebe7e0]">{selected.nome_completo}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[#8e847d] hover:text-[#ebe7e0]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 p-5">
              <div className="mb-4">
                {(() => {
                  const fs = FACTION_STYLES[selected.exercito]
                  if (!fs) return null
                  const Icon = fs.icon
                  return (
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold', fs.bg, fs.border, fs.text)}>
                      <Icon className="h-3.5 w-3.5" />
                      {fs.label} &bull; {selected.categoria}
                    </span>
                  )
                })()}
              </div>
              {[
                { label: 'E-mail', value: selected.email },
                { label: 'CPF', value: selected.cpf ?? '-' },
                { label: 'Telefone', value: selected.telefone },
                { label: 'Mãe', value: selected.nome_mae },
                { label: 'Endereço', value: selected.endereco },
                { label: 'Cidade/UF', value: selected.cidade_estado },
                { label: 'Time', value: selected.time ?? '-' },
                { label: 'Camiseta', value: selected.tamanho_camiseta ?? '-' },
                { label: 'Enfermidade', value: selected.enfermidade ?? 'Nenhuma' },
                { label: 'Contato emergência', value: selected.contato_emergencia },
                { label: 'Status', value: selected.confirmado ? 'Confirmado' : 'Pendente' },
                { label: 'Inscrito em', value: new Date(selected.created_at).toLocaleString('pt-BR') },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-xl px-3 py-2.5 odd:bg-white/[0.02]">
                  <span className="w-40 shrink-0 text-xs text-[#6b6560]">{label}</span>
                  <span className="text-right text-sm text-[#b8b0a8]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Send QR Codes Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!sendingQR) setShowSendModal(false) }} />
          <div className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0f0d0c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ae936f]/15">
                  <QrCode className="h-5 w-5 text-[#ae936f]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#ae936f]">Credenciamento</div>
                  <div className="mt-0.5 text-base font-semibold text-[#ebe7e0]">Enviar QR Codes</div>
                </div>
              </div>
              {!sendingQR && (
                <button type="button" onClick={() => setShowSendModal(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[#8e847d] hover:text-[#ebe7e0]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-5">
              {!sendProgress ? (
                <>
                  <div className="space-y-3">
                    <div className="text-sm text-[#b8b0a8]">
                      Gerar ingressos digitais e enviar QR Codes por e-mail para os inscritos <strong className="text-[#ebe7e0]">confirmados</strong> do Capital Strike.
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8e847d]">Confirmados nos filtros atuais</span>
                        <span className="font-semibold text-emerald-400">{confirmedCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8e847d]">Total confirmados geral</span>
                        <span className="font-semibold text-[#ebe7e0]">{stats.confirmados}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-widest text-[#6b6560]">Modo de operação</div>
                    {([
                      { value: 'generate_and_send' as const, label: 'Gerar + Enviar', desc: 'Cria tickets e envia e-mail com QR' },
                      { value: 'generate' as const, label: 'Apenas gerar', desc: 'Cria tickets sem enviar e-mail' },
                      { value: 'send' as const, label: 'Apenas enviar', desc: 'Envia e-mail para quem já tem ticket' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSendMode(opt.value)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          sendMode === opt.value
                            ? 'border-[#ae936f]/40 bg-[#ae936f]/10'
                            : 'border-white/6 bg-white/[0.02] hover:border-white/12',
                        )}
                      >
                        <div className={cn('flex h-5 w-5 items-center justify-center rounded-full border-2', sendMode === opt.value ? 'border-[#ae936f] bg-[#ae936f]' : 'border-white/20')}>
                          {sendMode === opt.value && <Check className="h-3 w-3 text-black" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#ebe7e0]">{opt.label}</div>
                          <div className="text-xs text-[#6b6560]">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendQRCodes}
                    disabled={sendingQR || confirmedCount === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ae936f] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#c5a882] disabled:opacity-40"
                  >
                    {sendingQR ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Processar {confirmedCount} inscrições
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Results */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                        <div className="text-2xl font-bold text-[#ebe7e0]">{sendProgress.total}</div>
                        <div className="text-[10px] uppercase tracking-widest text-[#6b6560]">Total</div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{sendProgress.created}</div>
                        <div className="text-[10px] uppercase tracking-widest text-[#6b6560]">Tickets</div>
                      </div>
                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-center">
                        <div className="text-2xl font-bold text-sky-400">{sendProgress.sent}</div>
                        <div className="text-[10px] uppercase tracking-widest text-[#6b6560]">E-mails</div>
                      </div>
                    </div>

                    {sendProgress.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                        <div className="text-xs font-semibold text-red-400 mb-1">Erros ({sendProgress.errors.length})</div>
                        {sendProgress.errors.map((err, i) => (
                          <div key={i} className="text-xs text-red-300/70 truncate">{err}</div>
                        ))}
                      </div>
                    )}

                    {sendProgress.errors.length === 0 && sendProgress.total > 0 && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <Check className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-emerald-300">Processamento concluído com sucesso!</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => { setSendProgress(null); setShowSendModal(false) }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium text-[#ebe7e0] transition-all hover:bg-white/[0.08]"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
