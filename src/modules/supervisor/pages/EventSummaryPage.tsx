import React, { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, RefreshCw, Share2, Loader2, Copy, CheckCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import type { SupervisorOccurrence, SupervisorApproval } from '@/core/supervisor/supervisor.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface SummaryData {
  teamTotal: number
  teamActive: number
  openOccurrences: number
  pendingApprovals: number
  healthScore: number
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  occurrences: SupervisorOccurrence[]
  approvals: SupervisorApproval[]
}

type TimelineEntry = {
  id: string
  kind: 'occurrence' | 'approval'
  description: string
  date: string
}

function gradeColor(grade: string): string {
  if (grade === 'A') return '#22C55E'
  if (grade === 'B') return '#84CC16'
  if (grade === 'C') return '#EAB308'
  if (grade === 'D') return '#F97316'
  return '#EF4444'
}

function buildAutoText(data: SummaryData): string {
  const activePercent = data.teamTotal > 0 ? Math.round((data.teamActive / data.teamTotal) * 100) : 0
  const parts: string[] = []

  if (data.healthScore >= 80) {
    parts.push(`O evento está funcionando bem com ${activePercent}% da equipe ativa.`)
  } else if (data.healthScore >= 60) {
    parts.push(`O evento apresenta pontos de atenção com ${activePercent}% da equipe ativa.`)
  } else {
    parts.push(`O evento requer ação imediata — apenas ${activePercent}% da equipe está ativa.`)
  }

  if (data.openOccurrences > 0) {
    parts.push(`Há ${data.openOccurrences} ocorrência${data.openOccurrences > 1 ? 's' : ''} em aberto que precisa${data.openOccurrences > 1 ? 'm' : ''} de atenção.`)
  } else {
    parts.push('Nenhuma ocorrência em aberto no momento.')
  }

  if (data.pendingApprovals > 0) {
    parts.push(`${data.pendingApprovals} aprovação${data.pendingApprovals > 1 ? 'ões pendentes aguardam' : ' pendente aguarda'} decisão do supervisor.`)
  }

  return parts.join(' ')
}

function buildTimeline(data: SummaryData): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...data.occurrences.map((o) => ({
      id: o.id,
      kind: 'occurrence' as const,
      description: `[Ocorrência] ${o.description || o.type}`,
      date: o.occurredAt,
    })),
    ...data.approvals.map((a) => ({
      id: a.id,
      kind: 'approval' as const,
      description: `[Aprovação] ${a.type} — ${a.staffName}`,
      date: a.requestedAt,
    })),
  ]

  return entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function EventSummaryPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!context?.eventId) return
    setLoading(true)
    try {
      const [team, occurrences, approvals, health] = await Promise.all([
        supervisorService.getTeamLive(context.eventId),
        supervisorService.getOccurrences(context.eventId),
        supervisorService.getApprovals(context.eventId),
        supervisorService.getHealthScore(context.eventId),
      ])

      setData({
        teamTotal: team.total,
        teamActive: team.active,
        openOccurrences: occurrences.filter((o) => o.status === 'open').length,
        pendingApprovals: approvals.filter((a) => a.status === 'pending').length,
        healthScore: health.score,
        healthGrade: health.grade,
        occurrences,
        approvals,
      })
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timer = setInterval(() => {
      load()
    }, 60_000)
    return () => clearInterval(timer)
  }, [load])

  const handleShare = async () => {
    if (!data) return
    const title = `Resumo do Evento — ${context?.eventName ?? 'Evento'}`
    const text = buildAutoText(data)

    if (navigator.share) {
      try {
        await navigator.share({ title, text })
      } catch {
        // user cancelled or not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${title}\n\n${text}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // clipboard not available
      }
    }
  }

  const activePercent = data && data.teamTotal > 0
    ? Math.round((data.teamActive / data.teamTotal) * 100)
    : 0

  const timeline = data ? buildTimeline(data) : []
  const summaryText = data ? buildAutoText(data) : ''

  return (
    <div className="min-h-screen bg-[#060d1f] pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/pulse/supervisor')}
            className="p-1.5 rounded-xl bg-white/5 border border-white/8 active:opacity-70"
          >
            <ChevronLeft size={18} className="text-slate-300" />
          </button>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">📊 Resumo do Evento</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Atualizado às {formatDateTime(lastUpdated.toISOString())}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl bg-white/5 border border-white/8 active:opacity-70 disabled:opacity-50"
        >
          <RefreshCw size={15} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
        </div>
      ) : data ? (
        <div className="px-4 space-y-4">

          {/* Health Grade card */}
          <div
            className="rounded-2xl border p-5 flex items-center gap-5"
            style={{
              borderColor: `${gradeColor(data.healthGrade)}33`,
              backgroundColor: `${gradeColor(data.healthGrade)}0a`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
              style={{
                backgroundColor: `${gradeColor(data.healthGrade)}20`,
                color: gradeColor(data.healthGrade),
              }}
            >
              {data.healthGrade}
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Health Score</p>
              <p className="text-white font-bold text-3xl mt-0.5">
                {data.healthScore}
                <span className="text-base font-normal text-slate-400 ml-1">/ 100</span>
              </p>
              <p className="text-slate-400 text-xs mt-1">{context?.eventName ?? '—'}</p>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Total de Staff',
                value: data.teamTotal,
                sub: `${data.teamActive} ativos`,
                color: '#7C3AED',
              },
              {
                label: 'Taxa de Check-in',
                value: `${activePercent}%`,
                sub: 'equipe ativa',
                color: activePercent >= 80 ? '#22C55E' : activePercent >= 60 ? '#d97706' : '#EF4444',
              },
              {
                label: 'Ocorrências Abertas',
                value: data.openOccurrences,
                sub: data.openOccurrences === 0 ? 'tudo ok' : 'requer atenção',
                color: data.openOccurrences === 0 ? '#22C55E' : '#EF4444',
              },
              {
                label: 'Aprovações Pendentes',
                value: data.pendingApprovals,
                sub: data.pendingApprovals === 0 ? 'nenhuma' : 'aguardando',
                color: data.pendingApprovals === 0 ? '#22C55E' : '#d97706',
              },
            ].map(({ label, value, sub, color }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/8 rounded-2xl p-4"
              >
                <p className="text-slate-400 text-xs leading-tight">{label}</p>
                <p className="font-bold text-2xl mt-1" style={{ color }}>{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">
              Últimos eventos
            </p>
            {timeline.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum evento registrado.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: entry.kind === 'occurrence' ? '#EF4444' : '#7C3AED',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-snug line-clamp-2">
                        {entry.description}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {formatDateTime(entry.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-generated summary */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">
              Resumo automático
            </p>
            <p className="text-slate-200 text-sm leading-relaxed">{summaryText}</p>
          </div>

          {/* Share / Export */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2.5 bg-[#d4ff00]/10 border border-[#d4ff00]/25 rounded-2xl py-3.5 active:opacity-70 transition-opacity"
          >
            {copied ? (
              <>
                <CheckCircle size={17} className="text-green-400" />
                <span className="text-green-400 font-semibold text-sm">Copiado!</span>
              </>
            ) : navigator.share ? (
              <>
                <Share2 size={17} className="text-[#d4ff00]" />
                <span className="text-[#d4ff00] font-semibold text-sm">Compartilhar resumo</span>
              </>
            ) : (
              <>
                <Copy size={17} className="text-[#d4ff00]" />
                <span className="text-[#d4ff00] font-semibold text-sm">Copiar resumo</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center py-24">
          <p className="text-slate-500 text-sm">Nenhum evento selecionado.</p>
        </div>
      )}
    </div>
  )
}
