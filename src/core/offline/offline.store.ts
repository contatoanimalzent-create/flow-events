import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OfflineActionType =
  | 'checkin'
  | 'manual-check'
  | 'start-presence'
  | 'end-presence'
  | 'occurrence'
  | 'location-ping'

export type OfflineActionStatus = 'pending' | 'syncing' | 'synced' | 'failed'

export interface OfflineAction {
  id: string
  type: OfflineActionType
  payload: Record<string, unknown>
  status: OfflineActionStatus
  createdAt: string
  syncedAt: string | null
  error: string | null
  retries: number
}

interface OfflineState {
  isOnline: boolean
  queue: OfflineAction[]
  syncInProgress: boolean
  lastSyncAt: string | null
  pendingCount: number

  setOnline(online: boolean): void
  enqueue(type: OfflineActionType, payload: Record<string, unknown>): string
  markSyncing(id: string): void
  markSynced(id: string): void
  markFailed(id: string, error: string): void
  clearSynced(): void
  setSyncInProgress(val: boolean): void
}

export const useOffline = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      queue: [],
      syncInProgress: false,
      lastSyncAt: null,
      pendingCount: 0,

      setOnline(online: boolean) {
        set({ isOnline: online })
      },

      enqueue(type: OfflineActionType, payload: Record<string, unknown>) {
        const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const action: OfflineAction = {
          id,
          type,
          payload,
          status: 'pending',
          createdAt: new Date().toISOString(),
          syncedAt: null,
          error: null,
          retries: 0,
        }
        set((s) => ({
          queue: [...s.queue, action],
          pendingCount: s.pendingCount + 1,
        }))
        return id
      },

      markSyncing(id: string) {
        set((s) => ({
          queue: s.queue.map((a) =>
            a.id === id ? { ...a, status: 'syncing' as const } : a
          ),
        }))
      },

      markSynced(id: string) {
        set((s) => ({
          queue: s.queue.map((a) =>
            a.id === id
              ? { ...a, status: 'synced' as const, syncedAt: new Date().toISOString() }
              : a
          ),
          lastSyncAt: new Date().toISOString(),
          pendingCount: Math.max(0, s.pendingCount - 1),
        }))
      },

      markFailed(id: string, error: string) {
        set((s) => ({
          queue: s.queue.map((a) =>
            a.id === id
              ? { ...a, status: 'failed' as const, error, retries: a.retries + 1 }
              : a
          ),
        }))
      },

      clearSynced() {
        set((s) => ({ queue: s.queue.filter((a) => a.status !== 'synced') }))
      },

      setSyncInProgress(val: boolean) {
        set({ syncInProgress: val })
      },
    }),
    {
      name: 'pulse-offline-queue-v1',
      partialize: (s) => ({ queue: s.queue, pendingCount: s.pendingCount }),
    }
  )
)
