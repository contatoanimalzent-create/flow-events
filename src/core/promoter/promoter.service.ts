/**
 * Promoter Service
 * Sales, commissions, ranking, goals, referral links.
 */

import { supabase } from '@/lib/supabase'

export interface SaleRecord {
  id: string
  attendeeName: string
  ticketType: string
  amount: number
  currency: string
  soldAt: string
  status: string
}

export interface CommissionSummary {
  total: number
  pending: number
  paid: number
  currency: string
  periodLabel: string
}

export interface RankingEntry {
  position: number
  name: string
  sales: number
  revenue: number
  isMe: boolean
}

export interface PromoterGoal {
  id: string
  label: string
  target: number
  current: number
  unit: string
  deadline: string | null
}

export interface PromoterStats {
  salesToday: number
  salesTotal: number
  revenueToday: number
  revenueTotal: number
  conversionRate: number
  averageTicket: number
  myCode: string | null
  myLink: string | null
}

export const promoterService = {
  async getStats(userId: string, eventId: string): Promise<PromoterStats> {
    // Get referral link
    const { data: link } = await supabase
      .from('referral_links')
      .select('code, short_url')
      .eq('owner_id', userId)
      .eq('event_id', eventId)
      .maybeSingle()

    // Sales via referral
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, status')
      .eq('referral_code', link?.code ?? '')
      .in('status', ['paid', 'confirmed'])

    const allOrders = orders ?? []
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = allOrders.filter((o: any) => o.created_at.startsWith(today))

    const revenueTotal = allOrders.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0)
    const revenueToday = todayOrders.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0)

    // Clicks
    const { count: clicks } = await supabase
      .from('referral_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('referral_code', link?.code ?? '')

    return {
      salesToday: todayOrders.length,
      salesTotal: allOrders.length,
      revenueToday,
      revenueTotal,
      conversionRate: clicks ? Math.round((allOrders.length / clicks) * 100) : 0,
      averageTicket: allOrders.length ? Math.round(revenueTotal / allOrders.length) : 0,
      myCode: link?.code ?? null,
      myLink: link?.short_url ?? null,
    }
  },

  async getSales(userId: string, eventId: string, limit = 50): Promise<SaleRecord[]> {
    const { data: link } = await supabase
      .from('referral_links')
      .select('code')
      .eq('owner_id', userId)
      .eq('event_id', eventId)
      .maybeSingle()

    if (!link?.code) return []

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, total_amount, currency, created_at, status,
        buyer_id,
        profiles!buyer_id(full_name),
        order_items(ticket_types(name))
      `)
      .eq('referral_code', link.code)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!orders) return []

    return (orders as any[]).map((o) => ({
      id: o.id,
      attendeeName: o.profiles?.full_name ?? 'Participante',
      ticketType: o.order_items?.[0]?.ticket_types?.name ?? 'Ingresso',
      amount: o.total_amount ?? 0,
      currency: o.currency ?? 'BRL',
      soldAt: o.created_at,
      status: o.status,
    }))
  },

  async getCommission(userId: string, eventId: string): Promise<CommissionSummary> {
    const { data } = await supabase
      .from('commissions')
      .select('amount, status, currency')
      .eq('promoter_id', userId)
      .eq('event_id', eventId)

    if (!data || data.length === 0) {
      return { total: 0, pending: 0, paid: 0, currency: 'BRL', periodLabel: 'Este evento' }
    }

    const currency = (data[0] as any).currency ?? 'BRL'
    const total = (data as any[]).reduce((s, c) => s + (c.amount ?? 0), 0)
    const pending = (data as any[]).filter((c) => c.status === 'pending').reduce((s, c) => s + (c.amount ?? 0), 0)
    const paid = (data as any[]).filter((c) => c.status === 'paid').reduce((s, c) => s + (c.amount ?? 0), 0)

    return { total, pending, paid, currency, periodLabel: 'Este evento' }
  },

  async getRanking(eventId: string, userId: string, limit = 20): Promise<RankingEntry[]> {
    const { data } = await supabase
      .from('promoter_ranking')
      .select('owner_id, sales_count, revenue, profiles!owner_id(full_name)')
      .eq('event_id', eventId)
      .order('sales_count', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((r, i) => ({
      position: i + 1,
      name: r.profiles?.full_name ?? 'Promoter',
      sales: r.sales_count ?? 0,
      revenue: r.revenue ?? 0,
      isMe: r.owner_id === userId,
    }))
  },

  async getGoals(userId: string, eventId: string): Promise<PromoterGoal[]> {
    const { data } = await supabase
      .from('promoter_goals')
      .select('id, label, target, current, unit, deadline')
      .eq('promoter_id', userId)
      .eq('event_id', eventId)

    if (!data) return []

    return (data as any[]).map((g) => ({
      id: g.id,
      label: g.label,
      target: g.target,
      current: g.current ?? 0,
      unit: g.unit ?? 'vendas',
      deadline: g.deadline ?? null,
    }))
  },
}
