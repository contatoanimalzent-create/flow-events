import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, CheckCircle, XCircle, Loader2, Keyboard, Camera, AlertTriangle, Mail, ShieldCheck, KeyRound, Lock, ListChecks, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppContext } from '@/core/context/app-context.store'
import { useOffline } from '@/core/offline/offline.store'
import { operatorService } from '@/core/operator/operator.service'
import type { OperatorTicketListItem } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type ScanState = 'idle' | 'scanning' | 'processing' | 'valid' | 'invalid'
type InputMode = 'camera' | 'manual' | 'list'
type CameraPermissionState = 'idle' | 'requesting' | 'granted'

interface ScanResult {
  valid: boolean
  name: string
  ticketLabel: string
  message: string
  cpf?: string | null
  email?: string | null
  ticketNumber?: string | null
  manualCode?: string | null
  army?: string | null
  kitStatus?: string | null
  category?: string | null
}

interface DirectScannerEvent {
  id: string
  name: string
  slug: string
}

interface ScannerPageProps extends PulsePageProps {
  scannerSlug?: string
  standalone?: boolean
}

type AuthStep = 'email' | 'code' | 'unlocked'

export default function ScannerPage({ onNavigate, scannerSlug, standalone = false }: ScannerPageProps) {
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('camera')
  const [manualCode, setManualCode] = useState('')
  const [scanCount, setScanCount] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>('idle')
  const [scannerReady, setScannerReady] = useState(false)
  const [directEvent, setDirectEvent] = useState<DirectScannerEvent | null>(null)
  const [directEventLoading, setDirectEventLoading] = useState(Boolean(scannerSlug))
  const [authCode, setAuthCode] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('email')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)
  const [scannerSession, setScannerSession] = useState<string | null>(null)
  const [attendees, setAttendees] = useState<OperatorTicketListItem[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [attendeeSearch, setAttendeeSearch] = useState('')

  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()

  const resultTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const scannerRef = useRef<any>(null)
  const Html5QrcodeRef = useRef<any>(null)
  const linePos = useRef(0)
  const [linePct, setLinePct] = useState(0)

  const activeEventId = directEvent?.id ?? context?.eventId ?? null
  const activeEventName = directEvent?.name ?? context?.eventName ?? 'Scanner'
  const scannerAuthKey = useMemo(
    () => activeEventId ? `pulse-scanner-auth:${activeEventId}` : null,
    [activeEventId],
  )

  const loadAttendees = useCallback(async () => {
    if (!activeEventId || authStep !== 'unlocked') return
    setAttendeesLoading(true)
    try {
      const list = await operatorService.listEventTickets(activeEventId, scannerSession ?? undefined)
      setAttendees(list)
    } finally {
      setAttendeesLoading(false)
    }
  }, [activeEventId, authStep, scannerSession])

  useEffect(() => {
    if (!scannerSlug) return
    let cancelled = false
    setDirectEventLoading(true)
    async function loadDirectEvent() {
      const { data } = await supabase
        .from('events')
        .select('id,name,slug')
        .eq('slug', scannerSlug)
        .maybeSingle()
      if (cancelled) return
      setDirectEvent(data as DirectScannerEvent | null)
      setDirectEventLoading(false)
    }
    void loadDirectEvent()
    return () => { cancelled = true }
  }, [scannerSlug])

  useEffect(() => {
    if (!scannerAuthKey || (!activeEventId && !scannerSlug)) return
    let cancelled = false
    try {
      const raw = window.localStorage.getItem(scannerAuthKey)
      if (!raw) return
      const saved = JSON.parse(raw) as { expires_at?: string; email?: string; session?: string }
      if (saved.expires_at && new Date(saved.expires_at).getTime() > Date.now()) {
        if (!saved.session) {
          window.localStorage.removeItem(scannerAuthKey)
          return
        }
        setAuthLoading(true)
        operatorService.checkScannerSession({
          eventId: activeEventId ?? undefined,
          eventSlug: scannerSlug,
          scannerSession: saved.session,
        }).then(() => {
          if (!cancelled) {
            setScannerSession(saved.session ?? null)
            setAuthStep('unlocked')
          }
        }).catch(() => {
          window.localStorage.removeItem(scannerAuthKey)
          if (!cancelled) setScannerSession(null)
        }).finally(() => {
          if (!cancelled) setAuthLoading(false)
        })
      } else {
        window.localStorage.removeItem(scannerAuthKey)
      }
    } catch {
      window.localStorage.removeItem(scannerAuthKey)
    }
    return () => { cancelled = true }
  }, [activeEventId, scannerAuthKey, scannerSlug])

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

  // Load html5-qrcode dynamically (ESM compatible)
  useEffect(() => {
    let cancelled = false
    import('html5-qrcode')
      .then((mod) => {
        if (!cancelled) {
          Html5QrcodeRef.current = mod.Html5Qrcode
          setScannerReady(true)
        }
      })
      .catch(() => {
        setCameraError('Scanner QR não disponível, use entrada manual')
      })
    return () => { cancelled = true }
  }, [])

  // Start html5-qrcode camera scanner
  useEffect(() => {
    return

    const scanner = new Html5QrcodeRef.current(
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
  }, [authStep, inputMode, scannerReady])

  const handleScan = useCallback(async (token: string) => {
    if (!token.trim() || scanState === 'processing' || authStep !== 'unlocked') return
    setScanState('processing')
    clearTimeout(resultTimerRef.current)

    try {
      let res: ScanResult

      if (isOnline && activeEventId) {
        const validation = await operatorService.validateToken(token.trim(), activeEventId, undefined, scannerSession ?? undefined)
        if (validation.valid) {
          res = {
            valid: true,
            name: validation.name,
            ticketLabel: validation.ticketLabel,
            message: validation.message,
            cpf: validation.cpf,
            email: validation.email,
            ticketNumber: validation.ticketNumber,
            manualCode: validation.manualCode,
            army: validation.army,
            kitStatus: validation.kitStatus,
            category: validation.category,
          }
          setScanCount((c) => c + 1)
          void loadAttendees()
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
          eventId: activeEventId,
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
      setResult({ valid: false, name: '-', ticketLabel: token.slice(0, 16), message: 'Erro na válidação' })
      setScanState('invalid')
    }

    resultTimerRef.current = setTimeout(() => {
      setScanState('idle')
      setResult(null)
      setManualCode('')
    }, 6_000)
  }, [activeEventId, authStep, context?.eventId, isOnline, enqueue, loadAttendees, scanState, scannerSession])

  const stopCameraScanner = useCallback(async () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (!scanner) return
    try {
      await scanner.stop()
    } catch {
      // Already stopped.
    }
    try {
      await scanner.clear()
    } catch {
      // The camera element may already be gone.
    }
  }, [])

  const startCameraScanner = useCallback(async () => {
    if (authStep !== 'unlocked' || inputMode !== 'camera') return
    if (!scannerReady || !Html5QrcodeRef.current) {
      setCameraError('Scanner QR ainda carregando. Tente novamente em alguns segundos.')
      return
    }

    setCameraError(null)
    setCameraPermission('requesting')

    try {
      if (!window.isSecureContext) throw new Error('Abra o scanner em HTTPS para liberar a câmera.')
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não liberou acesso à câmera.')

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      permissionStream.getTracks().forEach((track) => track.stop())

      await stopCameraScanner()
      const scanner = new Html5QrcodeRef.current('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10 },
        (decodedText: string) => {
          if (scanState !== 'processing') handleScan(decodedText)
        },
        () => {},
      )

      setCameraPermission('granted')
    } catch (err) {
      await stopCameraScanner()
      setCameraPermission('idle')
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir a câmera. Autorize a câmera no navegador e tente novamente.',
      )
    }
  }, [authStep, handleScan, inputMode, scanState, scannerReady, stopCameraScanner])

  useEffect(() => {
    if (authStep !== 'unlocked' || inputMode !== 'camera') {
      void stopCameraScanner()
      setCameraPermission('idle')
    }
  }, [authStep, inputMode, stopCameraScanner])

  useEffect(() => {
    if (authStep === 'unlocked') void loadAttendees()
  }, [authStep, loadAttendees])

  useEffect(() => {
    if (inputMode === 'list') void loadAttendees()
  }, [inputMode, loadAttendees])

  useEffect(() => () => { void stopCameraScanner() }, [stopCameraScanner])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(manualCode)
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEventId && !scannerSlug) {
      setAuthError('Evento não encontrado para liberar o scanner.')
      return
    }
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await operatorService.requestScannerCode({
        eventId: activeEventId ?? undefined,
        eventSlug: scannerSlug,
      })
      setMaskedEmail(response.masked_email ?? null)
      setAuthStep('code')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Não foi possível enviar o código.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEventId && !scannerSlug) {
      setAuthError('Evento não encontrado para liberar o scanner.')
      return
    }
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await operatorService.verifyScannerCode({
        eventId: activeEventId ?? undefined,
        eventSlug: scannerSlug,
        code: authCode,
      })
      if (scannerAuthKey) {
        window.localStorage.setItem(scannerAuthKey, JSON.stringify({
          session: response.scanner_session,
          expires_at: response.expires_at,
        }))
      }
      setScannerSession(response.scanner_session ?? null)
      setAuthStep('unlocked')
      setAuthCode('')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Código inválido.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLockScanner = () => {
    void stopCameraScanner()
    if (scannerAuthKey) window.localStorage.removeItem(scannerAuthKey)
    setScannerSession(null)
    setAuthStep('email')
    setAuthCode('')
    setScanCount(0)
    setCameraPermission('idle')
  }

  const isResultShown = scanState === 'valid' || scanState === 'invalid'
  const accent = '#0057E7'
  const attendeeStats = useMemo(() => {
    const checked = attendees.filter((item) => item.checkedIn).length
    return { total: attendees.length, checked, pending: attendees.length - checked }
  }, [attendees])
  const filteredAttendees = useMemo(() => {
    const q = attendeeSearch.trim().toLowerCase()
    if (!q) return attendees
    return attendees.filter((item) => {
      const haystack = [
        item.name,
        item.cpf,
        item.email,
        item.army,
        item.category,
        item.manualCode,
        item.ticketNumber,
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [attendeeSearch, attendees])

  if (directEventLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050816] text-white">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    )
  }

  if (scannerSlug && !directEvent) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050816] px-6 text-center text-white">
        <div>
          <AlertTriangle size={34} className="mx-auto mb-3 text-amber-400" />
          <h1 className="text-lg font-bold">Evento não encontrado</h1>
          <p className="mt-2 text-sm text-slate-400">Confira o link do scanner e tente novamente.</p>
        </div>
      </div>
    )
  }

  if (authStep !== 'unlocked') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050816] px-5 py-6 text-white">
        <div className="w-full max-w-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Scanner seguro</p>
            <h1 className="mt-1 text-xl font-bold">{activeEventName}</h1>
          </div>
          {!standalone && (
            <button
              onClick={() => onNavigate('/pulse/operator')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
            {authStep === 'email' ? <Mail size={22} /> : <KeyRound size={22} />}
          </div>
          <h2 className="text-lg font-bold">
            {authStep === 'email' ? 'Solicitar codigo ao produtor' : 'Digite o codigo liberado'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {authStep === 'email'
              ? 'O codigo vai para o e-mail do produtor do evento. Ele repassa para a equipe autorizada.'
              : `O codigo foi enviado para ${maskedEmail ?? 'o produtor do evento'}.`}
          </p>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Evento
          </label>
          <select
            value={scannerSlug ?? activeEventId ?? ''}
            disabled
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none"
          >
            <option value={scannerSlug ?? activeEventId ?? ''}>{activeEventName}</option>
          </select>

          {authStep === 'email' ? (
            <form onSubmit={handleRequestCode} className="mt-5 space-y-3">
              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold disabled:opacity-45"
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Enviar codigo ao produtor
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="mt-5 space-y-3">
              <input
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center font-mono text-2xl tracking-[0.35em] text-white placeholder-slate-700 outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={authLoading || authCode.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold disabled:opacity-45"
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Abrir scanner
              </button>
              <button
                type="button"
                onClick={() => setAuthStep('email')}
                className="w-full py-2 text-sm text-slate-400"
              >
                Solicitar novo codigo
              </button>
            </form>
          )}

          {authError && (
            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {authError}
            </div>
          )}
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-black select-none">
      <style>{`
        #qr-reader,
        #qr-reader > div,
        #qr-reader__scan_region {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          border: 0 !important;
        }

        #qr-reader video {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        #qr-reader__dashboard,
        #qr-reader__dashboard_section,
        #qr-reader__camera_selection,
        #qr-shaded-region {
          display: none !important;
        }
      `}</style>
      {/* Top overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 12 }}
      >
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-white text-xs font-semibold">{activeEventName}</p>
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
            onClick={handleLockScanner}
            className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center"
            aria-label="Bloquear scanner"
          >
            <Lock size={15} className="text-white" />
          </button>
          {!standalone && (
            <button
              onClick={() => onNavigate('/pulse/operator')}
              className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center"
            >
              <X size={18} className="text-white" />
            </button>
          )}
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
          <button
            onClick={() => setInputMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${inputMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <ListChecks size={12} /> Lista
          </button>
        </div>
      </div>

      {/* Camera view */}
      <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#0a0f1e]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

        {inputMode === 'camera' ? (
          <>
            {/* html5-qrcode mounts here */}
            <div
              id="qr-reader"
              className={`absolute inset-0 h-full w-full overflow-hidden transition-opacity duration-300 [&_button]:hidden [&_div]:border-0 [&_img]:hidden [&_span]:hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover ${
                cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {cameraPermission !== 'granted' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/70 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                    <Camera size={26} />
                  </div>
                  <h2 className="text-lg font-bold text-white">Abrir câmera</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Toque no botão e permita o acesso à câmera para escanear o QR Code.
                  </p>
                  <button
                    type="button"
                    onClick={() => void startCameraScanner()}
                    disabled={cameraPermission === 'requesting' || !scannerReady}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {cameraPermission === 'requesting' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    {cameraPermission === 'requesting' ? 'Solicitando permissão...' : 'Permitir câmera'}
                  </button>
                </div>
              </div>
            )}

            {/* Visual frame */}
            <div className={`relative z-10 h-60 w-60 ${cameraPermission === 'granted' ? 'block' : 'hidden'}`}>
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
        ) : inputMode === 'manual' ? (
          /* Manual entry */
          <div className="w-full px-8 z-10">
            <p className="text-white font-semibold text-center mb-4">Digite o código do ingresso</p>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
              <input
                autoFocus
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                placeholder="Ex: A1B2C3D4"
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
        ) : (
          <div className="z-10 flex h-full w-full flex-col px-4 pb-24 pt-32 text-white">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Total</p>
                <p className="text-lg font-bold">{attendeeStats.total}</p>
              </div>
              <div className="rounded-xl bg-green-500/15 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-green-200/70">OK</p>
                <p className="text-lg font-bold text-green-300">{attendeeStats.checked}</p>
              </div>
              <div className="rounded-xl bg-amber-500/15 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Pendentes</p>
                <p className="text-lg font-bold text-amber-300">{attendeeStats.pending}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2">
              <Search size={15} className="text-slate-500" />
              <input
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Buscar nome, CPF, exercito ou codigo"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/45">
              {attendeesLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-blue-300" />
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="flex h-32 items-center justify-center px-5 text-center text-sm text-slate-500">
                  Nenhum inscrito encontrado.
                </div>
              ) : (
                filteredAttendees.map((item) => (
                  <div key={item.id} className="border-b border-white/8 px-3 py-3 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{item.name}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {[item.army, item.category, item.kitStatus].filter(Boolean).join(' - ')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-slate-400">
                          {item.manualCode && <span className="rounded bg-white/10 px-2 py-0.5 text-blue-200">{item.manualCode}</span>}
                          {item.cpf && <span>{item.cpf}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        item.checkedIn ? 'bg-green-400/18 text-green-200' : 'bg-amber-400/18 text-amber-200'
                      }`}>
                        {item.checkedIn ? 'OK' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Result card */}
        {isResultShown && result && (
          <div
            className="absolute left-4 right-4 rounded-2xl p-4 border z-20"
            style={{
              bottom: 88,
              backgroundColor: result.valid ? '#052e16' : '#450a0a',
              borderColor: result.valid ? '#22C55E44' : '#EF444444',
            }}
          >
            <div className="flex items-start gap-3">
              {result.valid
                ? <CheckCircle size={28} className="text-green-400 shrink-0" />
                : <XCircle size={28} className="text-red-400 shrink-0" />
              }
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold leading-tight">{result.name}</p>
                {result.valid && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.army && (
                      <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                        {result.army}
                      </span>
                    )}
                    {result.kitStatus && (
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        result.kitStatus.toLowerCase().includes('sem')
                          ? 'bg-amber-400/18 text-amber-200'
                          : result.kitStatus.toLowerCase().includes('não') || result.kitStatus.toLowerCase().includes('nao')
                            ? 'bg-slate-400/15 text-slate-200'
                          : 'bg-emerald-400/18 text-emerald-200'
                      }`}>
                        {result.kitStatus}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-2 space-y-0.5 text-xs text-slate-300">
                  <p>{result.category || result.ticketLabel}</p>
                  {result.cpf && <p className="font-mono text-slate-400">CPF {result.cpf}</p>}
                  {result.email && <p className="truncate text-slate-400">{result.email}</p>}
                  {result.manualCode && <p className="font-mono text-blue-200">Codigo {result.manualCode}</p>}
                  {result.ticketNumber && <p className="font-mono text-[11px] text-slate-500">{result.ticketNumber}</p>}
                </div>
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
