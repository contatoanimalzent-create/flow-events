import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { notificationsService } from '@/features/notifications/services/notifications.service'

export function useNotificationsCenter() {
  const organization = useAuthStore((state) => state.organization)

  const query = useQuery({
    queryKey: ['notifications', organization?.id] as const,
    queryFn: () => (organization?.id ? notificationsService.list(organization.id) : Promise.resolve([])),
    enabled: Boolean(organization?.id),
    refetchInterval: 60_000,
  })

  function markAsRead(notificationId: string) {
    if (!organization?.id) {
      return
    }

    notificationsService.markAsRead(organization.id, notificationId)
    void query.refetch()
  }

  return {
    notifications: query.data ?? [],
    unreadCount: (query.data ?? []).filter((item) => !item.read).length,
    loading: query.isPending,
    markAsRead,
  }
}
