import React, { useState } from 'react'
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const APPROVALS = [
  { id: 1, staff: 'Diego Mota', type: 'Saída antecipada', reason: 'Emergência médica familiar', time: '14:15', urgent: true },
  { id: 2, staff: 'Fernanda Lima', type: 'Troca de zona', reason: 'Solicita transferência para Portaria Principal', time: '13:52', urgent: false },
  { id: 3, staff: 'Ana Paula Santos', type: 'Pausa extra', reason: 'Solicita 15min adicionais de intervalo', time: '13:30', urgent: false },
]

export default function ApprovalsPage({ onNavigate }: PulsePageProps) {
  const [decided, setDecided] = useState<Record<number, 'approved' | 'denied'>>({})

  const pending = APPROVALS.filter((a) => !decided[a.id])
  const done = APPROVALS.filter((a) => !!decided[a.id])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Aprovações</h1>
        {pending.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="px-4 mb-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Pendentes</p>
          <div className="space-y-3">
            {pending.map((ap) => (
              <div
                key={ap.id}
                className={`rounded-2xl border p-4 ${ap.urgent ? 'border-red-500/25 bg-red-500/5' : 'border-white/8 bg-white/4'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">{ap.staff}</p>
                      {ap.urgent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                          URGENTE
                        </span>
                      )}
                    </div>
                    <p className="text-blue-400 text-xs font-medium">{ap.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock size={10} />
                    {ap.time}
                  </div>
                </div>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">{ap.reason}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDecided((d) => ({ ...d, [ap.id]: 'denied' }))}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} />
                    Negar
                  </button>
                  <button
                    onClick={() => setDecided((d) => ({ ...d, [ap.id]: 'approved' }))}
                    className="flex-1 py-2.5 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="px-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Resolvidas</p>
          <div className="space-y-2">
            {done.map((ap) => (
              <div key={ap.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3 opacity-70">
                {decided[ap.id] === 'approved'
                  ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                  : <XCircle size={14} className="text-red-400 shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{ap.staff} · {ap.type}</p>
                  <p className="text-slate-500 text-xs">{decided[ap.id] === 'approved' ? 'Aprovado' : 'Negado'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <CheckCircle size={40} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma solicitação pendente</p>
        </div>
      )}
    </div>
  )
}
