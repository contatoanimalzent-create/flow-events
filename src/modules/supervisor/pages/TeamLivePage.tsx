import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Phone, MapPin, Clock, X, RefreshCw, Loader2, Wifi } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import type { TeamMember } from '@/core/supervisor/supervisor.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: '#22C55E' },
  delayed: { label: 'Atrasado', color: '#d97706' },
  absent: { label: 'Ausente', color: '#EF4444' },
  'out-of-area': { label: 'Fora da área', color: '#F97316' },
  offline: { label: 'Offline', color: '#64748b' },
}

function formatSessionTime(startedAt: string | null): string {
  if (!startedAt) return '-'
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function TeamLivePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TeamMember | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const load = useCallback(async () => {
    if (!context?.eventId) return
    setLoading(true)
    try {
      const data = await supervisorService.getTeamLive(context.eventId)
      setMembers(data.members)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = filter === 'all' ? members : members.filter((m) => m.status === filter)

  const filters = [
    { key: 'all', label: 'Todos', count: members.length },
    { key: 'active', label: 'Ativos', count: members.filter((m) => m.status === 'active').length },
    { key: 'delayed', label: 'Atrasados', count: members.filter((m) => m.status === 'delayed').length },
    { key: 'absent', label: 'Ausentes', count: members.filter((m) => m.status === 'absent').length },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Equipe Ao Vivo</h1>
        <button onClick={load} className="p-2">
          <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filter === f.key ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${filter === f.key ? 'bg-white/20' : 'bg-white/10'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-10">Nenhum membro nesta categoria</p>
          )}
          {filtered.map((m) => {
            const sc = STATUS_CONFIG[m.status]
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="w-full flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5 text-left active:bg-white/8 transition-all"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white border-2"
                  style={{ borderColor: sc.color, backgroundColor: sc.color + '22' }}
                >
                  {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-slate-400 text-xs">
                    {m.zone ?? m.role.replace('_', ' ')}
                    {m.sessionStart ? ` · ${formatSessionTime(m.sessionStart)}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: sc.color + '22', color: sc.color }}
                  >
                    {sc.label}
                  </span>
                  {m.lastPingAt && (
                    <span className="flex items-center gap-0.5 text-slate-600 text-[9px]">
                      <Wifi size={8} />
                      {formatSessionTime(m.lastPingAt)} atrás
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Member detail overlay */}
      {selected && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-end z-40">
          <div className="w-full bg-[#0f172a] border-t border-white/10 rounded-t-3xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white border-2"
                  style={{ borderColor: STATUS_CONFIG[selected.status].color, backgroundColor: STATUS_CONFIG[selected.status].color + '22' }}
                >
                  {selected.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selected.name}</p>
                  <p className="text-slate-400 text-sm">{selected.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: STATUS_CONFIG[selected.status].color + '22', color: STATUS_CONFIG[selected.status].color }}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
                {selected.sessionStart && (
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock size={10} /> {formatSessionTime(selected.sessionStart)} em sessão
                  </span>
                )}
              </div>

              {selected.zone && (
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <p className="text-white text-sm">{selected.zone}</p>
                </div>
              )}

              {selected.lastPingAt && (
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                  <Wifi size={14} className="text-slate-400 shrink-0" />
                  <p className="text-slate-400 text-sm">Último ping: {formatSessionTime(selected.lastPingAt)} atrás</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-3 rounded-xl bg-white/8 border border-white/10 text-slate-300 font-semibold text-sm"
              >
                Fechar
              </button>
              <button
                onClick={() => { setSelected(null); onNavigate('/pulse/supervisor/occurrences') }}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm"
              >
                Registrar alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
