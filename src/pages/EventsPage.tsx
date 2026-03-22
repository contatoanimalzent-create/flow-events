import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { slugify, formatDate, formatNumber, formatCurrency, cn } from '@/lib/utils'
import {
  Plus, Search, MoreHorizontal, CalendarDays, MapPin, Users,
  Edit2, Copy, Trash2, Globe, ExternalLink,
  X, Loader2, ChevronRight, AlertCircle, Upload, ImageIcon, Video, Check,
} from 'lucide-react'
import { PageHeader, Badge } from '@/components/ui/index'

/* ── Unsplash curated image bank by category ────────────────── */
const UNSPLASH_BANK: Record<string, string[]> = {
  'Música':      ['1459749411175-04bf5292ceea','1501386761578-eac5c94b800a','1506157786151-b8491531f063','1429962714451-bb934ecdc4ec','1493225457124-a3eb161ffa5f'],
  'Festival':    ['1459749411175-04bf5292ceea','1492684223066-81342ee5ff30','1506157786151-b8491531f063','1429962714451-bb934ecdc4ec','1533174072545-7a4b6ad7a6c3'],
  'Tech':        ['1518770660439-4636190af475','1488590528505-98d2b5aba04b','1451187580459-43490279c0fa','1526374965328-7f61d4dc18c5','1504384308090-c894fdcc538d'],
  'Negócios':    ['1556761175-4b46a572b786','1515187029135-18ee286d815b','1542744173-8e7e53415bb0','1521737711867-e3b97375f902','1552664730-d307ca884978'],
  'Business':    ['1556761175-4b46a572b786','1515187029135-18ee286d815b','1542744173-8e7e53415bb0','1521737711867-e3b97375f902','1552664730-d307ca884978'],
  'Esportes':    ['1461896836934-ffe607ba8211','1541534741688-7078b3a9f92a','1517649763962-0c623066013b','1571019613454-1cb2f99b2d8b','1576458088116-29cbb4ba0e04'],
  'Gastronomia': ['1414235077428-338989a2e8c0','1504674900247-0877df9cc836','1482049016688-2d3e1b311543','1567620905732-2d1ec7ab7445','1540189549336-e8d99a6b7f47'],
  'Arte':        ['1478720568477-152d9b164e26','1513475382585-d06e58bcb0e0','1460661419201-fd4cecdf8a8b','1541961017774-22349e4a1262','1531913764164-f85c52e6e654'],
  'Educação':    ['1524178232363-1fb2b075b655','1503676260728-1c00da094a0b','1522202176988-66273c2fd55f','1434030216411-0b793f4b6173','1509062522246-3755977927d7'],
  'Congresso':   ['1540575467063-178a50c2df87','1515187029135-18ee286d815b','1511578314322-c7e1f6f7e8b6','1505373877841-8d25f7d46678','1552664730-d307ca884978'],
  'default':     ['1492684223066-81342ee5ff30','1459749411175-04bf5292ceea','1540575467063-178a50c2df87','1518770660439-4636190af475','1556761175-4b46a572b786'],
}

function getUnsplashImages(category: string): string[] {
  const imgs = UNSPLASH_BANK[category] ?? UNSPLASH_BANK['default']
  return imgs.map(id => `https://images.unsplash.com/photo-${id}?w=600&q=80&fit=crop`)
}

/* ── Types ──────────────────────────────────────────────────── */
type EventStatus = 'draft' | 'review' | 'published' | 'ongoing' | 'finished' | 'archived' | 'cancelled'

interface EventRow {
  id: string
  name: string
  slug: string
  subtitle?: string
  category?: string
  status: EventStatus
  starts_at: string
  ends_at?: string
  venue_name?: string
  venue_address?: Record<string, string>
  total_capacity?: number
  sold_tickets: number
  cover_url?: string
  created_at: string
}

interface EventFormData {
  name: string
  subtitle: string
  category: string
  short_description: string
  starts_at: string
  ends_at: string
  doors_open_at: string
  venue_name: string
  venue_street: string
  venue_city: string
  venue_state: string
  total_capacity: string
  age_rating: string
  dress_code: string
  is_online: boolean
  online_url: string
  cover_url: string
  video_url: string
}

const EMPTY_FORM: EventFormData = {
  name: '', subtitle: '', category: '', short_description: '',
  starts_at: '', ends_at: '', doors_open_at: '',
  venue_name: '', venue_street: '', venue_city: '', venue_state: '',
  total_capacity: '', age_rating: 'livre', dress_code: '', is_online: false, online_url: '',
  cover_url: '', video_url: '',
}

const CATEGORIES = ['Música', 'Tech', 'Arte', 'Esportes', 'Business', 'Gastronomia', 'Moda', 'Educação', 'Outro']
const AGE_RATINGS = ['livre', '10', '12', '14', '16', '18']

const STATUS_CONFIG: Record<EventStatus, { label: string; dot: string; text: string }> = {
  draft:     { label: 'Rascunho',    dot: 'bg-text-muted',        text: 'text-text-muted' },
  review:    { label: 'Em revisão',  dot: 'bg-status-warning',    text: 'text-status-warning' },
  published: { label: 'Publicado',   dot: 'bg-status-success',    text: 'text-status-success' },
  ongoing:   { label: 'Ao vivo',     dot: 'bg-brand-acid animate-pulse', text: 'text-brand-acid' },
  finished:  { label: 'Finalizado',  dot: 'bg-brand-blue',        text: 'text-brand-blue' },
  archived:  { label: 'Arquivado',   dot: 'bg-bg-border',         text: 'text-text-muted' },
  cancelled: { label: 'Cancelado',   dot: 'bg-status-error',      text: 'text-status-error' },
}

/* ── Main ───────────────────────────────────────────────────── */
export function EventsPage() {
  const { organization } = useAuthStore()
  const [events, setEvents]       = useState<EventRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<'all' | EventStatus>('all')
  const [view, setView]           = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuId, setMenuId]       = useState<string | null>(null)

  useEffect(() => { if (organization) fetchEvents() }, [organization])

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('id,name,slug,subtitle,category,status,starts_at,ends_at,venue_name,venue_address,total_capacity,sold_tickets,cover_url,created_at')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }

  const filtered = events.filter(e => {
    const matchStatus = filter === 'all' || e.status === filter
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.venue_address?.city ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const statsBar = [
    { label: 'Total', value: events.length },
    { label: 'Publicados', value: events.filter(e => e.status === 'published').length },
    { label: 'Ao vivo', value: events.filter(e => e.status === 'ongoing').length },
    { label: 'Ingressos', value: formatNumber(events.reduce((s, e) => s + e.sold_tickets, 0)) },
  ]

  async function handlePublish(id: string, current: EventStatus) {
    const newStatus = current === 'published' ? 'draft' : 'published'
    await supabase.from('events').update({ status: newStatus }).eq('id', id)
    fetchEvents()
    setMenuId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents()
    setMenuId(null)
  }

  async function handleDuplicate(event: EventRow) {
    const { data: newEvent } = await supabase.from('events').insert({
      organization_id: organization!.id,
      name: `${event.name} (cópia)`,
      slug: `${event.slug}-copia-${Date.now()}`,
      subtitle: event.subtitle,
      category: event.category,
      status: 'draft',
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      total_capacity: event.total_capacity,
    }).select().single()
    if (newEvent) fetchEvents()
    setMenuId(null)
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto" onClick={() => setMenuId(null)}>

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            EVENTOS<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            {events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo evento
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 reveal" style={{ animationDelay: '40ms' }}>
        {statsBar.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted">{s.label}</div>
            <div className="text-2xl font-semibold text-text-primary mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 reveal" style={{ animationDelay: '80ms' }}>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar evento..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'published', 'ongoing', 'draft', 'finished'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                filter === s ? 'bg-brand-acid text-bg-primary' :
                'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-bg-border')}>
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s as EventStatus].label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center border border-bg-border rounded-sm overflow-hidden">
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-3 py-1.5 text-xs transition-all',
                view === v ? 'bg-brand-acid/15 text-brand-acid' : 'text-text-muted hover:text-text-primary')}>
              {v === 'grid' ? '⊞ Grid' : '☰ Lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-36 bg-bg-surface" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-bg-surface rounded-sm w-3/4" />
                <div className="h-3 bg-bg-surface rounded-sm w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">
            {search || filter !== 'all' ? 'NENHUM RESULTADO' : 'NENHUM EVENTO'}
          </div>
          <p className="text-sm text-text-muted mb-5">
            {search || filter !== 'all' ? 'Tente outros filtros' : 'Crie seu primeiro evento para começar'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">+ Criar evento</button>
          )}
        </div>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i}
              menuOpen={menuId === event.id}
              onMenu={e => { e.stopPropagation(); setMenuId(menuId === event.id ? null : event.id) }}
              onEdit={() => { setEditingId(event.id); setShowForm(true); setMenuId(null) }}
              onPublish={() => handlePublish(event.id, event.status)}
              onDuplicate={() => handleDuplicate(event)}
              onDelete={() => handleDelete(event.id)}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && filtered.length > 0 && view === 'list' && (
        <div className="card overflow-hidden reveal">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Evento', 'Status', 'Data', 'Local', 'Ocupação', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const cfg = STATUS_CONFIG[event.status]
                const pct = event.total_capacity ? Math.round((event.sold_tickets / event.total_capacity) * 100) : 0
                return (
                  <tr key={event.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-display text-sm tracking-wide">{event.name}</div>
                      <div className="text-[11px] text-text-muted">{event.category}</div>
                    </td>
                    <td className="table-cell">
                      <span className={cn('flex items-center gap-1.5 text-xs', cfg.text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="table-cell text-text-secondary text-xs font-mono">
                      {formatDate(event.starts_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="table-cell text-text-secondary text-xs">
                      {event.venue_address?.city ?? event.venue_name ?? '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-brand-acid rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-text-muted">{pct}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(event.id); setShowForm(true) }}
                          className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDuplicate(event)}
                          className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(event.id)}
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

      {/* Form modal */}
      {showForm && (
        <EventFormModal
          eventId={editingId}
          organizationId={organization!.id}
          onClose={() => { setShowForm(false); setEditingId(null) }}
          onSaved={() => { fetchEvents(); setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

/* ── Event Card ─────────────────────────────────────────────── */
function EventCard({ event, index, menuOpen, onMenu, onEdit, onPublish, onDuplicate, onDelete }: {
  event: EventRow
  index: number
  menuOpen: boolean
  onMenu: (e: React.MouseEvent) => void
  onEdit: () => void
  onPublish: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const cfg = STATUS_CONFIG[event.status]
  const pct = event.total_capacity ? Math.round((event.sold_tickets / event.total_capacity) * 100) : 0

  const COVER_GRADIENTS = [
    'from-purple-900/50 via-indigo-900/30 to-bg-card',
    'from-cyan-900/50 via-teal-900/30 to-bg-card',
    'from-orange-900/50 via-red-900/30 to-bg-card',
    'from-green-900/50 via-emerald-900/30 to-bg-card',
    'from-yellow-900/50 via-amber-900/30 to-bg-card',
    'from-pink-900/50 via-rose-900/30 to-bg-card',
  ]
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length]

  return (
    <div className="card overflow-hidden group reveal" style={{ animationDelay: `${index * 60}ms` }}>
      {/* Cover */}
      <div className={cn('h-36 bg-gradient-to-br relative overflow-hidden', gradient)}>
        {event.cover_url && (
          <img src={event.cover_url} alt={event.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        {/* Category */}
        <span className="absolute top-3 left-3 text-[10px] font-mono tracking-widest uppercase
                         text-brand-acid border border-brand-acid/30 px-2 py-1 rounded-sm bg-bg-primary/50 backdrop-blur-sm">
          {event.category ?? 'Evento'}
        </span>
        {/* Status */}
        <span className={cn('absolute top-3 right-3 flex items-center gap-1.5',
          'bg-bg-primary/60 backdrop-blur-sm px-2 py-1 rounded-sm text-[10px] font-medium', cfg.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3
                        bg-gradient-to-t from-bg-card via-bg-card/70 to-transparent">
          <h3 className="font-display text-2xl tracking-wide text-text-primary leading-none
                         group-hover:text-brand-acid transition-colors duration-300">
            {event.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {event.subtitle && <p className="text-xs text-text-muted truncate">{event.subtitle}</p>}

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-brand-acid" />
            {formatDate(event.starts_at, 'dd/MM/yyyy')}
          </span>
          {(event.venue_address?.city || event.venue_name) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-acid" />
              {event.venue_address?.city ?? event.venue_name}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-text-muted">
              <Users className="w-3 h-3" />
              {formatNumber(event.sold_tickets)}
              {event.total_capacity ? ` / ${formatNumber(event.total_capacity)}` : ''}
            </span>
            <span className={cn('font-mono font-medium', pct > 85 ? 'text-status-warning' : 'text-brand-acid')}>
              {pct}%
            </span>
          </div>
          <div className="h-px bg-bg-surface rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-700',
              pct > 90 ? 'bg-status-warning' : 'bg-brand-acid')}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-bg-border relative">
          <button onClick={onEdit}
            className="text-xs text-text-muted hover:text-brand-acid transition-colors flex items-center gap-1">
            <Edit2 className="w-3 h-3" /> Editar
          </button>

          <div className="flex items-center gap-1">
            {event.status === 'published' || event.status === 'ongoing' ? (
              <a href={`/e/${event.slug}`} target="_blank"
                className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
            <button onClick={onMenu}
              className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute bottom-8 right-0 w-44 bg-bg-card border border-bg-border rounded-sm shadow-card z-50 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <button onClick={onEdit}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={onPublish}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
                <Globe className="w-3.5 h-3.5" />
                {event.status === 'published' ? 'Despublicar' : 'Publicar'}
              </button>
              <button onClick={onDuplicate}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
                <Copy className="w-3.5 h-3.5" /> Duplicar
              </button>
              <div className="border-t border-bg-border" />
              <button onClick={onDelete}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-status-error hover:bg-status-error/8 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Event Form Modal ───────────────────────────────────────── */
function EventFormModal({ eventId, organizationId, onClose, onSaved }: {
  eventId: string | null
  organizationId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm]       = useState<EventFormData>(EMPTY_FORM)
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const TOTAL_STEPS = 4
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (eventId) {
      setLoading(true)
      supabase.from('events').select('*').eq('id', eventId).single().then(({ data }) => {
        if (data) {
          setForm({
            name:              data.name ?? '',
            subtitle:          data.subtitle ?? '',
            category:          data.category ?? '',
            short_description: data.short_description ?? '',
            starts_at:         data.starts_at ? data.starts_at.slice(0, 16) : '',
            ends_at:           data.ends_at ? data.ends_at.slice(0, 16) : '',
            doors_open_at:     data.doors_open_at ? data.doors_open_at.slice(0, 16) : '',
            venue_name:        data.venue_name ?? '',
            venue_street:      data.venue_address?.street ?? '',
            venue_city:        data.venue_address?.city ?? '',
            venue_state:       data.venue_address?.state ?? '',
            total_capacity:    data.total_capacity?.toString() ?? '',
            age_rating:        data.age_rating ?? 'livre',
            dress_code:        data.dress_code ?? '',
            is_online:         data.is_online ?? false,
            online_url:        data.online_url ?? '',
            cover_url:         data.cover_url ?? '',
            video_url:         data.settings?.video_url ?? '',
          })
        }
        setLoading(false)
      })
    }
  }, [eventId])

  const set = (k: keyof EventFormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  async function handleUpload(file: File) {
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${organizationId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('event-covers').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(data.path)
      set('cover_url', publicUrl)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Nome do evento é obrigatório'); return }
    if (!form.starts_at)   { setError('Data de início é obrigatória'); return }
    setSaving(true)
    setError('')

    const payload = {
      name:              form.name.trim(),
      slug:              slugify(form.name),
      subtitle:          form.subtitle || null,
      category:          form.category || null,
      short_description: form.short_description || null,
      starts_at:         form.starts_at,
      ends_at:           form.ends_at || null,
      doors_open_at:     form.doors_open_at || null,
      venue_name:        form.venue_name || null,
      venue_address:     (form.venue_city || form.venue_street) ? {
        street: form.venue_street,
        city:   form.venue_city,
        state:  form.venue_state,
        country: 'Brasil',
      } : null,
      total_capacity:    form.total_capacity ? parseInt(form.total_capacity) : null,
      age_rating:        form.age_rating,
      dress_code:        form.dress_code || null,
      is_online:         form.is_online,
      online_url:        form.is_online ? form.online_url : null,
      cover_url:         form.cover_url || null,
      settings:          form.video_url ? { video_url: form.video_url } : null,
    }

    if (eventId) {
      const { error: err } = await supabase.from('events').update(payload).eq('id', eventId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('events').insert({
        ...payload,
        organization_id: organizationId,
        status: 'draft',
      })
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-sm overflow-hidden shadow-card animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <div>
            <h2 className="font-display text-xl tracking-wide text-text-primary leading-none">
              {eventId ? 'EDITAR EVENTO' : 'NOVO EVENTO'}<span className="text-brand-acid">.</span>
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5 font-mono">
              Etapa {step} de {TOTAL_STEPS}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div key={i} className={cn('h-0.5 flex-1 transition-all duration-300',
              i < step ? 'bg-brand-acid' : 'bg-bg-border')} />
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

            {/* Step 1: Informações básicas */}
            {step === 1 && (
              <>
                <div>
                  <label className="input-label">Nome do evento *</label>
                  <input className="input" placeholder="ex: PULSE FESTIVAL 2025"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Subtítulo</label>
                  <input className="input" placeholder="Uma frase que descreve o evento"
                    value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Categoria</label>
                    <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">Selecionar...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Classificação etária</label>
                    <select className="input" value={form.age_rating} onChange={e => set('age_rating', e.target.value)}>
                      {AGE_RATINGS.map(r => (
                        <option key={r} value={r}>{r === 'livre' ? 'Livre' : `${r} anos`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Descrição curta</label>
                  <textarea className="input resize-none" rows={3}
                    placeholder="Um resumo atrativo do evento..."
                    value={form.short_description} onChange={e => set('short_description', e.target.value)} />
                </div>
              </>
            )}

            {/* Step 2: Data e local */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Início *</label>
                    <input type="datetime-local" className="input"
                      value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Término</label>
                    <input type="datetime-local" className="input"
                      value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="input-label">Abertura de portas</label>
                  <input type="datetime-local" className="input"
                    value={form.doors_open_at} onChange={e => set('doors_open_at', e.target.value)} />
                </div>

                {/* Online toggle */}
                <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-sm border border-bg-border">
                  <button onClick={() => set('is_online', !form.is_online)}
                    className={cn('w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0',
                      form.is_online ? 'bg-brand-acid' : 'bg-bg-border')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200',
                      form.is_online ? 'left-4' : 'left-0.5')} />
                  </button>
                  <span className="text-sm text-text-secondary">Evento online</span>
                </div>

                {form.is_online ? (
                  <div>
                    <label className="input-label">URL do evento online</label>
                    <input className="input" placeholder="https://..."
                      value={form.online_url} onChange={e => set('online_url', e.target.value)} />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="input-label">Nome do local</label>
                      <input className="input" placeholder="ex: Arena XP"
                        value={form.venue_name} onChange={e => set('venue_name', e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Endereço</label>
                      <input className="input" placeholder="Rua, número"
                        value={form.venue_street} onChange={e => set('venue_street', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="input-label">Cidade</label>
                        <input className="input" placeholder="São Paulo"
                          value={form.venue_city} onChange={e => set('venue_city', e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">Estado</label>
                        <input className="input" placeholder="SP"
                          value={form.venue_state} onChange={e => set('venue_state', e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 3: Capacidade e detalhes */}
            {step === 3 && (
              <>
                <div>
                  <label className="input-label">Capacidade total</label>
                  <input type="number" className="input" placeholder="ex: 5000"
                    value={form.total_capacity} onChange={e => set('total_capacity', e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Dress code</label>
                  <input className="input" placeholder="ex: Esporte fino, Casual, Traje de gala..."
                    value={form.dress_code} onChange={e => set('dress_code', e.target.value)} />
                </div>
                <div className="p-4 bg-bg-surface rounded-sm border border-bg-border space-y-2">
                  <div className="text-xs font-mono text-text-muted">RESUMO</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Nome</span>
                      <span className="text-text-primary font-medium">{form.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Início</span>
                      <span className="text-text-primary font-mono text-xs">{form.starts_at ? formatDate(form.starts_at, 'dd/MM/yyyy HH:mm') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Local</span>
                      <span className="text-text-primary">{form.venue_city || (form.is_online ? 'Online' : '—')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Capacidade</span>
                      <span className="text-text-primary">{form.total_capacity ? formatNumber(parseInt(form.total_capacity)) : '—'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Mídia */}
            {step === 4 && (
              <>
                {/* Current cover preview */}
                {form.cover_url && (
                  <div className="relative rounded-sm overflow-hidden h-36">
                    <img src={form.cover_url} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-bg-primary/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <button onClick={() => set('cover_url', '')}
                        className="bg-status-error/90 text-white px-3 py-1.5 rounded-sm text-xs font-medium">
                        Remover
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 text-[10px] font-mono bg-bg-primary/80 text-brand-acid px-2 py-1 rounded-sm">
                      CAPA ATUAL
                    </span>
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <label className="input-label flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Foto de capa</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-bg-border hover:border-brand-acid/40 rounded-sm p-6 flex flex-col items-center gap-2 transition-all group">
                    {uploading
                      ? <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
                      : <Upload className="w-6 h-6 text-text-muted group-hover:text-brand-acid transition-colors" />}
                    <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
                      {uploading ? 'Enviando...' : 'Clique para enviar uma imagem (JPG, PNG, WebP)'}
                    </span>
                  </button>
                </div>

                {/* Unsplash image bank */}
                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" /> Ou escolha do banco de imagens
                    <span className="text-text-muted font-normal normal-case">— categoria: {form.category || 'geral'}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getUnsplashImages(form.category).map((url, i) => (
                      <button key={i} onClick={() => set('cover_url', url)}
                        className={cn('relative aspect-video rounded-sm overflow-hidden border-2 transition-all',
                          form.cover_url === url ? 'border-brand-acid' : 'border-transparent hover:border-brand-acid/40')}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {form.cover_url === url && (
                          <div className="absolute inset-0 bg-brand-acid/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-brand-acid" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1.5 font-mono">Imagens via Unsplash · uso gratuito</p>
                </div>

                {/* Video URL */}
                <div>
                  <label className="input-label flex items-center gap-1.5"><Video className="w-3 h-3" /> Vídeo de fundo (opcional)</label>
                  <input className="input" placeholder="URL do vídeo (MP4, WebM ou YouTube embed)"
                    value={form.video_url} onChange={e => set('video_url', e.target.value)} />
                  <p className="text-[10px] text-text-muted mt-1 font-mono">O vídeo toca em loop no hero da página pública do evento</p>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="btn-secondary text-sm">
            {step > 1 ? '← Voltar' : 'Cancelar'}
          </button>
          {step < TOTAL_STEPS ? (
            <button onClick={() => {
              if (step === 1 && !form.name.trim()) { setError('Nome é obrigatório'); return }
              setError('')
              setStep(step + 1)
            }} className="btn-primary flex items-center gap-2 text-sm">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm min-w-[120px] justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (eventId ? '✓ Salvar' : '✓ Criar evento')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}