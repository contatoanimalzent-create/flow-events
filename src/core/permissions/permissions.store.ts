import { create } from 'zustand'
import type { PermissionsState, PermissionModule, PermissionAction } from './permissions.types'
import type { AppMode } from '../context/app-context.types'
import { permissionsService } from './permissions.service'

export const usePermissions = create<PermissionsState>()((set, get) => ({
  permissions: [],
  availableModes: [],
  isLoading: false,

  async load(userId: string, orgId: string, eventId: string) {
    set({ isLoading: true })
    try {
      const { permissions, modes } = await permissionsService.getEffectivePermissions(
        userId,
        orgId,
        eventId
      )
      set({ permissions, availableModes: modes, isLoading: false })
    } catch (err) {
      console.error('[permissions] load error', err)
      set({ isLoading: false })
    }
  },

  hasPermission(module: PermissionModule, action: PermissionAction = 'view') {
    const perm = get().permissions.find((p) => p.module === module)
    return perm?.actions.includes(action) ?? false
  },

  canAccessMode(mode: AppMode) {
    return get().availableModes.includes(mode)
  },

  clear() {
    set({ permissions: [], availableModes: [] })
  },
}))
