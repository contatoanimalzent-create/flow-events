import React, { useEffect, useState } from 'react'
import { ChevronLeft, Target, Trophy, Clock, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { promoterService } from '@/core/promoter/promoter.service'
import { supabase } from '@/lib/supabase'
import type { PromoterGoal } from '@/core/promoter/promoter.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function GoalsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [goals, setGoals] = useState<PromoterGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !context?.eventId) { setLoading(false); return }
      try {
        const data = await promoterService.getGoals(user.id, context.eventId)
        setGoals(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const fmtDeadline = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const fmtValue = (val: number, unit: string) => {
    if (unit === 'BRL') return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
    return `${val} ${unit}`
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Metas</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Target size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma meta definida para este evento</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {goals.map((goal) => {
            const pct = Math.min(goal.current / Math.max(goal.target, 1), 1)
            const reached = pct >= 1

            return (
              <div
                key={goal.id}
                className={`rounded-2xl border p-5 ${reached ? 'border-green-500/30 bg-green-500/5' : 'border-white/8 bg-white/4'}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${reached ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                    {reached
                      ? <Trophy size={20} className="text-green-400" />
                      : <Target size={20} className="text-orange-400" />
                    }
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{goal.label}</p>
                    {goal.deadline && (
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {fmtDeadline(goal.deadline)}
                      </p>
                    )}
                  </div>
                  {reached && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                      ✓ Atingida
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progresso</span>
                    <span className={reached ? 'text-green-400' : 'text-orange-400'}>
                      {fmtValue(goal.current, goal.unit)} / {fmtValue(goal.target, goal.unit)}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct * 100}%`,
                        backgroundColor: reached ? '#22C55E' : '#F97316',
                      }}
                    />
                  </div>
                  <p className="text-right text-[10px] mt-1 font-semibold" style={{ color: reached ? '#22C55E' : '#F97316' }}>
                    {Math.round(pct * 100)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
