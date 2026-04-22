import React from 'react'
import { ChevronLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const BREAKDOWN = [
  { period: 'Semana 1', sales: 12, revenue: 2400, commission: 360 },
  { period: 'Semana 2', sales: 18, revenue: 3600, commission: 540 },
  { period: 'Semana 3', sales: 8, revenue: 1600, commission: 240 },
  { period: 'Semana 4', sales: 4, revenue: 800, commission: 120 },
]

const total = BREAKDOWN.reduce((s, i) => s + i.commission, 0)
const maxComm = Math.max(...BREAKDOWN.map((b) => b.commission))

export default function MyCommissionPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Comissão</h1>
      </div>

      {/* Total */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/20 rounded-2xl p-6 text-center">
          <DollarSign size={28} className="text-green-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm mb-1">Total acumulado</p>
          <p className="text-white font-black text-4xl">R$ {total.toLocaleString('pt-BR')}</p>
          <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-1">
            <TrendingUp size={14} />
            15% de comissão sobre vendas
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-4 mb-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">Por semana</p>
        <div className="flex items-end gap-3 h-32">
          {BREAKDOWN.map(({ period, commission }) => (
            <div key={period} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400">R$ {commission}</span>
              <div
                className="w-full rounded-t-xl bg-green-600/70"
                style={{ height: `${(commission / maxComm) * 100}%`, minHeight: 8 }}
              />
              <span className="text-[9px] text-slate-500">{period.replace('Semana ', 'S')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Detalhamento</p>
        <div className="space-y-2">
          {BREAKDOWN.map(({ period, sales, revenue, commission }) => (
            <div key={period} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{period}</p>
                <p className="text-slate-500 text-xs">{sales} vendas · R$ {revenue.toLocaleString('pt-BR')}</p>
              </div>
              <p className="text-green-400 font-bold text-sm">+R$ {commission}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
