import React, { useState } from 'react'
import { ChevronLeft, Users } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const ZONES = [
  { id: 'a', label: 'Portaria Principal', x: 10, y: 10, w: 35, h: 25, color: '#0057E733' },
  { id: 'b', label: 'Portaria Lateral', x: 55, y: 10, w: 35, h: 25, color: '#0057E733' },
  { id: 'c', label: 'Área VIP', x: 25, y: 45, w: 50, h: 30, color: '#7C3AED33' },
  { id: 'd', label: 'Palco', x: 10, y: 60, w: 80, h: 30, color: '#22C55E11' },
]

const STAFF_DOTS = [
  { id: 1, name: 'Ana P.', x: 22, y: 22, zone: 'a', active: true },
  { id: 2, name: 'Bruno', x: 28, y: 18, zone: 'a', active: true },
  { id: 3, name: 'Carla', x: 68, y: 20, zone: 'b', active: true },
  { id: 4, name: 'Diego', x: 82, y: 5, zone: null, active: false },
  { id: 5, name: 'Fernanda', x: 48, y: 55, zone: 'c', active: true },
  { id: 6, name: 'Ricardo', x: 40, y: 52, zone: 'c', active: true },
]

export default function TeamMapPage({ onNavigate }: PulsePageProps) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Mapa da Equipe</h1>
      </div>

      {/* SVG Map */}
      <div className="px-4 mb-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1.5' }}>
            {/* Background */}
            <rect width="100" height="100" fill="#0a0f1e" />

            {/* Zones */}
            {ZONES.map((z) => (
              <g key={z.id}>
                <rect
                  x={z.x} y={z.y} width={z.w} height={z.h}
                  fill={z.color}
                  stroke={z.color.replace('33', '88')}
                  strokeWidth="0.5"
                  rx="2"
                />
                <text
                  x={z.x + z.w / 2} y={z.y + 4}
                  textAnchor="middle" fill="rgba(255,255,255,0.4)"
                  fontSize="2.5"
                >
                  {z.label}
                </text>
              </g>
            ))}

            {/* Staff dots */}
            {STAFF_DOTS.map((s) => (
              <g key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={s.x} cy={s.y} r={selected === s.id ? 3.5 : 2.5}
                  fill={s.active ? (s.zone ? '#22C55E' : '#d97706') : '#EF4444'}
                  stroke="white" strokeWidth="0.5"
                />
                <text x={s.x} y={s.y + 5} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="2">
                  {s.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mb-4 flex gap-4 flex-wrap">
        {[
          { color: '#22C55E', label: 'Na zona' },
          { color: '#d97706', label: 'Fora da zona' },
          { color: '#EF4444', label: 'Ausente' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* Staff list */}
      <div className="px-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
          <Users size={12} />
          Posições atuais
        </p>
        <div className="space-y-2">
          {STAFF_DOTS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${selected === s.id ? 'bg-white/10 border border-white/15' : 'bg-white/4 border border-white/6'}`}
              onClick={() => setSelected(selected === s.id ? null : s.id)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.active ? (s.zone ? '#22C55E' : '#d97706') : '#EF4444' }}
              />
              <p className="text-white text-sm font-medium flex-1">{s.name}</p>
              <p className="text-slate-500 text-xs">
                {s.zone ? `Zona ${s.zone.toUpperCase()}` : 'Fora da zona'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
