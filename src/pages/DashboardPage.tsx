import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatNumber, formatDate, formatDaysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Event as AppEvent } from '@/lib/supabase'
import {
  Ticket, DollarSign, Users, ScanLine, TrendingUp,
  AlertTriangle, CalendarDays, Zap, ArrowUpRight,
  Activity, Package, ChevronRight,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DashboardStats {
  ticketsSold: number
  grossRevenue: number
  checkinsTotal: number
  attendanceRate: number
  staffConfirmed: number
  suppliersConfirmed: number
  pendingAlerts: number
  conversionRate: number
}

interface RecentOrder {
  id: string
  buyer_name: string
  buyer_email: string
  total_amount: number
  status: string
  created_at: string
}

interface GrowthInsight {
  id: string
  title: string
  description: string
  cta_text?: string
  priority: number
}

const HOURLY_MOCK = Array.from({ length: 14 }, (_, i) => ({
  hour: `${8 + i}h`,
  checkins: Math.floor(Math.random() * 140 + 20),
}))

const SALES_WEEK = [
  { day: 'Seg', value: 32 }, { day: 'Ter', value: 58 },
  { day: 'Qua', value: 41 }, { day: 'Qui', value: 73 },
  { day: 'Sex', value: 95 }, { day: 'Sáb', value: 120 },
  { day: 'Dom', value: 88 },
]

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-bg-border rounded-sm px-3 py-2 text-xs">
      <div className="text-text-muted mb-1">{label}</div>
      <div className="text-brand-acid font-semibold font-mono">{payload[0].value}</div>
    </div>
  )
}

export function DashboardPage() {
  const { organization } = useAuthStore()
  const [mainEvent, setMainEvent] = useState<AppEvent | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [insights, setInsights] = useState<GrowthInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (organization) fetchDashboard() }, [organization])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const { data: events } = await supabase
        .from('events').select('*')
        .eq('organization_id', organization!.id)
        .in('status', ['published', 'ongoing'])
        .order('starts_at', { ascending: true })
        .limit(1)

      if (events?.[0]) {
        setMainEvent(events[0])
        const ev = events[0]
        const [ordersRes, checkinsRes, staffRes, suppliersRes, recentRes] = await Promise.all([
          supabase.from('orders').select('total_amount').eq('event_id', ev.id).eq('status', 'paid'),
          supabase.from('checkins').select('id').eq('event_id', ev.id).eq('result', 'success').eq('is_exit', false),
          supabase.from('staff_members').select('status').eq('event_id', ev.id).in('status', ['confirmed', 'active']),
          supabase.from('suppliers').select('status').eq('event_id', ev.id).eq('status', 'confirmed'),
          supabase.from('orders').select('id,buyer_name,buyer_email,total_amount,status,created_at')
            .eq('event_id', ev.id).order('created_at', { ascending: false }).limit(5),
        ])
        const gross = ordersRes.data?.reduce((s, o) => s + (o.total_amount || 0), 0) ?? 0
        const checkins = checkinsRes.data?.length ?? 0
        setStats({
          ticketsSold: ev.sold_tickets,
          grossRevenue: gross,
          checkinsTotal: checkins,
          attendanceRate: ev.sold_tickets > 0 ? (checkins / ev.sold_tickets) * 100 : 0,
          staffConfirmed: staffRes.data?.length ?? 0,
          suppliersConfirmed: suppliersRes.data?.length ?? 0,
          pendingAlerts: 2,
          conversionRate: 68.4,
        })
        setRecentOrders(recentRes.data ?? [])
      }

      const { data: insightsData } = await supabase
        .from('growth_insights').select('*')
        .eq('organization_id', organization!.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .limit(2)
      setInsights(insightsData ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-12 w-48 skeleton" />
        <div className="card h-36 skeleton" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-24 skeleton" />)}
        </div>
      </div>
    )
  }

  const occupancy = mainEvent?.total_capacity
    ? Math.round((mainEvent.sold_tickets / mainEvent.total_capacity) * 100) : 0

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            DASHBOARD<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            {formatDate(time.toISOString(), "EEEE, dd 'de' MMMM")} ·{' '}
            <span className="text-brand-acid tabular-nums">
              {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-status-success font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          SISTEMA OPERACIONAL
        </span>
      </div>

      {/* Event hero */}
      {mainEvent ? (
        <div className="card relative overflow-hidden reveal" style={{ transitionDelay: '60ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-acid/3 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-acid/3 rounded-full blur-3xl pointer-events-none" />
          <div className="relative p-5 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase
                                 text-status-success border border-status-success/20 bg-status-success/5 px-2 py-1 rounded-sm">
                  <span className="w-1 h-1 rounded-full bg-status-success animate-pulse" />
                  Publicado
                </span>
                <span className="text-xs text-text-muted font-mono">{formatDaysUntil(mainEvent.starts_at)}</span>
              </div>
              <h2 className="font-display text-3xl tracking-wide text-text-primary leading-none mb-1">
                {mainEvent.name}
              </h2>
              {mainEvent.subtitle && <p className="text-sm text-text-secondary">{mainEvent.subtitle}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-mono">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 text-brand-acid" />
                  {formatDate(mainEvent.starts_at, 'dd/MM/yyyy')}
                </span>
                {mainEvent.venue_name && (
                  <span>📍 {mainEvent.venue_name}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#242424" strokeWidth="6" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#d4ff00" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - occupancy / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-text-primary">{occupancy}%</span>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted mt-1 font-mono tracking-wider">OCUPAÇÃO</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-semibold text-brand-acid tabular-nums">
                    {formatNumber(mainEvent.sold_tickets)}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono tracking-wider">INGRESSOS</div>
                </div>
                {mainEvent.total_capacity && (
                  <div>
                    <div className="text-lg font-medium text-text-secondary tabular-nums">
                      {formatNumber(mainEvent.total_capacity)}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono tracking-wider">CAPACIDADE</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="h-px bg-bg-surface w-full overflow-hidden rounded-full">
              <div className="h-full bg-brand-acid rounded-full" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 flex flex-col items-center justify-center text-center reveal">
          <CalendarDays className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM EVENTO ATIVO</div>
          <p className="text-sm text-text-muted mb-4">Crie seu primeiro evento para ver as métricas</p>
          <button className="btn-primary">+ Criar evento</button>
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Ingressos Vendidos', value: formatNumber(stats.ticketsSold), icon: Ticket, sub: `${occupancy}% da capacidade` },
            { label: 'Receita Bruta', value: formatCurrency(stats.grossRevenue), icon: DollarSign, sub: 'pagamentos confirmados' },
            { label: 'Check-ins', value: formatNumber(stats.checkinsTotal), icon: ScanLine, sub: `${stats.attendanceRate.toFixed(1)}% comparecimento` },
            { label: 'Staff Ativo', value: formatNumber(stats.staffConfirmed), icon: Users, sub: `${stats.suppliersConfirmed} fornecedores` },
          ].map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div key={i} className="card p-4 group hover:border-brand-acid/20 transition-all duration-200 reveal"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{kpi.label}</span>
                  <div className="w-7 h-7 rounded-sm bg-brand-acid/8 flex items-center justify-center group-hover:bg-brand-acid/15 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-brand-acid" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-text-primary tabular-nums">{kpi.value}</div>
                <div className="text-[11px] text-text-muted mt-1">{kpi.sub}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 reveal" style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Atividade de Check-in</div>
              <div className="text-lg font-semibold text-text-primary mt-0.5">{formatNumber(stats?.checkinsTotal ?? 0)} entradas</div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-status-success">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />AO VIVO
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={HOURLY_MOCK} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="acidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#d4ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b6b6b', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="checkins" stroke="#d4ff00" strokeWidth={1.5}
                fill="url(#acidGrad)" dot={false} activeDot={{ r: 3, fill: '#d4ff00', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 reveal" style={{ transitionDelay: '160ms' }}>
          <div className="mb-4">
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Vendas — 7 dias</div>
            <div className="text-lg font-semibold text-text-primary mt-0.5">507 ingressos</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SALES_WEEK} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6b6b', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#d4ff00" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden reveal" style={{ transitionDelay: '120ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Pedidos Recentes</div>
            <button className="text-[11px] text-brand-acid font-mono flex items-center gap-1 hover:underline">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr>{['Comprador', 'Valor', 'Status', 'Quando'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-[13px]">{order.buyer_name}</div>
                      <div className="text-[11px] text-text-muted">{order.buyer_email}</div>
                    </td>
                    <td className="table-cell font-mono text-brand-acid text-sm">{formatCurrency(order.total_amount)}</td>
                    <td className="table-cell">
                      <span className={cn('badge text-[10px]', order.status === 'paid' ? 'badge-success' : 'badge-warning')}>
                        {order.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="table-cell text-text-muted text-[11px] font-mono">
                      {formatDate(order.created_at, 'dd/MM HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-text-muted text-sm">Nenhum pedido ainda</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4 reveal" style={{ transitionDelay: '140ms' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Alertas</span>
              {stats && <span className="w-5 h-5 rounded-sm bg-status-warning/15 text-status-warning text-[10px] font-mono flex items-center justify-center">{stats.pendingAlerts}</span>}
            </div>
            <div className="space-y-2">
              {[
                { msg: 'QR não enviado para 12 compradores', type: 'warning' },
                { msg: '3 fornecedores sem documentação', type: 'error' },
              ].map((a, i) => (
                <div key={i} className={cn('flex items-start gap-2 p-2.5 rounded-sm text-xs border',
                  a.type === 'warning' ? 'bg-status-warning/5 border-status-warning/15 text-status-warning' : 'bg-status-error/5 border-status-error/15 text-status-error')}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {a.msg}
                </div>
              ))}
            </div>
          </div>

          {insights.map((ins, i) => (
            <div key={ins.id} className="card p-4 group reveal" style={{ transitionDelay: `${160 + i * 60}ms` }}>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-sm bg-brand-acid/8 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-brand-acid" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-primary mb-1 leading-snug">{ins.title}</div>
                  <div className="text-[11px] text-text-muted leading-relaxed">{ins.description}</div>
                  {ins.cta_text && (
                    <button className="mt-2 text-[11px] text-brand-acid font-mono hover:underline flex items-center gap-1">
                      {ins.cta_text} <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="card p-4 reveal" style={{ transitionDelay: '200ms' }}>
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-3">Operação</div>
            <div className="space-y-3">
              {[
                { label: 'Conversão', value: `${stats?.conversionRate ?? 0}%`, icon: TrendingUp },
                { label: 'Fornecedores', value: `${stats?.suppliersConfirmed ?? 0} confirmados`, icon: Package },
                { label: 'Taxa presença', value: `${stats?.attendanceRate?.toFixed(1) ?? 0}%`, icon: Activity },
              ].map((row, i) => {
                const Icon = row.icon
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-text-muted">
                      <Icon className="w-3.5 h-3.5 text-brand-acid" />{row.label}
                    </span>
                    <span className="font-mono text-text-primary">{row.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}