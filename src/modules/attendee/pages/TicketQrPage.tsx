import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, RefreshCw, Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { attendeeService } from '@/core/attendee/attendee.service'
import type { AttendeeTicket } from '@/core/attendee/attendee.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface TicketQrPageProps extends PulsePageProps {
  ticketId: string
}

// Render QR using a URL-based approach (no native lib needed)
function QRDisplay({ value, size = 200 }: { value: string; size?: number }) {
  if (!value) return null
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=060d1f&color=ffffff&margin=12`
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-2xl"
      style={{ imageRendering: 'pixelated' }}
      onError={(e) => {
        // If external QR service fails, hide the broken image
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

const REFRESH_INTERVAL = 30 // seconds

export default function TicketQrPage({ onNavigate, ticketId }: TicketQrPageProps) {
  const [ticket, setTicket] = useState<AttendeeTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setError(false)
    try {
      const data = await attendeeService.getTicketById(ticketId)
      setTicket(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setCountdown(REFRESH_INTERVAL)
    }
  }, [ticketId])

  useEffect(() => { load() }, [load])

  // Countdown timer, QR refreshes every 30s to prevent screenshot abuse
  useEffect(() => {
    if (!ticket || ticket.status === 'used') return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setRefreshing(true)
          load()
          return REFRESH_INTERVAL
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [ticket, load])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#060d1f]">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#060d1f] px-6 text-center">
        <AlertCircle size={36} className="text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm">Erro ao carregar ingresso.</p>
        <button onClick={() => { setLoading(true); load() }} className="mt-3 text-blue-400 text-sm">
          Tentar novamente
        </button>
        <button onClick={() => onNavigate('/pulse/attendee/tickets')} className="text-slate-500 text-sm mt-2">
          Voltar
        </button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#060d1f] px-6 text-center">
        <p className="text-slate-400">Ingresso não encontrado</p>
        <button onClick={() => onNavigate('/pulse/attendee/tickets')} className="text-blue-400 text-sm mt-3">Voltar</button>
      </div>
    )
  }

  const isValid = ticket.status === 'active' || ticket.status === 'paid'
  const isUsed = ticket.status === 'used'

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee/tickets')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Meu Ingresso</h1>
        {isValid && (
          <button onClick={() => { setRefreshing(true); load() }} className="p-2 ml-auto">
            <RefreshCw size={16} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        {/* Ticket info */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-white font-bold text-lg">{ticket.ticketType}</p>
          <p className="text-slate-400 text-sm">{ticket.eventName}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-slate-500 text-xs">Titular: <span className="text-white">{ticket.holderName}</span></p>
          </div>
        </div>

        {/* QR Code */}
        {isUsed ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle size={64} className="text-green-400" />
            <p className="text-white font-bold text-xl">Check-in realizado</p>
            <p className="text-slate-400 text-sm text-center">Este ingresso já foi utilizado para acesso ao evento</p>
          </div>
        ) : isValid ? (
          <>
            <div
              className="relative p-3 rounded-3xl mb-4"
              style={{ backgroundColor: '#060d1f', border: '2px solid #22C55E44' }}
            >
              {refreshing ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <Loader2 size={32} className="text-blue-400 animate-spin" />
                </div>
              ) : ticket.qrToken ? (
                <QRDisplay value={ticket.qrToken} size={200} />
              ) : (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={32} className="text-slate-600" />
                  <p className="text-slate-500 text-xs text-center">QR não disponível</p>
                </div>
              )}

              {/* Countdown ring */}
              {!refreshing && ticket.qrToken && (
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#060d1f] border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: countdown <= 5 ? '#EF4444' : '#22C55E', color: countdown <= 5 ? '#EF4444' : '#22C55E' }}
                >
                  {countdown}
                </div>
              )}
            </div>

            {/* Security indicator */}
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 mb-4">
              <Shield size={14} className="text-green-400 shrink-0" />
              <p className="text-green-300 text-xs">QR dinâmico, atualiza a cada {REFRESH_INTERVAL}s</p>
            </div>

            <p className="text-slate-600 text-xs text-center">
              Apresente este QR Code na entrada do evento
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-slate-400">Ingresso indisponível ({ticket.status})</p>
          </div>
        )}
      </div>
    </div>
  )
}
