import React from 'react'
import { ChevronLeft, Clock, Users, MapPin, FileText } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const TEAMMATES = [
  { name: 'Bruno Alves', role: 'Portaria', status: 'active' },
  { name: 'Carla Santos', role: 'Portaria', status: 'active' },
  { name: 'Diego Mota', role: 'Portaria', status: 'late' },
]

export default function MyShiftPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Meu Turno</h1>
      </div>

      {/* Shift card */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Turno Ativo</p>
              <p className="text-white font-bold text-xl mt-1">Portaria Principal</p>
              <p className="text-slate-400 text-sm mt-0.5">Equipe Alfa</p>
            </div>
            <span className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Ativo</span>
            </span>
          </div>

          {/* Time info */}
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-slate-400 text-xs">Início</p>
              <p className="text-white font-bold text-lg">13:00</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Fim</p>
              <p className="text-white font-bold text-lg">21:00</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Duração</p>
              <p className="text-white font-bold text-lg">8h</p>
            </div>
          </div>

          {/* Progress */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: '35%' }} />
          </div>
          <p className="text-slate-500 text-xs mt-1.5">35% concluído · 5h12 restantes</p>
        </div>
      </div>

      {/* Location */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-4">
          <MapPin size={20} className="text-blue-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Portaria Principal</p>
            <p className="text-slate-400 text-xs">Zona A — Entrada principal</p>
          </div>
          <span className="text-green-400 text-xs font-medium">Dentro da zona</span>
        </div>
      </div>

      {/* Teammates */}
      <div className="px-4 mb-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
          <Users size={12} />
          Minha equipe
        </p>
        <div className="space-y-2">
          {TEAMMATES.map((t) => (
            <div key={t.name} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                {t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: t.status === 'active' ? '#22C55E' : '#d97706' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions quick access */}
      <div className="px-4">
        <button
          onClick={() => onNavigate('/pulse/staff/instructions')}
          className="w-full flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-4 active:bg-white/10"
        >
          <FileText size={18} className="text-blue-400 shrink-0" />
          <p className="text-white text-sm font-medium">Ver instruções do turno</p>
          <ChevronLeft size={16} className="text-slate-500 rotate-180 ml-auto" />
        </button>
      </div>
    </div>
  )
}
