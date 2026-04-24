import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, FileText, AlertTriangle, Loader2, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { staffService } from '@/core/staff/staff.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { StaffInstruction } from '@/core/staff/staff.service'

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', color: '#4285F4' },
  high: { label: 'Importante', color: '#d97706' },
  critical: { label: 'Crítico', color: '#EF4444' },
}

export default function StaffInstructionsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [instructions, setInstructions] = useState<StaffInstruction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!context?.eventId) { setLoading(false); return }
    setLoading(true)
    setError(false)
    try {
      const data = await staffService.getInstructions(context.eventId)
      setInstructions(data)
      // Auto-expand critical ones
      const critical = data.find((i) => i.priority === 'critical')
      if (critical) setExpanded(critical.id)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [context?.eventId])

  useEffect(() => { load() }, [load])

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Instruções</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Erro ao carregar dados.</p>
          <button onClick={load} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : !context?.eventId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <AlertCircle size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum evento selecionado</p>
        </div>
      ) : instructions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <FileText size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma instrução disponível</p>
          <p className="text-slate-600 text-xs mt-1">O supervisor ainda não publicou instruções</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {instructions.map((item) => {
            const pc = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.normal
            const isOpen = expanded === item.id
            return (
              <div
                key={item.id}
                className="bg-white/5 border rounded-2xl overflow-hidden"
                style={{ borderColor: item.priority === 'critical' ? '#EF444433' : '#ffffff10' }}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                >
                  {item.priority === 'critical'
                    ? <AlertTriangle size={16} style={{ color: pc.color }} className="shrink-0" />
                    : <FileText size={16} style={{ color: pc.color }} className="shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                        style={{ backgroundColor: pc.color + '22', color: pc.color }}
                      >
                        {pc.label}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} className="text-slate-500 shrink-0" />
                    : <ChevronDown size={16} className="text-slate-500 shrink-0" />
                  }
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/8">
                    <p className="text-slate-300 text-sm leading-relaxed pt-3 whitespace-pre-wrap">{item.body}</p>
                    <p className="text-slate-600 text-xs mt-3">
                      {new Date(item.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
