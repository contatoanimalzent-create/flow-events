import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit/services/audit.service'
import type { AuditEntityType } from '@/features/audit/types/audit.types'

export function useAuditTrail() {
  const organization = useAuthStore((state) => state.organization)
  const [eventId, setEventId] = useState<string>('all')
  const [userId, setUserId] = useState<string>('all')
  const [entityType, setEntityType] = useState<AuditEntityType | 'all'>('all')

  const query = useQuery({
    queryKey: ['audit', organization?.id, eventId, userId, entityType] as const,
    queryFn: () =>
      organization?.id
        ? auditService.list({
            organizationId: organization.id,
            eventId: eventId === 'all' ? null : eventId,
            userId: userId === 'all' ? null : userId,
            entityType,
          })
        : Promise.resolve([]),
    enabled: Boolean(organization?.id),
  })

  const users = useMemo(
    () =>
      Array.from(
        new Map((query.data ?? []).filter((entry) => entry.user_id).map((entry) => [entry.user_id as string, { id: entry.user_id as string, name: entry.user_name ?? 'Usuario' }])).values(),
      ),
    [query.data],
  )

  const events = useMemo(
    () =>
      Array.from(
        new Map((query.data ?? []).filter((entry) => entry.event_id).map((entry) => [entry.event_id as string, { id: entry.event_id as string, label: entry.event_id as string }])).values(),
      ),
    [query.data],
  )

  return {
    entries: query.data ?? [],
    loading: query.isPending,
    eventId,
    setEventId,
    userId,
    setUserId,
    entityType,
    setEntityType,
    users,
    events,
  }
}
