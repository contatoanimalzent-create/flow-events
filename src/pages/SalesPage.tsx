import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  Search, Filter, Download, Eye, RefreshCw,
  TrendingUp, DollarSign, Ticket, Clock,
  ChevronDown, X, Loader2, AlertCircle,
  CreditCard, Smartphone, FileText, CheckCircle2,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired' | 'failed'
type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'free'

interface Order {
  id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  buyer_cpf: string
  subtotal: number
  discount_amount: number
  total_amount: number
  status: OrderStatus
  payment_method: PaymentMethod
  paid_at?: string
  expires_at?: string
  created_at: string
  event_id: string
  notes?: string
  pagarme_order_id?: string
}

interface OrderItem {
  id: string
  order_id: string
  holder_name: string
  holder_email: string
  unit_price: number
  quantity: number
  total_price: number
  ticket_type?: { name: string }
  batch?: { name: string }
}

interface Event {
  id: string
  name: string
}

/* ── Config ─────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  pending:   { label: 'Pendente',   badge: 'badge-warning', dot: 'bg-status-warning' },
  paid:      { label: 'Pago',       badge: 'badge-success', dot: 'bg-status-success' },
  cancelled: { label: 'Cancelado',  badge: 'badge-error',   dot: 'bg-status-error' },
  refunded:  { label: 'Reembolsado',badge: 'badge-purple',  dot: 'bg-brand-purple' },
  expired:   { label: 'Expirado',   badge: 'badge-muted',   dot: 'bg-text-muted' },
  failed:    { label: 'Falhou',     badge: 'badge-error',   dot: 'bg-status-error' },
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  credit_card: { label: 'Cartão de Crédito', icon: CreditCard },
  debit_card:  { label: 'Cartão de Débito',  icon: CreditCard },
  pix:         { label: 'PIX',               icon: Smartphone },
  boleto:      { label: 'Boleto',            icon: FileText },
  free:        { label: 'Gratuito',          icon: CheckCircle2 },
}

/* ── Main ───────────────────────────────────────────────────── */
export function SalesPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => { if (organization) fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) { setPage(0); fetchOrders() } }, [selectedEventId, statusFilter, methodFilter])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events').select('id,name')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
    setEvents(data ?? [])
    if (data?.[0]) setSelectedEventId(data[0].id)
    else setLoading(false)
  }

  async function fetchOrders() {
    setLoading(true)
    let q = supabase
      .from('orders').select('*', { count: 'exact' })
      .eq('event_id', selectedEventId)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (methodFilter !== 'all') q = q.eq('payment_method', methodFilter)

    const { data } = await q
    setOrders(data ?? [])
    setLoading(false)
  }

  async function fetchOrderItems(orderId: string) {
    setLoadingItems(true)
    const { data } = await supabase
      .from('order_items')
      .select('*, ticket_type:ticket_types(name), batch:ticket_batches(name)')
      .eq('order_id', orderId)
    setOrderItems(data ?? [])
    setLoadingItems(false)
  }

  function openOrder(order: Order) {
    setSelectedOrder(order)
    fetchOrderItems(order.id)
  }

  const filtered = orders.filter(o => {
    const s = search.toLowerCase()
    return !s || o.buyer_name?.toLowerCase().includes(s) ||
      o.buyer_email?.toLowerCase().includes(s) ||
      o.buyer_cpf?.includes(s) ||
      o.id.includes(s)
  })

  // Stats from filtered orders
  const paidOrders   = orders.filter(o => o.status === 'paid')
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const todayOrders  = orders.filter(o => {
    const d = new Date(o.created_at)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth()
  }).length

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            VENDAS<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Pedidos e pagamentos em tempo real
          </p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Event selector */}
      {events.length > 1 && (
        <div className="flex items-center gap-3 reveal">
          <span className="text-xs text-text-muted font-mono">EVENTO:</span>
          <div className="flex gap-2 flex-wrap">
            {events.map(e => (
              <button key={e.id} onClick={() => setSelectedEventId(e.id)}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  selectedEventId === e.id
                    ? 'bg-brand-acid text-bg-primary'
                    : 'border border-bg-border text-text-muted hover:text-text-primary')}>
                {e.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal">
        {[
          { label: 'Receita confirmada', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-status-success' },
          { label: 'Pedidos pagos',      value: paidOrders.length,            icon: Ticket,    color: 'text-brand-acid' },
          { label: 'Aguardando pag.',    value: pendingCount,                 icon: Clock,     color: 'text-status-warning' },
          { label: 'Pedidos hoje',       value: todayOrders,                  icon: TrendingUp,color: 'text-brand-blue' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                <Icon className={cn('w-3.5 h-3.5', s.color)} />
              </div>
              <div className={cn('text-xl font-semibold', s.color)}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap reveal">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Nome, e-mail, CPF ou ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'paid', 'pending', 'cancelled', 'refunded'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                statusFilter === s
                  ? 'bg-brand-acid text-bg-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-bg-border')}>
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Method filter */}
        <select className="input h-9 text-xs w-auto pr-8"
          value={methodFilter} onChange={e => setMethodFilter(e.target.value as any)}>
          <option value="all">Todos os métodos</option>
          <option value="pix">PIX</option>
          <option value="credit_card">Cartão de Crédito</option>
          <option value="boleto">Boleto</option>
        </select>

        <div className="flex-1" />

        <button className="btn-secondary flex items-center gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <Ticket className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM PEDIDO</div>
          <p className="text-sm text-text-muted">
            {search || statusFilter !== 'all' ? 'Nenhum resultado para os filtros aplicados' : 'Os pedidos aparecerão aqui quando as vendas iniciarem'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden reveal">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Comprador', 'Método', 'Valor', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                const mCfg  = METHOD_CONFIG[order.payment_method] ?? METHOD_CONFIG.pix
                const MIcon = mCfg.icon
                return (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-[13px]">{order.buyer_name || '—'}</div>
                      <div className="text-[11px] text-text-muted">{order.buyer_email}</div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <MIcon className="w-3.5 h-3.5 text-brand-acid" />
                        {mCfg.label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-brand-acid">
                        {formatCurrency(order.total_amount)}
                      </span>
                      {order.discount_amount > 0 && (
                        <div className="text-[11px] text-status-success">
                          -{formatCurrency(order.discount_amount)}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={cn('badge text-[10px]', cfg.badge)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full mr-1', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="table-cell text-[11px] text-text-muted font-mono">
                      {formatDate(order.created_at, 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openOrder(order)}
                        className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
            <span className="text-[11px] text-text-muted font-mono">
              {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-30">
                ← Anterior
              </button>
              <span className="text-xs text-text-muted font-mono">Pág. {page + 1}</span>
              <button disabled={orders.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-30">
                Próxima →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          items={orderItems}
          loading={loadingItems}
          onClose={() => { setSelectedOrder(null); setOrderItems([]) }}
        />
      )}
    </div>
  )
}

/* ── Order Modal ────────────────────────────────────────────── */
function OrderModal({ order, items, loading, onClose }: {
  order: Order; items: OrderItem[]; loading: boolean; onClose: () => void
}) {
  const cfg  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const mCfg = METHOD_CONFIG[order.payment_method] ?? METHOD_CONFIG.pix
  const MIcon = mCfg.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <div>
            <h2 className="font-display text-xl tracking-wide leading-none">
              PEDIDO<span className="text-brand-acid">.</span>
            </h2>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Status + método */}
          <div className="flex items-center gap-3">
            <span className={cn('badge', cfg.badge)}>
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1', cfg.dot)} />
              {cfg.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MIcon className="w-3.5 h-3.5 text-brand-acid" />
              {mCfg.label}
            </span>
            {order.paid_at && (
              <span className="text-[11px] text-status-success font-mono">
                Pago em {formatDate(order.paid_at, 'dd/MM/yyyy HH:mm')}
              </span>
            )}
          </div>

          {/* Comprador */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Comprador</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { l: 'Nome',    v: order.buyer_name },
                { l: 'E-mail',  v: order.buyer_email },
                { l: 'Telefone',v: order.buyer_phone },
                { l: 'CPF',     v: order.buyer_cpf },
              ].map((f, i) => f.v ? (
                <div key={i} className="bg-bg-surface rounded-sm px-3 py-2">
                  <div className="text-[10px] text-text-muted">{f.l}</div>
                  <div className="text-text-primary font-mono text-xs mt-0.5">{f.v}</div>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Ingressos */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Ingressos</div>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-brand-acid animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-xs text-text-muted text-center py-4">Nenhum item</div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-bg-border">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {item.ticket_type?.name ?? 'Ingresso'}
                        {item.batch?.name && (
                          <span className="text-[10px] text-text-muted ml-2 font-mono">{item.batch.name}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {item.holder_name || order.buyer_name} · {item.quantity}x
                      </div>
                    </div>
                    <span className="font-mono text-brand-acid text-sm font-semibold">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financeiro */}
          <div className="space-y-1.5 p-3 bg-bg-surface rounded-sm border border-bg-border text-xs font-mono">
            <div className="text-[10px] tracking-widest text-text-muted uppercase mb-2">Resumo financeiro</div>
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-status-success">
                <span>Desconto</span><span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-primary font-semibold border-t border-bg-border pt-1.5 mt-1.5">
              <span>Total</span><span className="text-brand-acid">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* Notas */}
          {order.notes && (
            <div className="p-3 bg-status-warning/5 border border-status-warning/20 rounded-sm">
              <div className="flex items-start gap-2 text-xs text-status-warning">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {order.notes}
              </div>
            </div>
          )}

          {/* ID externo */}
          {order.pagarme_order_id && (
            <div className="text-[11px] text-text-muted font-mono">
              Pagar.me: {order.pagarme_order_id}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Fechar</button>
        </div>
      </div>
    </div>
  )
}