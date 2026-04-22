import React, { useState } from 'react'
import { ChevronLeft, ShoppingCart, Clock, TrendingUp } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const SALES = [
  { id: 1, buyer: 'Marcos Oliveira', ticket: 'STANDARD × 2', value: 400, commission: 60, date: '25/04 14:32' },
  { id: 2, buyer: 'Patrícia Lima', ticket: 'VIP × 1', value: 350, commission: 52.50, date: '25/04 12:15' },
  { id: 3, buyer: 'Gustavo Neves', ticket: 'STANDARD × 1', value: 200, commission: 30, date: '24/04 18:42' },
  { id: 4, buyer: 'Renata Souza', ticket: 'CAMAROTE × 1', value: 800, commission: 120, date: '24/04 11:05' },
  { id: 5, buyer: 'Felipe Costa', ticket: 'STANDARD × 3', value: 600, commission: 90, date: '23/04 20:17' },
]

type Filter = 'all' | 'today' | 'week'

const KPI = {
  total: SALES.length,
  revenue: SALES.reduce((s, i) => s + i.value, 0),
  commission: SALES.reduce((s, i) => s + i.commission, 0),
}

export default function MySalesPage({ onNavigate }: PulsePageProps) {
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Minhas Vendas</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-4">
        {[
          { label: 'Vendas', value: KPI.total, icon: ShoppingCart, color: '#F97316' },
          { label: 'Receita', value: `R$ ${(KPI.revenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: '#22C55E' },
          { label: 'Comissão', value: `R$ ${KPI.commission.toLocaleString('pt-BR')}`, icon: Clock, color: '#d97706' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3">
            <Icon size={14} style={{ color }} className="mb-1.5" />
            <p className="text-white font-bold text-sm">{value}</p>
            <p className="text-slate-500 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-4">
        {(['all', 'today', 'week'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold ${filter === f ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {f === 'all' ? 'Todas' : f === 'today' ? 'Hoje' : 'Semana'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-4 space-y-2">
        {SALES.map((sale) => (
          <div key={sale.id} className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center shrink-0">
              <ShoppingCart size={18} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{sale.buyer}</p>
              <p className="text-slate-400 text-xs">{sale.ticket}</p>
              <p className="text-slate-500 text-xs mt-0.5">{sale.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold text-sm">R$ {sale.value.toLocaleString('pt-BR')}</p>
              <p className="text-green-400 text-xs">+R$ {sale.commission.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
