import React, { useEffect, useState } from 'react'
import { ChevronLeft, Users, Loader2, RefreshCw } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import { useRealtimeTeamPings } from '@/core/realtime/realtime.hooks'
import type { TeamMember } from '@/core/supervisor/supervisor.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const STATUS_COLOR: Record<string, string> = {
  active: '#22C55E',
  delayed: '#d97706',
  absent: '#EF4444',
  'out-of-area': '#F97316',
  offline: '#64748b',
}

// Static zone layout for visualization — real coords come from pings
const ZONE_BOXES = [
  { id: 'a', label: 'Portaria Principal', x: 10, y: 10, w: 35, h: 25, color: '#0057E733' },
  { id: 'b', label: 'Portaria Lateral', x: 55, y: 10, w: 35, h: 25, color: '#0057E733' },
  { id: 'c', label: 'Área VIP', x: 25, y: 45, w: 50, h: 25, color: '#7C3AED33' },
  { id: 'd', label: 'Palco', x: 10, y: 75, w: 80, h: 20, color: '#22C55E11' },
]

// Assign a pseudo-position to each member by zone name
const zoneLookup: Record<string, { cx: number; cy: number }> = {
  'Portaria Principal': { cx: 27, cy: 22 },
  'Portaria Lateral': { cx: 72, cy: 22 },
  'Área VIP': { cx: 50, cy: 57 },
  'Palco': { cx: 50, cy: 85 },
}

function memberPos(m: TeamMember, idx: number): { cx: number; cy: number } {
  const base = m.zone ? (zoneLookup[m.zone] ?? { cx: 50, cy: 50 }) : { cx: 85, cy: 5 }
  // Spread members in same zone
  return { cx: base.cx + (idx % 3 - 1) * 5, cy: base.cy + Math.floor(idx / 3) * 5 }
}

export default function TeamMapPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadTeam = async () => {
    if (!context?.eventId) { setLoading(false); return }
    try {
      const res = await supervisorService.getTeamLive(context.eventId)
      setMembers(res.members)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadTeam() }, [context?.eventId])

  // Realtime pings update member status
  useRealtimeTeamPings(context?.eventId, (staffId: string) => {
    setMembers((prev) =>
      prev.map((m) => m.id === staffId ? { ...m, status: 'active' as const } : m)
    )
  })

  const handleRefresh = () => {
    setRefreshing(true)
    loadTeam()
  }

  const selectedMember = members.find((m) => m.id === selected)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Mapa da Equipe</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-auto p-2 text-slate-400"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* SVG Map */}
          <div className="px-4 mb-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1.5' }}>
                <rect width="100" height="100" fill="#0a0f1e" />

                {/* Zones */}
                {ZONE_BOXES.map((z) => (
                  <g key={z.id}>
                    <rect
                      x={z.x} y={z.y} width={z.w} height={z.h}
                      fill={z.color}
                      stroke={z.color.replace('33', '88')}
                      strokeWidth="0.5"
                      rx="2"
                    />
                    <text x={z.x + z.w / 2} y={z.y + 4} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="2.5">
                      {z.label}
                    </text>
                  </g>
                ))}

                {/* Member dots */}
                {members.map((m, idx) => {
                  const { cx, cy } = memberPos(m, idx)
                  const color = STATUS_COLOR[m.status] ?? '#64748b'
                  const isSelected = selected === m.id
                  return (
                    <g key={m.id} onClick={() => setSelected(isSelected ? null : m.id)} style={{ cursor: 'pointer' }}>
                      <circle cx={cx} cy={cy} r={isSelected ? 4 : 2.5} fill={color} stroke="white" strokeWidth="0.5" />
                      <text x={cx} y={cy + 5.5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="2">
                        {m.name.split(' ')[0]}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Selected member detail */}
          {selectedMember && (
            <div className="px-4 mb-4">
              <div className="bg-white/8 border border-white/15 rounded-2xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0"
                  >
                    {selectedMember.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{selectedMember.name}</p>
                    <p className="text-slate-400 text-xs">{selectedMember.zone ?? 'Sem zona'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[selectedMember.status] }} />
                    <span className="text-slate-400 text-xs capitalize">{selectedMember.status}</span>
                  </div>
                </div>
                {selectedMember.lastPingAt && (
                  <p className="text-slate-600 text-[10px] mt-2">
                    Último ping: {new Date(selectedMember.lastPingAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="px-4 mb-4 flex gap-4 flex-wrap">
            {[
              { color: '#22C55E', label: 'Ativo' },
              { color: '#d97706', label: 'Atrasado' },
              { color: '#EF4444', label: 'Ausente' },
              { color: '#64748b', label: 'Offline' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-400 text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Member list */}
          <div className="px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
              <Users size={12} />
              Equipe · {members.length} membros
            </p>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer ${
                    selected === m.id ? 'bg-white/10 border border-white/15' : 'bg-white/4 border border-white/6'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[m.status] }} />
                  <p className="text-white text-sm font-medium flex-1">{m.name}</p>
                  <p className="text-slate-500 text-xs">{m.zone ?? 'Sem zona'}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
