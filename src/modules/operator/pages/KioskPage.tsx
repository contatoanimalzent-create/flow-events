import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { useOffline } from '@/core/offline/offline.store'
import { operatorService } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type KioskState = 'scanning' | 'processing' | 'valid' | 'invalid'

interface ScanResult {
  valid: boolean
  name: string
  message: string
}

// Attempt to load html5-qrcode if available
let Html5QrcodeScanner: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner
} catch {
  Html5QrcodeScanner = null
}

export default function KioskPage({ onNavigate }: PulsePageProps) {
  const [kioskState, setKioskState] = useState<KioskState>('scanning')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanCount, setScanCount] = useState(0)

  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()

  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const scannerRef = useRef<any>(null)
  // Pulse ring animation
  const [pulseRing, setPulseRing] = useState(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(resetTimerRef.current)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  // Pulse ring animation toggle
  useEffect(() => {
    if (kioskState !== 'scanning') return
    const interval = setInterval(() => setPulseRing((p) => !p), 900)
    return () => clearInterval(interval)
  }, [kioskState])

  const resetToScanning = useCallback(() => {
    setKioskState('scanning')
    setResult(null)
  }, [])

  const handleScan = useCallback(
    async (token: string) => {
      if (!token.trim() || kioskState === 'processing') return
      setKioskState('processing')
      clearTimeout(resetTimerRef.current)

      try {
        let res: ScanResult

        if (isOnline && context?.eventId) {
          const validation = await operatorService.validateToken(token.trim(), context.eventId)
          if (validation.valid) {
            res = { valid: true, name: validation.name, message: validation.message }
            setScanCount((c) => c + 1)
          } else {
            res = { valid: false, name: '—', message: validation.message }
          }
        } else {
          // Offline: enqueue for later sync
          enqueue('checkin', {
            eventId: context?.eventId,
            token,
            timestamp: Date.now(),
          })
          res = {
            valid: true,
            name: 'Participante',
            message: 'Registrado offline. Será sincronizado.',
          }
          setScanCount((c) => c + 1)
        }

        setResult(res)
        setKioskState(res.valid ? 'valid' : 'invalid')

        // Auto-reset: 3s on success, 2s on error
        resetTimerRef.current = setTimeout(
          resetToScanning,
          res.valid ? 3_000 : 2_000
        )
      } catch {
        setResult({ valid: false, name: '—', message: 'Erro na validação' })
        setKioskState('invalid')
        resetTimerRef.current = setTimeout(resetToScanning, 2_000)
      }
    },
    [context?.eventId, isOnline, enqueue, kioskState, resetToScanning]
  )

  // Start html5-qrcode scanner
  useEffect(() => {
    if (!Html5QrcodeScanner) return

    const scanner = new Html5QrcodeScanner(
      'kiosk-qr-reader',
      { fps: 10, qrbox: { width: 260, height: 260 }, rememberLastUsedCamera: true },
      false
    )

    scanner.render(
      (decodedText: string) => {
        handleScan(decodedText)
      },
      (_err: string) => {
        // Suppress "no barcode" noise
      }
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount once — handleScan captured via ref below

  // Keep handleScan ref in sync so the scanner callback always uses the latest
  const handleScanRef = useRef(handleScan)
  useEffect(() => {
    handleScanRef.current = handleScan
  }, [handleScan])

  const isShowingResult = kioskState === 'valid' || kioskState === 'invalid'

  return (
    <div
      className="fixed inset-0 flex flex-col select-none overflow-hidden"
      style={{ backgroundColor: '#060d1f' }}
    >
      {/* html5-qrcode hidden mount point */}
      {Html5QrcodeScanner && (
        <div id="kiosk-qr-reader" className="absolute opacity-0 pointer-events-none w-0 h-0" />
      )}

      {/* Top bar */}
      <div className="relative flex items-center justify-center px-4 pt-8 pb-4">
        <p className="text-white text-lg font-bold tracking-wide text-center">
          {context?.eventName ?? 'Evento'}
        </p>
        {/* Sair do kiosk — small, top-right, not prominent */}
        <button
          onClick={() => onNavigate('/pulse/operator')}
          className="absolute right-4 top-8 text-slate-600 text-xs px-2 py-1 rounded-lg border border-slate-700/50 hover:border-slate-500/50 hover:text-slate-400 transition-all"
        >
          Sair do kiosk
        </button>
      </div>

      {/* Scan count badge */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-3 py-1">
          <CheckCircle size={12} className="text-green-400" />
          <span className="text-white text-xs font-semibold">{scanCount} validado{scanCount !== 1 ? 's' : ''}</span>
          {!isOnline && <span className="text-amber-400 text-[10px] ml-1">⚡ Offline</span>}
        </div>
      </div>

      {/* Main scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Pulsing ring + scan frame */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulsing ring — green when scanning, hidden when result shown */}
          {!isShowingResult && kioskState !== 'processing' && (
            <>
              <div
                className="absolute rounded-full border-2 transition-all duration-700"
                style={{
                  width: pulseRing ? 340 : 310,
                  height: pulseRing ? 340 : 310,
                  borderColor: pulseRing ? '#22c55e66' : '#22c55e33',
                  boxShadow: pulseRing ? '0 0 32px 8px #22c55e22' : 'none',
                }}
              />
              <div
                className="absolute rounded-full border transition-all duration-700"
                style={{
                  width: pulseRing ? 310 : 290,
                  height: pulseRing ? 310 : 290,
                  borderColor: pulseRing ? '#22c55e44' : '#22c55e22',
                }}
              />
            </>
          )}

          {/* Result overlay rings */}
          {isShowingResult && (
            <div
              className="absolute rounded-full border-2 transition-none"
              style={{
                width: 320,
                height: 320,
                borderColor: result?.valid ? '#22c55eaa' : '#ef4444aa',
                boxShadow: result?.valid ? '0 0 40px 12px #22c55e33' : '0 0 40px 12px #ef444433',
              }}
            />
          )}

          {/* QR frame box */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              width: 280,
              height: 280,
              backgroundColor: isShowingResult
                ? result?.valid
                  ? '#052e16cc'
                  : '#450a0acc'
                : '#0a1428cc',
              border: `2px solid ${
                isShowingResult
                  ? result?.valid
                    ? '#22c55e55'
                    : '#ef444455'
                  : '#ffffff11'
              }`,
              transition: 'background-color 0.3s, border-color 0.3s',
            }}
          >
            {/* Corner decorators */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
              <div
                key={c}
                className="absolute w-10 h-10"
                style={{
                  top: c.startsWith('t') ? 8 : 'auto',
                  bottom: c.startsWith('b') ? 8 : 'auto',
                  left: c.endsWith('l') ? 8 : 'auto',
                  right: c.endsWith('r') ? 8 : 'auto',
                  borderTop: c.startsWith('t') ? '3px solid #22c55e88' : 'none',
                  borderBottom: c.startsWith('b') ? '3px solid #22c55e88' : 'none',
                  borderLeft: c.endsWith('l') ? '3px solid #22c55e88' : 'none',
                  borderRight: c.endsWith('r') ? '3px solid #22c55e88' : 'none',
                  borderRadius: 4,
                }}
              />
            ))}

            {/* Content area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {kioskState === 'processing' && (
                <Loader2 size={48} className="text-white/60 animate-spin" />
              )}

              {kioskState === 'valid' && (
                <>
                  <CheckCircle size={64} className="text-green-400" />
                  <p className="text-green-300 font-bold text-lg text-center px-4">
                    {result?.name ?? 'Participante'}
                  </p>
                  <p className="text-green-400/60 text-sm text-center">Acesso liberado</p>
                </>
              )}

              {kioskState === 'invalid' && (
                <>
                  <XCircle size={64} className="text-red-400" />
                  <p className="text-red-300 font-semibold text-base text-center px-4">
                    {result?.message ?? 'Ingresso inválido'}
                  </p>
                </>
              )}

              {kioskState === 'scanning' && !Html5QrcodeScanner && (
                <p className="text-slate-500 text-sm text-center px-4">
                  Câmera não disponível
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instruction text */}
        <p className="text-slate-400 text-xl font-semibold tracking-widest uppercase letter-spacing-widest">
          {kioskState === 'scanning' ? 'LEIA O INGRESSO' : kioskState === 'processing' ? 'Validando...' : ''}
        </p>
      </div>

      {/* Bottom status bar */}
      <div className="pb-8 flex justify-center">
        <p className="text-slate-700 text-xs">
          {isOnline ? 'Modo online — validação em tempo real' : 'Modo offline — sincronizará ao reconectar'}
        </p>
      </div>
    </div>
  )
}
