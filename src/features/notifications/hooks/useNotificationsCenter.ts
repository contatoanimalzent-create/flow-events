import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { notificationsService } from '@/features/notifications/services/notifications.service'
import { paginateItems } from '@/shared/api'

export function useNotificationsCenter() {
  const organization = useAuthStore((state) => state.organization)
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['notifications', organization?.id] as const,
    queryFn: () => (organization?.id ? notificationsService.list(organization.id) : Promise.resolve([])),
    enabled: Boolean(organization?.id),
    refetchInterval: 60_000,
  })

  const paginatedNotifications = useMemo(() => paginateItems(query.data ?? [], { page, pageSize: 6 }), [page, query.data])

  useEffect(() => {
    setPage(1)
  }, [query.data])

  function markAsRead(notificationId: string) {
    if (!organization?.id) {
      return
    }

    notificationsService.markAsRead(organization.id, notificationId)
    void query.refetch()
  }

  return {
    notifications: paginatedNotifications.items,
    allNotifications: query.data ?? [],
    pagination: paginatedNotifications.pagination,
    setPage,
    unreadCount: (query.data ?? []).filter((item) => !item.read).length,
    loading: query.isPending,
    markAsRead,
  }
}
