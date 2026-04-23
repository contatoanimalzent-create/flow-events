/**
 * Offline Sync Engine
 * Processes the offline queue when the device comes back online.
 * Handles retries, conflicts, and error logging.
 */

import { supabase } from '@/lib/supabase'
import { useOffline } from './offline.store'
import type { OfflineAction } from './offline.store'

const MAX_RETRIES = 3
const RETRY_DELAYS = [2_000, 5_000, 15_000] // ms

async function processAction(action: OfflineAction): Promise<void> {
  switch (action.type) {
    case 'checkin': {
      const { eventId, token, operatorId, gate } = action.payload as any
      const { error } = await supabase.from('checkins').insert({
        event_id: eventId,
        qr_token: token,
        operator_id: operatorId ?? null,
        gate: gate ?? null,
        checked_in_at: action.createdAt,
        synced_at: new Date().toISOString(),
        offline: true,
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'manual-check': {
      const { eventId, attendeeId, operatorId } = action.payload as any
      const { error } = await supabase.from('checkins').insert({
        event_id: eventId,
        attendee_id: attendeeId,
        operator_id: operatorId ?? null,
        checked_in_at: action.createdAt,
        synced_at: new Date().toISOString(),
        offline: true,
        manual: true,
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'start-presence': {
      const { sessionId, staffId, eventId, lat, lng } = action.payload as any
      const { error } = await supabase.from('staff_sessions').upsert({
        id: sessionId,
        staff_member_id: staffId,
        event_id: eventId,
        started_at: action.createdAt,
        lat_start: lat ?? null,
        lng_start: lng ?? null,
        status: 'active',
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'end-presence': {
      const { sessionId, lat, lng } = action.payload as any
      const { error } = await supabase
        .from('staff_sessions')
        .update({
          ended_at: new Date().toISOString(),
          lat_end: lat ?? null,
          lng_end: lng ?? null,
          status: 'closed',
        })
        .eq('id', sessionId)
      if (error) throw new Error(error.message)
      break
    }

    case 'occurrence': {
      const { staffMemberId, eventId, type, description, location } = action.payload as any
      const { error } = await supabase.from('staff_occurrences').insert({
        staff_member_id: staffMemberId,
        event_id: eventId,
        type,
        description,
        location: location ?? null,
        occurred_at: action.createdAt,
        offline: true,
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'location-ping': {
      const { staffMemberId, eventId, lat, lng } = action.payload as any
      const { error } = await supabase.from('staff_location_pings').insert({
        staff_member_id: staffMemberId,
        event_id: eventId,
        lat,
        lng,
        pinged_at: action.createdAt,
      })
      if (error) throw new Error(error.message)
      break
    }

    default:
      console.warn('[offline-sync] unknown action type:', action.type)
  }
}

export async function syncOfflineQueue(): Promise<void> {
  const store = useOffline.getState()
  if (store.syncInProgress) return

  const pending = store.queue.filter(
    (a) => a.status === 'pending' || (a.status === 'failed' && a.retries < MAX_RETRIES)
  )

  if (pending.length === 0) return

  store.setSyncInProgress(true)

  for (const action of pending) {
    store.markSyncing(action.id)
    try {
      // Respect retry delay
      if (action.retries > 0) {
        const delay = RETRY_DELAYS[Math.min(action.retries - 1, RETRY_DELAYS.length - 1)]
        const lastAttemptMs = action.syncedAt ? Date.now() - new Date(action.syncedAt).getTime() : Infinity
        if (lastAttemptMs < delay) {
          store.markFailed(action.id, `Retry delayed (${action.retries} attempts)`)
          continue
        }
      }

      await processAction(action)
      store.markSynced(action.id)
    } catch (err: any) {
      const msg = err?.message ?? 'Unknown sync error'
      console.error(`[offline-sync] failed action ${action.id}:`, msg)
      store.markFailed(action.id, msg)
    }
  }

  store.setSyncInProgress(false)
  store.clearSynced()
}
