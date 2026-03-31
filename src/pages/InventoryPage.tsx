import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Boxes, Loader2, Package, Search, ShieldAlert, Warehouse } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { cn } from '@/shared/lib'
import { formatCurrency, formatNumber } from '@/lib/utils'

type ProductCategory = 'bar' | 'food' | 'merch' | 'vip' | 'service' | 'other'

interface Product {
  id: string
  organization_id: string
  event_id?: string | null
  name: string
  sku?: string | null
  category: ProductCategory
  price: number
  stock_quantity: number
  stock_alert_threshold?: number | null
  is_active: boolean
}

interface EventItem {
  id: string
  name: string
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bar: 'Bar e bebidas',
  food: 'Alimentacao',
  merch: 'Merch',
  vip: 'VIP',
  service: 'Servicos',
  other: 'Outros',
}

export function InventoryPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all')

  useEffect(() => {
    if (!organization) {
      return
    }

    void fetchEvents()
  }, [organization])

  useEffect(() => {
    if (!organization) {
      return
    }

    void fetchProducts()
  }, [organization, selectedEventId])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id,name')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })

    const list = filterExampleEvents((data ?? []) as EventItem[])
    setEvents(list)

    if (!selectedEventId && list[0]) {
      setSelectedEventId(list[0].id)
    }
  }

  async function fetchProducts() {
    setLoading(true)

    let query = supabase.from('products').select('*').eq('organization_id', organization!.id)

    if (selectedEventId) {
      query = query.eq('event_id', selectedEventId)
    }

    const { data } = await query.order('name')

    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  const inventoryRows = useMemo(() => {
    return products
      .map((product) => {
        const threshold = product.stock_alert_threshold ?? 5
        const status =
          product.stock_quantity === 0 ? 'critical' : product.stock_quantity <= threshold ? 'warning' : 'healthy'

        return {
          ...product,
          threshold,
          status,
          stockValue: product.stock_quantity * product.price,
        }
      })
      .filter((product) => {
        if (statusFilter !== 'all' && product.status !== statusFilter) {
          return false
        }

        if (!search) {
          return true
        }

        const normalized = search.toLowerCase()
        return product.name.toLowerCase().includes(normalized) || (product.sku ?? '').toLowerCase().includes(normalized)
      })
  }, [products, search, statusFilter])

  const metrics = useMemo(() => {
    const warning = products.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= (item.stock_alert_threshold ?? 5)).length
    const critical = products.filter((item) => item.stock_quantity === 0 && item.is_active).length
    const totalUnits = products.reduce((sum, item) => sum + item.stock_quantity, 0)
    const stockValue = products.reduce((sum, item) => sum + item.price * item.stock_quantity, 0)

    return { warning, critical, totalUnits, stockValue }
  }, [products])

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Controle operacional</div>
          <h1 className="admin-title">
            Estoque<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Estoque cuida de saldo, alerta e ruptura. Venda rapida continua no PDV para a equipe de caixa operar sem ruir a
            leitura do estoque.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#ae936f]">Papel do modulo</div>
            <div className="mt-4 font-display text-[2rem] leading-none text-[#ebe7e0]">Disponibilidade real.</div>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              Leia o que precisa de reposicao, o que ja travou a operacao e quanto capital esta parado no estoque.
            </p>
          </div>
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#ae936f]">Nao confundir</div>
            <div className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
              <Warehouse className="h-4 w-4 text-[#ae936f]" />
              Estoque controla.
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
              <ArrowRight className="h-4 w-4 text-[#d62a0b]" />
              PDV vende.
            </div>
          </div>
        </div>
      </div>

      {events.length > 1 ? (
        <div className="admin-filterbar">
          <span className="text-xs font-mono uppercase tracking-[0.28em] text-text-muted">Evento</span>
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEventId(event.id)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-all',
                selectedEventId === event.id
                  ? 'bg-brand-acid text-[#090807]'
                  : 'border border-white/8 text-text-secondary hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Itens em ruptura', value: metrics.critical, icon: ShieldAlert, tone: 'text-status-error' },
          { label: 'Reposicao urgente', value: metrics.warning, icon: AlertTriangle, tone: 'text-status-warning' },
          { label: 'Unidades disponiveis', value: formatNumber(metrics.totalUnits), icon: Boxes, tone: 'text-text-primary' },
          { label: 'Valor em estoque', value: formatCurrency(metrics.stockValue), icon: Package, tone: 'text-brand-acid' },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{item.label}</span>
                <Icon className={cn('h-4 w-4', item.tone)} />
              </div>
              <div className={cn('mt-5 font-display text-[2.8rem] leading-none tracking-[-0.05em]', item.tone)}>{item.value}</div>
            </div>
          )
        })}
      </div>

      <div className="admin-filterbar">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar item ou SKU..."
            className="input h-11 rounded-full pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'Tudo' },
            { key: 'critical', label: 'Ruptura' },
            { key: 'warning', label: 'Reposicao' },
            { key: 'healthy', label: 'Saudavel' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key as typeof statusFilter)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-all',
                statusFilter === item.key
                  ? 'bg-brand-acid text-[#090807]'
                  : 'border border-white/8 text-text-secondary hover:text-text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Item', 'Categoria', 'Disponivel', 'Threshold', 'Status', 'Valor em saldo'].map((header) => (
                  <th key={header} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="table-cell">
                    <div className="font-medium text-text-primary">{row.name}</div>
                    <div className="mt-1 text-xs font-mono text-text-muted">{row.sku || 'Sem SKU'}</div>
                  </td>
                  <td className="table-cell text-text-secondary">{CATEGORY_LABELS[row.category]}</td>
                  <td className="table-cell font-mono text-text-primary">{formatNumber(row.stock_quantity)}</td>
                  <td className="table-cell font-mono text-text-secondary">{formatNumber(row.threshold)}</td>
                  <td className="table-cell">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                        row.status === 'critical' && 'bg-status-error/12 text-status-error',
                        row.status === 'warning' && 'bg-status-warning/12 text-status-warning',
                        row.status === 'healthy' && 'bg-status-success/12 text-status-success',
                      )}
                    >
                      {row.status === 'critical' ? 'Ruptura' : row.status === 'warning' ? 'Reposicao' : 'Saudavel'}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-brand-acid">{formatCurrency(row.stockValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!inventoryRows.length ? (
            <div className="px-6 py-16 text-center text-sm text-text-muted">Nenhum item encontrado para este recorte.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
