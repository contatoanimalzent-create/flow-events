import React, { useState } from 'react'
import { ChevronLeft, Phone, MapPin, Clock, X, MessageSquare } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const TEAM = [
  { id: 1, name: 'Ana Paula Santos', role: 'Portaria Principal', status: 'active', inZone: true, elapsed: '02:14', avatar: 'AP' },
  { id: 2, name: 'Bruno Alves', role: 'Portaria Principal', status: 'active', inZone: true, elapsed: '02:05', avatar: 'BA' },
  { id: 3, name: 'Carla Santos', role: 'Portaria Lateral', status: 'active', inZone: true, elapsed: '01:58', avatar: 'CS' },
  { id: 4, name: 'Diego Mota', role: 'Portaria Lateral', status: 'late', inZone: false, elapsed: '—', avatar: 'DM' },
  { id: 5, name: 'Fernanda Lima', role: 'Apoio VIP', status: 'active', inZone: false, elapsed: '01:22', avatar: 'FL' },
  { id: 6, name: 'Ricardo Souza', role: 'Apoio VIP', status: 'active', inZone: true, elapsed: '01:45', avatar: 'RS' },
]

type FilterType = 'all' | 'active' | 'late' | 'outZone'

const STATUS_COLORS = { active: '#22C55E', late: '#d97706', absent: '#EF4444' }

interface MemberOverlayProps { member: typeof TEAM[0]; onClose: () => void }

function MemberOverlay({ member, onClose }: MemberOverlayProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-white/10 rounded-t-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-14 h-14 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xl">
            {member.avatar}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">{member.name}</p>
            <p className="text-slate-400 text-sm">{member.role}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] }} />
              <span className="text-xs" style={{ color: STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] }}>
                {member.status === 'active' ? 'Ativo' : member.status === 'late' ? 'Atrasado' : 'Ausente'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
            <X size={18} className="text-slate-300" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 px-5 pb-3">
          {[
            { label: 'Tempo ativo', value: member.elapsed },
            { label: 'Zona', value: member.inZone ? 'Dentro' : 'Fora' },
            { label: 'Status', value: member.status === 'active' ? 'Ok' : 'Atenção' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-sm">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 px-5 pb-6">
          <button className="flex-1 py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
            <Phone size={16} />
            Ligar
          </button>
          <button className="flex-1 py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-sm flex items-center justify-center gap-2">
            <MessageSquare size={16} />
            Mensagem
          </button>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  )
}

export default function TeamLivePage({ onNavigate }: PulsePageProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedMember, setSelectedMember] = useState<typeof TEAM[0] | null>(null)

  const filtered = TEAM.filter((m) => {
    if (filter === 'active') return m.status === 'active'
    if (filter === 'late') return m.status === 'late'
    if (filter === 'outZone') return !m.inZone
    return true
  })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Equipe Ao Vivo</h1>
        <span className="ml-auto text-slate-400 text-sm">{TEAM.length} pessoas</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'active', label: '✓ Ativos' },
          { id: 'late', label: '⏰ Atrasos' },
          { id: 'outZone', label: '⚠ Fora da zona' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id as FilterType)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === id ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team list */}
      <div className="flex-1 px-4 space-y-2">
        {filtered.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="w-full flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3 active:bg-white/10 text-left"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {member.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-semibold truncate">{member.name}</p>
                {member.status === 'late' && (
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">
                    Atrasado
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">{member.role}</p>
            </div>

            {/* Status indicators */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-xs" style={{ color: STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[member.status as keyof typeof STATUS_COLORS] }} />
                {member.elapsed}
              </div>
              {!member.inZone && (
                <span className="flex items-center gap-1 text-[10px] text-orange-400">
                  <MapPin size={10} />
                  Fora zona
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Member overlay */}
      {selectedMember && (
        <MemberOverlay member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  )
}
