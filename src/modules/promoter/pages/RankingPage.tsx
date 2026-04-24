import React, { useEffect, useState } from 'react'
import { ChevronLeft, Trophy, Medal, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { promoterService } from '@/core/promoter/promoter.service'
import { supabase } from '@/lib/supabase'
import type { RankingEntry } from '@/core/promoter/promoter.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function RankingPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !context?.eventId) { setLoading(false); return }
      try {
        const data = await promoterService.getRanking(context.eventId, user.id)
        setRanking(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3)
  const myEntry = ranking.find((r) => r.isMe)

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
  const podiumHeights = ['h-24', 'h-16', 'h-12']

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/promoter')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Ranking</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : ranking.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Trophy size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Ranking ainda não disponível</p>
        </div>
      ) : (
        <div className="px-4">
          {/* My position highlight */}
          {myEntry && myEntry.position > 3 && (
            <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-orange-400 font-bold text-lg">#{myEntry.position}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Sua posição atual</p>
                <p className="text-slate-400 text-xs">{myEntry.sales} vendas · {fmt(myEntry.revenue)}</p>
              </div>
            </div>
          )}

          {/* Podium */}
          {podium.length >= 2 && (
            <div className="flex items-end justify-center gap-3 mb-6 px-4 pt-4">
              {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry, idx) => {
                const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                const height = podiumHeights[realIdx]
                const color = medalColors[realIdx]
                return (
                  <div key={entry.position} className="flex flex-col items-center flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-2"
                      style={{ backgroundColor: color + '33', border: `2px solid ${color}`, outline: entry.isMe ? `2px solid #F97316` : 'none', outlineOffset: 2 }}
                    >
                      {entry.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-white text-xs font-semibold text-center truncate w-full px-1">{entry.name.split(' ')[0]}</p>
                    <p className="text-slate-500 text-[10px]">{entry.sales}v</p>
                    <div
                      className={`w-full ${height} rounded-t-xl mt-2 flex items-center justify-center`}
                      style={{ backgroundColor: color + '22', border: `1px solid ${color}44` }}
                    >
                      <span className="font-bold text-lg" style={{ color }}>#{entry.position}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Rest of ranking */}
          <div className="space-y-2">
            {rest.map((entry) => (
              <div
                key={entry.position}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${entry.isMe ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/4 border border-white/6'}`}
              >
                <span className="text-slate-500 font-bold text-sm w-6 text-center">#{entry.position}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: entry.isMe ? '#F9731633' : '#1e293b' }}
                >
                  {entry.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${entry.isMe ? 'text-orange-300' : 'text-white'}`}>
                    {entry.name}{entry.isMe ? ' (você)' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-semibold">{entry.sales}</p>
                  <p className="text-slate-500 text-xs">vendas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
