import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface StaffInfo {
  staff_member_id: string
  event_id: string
  full_name: string
  role_title: string | null
  team: string | null
  checked_in: boolean
  checkin_time: string | null
  checkout_time: string | null
  venue_lat: number | null
  venue_lng: number | null
  event_name: string
}

type PageStep =
  | 'email'
  | 'identified'
  | 'camera'
  | 'preview'
  | 'camera_checkout'
  | 'preview_checkout'
  | 'submitting'
  | 'success_checkin'
  | 'success_checkout'
  | 'error'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEventSlug(): string {
  const match = window.location.pathname.match(/\/staff\/ponto\/([^/?#]+)/)
  return match ? match[1] : ''
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// ─── Constants ──────────────────────────────────────────────────────────────

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-checkin`

// ─── Component ──────────────────────────────────────────────────────────────

export function StaffCheckinPage() {
  const eventSlug = getEventSlug()

  // State
  const [step, setStep] = useState<PageStep>('email')
  const [idEmail, setIdEmail] = useState('')
  const [idCpf, setIdCpf] = useState('')
  const [idPhone, setIdPhone] = useState('')
  const [staff, setStaff] = useState<StaffInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Geolocation
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // ── Identify staff ────────────────────────────────────────────────────────

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault()
    if (!idEmail.trim() || !idCpf.trim() || !idPhone.trim() || !eventSlug) return

    setLoading(true)
    setErrorMessage('')

    try {
      const params = new URLSearchParams({
        event_slug: eventSlug,
        email: idEmail.trim().toLowerCase(),
        cpf: idCpf.replace(/\D/g, ''),
        phone: idPhone.replace(/\D/g, ''),
      })
      const url = `${EDGE_FN_URL}?${params}`
      const res = await fetch(url, { method: 'GET' })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(
          body?.error ?? body?.message ?? 'E-mail não encontrado para este evento.',
        )
        setStep('error')
        return
      }

      const raw = await res.json()
      const sm = raw.staff_member ?? raw
      const checkins = raw.today_checkins ?? []
      const lastCheckin = checkins.find((c: { type: string }) => c.type === 'checkin')
      const lastCheckout = checkins.find((c: { type: string }) => c.type === 'checkout')
      const vc = raw.venue_coordinates
      setStaff({
        staff_member_id: sm.id ?? sm.staff_member_id,
        event_id: raw.event_id ?? sm.event_id ?? '',
        full_name: sm.name ?? sm.full_name ?? '',
        role_title: sm.role ?? sm.role_title ?? null,
        team: null,
        checked_in: raw.is_checked_in ?? false,
        checkin_time: lastCheckin?.created_at ?? null,
        checkout_time: lastCheckout?.created_at ?? null,
        venue_lat: vc?.latitude ?? null,
        venue_lng: vc?.longitude ?? null,
      })
      setStep('identified')
    } catch {
      setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  // ── Geolocation ───────────────────────────────────────────────────────────

  const getGeolocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    setGeoStatus('loading')
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
          setCoords(location)
          setGeoStatus('done')

          if (staff?.venue_lat != null && staff?.venue_lng != null) {
            const dist = haversineDistance(
              location.lat,
              location.lng,
              staff.venue_lat,
              staff.venue_lng,
            )
            setDistance(dist)
          }

          resolve(location)
        },
        (err) => {
          setGeoStatus('error')
          reject(err)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    })
  }, [staff])

  // ── Camera ────────────────────────────────────────────────────────────────

  async function openCamera(targetStep: Step = 'camera') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setStep(targetStep)
    } catch {
      setErrorMessage('Permissão de câmera negada. Habilite nas configurações do navegador.')
      setStep('error')
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror horizontally for front camera selfie
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    const base64 = canvas.toDataURL('image/jpeg', 0.8)
    setPhotoBase64(base64)

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    setStep('preview')
  }

  function retakePhoto() {
    setPhotoBase64(null)
    openCamera()
  }

  // ── Checkin flow ──────────────────────────────────────────────────────────

  async function startCheckinFlow() {
    try {
      // Request notification permission (fire and forget)
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }

      // Get geolocation first
      await getGeolocation()

      // Then open camera
      await openCamera()
    } catch {
      setErrorMessage('Não foi possível obter sua localização. Verifique as permissões.')
      setStep('error')
    }
  }

  async function submitCheckin() {
    if (!staff || !coords || !photoBase64) return

    setStep('submitting')

    try {
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_member_id: staff.staff_member_id,
          event_id: staff.event_id,
          type: 'checkin',
          photo_base64: photoBase64,
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy_meters: coords.accuracy ?? undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(body?.error ?? body?.message ?? 'Erro ao registrar entrada.')
        setStep('error')
        return
      }

      setStep('success_checkin')
    } catch {
      setErrorMessage('Erro de conexão. Tente novamente.')
      setStep('error')
    }
  }

  // ── Checkout flow ─────────────────────────────────────────────────────────

  async function handleCheckout() {
    if (!staff || !photoBase64) return

    setLoading(true)
    setStep('submitting')
    setErrorMessage('')

    try {
      const location = await getGeolocation()

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_member_id: staff.staff_member_id,
          event_id: staff.event_id,
          type: 'checkout',
          photo_base64: photoBase64,
          latitude: location.lat,
          longitude: location.lng,
          accuracy_meters: location.accuracy ?? undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(body?.error ?? body?.message ?? 'Erro ao registrar saída.')
        setStep('error')
        return
      }

      setStep('success_checkout')
    } catch {
      setErrorMessage('Erro ao registrar saída. Verifique sua conexão e localização.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  // ── Reset to email step ───────────────────────────────────────────────────

  function resetToEmail() {
    setStep('email')
    setEmail('')
    setStaff(null)
    setErrorMessage('')
    setPhotoBase64(null)
    setCoords(null)
    setDistance(null)
    setGeoStatus('idle')
  }

  function backToIdentified() {
    setErrorMessage('')
    setPhotoBase64(null)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    setStep('identified')
  }

  // ── Render: Loading ───────────────────────────────────────────────────────

  if (!eventSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-[#f5f0e8]">Link inválido</h1>
          <p className="mt-3 text-sm leading-7 text-white/56">
            URL do evento não encontrada. Verifique o link recebido.
          </p>
        </div>
      </div>
    )
  }

  // ── Render: Email step ────────────────────────────────────────────────────

  if (step === 'email') {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
                <Clock className="h-7 w-7 text-[#D4FF00]" />
              </div>
              <h1 className="text-2xl font-bold text-[#f5f0e8]">Ponto Digital</h1>
              <p className="mt-2 text-sm text-white/48">
                Registre sua entrada e saída no evento
              </p>
            </div>

            {/* Identify form */}
            <form onSubmit={handleIdentify} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#f5f0e8]">
                  E-mail
                </label>
                <input
                  type="email"
                  value={idEmail}
                  onChange={(e) => setIdEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4FF00]/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#f5f0e8]">
                  CPF
                </label>
                <input
                  type="text"
                  value={idCpf}
                  onChange={(e) => setIdCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                  inputMode="numeric"
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4FF00]/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#f5f0e8]">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={idPhone}
                  onChange={(e) => setIdPhone(e.target.value)}
                  placeholder="(61) 99999-9999"
                  required
                  autoComplete="tel"
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4FF00]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !idEmail.trim() || !idCpf.trim() || !idPhone.trim()}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </form>
          </div>
        </div>

        <footer className="border-t border-white/8 px-5 py-4 text-center">
          <p className="text-xs text-white/20">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </footer>
      </div>
    )
  }

  // ── Render: Error step ────────────────────────────────────────────────────

  if (step === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-[#f5f0e8]">Ops!</h1>
          <p className="mt-3 text-sm leading-7 text-white/56">{errorMessage}</p>
        </div>
        <div className="flex gap-3">
          {staff ? (
            <button
              onClick={backToIdentified}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
            >
              Voltar
            </button>
          ) : (
            <button
              onClick={resetToEmail}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Render: Identified step ───────────────────────────────────────────────

  if (step === 'identified' && staff) {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col px-5 py-8">
          <div className="mx-auto w-full max-w-sm">
            {/* Staff info card */}
            <div className="rounded-2xl border border-white/8 bg-[#12161f] p-6">
              {/* Event name */}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">
                {staff.event_name}
              </p>

              {/* Name */}
              <h2 className="mt-3 text-xl font-bold text-[#f5f0e8]">
                {staff.full_name}
              </h2>

              {/* Role & Team */}
              <div className="mt-2 flex flex-wrap gap-2">
                {staff.role_title && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {staff.role_title}
                  </span>
                )}
                {staff.team && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {staff.team}
                  </span>
                )}
              </div>

              {/* Status badge */}
              <div className="mt-4">
                {staff.checked_in ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="text-xs font-semibold text-green-400">Presente</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">
                      Aguardando entrada
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Today's log */}
            {(staff.checkin_time || staff.checkout_time) && (
              <div className="mt-4 rounded-2xl border border-white/8 bg-[#12161f] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/40" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    Registro de hoje
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {staff.checkin_time && (
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Entrada</span>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-white/60">
                        {formatTime(staff.checkin_time)}
                      </span>
                    </div>
                  )}
                  {staff.checkout_time && (
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Saída</span>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-white/60">
                        {formatTime(staff.checkout_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Geolocation status */}
            {geoStatus === 'loading' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-white/48">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Obtendo localização...</span>
              </div>
            )}
            {geoStatus === 'done' && distance !== null && (
              <div className="mt-4 flex items-center justify-center gap-2 text-white/48">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {formatDistance(distance)} do local do evento
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3">
              {!staff.checked_in ? (
                <button
                  onClick={startCheckinFlow}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#D4FF00] py-5 text-base font-bold uppercase tracking-[0.14em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] active:scale-[0.98]"
                  style={{ minHeight: 72 }}
                >
                  <LogIn className="h-6 w-6" />
                  Registrar Entrada
                </button>
              ) : (
                <button
                  onClick={() => openCamera('camera_checkout')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-red-500/10 py-5 text-base font-bold uppercase tracking-[0.14em] text-red-400 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ minHeight: 72 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-6 w-6" />
                      Registrar Saída
                    </>
                  )}
                </button>
              )}

              <button
                onClick={resetToEmail}
                className="text-xs text-white/32 transition-colors hover:text-white/50"
              >
                Trocar e-mail
              </button>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/8 px-5 py-4 text-center">
          <p className="text-xs text-white/20">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </footer>
      </div>
    )
  }

  // ── Render: Camera step ───────────────────────────────────────────────────

  if (step === 'camera') {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-[#f5f0e8]">
              Tire uma selfie
            </h2>
            <p className="mb-6 text-center text-sm text-white/48">
              Posicione seu rosto no centro da câmera
            </p>

            {/* Video preview */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-white/10 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {/* Overlay frame */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#D4FF00]/30" />
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={capturePhoto}
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#D4FF00] bg-[#D4FF00]/10 transition-all active:scale-90"
              >
                <Camera className="h-8 w-8 text-[#D4FF00]" />
              </button>
            </div>

            <button
              onClick={backToIdentified}
              className="mt-4 w-full text-center text-xs text-white/32 transition-colors hover:text-white/50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Preview step ──────────────────────────────────────────────────

  if (step === 'preview' && photoBase64) {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-[#f5f0e8]">
              Confirme a foto
            </h2>

            {/* Photo preview */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-[#D4FF00]/30">
              <img
                src={photoBase64}
                alt="Selfie"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Location info */}
            {coords && (
              <div className="mt-4 flex items-center justify-center gap-2 text-white/48">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {distance !== null
                    ? `${formatDistance(distance)} do local do evento`
                    : 'Localização capturada'}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={submitCheckin}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] active:scale-[0.98]"
              >
                <CheckCircle2 className="h-5 w-5" />
                Confirmar Entrada
              </button>

              <button
                onClick={retakePhoto}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/64 transition-all hover:border-white/20 hover:text-white"
              >
                <Camera className="h-4 w-4" />
                Tirar outra foto
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Camera checkout step ───────────────────────────────────────────

  if (step === 'camera_checkout') {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-red-400">
              Foto de saída
            </h2>
            <p className="mb-6 text-center text-sm text-white/48">
              Tire uma selfie para registrar a saída
            </p>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-red-500/30 bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-red-500/30" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="mt-6 flex justify-center">
              <button onClick={() => { capturePhoto(); setTimeout(() => setStep('preview_checkout'), 100) }} className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/10 transition-all active:scale-90">
                <Camera className="h-8 w-8 text-red-400" />
              </button>
            </div>
            <button onClick={backToIdentified} className="mt-4 w-full text-center text-xs text-white/32 transition-colors hover:text-white/50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Preview checkout step ────────────────────────────────────────

  if (step === 'preview_checkout' && photoBase64) {
    return (
      <div className="flex min-h-screen flex-col bg-[#06070a]">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-red-400">Confirme a foto de saída</h2>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-red-500/30">
              <img src={photoBase64} alt="Selfie saída" className="h-full w-full object-cover" />
            </div>
            {coords && (
              <div className="mt-4 flex items-center justify-center gap-2 text-white/48">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{distance !== null ? `${formatDistance(distance)} do local` : 'Localização capturada'}</span>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={handleCheckout} className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-red-500 bg-red-500/20 py-4 text-sm font-bold uppercase tracking-[0.18em] text-red-400 transition-all active:scale-[0.98]">
                <LogOut className="h-5 w-5" />
                Confirmar Saída
              </button>
              <button onClick={() => setStep('camera_checkout')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/64 transition-all hover:border-white/20 hover:text-white">
                <Camera className="h-4 w-4" />
                Tirar outra foto
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Submitting step ───────────────────────────────────────────────

  if (step === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <Loader2 className="h-7 w-7 animate-spin text-[#D4FF00]" />
          </div>
          <p className="text-sm text-white/52">Registrando ponto...</p>
        </div>
      </div>
    )
  }

  // ── Render: Success checkin ───────────────────────────────────────────────

  if (step === 'success_checkin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-[#f5f0e8]">Entrada registrada!</h1>
          <p className="mt-3 text-base text-white/56">
            {staff?.full_name}, sua presença foi confirmada.
          </p>
          <p className="mt-1 text-sm text-white/40">
            {new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {staff?.event_name && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#D4FF00]/80">Evento</p>
            <p className="mt-1 text-base font-semibold text-[#f5f0e8]">
              {staff.event_name}
            </p>
          </div>
        )}
        <button
          onClick={resetToEmail}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  // ── Render: Success checkout ──────────────────────────────────────────────

  if (step === 'success_checkout') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
          <LogOut className="h-12 w-12 text-blue-400" />
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-[#f5f0e8]">Saída registrada!</h1>
          <p className="mt-4 text-2xl text-white/68">Até amanhã!</p>
          <p className="mt-2 text-sm text-white/40">
            {new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={resetToEmail}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  // ── Fallback ──────────────────────────────────────────────────────────────

  return null
}
