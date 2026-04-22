import { useEffect } from 'react'
import { useOffline } from './offline.store'

/** Registers online/offline event listeners. Mount once at app root. */
export function useOfflineDetection() {
  const setOnline = useOffline((s) => s.setOnline)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])
}

export function usePendingActions() {
  const queue = useOffline((s) => s.queue)
  return queue.filter((a) => a.status === 'pending' || a.status === 'failed')
}

export function useSyncStatus() {
  const { syncInProgress, lastSyncAt, pendingCount } = useOffline()
  return { syncInProgress, lastSyncAt, pendingCount }
}
