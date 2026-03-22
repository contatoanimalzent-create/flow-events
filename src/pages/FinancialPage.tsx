import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Loader2,
  X, AlertCircle, Edit2, Trash2, ChevronDown, ChevronUp,
  BarChart3, PieChart, Download, Filter, CheckCircle2,
  Receipt, Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

/* ── Types ──────────────────────────────────────────────────── */
type CostCategory = 'staff' | 'suppliers' | 'marketing' | 'infrastructure' | 'taxes' | 'platform' | 'other'
type CostStatus = 'planned' | 'committed' | 'paid' | 'cancelled'

interface CostEntry {
  id: string
  event_id?: string
  organization_id: string
  description: string
  category: CostCategory
  amount: number
  due_date?: string
  paid_date?: string
  status: CostStatus
  notes?: string
  created_at: string
}

interface EventFinancials {
  id: string
  name: string
  starts_at: string
  totalRevenue: number
  totalCosts: number
  result: number
  ticketRevenue: number
  pdvRevenue: number
  paidOrders: number
}

interface EventItem { id: string; name: string; starts_at: string }

interface CostForm {
  description: string
  category: CostCategory
  amount: string
  due_date: string
  paid_date: string
  status: CostStatus
  notes: string
}

const EMPTY_COST: CostForm = {
  description: '', category: 'suppliers', amount: '',
  due_date: '', paid_date: '', status: 'planned', notes: '',
}

const COST_CATEGORIES: Record<CostCategory, { label: string; color: string }> = {
  staff:          { label: 'Staff & Equipe',        color: 'text-brand-blue' },
  suppliers:      { label: 'Fornecedores',           color: 'text-brand-purple' },
  marketing:      { label: 'Marketing',              color: 'text-brand-acid' },
  infrastructure: { label: 'Infraestrutura',         color: 'text-brand-teal' },
  taxes:          { label: 'Impostos & Taxas',       color: 'text-status-error' },
  platform:       { label: 'Plataforma & Tech',      color: 'text-status-warning' },
  other:          { label: 'Outros',                 color: 'text-text-muted' },
}

const COST_STATUS: Record<CostStatus, { label: string; color: string }> = {
  planned:   { label: 'Previsto',   color: 'text-text-muted' },
  committed: { label: 'Comprometido', color: 'text-status-warning' },
  paid:      { label: 'Pago',       color: 'text-status-success' },
  cancelled: { label: 'Cancelado',  color: 'text-status-error' },
}

/* ── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-bg-border rounded-sm p-3 shadow-card text-xs">
        <div className="text-text-muted mb-1 font-mono">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="text-text-primary font-semibold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/* ── Main ───────────────────────────────────────────────────── */
export function FinancialPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [costs, setCosts] = useState<CostEntry[]>([])
  const [eventFinancials, setEventFinancials] = useState<EventFinancials[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'costs' | 'dre'>('overview')
  const [showCostForm, setShowCostForm] = useState(false)
  const [editingCost, setEditingCost] = useState<CostEntry | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<'all' | CostCategory>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | CostStatus>('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  useEffect(() => {
    if (organization) { fetchData() }
  }, [organization, selectedEventId])

  async function fetchData() {
    setLoading(true)
    await Promise.all([fetchEvents(), fetchCosts()])
    setLoading(false)
  }

  async function fetchEvents() {
    const { data: eventsData } = await supabase
      .from('events').select('id,name,starts_at')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
    const evList = (eventsData ?? []) as EventItem[]
    setEvents(evList)

    // For each event, fetch financial data
    const financials: EventFinancials[] = await Promise.all(
      evList.slice(0, 10).map(async (ev) => {
        const [ordersRes, productsRes, costsRes] = await Promise.all([
          supabase.from('orders').select('total_amount,status,payment_method').eq('event_id', ev.id),
          supabase.from('products').select('price,stock_quantity').eq('event_id', ev.id),
          supabase.from('cost_entries').select('amount,status,category').eq('event_id', ev.id).eq('organization_id', organization!.id),
        ])

        const orders = (ordersRes.data ?? []) as Array<{ total_amount: number; status: string; payment_method: string }>
        const paidOrders = orders.filter(o => o.status === 'paid')
        const ticketRevenue = paidOrders.reduce((s, o) => s + o.total_amount, 0)
        const costs = (costsRes.data ?? []) as Array<{ amount: number; status: string }>
        const totalCosts = costs.filter(c => c.status !== 'cancelled').reduce((s, c) => s + c.amount, 0)

        return {
          id: ev.id,
          name: ev.name,
          starts_at: ev.starts_at,
          totalRevenue: ticketRevenue,
          totalCosts,
          result: ticketRevenue - totalCosts,
          ticketRevenue,
          pdvRevenue: 0,
          paidOrders: paidOrders.length,
        }
      })
    )
    setEventFinancials(financials)
  }

  async function fetchCosts() {
    let q = supabase.from('cost_entries').select('*').eq('organization_id', organization!.id)
    if (selectedEventId !== 'all') q = q.eq('event_id', selectedEventId)
    q = q.order('due_date', { ascending: true })
    const { data } = await q
    setCosts((data ?? []) as CostEntry[])
  }

  async function handleDeleteCost(id: string) {
    if (!confirm('Remover este lançamento?')) return
    await supabase.from('cost_entries').delete().eq('id', id)
    fetchCosts()
  }

  const filteredCosts = costs.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  const totalRevenue = eventFinancials.reduce((s, e) => s + e.totalRevenue, 0)
  const totalCosts = costs.filter(c => c.status !== 'cancelled').reduce((s, c) => s + c.amount, 0)
  const totalCostsPaid = costs.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const totalCostsPending = costs.filter(c => ['planned', 'committed'].includes(c.status)).reduce((s, c) => s + c.amount, 0)
  const netResult = totalRevenue - totalCosts

  // DRE data
  const revenueBySource = [
    { name: 'Ingressos', value: totalRevenue, color: '#d4ff00' },
    { name: 'PDV', value: 0, color: '#5BE7C4' },
  ]

  const costByCategory = Object.entries(COST_CATEGORIES).map(([k, v]) => ({
    name: v.label,
    value: costs.filter(c => c.category === k && c.status !== 'cancelled').reduce((s, c) => s + c.amount, 0),
    color: v.color.replace('text-', ''),
  })).filter(c => c.value > 0)

  // Monthly trend (last 6 months mock based on real event dates)
  const monthlyData = eventFinancials.slice(0, 6).reverse().map(e => ({
    name: formatDate(e.starts_at, 'MMM/yy'),
    Receita: e.totalRevenue,
    Custos: e.totalCosts,
    Resultado: e.result,
  }))

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            FINANCEIRO<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Receitas, custos e fechamento por evento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Exportar DRE
          </button>
          {tab === 'costs' && (
            <button onClick={() => { setEditingCost(null); setShowCostForm(true) }}
              className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo lançamento
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-bg-border reveal" style={{ animationDelay: '20ms' }}>
        {([
          { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { key: 'costs', label: 'Lançamentos', icon: Receipt },
          { key: 'dre', label: 'DRE por Evento', icon: PieChart },
        ] as const).map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px',
                tab === t.key
                  ? 'text-brand-acid border-brand-acid'
                  : 'text-text-muted border-transparent hover:text-text-primary'
              )}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal">
                {[
                  {
                    label: 'Receita Total', value: formatCurrency(totalRevenue),
                    icon: TrendingUp, color: 'text-status-success', trend: '+',
                    sub: `${eventFinancials.length} evento${eventFinancials.length !== 1 ? 's' : ''}`
                  },
                  {
                    label: 'Custos Totais', value: formatCurrency(totalCosts),
                    icon: TrendingDown, color: 'text-status-error', trend: '-',
                    sub: `${formatCurrency(totalCostsPaid)} pagos`
                  },
                  {
                    label: 'Resultado Líquido', value: formatCurrency(netResult),
                    icon: DollarSign,
                    color: netResult >= 0 ? 'text-brand-acid' : 'text-status-error',
                    trend: netResult >= 0 ? '+' : '-',
                    sub: totalRevenue > 0 ? `Margem: ${Math.round((netResult / totalRevenue) * 100)}%` : '—'
                  },
                  {
                    label: 'A Pagar', value: formatCurrency(totalCostsPending),
                    icon: Wallet, color: 'text-status-warning', trend: '!',
                    sub: `${costs.filter(c => ['planned', 'committed'].includes(c.status)).length} lançamentos`
                  },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                        <Icon className={cn('w-4 h-4', s.color)} />
                      </div>
                      <div className={cn('text-2xl font-bold font-mono', s.color)}>{s.value}</div>
                      <div className="text-[11px] text-text-muted mt-1">{s.sub}</div>
                    </div>
                  )
                })}
              </div>

              {/* Chart */}
              {monthlyData.length > 0 && (
                <div className="card p-5 reveal" style={{ animationDelay: '60ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-text-primary">Resultado por Evento</h3>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-acid" /> Receita</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-error" /> Custos</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue" /> Resultado</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b6b6b" tick={{ fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#6b6b6b" tick={{ fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
                        tickFormatter={v => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Receita" fill="#d4ff00" opacity={0.9} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Custos" fill="#FF5A6B" opacity={0.7} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Resultado" fill="#4BA3FF" opacity={0.8} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Revenue by source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5 reveal" style={{ animationDelay: '80ms' }}>
                  <h3 className="text-sm font-medium text-text-primary mb-4">Receita por Fonte</h3>
                  <div className="space-y-3">
                    {revenueBySource.map((r, i) => {
                      const pct = totalRevenue > 0 ? Math.round((r.value / totalRevenue) * 100) : 0
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-secondary">{r.name}</span>
                            <span className="font-mono font-semibold text-text-primary">{formatCurrency(r.value)}</span>
                          </div>
                          <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: r.color }} />
                          </div>
                          <div className="text-[10px] text-text-muted mt-0.5 font-mono">{pct}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="card p-5 reveal" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-sm font-medium text-text-primary mb-4">Custos por Categoria</h3>
                  {costByCategory.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-8">Nenhum custo lançado ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {costByCategory.sort((a, b) => b.value - a.value).map((c, i) => {
                        const pct = totalCosts > 0 ? Math.round((c.value / totalCosts) * 100) : 0
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-text-secondary">{c.name}</span>
                              <span className="font-mono font-semibold text-text-primary">{formatCurrency(c.value)}</span>
                            </div>
                            <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                              <div className="h-full bg-status-error rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5 font-mono">{pct}%</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── COSTS TAB ─────────────────────────────────────────── */}
          {tab === 'costs' && (
            <div className="space-y-4">
              {/* Event filter */}
              <div className="flex items-center gap-3 flex-wrap reveal">
                <span className="text-xs text-text-muted font-mono">EVENTO:</span>
                <button onClick={() => setSelectedEventId('all')}
                  className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                    selectedEventId === 'all' ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
                  Todos
                </button>
                {events.map(e => (
                  <button key={e.id} onClick={() => setSelectedEventId(e.id)}
                    className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                      selectedEventId === e.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
                    {e.name}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-text-muted uppercase mr-1">Categoria:</span>
                  <button onClick={() => setCategoryFilter('all')}
                    className={cn('px-2.5 py-1 rounded-sm text-xs transition-all',
                      categoryFilter === 'all' ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                    Todos
                  </button>
                  {Object.entries(COST_CATEGORIES).map(([k, v]) => (
                    <button key={k} onClick={() => setCategoryFilter(k as CostCategory)}
                      className={cn('px-2.5 py-1 rounded-sm text-xs transition-all',
                        categoryFilter === k ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCosts.length === 0 ? (
                <div className="card p-16 flex flex-col items-center text-center">
                  <Receipt className="w-10 h-10 text-text-muted mb-3" />
                  <div className="font-display text-2xl text-text-primary mb-1">NENHUM LANÇAMENTO</div>
                  <p className="text-sm text-text-muted mb-5">Lance custos para controlar o financeiro do evento</p>
                  <button onClick={() => setShowCostForm(true)} className="btn-primary">+ Novo lançamento</button>
                </div>
              ) : (
                <div className="card overflow-hidden reveal">
                  <table className="w-full">
                    <thead className="border-b border-bg-border">
                      <tr>{['Descrição', 'Categoria', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => (
                        <th key={h} className="table-header">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {filteredCosts.map(c => {
                        const catCfg = COST_CATEGORIES[c.category]
                        const statusCfg = COST_STATUS[c.status]
                        const isOverdue = c.due_date && new Date(c.due_date) < new Date() && c.status !== 'paid'
                        return (
                          <tr key={c.id} className="table-row">
                            <td className="table-cell">
                              <div className="font-medium text-[13px] text-text-primary">{c.description}</div>
                              {c.notes && <div className="text-[11px] text-text-muted truncate max-w-[200px]">{c.notes}</div>}
                            </td>
                            <td className="table-cell">
                              <span className={cn('text-xs', catCfg.color)}>{catCfg.label}</span>
                            </td>
                            <td className="table-cell">
                              <span className="font-mono font-bold text-status-error text-sm">
                                {formatCurrency(c.amount)}
                              </span>
                            </td>
                            <td className="table-cell">
                              {c.due_date ? (
                                <span className={cn('text-xs font-mono', isOverdue ? 'text-status-error font-bold' : 'text-text-secondary')}>
                                  {isOverdue && '⚠ '}{formatDate(c.due_date, 'dd/MM/yyyy')}
                                </span>
                              ) : <span className="text-xs text-text-muted">—</span>}
                            </td>
                            <td className="table-cell">
                              <select value={c.status}
                                onChange={async e => {
                                  await supabase.from('cost_entries').update({ status: e.target.value, paid_date: e.target.value === 'paid' ? new Date().toISOString() : null }).eq('id', c.id)
                                  fetchCosts()
                                }}
                                className={cn('text-xs font-medium px-2 py-1 rounded-sm bg-transparent border border-bg-border outline-none cursor-pointer', statusCfg.color)}>
                                {Object.entries(COST_STATUS).map(([k, v]) => (
                                  <option key={k} value={k} className="bg-bg-card text-text-primary">{v.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center gap-1">
                                <button onClick={() => { setEditingCost(c); setShowCostForm(true) }}
                                  className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteCost(c.id)}
                                  className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="border-t border-bg-border">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-xs font-mono text-text-muted uppercase tracking-wider">Total</td>
                        <td className="px-4 py-3 font-mono font-bold text-status-error">
                          {formatCurrency(filteredCosts.filter(c => c.status !== 'cancelled').reduce((s, c) => s + c.amount, 0))}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── DRE TAB ───────────────────────────────────────────── */}
          {tab === 'dre' && (
            <div className="space-y-4">
              {eventFinancials.length === 0 ? (
                <div className="card p-16 text-center">
                  <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <div className="font-display text-2xl text-text-primary mb-1">NENHUM EVENTO</div>
                  <p className="text-sm text-text-muted">Crie eventos para ver o DRE</p>
                </div>
              ) : (
                eventFinancials.map((ev, i) => {
                  const isExpanded = expandedEvent === ev.id
                  const isProfit = ev.result >= 0
                  const margin = ev.totalRevenue > 0 ? Math.round((ev.result / ev.totalRevenue) * 100) : 0
                  return (
                    <div key={ev.id} className="card overflow-hidden reveal" style={{ animationDelay: `${i * 40}ms` }}>
                      {/* Event header */}
                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-bg-surface/50 transition-colors text-left">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-display text-lg tracking-wide text-text-primary leading-none">{ev.name}</div>
                            <div className="text-[11px] text-text-muted font-mono mt-0.5">{formatDate(ev.starts_at, 'dd/MM/yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <div className="text-[10px] font-mono text-text-muted uppercase">Receita</div>
                            <div className="font-mono font-bold text-status-success text-sm">{formatCurrency(ev.totalRevenue)}</div>
                          </div>
                          <div className="text-right hidden md:block">
                            <div className="text-[10px] font-mono text-text-muted uppercase">Custos</div>
                            <div className="font-mono font-bold text-status-error text-sm">{formatCurrency(ev.totalCosts)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-text-muted uppercase">Resultado</div>
                            <div className={cn('font-mono font-bold text-sm flex items-center gap-1', isProfit ? 'text-brand-acid' : 'text-status-error')}>
                              {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {formatCurrency(Math.abs(ev.result))}
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </div>
                      </button>

                      {/* DRE expanded */}
                      {isExpanded && (
                        <div className="border-t border-bg-border p-5">
                          <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-4">
                            DRE SIMPLIFICADO — {ev.name}
                          </div>
                          <div className="space-y-1 text-sm max-w-md">
                            {/* Revenue */}
                            <div className="flex justify-between py-1 border-b border-bg-border">
                              <span className="text-text-muted font-mono text-[11px] uppercase">RECEITA BRUTA</span>
                              <span className="font-mono font-bold text-status-success">{formatCurrency(ev.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between py-1 pl-4 text-[12px]">
                              <span className="text-text-secondary">Venda de ingressos</span>
                              <span className="font-mono text-text-primary">{formatCurrency(ev.ticketRevenue)}</span>
                            </div>
                            <div className="flex justify-between py-1 pl-4 text-[12px]">
                              <span className="text-text-secondary">PDV / Bar / Merch</span>
                              <span className="font-mono text-text-primary">{formatCurrency(ev.pdvRevenue)}</span>
                            </div>

                            {/* Costs */}
                            <div className="flex justify-between py-1 border-b border-bg-border mt-2">
                              <span className="text-text-muted font-mono text-[11px] uppercase">CUSTOS TOTAIS</span>
                              <span className="font-mono font-bold text-status-error">({formatCurrency(ev.totalCosts)})</span>
                            </div>

                            {/* Result */}
                            <div className="flex justify-between py-2 border-t-2 border-bg-border mt-2">
                              <span className="font-bold text-text-primary">RESULTADO LÍQUIDO</span>
                              <span className={cn('font-mono font-bold text-lg', isProfit ? 'text-brand-acid' : 'text-status-error')}>
                                {formatCurrency(ev.result)}
                              </span>
                            </div>

                            {ev.totalRevenue > 0 && (
                              <div className="flex justify-between py-1">
                                <span className="text-text-muted text-[12px]">Margem líquida</span>
                                <span className={cn('font-mono text-[12px] font-semibold', isProfit ? 'text-brand-acid' : 'text-status-error')}>
                                  {margin}%
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between py-1">
                              <span className="text-text-muted text-[12px]">Pedidos pagos</span>
                              <span className="font-mono text-[12px] text-text-primary">{ev.paidOrders}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Cost Form Modal */}
      {showCostForm && (
        <CostFormModal
          organizationId={organization!.id}
          events={events}
          cost={editingCost}
          defaultEventId={selectedEventId !== 'all' ? selectedEventId : ''}
          onClose={() => { setShowCostForm(false); setEditingCost(null) }}
          onSaved={() => { fetchCosts(); setShowCostForm(false); setEditingCost(null) }}
        />
      )}
    </div>
  )
}

/* ── Cost Form Modal ────────────────────────────────────────── */
function CostFormModal({ organizationId, events, cost, defaultEventId, onClose, onSaved }: {
  organizationId: string
  events: EventItem[]
  cost: CostEntry | null
  defaultEventId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CostForm>(
    cost ? {
      description: cost.description,
      category: cost.category,
      amount: cost.amount.toString(),
      due_date: cost.due_date ? cost.due_date.slice(0, 10) : '',
      paid_date: cost.paid_date ? cost.paid_date.slice(0, 10) : '',
      status: cost.status,
      notes: cost.notes ?? '',
    } : { ...EMPTY_COST }
  )
  const [eventId, setEventId] = useState(cost?.event_id ?? defaultEventId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof CostForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.description.trim()) { setError('Descrição é obrigatória'); return }
    if (!form.amount || isNaN(parseFloat(form.amount))) { setError('Valor inválido'); return }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      event_id: eventId || null,
      description: form.description.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      due_date: form.due_date || null,
      paid_date: form.status === 'paid' ? (form.paid_date || new Date().toISOString()) : null,
      status: form.status,
      notes: form.notes || null,
    }

    const { error: err } = cost
      ? await supabase.from('cost_entries').update(payload).eq('id', cost.id)
      : await supabase.from('cost_entries').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl leading-none">
            {cost ? 'EDITAR LANÇAMENTO' : 'NOVO LANÇAMENTO'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="input-label">Descrição *</label>
            <input className="input" placeholder="ex: Contrato AudioPro, Cachê DJ, Marketing Meta Ads..."
              value={form.description} onChange={e => set('description', e.target.value)} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Categoria</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value as CostCategory)}>
                {Object.entries(COST_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value as CostStatus)}>
                {Object.entries(COST_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor (R$) *</label>
              <input type="number" className="input" placeholder="0,00" min={0} step={0.01}
                value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Vencimento</label>
              <input type="date" className="input"
                value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>

          {events.length > 0 && (
            <div>
              <label className="input-label">Evento vinculado</label>
              <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Custo geral (sem evento)</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Observações</label>
            <textarea className="input resize-none" rows={2}
              placeholder="Detalhes do pagamento, número NF, etc..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm min-w-[140px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (cost ? '✓ Salvar' : '✓ Lançar')}
          </button>
        </div>
      </div>
    </div>
  )
}
