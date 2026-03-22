import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { Plus, Search, Users, Clock, CheckCircle2, QrCode, Edit2, Trash2, Loader2, X, AlertCircle, Download, Upload, UserCheck, Briefcase } from 'lucide-react'

type StaffStatus = 'invited' | 'confirmed' | 'active' | 'no_show' | 'cancelled'

interface StaffMember {
  id: string; first_name: string; last_name: string; email: string; phone: string
  cpf: string; role_title: string; department: string; area: string; company: string
  daily_rate: number; status: StaffStatus; qr_token: string
  credential_issued_at?: string; notes?: string; created_at: string
}

interface TimeEntry {
  id: string; staff_id: string; type: string; recorded_at: string; method: string; is_valid: boolean
}

interface EventItem { id: string; name: string }

interface StaffFormData {
  first_name: string; last_name: string; email: string; phone: string; cpf: string
  role_title: string; department: string; area: string; company: string; daily_rate: string; notes: string
}

const EMPTY: StaffFormData = { first_name: '', last_name: '', email: '', phone: '', cpf: '', role_title: '', department: '', area: '', company: '', daily_rate: '', notes: '' }

const STATUS: Record<StaffStatus, { label: string; color: string }> = {
  invited:   { label: 'Convidado',  color: 'text-status-warning' },
  confirmed: { label: 'Confirmado', color: 'text-status-success' },
  active:    { label: 'Em campo',   color: 'text-brand-acid' },
  no_show:   { label: 'Faltou',     color: 'text-status-error' },
  cancelled: { label: 'Cancelado',  color: 'text-text-muted' },
}

export function StaffPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry[]>>({})

  useEffect(() => { if (organization) fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) fetchStaff() }, [selectedEventId, statusFilter])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('id,name').eq('organization_id', organization!.id).order('starts_at', { ascending: false })
    const list = (data ?? []) as EventItem[]
    setEvents(list)
    if (list[0]) setSelectedEventId(list[0].id)
    else setLoading(false)
  }

  async function fetchStaff() {
    setLoading(true)
    let q = supabase.from('staff_members').select('*').eq('event_id', selectedEventId).order('first_name')
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setStaff((data ?? []) as StaffMember[])
    setLoading(false)
  }

  async function fetchTime(staffId: string) {
    const { data } = await supabase.from('time_entries').select('*').eq('staff_id', staffId).eq('event_id', selectedEventId).order('recorded_at', { ascending: false }).limit(10)
    setTimeEntries((prev: Record<string, TimeEntry[]>) => ({ ...prev, [staffId]: (data ?? []) as TimeEntry[] }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover membro?')) return
    await supabase.from('staff_members').delete().eq('id', id)
    fetchStaff()
  }

  async function handleStatus(id: string, status: StaffStatus) {
    await supabase.from('staff_members').update({ status }).eq('id', id)
    fetchStaff()
  }

  async function genQR(id: string) {
    await supabase.from('staff_members').update({ qr_token: `STAFF-${id}-${Date.now()}`, credential_issued_at: new Date().toISOString() }).eq('id', id)
    fetchStaff()
  }

  const filtered = staff.filter((s: StaffMember) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q) || (s.role_title ?? '').toLowerCase().includes(q)
  })

  const confirmed = staff.filter((s: StaffMember) => ['confirmed', 'active'].includes(s.status)).length
  const active = staff.filter((s: StaffMember) => s.status === 'active').length
  const totalCost = staff.reduce((acc: number, m: StaffMember) => acc + (m.daily_rate || 0), 0)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">STAFF<span className="text-brand-acid">.</span></h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">{staff.length} membro{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-xs"><Upload className="w-3.5 h-3.5" /> Importar</button>
          <button className="btn-secondary flex items-center gap-2 text-xs"><Download className="w-3.5 h-3.5" /> Exportar</button>
          <button onClick={() => { setEditingId(null); setShowForm(true) }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
        </div>
      </div>

      {events.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-text-muted font-mono">EVENTO:</span>
          {events.map((e: EventItem) => (
            <button key={e.id} onClick={() => setSelectedEventId(e.id)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all', selectedEventId === e.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
              {e.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { label: 'Total', value: staff.length, icon: Users, color: 'text-text-primary' },
          { label: 'Confirmados', value: confirmed, icon: CheckCircle2, color: 'text-status-success' },
          { label: 'Em campo', value: active, icon: UserCheck, color: 'text-brand-acid' },
          { label: 'Custo diário', value: formatCurrency(totalCost), icon: Briefcase, color: 'text-brand-blue' },
        ] as const).map((s, i) => {
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar por nome, e-mail ou função..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'invited', 'confirmed', 'active', 'no_show', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all', statusFilter === s ? 'bg-brand-acid text-bg-primary' : 'text-text-muted hover:text-text-primary border border-transparent hover:border-bg-border')}>
              {s === 'all' ? 'Todos' : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-acid animate-spin" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <Users className="w-10 h-10 text-text-muted mb-3" />
          <div className="font-display text-2xl text-text-primary mb-1">NENHUM MEMBRO</div>
          <p className="text-sm text-text-muted mb-5">{search || statusFilter !== 'all' ? 'Nenhum resultado' : 'Adicione membros ao staff'}</p>
          {!search && statusFilter === 'all' && <button onClick={() => setShowForm(true)} className="btn-primary">+ Adicionar</button>}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>{['Membro', 'Função / Área', 'Status', 'Último ponto', 'Custo', 'Ações'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((m: StaffMember) => {
                const isExpanded = expandedId === m.id
                const entries = timeEntries[m.id] ?? []
                const last = entries[0] as TimeEntry | undefined
                return (
                  <>
                    <tr key={m.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-brand-acid/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-brand-acid">{m.first_name?.[0]}{m.last_name?.[0]}</span>
                          </div>
                          <div>
                            <div className="font-medium text-[13px]">{m.first_name} {m.last_name}</div>
                            <div className="text-[11px] text-text-muted">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">{m.role_title || '—'}</div>
                        <div className="text-[11px] text-text-muted">{[m.department, m.area].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td className="table-cell">
                        <select value={m.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatus(m.id, e.target.value as StaffStatus)}
                          className={cn('text-xs font-medium px-2 py-1 rounded-sm bg-transparent border border-bg-border outline-none cursor-pointer', STATUS[m.status]?.color ?? 'text-text-muted')}>
                          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-bg-card text-text-primary">{v.label}</option>)}
                        </select>
                      </td>
                      <td className="table-cell">
                        {last ? (
                          <div>
                            <div className={cn('text-xs font-medium', last.type === 'clock_in' ? 'text-status-success' : 'text-status-error')}>{last.type === 'clock_in' ? '● Entrada' : '○ Saída'}</div>
                            <div className="text-[10px] text-text-muted font-mono">{formatDate(last.recorded_at, 'HH:mm')}</div>
                          </div>
                        ) : <span className="text-xs text-text-muted">—</span>}
                      </td>
                      <td className="table-cell font-mono text-sm">{m.daily_rate ? formatCurrency(m.daily_rate) : '—'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { if (!isExpanded) fetchTime(m.id); setExpandedId(isExpanded ? null : m.id) }} className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all"><Clock className="w-3.5 h-3.5" /></button>
                          <button onClick={() => genQR(m.id)} className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all"><QrCode className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setEditingId(m.id); setShowForm(true) }} className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${m.id}-exp`} className="bg-bg-surface/30">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">Ponto — {m.first_name}</div>
                          {entries.length === 0 ? <p className="text-xs text-text-muted">Nenhum registro</p> : (
                            <div className="flex flex-wrap gap-2">
                              {entries.map((en: TimeEntry) => (
                                <div key={en.id} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs border', en.type === 'clock_in' ? 'bg-status-success/8 border-status-success/20 text-status-success' : 'bg-status-error/8 border-status-error/20 text-status-error')}>
                                  {en.type === 'clock_in' ? '● Entrada' : '○ Saída'} <span className="font-mono text-text-muted">{formatDate(en.recorded_at, 'dd/MM HH:mm')}</span>
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

      {showForm && <StaffFormModal eventId={selectedEventId} organizationId={organization!.id} staffId={editingId} onClose={() => { setShowForm(false); setEditingId(null) }} onSaved={() => { fetchStaff(); setShowForm(false); setEditingId(null) }} />}
    </div>
  )
}

function StaffFormModal({ eventId, organizationId, staffId, onClose, onSaved }: { eventId: string; organizationId: string; staffId: string | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<StaffFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!staffId) return
    setLoading(true)
    supabase.from('staff_members').select('*').eq('id', staffId).single().then(({ data }) => {
      if (data) setForm({ first_name: data.first_name ?? '', last_name: data.last_name ?? '', email: data.email ?? '', phone: data.phone ?? '', cpf: data.cpf ?? '', role_title: data.role_title ?? '', department: data.department ?? '', area: data.area ?? '', company: data.company ?? '', daily_rate: data.daily_rate?.toString() ?? '', notes: data.notes ?? '' })
      setLoading(false)
    })
  }, [staffId])

  const set = (k: keyof StaffFormData, v: string) => setForm((f: StaffFormData) => ({ ...f, [k]: v }))

  async function save() {
    if (!form.first_name.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true); setError('')
    const payload = { organization_id: organizationId, event_id: eventId, first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email || null, phone: form.phone || null, cpf: form.cpf || null, role_title: form.role_title || null, department: form.department || null, area: form.area || null, company: form.company || null, daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : null, notes: form.notes || null, status: 'invited' }
    const { error: err } = staffId ? await supabase.from('staff_members').update(payload).eq('id', staffId) : await supabase.from('staff_members').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  const rows: { label: string; key: keyof StaffFormData; placeholder: string }[][] = [
    [{ label: 'Nome *', key: 'first_name', placeholder: 'Nome' }, { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' }],
    [{ label: 'E-mail', key: 'email', placeholder: 'email@exemplo.com' }, { label: 'Telefone', key: 'phone', placeholder: '(00) 00000-0000' }],
    [{ label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' }, { label: 'Empresa', key: 'company', placeholder: 'Nome da empresa' }],
    [{ label: 'Função', key: 'role_title', placeholder: 'ex: Segurança' }, { label: 'Departamento', key: 'department', placeholder: 'ex: Operações' }],
    [{ label: 'Área', key: 'area', placeholder: 'ex: Portaria A' }, { label: 'Diária (R$)', key: 'daily_rate', placeholder: '0,00' }],
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl leading-none">{staffId ? 'EDITAR' : 'NOVO MEMBRO'}<span className="text-brand-acid">.</span></h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary rounded-sm transition-all"><X className="w-4 h-4" /></button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-acid animate-spin" /></div> : (
          <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-2 gap-3">
                {row.map(f => (
                  <div key={f.key}>
                    <label className="input-label">{f.label}</label>
                    <input className="input" placeholder={f.placeholder} value={form[f.key]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <div>
              <label className="input-label">Observações</label>
              <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('notes', e.target.value)} />
            </div>
            {error && <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm min-w-[140px] justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (staffId ? '✓ Salvar' : '✓ Adicionar')}
          </button>
        </div>
      </div>
    </div>
  )
}