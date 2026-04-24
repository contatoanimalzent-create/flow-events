import { useState } from 'react'
import {
  ArrowUpRight, DollarSign, Package, Plus, RefreshCw,
  Sparkles, Star, TrendingUp, Users, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { cn, formatCurrency } from '@/shared/lib'

type Tab = 'ofertas' | 'compras' | 'premium' | 'ativacoes'

const MOCK_OFFERS = [
  { id: '1', name: 'Upgrade VIP', type: 'upgrade', price: 150, inventory: 50, sold: 32, status: 'active', conversion: 8.4 },
  { id: '2', name: 'Acesso Backstage', type: 'backstage', price: 300, inventory: 20, sold: 11, status: 'active', conversion: 5.2 },
  { id: '3', name: 'Meet & Greet', type: 'experience', price: 500, inventory: 10, sold: 7, status: 'active', conversion: 3.1 },
  { id: '4', name: 'Mesa Premium', type: 'table', price: 800, inventory: 5, sold: 3, status: 'active', conversion: 1.8 },
  { id: '5', name: 'Networking Pass', type: 'networking', price: 80, inventory: 100, sold: 41, status: 'active', conversion: 12.3 },
]

const MOCK_PURCHASES = [
  { id: '1', buyer: 'Ana Lima', offer: 'Upgrade VIP', price: 150, at: '22 min', status: 'confirmed' },
  { id: '2', buyer: 'Carlos Melo', offer: 'Meet & Greet', price: 500, at: '45 min', status: 'confirmed' },
  { id: '3', buyer: 'Julia Rosa', offer: 'Networking Pass', price: 80, at: '1h 12min', status: 'confirmed' },
  { id: '4', buyer: 'Pedro Silva', offer: 'Acesso Backstage', price: 300, at: '2h', status: 'pending' },
]

const MOCK_ACTIVATIONS = [
  { id: '1', name: 'Totem Marca X', type: 'sponsor', sponsor: 'Marca X', zone: 'Pista Principal', status: 'active' },
  { id: '2', name: 'Espaço Instagramável', type: 'experience', sponsor: null, zone: 'Área VIP', status: 'active' },
  { id: '3', name: 'Bar Patrocinado', type: 'sponsor', sponsor: 'Cerveja Y', zone: 'Bar & Alimentação', status: 'scheduled' },
]

const offerTypeColors: Record<string, string> = {
  upgrade: 'text-brand-blue',
  backstage: 'text-brand-purple',
  experience: 'text-status-warning',
  table: 'text-status-success',
  networking: 'text-brand-sky',
}

export function MonetizationPageContent() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<Tab>('ofertas')
  const [showNewOffer, setShowNewOffer] = useState(false)

  if (!organization) return null

  const totalRevenue = MOCK_OFFERS.reduce((s, o) => s + o.price * o.sold, 0)
  const totalSold = MOCK_OFFERS.reduce((s, o) => s + o.sold, 0)

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
          <button className="btn-secondary flex items-center gap-2 text-xs">
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
          { label: 'Ticket médio', value: formatCurrency(totalRevenue / totalSold), icon: Star, color: 'text-status-warning' },
          { label: 'Ofertas ativas', value: String(MOCK_OFFERS.length), icon: Sparkles, color: 'text-brand-purple' },
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

      {/* Ofertas */}
      {tab === 'ofertas' && (
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
                {MOCK_OFFERS.map((offer) => (
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
                    <td className="px-5 py-4 font-mono text-xs text-status-success">{formatCurrency(offer.price * offer.sold)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(offer.conversion * 5, 100)}%` }} />
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
        </div>
      )}

      {/* Compras */}
      {tab === 'compras' && (
        <div className="space-y-4">
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
                {MOCK_PURCHASES.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px] font-bold text-brand-blue">
                          {p.buyer.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-text-primary">{p.buyer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-secondary">{p.offer}</td>
                    <td className="px-5 py-4 font-mono text-xs text-status-success">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4 text-xs text-text-muted">{p.at} atrás</td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
                        p.status === 'confirmed' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning',
                      )}>
                        {p.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Networking Premium */}
      {tab === 'premium' && (
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
      {tab === 'ativacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">{MOCK_ACTIVATIONS.length} ativações configuradas</div>
            <button className="btn-primary flex items-center gap-2 text-xs">
              <Plus className="h-3.5 w-3.5" /> Nova ativação
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MOCK_ACTIVATIONS.map((act) => (
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
        </div>
      )}
    </div>
  )
}
