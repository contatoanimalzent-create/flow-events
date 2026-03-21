import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import {
  Plus, Search, Users, Clock, CheckCircle2, XCircle,
  QrCode, Edit2, Trash2, Loader2, X, AlertCircle,
  ChevronDown, ChevronUp, Download, Upload,
  UserCheck, Shield, Briefcase,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type StaffStatus = 'invited' | 'confirmed' | 'active' | 'no_show' | 'cancelled'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  cpf: string
  role_title: string
  department: string
  area: string
  company: string
  daily_rate: number
  status: StaffStatus
  qr_token: string
  credential_issued_at?: string
  notes?: string
  created_at: string
}

interface TimeEntry {
  id: string
  staff_id: string
  type: string
  recorded_at: string
  method: string
  is_valid: boolean
}

interface Event { id: string; name: string }

interface StaffFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  cpf: string
  role_title: string
  department: string
  area: string
  company: string
  daily_rate: string
  notes: string
}

const EMPTY_FORM: StaffFormData = {
  first_name: '', last_name: '', email: '', phone: '', cpf: '',
  role_title: '', department: '', area: '', company: '',
  daily_rate: '', notes: '',
}

const STATUS_CONFIG: Record<StaffStatus, { label: string; color: string; bg: string; dot: string }> = {
  invited:   { label: 'Convidado',   color: 'text-status-warning',  bg: 'bg-status-warning/10',  dot: 'bg-status-warning' },
  confirmed: { label: 'Confirmado',  color: 'text-status-success',  bg: 'bg-status-success/10',  dot: 'bg-status-success' },
  active:    { label: 'Em campo',    color: 'text-brand-acid',      bg: 'bg-brand-acid/10',      dot: 'bg-brand-acid animate-pulse' },
  no_show:   { label: 'Faltou',      color: 'text-status-error',    bg: 'bg-status-error/10',    dot: 'bg-status-error' },
  cancelled: { label: 'Cancelado',   color: 'text-text-muted',      bg: 'bg-bg-surface',         dot: 'bg-text-muted' },
}

/* ── Main ───────────────────────────────────────────────────── */
export function StaffPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry[]>>({})

  useEffect(() => { if (organization) fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) fetchStaff() }, [selectedEventId, statusFilter])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events').select('id,name')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
    setEvents(data ?? [])
    if (data?.[0]) setSelectedEventId(data[0].id)
    else setLoading(false)
  }

  async function fetchStaff() {
    setLoading(true)
    let q = supabase.from('staff_members').select('*')
      .eq('event_id', selectedEventId)
      .order('first_name')
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setStaff(data ?? [])
    setLoading(false)
  }

  async function fetchTimeEntries(staffId: string) {
    const { data } = await supabase
      .from('time_entries').select('*')
      .eq('staff_id', staffId)
      .eq('event_id', selectedEventId)
      .order('recorded_at', { ascending: false })
      .limit(10)
    setTimeEntries(prev => ({ ...prev, [staffId]: data ?? [] }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este membro do staff?')) return
    await supabase.from('staff_members').delete().eq('id', id)
    fetchStaff()
  }

  async function handleStatusChange(id: string, status: StaffStatus) {
    await supabase.from('staff_members').update({ status }).eq('id', id)
    fetchStaff()
  }

  async function generateQR(id: string) {
    const token = `STAFF-${id}-${Date.now()}`
    await supabase.from('staff_members').update({
      qr_token: token,
      credential_issued_at: new Date().toISOString(),
    }).eq('id', id)
    fetchStaff()
  }

  const filtered = staff.filter(s => {
    const matchSearch = !search ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.role_title?.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || s.department === deptFilter
    return matchSearch && matchDept
  })

  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))]

  // Stats
  const confirmed  = staff.filter(s => ['confirmed','active'].includes(s.status)).length
  const active     = staff.filter(s => s.status === 'active').length
  const noShow     = staff.filter(s => s.status === 'no_show').length
  const totalCost  = staff.reduce((s, m) => s + (m.daily_rate || 0), 0)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            STAFF<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            {staff.length} membro{staff.length !== 1 ? 's' : ''} cadastrado{staff.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Upload className="w-3.5 h-3.5" /> Importar planilha
          </button>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button onClick={() => { setEditingId(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* Event selector */}
      {events.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap reveal">
          <span className="text-xs text-text-muted font-mono">EVENTO:</span>
          {events.map(e => (
            <button key={e.id} onClick={() => setSelectedEventId(e.id)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                selectedEventId === e.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
              {e.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal">
        {[
          { label: 'Total cadastrado', value: staff.length, icon: Users,       color: 'text-text-primary' },
          { label: 'Confirmados',      value: confirmed,    icon: CheckCircle2, color: 'text-status-success' },
          { label: 'Em campo agora',   value: active,       icon: UserCheck,    color: 'text-brand-acid' },
          { label: 'Custo diário',     value: formatCurrency(totalCost), icon: Briefcase, color: 'text-brand-blue' },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap reveal">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar por nome, e-mail ou função..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'confirmed', 'active', 'invited', 'no_show'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                statusFilter === s ? 'bg-brand-acid text-bg-primary' :
                'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-bg-border')}>
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {departments.length > 0 && (
          <select className="input h-9 text-xs w-auto pr-8"
            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">Todos os departamentos</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
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
          <Users className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM MEMBRO</div>
          <p className="text-sm text-text-muted mb-5">
            {search || statusFilter !== 'all' ? 'Nenhum resultado para os filtros' : 'Adicione membros ao staff deste evento'}
          </p>
          {!search && statusFilter === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">+ Adicionar membro</button>
          )}
        </div>
      )}

      {/* Staff list */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden reveal">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Membro', 'Função / Área', 'Status', 'Ponto', 'Custo diário', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => {
                const cfg = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.invited
                const isExpanded = expandedId === member.id
                const entries = timeEntries[member.id] ?? []
                const lastEntry = entries[0]

                return (
                  <>
                    <tr key={member.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-brand-acid/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-brand-acid font-mono">
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-[13px]">{member.first_name} {member.last_name}</div>
                            <div className="text-[11px] text-text-muted">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">{member.role_title || '—'}</div>
                        <div className="text-[11px] text-text-muted">{member.department} {member.area && `· ${member.area}`}</div>
                      </td>
                      <td className="table-cell">
                        <select
                          value={member.status}
                          onChange={e => handleStatusChange(member.id, e.target.value as StaffStatus)}
                          className={cn('text-xs font-medium px-2 py-1 rounded-sm border-none outline-none cursor-none', cfg.color, cfg.bg)}>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="table-cell">
                        {lastEntry ? (
                          <div>
                            <div className={cn('text-xs font-medium', lastEntry.type === 'clock_in' ? 'text-status-success' : 'text-status-error')}>
                              {lastEntry.type === 'clock_in' ? '● Entrada' : '○ Saída'}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              {formatDate(lastEntry.recorded_at, 'HH:mm')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="table-cell font-mono text-sm">
                        {member.daily_rate ? formatCurrency(member.daily_rate) : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (!isExpanded) fetchTimeEntries(member.id)
                              setExpandedId(isExpanded ? null : member.id)
                            }}
                            className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all"
                            title="Ver ponto">
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => generateQR(member.id)}
                            className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all"
                            title="Gerar QR code">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setEditingId(member.id); setShowForm(true) }}
                            className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(member.id)}
                            className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded time entries */}
                    {isExpanded && (
                      <tr key={`${member.id}-expanded`} className="bg-bg-surface/40">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">
                            Registro de ponto — {member.first_name}
                          </div>
                          {entries.length === 0 ? (
                            <div className="text-xs text-text-muted">Nenhum registro de ponto ainda</div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {entries.map(entry => (
                                <div key={entry.id} className={cn(
                                  'flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs border',
                                  entry.type === 'clock_in'
                                    ? 'bg-status-success/8 border-status-success/20 text-status-success'
                                    : 'bg-status-error/8 border-status-error/20 text-status-error'
                                )}>
                                  {entry.type === 'clock_in' ? '● Entrada' : '○ Saída'}
                                  <span className="font-mono text-text-muted">
                                    {formatDate(entry.recorded_at, 'dd/MM HH:mm')}
                                  </span>
                                  {entry.method && (
                                    <span className="text-[9px] text-text-muted">{entry.method}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <StaffFormModal
          eventId={selectedEventId}
          organizationId={organization!.id}
          staffId={editingId}
          onClose={() => { setShowForm(false); setEditingId(null) }}
          onSaved={() => { fetchStaff(); setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

/* ── Staff Form Modal ───────────────────────────────────────── */
function StaffFormModal({ eventId, organizationId, staffId, onClose, onSaved }: {
  eventId: string; organizationId: string; staffId: string | null
  onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (staffId) {
      setLoading(true)
      supabase.from('staff_members').select('*').eq('id', staffId).single().then(({ data }) => {
        if (data) setForm({
          first_name: data.first_name ?? '',
          last_name:  data.last_name ?? '',
          email:      data.email ?? '',
          phone:      data.phone ?? '',
          cpf:        data.cpf ?? '',
          role_title: data.role_title ?? '',
          department: data.department ?? '',
          area:       data.area ?? '',
          company:    data.company ?? '',
          daily_rate: data.daily_rate?.toString() ?? '',
          notes:      data.notes ?? '',
        })
        setLoading(false)
      })
    }
  }, [staffId])

  const set = (k: keyof StaffFormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.first_name.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      event_id: eventId,
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      email:      form.email || null,
      phone:      form.phone || null,
      cpf:        form.cpf || null,
      role_title: form.role_title || null,
      department: form.department || null,
      area:       form.area || null,
      company:    form.company || null,
      daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : null,
      notes:      form.notes || null,
      status:     'invited',
    }

    if (staffId) {
      const { error: err } = await supabase.from('staff_members').update(payload).eq('id', staffId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('staff_members').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); onSaved()
  }

  const fields = [
    [{ label: 'Nome *', key: 'first_name', placeholder: 'Nome' }, { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' }],
    [{ label: 'E-mail', key: 'email', placeholder: 'email@exemplo.com' }, { label: 'Telefone', key: 'phone', placeholder: '(00) 00000-0000' }],
    [{ label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' }, { label: 'Empresa / Fornecedor', key: 'company', placeholder: 'Nome da empresa' }],
    [{ label: 'Função / Cargo', key: 'role_title', placeholder: 'ex: Segurança, Operador...' }, { label: 'Departamento', key: 'department', placeholder: 'ex: Segurança, Produção...' }],
    [{ label: 'Área / Setor', key: 'area', placeholder: 'ex: Portaria A, Palco...' }, { label: 'Diária (R$)', key: 'daily_rate', placeholder: '0,00' }],
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl tracking-wide leading-none">
            {staffId ? 'EDITAR MEMBRO' : 'NOVO MEMBRO'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-acid animate-spin" /></div>
        ) : (
          <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
            {fields.map((row, ri) => (
              <div key={ri} className="grid grid-cols-2 gap-3">
                {row.map(f => (
                  <div key={f.key}>
                    <label className="input-label">{f.label}</label>
                    <input className="input" placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => set(f.key as keyof StaffFormData, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <div>
              <label className="input-label">Observações</label>
              <textarea className="input resize-none" rows={2}
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm min-w-[140px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (staffId ? '✓ Salvar' : '✓ Adicionar membro')}
          </button>
        </div>
      </div>
    </div>
  )
}
