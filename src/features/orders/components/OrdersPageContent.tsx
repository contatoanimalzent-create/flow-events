import { CreditCard, Download, Eye, Loader2, RefreshCw, Search, Smartphone, Ticket, TrendingUp, Clock, DollarSign, FileText, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useOrderActions, useOrderDetails, useOrdersList } from '@/features/orders/hooks'
import { ORDER_PAYMENT_METHOD_CONFIG, ORDER_STATUS_CONFIG } from '@/features/orders/types'
import type { OrderRow } from '@/features/orders/types'
import { OrderDetailModal } from '@/features/orders/modals'
import { PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

function exportOrdersCsv(orders: OrderRow[]) {
  const rows = [
    ['ID', 'Nome', 'E-mail', 'Telefone', 'CPF', 'Status', 'Pagamento', 'Subtotal', 'Desconto', 'Total', 'Método', 'Data', 'Pago em'],
    ...orders.map(o => [
      o.id.slice(0, 8), o.buyer_name, o.buyer_email, o.buyer_phone ?? '', o.buyer_cpf ?? '',
      o.status, o.payment_status,
      formatCurrency(o.subtotal), formatCurrency(o.discount_amount), formatCurrency(o.total_amount),
      o.payment_method ?? '',
      formatDate(o.created_at, 'dd/MM/yyyy HH:mm'),
      o.paid_at ? formatDate(o.paid_at, 'dd/MM/yyyy HH:mm') : '',
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

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
    paginatedOrders,
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
    pagination,
    setPage,
  } = useOrdersList(organization?.id)
  const { order, items, digitalTickets, loading: loadingDetails } = useOrderDetails(selectedOrderId)
  const { confirmOrder, cancelOrder, issueDigitalTickets, resendTickets, cancelling } = useOrderActions({ eventId: selectedEventId })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Orders & payments</div>
          <h1 className="admin-title">
            Vendas<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">Pedidos, pagamentos e emissao digital.</p>
        </div>
        <div className="flex items-center gap-2">
          {filteredOrders.length > 0 && (
            <button
              onClick={() => exportOrdersCsv(filteredOrders)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
          )}
          <button onClick={() => void refreshOrders()} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {events.length > 1 && (
        <div className="admin-filterbar">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          <div className="flex flex-wrap gap-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedEventId === event.id
                    ? 'bg-brand-acid text-white'
                    : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="reveal grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="admin-filterbar">
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
                  ? 'bg-brand-acid text-white'
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
        <PageLoadingState title="Carregando pedidos" description="Consolidando vendas, pagamentos e emissoes digitais." />
      ) : error ? (
        <PageErrorState
          title="ERRO AO CARREGAR PEDIDOS"
          description={error}
          icon={<Ticket className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void refreshOrders()} className="btn-primary">
              Tentar novamente
            </button>
          }
        />
      ) : events.length === 0 ? (
        <PageEmptyState title="NENHUM EVENTO" description="Crie um evento para comecar a receber pedidos." icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />} />
      ) : filteredOrders.length === 0 ? (
        <PageEmptyState
          title="NENHUM PEDIDO"
          description={
            search || statusFilter !== 'all' || methodFilter !== 'all'
              ? 'Nenhum resultado para os filtros aplicados.'
              : 'Os pedidos aparecerao aqui quando as vendas iniciarem.'
          }
          icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />}
        />
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
              {paginatedOrders.map((order) => {
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
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {order && selectedOrderId && (
        <OrderDetailModal
          order={order}
          items={items}
          digitalTickets={digitalTickets}
          loading={loadingDetails}
          cancelling={cancelling}
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
}