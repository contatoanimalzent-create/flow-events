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
    // Get referral link (referral_links uses referrer_id, not owner_id)
    const { data: link } = await supabase
      .from('referral_links')
      .select('id, code')
      .eq('referrer_id', userId)
      .eq('event_id', eventId)
      .maybeSingle()

    // Sales via referral_conversions (orders has no referral_code column)
    const { data: conversions } = await supabase
      .from('referral_conversions')
      .select('order_id, gross_amount, created_at')
      .eq('referral_link_id', link?.id ?? '')
      .eq('event_id', eventId)
      .eq('conversion', true)

    const allConversions = conversions ?? []
    const today = new Date().toISOString().slice(0, 10)
    const todayConversions = allConversions.filter((c: any) => c.created_at.startsWith(today))

    const revenueTotal = allConversions.reduce((s: number, c: any) => s + (c.gross_amount ?? 0), 0)
    const revenueToday = todayConversions.reduce((s: number, c: any) => s + (c.gross_amount ?? 0), 0)

    // Clicks (referral_clicks may not exist; guard against error)
    const { count: clicks } = await supabase
      .from('referral_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('referral_code', link?.code ?? '')

    return {
      salesToday: todayConversions.length,
      salesTotal: allConversions.length,
      revenueToday,
      revenueTotal,
      conversionRate: clicks ? Math.round((allConversions.length / clicks) * 100) : 0,
      averageTicket: allConversions.length ? Math.round(revenueTotal / allConversions.length) : 0,
      myCode: link?.code ?? null,
      myLink: null,
    }
  },

  async getSales(userId: string, eventId: string, limit = 50): Promise<SaleRecord[]> {
    // referral_links uses referrer_id, not owner_id
    const { data: link } = await supabase
      .from('referral_links')
      .select('id')
      .eq('referrer_id', userId)
      .eq('event_id', eventId)
      .maybeSingle()

    if (!link?.id) return []

    // Use referral_conversions to find orders (orders has no referral_code column)
    const { data: conversions } = await supabase
      .from('referral_conversions')
      .select('order_id, gross_amount, buyer_email, created_at')
      .eq('referral_link_id', link.id)
      .eq('event_id', eventId)
      .eq('conversion', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!conversions || conversions.length === 0) return []

    // Fetch the actual orders for status and items
    const orderIds = conversions.map((c: any) => c.order_id)
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, total_amount, created_at, status, buyer_name,
        order_items(ticket_types(name))
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false })

    const orderMap = new Map((orders ?? []).map((o: any) => [o.id, o]))

    return conversions.map((c: any) => {
      const o = orderMap.get(c.order_id)
      return {
        id: c.order_id,
        attendeeName: o?.buyer_name ?? c.buyer_email ?? 'Participante',
        ticketType: o?.order_items?.[0]?.ticket_types?.name ?? 'Ingresso',
        amount: o?.total_amount ?? c.gross_amount ?? 0,
        currency: 'BRL',
        soldAt: o?.created_at ?? c.created_at,
        status: o?.status ?? 'paid',
      }
    })
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
    // profiles has first_name/last_name, not full_name
    const { data } = await supabase
      .from('promoter_ranking')
      .select('owner_id, sales_count, revenue, profiles!owner_id(first_name, last_name)')
      .eq('event_id', eventId)
      .order('sales_count', { ascending: false })
      .limit(limit)

    if (!data) return []

    return (data as any[]).map((r, i) => {
      const first = r.profiles?.first_name ?? ''
      const last = r.profiles?.last_name ?? ''
      const fullName = [first, last].filter(Boolean).join(' ') || 'Promoter'
      return {
        position: i + 1,
        name: fullName,
        sales: r.sales_count ?? 0,
        revenue: r.revenue ?? 0,
        isMe: r.owner_id === userId,
      }
    })
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
