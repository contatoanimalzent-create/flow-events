import React, { useEffect, useState, useCallback } from 'react'
import {
  ScanLine, History, BarChart2, Search, BellRing, Monitor,
  CheckCircle, XCircle, Clock, TrendingUp, Wifi, WifiOff, RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { useOffline } from '@/core/offline/offline.store'
import { operatorService } from '@/core/operator/operator.service'
import { useRealtimeCheckins } from '@/core/realtime/realtime.hooks'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { CheckinRecord, FlowMetrics } from '@/core/operator/operator.service'

const ICON_MAP: Record<string, LucideIcon> = {
  ScanLine, History, BarChart2, Search, BellRing, Monitor,
}

interface QuickCard {
  id: string; title: string; subtitle: string; icon: string; color: string; path: string; large?: boolean
}

const CARDS: QuickCard[] = [
  { id: 'scanner', title: 'Scanner QR', subtitle: 'Validar ingressos', icon: 'ScanLine', color: '#0057E7', path: '/pulse/operator/scanner', large: true },
  { id: 'history', title: 'Histórico', subtitle: 'Últimas leituras', icon: 'History', color: '#1e293b', path: '/pulse/operator/history' },
  { id: 'flow', title: 'Fluxo', subtitle: 'Métricas ao vivo', icon: 'BarChart2', color: '#1e293b', path: '/pulse/operator/flow' },
  { id: 'manual', title: 'Busca Manual', subtitle: 'Nome / CPF / e-mail', icon: 'Search', color: '#1e293b', path: '/pulse/operator/manual-check' },
  { id: 'alerts', title: 'Alertas', subtitle: 'Tentativas inválidas', icon: 'BellRing', color: '#7f1d1d', path: '/pulse/operator/alerts' },
  { id: 'kiosk', title: 'Modo Kiosk', subtitle: 'Scanner fixo / totem', icon: 'Monitor', color: '#0f2027', path: '/pulse/kiosk' },
]

export default function OperatorHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const { isOnline, pendingCount } = useOffline()

  const [metrics, setMetrics] = useState<FlowMetrics>({ totalValid: 0, totalInvalid: 0, perMinute: 0, syncPending: 0 })
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!context?.eventId) return
    try {
      const [m, history] = await Promise.all([
        operatorService.getFlowMetrics(context.eventId),
        operatorService.getCheckinHistory(context.eventId, 5),
      ])
      setMetrics({ ...m, syncPending: pendingCount })
      setRecentCheckins(history)
    } catch (err) {
      console.error('[operator-home] load error', err)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId, pendingCount])

  useEffect(() => { loadData() }, [loadData])

  // Realtime: update count on new checkin
  useRealtimeCheckins(context?.eventId, (checkin) => {
    setMetrics((m) => ({ ...m, totalValid: m.totalValid + 1 }))
    setRecentCheckins((prev) => [
      {
        id: `rt-${Date.now()}`,
        attendeeName: checkin.attendeeName,
        ticketLabel: checkin.ticketType,
        validAt: new Date().toISOString(),
        valid: true,
        gate: checkin.gate,
      },
      ...prev.slice(0, 4),
    ])
  })

  const rate = metrics.totalValid + metrics.totalInvalid > 0
    ? ((metrics.totalValid / (metrics.totalValid + metrics.totalInvalid)) * 100).toFixed(1)
    : '—'

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">Portaria ativa</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName ?? '—'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isOnline
              ? <span className="flex items-center gap-1 text-green-400 text-xs"><Wifi size={12} /> Online</span>
              : <span className="flex items-center gap-1 text-amber-400 text-xs"><WifiOff size={12} /> Offline</span>
            }
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
            <button onClick={loadData} className="p-1.5 rounded-lg bg-white/5">
              <RefreshCw size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-5">
        {[
          { label: 'Válidos', value: loading ? '…' : metrics.totalValid.toLocaleString('pt-BR'), Icon: CheckCircle, color: '#22C55E' },
          { label: 'Inválidos', value: loading ? '…' : metrics.totalInvalid.toString(), Icon: XCircle, color: '#EF4444' },
          { label: '/min', value: loading ? '…' : metrics.perMinute.toString(), Icon: Clock, color: '#d97706' },
          { label: 'Taxa', value: loading ? '…' : `${rate}%`, Icon: TrendingUp, color: '#0057E7' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <Icon size={14} style={{ color }} />
            <p className="text-white font-bold text-base leading-none">{value}</p>
            <p className="text-slate-500 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-5">
        {CARDS.map((card) => {
          const Icon = ICON_MAP[card.icon] ?? ScanLine
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.path)}
              className={`rounded-2xl p-4 text-left active:opacity-80 transition-opacity ${card.large ? 'col-span-2' : ''}`}
              style={{ backgroundColor: card.color + 'CC', border: `1px solid ${card.color}44` }}
            >
              <Icon size={card.large ? 28 : 22} className="text-white/80 mb-3" />
              <p className="text-white font-bold text-sm">{card.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{card.subtitle}</p>
            </button>
          )
        })}
      </div>

      {/* Recent checkins */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Últimos check-ins</p>
          <button onClick={() => onNavigate('/pulse/operator/history')} className="text-blue-400 text-xs">Ver todos</button>
        </div>
        {recentCheckins.length === 0 && !loading && (
          <p className="text-slate-600 text-sm text-center py-6">Nenhum check-in ainda</p>
        )}
        <div className="space-y-2">
          {recentCheckins.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full shrink-0 bg-green-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{entry.attendeeName}</p>
                <p className="text-slate-500 text-xs">{entry.ticketLabel}{entry.gate ? ` · ${entry.gate}` : ''}</p>
              </div>
              <span className="text-slate-500 text-xs shrink-0">
                {new Date(entry.validAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
