import React, { useState } from 'react'
import { ChevronLeft, Search, CheckCircle, XCircle, User } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const MOCK_RESULTS = [
  { id: '1', name: 'Ana Paula Santos', cpf: '***.***.***-42', ticket: 'STANDARD #0042', checkedIn: false },
  { id: '2', name: 'Carlos Mendes', cpf: '***.***.***-11', ticket: 'VIP #0011', checkedIn: true },
  { id: '3', name: 'Fernanda Lima', cpf: '***.***.***-88', ticket: 'CAMAROTE #0003', checkedIn: false },
]

export default function ManualCheckPage({ onNavigate }: PulsePageProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof MOCK_RESULTS>([])
  const [searched, setSearched] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const handleSearch = () => {
    if (!query.trim()) return
    setResults(MOCK_RESULTS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.cpf.includes(query)))
    setSearched(true)
  }

  const handleCheckin = (id: string) => {
    setCheckedIds((s) => new Set([...s, id]))
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Busca Manual</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-4 focus-within:border-blue-500/50">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Nome ou CPF..."
            className="flex-1 bg-transparent py-4 text-white placeholder:text-slate-600 outline-none text-sm"
          />
          <button
            onClick={handleSearch}
            className="shrink-0 px-3 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-semibold"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 space-y-3">
        {searched && results.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <User size={36} className="text-slate-700 mb-2" />
            <p className="text-slate-400 text-sm">Nenhum resultado encontrado</p>
          </div>
        )}

        {results.map((r) => {
          const isCheckedIn = r.checkedIn || checkedIds.has(r.id)
          return (
            <div
              key={r.id}
              className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <User size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{r.name}</p>
                <p className="text-slate-400 text-xs">{r.cpf}</p>
                <p className="text-slate-500 text-xs">{r.ticket}</p>
              </div>
              {isCheckedIn ? (
                <div className="flex items-center gap-1 text-green-400 text-xs shrink-0">
                  <CheckCircle size={14} />
                  Realizado
                </div>
              ) : (
                <button
                  onClick={() => handleCheckin(r.id)}
                  className="shrink-0 px-3 py-2 bg-blue-600 rounded-xl text-white text-xs font-semibold"
                >
                  Check-in
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
