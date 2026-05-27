import React, { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, AlertTriangle, XCircle, ShieldAlert, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface CheckinAlert {
  id: string
  reasonCode: string
  reason: string
  gate: string | null
  checkedInAt: string
  holderName: string | null
}

const reasonLabel = (r: string): string => {
  const map: Record<string, string> = {
    ticket_not_found: 'Token não encontrado',
    already_checked_in: 'Ingresso já utilizado',
    ticket_cancelled: 'Ingresso cancelado',
    ticket_refunded: 'Ingresso reembolsado',
    ticket_expired: 'Ingresso expirado',
    ticket_blocked: 'Ingresso bloqueado',
    duplicate_exit: 'Saída duplicada',
    exit_without_entry: 'Saída sem entrada',
  }
  return map[r] ?? r
}

export default function OperatorAlertsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [alerts, setAlerts] = useState<CheckinAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    if (!context?.eventId) { setLoading(false); return }
    setLoading(true)
    setError(false)
    try {
      const { data, error: queryError } = await supabase
        .from('checkins')
        .select('id, reason_code, result, checked_in_at, gate:gates(name), digital_ticket:digital_tickets(holder_name)')
        .eq('event_id', context.eventId)
        .neq('result', 'success')
        .order('checked_in_at', { ascending: false })
        .limit(50)

      if (queryError) throw queryError

      if (data) {
        const parsed = (data as any[]).map((a) => ({
          id: a.id,
          reasonCode: a.reason_code ?? 'unknown',
          reason: reasonLabel(a.reason_code ?? 'unknown'),
          gate: a.gate?.name ?? null,
          checkedInAt: a.checked_in_at,
          holderName: a.digital_ticket?.holder_name ?? null,
        }))
        setAlerts(parsed)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => { load() }, [load])

  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Alertas</h1>
        {!loading && alerts.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            {alerts.length}
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
        <div className="px-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
            Tentativas negadas
          </p>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3"
              >
                <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{alert.reason}</p>
                  {alert.holderName && (
                    <p className="text-slate-400 text-xs mt-0.5">{alert.holderName}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-0.5">
                    {fmtTime(alert.checkedInAt)}{alert.gate ? ` · ${alert.gate}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
