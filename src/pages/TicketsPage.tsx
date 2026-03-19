import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatNumber, formatDate, cn } from '@/lib/utils'
import {
  Plus, Ticket, ChevronDown, ChevronUp, Edit2, Trash2,
  ToggleLeft, ToggleRight, GripVertical, Loader2, X,
  AlertCircle, ChevronRight, Package, ArrowUpDown,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
interface TicketType {
  id: string
  event_id: string
  name: string
  description?: string
  benefits?: string[]
  sector?: string
  color?: string
  is_transferable: boolean
  is_nominal: boolean
  max_per_order: number
  position: number
  is_active: boolean
  batches?: TicketBatch[]
}

interface TicketBatch {
  id: string
  ticket_type_id: string
  event_id: string
  name: string
  price: number
  quantity: number
  sold_count: number
  reserved_count: number
  starts_at?: string
  ends_at?: string
  auto_open_next: boolean
  is_active: boolean
  position: number
}

interface Event {
  id: string
  name: string
  status: string
}

/* ── Color options ──────────────────────────────────────────── */
const COLORS = [
  { value: '#d4ff00', label: 'Acid' },
  { value: '#5BE7C4', label: 'Teal' },
  { value: '#4BA3FF', label: 'Blue' },
  { value: '#8B7CFF', label: 'Purple' },
  { value: '#FF5A6B', label: 'Red' },
  { value: '#FFB020', label: 'Orange' },
  { value: '#f5f5f0', label: 'White' },
]

/* ── Main ───────────────────────────────────────────────────── */
export function TicketsPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [editingType, setEditingType] = useState<TicketType | null>(null)
  const [editingBatch, setEditingBatch] = useState<TicketBatch | null>(null)
  const [batchParentId, setBatchParentId] = useState<string>('')

  useEffect(() => { if (organization) fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) fetchTickets() }, [selectedEventId])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events').select('id,name,status')
      .eq('organization_id', organization!.id)
      .in('status', ['draft', 'published', 'ongoing'])
      .order('starts_at', { ascending: true })
    setEvents(data ?? [])
    if (data?.[0]) setSelectedEventId(data[0].id)
    else setLoading(false)
  }

  async function fetchTickets() {
    setLoading(true)
    const { data: types } = await supabase
      .from('ticket_types').select('*')
      .eq('event_id', selectedEventId)
      .order('position')

    const { data: batches } = await supabase
      .from('ticket_batches').select('*')
      .eq('event_id', selectedEventId)
      .order('position')

    const merged = (types ?? []).map(t => ({
      ...t,
      batches: (batches ?? []).filter(b => b.ticket_type_id === t.id),
    }))
    setTicketTypes(merged)
    setLoading(false)
  }

  async function toggleType(id: string, current: boolean) {
    await supabase.from('ticket_types').update({ is_active: !current }).eq('id', id)
    fetchTickets()
  }

  async function toggleBatch(id: string, current: boolean) {
    await supabase.from('ticket_batches').update({ is_active: !current }).eq('id', id)
    fetchTickets()
  }

  async function deleteType(id: string) {
    if (!confirm('Excluir este tipo de ingresso e todos os seus lotes?')) return
    await supabase.from('ticket_batches').delete().eq('ticket_type_id', id)
    await supabase.from('ticket_types').delete().eq('id', id)
    fetchTickets()
  }

  async function deleteBatch(id: string) {
    if (!confirm('Excluir este lote?')) return
    await supabase.from('ticket_batches').delete().eq('id', id)
    fetchTickets()
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const totalTickets = ticketTypes.reduce((s, t) => s + (t.batches?.reduce((bs, b) => bs + b.quantity, 0) ?? 0), 0)
  const totalSold = ticketTypes.reduce((s, t) => s + (t.batches?.reduce((bs, b) => bs + b.sold_count, 0) ?? 0), 0)
  const totalRevenue = ticketTypes.reduce((s, t) =>
    s + (t.batches?.reduce((bs, b) => bs + (b.price * b.sold_count), 0) ?? 0), 0)
  const activeBatches = ticketTypes.reduce((s, t) =>
    s + (t.batches?.filter(b => b.is_active).length ?? 0), 0)

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            INGRESSOS<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Tipos de ingresso e lotes de venda
          </p>
        </div>
        <button
          onClick={() => { setEditingType(null); setShowTypeForm(true) }}
          disabled={!selectedEventId}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo tipo
        </button>
      </div>

      {/* Event selector */}
      {events.length > 1 && (
        <div className="flex items-center gap-3 reveal">
          <span className="text-xs text-text-muted font-mono">EVENTO:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {events.map(e => (
              <button key={e.id} onClick={() => setSelectedEventId(e.id)}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  selectedEventId === e.id
                    ? 'bg-brand-acid text-bg-primary'
                    : 'border border-bg-border text-text-muted hover:text-text-primary hover:border-brand-acid/30')}>
                {e.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {selectedEventId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal">
          {[
            { label: 'Capacidade total', value: formatNumber(totalTickets), icon: Package },
            { label: 'Vendidos', value: formatNumber(totalSold), icon: Ticket },
            { label: 'Receita bruta', value: formatCurrency(totalRevenue), icon: ArrowUpDown },
            { label: 'Lotes ativos', value: activeBatches.toString(), icon: ToggleRight },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                  <Icon className="w-3.5 h-3.5 text-brand-acid" />
                </div>
                <div className="text-xl font-semibold text-text-primary">{s.value}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && events.length === 0 && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <Ticket className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM EVENTO</div>
          <p className="text-sm text-text-muted">Crie um evento primeiro para adicionar ingressos</p>
        </div>
      )}

      {!loading && events.length > 0 && ticketTypes.length === 0 && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <Ticket className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM TIPO DE INGRESSO</div>
          <p className="text-sm text-text-muted mb-5">Adicione tipos de ingresso para começar a vender</p>
          <button onClick={() => { setEditingType(null); setShowTypeForm(true) }} className="btn-primary">
            + Novo tipo de ingresso
          </button>
        </div>
      )}

      {/* Ticket types list */}
      {!loading && ticketTypes.length > 0 && (
        <div className="space-y-3">
          {ticketTypes.map((type, i) => (
            <TicketTypeCard
              key={type.id}
              type={type}
              index={i}
              expanded={expandedType === type.id}
              onToggleExpand={() => setExpandedType(expandedType === type.id ? null : type.id)}
              onEdit={() => { setEditingType(type); setShowTypeForm(true) }}
              onDelete={() => deleteType(type.id)}
              onToggleActive={() => toggleType(type.id, type.is_active)}
              onAddBatch={() => { setBatchParentId(type.id); setEditingBatch(null); setShowBatchForm(true) }}
              onEditBatch={(b) => { setEditingBatch(b); setBatchParentId(type.id); setShowBatchForm(true) }}
              onDeleteBatch={(id) => deleteBatch(id)}
              onToggleBatch={(id, active) => toggleBatch(id, active)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showTypeForm && (
        <TicketTypeModal
          eventId={selectedEventId}
          type={editingType}
          position={ticketTypes.length}
          onClose={() => { setShowTypeForm(false); setEditingType(null) }}
          onSaved={() => { fetchTickets(); setShowTypeForm(false); setEditingType(null) }}
        />
      )}

      {showBatchForm && (
        <BatchModal
          eventId={selectedEventId}
          ticketTypeId={batchParentId}
          batch={editingBatch}
          position={ticketTypes.find(t => t.id === batchParentId)?.batches?.length ?? 0}
          onClose={() => { setShowBatchForm(false); setEditingBatch(null) }}
          onSaved={() => { fetchTickets(); setShowBatchForm(false); setEditingBatch(null) }}
        />
      )}
    </div>
  )
}

/* ── Ticket Type Card ───────────────────────────────────────── */
function TicketTypeCard({ type, index, expanded, onToggleExpand, onEdit, onDelete,
  onToggleActive, onAddBatch, onEditBatch, onDeleteBatch, onToggleBatch }: {
  type: TicketType; index: number; expanded: boolean
  onToggleExpand: () => void; onEdit: () => void; onDelete: () => void
  onToggleActive: () => void; onAddBatch: () => void
  onEditBatch: (b: TicketBatch) => void; onDeleteBatch: (id: string) => void
  onToggleBatch: (id: string, active: boolean) => void
}) {
  const totalQty = type.batches?.reduce((s, b) => s + b.quantity, 0) ?? 0
  const totalSold = type.batches?.reduce((s, b) => s + b.sold_count, 0) ?? 0
  const activeBatch = type.batches?.find(b => b.is_active)
  const pct = totalQty > 0 ? Math.round((totalSold / totalQty) * 100) : 0

  return (
    <div className={cn('card overflow-hidden reveal transition-all duration-200',
      !type.is_active && 'opacity-60')}
      style={{ transitionDelay: `${index * 50}ms` }}>

      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <GripVertical className="w-4 h-4 text-text-muted shrink-0" />

        {/* Color dot */}
        <div className="w-3 h-3 rounded-full shrink-0"
          style={{ background: type.color ?? '#d4ff00' }} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-wide text-text-primary leading-none">
              {type.name}
            </span>
            {type.sector && (
              <span className="text-[10px] font-mono text-text-muted border border-bg-border px-1.5 py-0.5 rounded-sm">
                {type.sector}
              </span>
            )}
            {!type.is_active && (
              <span className="badge badge-muted text-[10px]">Inativo</span>
            )}
          </div>
          {type.description && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{type.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-xs shrink-0">
          <div className="text-center">
            <div className="font-mono text-text-primary font-medium">{formatNumber(totalSold)}/{formatNumber(totalQty)}</div>
            <div className="text-text-muted">vendidos</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-brand-acid font-medium">{pct}%</div>
            <div className="text-text-muted">ocupação</div>
          </div>
          {activeBatch && (
            <div className="text-center">
              <div className="font-mono text-text-primary font-medium">{formatCurrency(activeBatch.price)}</div>
              <div className="text-text-muted">lote atual</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-mono text-text-primary font-medium">{type.batches?.length ?? 0}</div>
            <div className="text-text-muted">lotes</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggleActive}
            className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
            {type.is_active ? <ToggleRight className="w-4 h-4 text-brand-acid" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={onEdit}
            className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggleExpand}
            className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px bg-bg-surface mx-4">
        <div className="h-full bg-brand-acid transition-all duration-700 rounded-full"
          style={{ width: `${pct}%` }} />
      </div>

      {/* Batches (expanded) */}
      {expanded && (
        <div className="p-4 pt-3 space-y-2 border-t border-bg-border mt-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Lotes de venda</span>
            <button onClick={onAddBatch}
              className="flex items-center gap-1.5 text-xs text-brand-acid hover:underline font-mono">
              <Plus className="w-3 h-3" /> Novo lote
            </button>
          </div>

          {(!type.batches || type.batches.length === 0) && (
            <div className="py-6 text-center text-xs text-text-muted">
              Nenhum lote criado ainda —{' '}
              <button onClick={onAddBatch} className="text-brand-acid hover:underline">criar primeiro lote</button>
            </div>
          )}

          {type.batches?.map((batch, bi) => (
            <BatchRow key={batch.id} batch={batch} index={bi}
              onEdit={() => onEditBatch(batch)}
              onDelete={() => onDeleteBatch(batch.id)}
              onToggle={() => onToggleBatch(batch.id, batch.is_active)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Batch Row ──────────────────────────────────────────────── */
function BatchRow({ batch, index, onEdit, onDelete, onToggle }: {
  batch: TicketBatch; index: number
  onEdit: () => void; onDelete: () => void; onToggle: () => void
}) {
  const pct = batch.quantity > 0 ? Math.round((batch.sold_count / batch.quantity) * 100) : 0
  const available = batch.quantity - batch.sold_count - batch.reserved_count

  return (
    <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-all',
      batch.is_active
        ? 'border-brand-acid/20 bg-brand-acid/3'
        : 'border-bg-border bg-bg-surface/50 opacity-60')}>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary">{batch.name}</span>
          {batch.is_active && (
            <span className="text-[9px] font-mono bg-brand-acid/15 text-brand-acid px-1.5 py-0.5 rounded-sm">ATIVO</span>
          )}
          {batch.auto_open_next && (
            <span className="text-[9px] font-mono bg-bg-border text-text-muted px-1.5 py-0.5 rounded-sm">AUTO</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-[11px] text-text-muted font-mono">
          <span className="text-brand-acid font-semibold">{formatCurrency(batch.price)}</span>
          <span>{formatNumber(batch.sold_count)}/{formatNumber(batch.quantity)} vendidos</span>
          <span className="text-status-success">{formatNumber(available)} disponíveis</span>
          {batch.ends_at && <span>até {formatDate(batch.ends_at, 'dd/MM HH:mm')}</span>}
        </div>
      </div>

      {/* Mini progress */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <div className="w-16 h-1 bg-bg-border rounded-full overflow-hidden">
          <div className="h-full bg-brand-acid rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-mono text-text-muted w-8">{pct}%</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onToggle}
          className="p-1 rounded-sm text-text-muted hover:text-brand-acid transition-all">
          {batch.is_active ? <ToggleRight className="w-3.5 h-3.5 text-brand-acid" /> : <ToggleLeft className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onEdit}
          className="p-1 rounded-sm text-text-muted hover:text-text-primary transition-all">
          <Edit2 className="w-3 h-3" />
        </button>
        <button onClick={onDelete}
          className="p-1 rounded-sm text-text-muted hover:text-status-error transition-all">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

/* ── Ticket Type Modal ──────────────────────────────────────── */
function TicketTypeModal({ eventId, type, position, onClose, onSaved }: {
  eventId: string; type: TicketType | null; position: number
  onClose: () => void; onSaved: () => void
}) {
  const [name, setName] = useState(type?.name ?? '')
  const [description, setDescription] = useState(type?.description ?? '')
  const [sector, setSector] = useState(type?.sector ?? '')
  const [color, setColor] = useState(type?.color ?? '#d4ff00')
  const [isNominal, setIsNominal] = useState(type?.is_nominal ?? true)
  const [isTransferable, setIsTransferable] = useState(type?.is_transferable ?? false)
  const [maxPerOrder, setMaxPerOrder] = useState(String(type?.max_per_order ?? 5))
  const [benefits, setBenefits] = useState((type?.benefits ?? []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true); setError('')
    const payload = {
      event_id: eventId,
      name: name.trim(),
      description: description || null,
      sector: sector || null,
      color,
      is_nominal: isNominal,
      is_transferable: isTransferable,
      max_per_order: parseInt(maxPerOrder) || 5,
      benefits: benefits.split('\n').map(b => b.trim()).filter(Boolean),
      position: type?.position ?? position,
    }
    if (type) {
      const { error: err } = await supabase.from('ticket_types').update(payload).eq('id', type.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('ticket_types').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl tracking-wide leading-none">
            {type ? 'EDITAR TIPO' : 'NOVO TIPO'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="input-label">Nome do ingresso *</label>
            <input className="input" placeholder="ex: VIP, Pista, Camarote..." value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="input-label">Descrição</label>
            <input className="input" placeholder="Descrição breve" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Setor / Área</label>
              <input className="input" placeholder="ex: Pista A, Setor Norte" value={sector} onChange={e => setSector(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Máx. por pedido</label>
              <input type="number" className="input" min={1} max={20} value={maxPerOrder} onChange={e => setMaxPerOrder(e.target.value)} />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="input-label">Cor identificadora</label>
            <div className="flex items-center gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={cn('w-7 h-7 rounded-sm transition-all', color === c.value && 'ring-2 ring-offset-2 ring-offset-bg-card ring-brand-acid scale-110')}
                  style={{ background: c.value }} title={c.label} />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="input-label">Benefícios (um por linha)</label>
            <textarea className="input resize-none" rows={3}
              placeholder={'Acesso VIP\nOpen bar\nEstacionamento'} value={benefits} onChange={e => setBenefits(e.target.value)} />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {[
              { label: 'Ingresso nominal (com nome do comprador)', val: isNominal, set: setIsNominal },
              { label: 'Permite transferência', val: isTransferable, set: setIsTransferable },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-bg-border">
                <span className="text-sm text-text-secondary">{t.label}</span>
                <button onClick={() => t.set(!t.val)}
                  className={cn('w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0', t.val ? 'bg-brand-acid' : 'bg-bg-border')}>
                  <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200', t.val ? 'left-4' : 'left-0.5')} />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm min-w-[120px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (type ? '✓ Salvar' : '✓ Criar tipo')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Batch Modal ────────────────────────────────────────────── */
function BatchModal({ eventId, ticketTypeId, batch, position, onClose, onSaved }: {
  eventId: string; ticketTypeId: string; batch: TicketBatch | null; position: number
  onClose: () => void; onSaved: () => void
}) {
  const [name, setName] = useState(batch?.name ?? `Lote ${position + 1}`)
  const [price, setPrice] = useState(String(batch?.price ?? ''))
  const [quantity, setQuantity] = useState(String(batch?.quantity ?? ''))
  const [startsAt, setStartsAt] = useState(batch?.starts_at ? batch.starts_at.slice(0, 16) : '')
  const [endsAt, setEndsAt] = useState(batch?.ends_at ? batch.ends_at.slice(0, 16) : '')
  const [autoOpenNext, setAutoOpenNext] = useState(batch?.auto_open_next ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    if (!price || isNaN(Number(price))) { setError('Preço inválido'); return }
    if (!quantity || isNaN(Number(quantity))) { setError('Quantidade inválida'); return }
    setSaving(true); setError('')

    const payload = {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      auto_open_next: autoOpenNext,
      position: batch?.position ?? position,
    }

    if (batch) {
      const { error: err } = await supabase.from('ticket_batches').update(payload).eq('id', batch.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('ticket_batches').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); onSaved()
  }

  const priceNum = parseFloat(price) || 0
  const qtyNum = parseInt(quantity) || 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl tracking-wide leading-none">
            {batch ? 'EDITAR LOTE' : 'NOVO LOTE'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="input-label">Nome do lote *</label>
            <input className="input" placeholder="ex: 1º Lote, Early Bird, Último Lote" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Preço (R$) *</label>
              <input type="number" className="input" placeholder="0,00" min={0} step={0.01} value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Quantidade *</label>
              <input type="number" className="input" placeholder="ex: 200" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Início das vendas</label>
              <input type="datetime-local" className="input" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Fim das vendas</label>
              <input type="datetime-local" className="input" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
            </div>
          </div>

          {/* Auto open */}
          <div className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-bg-border">
            <div>
              <div className="text-sm text-text-secondary">Abrir próximo lote automaticamente</div>
              <div className="text-[11px] text-text-muted mt-0.5">Quando este lote esgotar, o próximo abre sozinho</div>
            </div>
            <button onClick={() => setAutoOpenNext(!autoOpenNext)}
              className={cn('w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0 ml-4', autoOpenNext ? 'bg-brand-acid' : 'bg-bg-border')}>
              <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200', autoOpenNext ? 'left-4' : 'left-0.5')} />
            </button>
          </div>

          {/* Preview */}
          {priceNum > 0 && qtyNum > 0 && (
            <div className="p-3 bg-bg-surface rounded-sm border border-brand-acid/15 text-xs font-mono space-y-1">
              <div className="text-text-muted mb-2 tracking-widest uppercase text-[10px]">Resumo</div>
              <div className="flex justify-between">
                <span className="text-text-muted">Receita potencial</span>
                <span className="text-brand-acid font-semibold">{formatCurrency(priceNum * qtyNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Preço por ingresso</span>
                <span className="text-text-primary">{formatCurrency(priceNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Capacidade do lote</span>
                <span className="text-text-primary">{formatNumber(qtyNum)} ingressos</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm min-w-[120px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (batch ? '✓ Salvar' : '✓ Criar lote')}
          </button>
        </div>
      </div>
    </div>
  )
}