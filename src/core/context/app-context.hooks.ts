import { useAppContext } from './app-context.store'
import type { AppMode } from './app-context.types'

export function useActiveMode(): AppMode | null {
  return useAppContext((s) => s.context?.mode ?? null)
}

export function useActiveEvent() {
  return useAppContext((s) =>
    s.context
      ? { id: s.context.eventId, name: s.context.eventName, date: s.context.eventDate, cover: s.context.eventCover }
      : null
  )
}

export function useActiveOrganization() {
  return useAppContext((s) =>
    s.context
      ? { id: s.context.organizationId, name: s.context.organizationName, logo: s.context.organizationLogo }
      : null
  )
}

export function useIsContextReady() {
  return useAppContext((s) => s.isContextReady)
}

export function useAvailableModes(): AppMode[] {
  return useAppContext((s) => s.availableModes)
}
