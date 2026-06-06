import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Camera, CheckCircle2, Keyboard, ListChecks, Loader2, Lock, Search, XCircle } from 'lucide-react'
import jsQR from 'jsqr'
import { supabase } from '@/lib/supabase'
import { operatorService, type OperatorTicketListItem, type ValidationResult } from '@/core/operator/operator.service'

type Mode = 'camera' | 'manual' | 'list'

interface Scanner2PageProps {
  scannerSlug: string
}

interface EventInfo {
  id: string
  name: string
  slug: string
}

type Scanner2Result =
  | Extract<ValidationResult, { valid: true }>
  | {
      valid: false
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

const ACCESS_PASSWORD = 'CSTRIKE-2026'
const STORAGE_KEY_PREFIX = 'pulse-scanner2-auth'

function compact(value: string) {
  return value.trim().replace(/\s+/g, '')
}

function resultFromValidation(validation: ValidationResult) {
  if (validation.valid) return validation
  return {
    valid: false as const,
    name: validation.name ?? '-',
    ticketLabel: validation.ticketLabel ?? validation.reason,
    message: validation.message,
    cpf: validation.cpf,
    email: validation.email,
    ticketNumber: validation.ticketNumber,
    manualCode: validation.manualCode,
    army: validation.army,
    kitStatus: validation.kitStatus,
    category: validation.category,
  }
}

function kitTone(kit?: string | null) {
  const normalized = String(kit ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normalized.includes('sem')) return 'bg-red-500/18 text-red-200 border-red-400/25'
  if (normalized.includes('com')) return 'bg-green-500/18 text-green-200 border-green-400/25'
  return 'bg-slate-500/18 text-slate-200 border-slate-400/20'
}

function kitDisplay(kit?: string | null, ...fallbackValues: Array<string | null | undefined>) {
  const raw = [kit, ...fallbackValues].filter(Boolean).join(' ')
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normalized.includes('sem') && normalized.includes('kit')) {
    return { label: 'SEM KIT', detail: 'Nao habilitado para entrega de kit', enabled: false }
  }
  if (normalized.includes('com') && normalized.includes('kit')) {
    return { label: 'COM KIT', detail: 'Habilitado para entrega de kit', enabled: true }
  }
  if (normalized.includes('kit')) {
    return { label: 'COM KIT', detail: 'Habilitado para entrega de kit', enabled: true }
  }
  return { label: 'SEM KIT', detail: 'Nao habilitado para entrega de kit', enabled: false }
}

export default function Scanner2Page({ scannerSlug }: Scanner2PageProps) {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('camera')
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState<Scanner2Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const jsQrReady = true
  const [attendees, setAttendees] = useState<OperatorTicketListItem[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [scanCount, setScanCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastScanRef = useRef<{ token: string; at: number }>({ token: '', at: 0 })
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const storageKey = `${STORAGE_KEY_PREFIX}:${scannerSlug}`
  const scannerSession = ACCESS_PASSWORD

  const stats = useMemo(() => {
    const checked = attendees.filter((item) => item.checkedIn).length
    return { total: attendees.length, checked, pending: attendees.length - checked }
  }, [attendees])

  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return attendees
    return attendees.filter((item) => [
      item.name,
      item.email,
      item.cpf,
      item.army,
      item.category,
      item.kitStatus,
      item.manualCode,
      item.ticketNumber,
    ].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [attendees, search])

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const loadAttendees = useCallback(async () => {
    if (!eventInfo?.id || !unlocked) return
    setAttendeesLoading(true)
    try {
      const list = await operatorService.listEventTickets(eventInfo.id, scannerSession)
      setAttendees(list)
    } finally {
      setAttendeesLoading(false)
    }
  }, [eventInfo?.id, unlocked])

  const validateToken = useCallback(async (rawToken: string) => {
    const token = compact(rawToken)
    if (!eventInfo?.id || !token || busy) return

    const now = Date.now()
    if (lastScanRef.current.token === token && now - lastScanRef.current.at < 3000) return
    lastScanRef.current = { token, at: now }

    setBusy(true)
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    try {
      const validation = await operatorService.validateToken(token, eventInfo.id, undefined, scannerSession)
      const mapped = resultFromValidation(validation)
      setResult(mapped)
      if (validation.valid) {
        setScanCount((current) => current + 1)
        void loadAttendees()
      }
    } catch (error) {
      setResult({
        valid: false,
        name: '-',
        ticketLabel: 'erro',
        message: error instanceof Error ? error.message : 'Erro ao validar ingresso',
      })
    } finally {
      setBusy(false)
      clearTimerRef.current = setTimeout(() => setResult(null), 7000)
    }
  }, [busy, eventInfo?.id, loadAttendees])

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(video, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const code = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })
    if (code?.data) void validateToken(code.data)
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [validateToken])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      if (!window.isSecureContext) throw new Error('Abra em HTTPS para liberar a câmera.')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch (error) {
      stopCamera()
      setCameraError(error instanceof Error ? error.message : 'Não foi possível abrir a câmera.')
    }
  }, [scanFrame, stopCamera])

  useEffect(() => {
    let cancelled = false
    setLoadingEvent(true)

    async function loadEvent() {
      try {
        const { data } = await supabase
          .from('events')
          .select('id,name,slug')
          .eq('slug', scannerSlug)
          .maybeSingle()
        if (!cancelled) setEventInfo((data as EventInfo | null) ?? null)
      } finally {
        if (!cancelled) setLoadingEvent(false)
      }
    }

    void loadEvent()
    return () => { cancelled = true }
  }, [scannerSlug])

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(storageKey) === 'ok')
  }, [storageKey])

  useEffect(() => {
    if (unlocked) void loadAttendees()
  }, [unlocked, loadAttendees])

  useEffect(() => {
    if (mode !== 'camera') stopCamera()
  }, [mode, stopCamera])

  useEffect(() => () => {
    stopCamera()
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
  }, [stopCamera])

  function unlock(event: React.FormEvent) {
    event.preventDefault()
    if (password.trim() !== ACCESS_PASSWORD) return
    window.localStorage.setItem(storageKey, 'ok')
    setUnlocked(true)
  }

  function submitManual(event: React.FormEvent) {
    event.preventDefault()
    void validateToken(manualCode)
    setManualCode('')
  }

  if (loadingEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!eventInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-300" />
          <h1 className="mt-4 text-xl font-bold">Evento não encontrado</h1>
          <p className="mt-2 text-sm text-slate-400">Confira o link do scanner.</p>
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <form onSubmit={unlock} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Scanner 2.0</p>
          <h1 className="mt-2 text-xl font-bold">{eventInfo.name}</h1>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value.toUpperCase())}
            placeholder="Senha operacional"
            className="mt-5 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-center font-mono text-white outline-none focus:border-blue-400"
            autoFocus
          />
          <button className="mt-3 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white disabled:opacity-50" disabled={password.trim() !== ACCESS_PASSWORD}>
            Abrir scanner
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{eventInfo.name}</p>
            <p className="text-[11px] text-slate-500">Scanner 2.0</p>
          </div>
          <div className="rounded-full bg-green-500/15 px-3 py-1 text-sm font-black text-green-200">
            {scanCount}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/8 p-1">
          {([
            ['camera', Camera, 'Câmera'],
            ['manual', Keyboard, 'Manual'],
            ['list', ListChecks, 'Lista'],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold ${mode === key ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'camera' && (
        <section className="relative flex min-h-[calc(100vh-124px)] items-center justify-center overflow-hidden bg-[#070b15]">
          <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`} />
          <canvas ref={canvasRef} className="hidden" />

          {!cameraActive && (
            <div className="relative z-10 w-full max-w-sm px-5 text-center">
              <div className="rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur">
                <Camera className="mx-auto h-10 w-10 text-blue-300" />
                <h2 className="mt-3 text-lg font-bold">Abrir câmera</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Permita a câmera e aponte para o QR Code.</p>
                <button onClick={() => void startCamera()} className="mt-5 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold disabled:opacity-50" disabled={!jsQrReady}>
                  {jsQrReady ? 'Permitir câmera' : 'Carregando leitor...'}
                </button>
                {cameraError && <p className="mt-3 text-sm text-amber-200">{cameraError}</p>}
              </div>
            </div>
          )}

          {cameraActive && (
            <>
              <div className="relative z-10 h-64 w-64">
                <div className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-blue-500" />
                <div className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-blue-500" />
                <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-blue-500" />
                <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-blue-500" />
              </div>
              <p className="absolute bottom-16 z-10 text-sm text-white/60">Aponte para o QR Code</p>
            </>
          )}
        </section>
      )}

      {mode === 'manual' && (
        <section className="px-5 py-8">
          <form onSubmit={submitManual} className="mx-auto max-w-md">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Código, UUID ou ticket</label>
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value.toUpperCase())}
              placeholder="Ex: 33F4F9BB"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-center font-mono text-lg text-white outline-none focus:border-blue-400"
              autoFocus
            />
            <button disabled={!manualCode.trim() || busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Validar
            </button>
          </form>
        </section>
      )}

      {mode === 'list' && (
        <section className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/10 p-3 text-center"><p className="text-[10px] text-slate-400">Total</p><strong>{stats.total}</strong></div>
            <div className="rounded-xl bg-green-500/15 p-3 text-center"><p className="text-[10px] text-green-200/70">OK</p><strong className="text-green-200">{stats.checked}</strong></div>
            <div className="rounded-xl bg-amber-500/15 p-3 text-center"><p className="text-[10px] text-amber-200/70">Pendentes</p><strong className="text-amber-200">{stats.pending}</strong></div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, CPF, exército ou código" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" />
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {attendeesLoading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-300" /></div>
            ) : filteredAttendees.map((item) => (
              <button key={item.id} onClick={() => item.manualCode && validateToken(item.manualCode)} className="block w-full border-b border-white/8 px-3 py-3 text-left last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{[item.army, item.category, item.kitStatus].filter(Boolean).join(' - ')}</p>
                    <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-slate-400">
                      {item.manualCode && <span className="rounded bg-blue-500/15 px-2 py-0.5 text-blue-200">{item.manualCode}</span>}
                      {item.cpf && <span>{item.cpf}</span>}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${item.checkedIn ? 'bg-green-500/18 text-green-200' : 'bg-amber-500/18 text-amber-200'}`}>
                    {item.checkedIn ? 'OK' : 'Pendente'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {result && (
        <div className="fixed bottom-4 left-4 right-4 z-30 rounded-2xl border p-4 shadow-2xl shadow-black/60" style={{ background: result.valid ? '#052e16' : '#450a0a', borderColor: result.valid ? '#22c55e55' : '#ef444455' }}>
          <div className="flex gap-3">
            {result.valid ? <CheckCircle2 className="h-8 w-8 shrink-0 text-green-300" /> : <XCircle className="h-8 w-8 shrink-0 text-red-300" />}
            <div className="min-w-0 flex-1">
              <p className="font-black">{result.name}</p>
              {('kitStatus' in result || 'category' in result || 'ticketLabel' in result) && (() => {
                const kit = kitDisplay(
                  'kitStatus' in result ? result.kitStatus : null,
                  'category' in result ? result.category : null,
                  result.ticketLabel,
                )
                return (
                  <div className={`mt-3 rounded-2xl border px-3 py-3 ${kit.enabled ? 'border-green-300/35 bg-green-400/15 text-green-100' : 'border-red-300/35 bg-red-400/15 text-red-100'}`}>
                    <div className="text-2xl font-black leading-none">{kit.label}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em]">{kit.detail}</div>
                  </div>
                )
              })()}
              {('army' in result || 'kitStatus' in result) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {'army' in result && result.army && <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase">{result.army}</span>}
                  {'kitStatus' in result && result.kitStatus && <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase ${kitTone(result.kitStatus)}`}>{result.kitStatus}</span>}
                </div>
              )}
              {'category' in result && result.category && <p className="mt-2 text-xs text-slate-300">{result.category}</p>}
              {'manualCode' in result && result.manualCode && <p className="mt-1 font-mono text-xs text-blue-200">Código {result.manualCode}</p>}
              <p className={`mt-1 text-xs ${result.valid ? 'text-green-200' : 'text-red-200'}`}>{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
