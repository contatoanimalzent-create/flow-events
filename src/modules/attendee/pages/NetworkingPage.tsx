import React, { useState } from 'react'
import { ChevronLeft, UserPlus, UserCheck, Search } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const PEOPLE = [
  { id: 1, name: 'Beatriz Souza', role: 'Founder @ TechStart', area: 'Tecnologia', avatar: 'BS' },
  { id: 2, name: 'Henrique Costa', role: 'CMO @ GrowthCo', area: 'Marketing', avatar: 'HC' },
  { id: 3, name: 'Larissa Melo', role: 'Head of Design @ Studio X', area: 'Design', avatar: 'LM' },
  { id: 4, name: 'Pedro Alves', role: 'Investidor Anjo', area: 'Investimentos', avatar: 'PA' },
  { id: 5, name: 'Camila Torres', role: 'Dev Advocate @ CloudCorp', area: 'Tecnologia', avatar: 'CT' },
]

export default function NetworkingPage({ onNavigate }: PulsePageProps) {
  const [connected, setConnected] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')

  const filtered = PEOPLE.filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.area.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Networking</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-4 focus-within:border-blue-500/50">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou área de atuação..."
            className="flex-1 bg-transparent py-3.5 text-white placeholder:text-slate-600 outline-none text-sm"
          />
        </div>
      </div>

      {/* People list */}
      <div className="flex-1 px-4 space-y-3">
        {filtered.map((person) => {
          const isConnected = connected.has(person.id)
          return (
            <div key={person.id} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                {person.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{person.name}</p>
                <p className="text-slate-400 text-xs truncate">{person.role}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-slate-300">
                  {person.area}
                </span>
              </div>
              <button
                onClick={() => setConnected((s) => { const ns = new Set(s); isConnected ? ns.delete(person.id) : ns.add(person.id); return ns })}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isConnected
                    ? 'bg-green-500/15 border border-green-500/20 text-green-400'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isConnected ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {isConnected ? 'Conectado' : 'Conectar'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
