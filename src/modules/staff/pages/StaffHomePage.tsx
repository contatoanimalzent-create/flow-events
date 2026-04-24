import React, { useEffect, useState } from 'react'
import { Clock, MapPin, FileText, AlertTriangle, ClipboardList, CheckCircle, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { staffService } from '@/core/staff/staff.service'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { StaffShift, StaffSession } from '@/core/staff/staff.service'

interface QuickCard {
  id: string; title: string; subtitle: string; icon: LucideIcon
  color: string; path: string; large?: boolean
}

const CARDS: QuickCard[] = [
  { id: 'shift', title: 'Meu Turno', subtitle: 'Ver detalhes', icon: Clock, color: '#22C55E', path: '/pulse/staff/shift', large: true },
  { id: 'presence', title: 'Presença', subtitle: 'Registrar presença', icon: MapPin, color: '#1e293b', path: '/pulse/staff/presence' },
  { id: 'instructions', title: 'Instruções', subtitle: 'Briefing e avisos', icon: FileText, color: '#1e293b', path: '/pulse/staff/instructions' },
  { id: 'occurrences', title: 'Ocorrências', subtitle: 'Registrar problema', icon: AlertTriangle, color: '#78350f', path: '/pulse/staff/occurrences' },
  { id: 'history', title: 'Histórico', subtitle: 'Turnos anteriores', icon: ClipboardList, color: '#1e293b', path: '/pulse/staff/history' },
]

function shiftProgress(start: string, end: string | null): number {
  if (!end) return 0
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now >= e) return 100
  if (now <= s) return 0
  return Math.round(((now - s) / (e - s)) * 100)
}

export default function StaffHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [shift, setShift] = useState<StaffShift | null>(null)
  const [session, setSession] = useState<StaffSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!error && user) setUserId(user.id)
      else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!userId || !context?.eventId) {
      if (!userId) return // wait for auth
      setLoading(false)
      return
    }
    setLoading(true)
    ;(async () => {
      try {
        const s = await staffService.getCurrentShift(userId, context.eventId)
        setShift(s)
        if (s) {
          try {
            const sess = await staffService.getActiveSession(s.id)
            setSession(sess)
          } catch {
            // session load failure is non-critical
          }
        }
      } catch {
        // shift load failure, leave shift as null (shows empty state)
      } finally {
        setLoading(false)
      }
    })()
  }, [userId, context?.eventId])

  const progress = shift ? shiftProgress(shift.startTime, shift.endTime) : 0
  const accent = '#22C55E'

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-slate-400 text-sm">Bem-vindo, Staff</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName ?? '-'}</h2>
      </div>

      {/* Shift status card */}
      <div className="px-4 mb-5">
        {loading ? (
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6 flex items-center justify-center">
            <Loader2 size={20} className="text-green-400 animate-spin" />
          </div>
        ) : shift ? (
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                  {shift.status === 'active' ? 'Turno Ativo' : shift.status === 'scheduled' ? 'Turno Agendado' : 'Turno Encerrado'}
                </p>
                <p className="text-white font-bold text-lg mt-0.5">{shift.zone ?? 'Sem zona definida'}</p>
                {shift.supervisorName && <p className="text-slate-400 text-xs">Supervisor: {shift.supervisorName}</p>}
              </div>
              {shift.status === 'active' && (
                <div className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">Ativo</span>
                </div>
              )}
            </div>
            <div className="flex gap-4 text-sm mb-3">
              <div>
                <p className="text-slate-400 text-xs">Início</p>
                <p className="text-white font-medium">
                  {new Date(shift.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {shift.endTime && (
                <div>
                  <p className="text-slate-400 text-xs">Fim</p>
                  <p className="text-white font-medium">
                    {new Date(shift.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs">Função</p>
                <p className="text-white font-medium capitalize">{shift.role.replace('_', ' ')}</p>
              </div>
            </div>
            {shift.endTime && (
              <>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: accent }} />
                </div>
                <p className="text-slate-500 text-xs mt-1">{progress}% do turno concluído</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 text-center">
            <p className="text-slate-400 text-sm">Nenhum turno ativo neste evento</p>
          </div>
        )}
      </div>

      {/* Presence status */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-4">
          <CheckCircle size={20} className={session ? 'text-green-400' : 'text-slate-600'} />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              {session ? 'Presença confirmada' : 'Presença não registrada'}
            </p>
            <p className="text-slate-400 text-xs">
              {session
                ? `Iniciada às ${new Date(session.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Registre sua presença ao chegar'}
            </p>
          </div>
          <button onClick={() => onNavigate('/pulse/staff/presence')} className="text-blue-400 text-xs font-medium">
            {session ? 'Ver' : 'Registrar'}
          </button>
        </div>
      </div>

      {/* Quick cards */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon
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
    </div>
  )
}
