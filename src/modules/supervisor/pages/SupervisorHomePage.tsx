import React, { useEffect, useState } from 'react'
import { Users, Map, CheckSquare, AlertTriangle, Clock, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import { useRealtimeAlerts, useRealtimeApprovals } from '@/core/realtime/realtime.hooks'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface QuickCard {
  title: string; subtitle: string; icon: LucideIcon
  color: string; path: string; large?: boolean; badge?: number
}

export default function SupervisorHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [teamData, setTeamData] = useState<{ total: number; active: number; delayed: number; absent: number; outOfArea: number } | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [openOccurrences, setOpenOccurrences] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!context?.eventId) return
    try {
      const [team, approvals, occurrences] = await Promise.all([
        supervisorService.getTeamLive(context.eventId),
        supervisorService.getApprovals(context.eventId),
        supervisorService.getOccurrences(context.eventId),
      ])
      setTeamData({ total: team.total, active: team.active, delayed: team.delayed, absent: team.absent, outOfArea: team.outOfArea })
      setPendingApprovals(approvals.filter((a) => a.status === 'pending').length)
      setOpenOccurrences(occurrences.filter((o) => o.status === 'open').length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [context?.eventId])

  // Realtime alerts & approvals
  useRealtimeAlerts(context?.eventId)
  useRealtimeApprovals(context?.eventId)

  const cards: QuickCard[] = [
    { title: 'Equipe Ao Vivo', subtitle: teamData ? `${teamData.active} ativo${teamData.active !== 1 ? 's' : ''} · ${teamData.delayed} atrasado${teamData.delayed !== 1 ? 's' : ''}` : 'Carregando…', icon: Users, color: '#7C3AED', path: '/pulse/supervisor/team-live', large: true },
    { title: 'Mapa', subtitle: 'Equipe por setor', icon: Map, color: '#1e293b', path: '/pulse/supervisor/team-map' },
    { title: 'Ocorrências', subtitle: openOccurrences > 0 ? `${openOccurrences} em aberto` : 'Sem ocorrências', icon: AlertTriangle, color: openOccurrences > 0 ? '#7f1d1d' : '#1e293b', path: '/pulse/supervisor/occurrences', badge: openOccurrences > 0 ? openOccurrences : undefined },
    { title: 'Aprovações', subtitle: pendingApprovals > 0 ? `${pendingApprovals} pendente${pendingApprovals !== 1 ? 's' : ''}` : 'Sem pendências', icon: CheckSquare, color: pendingApprovals > 0 ? '#78350f' : '#1e293b', path: '/pulse/supervisor/approvals', badge: pendingApprovals > 0 ? pendingApprovals : undefined },
    { title: 'Alertas', subtitle: 'Notificações críticas', icon: ShieldAlert, color: '#1e293b', path: '/pulse/supervisor/alerts' },
  ]

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs">Supervisão</p>
          <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName ?? '—'}</h2>
        </div>
        <button onClick={load} className="p-2 mt-1">
          <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Live stats */}
      {loading ? (
        <div className="px-4 mb-5 flex items-center justify-center py-6">
          <Loader2 size={20} className="text-purple-400 animate-spin" />
        </div>
      ) : teamData ? (
        <div className="px-4 mb-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', value: teamData.total, color: '#7C3AED' },
              { label: 'Ativos', value: teamData.active, color: '#22C55E' },
              { label: 'Atrasados', value: teamData.delayed, color: '#d97706' },
              { label: 'Ausentes', value: teamData.absent, color: '#EF4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
                <p className="font-bold text-base" style={{ color }}>{value}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {teamData.delayed > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <p className="text-amber-300 text-sm">{teamData.delayed} membro{teamData.delayed !== 1 ? 's' : ''} em atraso — verifique a equipe</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Quick access */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="relative">
              {card.badge != null && (
                <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{card.badge}</span>
                </div>
              )}
              <button
                onClick={() => onNavigate(card.path)}
                className={`w-full rounded-2xl p-4 text-left active:opacity-80 transition-opacity ${card.large ? 'col-span-2' : ''}`}
                style={{ backgroundColor: card.color + 'CC', border: `1px solid ${card.color}44` }}
              >
                <Icon size={card.large ? 28 : 22} className="text-white/80 mb-3" />
                <p className="text-white font-bold text-sm">{card.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{card.subtitle}</p>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
