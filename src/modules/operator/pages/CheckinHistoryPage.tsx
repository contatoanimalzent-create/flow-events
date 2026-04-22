import React, { useState } from 'react'
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const MOCK = [
  { id: 1, name: 'Ana Paula Santos', ticket: 'STANDARD #0042', valid: true, time: '14:32:05' },
  { id: 2, name: 'Carlos Mendes', ticket: 'VIP #0011', valid: true, time: '14:30:22' },
  { id: 3, name: 'TOKEN INVÁLIDO', ticket: '—', valid: false, time: '14:28:44' },
  { id: 4, name: 'Fernanda Lima', ticket: 'CAMAROTE #0003', valid: true, time: '14:27:11' },
  { id: 5, name: 'Ricardo Souza', ticket: 'STANDARD #0199', valid: true, time: '14:25:03' },
  { id: 6, name: 'JÁ UTILIZADO', ticket: 'STANDARD #0042', valid: false, time: '14:22:58' },
  { id: 7, name: 'Mariana Costa', ticket: 'VIP #0007', valid: true, time: '14:20:14' },
]

type Filter = 'all' | 'valid' | 'invalid'

export default function CheckinHistoryPage({ onNavigate }: PulsePageProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = MOCK.filter((e) => {
    if (filter === 'valid') return e.valid
    if (filter === 'invalid') return !e.valid
    return true
  })

  const validCount = MOCK.filter((e) => e.valid).length
  const invalidCount = MOCK.filter((e) => !e.valid).length

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Histórico</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-4">
        {[
          { label: 'Total', value: MOCK.length, color: '#0057E7' },
          { label: 'Válidos', value: validCount, color: '#22C55E' },
          { label: 'Inválidos', value: invalidCount, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
            <p className="font-bold text-xl" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {(['all', 'valid', 'invalid'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {f === 'all' ? 'Todos' : f === 'valid' ? 'Válidos' : 'Inválidos'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-4 space-y-2 pb-6">
        {filtered.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
            {entry.valid
              ? <CheckCircle size={16} className="text-green-400 shrink-0" />
              : <XCircle size={16} className="text-red-400 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{entry.name}</p>
              <p className="text-slate-500 text-xs">{entry.ticket}</p>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs shrink-0">
              <Clock size={10} />
              {entry.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
