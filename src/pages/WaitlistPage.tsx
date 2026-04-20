import { useEffect, useState } from 'react'
import {
  AlertCircle, Bell, Check, Clock, Download, Loader2,
  Mail, Phone, Search, Users, X, ChevronRight, Ticket,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { filterExampleEvents } from '@/shared/lib/example-events'
import { cn, formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type WaitStatus = 'waiting' | 'notified' | 'converted' | 'expired' | 'cancelled'

interface WaitlistEntry {
  id: string
  event_id: string
  ticket_type_id?: string | null
  name: string
  email: string
  phone?: string | null
  quantity: number
  status: WaitStatus
  position: number
  notes?: string | null
  created_at: string
  notified_at?: string | null
}

interface EventItem { id: string; name: string }
interface TicketTypeItem { id: string; name: string }

const STATUS_CONFIG: Record<WaitStatus, { label: string; color: string; bg: string }> = {
  waiting:   { label: 'Aguardando', color: 'text-status-warning',  bg: 'bg-status-warning/10' },
  notified:  { label: 'Notificado', color: 'text-brand-blue',      bg: 'bg-brand-blue/10' },
  converted: { label: 'Convertido', color: 'text-status-success',  bg: 'bg-status-success/10' },
  expired:   { label: 'Expirado',   color: 'text-text-muted',      bg: 'bg-bg-surface' },
  cancelled: { label: 'Cancelado',  color: 'text-status-error',    bg: 'bg-status-error/10' },
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(entries: WaitlistEntry[], eventName: string) {
  const rows = [
    ['Posição', 'Nome', 'E-mail', 'Telefone', 'Quantidade', 'Status', 'Criado em'],
    ...entries.map(e => [
      e.position, e.name, e.email, e.phone ?? '',
      e.quantity, STATUS_CONFIG[e.status].label,
      formatDate(e.created_at, 'dd/MM/yyyy HH:mm'),
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lista-espera-${eventName.replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function WaitlistPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([])
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | WaitStatus>('all')
  const [notifyingId, setNotifyingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { if (organization) void fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) { void fetchEntries(); void fetchTicketTypes() } }, [selectedEventId])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('id,name')
      .eq('organization_id', organization!.id)
      .order('starts_at', { ascending: false })
    const list = filterExampleEvents((data ?? []) as EventItem[])
    setEvents(list)
    if (list[0]) setSelectedEventId(list[0].id)
  }

  async function fetchTicketTypes() {
    const { data } = await supabase.from('ticket_types').select('id,name')
      .eq('event_id', selectedEventId).order('name')
    setTicketTypes((data ?? []) as TicketTypeItem[])
  }

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('waitlist_entries').select('*')
      .eq('event_id', selectedEventId).order('position')
    setEntries((data ?? []) as WaitlistEntry[])
    setLoading(false)
  }

  async function updateStatus(id: string, status: WaitStatus) {
    setUpdatingId(id)
    await supabase.from('waitlist_entries').update({ status }).eq('id', id)
    setUpdatingId(null)
    void fetchEntries()
  }

  async function notifyEntry(entry: WaitlistEntry) {
    setNotifyingId(entry.id)
    await supabase.from('waitlist_entries').update({
      status: 'notified',
      notified_at: new Date().toISOString(),
    }).eq('id', entry.id)
    setNotifyingId(null)
    void fetchEntries()
  }

  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
  })

  const waiting = entries.filter(e => e.status === 'waiting').length
  const notified = entries.filter(e => e.status === 'notified').length
  const converted = entries.filter(e => e.status === 'converted').length
  const eventName = events.find(e => e.id === selectedEventId)?.name ?? ''

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Gestão de demanda</div>
          <h1 className="admin-title">Lista de Espera<span className="admin-title-accent">.</span></h1>
          <p className="admin-subtitle">
            Gerencie participantes que querem ingressos quando surgir disponibilidade
          </p>
        </div>
        <div className="novare-stage-panel-dark">
          <div className="novare-stage-label">Demanda reprimida</div>
          <div className="novare-stage-title">
            Capture quem ficou de fora e converta quando surgir disponibilidade.
          </div>
          <div className="novare-stage-copy">
            A lista de espera aparece automaticamente na página do evento quando os ingressos estão esgotados. Notifique manualmente ou deixe o sistema avisar por e-mail.
          </div>
        </div>
      </div>

      {/* Event selector */}
      {events.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Evento:</span>
          {events.map(e => (
            <button key={e.id} onClick={() => setSelectedEventId(e.id)}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                selectedEventId === e.id ? 'bg-brand-acid text-white' :
                  'border border-bg-border text-text-muted hover:text-text-primary')}>
              {e.name}
            </button>
          ))}
        </div>
      )}

      {/* KPIs */}
      {selectedEventId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total na fila', value: entries.length, icon: Users, color: 'text-text-primary' },
            { label: 'Aguardando', value: waiting, icon: Clock, color: 'text-status-warning' },
            { label: 'Notificados', value: notified, icon: Bell, color: 'text-brand-blue' },
            { label: 'Convertidos', value: converted, icon: Check, color: 'text-status-success' },
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
      )}

      {/* Toolbar */}
      {selectedEventId && (
        <div className="admin-filterbar">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input className="input pl-9 h-9 text-sm" placeholder="Buscar nome ou e-mail..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {(['all', 'waiting', 'notified', 'converted', 'cancelled'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  statusFilter === s ? 'bg-brand-acid text-white' :
                    'text-text-muted hover:text-text-primary border border-transparent hover:border-bg-border')}>
                {s === 'all' ? 'Todos' : STATUS_CONFIG[s as WaitStatus].label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {filtered.length > 0 && (
            <button onClick={() => exportCsv(filtered, eventName)}
              className="btn-secondary flex items-center gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
          )}

          {waiting > 0 && (
            <button
              onClick={async () => {
                const toNotify = entries.filter(e => e.status === 'waiting')
                for (const e of toNotify) await notifyEntry(e)
              }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Bell className="h-4 w-4" />
              Notificar todos ({waiting})
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      )}

      {/* Empty */}
      {!loading && selectedEventId && filtered.length === 0 && (
        <div className="card p-16 flex flex-col items-center text-center">
          <Users className="h-10 w-10 text-text-muted mb-3" />
          <div className="font-display text-2xl mb-1">
            {search || statusFilter !== 'all' ? 'NENHUM RESULTADO' : 'LISTA VAZIA'}
          </div>
          <p className="text-sm text-text-muted">
            {search || statusFilter !== 'all'
              ? 'Tente outros filtros'
              : 'Nenhum participante entrou na lista de espera ainda. Ela aparece na página do evento quando ingressos esgotam.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['#', 'Participante', 'Contato', 'Ingresso', 'Qtd', 'Status', 'Na fila desde', 'Ações'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => {
                const cfg = STATUS_CONFIG[entry.status]
                const ttName = ticketTypes.find(t => t.id === entry.ticket_type_id)?.name
                return (
                  <tr key={entry.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono text-sm font-bold text-brand-acid">#{entry.position}</span>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-[13px] text-text-primary">{entry.name}</div>
                      {entry.notes && <div className="text-[11px] text-text-muted">{entry.notes}</div>}
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <a href={`mailto:${entry.email}`}
                          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-acid transition-colors">
                          <Mail className="h-3 w-3" />{entry.email}
                        </a>
                        {entry.phone && (
                          <a href={`tel:${entry.phone}`}
                            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-status-success transition-colors">
                            <Phone className="h-3 w-3" />{entry.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {ttName ? (
                        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Ticket className="h-3 w-3 text-brand-acid" />{ttName}
                        </span>
                      ) : <span className="text-xs text-text-muted">Qualquer</span>}
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-text-primary">{entry.quantity}</span>
                    </td>
                    <td className="table-cell">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', cfg.color, cfg.bg)}>
                        {cfg.label}
                      </span>
                      {entry.notified_at && (
                        <div className="text-[10px] text-text-muted mt-1">
                          Notif. {formatDate(entry.notified_at, 'dd/MM HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-text-secondary font-mono">
                        {formatDate(entry.created_at, 'dd/MM/yyyy')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {entry.status === 'waiting' && (
                          <button
                            onClick={() => void notifyEntry(entry)}
                            disabled={notifyingId === entry.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-brand-blue bg-brand-blue/8 hover:bg-brand-blue/15 transition-all"
                          >
                            {notifyingId === entry.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Bell className="h-3 w-3" />}
                            Notificar
                          </button>
                        )}
                        {entry.status === 'notified' && (
                          <button
                            onClick={() => void updateStatus(entry.id, 'converted')}
                            disabled={updatingId === entry.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-status-success bg-status-success/8 hover:bg-status-success/15 transition-all"
                          >
                            <ChevronRight className="h-3 w-3" /> Convertido
                          </button>
                        )}
                        {(entry.status === 'waiting' || entry.status === 'notified') && (
                          <button
                            onClick={() => void updateStatus(entry.id, 'cancelled')}
                            disabled={updatingId === entry.id}
                            className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all"
                            title="Cancelar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
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

      {/* Empty state - no event selected */}
      {!selectedEventId && !loading && (
        <div className="card p-16 flex flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-text-muted mb-3" />
          <div className="font-display text-xl mb-1">Selecione um evento</div>
          <p className="text-sm text-text-muted">Escolha um evento acima para ver a lista de espera</p>
        </div>
      )}
    </div>
  )
}
