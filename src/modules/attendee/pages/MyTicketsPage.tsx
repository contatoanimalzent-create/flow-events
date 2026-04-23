import React, { useEffect, useState } from 'react'
import { ChevronLeft, QrCode, Calendar, MapPin, Loader2, Ticket } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { attendeeService } from '@/core/attendee/attendee.service'
import { supabase } from '@/lib/supabase'
import type { AttendeeTicket } from '@/core/attendee/attendee.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Válido', color: '#22C55E' },
  paid: { label: 'Válido', color: '#22C55E' },
  used: { label: 'Utilizado', color: '#64748b' },
  cancelled: { label: 'Cancelado', color: '#EF4444' },
  pending: { label: 'Pendente', color: '#d97706' },
}

export default function MyTicketsPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [tickets, setTickets] = useState<AttendeeTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      try {
        const data = await attendeeService.getMyTickets(user.id)
        // Show only tickets for active event if context is set
        const filtered = context?.eventId ? data.filter((t) => t.eventId === context.eventId) : data
        setTickets(filtered)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Meus Ingressos</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <Ticket size={40} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum ingresso encontrado</p>
          <p className="text-slate-600 text-xs mt-1">Seus ingressos aparecerão aqui</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {tickets.map((ticket) => {
            const sc = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, color: '#94a3b8' }
            return (
              <button
                key={ticket.id}
                onClick={() => onNavigate(`/pulse/attendee/ticket/${ticket.id}`)}
                className="w-full text-left"
              >
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: sc.color + '33' }}
                >
                  {/* Top strip */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: sc.color }}
                  />
                  {/* Content */}
                  <div className="bg-white/5 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-base">{ticket.ticketType}</p>
                        <p className="text-slate-400 text-sm">{ticket.eventName}</p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: sc.color + '22', color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>

                    <div className="flex gap-4 mb-4">
                      {ticket.eventDate && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar size={12} />
                          {new Date(ticket.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </div>
                      )}
                      {ticket.eventVenue && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <MapPin size={12} />
                          {ticket.eventVenue}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 border-t border-dashed border-white/10" />
                      <div className="w-3 h-3 rounded-full bg-[#060d1f] border border-white/10" />
                      <div className="flex-1 border-t border-dashed border-white/10" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-xs">Titular</p>
                        <p className="text-white text-sm font-medium">{ticket.holderName}</p>
                      </div>
                      {ticket.status !== 'used' && ticket.status !== 'cancelled' && (
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                          <QrCode size={14} />
                          Ver QR
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
