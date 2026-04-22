import React, { useState, useEffect } from 'react'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface TicketQrPageProps extends PulsePageProps {
  ticketId: string
}

/** Deterministic QR-like grid from a token string */
function QrGrid({ token, size = 14 }: { token: string; size?: number }) {
  const cells = Array.from({ length: size * size }, (_, i) => {
    const code = token.charCodeAt(i % token.length)
    const xor = (i * 7 + code * 13 + Math.floor(i / size) * 3) % 23
    return xor > 9
  })

  // Corner finder patterns
  const isCorner = (r: number, c: number) => {
    const n = size - 1
    return (r < 3 && c < 3) || (r < 3 && c > n - 3) || (r > n - 3 && c < 3)
  }

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((filled, i) => {
        const r = Math.floor(i / size)
        const c = i % size
        const corner = isCorner(r, c)
        return (
          <div
            key={i}
            className="aspect-square rounded-[1px]"
            style={{ backgroundColor: (filled || corner) ? '#ffffff' : 'transparent' }}
          />
        )
      })}
    </div>
  )
}

export default function TicketQrPage({ ticketId, onNavigate }: TicketQrPageProps) {
  const [countdown, setCountdown] = useState(30)
  const [token, setToken] = useState(`PULSE-${ticketId}-${Date.now()}`)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setToken(`PULSE-${ticketId}-${Date.now()}`)
          return 30
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [ticketId])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee/tickets')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">QR Code</h1>
      </div>

      {/* QR area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-xs bg-white rounded-3xl p-6 mb-6">
          <QrGrid token={token} size={14} />
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
          <RefreshCw size={14} />
          Atualiza em {countdown}s
        </div>

        {/* Circular progress */}
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-8 h-8 rotate-[-90deg]">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="12"
              fill="none"
              stroke="#4285F4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - countdown / 30)}`}
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        <p className="text-slate-500 text-xs mt-4 text-center">
          Este QR Code é dinâmico e muda a cada 30 segundos para garantir sua segurança
        </p>
      </div>

      {/* Ticket info */}
      <div className="px-4 pb-8">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider">Ingresso</p>
          <p className="text-white font-bold text-lg mt-1">VIP · Camarote A</p>
          <p className="text-slate-400 text-sm">João Silva</p>
        </div>
      </div>
    </div>
  )
}
