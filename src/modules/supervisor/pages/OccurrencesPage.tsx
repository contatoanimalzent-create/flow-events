import React, { useState } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const OCCURRENCES = [
  { id: 1, staff: 'Ana Paula Santos', type: 'Participante', desc: 'Participante sem ingresso alegando perda de celular', time: '14:32', zone: 'Portaria Principal', resolved: false },
  { id: 2, staff: 'Carla Santos', type: 'Equipamento', desc: 'Scanner com bateria baixa — trocado por reserva', time: '14:10', zone: 'Portaria Lateral', resolved: false },
  { id: 3, staff: 'Bruno Alves', type: 'Incidente', desc: 'Conflito verbal entre participantes na fila. Resolvido com mediação.', time: '13:45', zone: 'Portaria Principal', resolved: true },
  { id: 4, staff: 'Ricardo Souza', type: 'Acesso', desc: 'Tentativa de acesso com ingresso duplicado detectada', time: '13:20', zone: 'Apoio VIP', resolved: true },
]

export default function OccurrencesPage({ onNavigate }: PulsePageProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Ocorrências</h1>
        <span className="ml-auto text-slate-400 text-sm">{OCCURRENCES.length} registradas</span>
      </div>

      <div className="px-4 space-y-2">
        {OCCURRENCES.map((occ) => (
          <div
            key={occ.id}
            className={`rounded-2xl border overflow-hidden ${occ.resolved ? 'border-white/6 bg-white/3' : 'border-yellow-500/20 bg-yellow-500/5'}`}
          >
            <button
              onClick={() => setExpandedId(expandedId === occ.id ? null : occ.id)}
              className="w-full flex items-start gap-3 px-4 py-4 text-left"
            >
              <AlertTriangle
                size={16}
                className={`shrink-0 mt-0.5 ${occ.resolved ? 'text-slate-500' : 'text-yellow-400'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${occ.resolved ? 'bg-white/8 text-slate-400' : 'bg-yellow-400/15 text-yellow-400'}`}>
                    {occ.type}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${occ.resolved ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {occ.resolved ? 'Resolvido' : 'Aberto'}
                  </span>
                </div>
                <p className={`text-sm font-medium ${occ.resolved ? 'text-slate-400' : 'text-white'}`}>
                  {occ.staff}
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                  <Clock size={10} />
                  {occ.time} · {occ.zone}
                </div>
              </div>
              {expandedId === occ.id
                ? <ChevronUp size={14} className="text-slate-500 shrink-0 mt-1" />
                : <ChevronDown size={14} className="text-slate-500 shrink-0 mt-1" />
              }
            </button>
            {expandedId === occ.id && (
              <div className="px-4 pb-4 border-t border-white/5">
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">{occ.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
