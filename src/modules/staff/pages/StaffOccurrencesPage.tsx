import React, { useState, useEffect } from 'react'
import { ChevronLeft, AlertTriangle, Plus, Send, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { staffService } from '@/core/staff/staff.service'
import { useOffline } from '@/core/offline/offline.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { StaffOccurrence } from '@/core/staff/staff.service'

const OCCURRENCE_TYPES = [
  { value: 'incident', label: 'Incidente', color: '#EF4444' },
  { value: 'delay', label: 'Atraso', color: '#d97706' },
  { value: 'absence', label: 'Ausência', color: '#F97316' },
  { value: 'block', label: 'Bloqueio', color: '#7C3AED' },
  { value: 'observation', label: 'Observação', color: '#4285F4' },
]

export default function StaffOccurrencesPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()
  const [occurrences, setOccurrences] = useState<StaffOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('observation')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [staffMemberId, setStaffMemberId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user || !context?.eventId) { setLoading(false); return }
        const shift = await staffService.getCurrentShift(user.id, context.eventId)
        if (shift) {
          setStaffMemberId(shift.id)
          const data = await staffService.getOccurrences(shift.id, context.eventId)
          setOccurrences(data)
        }
      } catch (err) {
        console.error('[occurrences] init error', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [context?.eventId])

  const handleSend = async () => {
    if (!description.trim() || !staffMemberId || !context?.eventId) return
    setSending(true)
    try {
      if (isOnline) {
        await staffService.createOccurrence(staffMemberId, context.eventId, type, description)
        const updated = await staffService.getOccurrences(staffMemberId, context.eventId)
        setOccurrences(updated)
      } else {
        enqueue('occurrence', { staffMemberId, eventId: context.eventId, type, description })
        setOccurrences((prev) => [{
          id: `offline-${Date.now()}`,
          type, description,
          occurredAt: new Date().toISOString(),
          status: 'open',
          location: null,
        }, ...prev])
      }
      setDescription('')
      setShowForm(false)
    } catch (err) {
      console.error('[occurrence]', err)
    } finally {
      setSending(false)
    }
  }

  const typeConfig = (t: string) => OCCURRENCE_TYPES.find((o) => o.value === t) ?? OCCURRENCE_TYPES[4]

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Ocorrências</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/30 px-3 py-1.5 rounded-xl text-green-400 text-xs font-semibold"
        >
          <Plus size={14} />
          Nova
        </button>
      </div>

      {/* New occurrence form */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-white font-semibold text-sm">Nova ocorrência</p>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2">
              {OCCURRENCE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    backgroundColor: type === t.value ? t.color + '33' : 'transparent',
                    borderColor: type === t.value ? t.color : '#ffffff22',
                    color: type === t.value ? t.color : '#94a3b8',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que ocorreu…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 resize-none outline-none focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!description.trim() || sending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {occurrences.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertTriangle size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma ocorrência registrada</p>
            </div>
          )}
          {occurrences.map((o) => {
            const tc = typeConfig(o.type)
            return (
              <div key={o.id} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: tc.color + '22', color: tc.color }}
                  >
                    {tc.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {o.status === 'resolved'
                      ? <CheckCircle size={12} className="text-green-400" />
                      : <div className="w-2 h-2 rounded-full bg-amber-400" />
                    }
                    <span className="text-slate-500 text-[10px]">{o.status === 'resolved' ? 'Resolvida' : 'Em aberto'}</span>
                  </div>
                </div>
                <p className="text-white text-sm">{o.description}</p>
                <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
                  <Clock size={10} />
                  {new Date(o.occurredAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
