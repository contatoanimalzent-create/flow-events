import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import { campaignsService } from '@/features/campaigns/services'
import { crmService } from '@/features/crm/services'
import { financialService } from '@/features/financial/services'
import { intelligenceService } from '@/features/intelligence/services'
import { filterExampleEvents } from '@/shared/lib/example-events'
import type {
  DashboardConversionPoint,
  DashboardCustomerRankingRow,
  DashboardEventFilterOption,
  DashboardEventRankingRow,
  DashboardOverview,
  DashboardPerformanceItem,
  DashboardPeriodFilter,
  DashboardRevenuePoint,
} from '@/features/dashboard/types'

const dashboardApi = createApiClient('dashboard')
const ACTIVE_CAMPAIGN_STATUSES = new Set(['pending', 'resolving', 'sending', 'paused'])

function buildThreshold(period: DashboardPeriodFilter) {
  if (period === 'all') {
    return null
  }

  const days = Number(period.replace('d', ''))
  return new Date(Date.now() - days * 86_400_000)
}

function isWithinPeriod(value: string | null | undefined, threshold: Date | null) {
  if (!threshold || !value) {
    return true
  }

  return new Date(value).getTime() >= threshold.getTime()
}

function buildRevenueSeries(
  reports: Array<{ starts_at: string; gross_sales: number; net_sales: number }>,
  period: DashboardPeriodFilter,
): DashboardRevenuePoint[] {
  if (reports.length === 0) {
    return []
  }

  const formatter = period === '7d' || period === '30d'
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
    : new Intl.DateTimeFormat('pt-BR', { month: 'short' })

  const grouped = new Map<string, DashboardRevenuePoint>()

  for (const report of reports) {
    const date = new Date(report.starts_at)
    const key = period === '7d' || period === '30d'
      ? date.toISOString().slice(0, 10)
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const current = grouped.get(key) ?? { label: formatter.format(date), grossRevenue: 0, netRevenue: 0 }
    current.grossRevenue += report.gross_sales
    current.netRevenue += report.net_sales
    grouped.set(key, current)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value)
}

function buildConversionSeries(events: DashboardEventFilterOption[]): DashboardConversionPoint[] {
  return events
    .map((event) => {
      const soldTickets = Number(event.sold_tickets ?? 0)
      const capacity = Number(event.total_capacity ?? 0)
      const conversionRate = capacity > 0 ? Number(((soldTickets / capacity) * 100).toFixed(1)) : 0

      return {
        label: event.name,
        eventId: event.id,
        soldTickets,
        capacity,
        conversionRate,
      }
    })
    .sort((left, right) => right.conversionRate - left.conversionRate)
    .slice(0, 6)
}

function buildPerformanceItems(params: {
  criticalAlerts: number
  activeEvents: number
  runningCampaigns: number
  totalCustomers: number
  totalCheckins: number
}) {
  const items: DashboardPerformanceItem[] = [
    { id: 'events', label: 'Eventos ativos', value: `${params.activeEvents}`, tone: params.activeEvents > 0 ? 'success' : 'warning' },
    { id: 'campaigns', label: 'Campanhas rodando', value: `${params.runningCampaigns}`, tone: params.runningCampaigns > 0 ? 'default' : 'warning' },
    { id: 'alerts', label: 'Alertas críticos', value: `${params.criticalAlerts}`, tone: params.criticalAlerts > 0 ? 'danger' : 'success' },
    { id: 'customers', label: 'Base de clientes', value: `${params.totalCustomers}`, tone: params.totalCustomers > 0 ? 'default' : 'warning' },
    { id: 'checkins', label: 'Check-ins confirmados', value: `${params.totalCheckins}`, tone: params.totalCheckins > 0 ? 'success' : 'default' },
  ]

  return items
}

export const dashboardService = {
  async getOverview(organizationId: string, period: DashboardPeriodFilter = '30d', eventId = 'all'): Promise<DashboardOverview> {
    return dashboardApi.request('get_overview', async () => {
      const threshold = buildThreshold(period)

      // Fallback values para cada serviço que pode falhar
      const settled = await Promise.allSettled([
        supabase
          .from('events')
          .select('id,name,starts_at,status,total_capacity,sold_tickets')
          .eq('organization_id', organizationId)
          .order('starts_at', { ascending: false }),
        financialService.getFinancialOverview(organizationId).catch(err => ({ reports: [], summary: null })),
        campaignsService.getOverview(organizationId).catch(err => ({ runs: [], summary: null })),
        intelligenceService.getOverview(organizationId).catch(err => ({ alerts: [], summary: null })),
        crmService.getOverview(organizationId).catch(err => ({ customers: [], summary: null })),
        supabase
          .from('checkins')
          .select('event_id,checked_in_at')
          .eq('result', 'success')
          .eq('is_exit', false)
          .order('checked_in_at', { ascending: false })
          .limit(5000),
      ])

      // Extrai valores com fallback
      const eventsResult = settled[0].status === 'fulfilled' ? settled[0].value : { data: null, error: null }
      const financialOverview = settled[1].status === 'fulfilled' ? settled[1].value : { reports: [], summary: null }
      const campaignsOverview = settled[2].status === 'fulfilled' ? settled[2].value : { runs: [], summary: null }
      const intelligenceOverview = settled[3].status === 'fulfilled' ? settled[3].value : { alerts: [], summary: null }
      const crmOverview = settled[4].status === 'fulfilled' ? settled[4].value : { customers: [], summary: null }
      const checkinsResult = settled[5].status === 'fulfilled' ? settled[5].value : { data: null, error: null }

      if (eventsResult.error) {
        throw eventsResult.error
      }

      if (checkinsResult.error) {
        throw checkinsResult.error
      }

      const allEvents: DashboardEventFilterOption[] = filterExampleEvents((((eventsResult.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        starts_at: String(row.starts_at ?? ''),
        status: (row.status as string | null | undefined) ?? null,
        total_capacity: row.total_capacity == null ? null : Number(row.total_capacity),
        sold_tickets: row.sold_tickets == null ? null : Number(row.sold_tickets),
      })))

      const filteredEvents = allEvents.filter((event) => {
        if (eventId !== 'all' && event.id !== eventId) {
          return false
        }

        return isWithinPeriod(event.starts_at, threshold)
      })

      const filteredEventIds = new Set(filteredEvents.map((event) => event.id))
      const filteredReports = financialOverview.reports.filter((report) => filteredEventIds.has(report.event_id))
      const filteredCustomers = crmOverview.customers.filter((customer) => {
        if (eventId !== 'all' && !customer.event_ids.includes(eventId)) {
          return false
        }

        return isWithinPeriod(customer.last_purchase_at ?? customer.first_order_at ?? null, threshold)
      })
      const filteredRuns = campaignsOverview.runs.filter((run) => {
        if (eventId !== 'all' && run.event_id !== eventId) {
          return false
        }

        return ACTIVE_CAMPAIGN_STATUSES.has(run.status)
      })
      const filteredAlerts = intelligenceOverview.alerts.filter((alert) => {
        if (eventId !== 'all' && alert.event_id !== eventId) {
          return false
        }

        return alert.severity === 'critical'
      })

      const totalCheckins = (((checkinsResult.data as Record<string, unknown>[] | null) ?? [])).filter((row) => {
        const currentEventId = String(row.event_id ?? '')
        const checkedInAt = String(row.checked_in_at ?? '')

        if (!filteredEventIds.has(currentEventId)) {
          return false
        }

        return isWithinPeriod(checkedInAt, threshold)
      }).length

      const grossRevenue = filteredReports.reduce((sum, report) => sum + report.gross_sales, 0)
      const netRevenue = filteredReports.reduce((sum, report) => sum + report.net_sales, 0)
      const result = filteredReports.reduce((sum, report) => sum + report.result, 0)
      const marginPercent = netRevenue > 0 ? Number(((result / netRevenue) * 100).toFixed(1)) : 0

      const eventRanking: DashboardEventRankingRow[] = filteredReports
        .map((report) => ({
          event_id: report.event_id,
          event_name: report.event_name,
          starts_at: report.starts_at,
          gross_sales: report.gross_sales,
          net_sales: report.net_sales,
          result: report.result,
          margin_percent: report.margin_percent,
          sold_tickets: Number(allEvents.find((event) => event.id === report.event_id)?.sold_tickets ?? 0),
        }))
        .sort((left, right) => right.net_sales - left.net_sales)
        .slice(0, 8)

      const customerRanking: DashboardCustomerRankingRow[] = filteredCustomers
        .sort((left, right) => right.total_revenue - left.total_revenue)
        .slice(0, 8)
        .map((customer) => ({
          customer_id: customer.id,
          full_name: customer.full_name,
          email: customer.email,
          total_orders: customer.total_orders,
          total_revenue: customer.total_revenue,
          status: customer.status,
          last_purchase_at: customer.last_purchase_at ?? null,
        }))

      const activeEvents = filteredEvents.filter((event) => event.status === 'published' || event.status === 'ongoing').length

      return {
        organization_id: organizationId,
        events: allEvents,
        summary: {
          grossRevenue,
          netRevenue,
          marginPercent,
          activeEvents,
          runningCampaigns: filteredRuns.length,
          criticalAlerts: filteredAlerts.length,
          totalCheckins,
          totalCustomers: filteredCustomers.length,
        },
        revenueSeries: buildRevenueSeries(filteredReports, period),
        conversionSeries: buildConversionSeries(filteredEvents),
        eventRanking,
        customerRanking,
        performance: buildPerformanceItems({
          criticalAlerts: filteredAlerts.length,
          activeEvents,
          runningCampaigns: filteredRuns.length,
          totalCustomers: filteredCustomers.length,
          totalCheckins,
        }),
      }
    }, { organizationId, period, eventId })
  },
}
