import React, { useEffect, useState } from 'react'
import { ChevronLeft, Clock, Users, MapPin, FileText, Loader2, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { staffService } from '@/core/staff/staff.service'
import { supabase } from '@/lib/supabase'
import type { StaffShift } from '@/core/staff/staff.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface Teammate {
  name: string
  role: string
  zone: string | null
  isActive: boolean
}

const ROLE_LABELS: Record<string, string> = {
  staff_member: 'Membro',
  gate_operator: 'Operador',
  supervisor: 'Supervisor',
  team_leader: 'Líder',
}

export default function MyShiftPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [shift, setShift] = useState<StaffShift | null>(null)
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user || !context?.eventId) { setLoading(false); return }

        const s = await staffService.getCurrentShift(user.id, context.eventId)
        setShift(s)

        if (s?.zone) {
          // Load teammates in the same zone
          try {
            const { data: members } = await supabase
              .from('staff_members')
              .select(`
                id, role, zone, status, user_id,
                profiles!user_id(full_name),
                staff_sessions(status)
              `)
              .eq('event_id', context.eventId)
              .eq('zone', s.zone)
              .neq('user_id', user.id)
              .limit(10)

            if (members) {
              setTeammates((members as any[]).map((m) => ({
                name: (m.profiles as any)?.full_name ?? 'Membro',
                role: m.role ?? 'staff_member',
                zone: m.zone ?? null,
                isActive: ((m.staff_sessions as any[]) ?? []).some((ss: any) => ss.status === 'active'),
              })))
            }
          } catch {
            // Teammates load failure is non-critical, show shift info without team
          }
        }
      } catch (err) {
        console.error('[my-shift] load error', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const shiftProgress = () => {
    if (!shift?.startTime || !shift?.endTime) return null
    const start = new Date(shift.startTime).getTime()
    const end = new Date(shift.endTime).getTime()
    const now = Date.now()
    const pct = Math.min(Math.max((now - start) / (end - start), 0), 1)
    const remaining = Math.max(end - now, 0)
    const remH = Math.floor(remaining / 3_600_000)
    const remM = Math.floor((remaining % 3_600_000) / 60_000)
    return { pct, label: remH > 0 ? `${remH}h${remM}m restantes` : `${remM}min restantes` }
  }

  const progress = shiftProgress()

  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-[#060d1f]">
        <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
          <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
            <ChevronLeft size={22} className="text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-white">Meu Turno</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-green-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Meu Turno</h1>
      </div>

      {!shift ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum turno encontrado para este evento</p>
        </div>
      ) : (
        <>
          {/* Shift card */}
          <div className="px-4 mb-5">
            <div className={`bg-gradient-to-br border rounded-2xl p-5 ${
              shift.status === 'active'
                ? 'from-green-900/40 to-slate-900 border-green-500/20'
                : 'from-slate-800/40 to-slate-900 border-white/10'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${shift.status === 'active' ? 'text-green-400' : 'text-slate-400'}`}>
                    {shift.status === 'active' ? 'Turno Ativo' : shift.status === 'scheduled' ? 'Turno Agendado' : 'Turno Concluído'}
                  </p>
                  <p className="text-white font-bold text-xl mt-1">{shift.zone ?? ROLE_LABELS[shift.role] ?? shift.role}</p>
                  {shift.supervisorName && (
                    <p className="text-slate-400 text-sm mt-0.5">Supervisor: {shift.supervisorName}</p>
                  )}
                </div>
                {shift.status === 'active' && (
                  <span className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-semibold">Ativo</span>
                  </span>
                )}
              </div>

              {/* Time info */}
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-slate-400 text-xs">Início</p>
                  <p className="text-white font-bold text-lg">{fmtTime(shift.startTime)}</p>
                </div>
                {shift.endTime && (
                  <div>
                    <p className="text-slate-400 text-xs">Fim</p>
                    <p className="text-white font-bold text-lg">{fmtTime(shift.endTime)}</p>
                  </div>
                )}
              </div>

              {/* Progress */}
              {progress && shift.status === 'active' && (
                <>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${progress.pct * 100}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5">
                    {Math.round(progress.pct * 100)}% concluído · {progress.label}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Zone */}
          {shift.zone && (
            <div className="px-4 mb-5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-4">
                <MapPin size={20} className="text-blue-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{shift.zone}</p>
                  <p className="text-slate-400 text-xs">Sua zona de atuação</p>
                </div>
              </div>
            </div>
          )}

          {/* Teammates */}
          {teammates.length > 0 && (
            <div className="px-4 mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                <Users size={12} />
                Minha equipe na zona
              </p>
              <div className="space-y-2">
                {teammates.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                      {t.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-slate-500 text-xs">{ROLE_LABELS[t.role] ?? t.role}</p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.isActive ? '#22C55E' : '#d97706' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions quick access */}
          <div className="px-4">
            <button
              onClick={() => onNavigate('/pulse/staff/instructions')}
              className="w-full flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-4 active:bg-white/10"
            >
              <FileText size={18} className="text-blue-400 shrink-0" />
              <p className="text-white text-sm font-medium flex-1 text-left">Ver instruções do turno</p>
              <ChevronLeft size={16} className="text-slate-500 rotate-180" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
