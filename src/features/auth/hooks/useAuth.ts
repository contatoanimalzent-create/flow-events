import { useAuthStore } from '@/features/auth/services'

export function useAuth() {
  return useAuthStore()
}
