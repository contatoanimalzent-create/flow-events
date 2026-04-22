import React from 'react'
import { ChevronLeft, TrendingUp, Users, Clock, ArrowUpRight } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const HOURLY = [
  { hour: '10h', count: 42 },
  { hour: '11h', count: 128 },
  { hour: '12h', count: 89 },
  { hour: '13h', count: 201 },
  { hour: '14h', count: 347 },
  { hour: '15h', count: 189 },
  { hour: '16h', count: 251 },
]

const peak = Math.max(...HOURLY.map((h) => h.count))

export default function FlowPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Fluxo de Portaria</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-5">
        {[
          { label: 'Total no evento', value: '1.247', icon: Users, color: '#0057E7' },
          { label: 'Taxa de ocupação', value: '83%', icon: TrendingUp, color: '#22C55E' },
          { label: 'Tempo médio/scan', value: '4.2s', icon: Clock, color: '#d97706' },
          { label: 'Pico de entrada', value: '14h–15h', icon: ArrowUpRight, color: '#7C3AED' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <Icon size={18} style={{ color }} className="mb-2" />
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">
          Entradas por hora
        </p>
        <div className="flex items-end gap-2 h-36">
          {HOURLY.map(({ hour, count }) => (
            <div key={hour} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500">{count}</span>
              <div
                className="w-full rounded-t-lg bg-blue-600/70"
                style={{ height: `${(count / peak) * 100}%`, minHeight: 4 }}
              />
              <span className="text-[10px] text-slate-500">{hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gate breakdown */}
      <div className="px-4 mt-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
          Por portaria
        </p>
        <div className="space-y-2">
          {[
            { name: 'Portaria Principal', count: 891, pct: 71 },
            { name: 'Portaria Lateral', count: 356, pct: 29 },
          ].map(({ name, count, pct }) => (
            <div key={name} className="bg-white/5 border border-white/8 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <p className="text-white text-sm font-medium">{name}</p>
                <p className="text-slate-400 text-sm">{count}</p>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
