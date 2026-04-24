import React, { useState, useEffect } from 'react'
import { ChevronLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import { supabase } from '@/lib/supabase'
import type { SupervisorApproval } from '@/core/supervisor/supervisor.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const TYPE_LABELS: Record<string, string> = {
  area_change: 'Mudança de área',
  early_exit: 'Saída antecipada',
  late_arrival: 'Entrada com atraso',
  overtime: 'Hora extra',
  absence: 'Ausência',
}

export default function ApprovalsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [approvals, setApprovals] = useState<SupervisorApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const load = async () => {
    if (!context?.eventId) return
    setLoading(true)
    try {
      const data = await supervisorService.getApprovals(context.eventId)
      setApprovals(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [context?.eventId])

  const handle = async (id: string, approved: boolean) => {
    if (!userId) return
    setProcessingId(id)
    try {
      await supervisorService.resolveApproval(id, approved, userId)
      setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: approved ? 'approved' : 'rejected' } : a))
    } finally {
      setProcessingId(null)
    }
  }

  const pending = approvals.filter((a) => a.status === 'pending')
  const resolved = approvals.filter((a) => a.status !== 'pending')

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Aprovações</h1>
        {pending.length > 0 && (
          <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Pendentes</p>
              <div className="space-y-3">
                {pending.map((a) => (
                  <div key={a.id} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{a.staffName}</p>
                        <p className="text-amber-400 text-xs">{TYPE_LABELS[a.type] ?? a.type}</p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock size={10} />
                        {new Date(a.requestedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {a.reason && <p className="text-slate-300 text-xs mb-3 bg-white/5 rounded-lg px-3 py-2">"{a.reason}"</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handle(a.id, false)}
                        disabled={processingId === a.id}
                        className="flex-1 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        {processingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Recusar
                      </button>
                      <button
                        onClick={() => handle(a.id, true)}
                        disabled={processingId === a.id}
                        className="flex-1 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        {processingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Aprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Resolvidas</p>
              <div className="space-y-2">
                {resolved.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                    {a.status === 'approved'
                      ? <CheckCircle size={16} className="text-green-400 shrink-0" />
                      : <XCircle size={16} className="text-red-400 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.staffName}</p>
                      <p className="text-slate-500 text-xs">{TYPE_LABELS[a.type] ?? a.type}</p>
                    </div>
                    <span className={`text-xs font-semibold ${a.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {a.status === 'approved' ? 'Aprovado' : 'Recusado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvals.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle size={36} className="text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma aprovação pendente</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
