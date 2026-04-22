import React from 'react'
import {
  ScanLine, History, BarChart2, Search, BellRing,
  CheckCircle, XCircle, Clock, TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const ICON_MAP: Record<string, LucideIcon> = {
  ScanLine, History, BarChart2, Search, BellRing,
  CheckCircle, XCircle, Clock, TrendingUp,
}

interface QuickCard {
  id: string; title: string; subtitle: string; icon: string; color: string; path: string; large?: boolean
}

const CARDS: QuickCard[] = [
  { id: 'scanner', title: 'Scanner QR', subtitle: 'Validar ingressos', icon: 'ScanLine', color: '#0057E7', path: '/pulse/operator/scanner', large: true },
  { id: 'history', title: 'Histórico', subtitle: 'Últimos check-ins', icon: 'History', color: '#1e293b', path: '/pulse/operator/history' },
  { id: 'flow', title: 'Fluxo', subtitle: 'Métricas da portaria', icon: 'BarChart2', color: '#1e293b', path: '/pulse/operator/flow' },
  { id: 'manual', title: 'Busca Manual', subtitle: 'Nome / CPF', icon: 'Search', color: '#1e293b', path: '/pulse/operator/manual-check' },
  { id: 'alerts', title: 'Alertas', subtitle: 'Tentativas inválidas', icon: 'BellRing', color: '#7f1d1d', path: '/pulse/operator/alerts' },
]

// Simulated live KPIs — would come from Supabase realtime in production
const KPI = { valid: 1_247, invalid: 23, pending: 0, rate: 98.2 }

export default function OperatorHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-slate-400 text-sm">Portaria principal</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName}</h2>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-5">
        {[
          { label: 'Válidos', value: KPI.valid.toLocaleString('pt-BR'), icon: CheckCircle, color: '#22C55E' },
          { label: 'Inválidos', value: KPI.invalid.toString(), icon: XCircle, color: '#EF4444' },
          { label: 'Pendentes', value: KPI.pending.toString(), icon: Clock, color: '#d97706' },
          { label: 'Taxa', value: `${KPI.rate}%`, icon: TrendingUp, color: '#0057E7' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <Icon size={14} style={{ color }} />
            <p className="text-white font-bold text-base leading-none">{value}</p>
            <p className="text-slate-500 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = ICON_MAP[card.icon] ?? ScanLine
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

      {/* Last check-in strip */}
      <div className="px-4 mt-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
          Últimos check-ins
        </p>
        <div className="space-y-2">
          {[
            { name: 'Ana Paula Santos', ticket: 'STANDARD #0042', valid: true, time: '14:32' },
            { name: 'Carlos Mendes', ticket: 'VIP #0011', valid: true, time: '14:30' },
            { name: 'TOKEN INVÁLIDO', ticket: '—', valid: false, time: '14:28' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.valid ? '#22C55E' : '#EF4444' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{entry.name}</p>
                <p className="text-slate-500 text-xs">{entry.ticket}</p>
              </div>
              <span className="text-slate-500 text-xs shrink-0">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
