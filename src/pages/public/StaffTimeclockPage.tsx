import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, LogIn, LogOut, MapPin, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntryType = 'clock_in' | 'clock_out' | 'auto_pause' | 'auto_return'
type SessionStatus = 'active' | 'paused' | 'completed'
type GeofenceType = 'circle' | 'polygon'

interface EventGeofence {
  id: string
  event_id: string
  name: string
  fence_type: GeofenceType
  center_lat?: number | null
  center_lng?: number | null
  radius_meters?: number | null
  polygon_coords?: Array<{ lat: number; lng: number }> | null
  buffer_seconds: number
  is_active: boolean
}

interface TimeclockSession {
  id: string
  staff_member_id: string
  event_id: string
  clock_in_at: string
  clock_out_at?: string | null
  status: SessionStatus
}

interface TimeclockEntry {
  id: string
  session_id: string
  entry_type: EntryType
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  recorded_at: string
}

interface StaffInfo {
  id: string
  name: string
  role: string
}

interface EventInfo {
  id: string
  name: string
  starts_at: string
  venue_name?: string | null
}

interface TimelineItem {
  type: EntryType
  recorded_at: string
  latitude?: number | null
  longitude?: number | null
}

type PageStatus = 'loading' | 'error' | 'idle' | 'active' | 'paused' | 'completed'

// ---------------------------------------------------------------------------
// Geofence helpers
// ---------------------------------------------------------------------------

/** Haversine distance in meters between two lat/lng pairs */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Ray-casting point-in-polygon algorithm */
function pointInPolygon(lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>): boolean {
  let inside = false
  const n = polygon.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function isInsideGeofence(lat: number, lng: number, fence: EventGeofence): boolean {
  if (fence.fence_type === 'circle') {
    if (fence.center_lat == null || fence.center_lng == null || fence.radius_meters == null) return false
    return haversineDistance(lat, lng, fence.center_lat, fence.center_lng) <= fence.radius_meters
  }
  if (fence.fence_type === 'polygon') {
    if (!fence.polygon_coords || fence.polygon_coords.length < 3) return false
    return pointInPolygon(lat, lng, fence.polygon_coords)
  }
  return false
}

function isInsideAnyGeofence(lat: number, lng: number, fences: EventGeofence[]): boolean {
  return fences.some((f) => isInsideGeofence(lat, lng, f))
}

// ---------------------------------------------------------------------------
// Time formatting helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

function calcWorkedSeconds(timeline: TimelineItem[]): number {
  let total = 0
  let clockInAt: Date | null = null
  for (const entry of timeline) {
    if (entry.type === 'clock_in' || entry.type === 'auto_return') {
      clockInAt = new Date(entry.recorded_at)
    } else if ((entry.type === 'auto_pause' || entry.type === 'clock_out') && clockInAt) {
      total += (new Date(entry.recorded_at).getTime() - clockInAt.getTime()) / 1000
      clockInAt = null
    }
  }
  // Still active, count up to now
  if (clockInAt) {
    total += (Date.now() - clockInAt.getTime()) / 1000
  }
  return Math.floor(total)
}

// ---------------------------------------------------------------------------
// Entry type labels and colors
// ---------------------------------------------------------------------------

const ENTRY_LABELS: Record<EntryType, string> = {
  clock_in: 'Entrada',
  clock_out: 'Saída',
  auto_pause: 'Saiu da área',
  auto_return: 'Retornou à área',
}

const ENTRY_COLORS: Record<EntryType, string> = {
  clock_in: 'text-green-400',
  clock_out: 'text-blue-400',
  auto_pause: 'text-amber-400',
  auto_return: 'text-emerald-400',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StaffTimeclockPage() {
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('event_id') ?? ''
  const credentialToken = params.get('credential_token') ?? ''

  // Data state
  const [staff, setStaff] = useState<StaffInfo | null>(null)
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [geofences, setGeofences] = useState<EventGeofence[]>([])
  const [session, setSession] = useState<TimeclockSession | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])

  // UI state
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [insideGeofence, setInsideGeofence] = useState<boolean | null>(null)
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [geoPermission, setGeoPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [workedSeconds, setWorkedSeconds] = useState(0)
  const [tick, setTick] = useState(0)

  // Refs for auto-pause logic
  const outsideSinceRef = useRef<number | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const bufferSecondsRef = useRef<number>(60)
  const sessionRef = useRef<TimeclockSession | null>(null)
  const pageStatusRef = useRef<PageStatus>('loading')
  const timelineRef = useRef<TimelineItem[]>([])
  const insideGeofenceRef = useRef<boolean | null>(null)

  // Keep refs in sync with state
  useEffect(() => { sessionRef.current = session }, [session])
  useEffect(() => { pageStatusRef.current = pageStatus }, [pageStatus])
  useEffect(() => { timelineRef.current = timeline }, [timeline])
  useEffect(() => { insideGeofenceRef.current = insideGeofence }, [insideGeofence])

  // ---------------------------------------------------------------------------
  // Load staff + event + geofences
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!eventId || !credentialToken) {
      setErrorMessage('Link inválido: faltam parâmetros event_id ou credential_token.')
      setPageStatus('error')
      return
    }

    async function loadData() {
      try {
        // Validate token and fetch staff member
        const { data: staffData, error: staffErr } = await supabase
          .from('staff_members')
          .select('id, name, role')
          .eq('credential_token', credentialToken)
          .eq('event_id', eventId)
          .single()

        if (staffErr || !staffData) {
          setErrorMessage('Token inválido ou expirado. Solicite um novo link ao organizador.')
          setPageStatus('error')
          return
        }

        setStaff(staffData as StaffInfo)

        // Fetch event info
        const { data: eventData } = await supabase
          .from('events')
          .select('id, name, starts_at, venue_name')
          .eq('id', eventId)
          .single()

        if (eventData) setEvent(eventData as EventInfo)

        // Fetch active geofences
        const { data: fenceData } = await supabase
          .from('event_geofences')
          .select('id, event_id, name, fence_type, center_lat, center_lng, radius_meters, polygon_coords, buffer_seconds, is_active')
          .eq('event_id', eventId)
          .eq('is_active', true)

        const fences = (fenceData ?? []) as EventGeofence[]
        setGeofences(fences)

        // Use minimum buffer_seconds from all fences (most strict), or 60s default
        if (fences.length > 0) {
          bufferSecondsRef.current = Math.min(...fences.map((f) => f.buffer_seconds ?? 60))
        }

        // Check for an existing active session today
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data: sessionData } = await supabase
          .from('timeclock_sessions')
          .select('id, staff_member_id, event_id, clock_in_at, clock_out_at, status')
          .eq('staff_member_id', (staffData as StaffInfo).id)
          .eq('event_id', eventId)
          .gte('clock_in_at', todayStart.toISOString())
          .in('status', ['active', 'paused'])
          .order('clock_in_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (sessionData) {
          const s = sessionData as TimeclockSession
          setSession(s)

          // Load today's entries for this session
          const { data: entryData } = await supabase
            .from('timeclock_entries')
            .select('id, session_id, entry_type, latitude, longitude, accuracy, recorded_at')
            .eq('session_id', s.id)
            .order('recorded_at', { ascending: true })

          const entries = (entryData ?? []).map((e) => ({
            type: e.entry_type as EntryType,
            recorded_at: e.recorded_at,
            latitude: e.latitude ?? null,
            longitude: e.longitude ?? null,
          })) as TimelineItem[]
          setTimeline(entries)

          setPageStatus(s.status === 'paused' ? 'paused' : 'active')
        } else {
          setPageStatus('idle')
        }
      } catch (err: unknown) {
        console.error('[StaffTimeclock] loadData error', err)
        setErrorMessage('Erro ao carregar dados. Verifique sua conexão e tente novamente.')
        setPageStatus('error')
      }
    }

    loadData()
  }, [eventId, credentialToken])

  // ---------------------------------------------------------------------------
  // Live worked-seconds ticker
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (pageStatus === 'active' || pageStatus === 'paused') {
      setWorkedSeconds(calcWorkedSeconds(timeline))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, timeline, pageStatus])

  // ---------------------------------------------------------------------------
  // Geolocation handling
  // ---------------------------------------------------------------------------

  const handlePositionUpdate = useCallback(
    async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords
      setCurrentPosition(pos.coords)

      const fences = geofences
      const inside = fences.length === 0 ? true : isInsideAnyGeofence(latitude, longitude, fences)
      setInsideGeofence(inside)

      const currentSession = sessionRef.current
      const status = pageStatusRef.current

      if (!currentSession || status === 'idle' || status === 'completed') return

      if (!inside) {
        // Started going outside, record timestamp
        if (outsideSinceRef.current === null) {
          outsideSinceRef.current = Date.now()
        }
        // Check if outside long enough to auto-pause
        const outsideDuration = (Date.now() - outsideSinceRef.current) / 1000
        if (outsideDuration >= bufferSecondsRef.current && status === 'active') {
          // Auto-pause
          try {
            const recorded_at = new Date().toISOString()
            await supabase.from('timeclock_entries').insert({
              session_id: currentSession.id,
              entry_type: 'auto_pause' as EntryType,
              latitude,
              longitude,
              accuracy,
              recorded_at,
            })
            await supabase
              .from('timeclock_sessions')
              .update({ status: 'paused' })
              .eq('id', currentSession.id)

            setSession((prev) => prev ? { ...prev, status: 'paused' } : prev)
            setTimeline((prev) => [...prev, { type: 'auto_pause', recorded_at, latitude, longitude }])
            setPageStatus('paused')
          } catch (err) {
            console.error('[StaffTimeclock] auto_pause error', err)
          }
        }
      } else {
        // Back inside
        if (outsideSinceRef.current !== null) {
          outsideSinceRef.current = null
          // Only auto-return if session was paused
          if (status === 'paused') {
            try {
              const recorded_at = new Date().toISOString()
              await supabase.from('timeclock_entries').insert({
                session_id: currentSession.id,
                entry_type: 'auto_return' as EntryType,
                latitude,
                longitude,
                accuracy,
                recorded_at,
              })
              await supabase
                .from('timeclock_sessions')
                .update({ status: 'active' })
                .eq('id', currentSession.id)

              setSession((prev) => prev ? { ...prev, status: 'active' } : prev)
              setTimeline((prev) => [...prev, { type: 'auto_return', recorded_at, latitude, longitude }])
              setPageStatus('active')
            } catch (err) {
              console.error('[StaffTimeclock] auto_return error', err)
            }
          }
        }
      }
    },
    [geofences],
  )

  const startWatchingPosition = useCallback(() => {
    if (watchIdRef.current !== null) return

    const id = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => {
        console.error('[StaffTimeclock] geolocation error', err)
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setGeoPermission('denied')
        }
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
    )
    watchIdRef.current = id
    setGeoPermission('granted')
  }, [handlePositionUpdate])

  // Stop watching on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Clock-in action
  // ---------------------------------------------------------------------------

  async function handleClockIn() {
    if (!staff || !eventId) return
    setActionLoading(true)
    try {
      // Request geolocation first
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
        })
      }).catch((err) => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setGeoPermission('denied')
        }
        throw err
      })

      setGeoPermission('granted')
      const { latitude, longitude, accuracy } = position.coords
      setCurrentPosition(position.coords)

      const inside =
        geofences.length === 0 ? true : isInsideAnyGeofence(latitude, longitude, geofences)
      setInsideGeofence(inside)

      const now = new Date().toISOString()

      // Create session
      const { data: newSession, error: sessionErr } = await supabase
        .from('timeclock_sessions')
        .insert({
          staff_member_id: staff.id,
          event_id: eventId,
          clock_in_at: now,
          status: 'active',
        })
        .select('id, staff_member_id, event_id, clock_in_at, clock_out_at, status')
        .single()

      if (sessionErr || !newSession) {
        throw new Error(sessionErr?.message ?? 'Falha ao criar sessão')
      }

      // Create clock_in entry
      await supabase.from('timeclock_entries').insert({
        session_id: newSession.id,
        entry_type: 'clock_in' as EntryType,
        latitude,
        longitude,
        accuracy,
        recorded_at: now,
      })

      setSession(newSession as TimeclockSession)
      setTimeline([{ type: 'clock_in', recorded_at: now, latitude, longitude }])
      setPageStatus('active')

      // Start watching position
      startWatchingPosition()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('permission') || msg.toLowerCase().includes('denied')) {
        setErrorMessage('Permissão de localização negada. Por favor, habilite nas configurações do navegador.')
      } else {
        setErrorMessage(`Erro ao iniciar turno: ${msg}`)
      }
    } finally {
      setActionLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Clock-out action
  // ---------------------------------------------------------------------------

  async function handleClockOut() {
    if (!session || !staff) return
    setActionLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
        })
      })

      const { latitude, longitude, accuracy } = position.coords
      const inside = geofences.length === 0 ? true : isInsideAnyGeofence(latitude, longitude, geofences)
      setInsideGeofence(inside)

      if (!inside && geofences.length > 0) {
        setErrorMessage('Você precisa estar dentro da área para encerrar o turno.')
        setActionLoading(false)
        return
      }

      const now = new Date().toISOString()

      await supabase.from('timeclock_entries').insert({
        session_id: session.id,
        entry_type: 'clock_out' as EntryType,
        latitude,
        longitude,
        accuracy,
        recorded_at: now,
      })

      await supabase
        .from('timeclock_sessions')
        .update({ status: 'completed', clock_out_at: now })
        .eq('id', session.id)

      setSession((prev) => prev ? { ...prev, status: 'completed', clock_out_at: now } : prev)
      setTimeline((prev) => [...prev, { type: 'clock_out', recorded_at: now, latitude, longitude }])
      setPageStatus('idle')

      // Stop watching
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setErrorMessage(`Erro ao encerrar turno: ${msg}`)
    } finally {
      setActionLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Auto-start watching when page becomes active (resume from existing session)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if ((pageStatus === 'active' || pageStatus === 'paused') && watchIdRef.current === null) {
      startWatchingPosition()
    }
  }, [pageStatus, startWatchingPosition])

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const isActive = pageStatus === 'active'
  const isPaused = pageStatus === 'paused'
  const isIdle = pageStatus === 'idle'
  const hasSession = isActive || isPaused

  // Clear transient error when user starts interacting
  function clearError() {
    setErrorMessage('')
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (pageStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy">
        <div className="flex flex-col items-center gap-4 text-white/60">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand-yellow" />
          <p className="text-sm font-medium tracking-wide">Carregando...</p>
        </div>
      </div>
    )
  }

  if (pageStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy px-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-white">Acesso Negado</h2>
          <p className="text-sm leading-relaxed text-red-300">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-brand-navy font-sans"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      onClick={errorMessage ? clearError : undefined}
    >
      {/* ---- Header ---- */}
      <header className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Flow Events
            </p>
            <h1 className="text-lg font-bold text-white">{staff?.name ?? '-'}</h1>
            <p className="text-sm text-white/50">{staff?.role}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {/* Geofence status badge */}
            <GeofenceStatusBadge inside={insideGeofence} noFences={geofences.length === 0} />
            {/* GPS permission */}
            {geoPermission === 'denied' && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                <WifiOff className="h-3 w-3" /> Sem GPS
              </span>
            )}
            {geoPermission === 'granted' && currentPosition && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                <Wifi className="h-3 w-3" /> GPS ativo
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ---- Event info ---- */}
      <div className="border-b border-white/10 px-5 py-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
          <div>
            <p className="text-sm font-semibold text-white">{event?.name ?? '-'}</p>
            {event?.venue_name && (
              <p className="text-xs text-white/40">{event.venue_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* ---- Geofence warning banner ---- */}
      {hasSession && insideGeofence === false && geofences.length > 0 && (
        <div className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-5 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-300">Fora da área</p>
            <p className="text-xs text-amber-400/80">
              {isPaused
                ? 'Turno pausado automaticamente. Retorne à área para continuar.'
                : `Turno será pausado em ${bufferSecondsRef.current}s se você permanecer fora.`}
            </p>
          </div>
        </div>
      )}

      {/* ---- GPS denied warning ---- */}
      {geoPermission === 'denied' && (
        <div className="flex items-center gap-3 border-b border-red-500/30 bg-red-500/10 px-5 py-3">
          <WifiOff className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-xs leading-snug text-red-300">
            Localização bloqueada. Habilite o GPS nas configurações do navegador para usar esta página.
          </p>
        </div>
      )}

      {/* ---- Main content ---- */}
      <main className="flex flex-1 flex-col gap-6 px-5 py-6">

        {/* ---- Clock display ---- */}
        {hasSession && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
              Tempo trabalhado hoje
            </p>
            <p className="font-mono text-5xl font-bold tabular-nums text-white">
              {formatDuration(workedSeconds)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isActive ? 'animate-pulse bg-green-400' : 'bg-amber-400'}`} />
              <p className="text-xs font-medium text-white/50">
                {isActive ? 'Turno em andamento' : 'Turno pausado'}
              </p>
            </div>
            {session?.clock_in_at && (
              <p className="mt-1 text-xs text-white/30">
                Iniciado às {formatTime(session.clock_in_at)}
              </p>
            )}
          </div>
        )}

        {/* ---- Error message ---- */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{errorMessage}</p>
            <p className="mt-1 text-xs text-red-400/60">Toque para dispensar</p>
          </div>
        )}

        {/* ---- Main action button ---- */}
        <div className="flex flex-col gap-3">
          {isIdle && (
            <button
              onClick={handleClockIn}
              disabled={actionLoading || geoPermission === 'denied'}
              className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-yellow py-6 text-xl font-bold text-brand-navy shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: 80 }}
            >
              {actionLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-navy/30 border-t-brand-navy" />
              ) : (
                <>
                  <LogIn className="h-7 w-7" />
                  Iniciar turno
                </>
              )}
            </button>
          )}

          {(isActive || isPaused) && (
            <button
              onClick={handleClockOut}
              disabled={
                actionLoading ||
                (insideGeofence === false && geofences.length > 0) ||
                geoPermission === 'denied'
              }
              className="relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-red-500/10 py-6 text-xl font-bold text-red-400 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ minHeight: 80 }}
            >
              {actionLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-400/30 border-t-red-400" />
              ) : (
                <>
                  <LogOut className="h-7 w-7" />
                  Encerrar turno
                </>
              )}
            </button>
          )}

          {(isActive || isPaused) && insideGeofence === false && geofences.length > 0 && (
            <p className="text-center text-xs text-amber-400/70">
              Retorne à área delimitada para encerrar o turno
            </p>
          )}
        </div>

        {/* ---- Timeline ---- */}
        {timeline.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/40" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                Linha do tempo, hoje
              </h2>
            </div>
            <div className="space-y-2">
              {[...timeline].reverse().map((item, idx) => (
                <TimelineRow key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ---- Empty idle state ---- */}
        {isIdle && timeline.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Clock className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-sm text-white/40">
              Nenhum turno registrado hoje.
              <br />
              Toque em <strong className="text-white/60">Iniciar turno</strong> para começar.
            </p>
          </div>
        )}
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-white/10 px-5 py-3 text-center">
        <p className="text-xs text-white/20">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GeofenceStatusBadge({
  inside,
  noFences,
}: {
  inside: boolean | null
  noFences: boolean
}) {
  if (noFences || inside === null) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
        <MapPin className="h-3 w-3" /> Sem geocerca
      </span>
    )
  }
  if (inside) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" /> Dentro da área
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5" /> Fora da área
    </span>
  )
}

function TimelineRow({ item }: { item: TimelineItem }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
      <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor(item.type)}`} />
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className={`text-sm font-medium ${ENTRY_COLORS[item.type]}`}>
          {ENTRY_LABELS[item.type]}
        </span>
        <span className="font-mono text-xs tabular-nums text-white/40">
          {formatTime(item.recorded_at)}
        </span>
      </div>
    </div>
  )
}

function dotColor(type: EntryType): string {
  switch (type) {
    case 'clock_in':    return 'bg-green-400'
    case 'clock_out':   return 'bg-blue-400'
    case 'auto_pause':  return 'bg-amber-400'
    case 'auto_return': return 'bg-emerald-400'
  }
}
