import { supabase } from '@/lib/supabase'

export interface EventGeofence {
  lat: number
  lng: number
  radius_meters: number
  arrival_photo_required: boolean
  enabled: boolean
}

export interface ArrivalProofResult {
  proof_id: string
  distance_meters: number | null
  inside_geofence: boolean
  captured_at: string
  message: string
}

const CLOUDINARY_EDGE_FUNCTION = 'cloudinary-upload'

/** Distância em metros entre dois pontos (Haversine) */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Busca configuração de geofence do evento */
export async function getEventGeofence(eventId: string): Promise<EventGeofence | null> {
  const { data, error } = await supabase
    .from('events')
    .select('settings')
    .eq('id', eventId)
    .single()

  if (error || !data) return null
  const geo = (data.settings as Record<string, unknown> | null)?.geofence as EventGeofence | undefined
  if (!geo || !geo.enabled || typeof geo.lat !== 'number' || typeof geo.lng !== 'number') return null
  return geo
}

/** Verifica se o staff já enviou prova de chegada para este evento hoje */
export async function hasArrivalProofToday(eventId: string, profileId: string): Promise<boolean> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('staff_arrival_proofs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .gte('captured_at', startOfDay.toISOString())

  return (count ?? 0) > 0
}

/** Faz upload da foto para o Cloudinary via edge function */
async function uploadArrivalPhoto(file: File, eventId: string, organizationId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('organizationId', organizationId)
  formData.append('eventId', eventId)
  formData.append('assetType', 'image')
  formData.append('folder', `arrival-proofs/${eventId}`)

  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${CLOUDINARY_EDGE_FUNCTION}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: formData,
    },
  )

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.error ?? 'Falha no upload da foto')
  }

  const result = await response.json()
  return result.secureUrl ?? result.url
}

/** Submete a prova de chegada: faz upload da foto e registra GPS + horário */
export async function submitArrivalProof(params: {
  eventId: string
  organizationId: string
  photoFile: File
  latitude: number
  longitude: number
  accuracyMeters?: number
}): Promise<ArrivalProofResult> {
  const photoUrl = await uploadArrivalPhoto(params.photoFile, params.eventId, params.organizationId)

  const { data, error } = await supabase.functions.invoke('submit-arrival-proof', {
    body: {
      event_id: params.eventId,
      photo_url: photoUrl,
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy_meters: params.accuracyMeters,
      device_info: {
        userAgent: navigator.userAgent,
        platform: (window as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() ?? 'web',
      },
    },
  })

  if (error) throw error
  return data as ArrivalProofResult
}

/** Converte dataURL (foto da câmera) em File para upload */
export function dataUrlToFile(dataUrl: string, filename = 'arrival.jpg'): File {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}
