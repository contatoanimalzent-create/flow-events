import { create } from 'zustand'
import type { UserOrganization } from './organizations.types'
import { organizationsService } from './organizations.service'

interface OrganizationsState {
  organizations: UserOrganization[]
  activeOrganization: UserOrganization | null
  isLoading: boolean
  load(userId: string): Promise<void>
  setActive(org: UserOrganization): void
  clear(): void
}

export const useOrganizations = create<OrganizationsState>()((set) => ({
  organizations: [],
  activeOrganization: null,
  isLoading: false,

  async load(userId: string) {
    set({ isLoading: true })
    try {
      const orgs = await organizationsService.getUserOrganizations(userId)
      set({ organizations: orgs, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setActive(org: UserOrganization) {
    set({ activeOrganization: org })
  },

  clear() {
    set({ organizations: [], activeOrganization: null })
  },
}))
