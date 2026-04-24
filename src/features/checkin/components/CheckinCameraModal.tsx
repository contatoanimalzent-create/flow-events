import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Camera,
  CameraOff,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react'
import type { CheckinSubmissionResult } from '@/features/checkin/types'
import { getValidationAppearance } from './checkin-ui'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckinCameraModalProps {
  eventId: string
  gateId?: string | null
  onScan: (token: string, isExit?: boolean) => Promise<void>
  onClose: () => void
  scanResult: CheckinSubmissionResult | null
  processing: boolean
  onClearResult: () => void
  /**
   * When true, renders as a flex column filling its parent instead of
   * a fixed fullscreen overlay. Used in OperatorScannerView.
   */
  inline?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckinCameraModal({
  onScan,
  onClose,
  scanResult,
  processing,
  onClearResult,
  inline = false,
}: CheckinCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTokenRef = useRef<string>('')
  const cooldownRef = useRef<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsQRRef = useRef<((data: Uint8ClampedArray, width: number, height: number, opts?: any) => { data: string } | null) | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [jsQRLoaded, setJsQRLoaded] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [resultVisible, setResultVisible] = useState(false)

  // ── Load jsQR ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Reuse if already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).jsQR) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsQRRef.current = (window as any).jsQR
      setJsQRLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    script.async = true
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsQRRef.current = (window as any).jsQR
      setJsQRLoaded(true)
    }
    script.onerror = () => {
      console.warn('jsQR failed to load, manual input only')
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  // ── Show result flash for 3 s then clear ─────────────────────────────────
  useEffect(() => {
    if (scanResult) {
      setResultVisible(true)
      cooldownRef.current = true
      const timer = window.setTimeout(() => {
        setResultVisible(false)
        onClearResult()
        cooldownRef.current = false
        lastTokenRef.current = ''
      }, 3000)
      return () => window.clearTimeout(timer)
    }
  }, [scanResult, onClearResult])

  // ── Camera scan loop ──────────────────────────────────────────────────────
  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const jsQR = jsQRRef.current

    if (!video || !canvas || !jsQR || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code?.data && !cooldownRef.current && code.data !== lastTokenRef.current) {
      lastTokenRef.current = code.data
      cooldownRef.current = true
      void onScan(code.data)
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [onScan])

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        rafRef.current = requestAnimationFrame(scanFrame)
      }
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Use o campo manual abaixo.'
          : 'Câmera não disponível. Use o campo manual abaixo.'
      setCameraError(msg)
      setCameraActive(false)
    }
  }, [scanFrame])

  // ── Stop camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const video = videoRef.current
    if (video?.srcObject) {
      ;(video.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }
    setCameraActive(false)
  }, [])

  // ── Auto-start camera when jsQR ready ────────────────────────────────────
  useEffect(() => {
    if (jsQRLoaded) {
      void startCamera()
    }
  }, [jsQRLoaded, startCamera])

  // ── Re-bind scan loop when scanFrame updates ──────────────────────────────
  useEffect(() => {
    if (!cameraActive) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [cameraActive, scanFrame])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stopCamera()
    }
  }, [stopCamera])

  // ── Handle close ─────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  const appearance = scanResult ? getValidationAppearance(scanResult.validation_status, scanResult.reason_code) : null
  const isSuccess = scanResult?.validation_status === 'valid' || scanResult?.validation_status === 'reentry_allowed'

  return (
    <div className={inline ? 'flex flex-1 flex-col bg-black select-none overflow-hidden' : 'fixed inset-0 z-50 flex flex-col bg-black select-none'}>

      {/* ── Header (hidden in inline/operator mode) ────────────────────── */}
      {!inline && (
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-brand-acid" />
            <span className="font-display text-base font-bold tracking-widest text-brand-acid uppercase">
              Scanner
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Fechar scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Camera área ────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          style={{ display: cameraActive ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Inactive placeholder */}
        {!cameraActive && !cameraError && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-white/30">
            <CameraOff className="h-16 w-16" />
            <p className="font-mono text-sm">
              {jsQRLoaded ? 'Iniciando câmera...' : 'Carregando scanner...'}
            </p>
          </div>
        )}

        {/* Camera error placeholder */}
        {cameraError && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <AlertTriangle className="h-12 w-12 text-status-warning" />
            <p className="font-mono text-sm text-status-warning">{cameraError}</p>
            <button
              onClick={() => void startCamera()}
              disabled={!jsQRLoaded}
              className="btn-primary mt-2 flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Scan frame overlay */}
        {cameraActive && !resultVisible && !processing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-60 w-60">
              {/* Corner brackets */}
              {[
                { top: 0, left: 0, bt: 4, bl: 4, bb: 0, br: 0 },
                { top: 0, right: 0, bt: 4, bl: 0, bb: 0, br: 4 },
                { bottom: 0, left: 0, bt: 0, bl: 4, bb: 4, br: 0 },
                { bottom: 0, right: 0, bt: 0, bl: 0, bb: 4, br: 4 },
              ].map((pos, i) => (
                <span
                  key={i}
                  className="absolute h-10 w-10"
                  style={{
                    top: pos.top,
                    bottom: pos.bottom,
                    left: pos.left,
                    right: pos.right,
                    borderTopWidth: pos.bt,
                    borderBottomWidth: pos.bb,
                    borderLeftWidth: pos.bl,
                    borderRightWidth: pos.br,
                    borderColor: '#d4ff00',
                    borderStyle: 'solid',
                  }}
                />
              ))}

              {/* Scan line */}
              <div
                className="absolute left-2 right-2 h-0.5 opacity-80"
                style={{
                  background: '#d4ff00',
                  animation: 'checkin-scanline 2s linear infinite',
                }}
              />
              <style>{`
                @keyframes checkin-scanline {
                  0%   { top: 8%;  opacity: 1; }
                  50%  { opacity: 0.5; }
                  100% { top: 88%; opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Processing spinner overlay */}
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
            <Loader2 className="h-12 w-12 animate-spin text-brand-acid" />
            <span className="font-mono text-base font-semibold text-brand-acid">Validando...</span>
          </div>
        )}

        {/* Result flash overlay */}
        {resultVisible && scanResult && appearance && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center transition-all duration-300 ${
              isSuccess ? 'bg-status-success/95' : 'bg-status-error/95'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-20 w-20 text-white drop-shadow-lg" />
                <p className="font-display text-4xl font-bold tracking-wide text-white">
                  {scanResult.digital_ticket?.holder_name ?? 'Participante'}
                </p>
                {scanResult.digital_ticket?.ticket_type?.name && (
                  <span className="rounded-sm bg-white/20 px-4 py-1 font-mono text-lg font-semibold text-white">
                    {scanResult.digital_ticket.ticket_type.name}
                  </span>
                )}
                {scanResult.digital_ticket?.ticket_number && (
                  <p className="font-mono text-sm text-white/70">
                    {scanResult.digital_ticket.ticket_number}
                  </p>
                )}
                <p className="font-mono text-sm text-white/80 uppercase tracking-widest">
                  Acesso autorizado ✓
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-20 w-20 text-white drop-shadow-lg" />
                <p className="font-display text-4xl font-bold tracking-wide text-white">NEGADO</p>
                <p className="max-w-xs font-mono text-lg text-white/90">
                  {appearance.description}
                </p>
                {scanResult.digital_ticket?.holder_name && (
                  <p className="font-mono text-sm text-white/70">
                    {scanResult.digital_ticket.holder_name}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom controls ─────────────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-gray-900 px-4 py-4 space-y-3">
        {/* Manual token input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="w-full rounded-sm border border-bg-border bg-bg-card pl-9 pr-3 py-3 font-mono text-sm text-text-primary placeholder-text-muted focus:border-brand-acid focus:outline-none transition-colors"
              placeholder="Token manual..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualToken.trim()) {
                  void onScan(manualToken.trim())
                  setManualToken('')
                }
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          <button
            onClick={() => {
              if (manualToken.trim()) {
                void onScan(manualToken.trim())
                setManualToken('')
              }
            }}
            disabled={processing || !manualToken.trim()}
            className="rounded-sm bg-brand-acid px-4 py-3 font-bold text-black disabled:opacity-40 transition-opacity"
            aria-label="Confirmar entrada"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => {
              if (manualToken.trim()) {
                void onScan(manualToken.trim(), true)
                setManualToken('')
              }
            }}
            disabled={processing || !manualToken.trim()}
            className="rounded-sm border border-bg-border bg-bg-card px-4 py-3 text-sm font-semibold text-text-secondary disabled:opacity-40 transition-colors hover:bg-bg-elevated"
            aria-label="Registrar saída"
          >
            Saída
          </button>
        </div>
      </div>
    </div>
  )
}
