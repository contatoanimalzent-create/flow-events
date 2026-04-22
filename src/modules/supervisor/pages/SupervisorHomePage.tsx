import React from 'react'
import { Users, Map, CheckSquare, AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface QuickCard {
  title: string; subtitle: string; icon: LucideIcon
  color: string; path: string; large?: boolean; badge?: number
}

const CARDS: QuickCard[] = [
  { title: 'Equipe Ao Vivo', subtitle: '6 ativos · 1 atrasado', icon: Users, color: '#7C3AED', path: '/pulse/supervisor/team-live', large: true, badge: 1 },
  { title: 'Mapa da Equipe', subtitle: 'Posições em tempo real', icon: Map, color: '#1e293b', path: '/pulse/supervisor/team-map' },
  { title: 'Aprovações', subtitle: '3 pendentes', icon: CheckSquare, color: '#1e293b', path: '/pulse/supervisor/approvals', badge: 3 },
  { title: 'Ocorrências', subtitle: '5 registradas', icon: AlertTriangle, color: '#78350f', path: '/pulse/supervisor/occurrences' },
  { title: 'Atrasos', subtitle: '1 staff atrasado', icon: Clock, color: '#7f1d1d', path: '/pulse/supervisor/delays', badge: 1 },
  { title: 'Alertas Críticos', subtitle: '0 pendentes', icon: ShieldAlert, color: '#1e293b', path: '/pulse/supervisor/alerts' },
]

const KPI = { active: 6, late: 1, absent: 0, outZone: 1 }

export default function SupervisorHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-slate-400 text-sm">Supervisão</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName}</h2>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-5">
        {[
          { label: 'Ativos', value: KPI.active, color: '#22C55E' },
          { label: 'Atrasos', value: KPI.late, color: '#d97706' },
          { label: 'Ausentes', value: KPI.absent, color: '#EF4444' },
          { label: 'Fora zona', value: KPI.outZone, color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <p className="text-white font-bold text-xl leading-none" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      {/* Critical alert */}
      {KPI.late > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3">
            <Clock size={16} className="text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Diego Mota — 15min de atraso</p>
              <p className="text-slate-400 text-xs">Portaria Lateral · Equipe Alfa</p>
            </div>
            <button
              onClick={() => onNavigate('/pulse/supervisor/team-live')}
              className="text-yellow-400 text-xs font-medium shrink-0"
            >
              Ver
            </button>
          </div>
        </div>
      )}

      {/* Quick access */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.title}
              onClick={() => onNavigate(card.path)}
              className={`relative rounded-2xl p-4 text-left active:opacity-80 transition-opacity ${card.large ? 'col-span-2' : ''}`}
              style={{ backgroundColor: card.color + 'CC', border: `1px solid ${card.color}44` }}
            >
              {card.badge != null && card.badge > 0 && (
                <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {card.badge}
                </span>
              )}
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
