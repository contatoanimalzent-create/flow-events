import React, { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, TrendingUp, Users, Clock, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { operatorService } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { FlowMetrics } from '@/core/operator/operator.service'

export default function FlowPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [metrics, setMetrics] = useState<FlowMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    if (!context?.eventId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const m = await operatorService.getFlowMetrics(context.eventId)
      setMetrics(m)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const totalValid = metrics?.totalValid ?? 0
  const totalInvalid = metrics?.totalInvalid ?? 0
  const total = totalValid + totalInvalid
  const rate = total > 0 ? ((totalValid / total) * 100).toFixed(1) : '0'

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Fluxo da Portaria</h1>
        <button onClick={load} className="p-2">
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      </div>

      {!context?.eventId ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum evento selecionado</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Erro ao carregar métricas.</p>
          <button onClick={load} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : metrics ? (
        <div className="px-4 space-y-4">
          {/* Main KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Check-ins válidos', value: totalValid.toLocaleString('pt-BR'), color: '#22C55E', Icon: Users },
              { label: 'Tentativas inválidas', value: totalInvalid.toLocaleString('pt-BR'), color: '#EF4444', Icon: TrendingUp },
              { label: 'Por minuto (agora)', value: metrics.perMinute.toString(), color: '#0057E7', Icon: Clock },
              { label: 'Taxa de sucesso', value: `${rate}%`, color: metrics.totalInvalid > 5 ? '#d97706' : '#22C55E', Icon: TrendingUp },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color }} />
                  <p className="text-slate-400 text-xs">{label}</p>
                </div>
                <p className="text-white font-bold text-2xl" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs">Taxa de aprovação</p>
              <p className="text-white font-bold text-sm">{rate}%</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rate}%`,
                  backgroundColor: Number(rate) > 90 ? '#22C55E' : Number(rate) > 70 ? '#d97706' : '#EF4444',
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-slate-500 text-xs">{totalValid} válidos</span>
              <span className="text-slate-500 text-xs">{totalInvalid} inválidos</span>
            </div>
          </div>

          {/* Pending sync */}
          {metrics.syncPending > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <p className="text-amber-400 text-sm font-medium">⚡ {metrics.syncPending} ação{metrics.syncPending > 1 ? 'ões' : ''} pendente{metrics.syncPending > 1 ? 's' : ''} de sincronização</p>
              <p className="text-amber-500/70 text-xs mt-0.5">Serão enviadas quando houver conexão</p>
            </div>
          )}

          <p className="text-slate-600 text-xs text-center">Atualiza automaticamente a cada 30s</p>
        </div>
      ) : (
        <p className="text-slate-600 text-sm text-center py-10">Não foi possível carregar métricas</p>
      )}
    </div>
  )
}
