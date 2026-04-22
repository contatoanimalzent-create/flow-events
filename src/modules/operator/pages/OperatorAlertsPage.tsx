import React, { useState } from 'react'
import { ChevronLeft, AlertTriangle, XCircle, ShieldAlert, CheckCircle } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const ALERTS = [
  { id: 1, type: 'invalid', message: 'Token inválido detectado', time: '14:28', resolved: false },
  { id: 2, type: 'duplicate', message: 'Ingresso #0042 já utilizado — tentativa duplicada', time: '14:22', resolved: false },
  { id: 3, type: 'invalid', message: 'Token inválido detectado', time: '14:10', resolved: true },
  { id: 4, type: 'suspect', message: 'Múltiplas tentativas inválidas — mesmo dispositivo', time: '13:55', resolved: false },
  { id: 5, type: 'invalid', message: 'Token inválido detectado', time: '13:41', resolved: true },
]

export default function OperatorAlertsPage({ onNavigate }: PulsePageProps) {
  const [resolved, setResolved] = useState<Set<number>>(
    new Set(ALERTS.filter((a) => a.resolved).map((a) => a.id))
  )

  const pending = ALERTS.filter((a) => !resolved.has(a.id))
  const done = ALERTS.filter((a) => resolved.has(a.id))

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Alertas</h1>
        {pending.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

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
                {alert.type === 'suspect'
                  ? <ShieldAlert size={16} className="text-orange-400 shrink-0 mt-0.5" />
                  : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{alert.time}</p>
                </div>
                <button
                  onClick={() => setResolved((s) => new Set([...s, alert.id]))}
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
                  <p className="text-slate-400 text-sm">{alert.message}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
