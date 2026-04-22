import React from 'react'
import { ChevronLeft, ClipboardList, Clock, CheckCircle } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const HISTORY = [
  { date: '24/04', shift: 'Portaria Principal', team: 'Equipe Alfa', start: '13:00', end: '21:00', hours: 8, occurrences: 1 },
  { date: '23/04', shift: 'Apoio VIP', team: 'Equipe Beta', start: '10:00', end: '18:00', hours: 8, occurrences: 0 },
  { date: '22/04', shift: 'Portaria Lateral', team: 'Equipe Alfa', start: '15:00', end: '23:00', hours: 8, occurrences: 2 },
]

export default function StaffHistoryPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Histórico de Turnos</h1>
      </div>

      <div className="px-4 space-y-3">
        {HISTORY.map((h, i) => (
          <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{h.shift}</p>
                <p className="text-slate-400 text-xs">{h.team} · {h.date}</p>
              </div>
              <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock size={12} />
                {h.start} – {h.end} ({h.hours}h)
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <ClipboardList size={12} />
                {h.occurrences} ocorrência{h.occurrences !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
