import React, { useEffect, useState } from 'react'
import { Users, Map, CheckSquare, AlertTriangle, Clock, ShieldAlert, Loader2, RefreshCw, BarChart2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import { useRealtimeAlerts, useRealtimeApprovals } from '@/core/realtime/realtime.hooks'
import { useHealthWatcher } from '@/core/supervisor/health-watcher.hook'
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
  const [healthScore, setHealthScore] = useState<{ score: number; grade: string; factors: Array<{label: string; value: number; weight: number; ok: boolean}> } | null>(null)

  const load = async () => {
    if (!context?.eventId) return
    try {
      const [team, approvals, occurrences, health] = await Promise.all([
        supervisorService.getTeamLive(context.eventId),
        supervisorService.getApprovals(context.eventId),
        supervisorService.getOccurrences(context.eventId),
        supervisorService.getHealthScore(context.eventId),
      ])
      setTeamData({ total: team.total, active: team.active, delayed: team.delayed, absent: team.absent, outOfArea: team.outOfArea })
      setPendingApprovals(approvals.filter((a) => a.status === 'pending').length)
      setOpenOccurrences(occurrences.filter((o) => o.status === 'open').length)
      setHealthScore(health)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [context?.eventId])

  // Realtime alerts & approvals
  useRealtimeAlerts(context?.eventId)
  useRealtimeApprovals(context?.eventId)
  useHealthWatcher(context?.eventId)

  const cards: QuickCard[] = [
    { title: 'Equipe Ao Vivo', subtitle: teamData ? `${teamData.active} ativo${teamData.active !== 1 ? 's' : ''} · ${teamData.delayed} atrasado${teamData.delayed !== 1 ? 's' : ''}` : 'Carregando…', icon: Users, color: '#7C3AED', path: '/pulse/supervisor/team-live', large: true },
    { title: 'Mapa', subtitle: 'Equipe por setor', icon: Map, color: '#1e293b', path: '/pulse/supervisor/team-map' },
    { title: 'Ocorrências', subtitle: openOccurrences > 0 ? `${openOccurrences} em aberto` : 'Sem ocorrências', icon: AlertTriangle, color: openOccurrences > 0 ? '#7f1d1d' : '#1e293b', path: '/pulse/supervisor/occurrences', badge: openOccurrences > 0 ? openOccurrences : undefined },
    { title: 'Aprovações', subtitle: pendingApprovals > 0 ? `${pendingApprovals} pendente${pendingApprovals !== 1 ? 's' : ''}` : 'Sem pendências', icon: CheckSquare, color: pendingApprovals > 0 ? '#78350f' : '#1e293b', path: '/pulse/supervisor/approvals', badge: pendingApprovals > 0 ? pendingApprovals : undefined },
    { title: 'Alertas', subtitle: 'Notificações críticas', icon: ShieldAlert, color: '#1e293b', path: '/pulse/supervisor/alerts' },
    { title: 'Resumo', subtitle: 'Relatório automático', icon: BarChart2, color: '#0f2027', path: '/pulse/supervisor/summary' },
  ]

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs">Supervisão</p>
          <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName ?? '-'}</h2>
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
              <p className="text-amber-300 text-sm">{teamData.delayed} membro{teamData.delayed !== 1 ? 's' : ''} em atraso, verifique a equipe</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Health Score */}
      {healthScore && (
        <div className="px-4 mb-5">
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: healthScore.score >= 80 ? '#22C55E44' : healthScore.score >= 60 ? '#d9770644' : '#EF444444',
              backgroundColor: healthScore.score >= 80 ? '#22C55E0a' : healthScore.score >= 60 ? '#d977060a' : '#EF44440a',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Health Score do Evento</p>
                <p className="text-white font-bold text-2xl mt-0.5">
                  {healthScore.score}
                  <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black"
                style={{
                  backgroundColor: healthScore.score >= 80 ? '#22C55E20' : healthScore.score >= 60 ? '#d9770620' : '#EF444420',
                  color: healthScore.score >= 80 ? '#22C55E' : healthScore.score >= 60 ? '#d97706' : '#EF4444',
                }}
              >
                {healthScore.grade}
              </div>
            </div>
            <div className="space-y-2">
              {healthScore.factors.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <p className="text-slate-400 text-xs w-28 shrink-0">{f.label}</p>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${f.value}%`,
                        backgroundColor: f.ok ? '#22C55E' : f.value >= 60 ? '#d97706' : '#EF4444',
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium w-8 text-right" style={{ color: f.ok ? '#22C55E' : '#d97706' }}>
                    {f.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Operational Recommendations */}
      {healthScore && healthScore.score < 90 && (() => {
        const recs: Array<{ icon: string; text: string; urgent: boolean }> = []
        const f = Object.fromEntries(healthScore.factors.map((x) => [x.label, x]))
        if (f['Staff ativo'] && !f['Staff ativo'].ok) recs.push({ icon: '👥', text: 'Staff ativo abaixo de 80%, mobilize membros reserva imediatamente', urgent: true })
        if (f['Pontualidade'] && !f['Pontualidade'].ok) recs.push({ icon: '⏰', text: `${teamData?.delayed ?? 0} membros atrasados, entre em contato pela equipe`, urgent: f['Pontualidade'].value < 70 })
        if (f['Presença geral'] && !f['Presença geral'].ok) recs.push({ icon: '📍', text: 'Presença geral baixa, verifique absenteísmo e distribua tarefas', urgent: false })
        if (f['Segurança'] && !f['Segurança'].ok) recs.push({ icon: '🔒', text: 'Alta taxa de tentativas inválidas, reforce o controle na portaria', urgent: true })
        if (teamData && teamData.outOfArea > 0) recs.push({ icon: '🗺️', text: `${teamData.outOfArea} membro${teamData.outOfArea > 1 ? 's' : ''} fora da zona, verifique o mapa`, urgent: false })
        if (recs.length === 0) return null
        return (
          <div className="px-4 mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Recomendações operacionais</p>
            <div className="space-y-2">
              {recs.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
                    r.urgent
                      ? 'bg-red-500/8 border-red-500/20'
                      : 'bg-amber-500/8 border-amber-500/20'
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{r.icon}</span>
                  <p className={`text-sm leading-relaxed ${r.urgent ? 'text-red-300' : 'text-amber-300'}`}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

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
