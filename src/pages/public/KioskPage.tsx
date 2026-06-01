/**
 * Kiosk Page — modo Totem na portaria (iPad).
 *
 * Fluxo:
 * 1. Operador abre /kiosk/[event_slug] no iPad → tela fullscreen
 * 2. Staff digita PIN (4 dígitos) ou CPF
 * 3. Tira selfie (foto obrigatória pra staff)
 * 4. Sistema bate Entrada ou Saída (botão grande)
 * 5. Reset auto 5s → próxima pessoa
 *
 * Suporta:
 * - Idempotência via client_id (UUID por batida)
 * - Offline queue (a ser adicionado em D2 com IndexedDB)
 * - Reuso da câmera entre batidas (1 stream só)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Hash,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  RotateCcw,
  User,
  WifiOff,
  X,
} from 'lucide-react'

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kiosk-checkin`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

type Step = 'idle' | 'identify' | 'identified' | 'camera' | 'submitting' | 'success' | 'error'
type InputMode = 'pin' | 'cpf'

interface StaffInfo {
  id: string
  name: string
  role: string | null
  area: string | null
  photo_required: boolean
}

interface LookupResponse {
  event: { id: string; name: string; venue: { latitude: number; longitude: number } | null; radius: number | null }
  staff: StaffInfo
  last_action: { type: 'checkin' | 'checkout'; at: string } | null
  suggested_action: 'checkin' | 'checkout'
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getEventSlugFromPath(): string {
  // /kiosk/[slug]
  const match = window.location.pathname.match(/^\/kiosk\/([^/]+)/)
  return match?.[1] ?? ''
}

export function KioskPage() {
  const eventSlug = useMemo(() => getEventSlugFromPath(), [])
  const [step, setStep] = useState<Step>('idle')
  const [inputMode, setInputMode] = useState<InputMode>('pin')
  const [input, setInput] = useState('')
  const [staff, setStaff] = useState<StaffInfo | null>(null)
  const [eventName, setEventName] = useState('')
  const [lastAction, setLastAction] = useState<LookupResponse['last_action']>(null)
  const [pendingType, setPendingType] = useState<'checkin' | 'checkout' | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ type: 'checkin' | 'checkout'; name: string } | null>(null)
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  const reset = useCallback(() => {
    setStep('identify')
    setInput('')
    setStaff(null)
    setLastAction(null)
    setPendingType(null)
    setPhotoDataUrl(null)
    setError('')
    setSuccess(null)
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    // Mantém stream da câmera viva pra próxima
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Inicia em "identify" ao carregar
  useEffect(() => {
    if (eventSlug) setStep('identify')
  }, [eventSlug])

  // Network status
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Cleanup câmera ao desmontar
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startCamera() {
    if (streamRef.current && streamRef.current.active) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setError('Permissão de câmera negada. Toque "Permitir" nas configurações do iPad.')
      setStep('error')
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!input.trim()) return

    setStep('submitting')
    try {
      const param = inputMode === 'pin' ? `pin=${encodeURIComponent(input.trim())}` : `cpf=${encodeURIComponent(input.replace(/\D/g, ''))}`
      const url = `${FN_URL}?event_slug=${encodeURIComponent(eventSlug)}&${param}`
      const res = await fetch(url, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Não encontrado.')
        setStep('identify')
        setInput('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }

      const data = (await res.json()) as LookupResponse
      setStaff(data.staff)
      setEventName(data.event.name)
      setLastAction(data.last_action)
      setStep('identified')
    } catch {
      setError('Erro de conexão. Tente de novo.')
      setStep('identify')
    }
  }

  async function chooseAction(type: 'checkin' | 'checkout') {
    setPendingType(type)
    setStep('camera')
    await startCamera()
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !pendingType || !staff) return
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Câmera ainda carregando. Aguarde 2s e tente de novo.')
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.7)
    setPhotoDataUrl(base64)
    void submitCheckin(base64)
  }

  async function submitCheckin(photoBase64: string) {
    if (!staff || !pendingType) return
    setStep('submitting')
    setError('')

    const clientId = uuid()
    let lat: number | null = null
    let lng: number | null = null
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 30000, enableHighAccuracy: false }),
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch { /* GPS opcional no kiosk */ }

    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          event_slug: eventSlug,
          staff_member_id: staff.id,
          type: pendingType,
          photo_base64: photoBase64,
          latitude: lat,
          longitude: lng,
          client_id: clientId,
          role_at_checkin: staff.role ?? null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Erro ao registrar.')
        setStep('error')
        return
      }

      setSuccess({ type: pendingType, name: staff.name })
      setStep('success')
      // Auto-reset 5s
      resetTimerRef.current = window.setTimeout(() => reset(), 5000)
    } catch {
      setError('Erro de conexão. Tente de novo.')
      setStep('error')
    }
  }

  // === RENDER ===

  if (!eventSlug) {
    return (
      <div className="flex h-screen items-center justify-center bg-black px-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-red-400">URL inválida</h1>
          <p className="mt-3 text-lg text-white/60">Use /kiosk/[slug-do-evento]</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#06070a] via-[#0d1117] to-[#06070a] text-white overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/8 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4FF00]/15">
            <Hash className="h-6 w-6 text-[#D4FF00]" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Ponto Pulse</div>
            <div className="text-xl font-bold">{eventName || 'Aguardando evento...'}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!online && (
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
              <WifiOff className="h-3.5 w-3.5" /> Offline
            </div>
          )}
          <div className="font-mono text-2xl tabular-nums text-white/60">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        {/* IDENTIFY: digita PIN/CPF */}
        {step === 'identify' && (
          <form onSubmit={handleLookup} className="w-full max-w-xl">
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-bold tracking-tight">
                {inputMode === 'pin' ? 'Digite seu PIN' : 'Digite seu CPF'}
              </h1>
              <p className="mt-3 text-lg text-white/50">
                {inputMode === 'pin' ? '4 dígitos do PIN recebido no cadastro' : '11 dígitos do CPF (só números)'}
              </p>
            </div>

            <input
              ref={inputRef}
              autoFocus
              type={inputMode === 'pin' ? 'tel' : 'tel'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={inputMode === 'pin' ? 6 : 11}
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
              placeholder={inputMode === 'pin' ? '••••' : '12345678900'}
              className="w-full rounded-3xl border-2 border-white/15 bg-white/[0.04] px-8 py-10 text-center text-7xl font-bold tracking-[0.3em] text-white placeholder-white/15 outline-none focus:border-[#D4FF00]/40 focus:bg-white/[0.08]"
            />

            {error && (
              <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-center text-base text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={!input.trim()}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-[#D4FF00] py-7 text-2xl font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all active:scale-[0.98] disabled:bg-white/10 disabled:text-white/30"
            >
              Continuar <ArrowRight className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode((m) => (m === 'pin' ? 'cpf' : 'pin'))
                setInput('')
                setError('')
                setTimeout(() => inputRef.current?.focus(), 50)
              }}
              className="mt-4 w-full py-3 text-sm font-medium uppercase tracking-[0.18em] text-white/40 hover:text-white/70"
            >
              {inputMode === 'pin' ? 'Usar CPF em vez de PIN' : 'Usar PIN em vez de CPF'}
            </button>
          </form>
        )}

        {/* IDENTIFIED: escolha Entrada ou Saída */}
        {step === 'identified' && staff && (
          <div className="w-full max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D4FF00]/40 bg-[#D4FF00]/10">
              <User className="h-12 w-12 text-[#D4FF00]" />
            </div>
            <h1 className="text-5xl font-bold">Olá, {staff.name.split(' ')[0]}!</h1>
            <p className="mt-3 text-2xl text-white/60">{staff.name}</p>
            {staff.role && <p className="mt-2 text-lg text-white/40">{staff.role}{staff.area ? ` · ${staff.area}` : ''}</p>}

            {lastAction && (
              <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-base text-white/60">
                Última batida: <strong className="text-white">{lastAction.type === 'checkin' ? 'Entrada' : 'Saída'}</strong> às {formatTime(lastAction.at)}
              </div>
            )}

            <p className="mt-10 text-base uppercase tracking-[0.18em] text-white/40">O que vai bater agora?</p>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <button
                onClick={() => chooseAction('checkin')}
                className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#D4FF00] py-12 text-3xl font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all active:scale-[0.98]"
              >
                <LogIn className="h-12 w-12" />
                Entrada
              </button>
              <button
                onClick={() => chooseAction('checkout')}
                className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-red-500 bg-red-500/15 py-12 text-3xl font-bold uppercase tracking-[0.18em] text-red-300 transition-all active:scale-[0.98]"
              >
                <LogOut className="h-12 w-12" />
                Saída
              </button>
            </div>

            <button
              onClick={reset}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white/40 hover:text-white/70"
            >
              <X className="h-4 w-4" /> Não sou eu
            </button>
          </div>
        )}

        {/* CAMERA */}
        {step === 'camera' && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold">Tire a selfie</h1>
            <p className="mt-2 text-base text-white/50">Olhe pra câmera. Quando estiver pronto, toque no botão.</p>
            <div className="relative mt-6 overflow-hidden rounded-3xl border-2 border-white/15 bg-black aspect-[3/4]">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <button
              onClick={capturePhoto}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-[#D4FF00] py-7 text-2xl font-bold uppercase tracking-[0.18em] text-[#06070a] active:scale-[0.98]"
            >
              <Camera className="h-7 w-7" />
              Tirar foto
            </button>
            <button
              onClick={reset}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white/40 hover:text-white/70"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        )}

        {/* SUBMITTING */}
        {step === 'submitting' && (
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#D4FF00]" />
            <p className="mt-6 text-xl text-white/60">Registrando ponto...</p>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && success && (
          <div className="text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-500/30 bg-green-500/20">
              <CheckCircle2 className="h-20 w-20 text-green-400" />
            </div>
            <h1 className="mt-8 text-5xl font-bold">
              {success.type === 'checkin' ? 'Entrada registrada!' : 'Saída registrada!'}
            </h1>
            <p className="mt-4 text-2xl text-white/60">{success.name}</p>
            <p className="mt-2 font-mono text-3xl tabular-nums text-[#D4FF00]">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {success.type === 'checkin' && (
              <p className="mt-6 max-w-md mx-auto text-base text-white/40">
                Dirija-se ao credenciamento para retirar sua pulseira.
              </p>
            )}
            <button
              onClick={reset}
              className="mt-10 inline-flex items-center gap-3 rounded-full border-2 border-white/15 px-8 py-4 text-lg font-medium uppercase tracking-[0.18em] text-white/70 hover:bg-white/5"
            >
              <RotateCcw className="h-5 w-5" /> Próxima pessoa
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400">Erro</h1>
            <p className="mt-4 max-w-md text-lg text-white/60">{error}</p>
            <button
              onClick={reset}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#D4FF00] px-8 py-4 text-lg font-bold uppercase tracking-[0.18em] text-[#06070a]"
            >
              <RefreshCw className="h-5 w-5" /> Tentar de novo
            </button>
          </div>
        )}

        {/* IDLE */}
        {step === 'idle' && (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-white/30" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 px-8 py-4 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-white/30">
          Pulse — Gestão de Eventos · {new Date().toLocaleDateString('pt-BR')}
        </p>
      </footer>
    </div>
  )
}

export default KioskPage
