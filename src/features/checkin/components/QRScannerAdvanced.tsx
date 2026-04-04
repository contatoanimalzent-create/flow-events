import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ScanLine,
  KeyRound,
  ShieldAlert,
  Users,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

interface CheckinResult {
  success: boolean
  person_name?: string
  credential_type?: string
  zone?: string
  denial_reason?: string
  checkin_count?: number
}

interface QRScannerAdvancedProps {
  eventId: string
  gateId?: string
  operatorId: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  staff:     'Staff',
  vip:       'VIP',
  media:     'Imprensa',
  vendor:    'Fornecedor',
  speaker:   'Palestrante',
  attendee:  'Participante',
}

// ─── Component ──────────────────────────────────────────────────────────────

export function QRScannerAdvanced({ eventId, gateId, operatorId }: QRScannerAdvancedProps) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number | null>(null)
  const lastTokenRef  = useRef<string>('')
  const cooldownRef   = useRef<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsQRRef       = useRef<((data: Uint8ClampedArray, width: number, height: number, opts?: any) => { data: string } | null) | null>(null)

  const [cameraActive,    setCameraActive]    = useState(false)
  const [cameraError,     setCameraError]     = useState<string | null>(null)
  const [manualToken,     setManualToken]     = useState('')
  const [processing,      setProcessing]      = useState(false)
  const [result,          setResult]          = useState<CheckinResult | null>(null)
  const [checkinCount,    setCheckinCount]    = useState<number>(0)
  const [deviceId]                            = useState(() => `device-${Math.random().toString(36).slice(2, 10)}`)
  const [jsQRLoaded,      setJsQRLoaded]     = useState(false)

  // ── Load jsQR dynamically ────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement('script')
    script.src   = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    script.async = true
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsQRRef.current = (window as any).jsQR
      setJsQRLoaded(true)
    }
    script.onerror = () => {
      console.warn('jsQR failed to load — manual input only')
      setJsQRLoaded(false)
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  // ── Validate token via Edge Function ────────────────────────────────────
  const validateToken = useCallback(async (token: string, override = false) => {
    if (!token.trim() || processing) return
    setProcessing(true)
    setResult(null)

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-checkin`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          qr_token:        token.trim(),
          gate_id:         gateId,
          operator_id:     operatorId,
          device_id:       deviceId,
          event_id:        eventId,
          manual_override: override,
        }),
      })

      const data = await response.json()

      const checkinResult: CheckinResult = {
        success:         response.ok && data.success !== false,
        person_name:     data.person_name   ?? data.attendee_name,
        credential_type: data.credential_type,
        zone:            data.zone          ?? data.access_zone,
        denial_reason:   data.denial_reason ?? data.error ?? data.message,
        checkin_count:   data.checkin_count_today,
      }

      setResult(checkinResult)
      if (checkinResult.checkin_count !== undefined) setCheckinCount(checkinResult.checkin_count)

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setResult(null)
        cooldownRef.current = false
        lastTokenRef.current = ''
      }, 3000)
    } catch (err) {
      setResult({ success: false, denial_reason: 'Erro de rede. Verifique a conexão.' })
      setTimeout(() => {
        setResult(null)
        cooldownRef.current = false
      }, 3000)
    } finally {
      setProcessing(false)
      setManualToken('')
    }
  }, [processing, gateId, operatorId, deviceId, eventId])

  // ── Camera scanning loop ─────────────────────────────────────────────────
  const scanFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    const jsQR   = jsQRRef.current

    if (!video || !canvas || !jsQR || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) { rafRef.current = requestAnimationFrame(scanFrame); return }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code?.data && !cooldownRef.current && code.data !== lastTokenRef.current) {
      lastTokenRef.current = code.data
      cooldownRef.current  = true
      void validateToken(code.data)
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [validateToken])

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
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
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
      const tracks = (video.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
      video.srcObject = null
    }
    setCameraActive(false)
  }, [])

  // ── Clean up on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stopCamera()
    }
  }, [stopCamera])

  // ── Re-bind scan loop when validateToken updates ──────────────────────────
  useEffect(() => {
    if (!cameraActive) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [cameraActive, scanFrame])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-brand-navy text-text-primary font-sans select-none">

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-bg-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-brand-yellow" />
          <span className="text-lg font-bold tracking-wide text-brand-yellow font-display">CHECK-IN</span>
          {gateId && (
            <span className="rounded-full bg-bg-surface px-2 py-0.5 text-xs text-text-secondary">
              Portão {gateId}
            </span>
          )}
        </div>

        {/* Live count */}
        <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-3 py-1">
          <Users className="h-4 w-4 text-brand-yellow" />
          <span className="text-sm font-bold text-brand-yellow">{checkinCount}</span>
          <span className="text-xs text-text-muted">hoje</span>
        </div>
      </header>

      {/* ── Camera viewport ────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-black">

        {/* Video element */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          style={{ display: cameraActive ? 'block' : 'none' }}
        />

        {/* Hidden canvas for frame analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera not active placeholder */}
        {!cameraActive && (
          <div className="flex flex-col items-center gap-4 text-text-muted">
            <CameraOff className="h-16 w-16 opacity-30" />
            <p className="text-sm opacity-50">Câmera desativada</p>
          </div>
        )}

        {/* Scan frame overlay */}
        {cameraActive && !result && !processing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-56">
              {/* Corner brackets */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
                <span
                  key={corner}
                  className="absolute h-10 w-10 border-brand-yellow"
                  style={{
                    top:    corner.startsWith('top')    ? 0 : undefined,
                    bottom: corner.startsWith('bottom') ? 0 : undefined,
                    left:   corner.endsWith('left')     ? 0 : undefined,
                    right:  corner.endsWith('right')    ? 0 : undefined,
                    borderTopWidth:    corner.startsWith('top')    ? 4 : 0,
                    borderBottomWidth: corner.startsWith('bottom') ? 4 : 0,
                    borderLeftWidth:   corner.endsWith('left')     ? 4 : 0,
                    borderRightWidth:  corner.endsWith('right')    ? 4 : 0,
                  }}
                />
              ))}
              {/* Scanning line */}
              <div
                className="absolute left-2 right-2 h-0.5 bg-brand-yellow opacity-80"
                style={{ animation: 'scanline 2s linear infinite', top: '50%' }}
              />
            </div>
            <style>{`
              @keyframes scanline {
                0%   { top: 10%; opacity: 1; }
                50%  { opacity: 0.6; }
                100% { top: 90%; opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Processing spinner overlay */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-brand-yellow" />
              <span className="text-base font-semibold text-brand-yellow">Validando...</span>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {result && !processing && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center transition-all
              ${result.success ? 'bg-status-success/90' : 'bg-status-error/90'}`}
          >
            {result.success ? (
              <>
                <CheckCircle2 className="h-20 w-20 text-white drop-shadow-lg" />
                <p className="text-4xl font-bold text-white font-display tracking-wide">
                  {result.person_name ?? 'Participante'}
                </p>
                {result.credential_type && (
                  <span className="rounded-full bg-white/20 px-4 py-1 text-lg font-semibold text-white">
                    {CREDENTIAL_TYPE_LABELS[result.credential_type] ?? result.credential_type}
                  </span>
                )}
                {result.zone && (
                  <p className="text-xl text-white/90">Zona: {result.zone}</p>
                )}
                <p className="text-sm text-white/70 mt-2">Acesso autorizado ✓</p>
              </>
            ) : (
              <>
                <XCircle className="h-20 w-20 text-white drop-shadow-lg" />
                <p className="text-4xl font-bold text-white font-display tracking-wide">NEGADO</p>
                <p className="text-xl text-white/90 max-w-xs">
                  {result.denial_reason ?? 'Ingresso inválido ou já utilizado'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Camera error ────────────────────────────────────────────────── */}
      {cameraError && (
        <div className="flex items-center gap-2 bg-status-warning/10 border border-status-warning/30 px-4 py-2 text-sm text-status-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {cameraError}
        </div>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="border-t border-bg-border bg-bg-secondary px-4 py-4 space-y-3">

        {/* Camera toggle */}
        <div className="flex gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              disabled={!jsQRLoaded}
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-brand-yellow py-3 text-base font-bold text-brand-navy disabled:opacity-50 transition-opacity"
            >
              <Camera className="h-5 w-5" />
              {jsQRLoaded ? 'Ativar Câmera' : 'Carregando scanner...'}
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-bg-surface border border-bg-border py-3 text-base font-semibold text-text-secondary transition-colors hover:bg-bg-elevated"
            >
              <CameraOff className="h-5 w-5" />
              Desativar Câmera
            </button>
          )}
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="w-full rounded-sm border border-bg-border bg-bg-card pl-9 pr-3 py-3 font-mono text-base text-text-primary placeholder-text-muted focus:border-brand-yellow focus:outline-none transition-colors"
              placeholder="Token manual..."
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void validateToken(manualToken)
              }}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          <button
            onClick={() => void validateToken(manualToken)}
            disabled={processing || !manualToken.trim()}
            className="rounded-sm bg-brand-yellow px-4 py-3 font-bold text-brand-navy disabled:opacity-40 transition-opacity"
          >
            {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Override button */}
        <button
          onClick={() => {
            const token = manualToken.trim() || lastTokenRef.current
            if (token) void validateToken(token, true)
          }}
          disabled={processing || (!manualToken.trim() && !lastTokenRef.current)}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-status-warning/40 bg-status-warning/10 py-2.5 text-sm font-semibold text-status-warning disabled:opacity-40 hover:bg-status-warning/20 transition-colors"
        >
          <ShieldAlert className="h-4 w-4" />
          Override (Admin)
        </button>
      </div>
    </div>
  )
}
