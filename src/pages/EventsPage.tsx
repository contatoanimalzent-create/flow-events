import { useState } from 'react'
import { CalendarDays, MapPin, Users, Plus, Search, Filter,
         MoreHorizontal, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader, Badge } from '@/components/ui/index'

/* ── Types ──────────────────────────────────────────────────────────────── */
type EventStatus = 'published' | 'draft' | 'ongoing' | 'finished' | 'cancelled'

interface Event {
  id: string
  name: string
  subtitle: string
  category: string
  status: EventStatus
  date: string
  time: string
  venue: string
  city: string
  capacity: number
  sold: number
  revenue: string
  cover: string   // gradient class
}

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_EVENTS: Event[] = [
  {
    id: '1', name: 'PULSE FESTIVAL', subtitle: 'O maior festival de eletrônica do Brasil',
    category: 'Música', status: 'published',
    date: '14 Jun 2025', time: '18:00', venue: 'Arena Prime', city: 'São Paulo, SP',
    capacity: 5000, sold: 3240, revenue: 'R$ 486.000',
    cover: 'from-purple-900/40 via-indigo-900/30 to-bg-card',
  },
  {
    id: '2', name: 'DEVFLOW CONF', subtitle: 'A conferência de developers do futuro',
    category: 'Tech', status: 'published',
    date: '22 Jun 2025', time: '09:00', venue: 'Centro de Convenções', city: 'Rio de Janeiro, RJ',
    capacity: 1200, sold: 980, revenue: 'R$ 284.200',
    cover: 'from-cyan-900/40 via-teal-900/30 to-bg-card',
  },
  {
    id: '3', name: 'URBAN CANVAS', subtitle: 'Arte urbana e instalações imersivas',
    category: 'Arte', status: 'draft',
    date: '5 Jul 2025', time: '14:00', venue: 'Galpão Cultural', city: 'Belo Horizonte, MG',
    capacity: 800, sold: 0, revenue: '—',
    cover: 'from-orange-900/40 via-red-900/30 to-bg-card',
  },
  {
    id: '4', name: 'RUN THE CITY', subtitle: 'Corrida noturna pelo centro histórico',
    category: 'Esportes', status: 'ongoing',
    date: '13 Jul 2025', time: '20:00', venue: 'Parque Ibirapuera', city: 'São Paulo, SP',
    capacity: 3000, sold: 2890, revenue: 'R$ 257.210',
    cover: 'from-green-900/40 via-emerald-900/30 to-bg-card',
  },
  {
    id: '5', name: 'SUMMIT NE', subtitle: 'Negócios e inovação no nordeste',
    category: 'Business', status: 'finished',
    date: '2 Mai 2025', time: '08:00', venue: 'Centro de Eventos', city: 'Fortaleza, CE',
    capacity: 600, sold: 600, revenue: 'R$ 180.000',
    cover: 'from-yellow-900/40 via-amber-900/30 to-bg-card',
  },
]

const STATUS_CONFIG: Record<EventStatus, { label: string; badge: string; dot: string }> = {
  published:  { label: 'Publicado',  badge: 'badge-teal',    dot: 'bg-brand-teal' },
  draft:      { label: 'Rascunho',   badge: 'badge-muted',   dot: 'bg-text-muted' },
  ongoing:    { label: 'Ao vivo',    badge: 'badge-acid',    dot: 'bg-brand-acid animate-pulse' },
  finished:   { label: 'Finalizado', badge: 'badge-info',    dot: 'bg-brand-blue' },
  cancelled:  { label: 'Cancelado',  badge: 'badge-error',   dot: 'bg-status-error' },
}

/* ── Component ──────────────────────────────────────────────────────────── */
export function EventsPage() {
  const [view, setView]     = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | EventStatus>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_EVENTS.filter(e => {
    const matchStatus = filter === 'all' || e.status === filter
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.city.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  /* ── Stats ── */
  const totalRevenue = 'R$ 1,2M'
  const totalSold    = MOCK_EVENTS.reduce((a, b) => a + b.sold, 0).toLocaleString('pt-BR')

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <PageHeader
        title="Eventos"
        subtitle={`${MOCK_EVENTS.length} eventos · ${totalSold} ingressos vendidos`}
        action={
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo evento
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 reveal">
        {[
          { label: 'Receita Total',     value: totalRevenue,                      change: '+18% vs mês anterior', up: true },
          { label: 'Ingressos Vendidos',value: totalSold,                          change: '+340 esta semana',      up: true },
          { label: 'Taxa de Ocupação',  value: '72%',                             change: 'média geral',           up: false },
          { label: 'Eventos Ativos',    value: MOCK_EVENTS.filter(e => e.status === 'published' || e.status === 'ongoing').length.toString(),
            change: `${MOCK_EVENTS.filter(e => e.status === 'ongoing').length} ao vivo agora`, up: true },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex flex-col gap-2 reveal" style={{ transitionDelay: `${i * 60}ms` }}>
            <span className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</span>
            <span className="text-2xl font-semibold text-text-primary font-display tracking-wide">{stat.value}</span>
            <span className={cn('text-xs font-medium', stat.up ? 'text-status-success' : 'text-text-muted')}>
              {stat.up ? '↑' : ''} {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 reveal">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            className="input pl-9 h-9 text-sm"
            placeholder="Buscar evento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          {(['all', 'published', 'ongoing', 'draft', 'finished'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150',
                filter === s
                  ? 'bg-brand-acid text-bg-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-bg-border'
              )}
            >
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center border border-bg-border rounded-sm overflow-hidden">
          {(['grid', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn('px-3 py-1.5 text-xs transition-all',
                view === v ? 'bg-brand-acid/15 text-brand-acid' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {v === 'grid' ? '⊞ Grid' : '☰ Lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Events — GRID */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Events — LIST */}
      {view === 'list' && (
        <div className="card overflow-hidden reveal">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Evento', 'Status', 'Data', 'Local', 'Vendidos', 'Receita', ''].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => (
                <tr key={event.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-text-primary text-sm">{event.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{event.category}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[event.status].dot)} />
                      <span className={cn('badge text-[11px]', STATUS_CONFIG[event.status].badge)}>
                        {STATUS_CONFIG[event.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-text-secondary">{event.date} · {event.time}</td>
                  <td className="table-cell text-text-secondary">{event.city}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-acid rounded-full"
                          style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">
                        {event.sold.toLocaleString('pt-BR')}/{event.capacity.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell font-medium text-brand-acid">{event.revenue}</td>
                  <td className="table-cell">
                    <button className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Event Card ─────────────────────────────────────────────────────────── */
function EventCard({ event, index }: { event: Event; index: number }) {
  const pct = Math.round((event.sold / event.capacity) * 100)
  const cfg = STATUS_CONFIG[event.status]

  return (
    <div
      className="card overflow-hidden group reveal"
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {/* Cover */}
      <div className={cn('h-36 bg-gradient-to-br relative overflow-hidden', event.cover)}>
        {/* Category tag */}
        <span className="absolute top-3 left-3 text-[10px] font-mono tracking-widest uppercase
                         text-brand-acid border border-brand-acid/30 px-2 py-1 rounded-sm bg-bg-primary/40 backdrop-blur-sm">
          {event.category}
        </span>
        {/* Status dot */}
        <span className="absolute top-3 right-3 flex items-center gap-1.5
                         bg-bg-primary/60 backdrop-blur-sm px-2 py-1 rounded-sm">
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          <span className="text-[10px] font-medium text-text-secondary">{cfg.label}</span>
        </span>

        {/* Display title over cover */}
        <div className="absolute bottom-0 left-0 right-0 p-3
                        bg-gradient-to-t from-bg-card via-bg-card/60 to-transparent">
          <h3 className="font-display text-2xl tracking-wide text-text-primary leading-none group-hover:text-brand-acid transition-colors duration-300">
            {event.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-text-muted truncate">{event.subtitle}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-brand-acid" />
            {event.date} · {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-acid" />
            {event.city}
          </span>
        </div>

        {/* Sales progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.sold.toLocaleString('pt-BR')} / {event.capacity.toLocaleString('pt-BR')}
            </span>
            <span className={cn('font-medium', pct > 80 ? 'text-status-warning' : 'text-brand-acid')}>
              {pct}%
            </span>
          </div>
          <div className="h-1 bg-bg-surface rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                pct > 90 ? 'bg-status-warning' : 'bg-brand-acid')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-bg-border">
          <span className="text-sm font-semibold text-brand-acid">{event.revenue}</span>
          <button className="btn-secondary text-xs py-1.5 px-3">
            Gerenciar →
          </button>
        </div>
      </div>
    </div>
  )
}