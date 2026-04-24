import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, MapPin, Play, Square, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useOffline } from '@/core/offline/offline.store'
import { useAppContext } from '@/core/context/app-context.store'
import { staffService } from '@/core/staff/staff.service'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

type PresenceStatus = 'loading' | 'idle' | 'active' | 'ended'

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PresencePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const { isOnline, enqueue } = useOffline()

  const [status, setStatus] = useState<PresenceStatus>('loading')
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [staffMemberId, setStaffMemberId] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [currentLat, setCurrentLat] = useState<number | null>(null)
  const [currentLng, setCurrentLng] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const pingRef = useRef<ReturnType<typeof setInterval>>()

  // Load current user + shift + active session
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user || !context?.eventId) { setStatus('idle'); return }

        const shift = await staffService.getCurrentShift(user.id, context.eventId)
        if (!shift) { setStatus('idle'); return }

        setStaffMemberId(shift.id)

        const session = await staffService.getActiveSession(shift.id)
        if (session) {
          setSessionId(session.id)
          setStartTime(session.startedAt)
          const secondsElapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
          setElapsed(secondsElapsed)
          setStatus('active')
        } else {
          setStatus('idle')
        }
      } catch (err) {
        console.error('[presence] init error', err)
        setStatus('idle')
      }
    }
    init()
  }, [context?.eventId])

  // Timer
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  // Location ping every 2 min when active
  useEffect(() => {
    if (status !== 'active' || !staffMemberId || !context?.eventId) return
    const sendPing = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude)
          setCurrentLng(pos.coords.longitude)
          if (isOnline) {
            staffService.sendLocationPing(staffMemberId, context.eventId, pos.coords.latitude, pos.coords.longitude)
              .catch(() => {
                enqueue('location-ping', { staffMemberId, eventId: context.eventId, lat: pos.coords.latitude, lng: pos.coords.longitude })
              })
          } else {
            enqueue('location-ping', { staffMemberId, eventId: context.eventId, lat: pos.coords.latitude, lng: pos.coords.longitude })
          }
        },
        () => {}
      )
    }
    sendPing()
    pingRef.current = setInterval(sendPing, 2 * 60 * 1000)
    return () => clearInterval(pingRef.current)
  }, [status, staffMemberId, context?.eventId, isOnline, enqueue])

  const getLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      )
    })

  const handleStart = useCallback(async () => {
    if (!staffMemberId || !context?.eventId) return
    setActionLoading(true)
    const now = new Date().toISOString()
    const geo = await getLocation()

    if (geo) { setCurrentLat(geo.lat); setCurrentLng(geo.lng) }
    else { setGeoError('Não foi possível obter localização') }

    try {
      if (isOnline) {
        const id = await staffService.startSession(staffMemberId, context.eventId, geo?.lat, geo?.lng)
        setSessionId(id)
      } else {
        const id = `offline-sess-${Date.now()}`
        setSessionId(id)
        enqueue('start-presence', { sessionId: id, staffId: staffMemberId, eventId: context.eventId, lat: geo?.lat, lng: geo?.lng })
      }
      setStartTime(now)
      setElapsed(0)
      setStatus('active')
    } catch (err: any) {
      console.error('[presence] start error', err)
    } finally {
      setActionLoading(false)
    }
  }, [staffMemberId, context?.eventId, isOnline, enqueue])

  const handleEnd = useCallback(async () => {
    if (!sessionId) return
    setActionLoading(true)
    const geo = await getLocation()

    try {
      if (isOnline) {
        await staffService.endSession(sessionId, geo?.lat, geo?.lng)
      } else {
        enqueue('end-presence', { sessionId, lat: geo?.lat, lng: geo?.lng })
      }
      setStatus('ended')
    } catch (err) {
      console.error('[presence] end error', err)
    } finally {
      setActionLoading(false)
    }
  }, [sessionId, isOnline, enqueue])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Presença</h1>
        {!isOnline && (
          <span className="ml-auto text-amber-400 text-xs">⚡ Offline</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {status === 'loading' ? (
          <Loader2 size={32} className="text-green-400 animate-spin" />
        ) : (
          <>
            {/* Status ring */}
            <div
              className="w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 mb-8 transition-all duration-500"
              style={{
                borderColor: status === 'active' ? '#22C55E' : status === 'ended' ? '#64748b' : '#1e293b',
                boxShadow: status === 'active' ? '0 0 40px rgba(34,197,94,0.25)' : 'none',
              }}
            >
              {status === 'active' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mb-2" />
                  <p className="text-white font-mono font-bold text-xl">{formatElapsed(elapsed)}</p>
                  <p className="text-green-400 text-xs mt-1">Presença ativa</p>
                </>
              )}
              {status === 'idle' && (
                <>
                  <MapPin size={32} className="text-slate-600 mb-2" />
                  <p className="text-slate-400 text-sm text-center px-4">Inicie sua presença</p>
                </>
              )}
              {status === 'ended' && (
                <>
                  <CheckCircle size={32} className="text-green-400 mb-2" />
                  <p className="text-white text-sm font-medium">Encerrada</p>
                  <p className="text-slate-400 text-xs">{formatElapsed(elapsed)}</p>
                </>
              )}
            </div>

            {/* Location info */}
            {status === 'active' && (
              <div className="flex items-center gap-2 mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 w-full">
                <MapPin size={14} className="text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {currentLat ? `${currentLat.toFixed(5)}, ${currentLng?.toFixed(5)}` : 'Localizando…'}
                  </p>
                  <p className="text-green-400 text-xs">GPS ativo</p>
                </div>
              </div>
            )}

            {startTime && status !== 'idle' && (
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
                <Clock size={14} />
                {status === 'ended' ? 'Encerrado · ' : 'Iniciado às '}
                {new Date(startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            {geoError && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 w-full mb-4">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <p className="text-amber-300 text-xs">{geoError}</p>
              </div>
            )}

            {/* Action buttons */}
            {status === 'idle' && (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-40"
              >
                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} fill="white" />}
                Iniciar Presença
              </button>
            )}

            {status === 'active' && (
              <button
                onClick={handleEnd}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl bg-red-600/80 border border-red-500/30 text-white font-bold text-base flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-40"
              >
                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Square size={18} fill="white" />}
                Encerrar Presença
              </button>
            )}

            {status === 'ended' && (
              <button
                onClick={() => { setStatus('idle'); setElapsed(0); setStartTime(null); setSessionId(null) }}
                className="w-full py-4 rounded-2xl bg-white/8 border border-white/10 text-slate-300 font-semibold text-sm active:opacity-80"
              >
                Nova sessão
              </button>
            )}

            {!isOnline && (
              <p className="text-amber-400 text-xs mt-4 text-center">
                Offline — ações sincronizadas ao reconectar
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
