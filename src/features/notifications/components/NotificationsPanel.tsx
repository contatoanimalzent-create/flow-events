import { Bell } from 'lucide-react'
import type { NotificationItem } from '@/features/notifications/types/notifications.types'
import type { ApiPaginationMeta } from '@/shared/api'
import { PaginationControls } from '@/shared/components'
import { formatDate } from '@/shared/lib'

interface NotificationsPanelProps {
  notifications: NotificationItem[]
  onMarkAsRead: (notificationId: string) => void
  pagination?: ApiPaginationMeta
  onPageChange?: (page: number) => void
}

function priorityClasses(priority: NotificationItem['priority']) {
  switch (priority) {
    case 'high':
      return 'border-status-error/20 bg-status-error/5'
    case 'medium':
      return 'border-status-warning/20 bg-status-warning/5'
    case 'low':
    default:
      return 'border-bg-border bg-bg-card'
  }
}

export function NotificationsPanel({ notifications, onMarkAsRead, pagination, onPageChange }: NotificationsPanelProps) {
  if (notifications.length === 0) {
    return <div className="rounded-sm border border-bg-border bg-bg-card p-4 text-center text-sm text-text-muted">Nenhuma notificacao no momento.</div>
  }

  return (
    <div className="space-y-2">
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => onMarkAsRead(notification.id)}
            className={`w-full rounded-sm border p-3 text-left transition-all ${priorityClasses(notification.priority)} ${notification.read ? 'opacity-70' : ''}`}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Bell className="h-3.5 w-3.5 text-brand-acid" />
                {notification.title}
              </div>
              <span className="text-[10px] font-mono text-text-muted">{formatDate(notification.created_at, 'dd/MM HH:mm')}</span>
            </div>
            <div className="text-[11px] text-text-muted">{notification.description}</div>
          </button>
        ))}
      </div>
      {pagination && onPageChange ? <PaginationControls pagination={pagination} onPageChange={onPageChange} compact /> : null}
    </div>
  )
}
