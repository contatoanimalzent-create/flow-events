import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import {
  Plus, Search, Edit2, Trash2, Loader2, X, AlertCircle,
  ShoppingCart, Package, Tag, BarChart3, Minus,
  CheckCircle2, AlertTriangle, Grid3X3, List,
  ShoppingBag, Coffee, Shirt, Zap, MoreHorizontal,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type ProductCategory = 'bar' | 'food' | 'merch' | 'vip' | 'service' | 'other'

interface Product {
  id: string
  organization_id: string
  event_id?: string
  name: string
  sku?: string
  description?: string
  category: ProductCategory
  price: number
  cost_price?: number
  stock_quantity: number
  stock_alert_threshold?: number
  is_active: boolean
  image_url?: string
  created_at: string
}

interface CartItem {
  product: Product
  qty: number
}

interface EventItem { id: string; name: string }

interface ProductForm {
  name: string
  sku: string
  description: string
  category: ProductCategory
  price: string
  cost_price: string
  stock_quantity: string
  stock_alert_threshold: string
}

const EMPTY_FORM: ProductForm = {
  name: '', sku: '', description: '', category: 'bar',
  price: '', cost_price: '', stock_quantity: '', stock_alert_threshold: '',
}

const CATEGORY_CONFIG: Record<ProductCategory, { label: string; icon: React.ElementType; color: string }> = {
  bar:     { label: 'Bar & Bebidas',    icon: Coffee,      color: 'text-brand-blue' },
  food:    { label: 'Alimentação',      icon: ShoppingBag, color: 'text-status-warning' },
  merch:   { label: 'Merchandise',      icon: Shirt,       color: 'text-brand-purple' },
  vip:     { label: 'VIP / Experiência',icon: Zap,         color: 'text-brand-acid' },
  service: { label: 'Serviços',         icon: Tag,         color: 'text-brand-teal' },
  other:   { label: 'Outros',           icon: Package,     color: 'text-text-muted' },
}

/* ── Main ───────────────────────────────────────────────────── */
export function ProductsPage() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<'catalog' | 'pdv'>('catalog')
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  // PDV state
  const [cart, setCart] = useState<CartItem[]>([])
  const [pdvSearch, setPdvSearch] = useState('')
  const [pdvCategory, setPdvCategory] = useState<'all' | ProductCategory>('all')
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => { if (organization) { fetchEvents(); fetchProducts() } }, [organization])
  useEffect(() => { if (organization) fetchProducts() }, [selectedEventId] )

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('id,name')
      .eq('organization_id', organization!.id).order('starts_at', { ascending: false })
    const list = (data ?? []) as EventItem[]
    setEvents(list)
    if (list[0]) setSelectedEventId(list[0].id)
  }

  async function fetchProducts() {
    setLoading(true)
    let q = supabase.from('products').select('*').eq('organization_id', organization!.id)
    if (selectedEventId) q = q.eq('event_id', selectedEventId)
    q = q.order('name')
    const { data } = await q
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
    setMenuId(null)
  }

  async function handleToggleActive(id: string, current: boolean) {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    fetchProducts()
  }

  // Cart actions
  function addToCart(product: Product) {
    if (!product.is_active) return
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id)
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { product, qty: 1 }]
    })
  }

  function removeFromCart(productId: string) {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === productId)
      if (existing && existing.qty > 1) return prev.map(c => c.product.id === productId ? { ...c, qty: c.qty - 1 } : c)
      return prev.filter(c => c.product.id !== productId)
    })
  }

  function clearCart() { setCart([]) }

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0)
  const cartItemCount = cart.reduce((sum, c) => sum + c.qty, 0)

  async function placeOrder() {
    if (cart.length === 0) return
    // In a real implementation, this would create a PDV order in the database
    setOrderPlaced(true)
    setTimeout(() => { setOrderPlaced(false); clearCart() }, 2500)
  }

  const catalogFiltered = products.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
  })

  const pdvFiltered = products.filter(p => {
    if (!p.is_active) return false
    if (pdvCategory !== 'all' && p.category !== pdvCategory) return false
    if (!pdvSearch) return true
    return p.name.toLowerCase().includes(pdvSearch.toLowerCase())
  })

  const lowStockCount = products.filter(p =>
    p.stock_quantity <= (p.stock_alert_threshold ?? 5) && p.stock_quantity > 0
  ).length
  const outOfStockCount = products.filter(p => p.stock_quantity === 0 && p.is_active).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto" onClick={() => setMenuId(null)}>

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            PRODUTOS & PDV<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Catálogo de produtos e ponto de venda
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switch */}
          <div className="flex items-center border border-bg-border rounded-sm overflow-hidden">
            {([
              { key: 'catalog', label: '⊞ Catálogo' },
              { key: 'pdv', label: '⊡ PDV' },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn('px-4 py-2 text-xs font-medium transition-all',
                  tab === t.key ? 'bg-brand-acid text-bg-primary' : 'text-text-muted hover:text-text-primary')}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'catalog' && (
            <button onClick={() => { setEditingProduct(null); setShowForm(true) }}
              className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo produto
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal" style={{ transitionDelay: '40ms' }}>
        {[
          { label: 'Produtos', value: products.length, icon: Package, color: 'text-text-primary' },
          { label: 'Estoque baixo', value: lowStockCount, icon: AlertTriangle, color: 'text-status-warning' },
          { label: 'Sem estoque', value: outOfStockCount, icon: AlertCircle, color: 'text-status-error' },
          { label: 'Valor em estoque', value: formatCurrency(totalValue), icon: BarChart3, color: 'text-brand-acid' },
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

      {/* ── CATALOG TAB ─────────────────────────────────────────── */}
      {tab === 'catalog' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap reveal" style={{ transitionDelay: '60ms' }}>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input className="input pl-9 h-9 text-sm" placeholder="Buscar produto ou SKU..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={() => setCategoryFilter('all')}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  categoryFilter === 'all' ? 'bg-brand-acid text-bg-primary' : 'text-text-muted hover:text-text-primary border border-transparent hover:border-bg-border')}>
                Todos
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <button key={k} onClick={() => setCategoryFilter(k as ProductCategory)}
                  className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                    categoryFilter === k ? 'bg-brand-acid text-bg-primary' : 'text-text-muted hover:text-text-primary border border-transparent hover:border-bg-border')}>
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center border border-bg-border rounded-sm overflow-hidden">
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-3 py-1.5 text-xs transition-all',
                    view === v ? 'bg-brand-acid/15 text-brand-acid' : 'text-text-muted hover:text-text-primary')}>
                  {v === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
            </div>
          )}

          {!loading && catalogFiltered.length === 0 && (
            <div className="card p-16 flex flex-col items-center justify-center text-center">
              <Package className="w-10 h-10 text-text-muted mb-3" />
              <div className="font-display text-2xl text-text-primary mb-1">
                {search ? 'NENHUM RESULTADO' : 'NENHUM PRODUTO'}
              </div>
              <p className="text-sm text-text-muted mb-5">
                {search ? 'Tente outros termos' : 'Adicione produtos para o catálogo e PDV'}
              </p>
              {!search && (
                <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo produto</button>
              )}
            </div>
          )}

          {/* Grid view */}
          {!loading && view === 'grid' && catalogFiltered.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {catalogFiltered.map((p, i) => {
                const catCfg = CATEGORY_CONFIG[p.category]
                const CatIcon = catCfg.icon
                const isLowStock = p.stock_quantity <= (p.stock_alert_threshold ?? 5) && p.stock_quantity > 0
                const isOutOfStock = p.stock_quantity === 0
                return (
                  <div key={p.id} className={cn('card overflow-hidden group reveal transition-all',
                    !p.is_active && 'opacity-50')} style={{ transitionDelay: `${i * 30}ms` }}>
                    <div className="h-28 bg-bg-surface flex items-center justify-center relative overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <CatIcon className={cn('w-8 h-8', catCfg.color, 'opacity-40')} />
                      )}
                      <span className={cn('absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded-sm',
                        'bg-bg-primary/70 backdrop-blur-sm', catCfg.color)}>
                        {catCfg.label}
                      </span>
                      {isOutOfStock && (
                        <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-status-error/80 text-white">
                          ESGOTADO
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-status-warning/80 text-white">
                          BAIXO
                        </span>
                      )}
                      <div className="absolute inset-0 bg-bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={e => { e.stopPropagation(); setEditingProduct(p); setShowForm(true) }}
                          className="p-2 rounded-sm bg-bg-card text-text-primary hover:text-brand-acid transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(p.id) }}
                          className="p-2 rounded-sm bg-bg-card text-text-primary hover:text-status-error transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-[12px] text-text-primary truncate">{p.name}</div>
                      {p.sku && <div className="text-[10px] text-text-muted font-mono">{p.sku}</div>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono font-bold text-brand-acid text-sm">{formatCurrency(p.price)}</span>
                        <span className={cn('text-[10px] font-mono',
                          isOutOfStock ? 'text-status-error' : isLowStock ? 'text-status-warning' : 'text-text-muted')}>
                          {p.stock_quantity} un
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List view */}
          {!loading && view === 'list' && catalogFiltered.length > 0 && (
            <div className="card overflow-hidden reveal">
              <table className="w-full">
                <thead className="border-b border-bg-border">
                  <tr>{['Produto', 'Categoria', 'Preço', 'Custo', 'Estoque', 'Status', 'Ações'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {catalogFiltered.map(p => {
                    const catCfg = CATEGORY_CONFIG[p.category]
                    const CatIcon = catCfg.icon
                    const isLowStock = p.stock_quantity <= (p.stock_alert_threshold ?? 5) && p.stock_quantity > 0
                    const isOutOfStock = p.stock_quantity === 0
                    const margin = p.cost_price && p.price
                      ? Math.round(((p.price - p.cost_price) / p.price) * 100) : null
                    return (
                      <tr key={p.id} className={cn('table-row', !p.is_active && 'opacity-50')}>
                        <td className="table-cell">
                          <div className="font-medium text-[13px]">{p.name}</div>
                          {p.sku && <div className="text-[10px] text-text-muted font-mono">{p.sku}</div>}
                        </td>
                        <td className="table-cell">
                          <span className={cn('flex items-center gap-1.5 text-xs', catCfg.color)}>
                            <CatIcon className="w-3 h-3" /> {catCfg.label}
                          </span>
                        </td>
                        <td className="table-cell font-mono font-bold text-brand-acid">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="table-cell">
                          {p.cost_price ? (
                            <div>
                              <div className="font-mono text-xs text-text-secondary">{formatCurrency(p.cost_price)}</div>
                              {margin !== null && (
                                <div className="text-[10px] text-status-success">Margem: {margin}%</div>
                              )}
                            </div>
                          ) : <span className="text-xs text-text-muted">—</span>}
                        </td>
                        <td className="table-cell">
                          <span className={cn('font-mono text-sm font-medium',
                            isOutOfStock ? 'text-status-error' : isLowStock ? 'text-status-warning' : 'text-text-primary')}>
                            {formatNumber(p.stock_quantity)}
                          </span>
                          {isLowStock && !isOutOfStock && (
                            <AlertTriangle className="inline-block w-3 h-3 ml-1 text-status-warning" />
                          )}
                        </td>
                        <td className="table-cell">
                          <button onClick={() => handleToggleActive(p.id, p.is_active)}
                            className={cn('text-[10px] font-mono px-2 py-1 rounded-sm border transition-all',
                              p.is_active
                                ? 'border-status-success/30 text-status-success bg-status-success/8'
                                : 'border-bg-border text-text-muted')}>
                            {p.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingProduct(p); setShowForm(true) }}
                              className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── PDV TAB ─────────────────────────────────────────────── */}
      {tab === 'pdv' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 reveal">
          {/* Product grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input className="input pl-9 h-9 text-sm" placeholder="Buscar produto..."
                  value={pdvSearch} onChange={e => setPdvSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setPdvCategory('all')}
                  className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                    pdvCategory === 'all' ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                  Todos
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => {
                  const Icon = v.icon
                  return (
                    <button key={k} onClick={() => setPdvCategory(k as ProductCategory)}
                      className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all flex items-center gap-1',
                        pdvCategory === k ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                      <Icon className="w-3 h-3" /> {v.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {pdvFiltered.length === 0 ? (
              <div className="card p-12 flex flex-col items-center text-center">
                <Package className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-sm text-text-muted">Nenhum produto disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pdvFiltered.map(p => {
                  const cartItem = cart.find(c => c.product.id === p.id)
                  const isOutOfStock = p.stock_quantity === 0
                  const catCfg = CATEGORY_CONFIG[p.category]
                  const CatIcon = catCfg.icon
                  return (
                    <button key={p.id} onClick={() => !isOutOfStock && addToCart(p)}
                      disabled={isOutOfStock}
                      className={cn(
                        'card p-3 text-left transition-all duration-150 relative group',
                        isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:border-brand-acid/40 hover:shadow-glow-acid active:scale-95 cursor-pointer',
                        cartItem && 'border-brand-acid/30 bg-brand-acid/3'
                      )}>
                      <div className="flex items-center justify-center h-10 mb-2">
                        <CatIcon className={cn('w-6 h-6', catCfg.color, 'opacity-60')} />
                      </div>
                      <div className="text-[12px] font-medium text-text-primary leading-tight mb-1 line-clamp-2">
                        {p.name}
                      </div>
                      <div className="font-mono font-bold text-brand-acid text-sm">
                        {formatCurrency(p.price)}
                      </div>
                      {cartItem && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-acid rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-bg-primary">{cartItem.qty}</span>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-bg-card/80 rounded-sm">
                          <span className="text-[10px] font-mono text-status-error">ESGOTADO</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="card flex flex-col h-fit sticky top-4">
            <div className="p-4 border-b border-bg-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-acid" />
                <span className="font-display text-lg leading-none">PEDIDO<span className="text-brand-acid">.</span></span>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-[11px] text-text-muted hover:text-status-error transition-colors font-mono">
                  Limpar
                </button>
              )}
            </div>

            {orderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                <CheckCircle2 className="w-12 h-12 text-status-success" />
                <div className="font-display text-xl text-status-success">PEDIDO REALIZADO</div>
                <p className="text-xs text-text-muted text-center">Aguardando pagamento...</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="w-8 h-8 text-text-muted mb-2 opacity-30" />
                <p className="text-sm text-text-muted">Clique nos produtos para adicionar</p>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 space-y-2 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-text-primary truncate">{item.product.name}</div>
                        <div className="text-[11px] font-mono text-text-muted">
                          {formatCurrency(item.product.price)} × {item.qty} = <span className="text-brand-acid font-semibold">{formatCurrency(item.product.price * item.qty)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => removeFromCart(item.product.id)}
                          className="w-6 h-6 rounded-sm bg-bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-text-primary">{item.qty}</span>
                        <button onClick={() => addToCart(item.product)}
                          className="w-6 h-6 rounded-sm bg-bg-surface flex items-center justify-center text-text-muted hover:text-brand-acid transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-bg-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
                    <span className="font-mono font-bold text-lg text-brand-acid">{formatCurrency(cartTotal)}</span>
                  </div>

                  {/* Payment method buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'PIX', color: 'text-status-success' },
                      { label: 'Crédito', color: 'text-brand-blue' },
                      { label: 'Débito', color: 'text-brand-purple' },
                    ].map(pm => (
                      <button key={pm.label} onClick={placeOrder}
                        className={cn(
                          'py-3 rounded-sm border border-bg-border text-xs font-bold transition-all hover:scale-105 active:scale-95',
                          pm.color, 'hover:border-current bg-bg-surface hover:bg-bg-card'
                        )}>
                        {pm.label}
                      </button>
                    ))}
                  </div>

                  <button onClick={placeOrder}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar pedido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProductFormModal
          organizationId={organization!.id}
          events={events}
          product={editingProduct}
          defaultEventId={selectedEventId}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
          onSaved={() => { fetchProducts(); setShowForm(false); setEditingProduct(null) }}
        />
      )}
    </div>
  )
}

/* ── Form Modal ─────────────────────────────────────────────── */
function ProductFormModal({ organizationId, events, product, defaultEventId, onClose, onSaved }: {
  organizationId: string
  events: EventItem[]
  product: Product | null
  defaultEventId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<ProductForm>(
    product ? {
      name: product.name,
      sku: product.sku ?? '',
      description: product.description ?? '',
      category: product.category,
      price: product.price.toString(),
      cost_price: product.cost_price?.toString() ?? '',
      stock_quantity: product.stock_quantity.toString(),
      stock_alert_threshold: product.stock_alert_threshold?.toString() ?? '',
    } : { ...EMPTY_FORM }
  )
  const [eventId, setEventId] = useState(product?.event_id ?? defaultEventId)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof ProductForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const priceNum = parseFloat(form.price) || 0
  const costNum = parseFloat(form.cost_price) || 0
  const margin = priceNum > 0 && costNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : null

  async function handleSave() {
    if (!form.name.trim()) { setError('Nome do produto é obrigatório'); return }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Preço inválido'); return }
    if (!form.stock_quantity || isNaN(parseInt(form.stock_quantity))) { setError('Estoque inválido'); return }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      event_id: eventId || null,
      name: form.name.trim(),
      sku: form.sku || null,
      description: form.description || null,
      category: form.category,
      price: parseFloat(form.price),
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      stock_quantity: parseInt(form.stock_quantity),
      stock_alert_threshold: form.stock_alert_threshold ? parseInt(form.stock_alert_threshold) : null,
      is_active: isActive,
    }

    const { error: err } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl leading-none">
            {product ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="input-label">Nome do produto *</label>
              <input className="input" placeholder="ex: Cerveja Long Neck, Camiseta P, Combo VIP..."
                value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
            </div>
            <div>
              <label className="input-label">SKU / Código</label>
              <input className="input" placeholder="ex: BAR-001"
                value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Categoria</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {events.length > 0 && (
            <div>
              <label className="input-label">Evento vinculado</label>
              <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Nenhum (catálogo geral)</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Preço de venda (R$) *</label>
              <input type="number" className="input" placeholder="0,00" min={0} step={0.01}
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Preço de custo (R$)</label>
              <input type="number" className="input" placeholder="0,00" min={0} step={0.01}
                value={form.cost_price} onChange={e => set('cost_price', e.target.value)} />
            </div>
          </div>

          {margin !== null && (
            <div className="flex items-center gap-2 p-2 bg-status-success/8 border border-status-success/20 rounded-sm text-xs text-status-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Margem de lucro: <span className="font-bold">{margin}%</span>
              <span className="text-text-muted ml-1">({formatCurrency(priceNum - costNum)} por unidade)</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Estoque inicial *</label>
              <input type="number" className="input" placeholder="ex: 100" min={0}
                value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Alerta quando abaixo de</label>
              <input type="number" className="input" placeholder="ex: 10" min={0}
                value={form.stock_alert_threshold} onChange={e => set('stock_alert_threshold', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="input-label">Descrição</label>
            <textarea className="input resize-none" rows={2}
              placeholder="Detalhes opcionais do produto..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-bg-border">
            <span className="text-sm text-text-secondary">Disponível no PDV</span>
            <button onClick={() => setIsActive(!isActive)}
              className={cn('w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0', isActive ? 'bg-brand-acid' : 'bg-bg-border')}>
              <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200', isActive ? 'left-4' : 'left-0.5')} />
            </button>
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (product ? '✓ Salvar' : '✓ Criar produto')}
          </button>
        </div>
      </div>
    </div>
  )
}
