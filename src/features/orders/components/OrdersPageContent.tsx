import { CreditCard, Download, Eye, Loader2, RefreshCw, Search, Smartphone, Ticket, TrendingUp, Clock, DollarSign, FileText, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useOrderActions, useOrderDetails, useOrdersList } from '@/features/orders/hooks'
import { ORDER_PAYMENT_METHOD_CONFIG, ORDER_STATUS_CONFIG } from '@/features/orders/types'
import { OrderDetailModal } from '@/features/orders/modals'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

function PaymentMethodIcon({ method }: { method?: string | null }) {
  const config = method ? ORDER_PAYMENT_METHOD_CONFIG[method as keyof typeof ORDER_PAYMENT_METHOD_CONFIG] : undefined

  switch (config?.icon) {
    case 'card':
      return <CreditCard className="h-3.5 w-3.5 text-brand-acid" />
    case 'boleto':
      return <FileText className="h-3.5 w-3.5 text-brand-acid" />
    case 'free':
      return <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
    case 'pix':
    default:
      return <Smartphone className="h-3.5 w-3.5 text-brand-acid" />
  }
}

export function OrdersPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    filteredOrders,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    selectedOrderId,
    openOrder,
    closeOrder,
    stats,
    refreshOrders,
  } = useOrdersList(organization?.id)
  const { order, items, digitalTickets, loading: loadingDetails } = useOrderDetails(selectedOrderId)
  const { confirmOrder, cancelOrder, issueDigitalTickets, resendTickets } = useOrderActions({ eventId: selectedEventId })

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="reveal flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            VENDAS<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">Pedidos, pagamentos e emiss\u00e3o digital</p>
        </div>
        <button onClick={() => void refreshOrders()} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      {events.length > 1 && (
        <div className="reveal flex items-center gap-3">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          <div className="flex flex-wrap gap-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedEventId === event.id
                    ? 'bg-brand-acid text-bg-primary'
                    : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Receita confirmada', value: formatCurrency(stats.confirmedRevenue), icon: DollarSign, color: 'text-status-success' },
          { label: 'Pedidos pagos', value: stats.paidOrders, icon: Ticket, color: 'text-brand-acid' },
          { label: 'Aguardando pag.', value: stats.pendingOrders, icon: Clock, color: 'text-status-warning' },
          { label: 'Pedidos hoje', value: stats.todayOrders, icon: TrendingUp, color: 'text-brand-blue' },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{stat.label}</span>
                <Icon className={cn('h-3.5 w-3.5', stat.color)} />
              </div>
              <div className={cn('text-xl font-semibold', stat.color)}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="reveal flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-9 pl-9 text-sm"
            placeholder="Nome, e-mail, CPF ou ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'paid', 'pending', 'cancelled', 'refunded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                statusFilter === status
                  ? 'bg-brand-acid text-bg-primary'
                  : 'border border-transparent text-text-muted hover:border-bg-border hover:bg-bg-surface hover:text-text-primary',
              )}
            >
              {status === 'all' ? 'Todos' : ORDER_STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        <select className="input h-9 w-auto pr-8 text-xs" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value as typeof methodFilter)}>
          <option value="all">Todos os m\u00e9todos</option>
          <option value="pix">PIX</option>
          <option value="credit_card">Cart\u00e3o de Cr\u00e9dito</option>
          <option value="boleto">Boleto</option>
        </select>

        <div className="flex-1" />

        <button className="btn-secondary flex items-center gap-2 text-xs">
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-status-error" />
          <div className="mb-1 font-display text-2xl text-text-primary">ERRO AO CARREGAR PEDIDOS</div>
          <p className="mb-5 text-sm text-text-muted">{error}</p>
          <button onClick={() => void refreshOrders()} className="btn-primary">
            Tentar novamente
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-text-muted" />
          <div className="mb-1 font-display text-2xl text-text-primary">NENHUM EVENTO</div>
          <p className="text-sm text-text-muted">Crie um evento para come\u00e7ar a receber pedidos.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-text-muted" />
          <div className="mb-1 font-display text-2xl text-text-primary">NENHUM PEDIDO</div>
          <p className="text-sm text-text-muted">
            {search || statusFilter !== 'all' || methodFilter !== 'all'
              ? 'Nenhum resultado para os filtros aplicados'
              : 'Os pedidos aparecer\u00e3o aqui quando as vendas iniciarem'}
          </p>
        </div>
      ) : (
        <div className="card reveal overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Comprador', 'M\u00e9todo', 'Valor', 'Status', 'Data', 'A\u00e7\u00f5es'].map((header) => (
                  <th key={header} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending
                const paymentMethod = order.payment_method ? ORDER_PAYMENT_METHOD_CONFIG[order.payment_method] : undefined

                return (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="text-[13px] font-medium">{order.buyer_name || '\u2014'}</div>
                      <div className="text-[11px] text-text-muted">{order.buyer_email}</div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <PaymentMethodIcon method={order.payment_method} />
                        {paymentMethod?.label ?? 'N\u00e3o definido'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-brand-acid">{formatCurrency(order.total_amount)}</span>
                      {order.discount_amount > 0 && <div className="text-[11px] text-status-success">-{formatCurrency(order.discount_amount)}</div>}
                    </td>
                    <td className="table-cell">
                      <span className={cn('badge text-[10px]', statusConfig.badge)}>
                        <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="table-cell text-[11px] font-mono text-text-muted">{formatDate(order.created_at, 'dd/MM/yy HH:mm')}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => openOrder(order.id)}
                        className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {order && selectedOrderId && (
        <OrderDetailModal
          order={order}
          items={items}
          digitalTickets={digitalTickets}
          loading={loadingDetails}
          onClose={closeOrder}
          onConfirm={() => void confirmOrder(selectedOrderId)}
          onCancel={() => void cancelOrder(selectedOrderId)}
          onIssueDigitalTickets={() => void issueDigitalTickets(selectedOrderId)}
          onResendTickets={() => void resendTickets(selectedOrderId)}
        />
      )}
    </div>
  )
}
