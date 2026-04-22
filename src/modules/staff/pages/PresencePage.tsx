import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, MapPin, Play, Square, Clock, CheckCircle } from 'lucide-react'
import { useOffline } from '@/core/offline/offline.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type PresenceStatus = 'idle' | 'active' | 'ended'

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PresencePage({ onNavigate }: PulsePageProps) {
  const [status, setStatus] = useState<PresenceStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const { isOnline, enqueue } = useOffline()

  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  const handleStart = () => {
    const now = new Date().toISOString()
    setStartTime(now)
    setElapsed(0)
    setStatus('active')

    if (!isOnline) {
      enqueue('start-presence', { timestamp: now })
    }
    // else: call supabase realtime upsert
  }

  const handleEnd = () => {
    setStatus('ended')
    if (!isOnline) {
      enqueue('end-presence', { timestamp: new Date().toISOString() })
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Presença</h1>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Status indicator ring */}
        <div
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 mb-8 transition-all"
          style={{
            borderColor: status === 'active' ? '#22C55E' : status === 'ended' ? '#64748b' : '#1e293b',
            boxShadow: status === 'active' ? '0 0 40px rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {status === 'active' && (
            <>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mb-2" />
              <p className="text-white font-mono font-bold text-xl">{formatElapsed(elapsed)}</p>
              <p className="text-green-400 text-xs mt-1">Presença ativa</p>
            </>
          )}
          {status === 'idle' && (
            <>
              <MapPin size={32} className="text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm text-center">Inicie sua presença</p>
            </>
          )}
          {status === 'ended' && (
            <>
              <CheckCircle size={32} className="text-green-400 mb-2" />
              <p className="text-white text-sm font-medium">Encerrada</p>
              <p className="text-slate-400 text-xs">{formatElapsed(elapsed)}</p>
            </>
          )}
        </div>

        {/* Location info */}
        {status === 'active' && (
          <div className="flex items-center gap-2 mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 w-full">
            <MapPin size={14} className="text-green-400 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Portaria Principal</p>
              <p className="text-green-400 text-xs">Dentro da zona permitida</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px]">GPS</span>
            </div>
          </div>
        )}

        {/* Start time */}
        {startTime && (
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
            <Clock size={14} />
            Iniciado às {new Date(startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Action button */}
        {status === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 active:opacity-80"
          >
            <Play size={20} fill="white" />
            Iniciar Presença
          </button>
        )}

        {status === 'active' && (
          <button
            onClick={handleEnd}
            className="w-full py-4 rounded-2xl bg-red-600/80 border border-red-500/30 text-white font-bold text-base flex items-center justify-center gap-2 active:opacity-80"
          >
            <Square size={18} fill="white" />
            Encerrar Presença
          </button>
        )}

        {status === 'ended' && (
          <button
            onClick={() => { setStatus('idle'); setElapsed(0); setStartTime(null) }}
            className="w-full py-4 rounded-2xl bg-white/8 border border-white/10 text-slate-300 font-semibold text-sm active:opacity-80"
          >
            Nova presença
          </button>
        )}

        {!isOnline && (
          <p className="text-yellow-400 text-xs mt-4 text-center">
            Offline — ações serão sincronizadas quando houver conexão
          </p>
        )}
      </div>
    </div>
  )
}
