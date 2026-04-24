import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { supervisorService } from '@/core/supervisor/supervisor.service'
import { supabase } from '@/lib/supabase'
import type { SupervisorOccurrence } from '@/core/supervisor/supervisor.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function OccurrencesPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [occurrences, setOccurrences] = useState<SupervisorOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [resolving, setResolving] = useState<string | null>(null)

  const load = async () => {
    if (!context?.eventId) { setLoading(false); return }
    try {
      const data = await supervisorService.getOccurrences(context.eventId)
      setOccurrences(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [context?.eventId])

  const handleResolve = async (id: string) => {
    setResolving(id)
    try {
      await supervisorService.resolveOccurrence(id)
      setOccurrences((prev) =>
        prev.map((o) => o.id === id ? { ...o, status: 'resolved' } : o)
      )
    } finally {
      setResolving(null)
    }
  }

  const open = occurrences.filter((o) => o.status === 'open')
  const resolved = occurrences.filter((o) => o.status === 'resolved')

  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const OccurrenceCard = ({ occ }: { occ: SupervisorOccurrence }) => {
    const isExpanded = expandedId === occ.id
    const isOpen = occ.status === 'open'

    return (
      <div className={`rounded-2xl border overflow-hidden ${isOpen ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/6 bg-white/3'}`}>
        <button
          onClick={() => setExpandedId(isExpanded ? null : occ.id)}
          className="w-full flex items-start gap-3 px-4 py-4 text-left"
        >
          <AlertTriangle
            size={16}
            className={`shrink-0 mt-0.5 ${isOpen ? 'text-yellow-400' : 'text-slate-500'}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isOpen ? 'bg-yellow-400/15 text-yellow-400' : 'bg-white/8 text-slate-400'}`}>
                {occ.type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isOpen ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                {isOpen ? 'Aberto' : 'Resolvido'}
              </span>
            </div>
            <p className={`text-sm font-medium ${isOpen ? 'text-white' : 'text-slate-400'}`}>
              {occ.staffName}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {fmtTime(occ.occurredAt)}{occ.zone ? ` · ${occ.zone}` : ''}
            </p>
          </div>
          {isExpanded
            ? <ChevronUp size={14} className="text-slate-500 shrink-0 mt-1" />
            : <ChevronDown size={14} className="text-slate-500 shrink-0 mt-1" />
          }
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-white/5">
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">{occ.description}</p>
            {isOpen && (
              <button
                onClick={() => handleResolve(occ.id)}
                disabled={resolving === occ.id}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-semibold"
              >
                {resolving === occ.id
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CheckCircle2 size={12} />
                }
                {resolving === occ.id ? 'Resolvendo...' : 'Marcar como resolvida'}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Ocorrências</h1>
        {!loading && (
          <span className="ml-auto text-slate-400 text-sm">{occurrences.length} registrada{occurrences.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : occurrences.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <AlertTriangle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma ocorrência registrada</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {open.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                Abertas · {open.length}
              </p>
              <div className="space-y-2">
                {open.map((o) => <OccurrenceCard key={o.id} occ={o} />)}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                Resolvidas · {resolved.length}
              </p>
              <div className="space-y-2 opacity-60">
                {resolved.map((o) => <OccurrenceCard key={o.id} occ={o} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
