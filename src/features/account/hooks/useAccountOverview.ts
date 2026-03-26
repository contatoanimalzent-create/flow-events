import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { accountQueries } from '@/features/account/services'

export function useAccountOverview() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  const email = user?.email ?? ''
  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    user?.user_metadata?.full_name ||
    user?.email ||
    ''

  return useQuery({
    ...(email
      ? accountQueries.overview({
          email,
          name: String(name),
          phone: profile?.phone ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        })
      : accountQueries.overview({
          email: 'anonymous',
          name: null,
          phone: null,
          avatarUrl: null,
        })),
    enabled: Boolean(email),
  })
}
