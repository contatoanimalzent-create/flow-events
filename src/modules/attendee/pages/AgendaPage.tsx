import React, { useState, useEffect } from 'react'
import { ChevronLeft, Clock, MapPin, Heart, Loader2, Calendar } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { attendeeService } from '@/core/attendee/attendee.service'
import { supabase } from '@/lib/supabase'
import type { AgendaSession } from '@/core/attendee/attendee.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

function groupByDay(sessions: AgendaSession[]): Record<string, AgendaSession[]> {
  return sessions.reduce((acc, s) => {
    const day = s.startsAt.slice(0, 10)
    if (!acc[day]) acc[day] = []
    acc[day].push(s)
    return acc
  }, {} as Record<string, AgendaSession[]>)
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

function formatDay(iso: string) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  } catch {
    return iso
  }
}

export default function AgendaPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [sessions, setSessions] = useState<AgendaSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    }).catch(() => {
      // ignore auth error, will show empty state
    })
  }, [])

  const load = async () => {
    if (!context?.eventId || !userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const data = await attendeeService.getAgenda(context.eventId, userId)
      setSessions(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId !== null) {
      load()
    }
  }, [context?.eventId, userId])

  const toggleFavorite = async (session: AgendaSession) => {
    if (!context?.eventId || !userId) return
    try {
      await attendeeService.toggleFavorite(session.id, context.eventId, userId, session.isFavorite)
      setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, isFavorite: !s.isFavorite } : s))
    } catch {
      // Silently fail, optimistic update not applied
    }
  }

  const visible = filter === 'favorites' ? sessions.filter((s) => s.isFavorite) : sessions
  const grouped = groupByDay(visible)
  const days = Object.keys(grouped).sort()

  const now = new Date().toISOString()
  const isLive = (s: AgendaSession) => s.startsAt <= now && (!s.endsAt || s.endsAt >= now)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Agenda</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-4 mb-4">
        {(['all', 'favorites'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
            }`}
          >
            {f === 'all' ? 'Todas as sessões' : '❤️ Favoritas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <p className="text-slate-400 text-sm">Erro ao carregar agenda.</p>
          <button onClick={load} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : !context?.eventId ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Calendar size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum evento selecionado</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Calendar size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">{filter === 'favorites' ? 'Nenhuma sessão favorita' : 'Agenda ainda não publicada'}</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {days.map((day) => (
            <div key={day}>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 capitalize">
                {formatDay(day)}
              </p>
              <div className="space-y-3">
                {(grouped[day] ?? []).map((s) => {
                  const live = isLive(s)
                  return (
                    <div
                      key={s.id}
                      className="bg-white/5 border rounded-2xl p-4 relative overflow-hidden"
                      style={{ borderColor: live ? '#4285F444' : '#ffffff10' }}
                    >
                      {live && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {live && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                              AO VIVO
                            </span>
                          )}
                          <p className="text-white font-semibold text-sm leading-snug">{s.title}</p>
                          {s.speakerName && <p className="text-slate-400 text-xs mt-0.5">{s.speakerName}</p>}
                          <div className="flex gap-3 mt-2">
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Clock size={10} />
                              {formatTime(s.startsAt)}{s.endsAt ? `, ${formatTime(s.endsAt)}` : ''}
                            </div>
                            {s.stage && (
                              <div className="flex items-center gap-1 text-slate-500 text-xs">
                                <MapPin size={10} />
                                {s.stage}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorite(s)}
                          className="p-1.5 shrink-0"
                        >
                          <Heart
                            size={18}
                            className={s.isFavorite ? 'text-red-400' : 'text-slate-600'}
                            fill={s.isFavorite ? '#F87171' : 'none'}
                          />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
