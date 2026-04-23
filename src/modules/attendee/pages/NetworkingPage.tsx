import React, { useEffect, useState } from 'react'
import { ChevronLeft, UserPlus, UserCheck, Search, Loader2, Users } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface PersonItem {
  id: string
  name: string
  initials: string
  avatarUrl: string | null
}

export default function NetworkingPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [people, setPeople] = useState<PersonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  const storageKey = `pulse-connections-${context?.eventId ?? 'unknown'}`

  useEffect(() => {
    // Load persisted connections from localStorage
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as string[]
        setConnected(new Set(parsed))
      }
    } catch {
      // ignore parse errors
    }

    const load = async () => {
      if (!context?.eventId) { setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('digital_tickets')
        .select('attendee_id, profiles!attendee_id(full_name, avatar_url)')
        .eq('event_id', context.eventId)
        .neq('attendee_id', user.id)
        .limit(50)

      if (data) {
        type TicketRow = {
          attendee_id: string
          profiles: { full_name: string | null; avatar_url: string | null }[] | null
        }
        const mapped: PersonItem[] = (data as TicketRow[])
          .map((row) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
            const name = profile?.full_name ?? 'Participante'
            const initials = name
              .split(' ')
              .map((w: string) => w[0] ?? '')
              .join('')
              .slice(0, 2)
              .toUpperCase()
            return {
              id: row.attendee_id,
              name,
              initials,
              avatarUrl: profile?.avatar_url ?? null,
            }
          })
          .filter((p: PersonItem) => p.id)

        setPeople(mapped)
      }

      setLoading(false)
    }

    load()
  }, [context?.eventId])

  const toggleConnect = (id: string) => {
    setConnected((prev) => {
      const ns = new Set(prev)
      if (ns.has(id)) {
        ns.delete(id)
      } else {
        ns.add(id)
      }
      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(ns)))
      } catch {
        // ignore storage errors
      }
      return ns
    })
  }

  const filtered = people.filter(
    (p) => !query || p.name.toLowerCase().includes(query.toLowerCase())
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
            placeholder="Buscar por nome..."
            className="flex-1 bg-transparent py-3.5 text-white placeholder:text-slate-600 outline-none text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Users size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">
            {query ? 'Nenhum participante encontrado' : 'Nenhum participante neste evento ainda'}
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {query ? 'Tente outro nome' : 'Os participantes aparecerão aqui após o check-in'}
          </p>
        </div>
      ) : (
        /* People list */
        <div className="flex-1 px-4 space-y-3">
          {filtered.map((person) => {
            const isConnected = connected.has(person.id)
            return (
              <div key={person.id} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4">
                {person.avatarUrl ? (
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                    {person.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{person.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Participante</p>
                </div>
                <button
                  onClick={() => toggleConnect(person.id)}
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
      )}
    </div>
  )
}
