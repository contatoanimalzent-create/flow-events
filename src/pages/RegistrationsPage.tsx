import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ChevronDown,
  Download,
  Loader2,
  Search,
  Shield,
  Swords,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { CapitalStrikeArmy, CapitalStrikeRegistration } from '@/lib/supabase'
import { cn } from '@/shared/lib'

type FactionFilter = 'all' | CapitalStrikeArmy

const FACTION_STYLES: Record<CapitalStrikeArmy, { bg: string; border: string; text: string; dot: string; label: string }> = {
  coalizao: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    dot: 'bg-yellow-400',
    label: 'Coalizao',
  },
  alianca: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    label: 'Alianca',
  },
}

function exportToCSV(data: CapitalStrikeRegistration[]) {
  const headers = ['Nome completo', 'CPF', 'E-mail', 'Telefone', 'Exercito', 'Squad', 'Endereco', 'Cadastro']
  const rows = data.map((registration) => [
    registration.full_name,
    registration.cpf,
    registration.email,
    registration.phone,
    FACTION_STYLES[registration.army].label,
    registration.squad ?? '',
    registration.address,
    new Date(registration.created_at).toLocaleDateString('pt-BR'),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `inscricoes-capital-strike-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function StatCard({
  label,
  value,
  sub,
  color = 'default',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'default' | 'yellow' | 'sky' | 'green'
}) {
  const colorMap = {
    default: 'text-[#ebe7e0]',
    yellow: 'text-yellow-300',
    sky: 'text-sky-300',
    green: 'text-emerald-400',
  }

  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-widest text-[#8e847d]">{label}</div>
      <div className={cn('mt-2 font-display text-[2.4rem] leading-none tracking-tight', colorMap[color])}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-[#6b6560]">{sub}</div> : null}
    </div>
  )
}

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<CapitalStrikeRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [faction, setFaction] = useState<FactionFilter>('all')
  const [selectedSquad, setSelectedSquad] = useState('all')
  const [selected, setSelected] = useState<CapitalStrikeRegistration | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('capital_strike_registrations')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setRegistrations((data ?? []) as CapitalStrikeRegistration[])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar inscricoes')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const squads = useMemo(() => {
    return [...new Set(registrations.map((registration) => registration.squad).filter(Boolean) as string[])].sort()
  }, [registrations])

  const filtered = useMemo(() => {
    return registrations.filter((registration) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchesSearch =
        !normalizedSearch ||
        registration.full_name.toLowerCase().includes(normalizedSearch) ||
        registration.email.toLowerCase().includes(normalizedSearch) ||
        registration.cpf.includes(search)

      const matchesFaction = faction === 'all' || registration.army === faction
      const matchesSquad = selectedSquad === 'all' || registration.squad === selectedSquad

      return matchesSearch && matchesFaction && matchesSquad
    })
  }, [registrations, search, faction, selectedSquad])

  const stats = useMemo(() => {
    const coalizao = registrations.filter((registration) => registration.army === 'coalizao').length
    const alianca = registrations.filter((registration) => registration.army === 'alianca').length
    const comSquad = registrations.filter((registration) => Boolean(registration.squad)).length

    return {
      total: registrations.length,
      coalizao,
      alianca,
      comSquad,
    }
  }, [registrations])

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

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#ae936f]">Capital Strike - A Origem</div>
          <h1 className="mt-2 font-display text-[2.8rem] leading-none tracking-tight text-[#ebe7e0]">Inscricoes</h1>
          <p className="mt-2 text-sm text-[#8e847d]">Registros recebidos do site capitalstrike.com.br</p>
        </div>

        <button
          type="button"
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-[#ebe7e0] transition-all hover:border-[#ae936f]/40 hover:bg-white/[0.07] disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} sub="inscricoes recebidas" />
        <StatCard label="Coalizao" value={stats.coalizao} sub={`${stats.total ? Math.round((stats.coalizao / stats.total) * 100) : 0}% do total`} color="yellow" />
        <StatCard label="Alianca" value={stats.alianca} sub={`${stats.total ? Math.round((stats.alianca / stats.total) * 100) : 0}% do total`} color="sky" />
        <StatCard label="Com squad" value={stats.comSquad} sub="equipes identificadas" color="green" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6560]" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-[#ebe7e0] placeholder-[#6b6560] outline-none focus:border-[#ae936f]/40 focus:bg-white/[0.06]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6560] hover:text-[#ebe7e0]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
          {(['all', 'coalizao', 'alianca'] as FactionFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFaction(item)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                faction === item
                  ? item === 'coalizao'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : item === 'alianca'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-white/10 text-[#ebe7e0]'
                  : 'text-[#8e847d] hover:text-[#ebe7e0]',
              )}
            >
              {item === 'all' ? 'Todos' : FACTION_STYLES[item].label}
            </button>
          ))}
        </div>

        {squads.length > 0 ? (
          <div className="relative">
            <select
              value={selectedSquad}
              onChange={(event) => setSelectedSquad(event.target.value)}
              className="appearance-none rounded-2xl border border-white/8 bg-white/[0.04] py-2.5 pl-4 pr-8 text-sm text-[#ebe7e0] outline-none focus:border-[#ae936f]/40"
            >
              <option value="all">Todos os squads</option>
              {squads.map((squad) => (
                <option key={squad} value={squad}>
                  {squad}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6560]" />
          </div>
        ) : null}

        <div className="text-xs text-[#6b6560]">
          {filtered.length} de {registrations.length} inscricoes
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/6 bg-white/[0.02] py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-[#3a3630]" />
          <div className="text-sm text-[#6b6560]">
            {registrations.length === 0 ? 'Nenhuma inscricao recebida ainda.' : 'Nenhum resultado para os filtros aplicados.'}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-white/8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.02]">
                  {['Operador', 'Exercito', 'Squad', 'Telefone', 'Endereco', 'Cadastro'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6b6560]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filtered.map((registration) => {
                  const factionStyle = FACTION_STYLES[registration.army]

                  return (
                    <tr
                      key={registration.id}
                      className="group cursor-pointer transition-colors hover:bg-white/[0.03]"
                      onClick={() => setSelected(registration)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-sm text-[#ebe7e0]">{registration.full_name}</div>
                        <div className="mt-0.5 text-xs text-[#6b6560]">{registration.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', factionStyle.bg, factionStyle.border, factionStyle.text)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', factionStyle.dot)} />
                          {factionStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#b8b0a8]">{registration.squad ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm text-[#b8b0a8]">{registration.phone}</td>
                      <td className="px-4 py-3.5 text-sm text-[#8e847d]">{registration.address}</td>
                      <td className="px-4 py-3.5 text-xs text-[#4a4540]">
                        {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0f0d0c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 p-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#ae936f]">Detalhe da inscricao</div>
                <div className="mt-1 font-display text-[1.6rem] leading-none text-[#ebe7e0]">{selected.full_name}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[#8e847d] hover:text-[#ebe7e0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 p-5">
              <div className="mb-4">
                {(() => {
                  const factionStyle = FACTION_STYLES[selected.army]
                  const Icon = selected.army === 'coalizao' ? Shield : Swords

                  return (
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold', factionStyle.bg, factionStyle.border, factionStyle.text)}>
                      <Icon className="h-3.5 w-3.5" />
                      {factionStyle.label}
                    </span>
                  )
                })()}
              </div>

              {[
                { label: 'E-mail', value: selected.email },
                { label: 'CPF', value: selected.cpf },
                { label: 'Telefone', value: selected.phone },
                { label: 'Mae', value: selected.mother_name },
                { label: 'Endereco', value: selected.address },
                { label: 'Squad', value: selected.squad ?? '-' },
                { label: 'Inscrito em', value: new Date(selected.created_at).toLocaleString('pt-BR') },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-xl px-3 py-2.5 odd:bg-white/[0.02]">
                  <span className="w-36 shrink-0 text-xs text-[#6b6560]">{label}</span>
                  <span className="text-right text-sm text-[#b8b0a8]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
