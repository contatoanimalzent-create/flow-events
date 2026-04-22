import React from 'react'
import { ChevronLeft, Target, Trophy, Clock } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const GOALS = [
  { id: 1, title: '50 vendas no evento', current: 42, target: 50, reward: 'R$ 500 bônus', deadline: '25/04 23:59', icon: Target },
  { id: 2, title: 'Top 3 no ranking', current: 3, target: 3, reward: 'Certificado + R$ 300', deadline: '25/04 23:59', icon: Trophy },
  { id: 3, title: 'R$ 10.000 em receita', current: 8400, target: 10000, reward: 'Comissão extra 5%', deadline: '25/04 23:59', icon: Trophy, isCurrency: true },
]

export default function GoalsPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Metas</h1>
      </div>

      <div className="px-4 space-y-4">
        {GOALS.map((goal) => {
          const pct = Math.min(goal.current / goal.target, 1)
          const reached = pct >= 1
          const Icon = goal.icon
          const currentDisplay = goal.isCurrency
            ? `R$ ${(goal.current / 1000).toFixed(1)}k`
            : goal.current
          const targetDisplay = goal.isCurrency
            ? `R$ ${(goal.target / 1000).toFixed(0)}k`
            : goal.target

          return (
            <div
              key={goal.id}
              className={`rounded-2xl border p-5 ${reached ? 'border-green-500/30 bg-green-500/5' : 'border-white/8 bg-white/4'}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${reached ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                  <Icon size={20} className={reached ? 'text-green-400' : 'text-orange-400'} />
                </span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{goal.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {goal.deadline}
                  </p>
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
                    {currentDisplay} / {targetDisplay}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
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

              {/* Reward */}
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <Trophy size={12} className="text-yellow-400 shrink-0" />
                <p className="text-slate-300 text-xs">Prêmio: <span className="text-white font-semibold">{goal.reward}</span></p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
