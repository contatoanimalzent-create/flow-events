import { useEffect } from 'react'
import { useOffline } from './offline.store'
import { syncOfflineQueue } from './offline.sync'

/** Registers online/offline event listeners. Mount once at app root. */
export function useOfflineDetection() {
  const setOnline = useOffline((s) => s.setOnline)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      // Trigger sync when connectivity is restored
      syncOfflineQueue().catch(console.error)
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Periodic sync every 60s when online
  useEffect(() => {
    const interval = setInterval(() => {
      const { isOnline, pendingCount } = useOffline.getState()
      if (isOnline && pendingCount > 0) {
        syncOfflineQueue().catch(console.error)
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [])
}

export function usePendingActions() {
  const queue = useOffline((s) => s.queue)
  return queue.filter((a) => a.status === 'pending' || a.status === 'failed')
}

export function useSyncStatus() {
  const { syncInProgress, lastSyncAt, pendingCount } = useOffline()
  return { syncInProgress, lastSyncAt, pendingCount }
}
