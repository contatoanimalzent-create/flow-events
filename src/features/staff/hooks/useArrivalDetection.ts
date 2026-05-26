import { useEffect, useRef, useState } from 'react'
import { watchPosition } from '@/core/native/capacitor'
import { getEventGeofence, hasArrivalProofToday, haversineMeters, type EventGeofence } from '@/features/staff/services/arrival-proof.service'

export type ArrivalState = 'idle' | 'tracking' | 'arrived' | 'proof_submitted' | 'disabled'

interface UseArrivalDetectionParams {
  eventId: string | null
  profileId: string | null
  enabled?: boolean
}

interface ArrivalDetectionResult {
  state: ArrivalState
  geofence: EventGeofence | null
  distanceMeters: number | null
  currentPosition: { lat: number; lng: number; accuracy?: number } | null
  markProofSubmitted: () => void
}

/**
 * Observa a posição GPS do staff. Quando entra no raio do evento (geofence)
 * e ainda não enviou prova de chegada hoje, muda o estado para 'arrived'
 * — o componente pai então mostra o prompt de foto.
 */
export function useArrivalDetection({ eventId, profileId, enabled = true }: UseArrivalDetectionParams): ArrivalDetectionResult {
  const [state, setState] = useState<ArrivalState>('idle')
  const [geofence, setGeofence] = useState<EventGeofence | null>(null)
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const proofDoneRef = useRef(false)

  useEffect(() => {
    if (!enabled || !eventId || !profileId) {
      setState('idle')
      return
    }

    let cancelled = false

    async function init() {
      const geo = await getEventGeofence(eventId!)
      if (cancelled) return

      if (!geo) {
        setState('disabled')
        return
      }
      setGeofence(geo)

      // Se já enviou prova hoje, não rastreia
      const already = await hasArrivalProofToday(eventId!, profileId!)
      if (cancelled) return
      if (already) {
        proofDoneRef.current = true
        setState('proof_submitted')
        return
      }

      setState('tracking')

      const stop = await watchPosition((pos) => {
        if (cancelled || proofDoneRef.current) return
        setCurrentPosition(pos)
        const dist = haversineMeters(pos.lat, pos.lng, geo.lat, geo.lng)
        setDistanceMeters(dist)

        if (dist <= geo.radius_meters) {
          setState('arrived')
        } else {
          setState((prev) => (prev === 'arrived' ? 'arrived' : 'tracking'))
        }
      })
      cleanupRef.current = stop
    }

    void init()

    return () => {
      cancelled = true
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [eventId, profileId, enabled])

  function markProofSubmitted() {
    proofDoneRef.current = true
    cleanupRef.current?.()
    cleanupRef.current = null
    setState('proof_submitted')
  }

  return { state, geofence, distanceMeters, currentPosition, markProofSubmitted }
}
