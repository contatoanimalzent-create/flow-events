import { create } from 'zustand'
import type { UserEvent } from './events.types'
import { eventsService } from './events.service'

interface EventsState {
  events: UserEvent[]
  activeEvent: UserEvent | null
  isLoading: boolean
  load(userId: string, orgId: string): Promise<void>
  setActive(event: UserEvent): void
  clear(): void
}

export const useEvents = create<EventsState>()((set) => ({
  events: [],
  activeEvent: null,
  isLoading: false,

  async load(userId: string, orgId: string) {
    set({ isLoading: true })
    try {
      const events = await eventsService.getEventsForUser(userId, orgId)
      set({ events, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setActive(event: UserEvent) {
    set({ activeEvent: event })
  },

  clear() {
    set({ events: [], activeEvent: null })
  },
}))
