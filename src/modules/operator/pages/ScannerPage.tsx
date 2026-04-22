import React, { useState, useRef, useEffect } from 'react'
import { X, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { useOffline } from '@/core/offline/offline.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type ValidationState = 'idle' | 'scanning' | 'valid' | 'invalid' | 'processing'

interface ValidationResult {
  valid: boolean
  name: string
  ticket: string
  message: string
}

export default function ScannerPage({ onNavigate }: PulsePageProps) {
  const [state, setState] = useState<ValidationState>('idle')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()

  // Animate scanner line
  const [linePos, setLinePos] = useState(0)
  const lineRef = useRef<ReturnType<typeof setInterval>>()
  const [lineDir, setLineDir] = useState(1)

  useEffect(() => {
    if (state === 'idle' || state === 'scanning') {
      lineRef.current = setInterval(() => {
        setLinePos((p) => {
          const next = p + lineDir * 2
          if (next >= 100) setLineDir(-1)
          if (next <= 0) setLineDir(1)
          return Math.max(0, Math.min(100, next))
        })
      }, 16)
    }
    return () => clearInterval(lineRef.current)
  }, [state, lineDir])

  const handleSimulateScan = async (valid: boolean) => {
    setState('processing')
    clearTimeout(resultTimerRef.current)

    await new Promise((r) => setTimeout(r, 600))

    if (valid) {
      if (isOnline && context?.eventId) {
        // Real check-in logic would go here
        // await supabase.from('checkins').insert({...})
      } else {
        enqueue('checkin', { eventId: context?.eventId, token: `DEMO-${Date.now()}`, timestamp: Date.now() })
      }
      setScanCount((c) => c + 1)
      setResult({
        valid: true,
        name: 'Ana Paula Santos',
        ticket: 'STANDARD #0042',
        message: 'Acesso liberado',
      })
      setState('valid')
    } else {
      setResult({
        valid: false,
        name: '—',
        ticket: 'TOKEN INVÁLIDO',
        message: 'Ingresso não encontrado ou já utilizado',
      })
      setState('invalid')
    }

    resultTimerRef.current = setTimeout(() => {
      setState('idle')
      setResult(null)
    }, 2500)
  }

  const isResultShown = state === 'valid' || state === 'invalid'

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-white text-xs font-semibold">
            {context?.eventName ?? 'Scanner'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-white text-xs font-bold">{scanCount}</span>
          </div>
          <button
            onClick={() => onNavigate('/pulse/operator')}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0a0f1e]">
        {/* Simulated dark camera bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

        {/* Corner brackets */}
        <div className="relative w-56 h-56">
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <div
              key={corner}
              className="absolute w-8 h-8"
              style={{
                top: corner.startsWith('t') ? 0 : 'auto',
                bottom: corner.startsWith('b') ? 0 : 'auto',
                left: corner.endsWith('l') ? 0 : 'auto',
                right: corner.endsWith('r') ? 0 : 'auto',
                borderTop: corner.startsWith('t') ? '3px solid #0057E7' : 'none',
                borderBottom: corner.startsWith('b') ? '3px solid #0057E7' : 'none',
                borderLeft: corner.endsWith('l') ? '3px solid #0057E7' : 'none',
                borderRight: corner.endsWith('r') ? '3px solid #0057E7' : 'none',
              }}
            />
          ))}

          {/* Scan line */}
          {!isResultShown && (
            <div
              className="absolute left-1 right-1 h-0.5 bg-blue-500/80 shadow-lg"
              style={{ top: `${linePos}%`, boxShadow: '0 0 8px 2px rgba(0,87,231,0.6)' }}
            />
          )}

          {/* Result overlay */}
          {isResultShown && result && (
            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: result.valid ? '#22C55E33' : '#EF444433' }}
            >
              {result.valid
                ? <CheckCircle size={48} className="text-green-400" />
                : <XCircle size={48} className="text-red-400" />
              }
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={36} className="text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Instruction text */}
        {!isResultShown && state !== 'processing' && (
          <p className="absolute bottom-24 text-white/60 text-sm">
            Aponte a câmera para o QR Code
          </p>
        )}

        {/* Result card */}
        {isResultShown && result && (
          <div
            className="absolute bottom-16 left-6 right-6 rounded-2xl p-4 border"
            style={{
              backgroundColor: result.valid ? '#052e16' : '#450a0a',
              borderColor: result.valid ? '#22C55E44' : '#EF444444',
            }}
          >
            <div className="flex items-center gap-3">
              {result.valid
                ? <CheckCircle size={24} className="text-green-400 shrink-0" />
                : <XCircle size={24} className="text-red-400 shrink-0" />
              }
              <div>
                <p className="text-white font-bold text-sm">{result.name}</p>
                <p className="text-slate-400 text-xs">{result.ticket}</p>
                <p className="text-slate-300 text-xs mt-0.5">{result.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sim buttons (development/demo) */}
      <div
        className="bg-[#0a0f1e] border-t border-white/8 flex gap-3 px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <button
          onClick={() => handleSimulateScan(true)}
          disabled={state === 'processing'}
          className="flex-1 py-3.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 font-semibold text-sm flex items-center justify-center gap-2 active:opacity-70 disabled:opacity-40"
        >
          <CheckCircle size={16} />
          Simular Válido
        </button>
        <button
          onClick={() => handleSimulateScan(false)}
          disabled={state === 'processing'}
          className="flex-1 py-3.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 active:opacity-70 disabled:opacity-40"
        >
          <XCircle size={16} />
          Simular Inválido
        </button>
      </div>
    </div>
  )
}
