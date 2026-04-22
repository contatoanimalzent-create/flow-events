import React from 'react'
import { Clock, MapPin, FileText, AlertTriangle, ClipboardList, CheckCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface QuickCard {
  id: string; title: string; subtitle: string; icon: React.ComponentType<{size?:number; className?:string}>
  color: string; path: string; large?: boolean
}

const CARDS: QuickCard[] = [
  { id: 'shift', title: 'Meu Turno', subtitle: 'Ver detalhes do turno', icon: Clock, color: '#22C55E', path: '/pulse/staff/shift', large: true },
  { id: 'presence', title: 'Presença', subtitle: 'Registrar presença', icon: MapPin, color: '#1e293b', path: '/pulse/staff/presence' },
  { id: 'instructions', title: 'Instruções', subtitle: 'Orientações', icon: FileText, color: '#1e293b', path: '/pulse/staff/instructions' },
  { id: 'occurrences', title: 'Ocorrências', subtitle: 'Registrar', icon: AlertTriangle, color: '#78350f', path: '/pulse/staff/occurrences' },
  { id: 'history', title: 'Histórico', subtitle: 'Turnos anteriores', icon: ClipboardList, color: '#1e293b', path: '/pulse/staff/history' },
]

export default function StaffHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-slate-400 text-sm">Bem-vindo, Staff</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName}</h2>
      </div>

      {/* Shift status card */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Turno Ativo</p>
              <p className="text-white font-bold text-lg mt-0.5">Portaria Principal</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Ativo</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Início</p>
              <p className="text-white font-medium">13:00</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Fim</p>
              <p className="text-white font-medium">21:00</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Equipe</p>
              <p className="text-white font-medium">Alfa</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: '35%' }} />
          </div>
          <p className="text-slate-500 text-xs mt-1">35% do turno concluído</p>
        </div>
      </div>

      {/* Presence status */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-4">
          <CheckCircle size={20} className="text-green-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Presença confirmada</p>
            <p className="text-slate-400 text-xs">Registrada às 13:04</p>
          </div>
          <button
            onClick={() => onNavigate('/pulse/staff/presence')}
            className="text-blue-400 text-xs font-medium"
          >
            Ver
          </button>
        </div>
      </div>

      {/* Quick cards */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.path)}
              className={`rounded-2xl p-4 text-left active:opacity-80 transition-opacity ${card.large ? 'col-span-2' : ''}`}
              style={{ backgroundColor: card.color + 'CC', border: `1px solid ${card.color}44` }}
            >
              <Icon size={card.large ? 28 : 22} className="text-white/80 mb-3" />
              <p className="text-white font-bold text-sm">{card.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{card.subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
