import React, { useEffect, useState } from 'react'
import { ChevronLeft, DollarSign, TrendingUp, Clock, Loader2, CheckCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { promoterService } from '@/core/promoter/promoter.service'
import { supabase } from '@/lib/supabase'
import type { CommissionSummary } from '@/core/promoter/promoter.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function MyCommissionPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [commission, setCommission] = useState<CommissionSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !context?.eventId) { setLoading(false); return }
      try {
        const data = await promoterService.getCommission(user.id, context.eventId)
        setCommission(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const fmt = (n: number, cur = 'BRL') =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: cur, minimumFractionDigits: 2 })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Comissão</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : !commission ? (
        <p className="text-slate-500 text-sm text-center py-16">Sem dados de comissão</p>
      ) : (
        <div className="px-4 space-y-4">
          {/* Total */}
          <div className="bg-gradient-to-br from-orange-900/40 to-amber-900/20 border border-orange-500/20 rounded-2xl p-5">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">{commission.periodLabel}</p>
            <p className="text-white font-bold text-3xl">{fmt(commission.total, commission.currency)}</p>
            <p className="text-slate-400 text-sm mt-1">Comissão total gerada</p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-amber-400" />
                <p className="text-amber-400 text-xs font-semibold">Pendente</p>
              </div>
              <p className="text-white font-bold text-xl">{fmt(commission.pending, commission.currency)}</p>
              <p className="text-slate-500 text-xs mt-0.5">Aguardando liberação</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-400" />
                <p className="text-green-400 text-xs font-semibold">Pago</p>
              </div>
              <p className="text-white font-bold text-xl">{fmt(commission.paid, commission.currency)}</p>
              <p className="text-slate-500 text-xs mt-0.5">Já depositado</p>
            </div>
          </div>

          {/* Progress bar */}
          {commission.total > 0 && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs">Pagamento</p>
                <p className="text-white text-xs font-medium">
                  {Math.round((commission.paid / commission.total) * 100)}% recebido
                </p>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-700"
                  style={{ width: `${(commission.paid / commission.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2">
              <TrendingUp size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs leading-relaxed">
                As comissões são calculadas automaticamente a cada venda confirmada via seu código ou link. O pagamento é processado após o evento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
