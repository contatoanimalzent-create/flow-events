export type AppMode = 'operator' | 'staff' | 'supervisor' | 'attendee' | 'promoter'

export interface ActiveContext {
  organizationId: string
  organizationName: string
  organizationLogo: string | null
  eventId: string
  eventName: string
  eventDate: string | null
  eventCover: string | null
  mode: AppMode
}

export interface AppContextState {
  context: ActiveContext | null
  availableModes: AppMode[]
  isContextReady: boolean
  isLoading: boolean
  setContext(context: ActiveContext): void
  setMode(mode: AppMode): void
  clearContext(): void
  setAvailableModes(modes: AppMode[]): void
  setLoading(loading: boolean): void
}
