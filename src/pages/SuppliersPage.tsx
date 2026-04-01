import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { ActionConfirmationDialog } from '@/shared/components'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  Plus, Search, Edit2, Trash2, Loader2, X, AlertCircle,
  Phone, Mail, FileText, DollarSign, Building2, Tag,
  CheckCircle2, Clock, XCircle, ChevronDown, ExternalLink,
  Download, Upload, Star, ShieldCheck, MoreHorizontal,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type SupplierStatus = 'prospect' | 'negotiating' | 'contracted' | 'confirmed' | 'active' | 'finished' | 'cancelled'
type DocStatus = 'pending' | 'sent' | 'signed' | 'expired'

const SERVICE_TYPES = [
  'Áudio & Som', 'Iluminação', 'Vídeo & Projeção', 'Segurança',
  'Catering & Alimentação', 'Decoração & Cenografia', 'Produção Executiva',
  'Palco & Estrutura', 'Logística & Transporte', 'Limpeza & Higiene',
  'Tecnologia & TI', 'Fotografia', 'Filmagem', 'DJ / Artista',
  'Locação de Equipamentos', 'Gerador de Energia', 'Banheiros Químicos', 'Outro',
]

interface Supplier {
  id: string
  organization_id: string
  event_id?: string
  company_name: string
  contact_name?: string
  email?: string
  phone?: string
  service_type?: string
  contract_value?: number
  payment_terms?: string
  status: SupplierStatus
  doc_status?: DocStatus
  notes?: string
  rating?: number
  created_at: string
}

interface EventItem { id: string; name: string }

interface SupplierForm {
  company_name: string
  contact_name: string
  email: string
  phone: string
  service_type: string
  contract_value: string
  payment_terms: string
  doc_status: DocStatus
  notes: string
  rating: string
}

const EMPTY_FORM: SupplierForm = {
  company_name: '', contact_name: '', email: '', phone: '',
  service_type: '', contract_value: '', payment_terms: '',
  doc_status: 'pending', notes: '', rating: '0',
}

const STATUS_CONFIG: Record<SupplierStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  prospect:    { label: 'Prospecto',    color: 'text-text-muted',       bg: 'bg-bg-border/50',       icon: Clock },
  negotiating: { label: 'Negociando',   color: 'text-status-warning',   bg: 'bg-status-warning/8',   icon: Clock },
  contracted:  { label: 'Contratado',   color: 'text-brand-blue',       bg: 'bg-brand-blue/8',       icon: FileText },
  confirmed:   { label: 'Confirmado',   color: 'text-brand-purple',     bg: 'bg-brand-purple/8',     icon: CheckCircle2 },
  active:      { label: 'Ativo',        color: 'text-brand-acid',       bg: 'bg-brand-acid/8',       icon: CheckCircle2 },
  finished:    { label: 'Concluido',    color: 'text-status-success',   bg: 'bg-status-success/8',   icon: CheckCircle2 },
  cancelled:   { label: 'Cancelado',    color: 'text-status-error',     bg: 'bg-status-error/8',     icon: XCircle },
}

const DOC_CONFIG: Record<DocStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente',  color: 'text-status-warning' },
  sent:    { label: 'Enviado',   color: 'text-brand-blue' },
  signed:  { label: 'Assinado', color: 'text-status-success' },
  expired: { label: 'Expirado', color: 'text-status-error' },
}

/* ── Main ───────────────────────────────────────────────────── */
export function SuppliersPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierStatus>('all')
  const [serviceFilter, setServiceFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [pendingDeleteSupplier, setPendingDeleteSupplier] = useState<Supplier | null>(null)

  useEffect(() => { if (organization) { fetchEvents(); fetchSuppliers() } }, [organization])
  useEffect(() => { if (organization) fetchSuppliers() }, [selectedEventId])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events').select('id,name')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
    setEvents(filterExampleEvents((data ?? []) as EventItem[]))
  }

  async function fetchSuppliers() {
    setLoading(true)
    let q = supabase.from('suppliers').select('*').eq('organization_id', organization!.id)
    if (selectedEventId !== 'all') q = q.eq('event_id', selectedEventId)
    q = q.order('company_name')
    const { data } = await q
    setSuppliers((data ?? []) as Supplier[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('suppliers').delete().eq('id', id)
    fetchSuppliers()
    setMenuId(null)
  }

  async function handleStatusChange(id: string, status: SupplierStatus) {
    await supabase.from('suppliers').update({ status }).eq('id', id)
    fetchSuppliers()
  }

  const filtered = suppliers.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (serviceFilter && s.service_type !== serviceFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return s.company_name.toLowerCase().includes(q) ||
      (s.contact_name ?? '').toLowerCase().includes(q) ||
      (s.service_type ?? '').toLowerCase().includes(q)
  })

  const totalContracted = suppliers.filter(s => ['contracted', 'confirmed', 'active'].includes(s.status)).length
  const totalActive = suppliers.filter(s => s.status === 'active').length
  const totalValue = suppliers
    .filter(s => ['contracted', 'confirmed', 'active', 'finished'].includes(s.status))
    .reduce((sum, s) => sum + (s.contract_value ?? 0), 0)
  const pendingDocs = suppliers.filter(s => s.doc_status === 'pending' && s.status === 'contracted').length

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto" onClick={() => setMenuId(null)}>

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            FORNECEDORES<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            {suppliers.length} fornecedor{suppliers.length !== 1 ? 'es' : ''} cadastrado{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Upload className="w-3.5 h-3.5" /> Importar
          </button>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button onClick={() => { setEditingSupplier(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo fornecedor
          </button>
        </div>
      </div>

      {/* Event filter */}
      <div className="flex items-center gap-3 flex-wrap reveal" style={{ animationDelay: '30ms' }}>
        <span className="text-xs text-text-muted font-mono">EVENTO:</span>
        <button onClick={() => setSelectedEventId('all')}
          className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
            selectedEventId === 'all' ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
          Todos
        </button>
        {events.map(e => (
          <button key={e.id} onClick={() => setSelectedEventId(e.id)}
            className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
              selectedEventId === e.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
            {e.name}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal" style={{ animationDelay: '50ms' }}>
        {[
          { label: 'Total', value: suppliers.length, icon: Building2, color: 'text-text-primary' },
          { label: 'Contratados', value: totalContracted, icon: FileText, color: 'text-brand-blue' },
          { label: 'Ativos no evento', value: totalActive, icon: CheckCircle2, color: 'text-brand-acid' },
          { label: 'Valor contratado', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-status-success' },
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

      {/* Alert docs */}
      {pendingDocs > 0 && (
        <div className="flex items-center gap-3 p-3 bg-status-warning/8 border border-status-warning/20 rounded-sm text-xs text-status-warning reveal">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{pendingDocs} fornecedor{pendingDocs !== 1 ? 'es contratados' : ' contratado'} com documentos pendentes de assinatura</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap reveal" style={{ animationDelay: '80ms' }}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar por empresa, contato ou serviço..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="input h-9 text-sm max-w-[180px]"
          value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
          <option value="">Todos os serviços</option>
          {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'prospect', 'negotiating', 'contracted', 'confirmed', 'active', 'finished', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                statusFilter === s ? 'bg-brand-acid text-bg-primary' :
                  'text-text-muted hover:text-text-primary border border-transparent hover:border-bg-border')}>
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s as SupplierStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <Building2 className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">
            {search || statusFilter !== 'all' ? 'NENHUM RESULTADO' : 'NENHUM FORNECEDOR'}
          </div>
          <p className="text-sm text-text-muted mb-5">
            {search || statusFilter !== 'all' ? 'Tente outros filtros' : 'Cadastre seus fornecedores para centralizar tudo'}
          </p>
          {!search && statusFilter === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo fornecedor</button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden reveal">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Empresa', 'Serviço', 'Status', 'Contrato', 'Documentos', 'Avaliação', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.status]
                const docCfg = s.doc_status ? DOC_CONFIG[s.doc_status] : null
                const StatusIcon = cfg.icon
                return (
                  <tr key={s.id} className="table-row relative">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-brand-acid/10 flex items-center justify-center shrink-0 border border-brand-acid/20">
                          <span className="text-xs font-bold text-brand-acid">
                            {s.company_name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-[13px] text-text-primary">{s.company_name}</div>
                          {s.contact_name && (
                            <div className="text-[11px] text-text-muted">{s.contact_name}</div>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.email && (
                              <a href={`mailto:${s.email}`} className="text-[10px] text-text-muted hover:text-brand-acid flex items-center gap-1 transition-colors">
                                <Mail className="w-2.5 h-2.5" /> {s.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {s.service_type ? (
                        <span className="text-xs flex items-center gap-1.5 text-text-secondary">
                          <Tag className="w-3 h-3 text-brand-acid" />
                          {s.service_type}
                        </span>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="table-cell">
                      <select value={s.status}
                        onChange={e => handleStatusChange(s.id, e.target.value as SupplierStatus)}
                        onClick={e => e.stopPropagation()}
                        className={cn(
                          'text-xs font-medium px-2 py-1 rounded-sm bg-transparent border border-bg-border outline-none cursor-pointer transition-colors',
                          cfg.color
                        )}>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k} className="bg-bg-card text-text-primary">{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      {s.contract_value ? (
                        <div>
                          <div className="text-sm font-mono font-medium text-text-primary">
                            {formatCurrency(s.contract_value)}
                          </div>
                          {s.payment_terms && (
                            <div className="text-[11px] text-text-muted">{s.payment_terms}</div>
                          )}
                        </div>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="table-cell">
                      {docCfg ? (
                        <span className={cn('flex items-center gap-1.5 text-xs font-medium', docCfg.color)}>
                          <ShieldCheck className="w-3 h-3" />
                          {docCfg.label}
                        </span>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="table-cell">
                      {s.rating ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={cn('w-3 h-3', i <= s.rating! ? 'text-brand-acid fill-brand-acid' : 'text-bg-border')} />
                          ))}
                        </div>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 relative">
                        {s.phone && (
                          <a href={`tel:${s.phone}`}
                            className="p-1.5 rounded-sm text-text-muted hover:text-status-success hover:bg-status-success/8 transition-all">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={e => { e.stopPropagation(); setEditingSupplier(s); setShowForm(true); setMenuId(null) }}
                          className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setMenuId(menuId === s.id ? null : s.id) }}
                          className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {menuId === s.id && (
                          <div className="absolute right-0 top-8 w-40 bg-bg-card border border-bg-border rounded-sm shadow-card z-50 overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditingSupplier(s); setShowForm(true); setMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button onClick={() => { window.open(`mailto:${s.email}`); setMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
                              <ExternalLink className="w-3.5 h-3.5" /> Enviar e-mail
                            </button>
                            <div className="border-t border-bg-border" />
                            <button onClick={() => setPendingDeleteSupplier(s)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-status-error hover:bg-status-error/8 transition-all">
                              <Trash2 className="w-3.5 h-3.5" /> Remover
                            </button>
                          </div>
                        )}
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
        <SupplierFormModal
          organizationId={organization!.id}
          events={events}
          supplier={editingSupplier}
          defaultEventId={selectedEventId !== 'all' ? selectedEventId : ''}
          onClose={() => { setShowForm(false); setEditingSupplier(null) }}
          onSaved={() => { fetchSuppliers(); setShowForm(false); setEditingSupplier(null) }}
        />
      )}

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteSupplier)}
        title="Remover fornecedor"
        description={pendingDeleteSupplier ? `O cadastro de ${pendingDeleteSupplier.company_name} sera removido desta operacao.` : undefined}
        impact="Historico contratual, contato e contexto operacional deixam de ficar disponiveis para a equipe neste ambiente."
        confirmLabel="Excluir fornecedor"
        onCancel={() => setPendingDeleteSupplier(null)}
        onConfirm={async () => {
          if (!pendingDeleteSupplier) {
            return
          }

          await handleDelete(pendingDeleteSupplier.id)
          setPendingDeleteSupplier(null)
        }}
      />
    </div>
  )
}

/* ── Form Modal ─────────────────────────────────────────────── */
function SupplierFormModal({ organizationId, events, supplier, defaultEventId, onClose, onSaved }: {
  organizationId: string
  events: EventItem[]
  supplier: Supplier | null
  defaultEventId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<SupplierForm>(
    supplier ? {
      company_name: supplier.company_name,
      contact_name: supplier.contact_name ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      service_type: supplier.service_type ?? '',
      contract_value: supplier.contract_value?.toString() ?? '',
      payment_terms: supplier.payment_terms ?? '',
      doc_status: supplier.doc_status ?? 'pending',
      notes: supplier.notes ?? '',
      rating: supplier.rating?.toString() ?? '0',
    } : { ...EMPTY_FORM }
  )
  const [eventId, setEventId] = useState(supplier?.event_id ?? defaultEventId)
  const [status, setStatus] = useState<SupplierStatus>(supplier?.status ?? 'prospect')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const set = (k: keyof SupplierForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.company_name.trim()) { setError('Nome da empresa é obrigatório'); return }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      event_id: eventId || null,
      company_name: form.company_name.trim(),
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      service_type: form.service_type || 'Outro',
      contract_value: form.contract_value ? parseFloat(form.contract_value) : null,
      payment_terms: form.payment_terms || null,
      status,
      doc_status: form.doc_status,
      notes: form.notes || null,
      rating: parseInt(form.rating) || null,
    }

    const { error: err } = supplier
      ? await supabase.from('suppliers').update(payload).eq('id', supplier.id)
      : await supabase.from('suppliers').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  const currentRating = parseInt(form.rating) || 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up shadow-card">

        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl leading-none">
            {supplier ? 'EDITAR FORNECEDOR' : 'NOVO FORNECEDOR'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Empresa */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="input-label">Nome da empresa *</label>
              <input className="input" placeholder="ex: AudioPro Eventos"
                value={form.company_name} onChange={e => set('company_name', e.target.value)} autoFocus />
            </div>
            <div>
              <label className="input-label">Nome do contato</label>
              <input className="input" placeholder="Responsável"
                value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Tipo de serviço</label>
              <select className="input" value={form.service_type} onChange={e => set('service_type', e.target.value)}>
                <option value="">Selecionar...</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">E-mail</label>
              <input type="email" className="input" placeholder="email@empresa.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Telefone / WhatsApp</label>
              <input className="input" placeholder="(00) 00000-0000"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          {/* Evento */}
          {events.length > 0 && (
            <div>
              <label className="input-label">Evento vinculado</label>
              <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Nenhum (geral)</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          {/* Contrato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor do contrato (R$)</label>
              <input type="number" className="input" placeholder="0,00" min={0} step={0.01}
                value={form.contract_value} onChange={e => set('contract_value', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Condições de pagamento</label>
              <input className="input" placeholder="ex: 50% entrada + 50% no dia"
                value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} />
            </div>
          </div>

          {/* Status e documentos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as SupplierStatus)}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status do contrato</label>
              <select className="input" value={form.doc_status} onChange={e => set('doc_status', e.target.value as DocStatus)}>
                {Object.entries(DOC_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="input-label">Avaliação do fornecedor</label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => set('rating', i.toString())}
                  className="p-1 transition-transform hover:scale-110">
                  <Star className={cn('w-5 h-5 transition-colors',
                    i <= (hoverRating || currentRating)
                      ? 'text-brand-acid fill-brand-acid'
                      : 'text-bg-border')} />
                </button>
              ))}
              {currentRating > 0 && (
                <button onClick={() => set('rating', '0')}
                  className="ml-2 text-[11px] text-text-muted hover:text-text-primary transition-colors">
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="input-label">Observações / Notas internas</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Acordos especiais, contatos alternativos, histórico..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
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
            className="btn-primary flex items-center gap-2 text-sm min-w-[160px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (supplier ? '✓ Salvar alterações' : '✓ Cadastrar fornecedor')}
          </button>
        </div>
      </div>
    </div>
  )
}
