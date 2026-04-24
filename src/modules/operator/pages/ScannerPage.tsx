import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, CheckCircle, XCircle, Loader2, Keyboard, Camera, AlertTriangle } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { useOffline } from '@/core/offline/offline.store'
import { operatorService } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type ScanState = 'idle' | 'scanning' | 'processing' | 'valid' | 'invalid'
type InputMode = 'camera' | 'manual'

interface ScanResult {
  valid: boolean
  name: string
  ticketLabel: string
  message: string
}

// Attempt to use html5-qrcode if available (installed separately)
let Html5QrcodeScanner: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner
} catch {
  Html5QrcodeScanner = null
}

export default function ScannerPage({ onNavigate }: PulsePageProps) {
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('camera')
  const [manualCode, setManualCode] = useState('')
  const [scanCount, setScanCount] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()

  const resultTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const scannerRef = useRef<any>(null)
  const linePos = useRef(0)
  const [linePct, setLinePct] = useState(0)

  // Animate scan line
  useEffect(() => {
    if (scanState !== 'idle' && scanState !== 'scanning') return
    let dir = 1
    const interval = setInterval(() => {
      linePos.current = linePos.current + dir * 1.5
      if (linePos.current >= 100) dir = -1
      if (linePos.current <= 0) dir = 1
      setLinePct(linePos.current)
    }, 16)
    return () => clearInterval(interval)
  }, [scanState])

  // Start html5-qrcode camera scanner
  useEffect(() => {
    if (inputMode !== 'camera' || !Html5QrcodeScanner) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
      false
    )

    scanner.render(
      (decodedText: string) => {
        if (scanState === 'processing') return
        handleScan(decodedText)
      },
      (err: string) => {
        if (!err.includes('No MultiFormat')) {
          setCameraError('Câmera não disponível, use entrada manual')
        }
      }
    )

    scannerRef.current = scanner
    return () => {
      scanner.clear().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode])

  const handleScan = useCallback(async (token: string) => {
    if (!token.trim() || scanState === 'processing') return
    setScanState('processing')
    clearTimeout(resultTimerRef.current)

    try {
      let res: ScanResult

      if (isOnline && context?.eventId) {
        const validation = await operatorService.validateToken(token.trim(), context.eventId)
        if (validation.valid) {
          res = {
            valid: true,
            name: validation.name,
            ticketLabel: validation.ticketLabel,
            message: validation.message,
          }
          setScanCount((c) => c + 1)
        } else {
          res = {
            valid: false,
            name: '-',
            ticketLabel: token.slice(0, 16),
            message: validation.message,
          }
        }
      } else {
        // Offline: queue for later sync
        enqueue('checkin', {
          eventId: context?.eventId,
          token,
          timestamp: Date.now(),
        })
        res = {
          valid: true,
          name: 'Participante',
          ticketLabel: 'Offline, pendente sync',
          message: 'Registrado offline. Será sincronizado.',
        }
        setScanCount((c) => c + 1)
      }

      setResult(res)
      setScanState(res.valid ? 'valid' : 'invalid')
    } catch (err) {
      setResult({ valid: false, name: '-', ticketLabel: token.slice(0, 16), message: 'Erro na validação' })
      setScanState('invalid')
    }

    resultTimerRef.current = setTimeout(() => {
      setScanState('idle')
      setResult(null)
      setManualCode('')
    }, 2_800)
  }, [context?.eventId, isOnline, enqueue, scanState])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(manualCode)
  }

  const isResultShown = scanState === 'valid' || scanState === 'invalid'
  const accent = '#0057E7'

  return (
    <div className="flex flex-col h-full bg-black select-none">
      {/* Top overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 12 }}
      >
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-white text-xs font-semibold">{context?.eventName ?? 'Scanner'}</p>
          {!isOnline && (
            <p className="text-amber-400 text-[10px]">⚡ Offline, gravando localmente</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-white text-xs font-bold">{scanCount}</span>
          </div>
          <button
            onClick={() => onNavigate('/pulse/operator')}
            className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center" style={{ top: 'calc(env(safe-area-inset-top) + 58px)' }}>
        <div className="bg-black/60 backdrop-blur-sm rounded-full flex gap-1 p-1">
          <button
            onClick={() => { setInputMode('camera'); setCameraError(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${inputMode === 'camera' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <Camera size={12} /> Câmera
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${inputMode === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <Keyboard size={12} /> Manual
          </button>
        </div>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0a0f1e]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

        {inputMode === 'camera' ? (
          <>
            {/* html5-qrcode mounts here */}
            {Html5QrcodeScanner && !cameraError && (
              <div id="qr-reader" className="w-full h-full absolute inset-0 opacity-0" />
            )}

            {/* Visual frame */}
            <div className="relative w-56 h-56 z-10">
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <div
                  key={c}
                  className="absolute w-8 h-8"
                  style={{
                    top: c.startsWith('t') ? 0 : 'auto',
                    bottom: c.startsWith('b') ? 0 : 'auto',
                    left: c.endsWith('l') ? 0 : 'auto',
                    right: c.endsWith('r') ? 0 : 'auto',
                    borderTop: c.startsWith('t') ? `3px solid ${accent}` : 'none',
                    borderBottom: c.startsWith('b') ? `3px solid ${accent}` : 'none',
                    borderLeft: c.endsWith('l') ? `3px solid ${accent}` : 'none',
                    borderRight: c.endsWith('r') ? `3px solid ${accent}` : 'none',
                  }}
                />
              ))}

              {!isResultShown && scanState !== 'processing' && (
                <div
                  className="absolute left-1 right-1 h-0.5 transition-none"
                  style={{
                    top: `${linePct}%`,
                    background: accent,
                    boxShadow: `0 0 8px 2px ${accent}99`,
                  }}
                />
              )}

              {scanState === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={40} className="text-blue-400 animate-spin" />
                </div>
              )}

              {isResultShown && result && (
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: result.valid ? '#22C55E22' : '#EF444422' }}
                >
                  {result.valid
                    ? <CheckCircle size={56} className="text-green-400" />
                    : <XCircle size={56} className="text-red-400" />
                  }
                </div>
              )}
            </div>

            {cameraError && (
              <div className="absolute bottom-32 left-6 right-6 bg-amber-900/60 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <p className="text-amber-200 text-xs">{cameraError}</p>
              </div>
            )}

            {!isResultShown && scanState !== 'processing' && !cameraError && (
              <p className="absolute text-white/50 text-sm z-10" style={{ bottom: 120 }}>
                Aponte para o QR Code
              </p>
            )}
          </>
        ) : (
          /* Manual entry */
          <div className="w-full px-8 z-10">
            <p className="text-white font-semibold text-center mb-4">Digite o código do ingresso</p>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
              <input
                autoFocus
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Ex: TKT-ABC123"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-lg font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!manualCode.trim() || scanState === 'processing'}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {scanState === 'processing' ? <Loader2 size={16} className="animate-spin" /> : null}
                Validar
              </button>
            </form>
          </div>
        )}

        {/* Result card */}
        {isResultShown && result && (
          <div
            className="absolute left-6 right-6 rounded-2xl p-4 border z-20"
            style={{
              bottom: 100,
              backgroundColor: result.valid ? '#052e16' : '#450a0a',
              borderColor: result.valid ? '#22C55E44' : '#EF444444',
            }}
          >
            <div className="flex items-center gap-3">
              {result.valid
                ? <CheckCircle size={28} className="text-green-400 shrink-0" />
                : <XCircle size={28} className="text-red-400 shrink-0" />
              }
              <div>
                <p className="text-white font-bold">{result.name}</p>
                <p className="text-slate-400 text-xs">{result.ticketLabel}</p>
                <p className={`text-xs mt-0.5 ${result.valid ? 'text-green-300' : 'text-red-300'}`}>{result.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="bg-[#0a0f1e] border-t border-white/8 px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <p className="text-slate-600 text-xs text-center">
          {isOnline ? `${scanCount} validado${scanCount !== 1 ? 's' : ''} nesta sessão` : `⚡ Offline, ${scanCount} salvo${scanCount !== 1 ? 's' : ''} localmente`}
        </p>
      </div>
    </div>
  )
}
