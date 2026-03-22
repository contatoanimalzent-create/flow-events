import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatNumber, formatDate, formatDaysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Event as AppEvent } from '@/lib/supabase'
import {
  Ticket, DollarSign, Users, ScanLine, TrendingUp,
  AlertTriangle, CalendarDays, Zap, ArrowUpRight,
  Activity, Package, ChevronRight, ArrowRight,
  Clock, Target, Radio,
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
  checkins: Math.floor(Math.sin(i * 0.5) * 60 + 80 + Math.random() * 40),
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
    <div className="bg-bg-card border border-bg-border rounded-sm px-3 py-2 text-xs shadow-card">
      <div className="text-text-muted mb-1 font-mono">{label}</div>
      <div className="text-brand-acid font-semibold font-mono">{payload[0].value}</div>
    </div>
  )
}

export function DashboardPage() {
  const { organization, profile } = useAuthStore()
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
        .limit(3)
      setInsights(insightsData ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
        <div className="h-14 w-64 skeleton rounded-sm" />
        <div className="card h-44 skeleton" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 skeleton" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-52 skeleton" />)}
        </div>
      </div>
    )
  }

  const occupancy = mainEvent?.total_capacity
    ? Math.round((mainEvent.sold_tickets / mainEvent.total_capacity) * 100) : 0

  const greeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between reveal">
        <div>
          <div className="text-xs font-mono text-text-muted tracking-widest uppercase mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            {formatDate(time.toISOString(), "EEEE, dd 'de' MMMM 'de' yyyy")}
          </div>
          <h1 className="font-display text-5xl tracking-wide text-text-primary leading-none">
            {greeting().toUpperCase()}<span className="text-brand-acid">,</span>{' '}
            <span className="text-brand-acid">{(profile?.first_name ?? 'PRODUTOR').toUpperCase()}</span>
            <span className="text-text-muted">.</span>
          </h1>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-3xl text-text-primary tabular-nums tracking-wider">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            <span className="text-brand-acid text-xl ml-1">
              {time.toLocaleTimeString('pt-BR', { second: '2-digit' })}
            </span>
          </div>
          <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mt-0.5">
            {organization?.name ?? 'Animalz Events'}
          </div>
        </div>
      </div>

      {/* ── Event Hero ── */}
      {mainEvent ? (
        <div className="relative overflow-hidden rounded-2xl border border-bg-border reveal" style={{ animationDelay: '60ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-card to-bg-secondary" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-brand-acid/4 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-brand-blue/3 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-acid/40 to-transparent" />

          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase
                                   text-status-success border border-status-success/20 bg-status-success/8 px-2.5 py-1 rounded-sm">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> PUBLICADO
                  </span>
                  <span className="text-[10px] font-mono text-text-muted bg-bg-surface px-2.5 py-1 rounded-sm border border-bg-border">
                    {formatDaysUntil(mainEvent.starts_at)}
                  </span>
                  {mainEvent.category && (
                    <span className="text-[10px] font-mono text-brand-purple bg-brand-purple/8 px-2.5 py-1 rounded-sm border border-brand-purple/20">
                      {mainEvent.category.toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-4xl lg:text-5xl tracking-wide text-text-primary leading-none mb-2">
                  {mainEvent.name.toUpperCase()}
                </h2>
                {mainEvent.subtitle && (
                  <p className="text-sm text-text-secondary mb-3">{mainEvent.subtitle}</p>
                )}
                <div className="flex items-center gap-5 text-xs text-text-muted font-mono flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3 text-brand-acid" />
                    {formatDate(mainEvent.starts_at, "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                  {mainEvent.venue_name && (
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-brand-acid" />
                      {mainEvent.venue_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8 shrink-0">
                <div className="text-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="38" fill="none" stroke="#1a1a1a" strokeWidth="7" />
                      <circle cx="48" cy="48" r="38" fill="none" stroke="#d4ff00" strokeWidth="7"
                        strokeDasharray={`${2 * Math.PI * 38}`}
                        strokeDashoffset={`${2 * Math.PI * 38 * (1 - occupancy / 100)}`}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(212,255,0,0.45))' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-text-primary leading-none">{occupancy}%</span>
                      <span className="text-[9px] font-mono text-text-muted tracking-wider mt-0.5">OCP</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="text-3xl font-semibold text-brand-acid tabular-nums leading-none">
                      {formatNumber(mainEvent.sold_tickets)}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono tracking-wider mt-1">INGRESSOS</div>
                  </div>
                  {mainEvent.total_capacity && (
                    <div>
                      <div className="text-3xl font-semibold text-text-secondary tabular-nums leading-none">
                        {formatNumber(mainEvent.total_capacity)}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono tracking-wider mt-1">CAPACIDADE</div>
                    </div>
                  )}
                  {stats && (
                    <>
                      <div>
                        <div className="text-2xl font-semibold text-brand-teal tabular-nums leading-none">
                          {formatNumber(stats.checkinsTotal)}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono tracking-wider mt-1">CHECK-INS</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-brand-blue tabular-nums leading-none">
                          {formatCurrency(stats.grossRevenue)}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono tracking-wider mt-1">RECEITA</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>{formatNumber(mainEvent.sold_tickets)} vendidos</span>
                {mainEvent.total_capacity && (
                  <span>{formatNumber(mainEvent.total_capacity - mainEvent.sold_tickets)} disponíveis</span>
                )}
              </div>
              <div className="h-1 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${occupancy}%`,
                    background: 'linear-gradient(90deg, #d4ff00, #a8cc00)',
                    boxShadow: '0 0 8px rgba(212,255,0,0.4)',
                    transition: 'width 1s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-16 flex flex-col items-center justify-center text-center reveal" style={{ animationDelay: '60ms' }}>
          <div className="w-16 h-16 rounded-2xl bg-brand-acid/8 flex items-center justify-center mb-4 border border-brand-acid/15">
            <CalendarDays className="w-8 h-8 text-brand-acid" />
          </div>
          <div className="font-display text-3xl text-text-primary mb-2">NENHUM EVENTO ATIVO</div>
          <p className="text-sm text-text-muted mb-6 max-w-xs">
            Crie e publique seu primeiro evento para ver as métricas em tempo real aqui.
          </p>
          <button className="btn-primary flex items-center gap-2">
            + Criar primeiro evento <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Ingressos Vendidos', value: formatNumber(stats.ticketsSold), sub: `${occupancy}% da capacidade`, icon: Ticket, color: 'text-brand-acid', bg: 'bg-brand-acid/8', border: 'hover:border-brand-acid/25' },
            { label: 'Receita Bruta', value: formatCurrency(stats.grossRevenue), sub: 'pagamentos confirmados', icon: DollarSign, color: 'text-status-success', bg: 'bg-status-success/8', border: 'hover:border-status-success/25' },
            { label: 'Check-ins', value: formatNumber(stats.checkinsTotal), sub: `${stats.attendanceRate.toFixed(1)}% comparecimento`, icon: ScanLine, color: 'text-brand-teal', bg: 'bg-brand-teal/8', border: 'hover:border-brand-teal/25' },
            { label: 'Staff Ativo', value: formatNumber(stats.staffConfirmed), sub: `${stats.suppliersConfirmed} fornecedores OK`, icon: Users, color: 'text-brand-purple', bg: 'bg-brand-purple/8', border: 'hover:border-brand-purple/25' },
          ].map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div key={i} className={cn('card p-5 group transition-all duration-200 cursor-default reveal', kpi.border)}
                style={{ animationDelay: `${100 + i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110', kpi.bg)}>
                    <Icon className={cn('w-4 h-4', kpi.color)} />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted/20 group-hover:text-text-muted transition-colors" />
                </div>
                <div className="text-2xl font-semibold text-text-primary tabular-nums leading-none mb-1.5">{kpi.value}</div>
                <div className="text-[10px] text-text-muted font-mono tracking-widest uppercase mb-0.5">{kpi.label}</div>
                <div className="text-[11px] text-text-muted/60">{kpi.sub}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 reveal" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Atividade de Check-in — Hoje</div>
              <div className="text-xl font-semibold text-text-primary">
                {formatNumber(stats?.checkinsTotal ?? 0)}<span className="text-sm font-normal text-text-muted ml-2">entradas</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-status-success bg-status-success/8 px-2.5 py-1 rounded-sm border border-status-success/15">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" /> AO VIVO
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={HOURLY_MOCK} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="acidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#d4ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b6b6b', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="checkins" stroke="#d4ff00" strokeWidth={1.5}
                fill="url(#acidGrad)" dot={false} activeDot={{ r: 4, fill: '#d4ff00', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 reveal" style={{ animationDelay: '180ms' }}>
          <div className="mb-5">
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Vendas — Últimos 7 dias</div>
            <div className="text-xl font-semibold text-text-primary">507<span className="text-sm font-normal text-text-muted ml-2">ingressos</span></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={SALES_WEEK} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6b6b', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#d4ff00" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden reveal" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Pedidos Recentes</div>
            <button className="text-[11px] text-brand-acid font-mono flex items-center gap-1 hover:underline">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr>{['Comprador', 'Valor', 'Status', 'Quando'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-[13px]">{order.buyer_name}</div>
                      <div className="text-[11px] text-text-muted">{order.buyer_email}</div>
                    </td>
                    <td className="table-cell font-mono text-status-success text-sm font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="table-cell">
                      <span className={cn('badge text-[10px]',
                        order.status === 'paid' ? 'badge-success' : 'badge-warning')}>
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
            <div className="p-12 text-center">
              <Clock className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
              <div className="text-sm text-text-muted">Aguardando primeiros pedidos</div>
              <div className="text-xs text-text-muted/60 mt-1">Os pedidos aparecerão aqui em tempo real</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="card p-4 reveal" style={{ animationDelay: '220ms' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">Alertas</span>
              {stats && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-sm bg-status-warning/15 text-status-warning text-[10px] font-mono flex items-center justify-center">
                  {stats.pendingAlerts}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {[
                { msg: 'QR não enviado para 12 compradores', type: 'warning' },
                { msg: '3 fornecedores sem documentação', type: 'error' },
              ].map((a, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-2 p-2.5 rounded-sm text-xs border',
                  a.type === 'warning'
                    ? 'bg-status-warning/5 border-status-warning/15 text-status-warning'
                    : 'bg-status-error/5 border-status-error/15 text-status-error'
                )}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {a.msg}
                </div>
              ))}
            </div>
          </div>

          {insights.length > 0 ? insights.map((ins, i) => (
            <div key={ins.id} className="card p-4 group reveal" style={{ animationDelay: `${240 + i * 60}ms` }}>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-acid/8 flex items-center justify-center shrink-0 border border-brand-acid/15">
                  <Zap className="w-3.5 h-3.5 text-brand-acid" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary mb-1 leading-snug">{ins.title}</div>
                  <div className="text-[11px] text-text-muted leading-relaxed">{ins.description}</div>
                  {ins.cta_text && (
                    <button className="mt-2 text-[11px] text-brand-acid font-mono hover:underline flex items-center gap-1">
                      {ins.cta_text} <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="card p-4 reveal" style={{ animationDelay: '240ms' }}>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-acid/8 flex items-center justify-center shrink-0 border border-brand-acid/15">
                  <Zap className="w-3.5 h-3.5 text-brand-acid" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary mb-1">Growth AI</div>
                  <div className="text-[11px] text-text-muted leading-relaxed">
                    Insights aparecerão automaticamente conforme seus eventos geram dados.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-4 reveal" style={{ animationDelay: '280ms' }}>
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-3">Operação</div>
            <div className="space-y-3">
              {[
                { label: 'Conversão',      value: `${stats?.conversionRate ?? 0}%`,                 icon: TrendingUp, color: 'text-brand-acid' },
                { label: 'Fornecedores',   value: `${stats?.suppliersConfirmed ?? 0} confirmados`,   icon: Package, color: 'text-brand-teal' },
                { label: 'Tx. presença',   value: `${stats?.attendanceRate?.toFixed(1) ?? 0}%`,      icon: Activity, color: 'text-brand-purple' },
              ].map((row, i) => {
                const Icon = row.icon
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-text-muted">
                      <Icon className={cn('w-3.5 h-3.5', row.color)} />{row.label}
                    </span>
                    <span className="font-mono font-medium text-text-primary">{row.value}</span>
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
