import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatNumber, formatDate, cn } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Zap, Target, Star, ArrowUpRight,
  BarChart3, Brain, Lightbulb, ChevronRight, Loader2,
  Flame, Users, Ticket, DollarSign, Activity, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Sparkles,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

/* ── Types ──────────────────────────────────────────────────── */
interface EventMetrics {
  id: string
  name: string
  starts_at: string
  totalTickets: number
  soldTickets: number
  totalRevenue: number
  checkinCount: number
  conversionRate: number
  attendanceRate: number
  staffCount: number
  supplierCount: number
}

interface Insight {
  id: string
  type: 'critical' | 'warning' | 'opportunity' | 'success'
  category: string
  title: string
  description: string
  action?: string
  impact?: string
  metric?: string
  dismissed?: boolean
}

/* ── Tooltip ────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-bg-border rounded-sm p-3 shadow-card text-xs">
        <div className="text-text-muted mb-1 font-mono">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="text-text-primary font-semibold">{entry.value}%</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/* ── Generate AI-style Insights ─────────────────────────────── */
function generateInsights(metrics: EventMetrics[]): Insight[] {
  const insights: Insight[] = []

  if (metrics.length === 0) return []

  const latestEvent = metrics[0]

  // Conversion rate analysis
  if (latestEvent.conversionRate < 30) {
    insights.push({
      id: 'low-conversion',
      type: 'critical',
      category: 'Vendas',
      title: 'Taxa de conversão abaixo do ideal',
      description: `Apenas ${latestEvent.conversionRate}% da capacidade foi vendida para "${latestEvent.name}". A média saudável é acima de 60%.`,
      action: 'Ative um lote com desconto "early bird" e invista em tráfego pago no Meta Ads.',
      impact: 'Aumentar conversão de 30% para 60% pode dobrar a receita',
      metric: `${latestEvent.conversionRate}% vendido`,
    })
  } else if (latestEvent.conversionRate > 85) {
    insights.push({
      id: 'high-conversion',
      type: 'success',
      category: 'Vendas',
      title: 'Evento com alta ocupação!',
      description: `"${latestEvent.name}" está com ${latestEvent.conversionRate}% de ocupação. Considere abrir um novo lote VIP com preço premium.`,
      action: 'Crie um ingresso VIP ou Camarote com experiência exclusiva enquanto há demanda.',
      impact: 'Potencial de receita adicional com ingressos premium',
      metric: `${latestEvent.conversionRate}% ocupado`,
    })
  }

  // Attendance rate
  if (latestEvent.soldTickets > 0 && latestEvent.checkinCount / latestEvent.soldTickets < 0.6) {
    insights.push({
      id: 'low-attendance',
      type: 'warning',
      category: 'Check-in',
      title: 'Taxa de comparecimento baixa',
      description: `Somente ${Math.round((latestEvent.checkinCount / latestEvent.soldTickets) * 100)}% dos compradores estão fazendo check-in. Isso indica barreiras na entrada.`,
      action: 'Verifique se há filas nas portarias. Considere adicionar operadores de check-in ou portarias adicionais.',
      impact: 'Experiência ruim = avaliações negativas e queda nas vendas futuras',
      metric: `${latestEvent.checkinCount}/${latestEvent.soldTickets} presentes`,
    })
  }

  // Staff coverage
  if (latestEvent.totalTickets > 0 && latestEvent.staffCount / latestEvent.totalTickets < 0.01) {
    insights.push({
      id: 'staff-coverage',
      type: 'warning',
      category: 'Operações',
      title: 'Relação staff/público pode ser insuficiente',
      description: `${latestEvent.staffCount} membros de staff para ${latestEvent.totalTickets} ingressos. Recomendamos 1 staff por 50 participantes para eventos bem operados.`,
      action: 'Revise o plano de staff. Adicione operadores de check-in, segurança e suporte ao evento.',
      impact: 'Staff insuficiente causa filas, incidentes e experiência ruim',
      metric: `${latestEvent.staffCount} staff · ${latestEvent.totalTickets} ingressos`,
    })
  }

  // Revenue opportunity
  if (latestEvent.totalRevenue > 0 && latestEvent.supplierCount === 0) {
    insights.push({
      id: 'no-suppliers',
      type: 'opportunity',
      category: 'Fornecedores',
      title: 'Nenhum fornecedor cadastrado',
      description: 'Cadastrar fornecedores permite controlar custos, gerar contratos automaticamente e ter visão real do resultado financeiro do evento.',
      action: 'Acesse "Fornecedores" e cadastre os principais parceiros: áudio, segurança, catering.',
      impact: 'Visibilidade financeira completa para decidir com dados',
      metric: '0 fornecedores',
    })
  }

  // Multi-event growth
  if (metrics.length >= 2) {
    const prev = metrics[1]
    const growth = prev.totalRevenue > 0
      ? Math.round(((latestEvent.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100)
      : 0
    if (growth > 20) {
      insights.push({
        id: 'revenue-growth',
        type: 'success',
        category: 'Financeiro',
        title: `Crescimento de ${growth}% na receita!`,
        description: `Seu último evento gerou ${growth}% mais receita que o anterior. A trajetória é positiva.`,
        action: 'Mantenha a estratégia atual e considere aumentar a capacidade no próximo evento.',
        impact: `+${formatCurrency(latestEvent.totalRevenue - prev.totalRevenue)} comparado ao anterior`,
        metric: `+${growth}% crescimento`,
      })
    } else if (growth < -10) {
      insights.push({
        id: 'revenue-decline',
        type: 'critical',
        category: 'Financeiro',
        title: `Queda de ${Math.abs(growth)}% na receita`,
        description: `A receita do último evento caiu ${Math.abs(growth)}% em relação ao anterior. É preciso agir.`,
        action: 'Revise data, marketing e comunicação. Considere parcerias com outros produtores da cidade.',
        impact: `${formatCurrency(prev.totalRevenue - latestEvent.totalRevenue)} a menos que o anterior`,
        metric: `${growth}% queda`,
      })
    }
  }

  // Default positive insight if all metrics are good
  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      type: 'success',
      category: 'Geral',
      title: 'Tudo caminhando bem!',
      description: 'Suas métricas estão dentro dos parâmetros esperados. Continue monitorando e use as ferramentas de comunicação para manter o engajamento.',
      action: 'Explore o módulo de Comunicação para criar campanhas de engajamento pós-evento.',
      metric: 'Saúde: boa',
    })
  }

  return insights
}

/* ── Main ───────────────────────────────────────────────────── */
export function GrowthPage() {
  const { organization } = useAuthStore()
  const [metrics, setMetrics] = useState<EventMetrics[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (organization) fetchData()
  }, [organization])

  async function fetchData(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    const { data: events } = await supabase
      .from('events')
      .select('id,name,starts_at,total_capacity,sold_tickets,checked_in_count')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
      .limit(10)

    const evList = events ?? []

    const metricsData: EventMetrics[] = await Promise.all(
      evList.map(async (ev) => {
        const [ordersRes, staffRes, suppliersRes] = await Promise.all([
          supabase.from('orders').select('total_amount,status').eq('event_id', ev.id).eq('status', 'paid'),
          supabase.from('staff_members').select('id', { count: 'exact', head: true }).eq('event_id', ev.id),
          supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('event_id', ev.id),
        ])

        const orders = (ordersRes.data ?? []) as Array<{ total_amount: number; status: string }>
        const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0)
        const soldTickets = ev.sold_tickets ?? 0
        const totalTickets = ev.total_capacity ?? 0
        const checkinCount = ev.checked_in_count ?? 0

        return {
          id: ev.id,
          name: ev.name,
          starts_at: ev.starts_at,
          totalTickets,
          soldTickets,
          totalRevenue,
          checkinCount,
          conversionRate: totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0,
          attendanceRate: soldTickets > 0 ? Math.round((checkinCount / soldTickets) * 100) : 0,
          staffCount: staffRes.count ?? 0,
          supplierCount: suppliersRes.count ?? 0,
        }
      })
    )

    setMetrics(metricsData)
    setInsights(generateInsights(metricsData))
    setLoading(false)
    setRefreshing(false)
  }

  const dismissInsight = (id: string) => setDismissedInsights(prev => [...prev, id])
  const visibleInsights = insights.filter(i => !dismissedInsights.includes(i.id))

  const INSIGHT_CONFIG = {
    critical:    { color: 'text-status-error',   bg: 'bg-status-error/8',   border: 'border-status-error/20',   icon: AlertTriangle },
    warning:     { color: 'text-status-warning',  bg: 'bg-status-warning/8', border: 'border-status-warning/20', icon: AlertTriangle },
    opportunity: { color: 'text-brand-blue',      bg: 'bg-brand-blue/8',     border: 'border-brand-blue/20',     icon: Lightbulb },
    success:     { color: 'text-status-success',  bg: 'bg-status-success/8', border: 'border-status-success/20', icon: CheckCircle2 },
  }

  // Chart data: conversion & attendance trends
  const chartData = metrics.slice(0, 6).reverse().map(m => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '…' : m.name,
    Conversão: m.conversionRate,
    Comparecimento: m.attendanceRate,
  }))

  // Aggregate stats
  const totalRevenue = metrics.reduce((s, m) => s + m.totalRevenue, 0)
  const totalTicketsSold = metrics.reduce((s, m) => s + m.soldTickets, 0)
  const avgConversion = metrics.length > 0
    ? Math.round(metrics.reduce((s, m) => s + m.conversionRate, 0) / metrics.length) : 0
  const avgAttendance = metrics.filter(m => m.soldTickets > 0).length > 0
    ? Math.round(metrics.filter(m => m.soldTickets > 0).reduce((s, m) => s + m.attendanceRate, 0) / metrics.filter(m => m.soldTickets > 0).length) : 0

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            GROWTH<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Análises, insights e diagnósticos com IA
          </p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          Atualizar dados
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal">
            {[
              { label: 'Receita acumulada', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-brand-acid', sub: `${metrics.length} eventos` },
              { label: 'Ingressos vendidos', value: formatNumber(totalTicketsSold), icon: Ticket, color: 'text-brand-blue', sub: 'no total' },
              { label: 'Conversão média', value: `${avgConversion}%`, icon: Target, color: avgConversion >= 60 ? 'text-status-success' : 'text-status-warning', sub: 'capacidade vendida' },
              { label: 'Comparecimento', value: `${avgAttendance}%`, icon: Users, color: avgAttendance >= 70 ? 'text-status-success' : 'text-brand-blue', sub: 'dos compradores' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                    <Icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold font-mono', s.color)}>{s.value}</div>
                  <div className="text-[10px] text-text-muted mt-1">{s.sub}</div>
                </div>
              )
            })}
          </div>

          {/* Insights IA */}
          {visibleInsights.length > 0 && (
            <div className="space-y-3 reveal" style={{ transitionDelay: '50ms' }}>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-acid" />
                <h2 className="text-sm font-medium text-text-primary">Insights com IA</h2>
                <span className="text-[10px] font-mono bg-brand-acid/15 text-brand-acid px-2 py-0.5 rounded-sm">
                  {visibleInsights.length} análise{visibleInsights.length !== 1 ? 's' : ''}
                </span>
              </div>
              {visibleInsights.map((insight, i) => {
                const cfg = INSIGHT_CONFIG[insight.type]
                const InsightIcon = cfg.icon
                return (
                  <div key={insight.id}
                    className={cn('card p-4 border reveal', cfg.border, cfg.bg)}
                    style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="flex items-start gap-3">
                      <InsightIcon className={cn('w-4 h-4 shrink-0 mt-0.5', cfg.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-text-muted uppercase">{insight.category}</span>
                          {insight.metric && (
                            <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-sm border', cfg.border, cfg.color)}>
                              {insight.metric}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-[13px] text-text-primary mt-1">{insight.title}</div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{insight.description}</p>
                        {insight.action && (
                          <div className={cn('mt-2 flex items-start gap-2 text-xs font-medium', cfg.color)}>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{insight.action}</span>
                          </div>
                        )}
                        {insight.impact && (
                          <div className="mt-2 text-[11px] text-text-muted italic">{insight.impact}</div>
                        )}
                      </div>
                      <button onClick={() => dismissInsight(insight.id)}
                        className="text-[10px] font-mono text-text-muted hover:text-text-primary shrink-0 transition-colors">
                        OK
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal" style={{ transitionDelay: '80ms' }}>
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-text-primary">Conversão & Comparecimento por Evento</h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-acid" /> Conversão</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue" /> Comparecimento</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#d4ff00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4BA3FF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4BA3FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b6b6b" tick={{ fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b6b6b" tick={{ fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${v}%`} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Conversão" stroke="#d4ff00" strokeWidth={2} fill="url(#colorConv)" dot={{ fill: '#d4ff00', r: 3 }} />
                    <Area type="monotone" dataKey="Comparecimento" stroke="#4BA3FF" strokeWidth={2} fill="url(#colorAtt)" dot={{ fill: '#4BA3FF', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Event breakdown */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Desempenho por Evento</h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {metrics.map((m, i) => {
                    const isGood = m.conversionRate >= 60
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', isGood ? 'bg-status-success' : 'bg-status-warning')} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-text-primary truncate">{m.name}</div>
                          <div className="text-[10px] text-text-muted font-mono">
                            {formatDate(m.starts_at, 'dd/MM/yy')} · {formatCurrency(m.totalRevenue)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={cn('text-xs font-mono font-bold', isGood ? 'text-status-success' : 'text-status-warning')}>
                            {m.conversionRate}%
                          </div>
                          <div className="text-[10px] text-text-muted">{formatNumber(m.soldTickets)} ing.</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Benchmark cards */}
          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-acid" />
              Benchmarks do mercado de eventos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  metric: 'Taxa de conversão',
                  yours: `${avgConversion}%`,
                  benchmark: '60–80%',
                  status: avgConversion >= 60 ? 'good' : avgConversion >= 40 ? 'warn' : 'bad',
                  tip: 'Eventos com early bird têm até 40% mais conversão',
                },
                {
                  metric: 'Taxa de comparecimento',
                  yours: `${avgAttendance}%`,
                  benchmark: '70–90%',
                  status: avgAttendance >= 70 ? 'good' : avgAttendance >= 50 ? 'warn' : 'bad',
                  tip: 'Lembretes 24h antes aumentam em até 20% o comparecimento',
                },
                {
                  metric: 'Eventos ativos',
                  yours: metrics.length.toString(),
                  benchmark: '3–6/ano',
                  status: metrics.length >= 3 ? 'good' : 'warn',
                  tip: 'Calendário anual fixo fideliza o público e aumenta LTV',
                },
              ].map((b, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-muted">{b.metric}</span>
                    <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-sm',
                      b.status === 'good' ? 'bg-status-success/15 text-status-success' :
                      b.status === 'warn' ? 'bg-status-warning/15 text-status-warning' :
                      'bg-status-error/15 text-status-error')}>
                      {b.status === 'good' ? '✓ OK' : b.status === 'warn' ? '⚠ Atenção' : '✗ Baixo'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-xl font-bold font-mono text-text-primary">{b.yours}</div>
                      <div className="text-[10px] text-text-muted">seus dados</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-brand-acid">{b.benchmark}</div>
                      <div className="text-[10px] text-text-muted">mercado</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-muted italic border-t border-bg-border pt-2 mt-2">
                    💡 {b.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive advantages */}
          <div className="card p-5 border-brand-acid/15 reveal" style={{ transitionDelay: '120ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-brand-acid" />
              <h3 className="text-sm font-medium text-text-primary">Diferenciais que você já tem</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Staff + Ponto Digital', desc: 'Nenhum concorrente integra gestão de staff com venda de ingressos', icon: Users },
                { title: 'PDV integrado', desc: 'Bar, merch e food no mesmo sistema do ingresso', icon: Activity },
                { title: 'Ticket Social', desc: 'Arte para Stories gerada automaticamente = marketing orgânico grátis', icon: Flame },
                { title: 'Fornecedores com acesso', desc: 'Fornecedor vê só o que é dele — contratos, documentos, escala', icon: Target },
                { title: 'DRE por evento', desc: 'Resultado financeiro real por evento, com custos e receitas', icon: BarChart3 },
                { title: 'PIX nativo', desc: 'Aprovação instantânea, sem taxa adicional — exclusivo para o Brasil', icon: Zap },
              ].map((d, i) => {
                const DIcon = d.icon
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface rounded-sm border border-bg-border">
                    <DIcon className="w-4 h-4 text-brand-acid shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[12px] font-semibold text-text-primary">{d.title}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{d.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
