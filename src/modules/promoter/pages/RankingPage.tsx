import React from 'react'
import { ChevronLeft, Trophy, Medal } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const RANKING = [
  { rank: 1, name: 'Fernanda Rocha', code: 'FERO10', sales: 89, commission: 2670 },
  { rank: 2, name: 'Lucas Batista', code: 'LUBA15', sales: 71, commission: 2130 },
  { rank: 3, name: 'Carlos Mendes', code: 'CARLOS20', sales: 42, commission: 1260, isMe: true },
  { rank: 4, name: 'Ana Paula Reis', code: 'ANA25', sales: 38, commission: 1140 },
  { rank: 5, name: 'Tiago Melo', code: 'TIAGO10', sales: 29, commission: 870 },
]

const PODIUM_COLORS = ['#d97706', '#94a3b8', '#b45309']
const PODIUM_HEIGHTS = ['h-28', 'h-36', 'h-20']

export default function RankingPage({ onNavigate }: PulsePageProps) {
  const top3 = RANKING.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]] // 2nd, 1st, 3rd

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Ranking</h1>
      </div>

      {/* Podium */}
      <div className="px-4 mb-6">
        <div className="flex items-end justify-center gap-2 h-44">
          {podiumOrder.map((p, i) => {
            const actualRank = i === 0 ? 1 : i === 1 ? 0 : 2
            const colors = PODIUM_COLORS
            const heights = PODIUM_HEIGHTS
            return (
              <div key={p.rank} className="flex-1 flex flex-col items-center">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white mb-1 shrink-0"
                  style={{ borderColor: colors[actualRank], backgroundColor: colors[actualRank] + '33' }}
                >
                  {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                {p.isMe && <span className="text-[9px] text-orange-400 font-bold mb-0.5">VOCÊ</span>}
                {/* Pedestal */}
                <div
                  className={`w-full ${heights[actualRank]} rounded-t-xl flex flex-col items-center justify-start pt-2`}
                  style={{ backgroundColor: colors[actualRank] + '33', border: `1px solid ${colors[actualRank]}44` }}
                >
                  <p className="text-white font-black text-2xl" style={{ color: colors[actualRank] }}>{p.rank}</p>
                  <p className="text-white text-[10px] font-semibold text-center px-1 mt-0.5 leading-tight">
                    {p.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: colors[actualRank] }}>{p.sales} vendas</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full list */}
      <div className="px-4 space-y-2">
        {RANKING.map((person) => (
          <div
            key={person.rank}
            className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${
              person.isMe ? 'border-orange-500/30 bg-orange-500/8' : 'border-white/8 bg-white/4'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {person.rank <= 3
                ? <Trophy size={14} style={{ color: PODIUM_COLORS[person.rank - 1] }} />
                : <span className="text-slate-400 text-xs font-bold">{person.rank}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${person.isMe ? 'text-orange-300' : 'text-white'}`}>{person.name}</p>
                {person.isMe && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold">Você</span>}
              </div>
              <p className="text-slate-500 text-xs">{person.code} · {person.sales} vendas</p>
            </div>
            <p className="text-green-400 font-bold text-sm shrink-0">
              R$ {person.commission.toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
