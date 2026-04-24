import React, { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, AlertTriangle, XCircle, ShieldAlert, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface CheckinAttempt {
  id: string
  token: string | null
  reason: string
  gate: string | null
  attemptedAt: string
  resolved: boolean
}

const reasonLabel = (r: string): string => {
  const map: Record<string, string> = {
    not_found: 'Token não encontrado',
    already_used: 'Ingresso já utilizado',
    wrong_event: 'Ingresso de outro evento',
    invalid_token: 'Token inválido',
    gate_mismatch: 'Portaria incorreta',
    unauthorized: 'Acesso não autorizado',
  }
  return map[r] ?? r
}

export default function OperatorAlertsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [alerts, setAlerts] = useState<CheckinAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!context?.eventId) { setLoading(false); return }
    setLoading(true)
    setError(false)
    try {
      const { data, error: queryError } = await supabase
        .from('checkin_attempts')
        .select('id, qr_token, reason, gate, attempted_at, resolved')
        .eq('event_id', context.eventId)
        .eq('valid', false)
        .order('attempted_at', { ascending: false })
        .limit(50)

      if (queryError) throw queryError

      if (data) {
        const parsed = (data as any[]).map((a) => ({
          id: a.id,
          token: a.qr_token ?? null,
          reason: reasonLabel(a.reason ?? 'invalid_token'),
          gate: a.gate ?? null,
          attemptedAt: a.attempted_at,
          resolved: a.resolved ?? false,
        }))
        setAlerts(parsed)
        setResolvedIds(new Set(parsed.filter((a) => a.resolved).map((a) => a.id)))
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => { load() }, [load])

  const isSuspect = (a: CheckinAttempt) =>
    a.reason.includes('não autorizado') || a.reason.includes('portaria')

  const handleResolve = async (id: string) => {
    setResolvedIds((s) => new Set([...s, id]))
    try {
      await supabase.from('checkin_attempts').update({ resolved: true }).eq('id', id)
    } catch {
      // Optimistic, revert if needed
      setResolvedIds((s) => { const next = new Set(s); next.delete(id); return next })
    }
  }

  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const pending = alerts.filter((a) => !resolvedIds.has(a.id))
  const done = alerts.filter((a) => resolvedIds.has(a.id))

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Alertas</h1>
        {!loading && pending.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!context?.eventId ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum evento selecionado</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Erro ao carregar alertas.</p>
          <button onClick={load} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <CheckCircle size={36} className="text-green-600 mb-3" />
          <p className="text-white font-semibold mb-1">Sem alertas</p>
          <p className="text-slate-400 text-sm">Nenhuma tentativa inválida registrada</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="px-4 mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Pendentes</p>
              <div className="space-y-2">
                {pending.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3"
                  >
                    {isSuspect(alert)
                      ? <ShieldAlert size={16} className="text-orange-400 shrink-0 mt-0.5" />
                      : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{alert.reason}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {fmtTime(alert.attemptedAt)}{alert.gate ? ` · ${alert.gate}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white/8 text-slate-300 text-xs font-medium"
                    >
                      Resolver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {done.length > 0 && (
            <div className="px-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Resolvidos</p>
              <div className="space-y-2">
                {done.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-3 opacity-60"
                  >
                    <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-sm">{alert.reason}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{fmtTime(alert.attemptedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
