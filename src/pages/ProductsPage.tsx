import { useEffect, useState, type ElementType } from 'react'
import { CheckCircle2, Coffee, Edit2, Grid3X3, List, Loader2, Minus, Package, Plus, Search, Shirt, ShoppingBag, ShoppingCart, Tag, Trash2, X, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { ActionConfirmationDialog } from '@/shared/components'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { cn } from '@/shared/lib'
import { formatCurrency, formatNumber } from '@/lib/utils'

type ProductCategory = 'bar' | 'food' | 'merch' | 'vip' | 'service' | 'other'
interface Product { id: string; organization_id: string; event_id?: string | null; name: string; sku?: string | null; description?: string | null; category: ProductCategory; price: number; cost_price?: number | null; stock_quantity: number; stock_alert_threshold?: number | null; is_active: boolean }
interface CartItem { product: Product; qty: number }
interface EventItem { id: string; name: string }
interface ProductForm { name: string; sku: string; description: string; category: ProductCategory; price: string; cost_price: string; stock_quantity: string; stock_alert_threshold: string }

const EMPTY_FORM: ProductForm = { name: '', sku: '', description: '', category: 'bar', price: '', cost_price: '', stock_quantity: '', stock_alert_threshold: '' }
const CATEGORY_CONFIG: Record<ProductCategory, { label: string; icon: ElementType; accent: string }> = {
  bar: { label: 'Bar e bebidas', icon: Coffee, accent: 'text-brand-blue' },
  food: { label: 'Alimentacao', icon: ShoppingBag, accent: 'text-status-warning' },
  merch: { label: 'Merch', icon: Shirt, accent: 'text-brand-purple' },
  vip: { label: 'VIP', icon: Zap, accent: 'text-brand-acid' },
  service: { label: 'Servicos', icon: Tag, accent: 'text-brand-teal' },
  other: { label: 'Outros', icon: Package, accent: 'text-text-muted' },
}

export function ProductsPage() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<'pdv' | 'catalog'>('pdv')
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pdvSearch, setPdvSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => { if (organization) void fetchEvents() }, [organization])
  useEffect(() => { if (organization) void fetchProducts() }, [organization, selectedEventId])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('id,name').eq('organization_id', organization!.id).order('starts_at', { ascending: false })
    const list = filterExampleEvents((data ?? []) as EventItem[])
    setEvents(list)
    if (!selectedEventId && list[0]) setSelectedEventId(list[0].id)
  }

  async function fetchProducts() {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('organization_id', organization!.id)
    if (selectedEventId) query = query.eq('event_id', selectedEventId)
    const { data } = await query.order('name')
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  async function handleDelete(id: string) { await supabase.from('products').delete().eq('id', id); await fetchProducts() }
  function clearCart() { setCart([]) }
  function addToCart(product: Product) {
    if (!product.is_active || product.stock_quantity === 0) return
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      return existing ? current.map((item) => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...current, { product, qty: 1 }]
    })
  }
  function removeFromCart(id: string) {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === id)
      if (!existing) return current
      if (existing.qty === 1) return current.filter((item) => item.product.id !== id)
      return current.map((item) => item.product.id === id ? { ...item, qty: item.qty - 1 } : item)
    })
  }
  function placeOrder() {
    if (!cart.length) return
    setOrderPlaced(true)
    window.setTimeout(() => { setOrderPlaced(false); clearCart() }, 2200)
  }

  const saleItems = products.filter((product) => product.is_active)
  const averagePrice = saleItems.length ? saleItems.reduce((sum, product) => sum + product.price, 0) / saleItems.length : 0
  const catalogItems = products.filter((product) => {
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false
    const q = search.toLowerCase()
    return !q || product.name.toLowerCase().includes(q) || (product.sku ?? '').toLowerCase().includes(q)
  })
  const pdvItems = products.filter((product) => {
    if (!product.is_active) return false
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false
    return !pdvSearch || product.name.toLowerCase().includes(pdvSearch.toLowerCase())
  })
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Comercial e operacao</div>
          <h1 className="admin-title">PDV<span className="admin-title-accent">.</span></h1>
          <p className="admin-subtitle">Aqui o time vende. Catalogo comercial, pedido rapido e caixa ficam juntos; saldo, ruptura e reposicao saem da frente e vivem em Estoque.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card p-5"><div className="text-[11px] uppercase tracking-[0.32em] text-[#0057E7]">Uso correto</div><div className="mt-4 font-display text-[2rem] leading-none text-text-primary">Venda e caixa.</div><p className="mt-4 text-sm leading-7 text-text-muted">Monte o catalogo, acelere atendimento e feche pedido sem misturar leitura de estoque.</p></div>
          <div className="card p-5"><div className="text-[11px] uppercase tracking-[0.32em] text-[#0057E7]">Nao confundir</div><div className="mt-4 text-sm leading-7 text-text-secondary">PDV vende. Estoque controla saldo e ruptura. Se a duvida for reposicao, a equipe deve olhar Estoque.</div></div>
        </div>
      </div>

      {events.length > 1 ? <div className="admin-filterbar"><span className="text-xs font-mono uppercase tracking-[0.28em] text-text-muted">Evento</span>{events.map((event) => <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)} className={cn('rounded-full px-4 py-2 text-xs font-medium transition-all', selectedEventId === event.id ? 'bg-brand-primary text-white' : 'border border-bg-border text-text-secondary hover:text-text-primary')}>{event.name}</button>)}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Itens vendaveis', value: saleItems.length, tone: 'text-text-primary' },
          { label: 'Categorias ativas', value: new Set(saleItems.map((item) => item.category)).size, tone: 'text-brand-acid' },
          { label: 'Preco medio', value: formatCurrency(averagePrice), tone: 'text-brand-blue' },
          { label: 'Carrinho atual', value: formatNumber(cartItemCount), tone: 'text-status-success' },
        ].map((item) => <div key={item.label} className="card p-5"><div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{item.label}</div><div className={cn('mt-5 font-display text-[2.8rem] leading-none tracking-[-0.05em]', item.tone)}>{item.value}</div></div>)}
      </div>

      <div className="admin-filterbar">
        <div className="flex flex-wrap items-center gap-2">{[{ key: 'pdv', label: 'PDV rapido' }, { key: 'catalog', label: 'Catalogo comercial' }].map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key as typeof tab)} className={cn('rounded-full px-4 py-2 text-xs font-medium transition-all', tab === item.key ? 'bg-brand-primary text-white' : 'border border-bg-border text-text-secondary hover:text-text-primary')}>{item.label}</button>)}</div>
        <div className="ml-auto flex items-center gap-2"><button type="button" onClick={() => setView('grid')} className={cn('btn-secondary px-4', view === 'grid' && 'border-brand-acid/35')}><Grid3X3 className="h-4 w-4" /></button><button type="button" onClick={() => setView('list')} className={cn('btn-secondary px-4', view === 'list' && 'border-brand-acid/35')}><List className="h-4 w-4" /></button><button type="button" onClick={() => { setEditingProduct(null); setShowForm(true) }} className="btn-primary"><Plus className="h-4 w-4" />Novo item</button></div>
      </div>

      <div className="admin-filterbar">
        <div className="relative min-w-[220px] flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={tab === 'pdv' ? pdvSearch : search} onChange={(event) => tab === 'pdv' ? setPdvSearch(event.target.value) : setSearch(event.target.value)} placeholder={tab === 'pdv' ? 'Buscar no PDV...' : 'Buscar item ou SKU...'} className="input h-11 rounded-full pl-11" /></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setCategoryFilter('all')} className={cn('rounded-full px-4 py-2 text-xs font-medium transition-all', categoryFilter === 'all' ? 'bg-brand-primary text-white' : 'border border-bg-border text-text-secondary hover:text-text-primary')}>Tudo</button>{Object.entries(CATEGORY_CONFIG).map(([key, config]) => <button key={key} type="button" onClick={() => setCategoryFilter(key as ProductCategory)} className={cn('rounded-full px-4 py-2 text-xs font-medium transition-all', categoryFilter === key ? 'bg-brand-primary text-white' : 'border border-bg-border text-text-secondary hover:text-text-primary')}>{config.label}</button>)}</div>
      </div>

      {loading ? <div className="card flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-brand-acid" /></div> : tab === 'pdv' ? <PdvPanel items={pdvItems} view={view} cart={cart} cartTotal={cartTotal} cartItemCount={cartItemCount} orderPlaced={orderPlaced} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} placeOrder={placeOrder} /> : <CatalogPanel items={catalogItems} view={view} onEdit={(product) => { setEditingProduct(product); setShowForm(true) }} onDelete={setPendingDeleteProduct} />}

      {showForm ? <ProductFormModal organizationId={organization!.id} events={events} product={editingProduct} defaultEventId={selectedEventId} onClose={() => { setShowForm(false); setEditingProduct(null) }} onSaved={() => { void fetchProducts(); setShowForm(false); setEditingProduct(null) }} /> : null}

      <ActionConfirmationDialog open={Boolean(pendingDeleteProduct)} title="Excluir item comercial" description={pendingDeleteProduct ? `O item ${pendingDeleteProduct.name} deixara de aparecer no catalogo comercial e no PDV.` : undefined} impact="Historicos antigos podem perder a referencia visual deste item e a equipe precisara cadastrar novamente para voltar a vender." confirmLabel="Excluir item" onCancel={() => setPendingDeleteProduct(null)} onConfirm={async () => { if (!pendingDeleteProduct) return; await handleDelete(pendingDeleteProduct.id); setPendingDeleteProduct(null) }} />
    </div>
  )
}

function PdvPanel({ items, view, cart, cartTotal, cartItemCount, orderPlaced, addToCart, removeFromCart, clearCart, placeOrder }: { items: Product[]; view: 'grid' | 'list'; cart: CartItem[]; cartTotal: number; cartItemCount: number; orderPlaced: boolean; addToCart: (product: Product) => void; removeFromCart: (id: string) => void; clearCart: () => void; placeOrder: () => void }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"><div>{!items.length ? <div className="card px-6 py-16 text-center text-sm text-text-muted">Nenhum item comercial disponivel neste recorte.</div> : view === 'grid' ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((product) => { const category = CATEGORY_CONFIG[product.category]; const Icon = category.icon; const soldOut = product.stock_quantity === 0; const cartItem = cart.find((item) => item.product.id === product.id); return <button key={product.id} type="button" onClick={() => addToCart(product)} className={cn('card p-5 text-left transition-all duration-200', soldOut ? 'cursor-not-allowed opacity-45' : 'hover:-translate-y-1 hover:border-brand-acid/30')}><div className="flex items-start justify-between gap-4"><div><div className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.03]', category.accent)}><Icon className="h-5 w-5" /></div><div className="mt-4 font-display text-[2rem] leading-none tracking-[-0.04em] text-text-primary">{product.name}</div><div className="mt-2 text-xs text-text-muted">{category.label}</div></div>{cartItem ? <div className="rounded-full bg-brand-acid px-3 py-1 text-xs font-semibold text-[#090807]">{cartItem.qty}</div> : null}</div><div className="mt-6 flex items-end justify-between"><div className="font-mono text-xl font-bold text-brand-acid">{formatCurrency(product.price)}</div><div className="text-xs text-text-muted">{soldOut ? 'Sem estoque' : `${formatNumber(product.stock_quantity)} disponivel`}</div></div></button> })}</div> : <div className="card overflow-hidden"><table className="w-full"><thead className="border-b border-bg-border"><tr>{['Item', 'Categoria', 'Preco', 'Disponivel', 'Status'].map((header) => <th key={header} className="table-header">{header}</th>)}</tr></thead><tbody>{items.map((product) => <tr key={product.id} className="table-row cursor-pointer" onClick={() => addToCart(product)}><td className="table-cell"><div className="font-medium text-text-primary">{product.name}</div><div className="mt-1 text-xs font-mono text-text-muted">{product.sku || 'Sem SKU'}</div></td><td className="table-cell text-text-secondary">{CATEGORY_CONFIG[product.category].label}</td><td className="table-cell font-mono text-brand-acid">{formatCurrency(product.price)}</td><td className="table-cell font-mono text-text-primary">{formatNumber(product.stock_quantity)}</td><td className="table-cell"><span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', product.stock_quantity === 0 ? 'bg-status-error/12 text-status-error' : 'bg-status-success/12 text-status-success')}>{product.stock_quantity === 0 ? 'Indisponivel' : 'Vendendo'}</span></td></tr>)}</tbody></table></div>}</div><div className="card sticky top-6 h-fit overflow-hidden"><div className="border-b border-bg-border px-5 py-5"><div className="text-[11px] uppercase tracking-[0.32em] text-[#0057E7]">Caixa rapido</div><div className="mt-3 flex items-center justify-between"><div className="font-display text-[2rem] leading-none tracking-[-0.04em] text-text-primary">Pedido</div>{cart.length ? <button type="button" onClick={clearCart} className="text-xs font-medium text-text-muted transition-colors hover:text-status-error">Limpar</button> : null}</div></div>{orderPlaced ? <div className="flex flex-col items-center justify-center gap-4 px-6 py-14"><CheckCircle2 className="h-12 w-12 text-status-success" /><div className="font-display text-[2rem] leading-none text-status-success">Pedido fechado.</div><div className="text-sm text-text-muted">Operacao pronta para o proximo atendimento.</div></div> : !cart.length ? <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center"><ShoppingCart className="h-10 w-10 text-text-muted" /><div className="text-sm leading-7 text-text-muted">Adicione itens do lado esquerdo para montar o pedido da forma mais rapida possivel.</div></div> : <><div className="max-h-[340px] space-y-3 overflow-y-auto px-5 py-5">{cart.map((item) => <div key={item.product.id} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4"><div className="flex items-start justify-between gap-3"><div><div className="font-medium text-text-primary">{item.product.name}</div><div className="mt-1 text-xs font-mono text-text-muted">{formatCurrency(item.product.price)} por unidade</div></div><div className="font-mono text-sm text-brand-acid">{formatCurrency(item.product.price * item.qty)}</div></div><div className="mt-4 flex items-center gap-2"><button type="button" onClick={() => removeFromCart(item.product.id)} className="btn-secondary h-9 w-9 rounded-full px-0"><Minus className="h-4 w-4" /></button><div className="min-w-[2rem] text-center font-mono text-sm text-text-primary">{item.qty}</div><button type="button" onClick={() => addToCart(item.product)} className="btn-secondary h-9 w-9 rounded-full px-0"><Plus className="h-4 w-4" /></button></div></div>)}</div><div className="border-t border-bg-border px-5 py-5"><div className="flex items-center justify-between text-sm text-text-secondary"><span>{cartItemCount} item(s)</span><span className="font-mono text-xl font-bold text-brand-acid">{formatCurrency(cartTotal)}</span></div><div className="mt-4 grid grid-cols-3 gap-2">{['PIX', 'Credito', 'Debito'].map((method) => <button key={method} type="button" onClick={placeOrder} className="btn-secondary px-0 py-3 text-xs">{method}</button>)}</div><button type="button" onClick={placeOrder} className="btn-primary mt-4 w-full justify-center"><CheckCircle2 className="h-4 w-4" />Finalizar pedido</button></div></>}</div></div>
}

function CatalogPanel({ items, view, onEdit, onDelete }: { items: Product[]; view: 'grid' | 'list'; onEdit: (product: Product) => void; onDelete: (product: Product) => void }) {
  if (!items.length) return <div className="card px-6 py-16 text-center text-sm text-text-muted">Nenhum item cadastrado para este recorte.</div>
  if (view === 'grid') return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map((product) => { const category = CATEGORY_CONFIG[product.category]; const Icon = category.icon; return <div key={product.id} className={cn('card p-5', !product.is_active && 'opacity-55')}><div className="flex items-start justify-between gap-3"><div className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.03]', category.accent)}><Icon className="h-5 w-5" /></div><div className="flex items-center gap-2"><button type="button" onClick={() => onEdit(product)} className="btn-secondary h-9 w-9 rounded-full px-0"><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(product)} className="btn-secondary h-9 w-9 rounded-full px-0"><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-4 font-display text-[2rem] leading-none tracking-[-0.04em] text-text-primary">{product.name}</div><div className="mt-2 text-xs text-text-muted">{product.sku || 'Sem SKU'}</div><div className="mt-6 flex items-center justify-between"><div className="font-mono text-lg font-bold text-brand-acid">{formatCurrency(product.price)}</div><div className="text-xs text-text-secondary">{category.label}</div></div><div className="mt-4 text-xs leading-6 text-text-muted">{product.description || 'Item comercial pronto para venda no PDV.'}</div><div className="mt-5 flex items-center justify-between text-xs"><span className={cn('rounded-full px-3 py-1 font-semibold uppercase tracking-[0.18em]', product.is_active ? 'bg-status-success/12 text-status-success' : 'bg-white/8 text-text-muted')}>{product.is_active ? 'Ativo no PDV' : 'Pausado'}</span><span className="font-mono text-text-secondary">{formatNumber(product.stock_quantity)} un</span></div></div> })}</div>
  return <div className="card overflow-hidden"><table className="w-full"><thead className="border-b border-bg-border"><tr>{['Item', 'Categoria', 'Preco', 'Disponivel', 'Status', 'Acoes'].map((header) => <th key={header} className="table-header">{header}</th>)}</tr></thead><tbody>{items.map((product) => <tr key={product.id} className={cn('table-row', !product.is_active && 'opacity-55')}><td className="table-cell"><div className="font-medium text-text-primary">{product.name}</div><div className="mt-1 text-xs font-mono text-text-muted">{product.sku || 'Sem SKU'}</div></td><td className="table-cell text-text-secondary">{CATEGORY_CONFIG[product.category].label}</td><td className="table-cell font-mono text-brand-acid">{formatCurrency(product.price)}</td><td className="table-cell font-mono text-text-primary">{formatNumber(product.stock_quantity)}</td><td className="table-cell"><span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', product.is_active ? 'bg-status-success/12 text-status-success' : 'bg-white/8 text-text-muted')}>{product.is_active ? 'Ativo' : 'Pausado'}</span></td><td className="table-cell"><div className="flex items-center gap-2"><button type="button" onClick={() => onEdit(product)} className="btn-secondary h-9 w-9 rounded-full px-0"><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(product)} className="btn-secondary h-9 w-9 rounded-full px-0"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
}

function ProductFormModal({ organizationId, events, product, defaultEventId, onClose, onSaved }: { organizationId: string; events: EventItem[]; product: Product | null; defaultEventId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ProductForm>(product ? { name: product.name, sku: product.sku ?? '', description: product.description ?? '', category: product.category, price: String(product.price), cost_price: product.cost_price ? String(product.cost_price) : '', stock_quantity: String(product.stock_quantity), stock_alert_threshold: product.stock_alert_threshold ? String(product.stock_alert_threshold) : '' } : EMPTY_FORM)
  const [eventId, setEventId] = useState(product?.event_id ?? defaultEventId)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const setField = <K extends keyof ProductForm,>(field: K, value: ProductForm[K]) => setForm((current) => ({ ...current, [field]: value }))
  async function handleSave() {
    if (!form.name.trim()) return setError('Nome do item e obrigatorio.')
    if (!form.price || Number.isNaN(Number(form.price))) return setError('Preco invalido.')
    setSaving(true); setError('')
    const payload = { organization_id: organizationId, event_id: eventId || null, name: form.name.trim(), sku: form.sku || null, description: form.description || null, category: form.category, price: Number(form.price), cost_price: form.cost_price ? Number(form.cost_price) : null, stock_quantity: Number(form.stock_quantity || 0), stock_alert_threshold: form.stock_alert_threshold ? Number(form.stock_alert_threshold) : null, is_active: isActive }
    const { error: saveError } = product ? await supabase.from('products').update(payload).eq('id', product.id) : await supabase.from('products').insert(payload)
    if (saveError) { setError(saveError.message); setSaving(false); return }
    onSaved()
  }
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(7,6,7,0.76)] p-4 backdrop-blur-md"><div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/8 bg-[#12100f] shadow-[0_30px_120px_rgba(0,0,0,0.62)]"><div className="flex items-start justify-between border-b border-white/6 px-6 py-5"><div><div className="text-[10px] uppercase tracking-[0.34em] text-[#0057E7]">Catalogo comercial</div><div className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.04em] text-text-primary">{product ? 'Editar item.' : 'Novo item.'}</div><p className="mt-3 text-sm leading-6 text-text-muted">Cadastre o item para venda. Saldo e threshold existem para apoio, mas a leitura operacional profunda sai para Estoque.</p></div><button type="button" onClick={onClose} className="btn-secondary h-10 w-10 rounded-full px-0"><X className="h-4 w-4" /></button></div><div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><label className="input-label">Nome do item</label><input className="input" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ex: Combo premium, agua, camiseta" /></div><div><label className="input-label">SKU</label><input className="input" value={form.sku} onChange={(event) => setField('sku', event.target.value)} placeholder="Ex: PDV-001" /></div><div><label className="input-label">Categoria</label><select className="input" value={form.category} onChange={(event) => setField('category', event.target.value as ProductCategory)}>{Object.entries(CATEGORY_CONFIG).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}</select></div></div>{events.length ? <div><label className="input-label">Evento vinculado</label><select className="input" value={eventId} onChange={(event) => setEventId(event.target.value)}><option value="">Catalogo geral</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div> : null}<div className="grid gap-4 md:grid-cols-2"><div><label className="input-label">Preco de venda</label><input className="input" type="number" min={0} step={0.01} value={form.price} onChange={(event) => setField('price', event.target.value)} /></div><div><label className="input-label">Preco de custo</label><input className="input" type="number" min={0} step={0.01} value={form.cost_price} onChange={(event) => setField('cost_price', event.target.value)} /></div></div><div className="grid gap-4 md:grid-cols-2"><div><label className="input-label">Saldo inicial</label><input className="input" type="number" min={0} value={form.stock_quantity} onChange={(event) => setField('stock_quantity', event.target.value)} /></div><div><label className="input-label">Threshold de alerta</label><input className="input" type="number" min={0} value={form.stock_alert_threshold} onChange={(event) => setField('stock_alert_threshold', event.target.value)} /></div></div><div><label className="input-label">Descricao</label><textarea className="input min-h-[120px] resize-y" value={form.description} onChange={(event) => setField('description', event.target.value)} /></div></div><div className="space-y-4"><div className="card p-5"><div className="text-[11px] uppercase tracking-[0.32em] text-[#0057E7]">Checklist rapido</div><div className="mt-4 space-y-3 text-sm leading-6 text-text-secondary"><div>1. Nomeie o item de forma clara para o operador.</div><div>2. Defina o preco comercial.</div><div>3. Ative apenas se puder vender agora.</div></div></div><div className="card p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-text-primary">Disponivel no PDV</span><button type="button" onClick={() => setIsActive((current) => !current)} className={cn('relative h-7 w-14 rounded-full transition-all', isActive ? 'bg-brand-acid' : 'bg-white/10')}><span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', isActive ? 'left-8' : 'left-1')} /></button></div><div className="mt-3 text-xs leading-6 text-text-muted">Ativar coloca o item no PDV. Pausar remove do caixa sem apagar o cadastro.</div></div>{error ? <div className="rounded-[1.4rem] border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">{error}</div> : null}</div></div><div className="flex items-center justify-between border-t border-white/6 px-6 py-5"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="button" onClick={handleSave} disabled={saving} className="btn-primary min-w-[160px] justify-center">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? 'Salvando...' : product ? 'Salvar item' : 'Criar item'}</button></div></div></div>
}
