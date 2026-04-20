import { useEffect, useState } from 'react'
import {
  AlertCircle, Check, Copy, Edit2, Loader2, Percent, Plus,
  Search, Tag, Ticket, Trash2, X, Calendar, Hash,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { ActionConfirmationDialog } from '@/shared/components'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type CouponType = 'percentage' | 'fixed'

interface DiscountCoupon {
  id: string
  organization_id: string
  event_id?: string | null
  code: string
  type: CouponType
  value: number
  max_uses?: number | null
  uses_count: number
  min_order_amount?: number | null
  valid_from?: string | null
  valid_until?: string | null
  is_active: boolean
  description?: string | null
  created_at: string
}

interface EventItem { id: string; name: string }

interface CouponForm {
  code: string
  type: CouponType
  value: string
  max_uses: string
  min_order_amount: string
  valid_from: string
  valid_until: string
  description: string
}

const EMPTY_FORM: CouponForm = {
  code: '', type: 'percentage', value: '', max_uses: '',
  min_order_amount: '', valid_from: '', valid_until: '', description: '',
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function CouponBadge({ coupon }: { coupon: DiscountCoupon }) {
  const expired = coupon.valid_until && new Date(coupon.valid_until) < new Date()
  const exhausted = coupon.max_uses != null && coupon.uses_count >= coupon.max_uses

  if (!coupon.is_active) return <span className="badge-muted">Inativo</span>
  if (expired) return <span className="badge-error">Expirado</span>
  if (exhausted) return <span className="badge-warning">Esgotado</span>
  return <span className="badge-success">Ativo</span>
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CouponsPage() {
  const { organization } = useAuthStore()
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DiscountCoupon | null>(null)
  const [pendingDelete, setPendingDelete] = useState<DiscountCoupon | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { if (organization) { void fetch() } }, [organization])

  async function fetch() {
    setLoading(true)
    const [{ data: c }, { data: e }] = await Promise.all([
      supabase.from('discount_coupons').select('*').eq('organization_id', organization!.id).order('created_at', { ascending: false }),
      supabase.from('events').select('id,name').eq('organization_id', organization!.id).order('starts_at', { ascending: false }),
    ])
    setCoupons((c ?? []) as DiscountCoupon[])
    setEvents(filterExampleEvents((e ?? []) as EventItem[]))
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('discount_coupons').delete().eq('id', id)
    void fetch()
  }

  async function toggleActive(coupon: DiscountCoupon) {
    await supabase.from('discount_coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id)
    void fetch()
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = coupons.filter(c => {
    if (eventFilter !== 'all' && c.event_id !== eventFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.code.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
  })

  const totalActive = coupons.filter(c => c.is_active).length
  const totalUses = coupons.reduce((s, c) => s + c.uses_count, 0)

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Marketing & conversão</div>
          <h1 className="admin-title">Cupons<span className="admin-title-accent">.</span></h1>
          <p className="admin-subtitle">
            {coupons.length} cupom{coupons.length !== 1 ? 'ns' : ''} cadastrado{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="novare-stage-panel-dark">
          <div className="novare-stage-label">Desconto estratégico</div>
          <div className="novare-stage-title">
            Crie códigos promocionais para parceiros, imprensa, influencers e campanhas.
          </div>
          <div className="novare-stage-copy">
            Cupons de % ou valor fixo, com limite de uso, validade e evento específico. O participante aplica no checkout.
          </div>
          <div className="mt-6">
            <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Novo cupom
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de cupons', value: coupons.length, icon: Tag, color: 'text-text-primary' },
          { label: 'Ativos', value: totalActive, icon: Check, color: 'text-status-success' },
          { label: 'Usos totais', value: totalUses, icon: Ticket, color: 'text-brand-acid' },
          { label: 'Inativos', value: coupons.length - totalActive, icon: X, color: 'text-text-muted' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                <Icon className={cn('h-3.5 w-3.5', s.color)} />
              </div>
              <div className={cn('text-2xl font-semibold font-mono', s.color)}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="admin-filterbar">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar código ou descrição..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input h-9 text-sm max-w-[200px]"
          value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
          <option value="all">Todos os eventos</option>
          <option value="">Geral (todos eventos)</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Novo cupom
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card p-16 flex flex-col items-center text-center">
          <Tag className="h-10 w-10 text-text-muted mb-3" />
          <div className="font-display text-2xl mb-1">
            {search || eventFilter !== 'all' ? 'NENHUM RESULTADO' : 'NENHUM CUPOM'}
          </div>
          <p className="text-sm text-text-muted mb-5">
            {search || eventFilter !== 'all' ? 'Tente outros filtros' : 'Crie o primeiro cupom de desconto'}
          </p>
          {!search && eventFilter === 'all' && (
            <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
              + Novo cupom
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Código', 'Desconto', 'Uso', 'Validade', 'Evento', 'Status', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(coupon => {
                const eventName = events.find(e => e.id === coupon.event_id)?.name
                return (
                  <tr key={coupon.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(coupon.code)}
                          title="Copiar código"
                          className="group flex items-center gap-2 font-mono text-sm font-bold text-brand-acid hover:text-brand-acid/80 transition-colors"
                        >
                          <span className="rounded bg-brand-acid/10 px-2 py-1 tracking-widest">
                            {coupon.code}
                          </span>
                          {copied === coupon.code
                            ? <Check className="h-3.5 w-3.5 text-status-success" />
                            : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />}
                        </button>
                      </div>
                      {coupon.description && (
                        <div className="text-[11px] text-text-muted mt-0.5">{coupon.description}</div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-text-primary">
                        {coupon.type === 'percentage'
                          ? <><Percent className="h-3.5 w-3.5 text-brand-acid" />{coupon.value}% OFF</>
                          : <><Hash className="h-3.5 w-3.5 text-brand-acid" />{formatCurrency(coupon.value)} OFF</>}
                      </div>
                      {coupon.min_order_amount != null && (
                        <div className="text-[11px] text-text-muted">
                          mín. {formatCurrency(coupon.min_order_amount)}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="font-mono text-sm">
                        <span className="text-text-primary font-semibold">{coupon.uses_count}</span>
                        {coupon.max_uses != null && (
                          <span className="text-text-muted"> / {coupon.max_uses}</span>
                        )}
                      </div>
                      {coupon.max_uses != null && (
                        <div className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-bg-surface">
                          <div
                            className="h-full rounded-full bg-brand-acid transition-all"
                            style={{ width: `${Math.min(100, (coupon.uses_count / coupon.max_uses) * 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {coupon.valid_until ? (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Calendar className="h-3 w-3" />
                          até {formatDate(coupon.valid_until, 'dd/MM/yyyy')}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">Sem validade</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-text-secondary">
                        {eventName ?? <span className="text-text-muted italic">Todos os eventos</span>}
                      </span>
                    </td>
                    <td className="table-cell">
                      <CouponBadge coupon={coupon} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(coupon)}
                          title={coupon.is_active ? 'Desativar' : 'Ativar'}
                          className={cn(
                            'p-1.5 rounded-sm transition-all text-xs font-mono',
                            coupon.is_active
                              ? 'text-status-warning hover:bg-status-warning/8'
                              : 'text-status-success hover:bg-status-success/8',
                          )}
                        >
                          {coupon.is_active ? 'Pausar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => { setEditing(coupon); setShowForm(true) }}
                          className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setPendingDelete(coupon)}
                          className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Form Modal */}
      {showForm && (
        <CouponFormModal
          organizationId={organization!.id}
          events={events}
          coupon={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { void fetch(); setShowForm(false); setEditing(null) }}
        />
      )}

      <ActionConfirmationDialog
        open={Boolean(pendingDelete)}
        title="Excluir cupom"
        description={pendingDelete ? `O cupom "${pendingDelete.code}" será removido permanentemente.` : undefined}
        impact="Participantes não conseguirão mais usar este código no checkout."
        confirmLabel="Excluir cupom"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return
          await handleDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function CouponFormModal({ organizationId, events, coupon, onClose, onSaved }: {
  organizationId: string
  events: EventItem[]
  coupon: DiscountCoupon | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CouponForm>(coupon ? {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    max_uses: coupon.max_uses != null ? String(coupon.max_uses) : '',
    min_order_amount: coupon.min_order_amount != null ? String(coupon.min_order_amount) : '',
    valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : '',
    valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : '',
    description: coupon.description ?? '',
  } : { ...EMPTY_FORM, code: generateCode() })
  const [eventId, setEventId] = useState(coupon?.event_id ?? '')
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof CouponForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.code.trim()) { setError('Código obrigatório'); return }
    if (!form.value || isNaN(Number(form.value))) { setError('Valor de desconto inválido'); return }
    if (form.type === 'percentage' && (Number(form.value) <= 0 || Number(form.value) > 100)) {
      setError('Percentual deve ser entre 1 e 100'); return
    }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      event_id: eventId || null,
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: isActive,
      description: form.description || null,
    }

    const { error: err } = coupon
      ? await supabase.from('discount_coupons').update(payload).eq('id', coupon.id)
      : await supabase.from('discount_coupons').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-bg-border rounded-sm shadow-card animate-slide-up overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl">
            {coupon ? 'EDITAR CUPOM' : 'NOVO CUPOM'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-sm text-text-muted hover:text-text-primary transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Código */}
          <div>
            <label className="input-label">Código do cupom *</label>
            <div className="flex gap-2">
              <input
                className="input font-mono text-lg tracking-widest uppercase flex-1"
                placeholder="EX: PULSE20"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => set('code', generateCode())}
                className="btn-secondary text-xs px-3 whitespace-nowrap"
                title="Gerar código aleatório"
              >
                Gerar
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">O participante digita este código no checkout</p>
          </div>

          {/* Tipo + Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Tipo de desconto *</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value as CouponType)}>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="input-label">
                Valor {form.type === 'percentage' ? '(%)' : '(R$)'} *
              </label>
              <input
                type="number"
                className="input"
                placeholder={form.type === 'percentage' ? 'ex: 20' : 'ex: 50'}
                min={0}
                max={form.type === 'percentage' ? 100 : undefined}
                step={form.type === 'percentage' ? 1 : 0.01}
                value={form.value}
                onChange={e => set('value', e.target.value)}
              />
            </div>
          </div>

          {/* Limite de usos + valor mínimo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Limite de usos</label>
              <input
                type="number" className="input" placeholder="Sem limite" min={1}
                value={form.max_uses} onChange={e => set('max_uses', e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Pedido mínimo (R$)</label>
              <input
                type="number" className="input" placeholder="Sem mínimo" min={0} step={0.01}
                value={form.min_order_amount} onChange={e => set('min_order_amount', e.target.value)}
              />
            </div>
          </div>

          {/* Validade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Válido a partir de</label>
              <input type="date" className="input" value={form.valid_from} onChange={e => set('valid_from', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Válido até</label>
              <input type="date" className="input" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
            </div>
          </div>

          {/* Evento */}
          <div>
            <label className="input-label">Evento</label>
            <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
              <option value="">Válido para todos os eventos</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="input-label">Descrição interna</label>
            <input
              className="input" placeholder="ex: Cupom para influencers, imprensa..."
              value={form.description} onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Ativo toggle */}
          <div className="flex items-center justify-between p-3 rounded-sm bg-bg-surface border border-bg-border">
            <div>
              <div className="text-sm font-medium text-text-primary">Cupom ativo</div>
              <div className="text-[11px] text-text-muted">Desative para pausar sem excluir</div>
            </div>
            <button
              type="button" onClick={() => setIsActive(v => !v)}
              className={cn('relative h-6 w-12 rounded-full transition-all', isActive ? 'bg-brand-acid' : 'bg-bg-border')}
            >
              <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-all', isActive ? 'left-7' : 'left-1')} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={() => void handleSave()} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm min-w-[160px] justify-center">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Salvando...' : coupon ? 'Salvar alterações' : 'Criar cupom'}
          </button>
        </div>
      </div>
    </div>
  )
}
