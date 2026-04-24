import React, { useEffect, useState } from 'react'
import { ChevronLeft, ClipboardList, Clock, CheckCircle, Loader2, Calendar } from 'lucide-react'
import { staffService } from '@/core/staff/staff.service'
import { supabase } from '@/lib/supabase'
import type { StaffShift } from '@/core/staff/staff.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const ROLE_LABELS: Record<string, string> = {
  staff_member: 'Membro',
  gate_operator: 'Operador',
  supervisor: 'Supervisor',
  team_leader: 'Líder',
}

export default function StaffHistoryPage({ onNavigate }: PulsePageProps) {
  const [history, setHistory] = useState<StaffShift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      try {
        const data = await staffService.getShiftHistory(user.id, 20)
        setHistory(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmtTime = (s: string) => {
    if (!s) return '--:--'
    const d = new Date(s)
    if (isNaN(d.getTime())) return '--:--'
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const fmtDate = (s: string) => {
    if (!s) return '--/--'
    const d = new Date(s)
    if (isNaN(d.getTime())) return '--/--'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const calcHours = (start: string, end: string | null) => {
    if (!end) return null
    const diffMs = new Date(end).getTime() - new Date(start).getTime()
    const hours = Math.floor(diffMs / 3_600_000)
    const mins = Math.floor((diffMs % 3_600_000) / 60_000)
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Histórico de Turnos</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-green-400 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Calendar size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum turno registrado ainda</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {history.map((h) => {
            const duration = calcHours(h.startTime, h.endTime)
            const isActive = h.status === 'active'
            return (
              <div key={h.id} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{h.zone ?? ROLE_LABELS[h.role] ?? h.role}</p>
                    <p className="text-slate-400 text-xs">{h.eventName} · {fmtDate(h.startTime)}</p>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-2.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-[10px] font-semibold">Ativo</span>
                    </span>
                  ) : (
                    <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {fmtTime(h.startTime)}
                    {h.endTime ? ` – ${fmtTime(h.endTime)}` : ' – em andamento'}
                    {duration ? ` (${duration})` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
