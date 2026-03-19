import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatDate, formatNumber, cn } from '@/lib/utils'
import {
  ScanLine, CheckCircle2, XCircle, AlertTriangle, Activity,
  Users, DoorOpen, RefreshCw, Search, Loader2, X,
  ChevronDown, ToggleRight, ToggleLeft, ZoomIn,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type CheckinResult = 'success' | 'already_used' | 'invalid' | 'expired' | 'blocked'

interface Gate {
  id: string
  name: string
  is_entrance: boolean
  is_exit: boolean
  is_active: boolean
  device_count: number
}

interface Checkin {
  id: string
  result: CheckinResult
  checked_in_at: string
  is_exit: boolean
  was_offline: boolean
  gate_id: string
  digital_ticket?: {
    ticket_number: string
    holder_name: string
    holder_email: string
    is_vip: boolean
    ticket_type?: { name: string }
  }
  gate?: { name: string }
}

interface Event {
  id: string
  name: string
  total_capacity: number
  sold_tickets: number
}

interface Stats {
  totalIn: number
  totalOut: number
  currentOccupancy: number
  successRate: number
  invalidAttempts: number
}

/* ── Config ─────────────────────────────────────────────────── */
const RESULT_CONFIG: Record<CheckinResult, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  success:      { label: 'Entrada OK',      color: 'text-status-success', bg: 'bg-status-success/10 border-status-success/20', icon: CheckCircle2 },
  already_used: { label: 'Já utilizado',    color: 'text-status-warning', bg: 'bg-status-warning/10 border-status-warning/20', icon: AlertTriangle },
  invalid:      { label: 'QR inválido',     color: 'text-status-error',   bg: 'bg-status-error/10 border-status-error/20',     icon: XCircle },
  expired:      { label: 'Expirado',        color: 'text-text-muted',     bg: 'bg-bg-surface border-bg-border',                icon: XCircle },
  blocked:      { label: 'Bloqueado',       color: 'text-status-error',   bg: 'bg-status-error/10 border-status-error/20',     icon: XCircle },
}

/* ── Main ───────────────────────────────────────────────────── */
export function CheckinPage() {
  const { organization } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [gates, setGates] = useState<Gate[]>([])
  const [selectedGateId, setSelectedGateId] = useState('all')
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [stats, setStats] = useState<Stats>({ totalIn: 0, totalOut: 0, currentOccupancy: 0, successRate: 0, invalidAttempts: 0 })
  const [loading, setLoading] = useState(true)
  const [scanMode, setScanMode] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState<{ result: CheckinResult; name?: string; ticket?: string } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const scanRef = useRef<HTMLInputElement>(null)
  const scanTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { if (organization) fetchEvents() }, [organization])
  useEffect(() => { if (selectedEventId) { fetchGates(); fetchCheckins(); fetchStats() } }, [selectedEventId, selectedGateId])

  // Auto-refresh a cada 15s
  useEffect(() => {
    if (!selectedEventId) return
    const interval = setInterval(() => { fetchCheckins(); fetchStats() }, 15000)
    return () => clearInterval(interval)
  }, [selectedEventId, selectedGateId])

  // Focus no input quando entra em scan mode
  useEffect(() => {
    if (scanMode) setTimeout(() => scanRef.current?.focus(), 100)
  }, [scanMode])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events').select('id,name,total_capacity,sold_tickets')
      .eq('organization_id', organization!.id)
      .in('status', ['published', 'ongoing'])
      .order('starts_at', { ascending: true })
    setEvents(data ?? [])
    if (data?.[0]) setSelectedEventId(data[0].id)
    else setLoading(false)
  }

  async function fetchGates() {
    const { data } = await supabase
      .from('gates').select('*')
      .eq('event_id', selectedEventId)
      .eq('is_active', true)
      .order('name')
    setGates(data ?? [])
  }

  async function fetchCheckins() {
    setLoading(true)
    let q = supabase
      .from('checkins')
      .select(`
        id, result, checked_in_at, is_exit, was_offline, gate_id,
        digital_ticket:digital_tickets(ticket_number, holder_name, holder_email, is_vip,
          ticket_type:ticket_types(name)),
        gate:gates(name)
      `)
      .eq('event_id', selectedEventId)
      .order('checked_in_at', { ascending: false })
      .limit(100)

    if (selectedGateId !== 'all') q = q.eq('gate_id', selectedGateId)

    const { data } = await q
    setCheckins((data as any) ?? [])
    setLoading(false)
  }

  async function fetchStats() {
    const { data: allCheckins } = await supabase
      .from('checkins')
      .select('result, is_exit')
      .eq('event_id', selectedEventId)

    if (!allCheckins) return

    const ins      = allCheckins.filter(c => c.result === 'success' && !c.is_exit).length
    const outs     = allCheckins.filter(c => c.result === 'success' && c.is_exit).length
    const total    = allCheckins.length
    const invalid  = allCheckins.filter(c => c.result !== 'success').length
    const success  = allCheckins.filter(c => c.result === 'success').length

    setStats({
      totalIn: ins,
      totalOut: outs,
      currentOccupancy: Math.max(0, ins - outs),
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      invalidAttempts: invalid,
    })
  }

  // Simula leitura de QR — em produção conecta ao scanner
  async function handleScan(token: string) {
    if (!token.trim() || processing) return
    setProcessing(true)
    setScanResult(null)

    // Busca o ticket pelo qr_token
    const { data: ticket } = await supabase
      .from('digital_tickets')
      .select('id, holder_name, ticket_number, status, event_id, ticket_type:ticket_types(name)')
      .eq('qr_token', token.trim())
      .eq('event_id', selectedEventId)
      .single()

    if (!ticket) {
      setScanResult({ result: 'invalid' })
      setProcessing(false)
      setScanInput('')
      return
    }

    // Verifica se já foi usado
    if (ticket.status === 'used') {
      setScanResult({ result: 'already_used', name: ticket.holder_name, ticket: ticket.ticket_number })
      setProcessing(false)
      setScanInput('')
      return
    }

    // Registra o check-in
    const { error } = await supabase.from('checkins').insert({
      event_id: selectedEventId,
      digital_ticket_id: ticket.id,
      gate_id: selectedGateId !== 'all' ? selectedGateId : null,
      result: 'success',
      is_exit: false,
      checked_in_at: new Date().toISOString(),
    })

    if (!error) {
      // Atualiza o status do ticket
      await supabase.from('digital_tickets').update({
        status: 'used',
        checked_in_at: new Date().toISOString(),
      }).eq('id', ticket.id)

      setScanResult({ result: 'success', name: ticket.holder_name, ticket: ticket.ticket_number })
      fetchCheckins()
      fetchStats()
    } else {
      setScanResult({ result: 'invalid' })
    }

    setProcessing(false)
    setScanInput('')

    // Limpa o resultado após 4 segundos
    clearTimeout(scanTimer.current)
    scanTimer.current = setTimeout(() => setScanResult(null), 4000)
  }

  const filtered = checkins.filter(c => {
    const s = search.toLowerCase()
    return !s ||
      c.digital_ticket?.holder_name?.toLowerCase().includes(s) ||
      c.digital_ticket?.holder_email?.toLowerCase().includes(s) ||
      c.digital_ticket?.ticket_number?.toLowerCase().includes(s)
  })

  const event = events.find(e => e.id === selectedEventId)
  const occupancyPct = event?.total_capacity
    ? Math.round((stats.currentOccupancy / event.total_capacity) * 100) : 0

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            CHECK-IN<span className="text-brand-acid">.</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span className="text-text-muted text-xs font-mono tracking-wider">AO VIVO · atualiza a cada 15s</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchCheckins(); fetchStats() }}
            className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
          <button onClick={() => setScanMode(!scanMode)}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all',
              scanMode
                ? 'bg-status-error/15 border border-status-error/30 text-status-error'
                : 'btn-primary')}>
            <ScanLine className="w-4 h-4" />
            {scanMode ? 'Fechar scanner' : 'Abrir scanner'}
          </button>
        </div>
      </div>

      {/* Event + Gate selectors */}
      <div className="flex items-center gap-4 flex-wrap reveal">
        {events.length > 1 && (
          <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">PORTARIA:</span>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setSelectedGateId('all')}
              className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                selectedGateId === 'all' ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
              Todas
            </button>
            {gates.map(g => (
              <button key={g.id} onClick={() => setSelectedGateId(g.id)}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  selectedGateId === g.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary')}>
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanner */}
      {scanMode && (
        <div className="card p-5 border-brand-acid/30 reveal animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-acid/15 rounded-sm flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-brand-acid" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Scanner ativo</div>
              <div className="text-[11px] text-text-muted">Aponte o leitor QR ou digite o token manualmente</div>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              ref={scanRef}
              className="input flex-1 font-mono"
              placeholder="Aguardando leitura do QR code..."
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan(scanInput)}
              autoComplete="off"
            />
            <button onClick={() => handleScan(scanInput)} disabled={processing || !scanInput}
              className="btn-primary px-6 flex items-center gap-2">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Validar
            </button>
          </div>

          {/* Scan result */}
          {scanResult && (
            <div className={cn('flex items-center gap-3 mt-4 p-4 rounded-sm border animate-slide-up', RESULT_CONFIG[scanResult.result].bg)}>
              {(() => {
                const Icon = RESULT_CONFIG[scanResult.result].icon
                return <Icon className={cn('w-6 h-6 shrink-0', RESULT_CONFIG[scanResult.result].color)} />
              })()}
              <div className="flex-1">
                <div className={cn('font-semibold text-sm', RESULT_CONFIG[scanResult.result].color)}>
                  {RESULT_CONFIG[scanResult.result].label}
                </div>
                {scanResult.name && <div className="text-xs text-text-secondary mt-0.5">{scanResult.name}</div>}
                {scanResult.ticket && <div className="text-[11px] text-text-muted font-mono">{scanResult.ticket}</div>}
              </div>
              <button onClick={() => setScanResult(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 reveal">
        {[
          { label: 'Dentro agora',    value: formatNumber(stats.currentOccupancy), icon: Users,         color: 'text-brand-acid',     big: true },
          { label: 'Total entradas',  value: formatNumber(stats.totalIn),          icon: DoorOpen,      color: 'text-status-success' },
          { label: 'Total saídas',    value: formatNumber(stats.totalOut),         icon: DoorOpen,      color: 'text-brand-blue' },
          { label: 'Taxa de sucesso', value: `${stats.successRate}%`,              icon: Activity,      color: 'text-status-success' },
          { label: 'Tentativas inválidas', value: formatNumber(stats.invalidAttempts), icon: AlertTriangle, color: 'text-status-error' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={cn('card p-4', s.big && 'md:col-span-1 border-brand-acid/20')}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                <Icon className={cn('w-3.5 h-3.5', s.color)} />
              </div>
              <div className={cn('font-semibold', s.big ? 'text-3xl text-brand-acid' : 'text-xl', s.color)}>
                {s.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Occupancy bar */}
      {event?.total_capacity && (
        <div className="card p-4 reveal">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Ocupação atual</span>
            <span className="text-xs font-mono text-brand-acid">{occupancyPct}%</span>
          </div>
          <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-700',
              occupancyPct > 90 ? 'bg-status-error' : occupancyPct > 70 ? 'bg-status-warning' : 'bg-brand-acid')}
              style={{ width: `${occupancyPct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-text-muted font-mono">
            <span>{formatNumber(stats.currentOccupancy)} dentro</span>
            <span>{formatNumber(event.total_capacity)} capacidade</span>
          </div>
        </div>
      )}

      {/* Gates status */}
      {gates.length > 0 && (
        <div className="reveal">
          <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">Portarias</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gates.map(gate => (
              <div key={gate.id} className={cn('card p-3 flex items-center gap-3',
                selectedGateId === gate.id && 'border-brand-acid/30')}>
                <div className={cn('w-2 h-2 rounded-full', gate.is_active ? 'bg-status-success animate-pulse' : 'bg-bg-border')} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">{gate.name}</div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {gate.is_entrance && gate.is_exit ? 'Entrada/Saída' : gate.is_entrance ? 'Entrada' : 'Saída'}
                    {gate.device_count > 0 && ` · ${gate.device_count} dispositivos`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkin log */}
      <div className="reveal">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
            Log de check-ins {selectedGateId !== 'all' && `· ${gates.find(g => g.id === selectedGateId)?.name}`}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
            <input className="input pl-8 h-8 text-xs w-52" placeholder="Buscar por nome ou ticket..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <ScanLine className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <div className="font-display text-xl text-text-primary mb-1">NENHUM CHECK-IN</div>
            <p className="text-sm text-text-muted">Os check-ins aparecerão aqui em tempo real</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-bg-border">
                <tr>
                  {['Portador', 'Ingresso', 'Portaria', 'Resultado', 'Horário'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(checkin => {
                  const cfg = RESULT_CONFIG[checkin.result] ?? RESULT_CONFIG.invalid
                  const Icon = cfg.icon
                  return (
                    <tr key={checkin.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {checkin.digital_ticket?.is_vip && (
                            <span className="text-[9px] font-mono bg-brand-acid/15 text-brand-acid px-1.5 py-0.5 rounded-sm">VIP</span>
                          )}
                          <div>
                            <div className="font-medium text-[13px]">
                              {checkin.digital_ticket?.holder_name || '—'}
                            </div>
                            <div className="text-[11px] text-text-muted">
                              {checkin.digital_ticket?.holder_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-xs text-text-secondary">
                        <div>{checkin.digital_ticket?.ticket_type?.name || '—'}</div>
                        <div className="text-[11px] text-text-muted font-mono">
                          {checkin.digital_ticket?.ticket_number}
                        </div>
                      </td>
                      <td className="table-cell text-xs text-text-secondary">
                        {checkin.gate?.name || '—'}
                      </td>
                      <td className="table-cell">
                        <span className={cn('flex items-center gap-1.5 text-xs font-medium', cfg.color)}>
                          <Icon className="w-3.5 h-3.5" />
                          {checkin.is_exit ? 'Saída' : cfg.label}
                          {checkin.was_offline && (
                            <span className="text-[9px] text-text-muted font-mono ml-1">offline</span>
                          )}
                        </span>
                      </td>
                      <td className="table-cell text-[11px] text-text-muted font-mono">
                        {formatDate(checkin.checked_in_at, 'HH:mm:ss')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}