import { supabase } from '@/lib/supabase'
import type { NotificationItem } from '@/features/notifications/types/notifications.types'

function readStateKey(organizationId: string) {
  return `animalz:notifications:read:${organizationId}`
}

function readNotificationState(organizationId: string) {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  try {
    const raw = window.localStorage.getItem(readStateKey(organizationId))
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set<string>()
  }
}

function saveNotificationState(organizationId: string, ids: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(readStateKey(organizationId), JSON.stringify(ids))
}

function tableMissing(message?: string) {
  const normalizedMessage = String(message ?? '').toLowerCase()
  return normalizedMessage.includes('does not exist') || normalizedMessage.includes('could not find the table')
}

export const notificationsService = {
  async list(organizationId: string): Promise<NotificationItem[]> {
    const readIds = readNotificationState(organizationId)

    const [runsResult, payoutsResult, alertStatesResult, paidOrdersResult] = await Promise.all([
      supabase
        .from('campaign_runs')
        .select('id,name,status,created_at')
        .eq('organization_id', organizationId)
        .in('status', ['failed', 'pending', 'resolving'])
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('event_payouts')
        .select('id,event_id,status,scheduled_at,created_at')
        .eq('organization_id', organizationId)
        .in('status', ['scheduled', 'held', 'divergent'])
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('intelligence_alert_states')
        .select('id,event_id,status,created_at')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('orders')
        .select('id,buyer_name,created_at')
        .eq('organization_id', organizationId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const items: NotificationItem[] = []

    if (!runsResult.error || tableMissing(runsResult.error?.message)) {
      for (const row of (runsResult.data ?? []) as Array<Record<string, unknown>>) {
        items.push({
          id: `campaign-${String(row.id)}`,
          organization_id: organizationId,
          type: 'campaign',
          priority: String(row.status) === 'failed' ? 'high' : 'medium',
          title: String(row.status) === 'failed' ? 'Campanha com falha' : 'Campanha em processamento',
          description: String(row.name ?? 'Execucao de campanha'),
          created_at: String(row.created_at ?? new Date().toISOString()),
          read: readIds.has(`campaign-${String(row.id)}`),
        })
      }
    }

    if (!payoutsResult.error || tableMissing(payoutsResult.error?.message)) {
      for (const row of (payoutsResult.data ?? []) as Array<Record<string, unknown>>) {
        items.push({
          id: `financial-${String(row.id)}`,
          organization_id: organizationId,
          type: 'financial',
          priority: String(row.status) === 'divergent' ? 'high' : 'medium',
          title: String(row.status) === 'divergent' ? 'Divergencia financeira detectada' : 'Repasse requer revisao',
          description: `Payout ${String(row.status ?? '').toUpperCase()} para o evento ${String(row.event_id ?? '')}`,
          created_at: String(row.created_at ?? row.scheduled_at ?? new Date().toISOString()),
          read: readIds.has(`financial-${String(row.id)}`),
        })
      }
    }

    if (!alertStatesResult.error || tableMissing(alertStatesResult.error?.message)) {
      for (const row of (alertStatesResult.data ?? []) as Array<Record<string, unknown>>) {
        items.push({
          id: `operational-${String(row.id)}`,
          organization_id: organizationId,
          type: 'operational',
          priority: 'high',
          title: 'Alerta operacional ativo',
          description: `Evento ${String(row.event_id ?? 'geral')} com sinal aberto na camada de intelligence.`,
          created_at: String(row.created_at ?? new Date().toISOString()),
          read: readIds.has(`operational-${String(row.id)}`),
        })
      }
    }

    if (!paidOrdersResult.error || tableMissing(paidOrdersResult.error?.message)) {
      for (const row of (paidOrdersResult.data ?? []) as Array<Record<string, unknown>>) {
        items.push({
          id: `sales-${String(row.id)}`,
          organization_id: organizationId,
          type: 'sales',
          priority: 'low',
          title: 'Venda confirmada',
          description: `Pedido pago por ${String(row.buyer_name ?? 'cliente')}.`,
          created_at: String(row.created_at ?? new Date().toISOString()),
          read: readIds.has(`sales-${String(row.id)}`),
        })
      }
    }

    return items.sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
  },

  markAsRead(organizationId: string, notificationId: string) {
    const state = readNotificationState(organizationId)
    state.add(notificationId)
    saveNotificationState(organizationId, Array.from(state))
  },
}
