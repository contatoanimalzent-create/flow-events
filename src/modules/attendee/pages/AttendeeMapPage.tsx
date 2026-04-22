import React from 'react'
import { ChevronLeft, MapPin } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const ZONES = [
  { id: 'stage', label: 'Palco', x: 20, y: 60, w: 60, h: 30, color: '#22C55E22', border: '#22C55E66' },
  { id: 'vip', label: 'Área VIP', x: 30, y: 30, w: 40, h: 20, color: '#F9731622', border: '#F9731666' },
  { id: 'main', label: 'Portaria Principal', x: 10, y: 5, w: 35, h: 18, color: '#0057E722', border: '#0057E766' },
  { id: 'side', label: 'Portaria Lateral', x: 55, y: 5, w: 35, h: 18, color: '#0057E722', border: '#0057E766' },
  { id: 'food', label: 'Praça Alimentação', x: 5, y: 35, w: 20, h: 20, color: '#d9770622', border: '#d9770666' },
  { id: 'wc', label: 'Banheiros', x: 75, y: 35, w: 20, h: 15, color: '#64748b22', border: '#64748b66' },
]

export default function AttendeeMapPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Mapa do Evento</h1>
      </div>

      {/* SVG Map */}
      <div className="px-4 mb-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1' }}>
            <rect width="100" height="100" fill="#080f1e" />
            {ZONES.map((z) => (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} stroke={z.border} strokeWidth="0.5" rx="2" />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 1} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3">
                  {z.label}
                </text>
              </g>
            ))}
            {/* User dot */}
            <circle cx="27" cy="13" r="2" fill="#4285F4" stroke="white" strokeWidth="0.5" />
            <circle cx="27" cy="13" r="4" fill="#4285F422" />
            <text x="27" y="21" textAnchor="middle" fill="#4285F4" fontSize="2">Você</text>
          </svg>
        </div>
      </div>

      {/* Zone list */}
      <div className="px-4 space-y-2">
        {ZONES.map((z) => (
          <div key={z.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
            <MapPin size={14} style={{ color: z.border }} className="shrink-0" />
            <p className="text-white text-sm font-medium">{z.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
