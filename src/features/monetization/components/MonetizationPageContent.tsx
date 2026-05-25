import { useState, useEffect, useCallback } from 'react'
import {
  ArrowUpRight, DollarSign, Plus, RefreshCw,
  Sparkles, Star, TrendingUp, Users, Zap, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/shared/lib'

type Tab = 'ofertas' | 'compras' | 'premium' | 'ativacoes'

interface Offer {
  id: string
  name: string
  type: string
  price: number
  inventory: number
  sold: number
  revenue: number
  status: string
  conversion: number
}

interface Purchase {
  id: string
  buyer: string
  offer: string
  price: number
  at: string
  status: string
}

interface Activation {
  id: string
  name: string
  type: string
  sponsor: string | null
  zone: string
  status: string
}

interface EventOption {
  id: string
  name: string
}

const offerTypeColors: Record<string, string> = {
  upgrade: 'text-brand-blue',
  backstage: 'text-brand-purple',
  experience: 'text-status-warning',
  table: 'text-status-success',
  networking: 'text-brand-sky',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d`
}

export function MonetizationPageContent() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<Tab>('ofertas')
  const [showNewOffer, setShowNewOffer] = useState(false)

  // ── Real data state ──────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [activations, setActivations] = useState<Activation[]>([])
  const [activationsEmpty, setActivationsEmpty] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Fetch events ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!organization) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('events')
          .select('id, name')
          .eq('organization_id', organization.id)
          .order('starts_at', { ascending: false })
          .limit(50)
        if (!cancelled && data && data.length > 0) {
          setEvents(data)
          setSelectedEventId((prev) => prev ?? data[0].id)
        }
      } catch {
        // table may not exist
      }
    })()
    return () => { cancelled = true }
  }, [organization])

  // ── Fetch monetization data ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!selectedEventId || !organization) return
    setLoading(true)

    // 1. Offers — ticket_types with batches
    try {
      const { data } = await supabase
        .from('ticket_types')
        .select('id, name, description, sector, ticket_batches(price, sold_count, quantity)')
        .eq('event_id', selectedEventId)
        .eq('is_active', true)

      if (data) {
        setOffers(
          (data as any[]).map((tt) => {
            const batches = tt.ticket_batches ?? []
            const totalSold = batches.reduce((s: number, b: any) => s + (b.sold_count ?? 0), 0)
            const totalInventory = batches.reduce((s: number, b: any) => s + (b.quantity ?? 0), 0)
            const avgPrice = batches.length > 0
              ? batches.reduce((s: number, b: any) => s + (b.price ?? 0), 0) / batches.length
              : 0
            const revenue = batches.reduce((s: number, b: any) => s + (b.price ?? 0) * (b.sold_count ?? 0), 0)
            const conversion = totalInventory > 0 ? ((totalSold / totalInventory) * 100) : 0
            return {
              id: tt.id,
              name: tt.name,
              type: tt.sector ?? tt.description?.toLowerCase()?.includes('vip') ? 'upgrade' : 'experience',
              price: avgPrice,
              inventory: totalInventory,
              sold: totalSold,
              revenue,
              status: 'active',
              conversion: Math.round(conversion * 10) / 10,
            }
          }),
        )
      } else {
        setOffers([])
      }
    } catch {
      setOffers([])
    }

    // 2. Purchases — orders with items
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, buyer_name, buyer_email, total_amount, status, created_at, order_items(ticket_type_id, ticket_types:ticket_type_id(name))')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setPurchases(
          (data as any[]).map((o) => {
            const items = o.order_items ?? []
            const firstItem = items[0]
            const ticketName = firstItem?.ticket_types?.name ?? 'Ingresso'
            return {
              id: o.id,
              buyer: o.buyer_name ?? o.buyer_email ?? 'Comprador',
              offer: ticketName,
              price: o.total_amount ?? 0,
              at: formatRelativeTime(o.created_at),
              status: o.status === 'paid' || o.status === 'confirmed' ? 'confirmed' : o.status ?? 'pending',
            }
          }),
        )
      } else {
        setPurchases([])
      }
    } catch {
      setPurchases([])
    }

    // 3. Activations — try sponsors table
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('id, company_name, tier, status, notes')
        .eq('event_id', selectedEventId)
        .limit(20)

      if (error) {
        setActivationsEmpty(true)
        setActivations([])
      } else if (data && data.length > 0) {
        setActivationsEmpty(false)
        setActivations(
          (data as any[]).map((sp) => ({
            id: sp.id,
            name: sp.company_name ?? 'Patrocinador',
            type: 'sponsor',
            sponsor: sp.company_name ?? null,
            zone: sp.tier ?? 'Geral',
            status: sp.status === 'active' || sp.status === 'confirmed' ? 'active' : 'scheduled',
          })),
        )
      } else {
        setActivationsEmpty(false)
        setActivations([])
      }
    } catch {
      setActivationsEmpty(true)
      setActivations([])
    }

    setLoading(false)
  }, [selectedEventId, organization])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!organization) return null

  // ── KPIs from real data ──────────────────────────────────────────────────
  const totalRevenue = offers.reduce((s, o) => s + o.revenue, 0)
  const totalSold = offers.reduce((s, o) => s + o.sold, 0)
  const avgTicket = totalSold > 0 ? totalRevenue / totalSold : 0
  const activeOffers = offers.filter((o) => o.status === 'active').length

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Revenue expansion</div>
          <h1 className="admin-title">
            Monetização<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Upgrades, experiências premium, ativações e networking pago dentro do evento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {events.length > 1 && (
            <select
              className="input text-xs h-9 pr-8"
              value={selectedEventId ?? ''}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          )}
          <button onClick={() => fetchData()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button onClick={() => setShowNewOffer(true)} className="btn-primary flex items-center gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" /> Nova oferta
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Receita interna', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-status-success' },
          { label: 'Upgrades vendidos', value: String(totalSold), icon: TrendingUp, color: 'text-brand-blue' },
          { label: 'Ticket médio', value: formatCurrency(avgTicket), icon: Star, color: 'text-status-warning' },
          { label: 'Ofertas ativas', value: String(activeOffers), icon: Sparkles, color: 'text-brand-purple' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{kpi.label}</span>
              <kpi.icon className={cn('h-4 w-4', kpi.color)} />
            </div>
            <div className={cn('text-2xl font-bold font-mono', kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="surface-panel flex items-center gap-1 p-2">
        {([
          { key: 'ofertas', label: 'Experiências', icon: Sparkles },
          { key: 'compras', label: 'Compras', icon: DollarSign },
          { key: 'premium', label: 'Networking Premium', icon: Users },
          { key: 'ativacoes', label: 'Ativações', icon: Zap },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all',
              tab === t.key ? 'bg-brand-blue text-white' : 'text-text-muted hover:text-text-primary hover:bg-white/5',
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {/* Ofertas */}
      {!loading && tab === 'ofertas' && (
        <div className="space-y-4">
          {showNewOffer && (
            <div className="card p-5 space-y-4 border border-brand-blue/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">Nova oferta de experiência</h3>
                <button onClick={() => setShowNewOffer(false)} className="text-xs text-text-muted hover:text-text-primary">Cancelar</button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Nome da oferta', placeholder: 'Upgrade VIP' },
                  { label: 'Tipo', placeholder: 'upgrade, backstage...' },
                  { label: 'Préço (R$)', placeholder: '150.00' },
                  { label: 'Estoque', placeholder: '50' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="input-label">{f.label}</label>
                    <input className="input mt-1.5 w-full text-sm" placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
              <button className="btn-primary text-xs flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" /> Criar oferta
              </button>
            </div>
          )}

          {offers.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <Sparkles className="h-10 w-10 text-text-muted" />
              <div className="text-sm font-semibold text-text-secondary">Nenhuma oferta encontrada</div>
              <div className="text-xs text-text-muted max-w-sm">
                Crie tipos de ingresso com lotes para ver ofertas de experiência aqui.
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    {['Oferta', 'Tipo', 'Preço', 'Estoque', 'Vendido', 'Receita', 'Conversão', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-brand-blue shrink-0" />
                          <span className="font-medium text-text-primary">{offer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('text-xs font-medium capitalize', offerTypeColors[offer.type] ?? 'text-text-muted')}>{offer.type}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-text-primary">{formatCurrency(offer.price)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-text-muted">{offer.sold}/{offer.inventory}</td>
                      <td className="px-5 py-4 font-mono text-xs text-status-success">{offer.sold}</td>
                      <td className="px-5 py-4 font-mono text-xs text-status-success">{formatCurrency(offer.revenue)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(offer.conversion, 100)}%` }} />
                          </div>
                          <span className="text-xs font-mono text-text-muted">{offer.conversion}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-status-success/10 px-2.5 py-0.5 text-xs text-status-success">Ativa</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Compras */}
      {!loading && tab === 'compras' && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <DollarSign className="h-10 w-10 text-text-muted" />
              <div className="text-sm font-semibold text-text-secondary">Nenhuma compra recente</div>
              <div className="text-xs text-text-muted max-w-sm">
                As compras de ingressos e upgrades aparecerão aqui em tempo real.
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    {['Comprador', 'Oferta', 'Valor', 'Horário', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px] font-bold text-brand-blue">
                            {p.buyer.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-text-primary">{p.buyer}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-text-secondary">{p.offer}</td>
                      <td className="px-5 py-4 font-mono text-xs text-status-success">{formatCurrency(p.price)}</td>
                      <td className="px-5 py-4 text-xs text-text-muted">{p.at} atrás</td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
                          p.status === 'confirmed' || p.status === 'paid' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning',
                        )}>
                          {p.status === 'confirmed' || p.status === 'paid' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Networking Premium */}
      {!loading && tab === 'premium' && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <Users className="h-10 w-10 text-text-muted" />
          <div className="text-sm font-semibold text-text-secondary">Conexões premium</div>
          <div className="text-xs text-text-muted max-w-sm">
            Permita que participantes paguem para se conectar com palestrantes, artistas ou outros participantes VIP durante o evento.
          </div>
          <button className="btn-primary mt-2 text-xs flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Ativar networking premium
          </button>
        </div>
      )}

      {/* Ativações */}
      {!loading && tab === 'ativacoes' && (
        <div className="space-y-4">
          {activationsEmpty ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <Zap className="h-10 w-10 text-text-muted" />
              <div className="text-sm font-semibold text-text-secondary">Ativações de marca serão configuradas em breve</div>
              <div className="text-xs text-text-muted max-w-sm">
                O módulo de ativações de patrocinadores estará disponível em breve.
              </div>
            </div>
          ) : activations.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <Zap className="h-10 w-10 text-text-muted" />
              <div className="text-sm font-semibold text-text-secondary">Nenhuma ativação configurada</div>
              <div className="text-xs text-text-muted max-w-sm">
                Adicione patrocinadores ao evento para configurar ativações de marca.
              </div>
              <button className="btn-primary mt-2 text-xs flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" /> Nova ativação
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-muted">{activations.length} ativações configuradas</div>
                <button className="btn-primary flex items-center gap-2 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Nova ativação
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activations.map((act) => (
                  <div key={act.id} className="card p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{act.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{act.zone}</div>
                      </div>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                        act.status === 'active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning',
                      )}>
                        {act.status === 'active' ? 'Ativa' : 'Agendada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="capitalize">{act.type}</span>
                      {act.sponsor && <><span className="h-1 w-1 rounded-full bg-white/20" /><span>{act.sponsor}</span></>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 btn-secondary text-xs py-1.5">Editar</button>
                      <button className="btn-ghost p-1.5 text-text-muted"><ArrowUpRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
