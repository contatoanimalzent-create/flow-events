/**
 * Offline Sync Engine
 * Processes the offline queue when the device comes back online.
 */

import { supabase } from '@/lib/supabase'
import { useOffline } from './offline.store'
import type { OfflineAction } from './offline.store'

const MAX_RETRIES = 3
const RETRY_DELAYS = [2_000, 5_000, 15_000]

async function processAction(action: OfflineAction): Promise<void> {
  switch (action.type) {
    case 'checkin': {
      const { eventId, token, operatorId, gate } = action.payload as any
      const { error } = await supabase.from('checkins').insert({
        event_id: eventId,
        digital_ticket_id: null,
        gate_id: gate ?? null,
        operator_id: operatorId ?? null,
        result: 'success',
        reason_code: 'offline_sync',
        is_exit: false,
        was_offline: true,
        checked_in_at: action.createdAt,
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'manual-check': {
      const { eventId, ticketId, operatorId } = action.payload as any
      const { error } = await supabase.from('checkins').insert({
        event_id: eventId,
        digital_ticket_id: ticketId ?? null,
        operator_id: operatorId ?? null,
        result: 'success',
        reason_code: 'manual_offline',
        is_exit: false,
        was_offline: true,
        checked_in_at: action.createdAt,
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'start-presence': {
      const { staffId, eventId, organizationId } = action.payload as any
      const { error } = await supabase.from('timeclock_sessions').insert({
        staff_member_id: staffId,
        event_id: eventId,
        organization_id: organizationId ?? null,
        opened_at: action.createdAt,
        status: 'open',
      })
      if (error) throw new Error(error.message)
      break
    }

    case 'end-presence': {
      const { sessionId } = action.payload as any
      const { error } = await supabase
        .from('timeclock_sessions')
        .update({
          closed_at: new Date().toISOString(),
          status: 'closed',
        })
        .eq('id', sessionId)
      if (error) throw new Error(error.message)
      break
    }

    case 'occurrence': {
      const { staffMemberId, eventId, type, description } = action.payload as any
      try {
        await supabase.from('staff_occurrences').insert({
          staff_id: staffMemberId,
          event_id: eventId,
          type,
          description,
          created_at: action.createdAt,
        })
      } catch {
        // Table may not exist
      }
      break
    }

    case 'location-ping': {
      console.debug('[offline-sync] location-ping skipped (no table)')
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
