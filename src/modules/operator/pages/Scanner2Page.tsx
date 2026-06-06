import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { supabase } from '@/lib/supabase'

type ValidationResult = {
  valid: boolean
  reason?: string
  message?: string
  name?: string
  ticketLabel?: string
  ticketType?: string
  attendeeId?: string
  ticketNumber?: string
  manualCode?: string
  email?: string
  cpf?: string
  army?: string
  kitStatus?: string
  category?: string
  debug_lookup?: string
  dryRun?: boolean
}

type AttendeeListItem = {
  id: string
  name: string
  email?: string | null
  ticketNumber?: string | null
  manualCode?: string | null
  army?: string | null
  category?: string | null
  kitStatus?: string | null
  status?: string
  checkedIn?: boolean
  checkedInAt?: string | null
}

interface Scanner2PageProps {
  scannerSlug: string
}

const SCANNER2_AUTH_STORAGE = 'scanner2.auth'
const SCANNER2_PASS_KEY = 'CSTRIKE-2026' // shared key (organizador-only)

const PULSE = {
  bg: '#06070a',
  surface: '#0d1118',
  text: '#f5f0e8',
  accent: '#D4FF00',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: 'rgba(245,240,232,0.55)',
}

function tone(label?: string | null) {
  const v = (label ?? '').toLowerCase()
  if (v.includes('coaliz')) return { bg: '#2563eb', fg: '#fff', label: 'Coalizão' }
  if (v.includes('alian')) return { bg: '#dc2626', fg: '#fff', label: 'Aliança' }
  return null
}

function kitTone(label?: string | null) {
  const v = (label ?? '').toLowerCase()
  if (v.includes('sem')) return { bg: '#1f2937', fg: '#fca5a5', text: 'SEM KIT' }
  if (v.includes('com')) return { bg: '#064e3b', fg: '#86efac', text: 'COM KIT' }
  return { bg: '#262626', fg: '#a3a3a3', text: 'KIT N/I' }
}

export default function Scanner2Page({ scannerSlug }: Scanner2PageProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState<string | null>(null)

  const [eventId, setEventId] = useState<string | null>(null)
  const [eventName, setEventName] = useState<string>('')

  const [mode, setMode] = useState<'camera' | 'manual' | 'list'>('camera')
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'fail'>('idle')

  const [result, setResult] = useState<ValidationResult | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [attendees, setAttendees] = useState<AttendeeListItem[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [scanCount, setScanCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastScannedRef = useRef<string>('')
  const lastScannedAtRef = useRef<number>(0)
  const processingRef = useRef(false)

  // ─── Bootstrap event id ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('events')
        .select('id,name')
        .eq('slug', scannerSlug)
        .single()
      if (!cancelled && data) {
        setEventId(data.id)
        setEventName(data.name ?? scannerSlug)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [scannerSlug])

  // ─── Restore unlock from storage ─────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SCANNER2_AUTH_STORAGE)
      if (saved === SCANNER2_PASS_KEY) setUnlocked(true)
    } catch { /* ignore */ }
  }, [])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (passInput.trim().toUpperCase() === SCANNER2_PASS_KEY) {
      try { window.localStorage.setItem(SCANNER2_AUTH_STORAGE, SCANNER2_PASS_KEY) } catch { /* ignore */ }
      setUnlocked(true)
      setPassError(null)
    } else {
      setPassError('Senha incorreta')
    }
  }

  // ─── Validation via edge (with service-role-key bypass session) ──────────
  const validate = useCallback(async (rawToken: string): Promise<ValidationResult> => {
    if (!eventId) return { valid: false, reason: 'no_event', message: 'Evento não carregado' }
    try {
      const { data, error } = await supabase.functions.invoke('operator-ticket-checkin', {
        body: {
          action: 'validate',
          event_id: eventId,
          token: rawToken,
          scanner_session: 'test-session-debug-12345', // shared scanner2 session
        },
      })
      if (error) return { valid: false, reason: 'error', message: error.message || 'Erro de rede' }
      return data as ValidationResult
    } catch (e: any) {
      return { valid: false, reason: 'error', message: e?.message ?? 'Erro inesperado' }
    }
  }, [eventId])

  const handleToken = useCallback(async (token: string, source: 'camera' | 'manual') => {
    const cleaned = token.trim()
    if (!cleaned) return
    const now = Date.now()
    if (source === 'camera' && cleaned === lastScannedRef.current && (now - lastScannedAtRef.current) < 3000) return
    if (processingRef.current) return
    processingRef.current = true
    lastScannedRef.current = cleaned
    lastScannedAtRef.current = now

    setScanState('processing')
    const res = await validate(cleaned)
    setResult(res)
    setScanState(res.valid ? 'success' : 'fail')
    if (res.valid) setScanCount((c) => c + 1)
    setTimeout(() => {
      setScanState('idle')
      processingRef.current = false
      if (!res.valid) setResult(null)
    }, res.valid ? 5000 : 4000)
  }, [validate])

  // ─── Camera scanner using jsQR ───────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (mode !== 'camera' || !unlocked) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      await video.play()
      setScanState('scanning')

      const tick = () => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) {
          rafRef.current = null
          return
        }
        const vw = videoRef.current.videoWidth
        const vh = videoRef.current.videoHeight
        if (vw > 0 && vh > 0 && !processingRef.current) {
          const canvas = canvasRef.current
          canvas.width = vw
          canvas.height = vh
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, vw, vh)
            const img = ctx.getImageData(0, 0, vw, vh)
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' })
            if (code?.data) {
              void handleToken(code.data, 'camera')
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err: any) {
      setResult({ valid: false, reason: 'camera', message: err?.message ?? 'Erro ao abrir câmera' })
      setScanState('fail')
    }
  }, [handleToken, mode, unlocked])

  useEffect(() => {
    if (mode === 'camera' && unlocked) {
      void startCamera()
    } else {
      stopCamera()
    }
    return () => { stopCamera() }
  }, [mode, unlocked, startCamera, stopCamera])

  // ─── Attendee list ───────────────────────────────────────────────────────
  const loadAttendees = useCallback(async () => {
    if (!eventId) return
    setAttendeesLoading(true)
    try {
      const { data } = await supabase.functions.invoke('operator-ticket-checkin', {
        body: {
          action: 'list',
          event_id: eventId,
          scanner_session: 'test-session-debug-12345',
        },
      })
      const list = ((data as any)?.tickets ?? []) as AttendeeListItem[]
      setAttendees(list)
    } finally {
      setAttendeesLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (unlocked && eventId) void loadAttendees()
  }, [unlocked, eventId, loadAttendees, scanCount])

  // ─── Render: Lock screen ────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: PULSE.bg, color: PULSE.text }}>
        <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: PULSE.accent }}>Scanner 2.0</p>
            <h1 className="mt-2 text-2xl font-black">Capital Strike</h1>
            <p className="mt-2 text-sm" style={{ color: PULSE.muted }}>Acesso restrito da operação</p>
          </div>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Senha da operação"
            autoFocus
            className="w-full rounded-2xl border px-4 py-4 text-base outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: PULSE.text }}
          />
          {passError && <p className="text-sm" style={{ color: PULSE.danger }}>{passError}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.2em]"
            style={{ background: PULSE.accent, color: PULSE.bg }}
          >Entrar</button>
          <p className="text-xs text-center" style={{ color: PULSE.muted }}>
            Pegue a senha com o organizador
          </p>
        </form>
      </div>
    )
  }

  // ─── Render: Main scanner UI ────────────────────────────────────────────
  const army = result?.valid ? tone(result.army) : null
  const kit = result?.valid ? kitTone(result.kitStatus) : null

  return (
    <div className="min-h-screen pb-24" style={{ background: PULSE.bg, color: PULSE.text }}>
      {/* Header */}
      <header className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: PULSE.accent }}>Scanner 2.0</p>
            <h1 className="text-base font-bold leading-tight">{eventName || scannerSlug}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: PULSE.muted }}>Check-ins hoje</p>
            <p className="text-2xl font-mono font-bold tabular-nums" style={{ color: PULSE.accent }}>{scanCount}</p>
          </div>
        </div>
      </header>

      {/* Mode tabs */}
      <div className="px-5 py-3 flex gap-2">
        {(['camera', 'manual', 'list'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider"
            style={{
              background: mode === m ? PULSE.accent : 'rgba(255,255,255,0.05)',
              color: mode === m ? PULSE.bg : PULSE.text,
            }}
          >
            {m === 'camera' ? '📷 Câmera' : m === 'manual' ? '⌨️ Manual' : '🔍 Lista'}
          </button>
        ))}
      </div>

      {/* Result card (always visible when has result) */}
      {result && (
        <div className="px-5 pb-3">
          <div
            className="rounded-2xl border-2 p-4"
            style={{
              borderColor: result.valid ? PULSE.success : PULSE.danger,
              background: result.valid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: result.valid ? PULSE.success : PULSE.danger, color: '#fff' }}
              >{result.valid ? '✓' : '✗'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: result.valid ? PULSE.success : PULSE.danger }}>
                  {result.valid ? 'Check-in liberado' : result.message ?? 'Inválido'}
                </p>
                <p className="text-lg font-bold leading-tight truncate">{result.name ?? '-'}</p>
                {result.email && <p className="text-xs truncate" style={{ color: PULSE.muted }}>{result.email}</p>}
              </div>
            </div>
            {result.valid && (
              <div className="mt-3 flex flex-wrap gap-2">
                {army && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: army.bg, color: army.fg }}>
                    {army.label}
                  </span>
                )}
                {result.category && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold border" style={{ borderColor: 'rgba(255,255,255,0.15)', color: PULSE.text }}>
                    {result.category}
                  </span>
                )}
                {kit && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: kit.bg, color: kit.fg }}>
                    {kit.text}
                  </span>
                )}
              </div>
            )}
            {!result.valid && result.debug_lookup && (
              <p className="mt-2 text-[10px] font-mono" style={{ color: PULSE.muted }}>
                Lido: {result.debug_lookup}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="px-5">
          <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: 'rgba(255,255,255,0.08)', aspectRatio: '1 / 1' }}>
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="h-2/3 w-2/3 border-4 rounded-2xl" style={{ borderColor: PULSE.accent }} />
            </div>
            <div className="absolute top-3 left-3 right-3 flex justify-between text-xs font-mono">
              <span className="px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', color: PULSE.accent }}>jsQR</span>
              <span className="px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', color: PULSE.text }}>
                {scanState === 'processing' ? 'validando…' : scanState === 'scanning' ? 'lendo' : scanState}
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs" style={{ color: PULSE.muted }}>
            Aponte para o QR code do ingresso. Se não funcionar, use Manual ou Lista.
          </p>
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="px-5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleToken(manualInput, 'manual')
              setManualInput('')
            }}
            className="space-y-3"
          >
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: PULSE.muted }}>
              Cole/digite o código do QR ou ticket
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Ex: aa9f8e4f-4575-... ou CS-12345... ou AA9F8E4F"
              autoFocus
              autoComplete="off"
              className="w-full rounded-2xl border px-4 py-4 text-base font-mono outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: PULSE.text }}
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || scanState === 'processing'}
              className="w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.2em] disabled:opacity-40"
              style={{ background: PULSE.accent, color: PULSE.bg }}
            >Validar ingresso</button>
          </form>
        </div>
      )}

      {/* List mode */}
      {mode === 'list' && (
        <div className="px-5 space-y-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, email ou código..."
            autoComplete="off"
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: PULSE.text }}
          />
          {attendeesLoading && <p className="text-center text-sm" style={{ color: PULSE.muted }}>Carregando…</p>}
          {!attendeesLoading && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
              {attendees
                .filter((a) => {
                  const q = searchInput.trim().toLowerCase()
                  if (!q) return true
                  return [a.name, a.email, a.ticketNumber, a.manualCode]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q))
                })
                .slice(0, 60)
                .map((a) => {
                  const at = tone(a.army)
                  const kt = kitTone(a.kitStatus)
                  return (
                    <button
                      key={a.id}
                      onClick={() => void handleToken(a.manualCode ?? a.ticketNumber ?? a.id, 'manual')}
                      disabled={Boolean(a.checkedIn)}
                      className="w-full text-left rounded-xl border p-3 transition-all"
                      style={{
                        borderColor: a.checkedIn ? PULSE.success : 'rgba(255,255,255,0.08)',
                        background: a.checkedIn ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                        opacity: a.checkedIn ? 0.65 : 1,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <p className="flex-1 font-bold text-sm truncate">{a.name}</p>
                        {a.checkedIn && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: PULSE.success, color: '#000' }}>
                            ✓ Check-in
                          </span>
                        )}
                      </div>
                      {a.email && <p className="text-[11px] truncate" style={{ color: PULSE.muted }}>{a.email}</p>}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {at && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: at.bg, color: at.fg }}>{at.label}</span>}
                        {a.category && <span className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{a.category}</span>}
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: kt.bg, color: kt.fg }}>{kt.text}</span>
                      </div>
                    </button>
                  )
                })}
              {attendees.length === 0 && !attendeesLoading && (
                <p className="text-center text-sm py-8" style={{ color: PULSE.muted }}>Nenhum inscrito carregado</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
