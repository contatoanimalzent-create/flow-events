import React, { useState, useEffect } from 'react'
import { ChevronLeft, ShoppingCart, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { promoterService } from '@/core/promoter/promoter.service'
import { supabase } from '@/lib/supabase'
import type { SaleRecord } from '@/core/promoter/promoter.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: '#22C55E' },
  confirmed: { label: 'Confirmado', color: '#4285F4' },
  pending: { label: 'Pendente', color: '#d97706' },
  cancelled: { label: 'Cancelado', color: '#EF4444' },
}

export default function MySalesPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !context?.eventId) { setLoading(false); return }
      try {
        const data = await promoterService.getSales(user.id, context.eventId)
        setSales(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const totalRevenue = sales.reduce((s, o) => s + o.amount, 0)
  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Minhas Vendas</h1>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <ShoppingCart size={16} className="text-orange-400 mb-2" />
            <p className="text-white font-bold text-2xl">{sales.length}</p>
            <p className="text-slate-500 text-xs">vendas totais</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <TrendingUp size={16} className="text-green-400 mb-2" />
            <p className="text-white font-bold text-xl">{fmt(totalRevenue)}</p>
            <p className="text-slate-500 text-xs">receita gerada</p>
          </div>
        </div>
      )}

      {/* Sales list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ShoppingCart size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma venda ainda</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {sales.map((sale) => {
            const sc = STATUS_CONFIG[sale.status] ?? { label: sale.status, color: '#94a3b8' }
            return (
              <div key={sale.id} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{sale.attendeeName}</p>
                  <p className="text-slate-500 text-xs">{sale.ticketType}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-white font-semibold text-sm">{fmt(sale.amount)}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                    <span className="text-slate-600 text-[10px] flex items-center gap-0.5">
                      <Clock size={8} />
                      {new Date(sale.soldAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
