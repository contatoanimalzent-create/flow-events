import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'info' | 'warning' | 'critical' | 'success'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionPath?: string
}

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  add(n: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): void
  markRead(id: string): void
  markAllRead(): void
  remove(id: string): void
  clear(): void
}

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      add(n) {
        const notif: AppNotification = {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          notifications: [notif, ...s.notifications].slice(0, 100),
          unreadCount: s.unreadCount + 1,
        }))
      },

      markRead(id: string) {
        const notif = get().notifications.find((n) => n.id === id)
        if (!notif || notif.isRead) return
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, s.unreadCount - 1),
        }))
      },

      markAllRead() {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }))
      },

      remove(id: string) {
        const notif = get().notifications.find((n) => n.id === id)
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
          unreadCount: notif?.isRead === false ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
        }))
      },

      clear() {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: 'pulse-notifications-v1',
      partialize: (s) => ({ notifications: s.notifications, unreadCount: s.unreadCount }),
    }
  )
)
