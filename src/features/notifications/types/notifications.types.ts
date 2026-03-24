export type NotificationType = 'operational' | 'financial' | 'sales' | 'campaign' | 'error'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface NotificationItem {
  id: string
  organization_id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  description: string
  created_at: string
  read: boolean
}
