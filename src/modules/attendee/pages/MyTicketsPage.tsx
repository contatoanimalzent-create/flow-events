import React from 'react'
import { ChevronLeft, QrCode, Calendar, MapPin } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const TICKETS = [
  { id: 'tk-001', type: 'VIP', name: 'João Silva', sector: 'Camarote A', date: '25 Abr 2026', used: false },
  { id: 'tk-002', type: 'STANDARD', name: 'João Silva', sector: 'Área Geral', date: '25 Abr 2026', used: false },
]

const COLORS: Record<string, string> = {
  VIP: 'from-yellow-900/60 to-amber-900/40',
  STANDARD: 'from-blue-900/60 to-indigo-900/40',
}

export default function MyTicketsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Meus Ingressos</h1>
      </div>

      <div className="px-4 space-y-4">
        {TICKETS.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onNavigate(`/pulse/attendee/ticket/${ticket.id}`)}
            className={`w-full bg-gradient-to-br ${COLORS[ticket.type] ?? 'from-slate-900 to-slate-800'} border border-white/10 rounded-2xl p-5 text-left active:opacity-80 transition-opacity`}
          >
            {/* Type badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full">
                {ticket.type}
              </span>
              <QrCode size={20} className="text-white/50" />
            </div>

            {/* Event name */}
            <p className="text-white font-bold text-xl mb-1">{context?.eventName}</p>
            <p className="text-white/70 text-sm mb-4">{ticket.name}</p>

            {/* Divider (perforation-style) */}
            <div className="border-t border-dashed border-white/15 my-3" />

            {/* Details */}
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <Calendar size={12} />
                {ticket.date}
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <MapPin size={12} />
                {ticket.sector}
              </div>
            </div>

            <p className="text-blue-400 text-xs font-semibold mt-3">Toque para ver QR Code →</p>
          </button>
        ))}
      </div>
    </div>
  )
}
