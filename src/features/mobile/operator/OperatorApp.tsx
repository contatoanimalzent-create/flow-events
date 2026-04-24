import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle, CheckCircle2, ChevronRight, Clock, Hash,
  History, Loader2, LogOut, QrCode, RefreshCw, ScanLine,
  Search, Shield, Upload, Wifi, WifiOff, X, XCircle, Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'
import { MobileShell, MobileScreen } from '@/features/mobile/shared/MobileShell'
import { MobileHeader, MobileTabBar } from '@/features/mobile/shared/MobileHeader'
import { MobileBtn, MobileCard, MobileEmptyState, MobileInput, MobileLoader } from '@/features/mobile/shared/MobileUI'
import { useMobileNav } from '@/features/mobile/shared/useMobileNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'login' | 'select-event' | 'select-gate' | 'scanner' | 'manual-search' | 'invalid-attempt' | 'history' | 'offline-queue' | 'sync' | 'shift-summary'

type ScanStatus = 'valid' | 'invalid' | 'duplicate' | 'wrong-event'

interface AuthUser { id: string; email: string }
interface EventInfo { id: string; name: string; date: string; venue: string; status: string }
interface GateInfo { id: string; name: string; type: string }
interface ScanRecord { id: string; time: string; name: string; status: ScanStatus; gate: string }
interface OfflineItem { id: string; token: string; time: string; gate: string; status: ScanStatus; synced: boolean }

const ACCENT = '#0057E7'

const TABS = [
  { key: 'scanner', label: 'Scanner', icon: ScanLine },
  { key: 'history', label: 'Histórico', icon: History },
  { key: 'offline-queue', label: 'Fila', icon: Upload },
  { key: 'shift-summary', label: 'Turno', icon: Shield },
]

const MOCK_EVENTS: EventInfo[] = [
  { id: 'e1', name: 'Flow Fest 2026', date: '20 Abr 2026 · 14:00', venue: 'Arena São Paulo', status: 'ongoing' },
  { id: 'e2', name: 'Tech Summit BR', date: '25 Abr 2026 · 09:00', venue: 'Expo Center Norte', status: 'published' },
  { id: 'e3', name: 'Festival Indie', date: '02 Mai 2026 · 16:00', venue: 'Parque Ibirapuera', status: 'published' },
]

const MOCK_GATES: GateInfo[] = [
  { id: 'g1', name: 'Entrada Principal', type: 'main' },
  { id: 'g2', name: 'Entrada VIP', type: 'vip' },
  { id: 'g3', name: 'Entrada Lateral', type: 'secondary' },
]

// ─── Shared helpers ───────────────────────────────────────────────────────────

function now() { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }

function randomId() { return Math.random().toString(36).slice(2, 9) }

function StatusDot({ status }: { status: ScanStatus }) {
  const colors: Record<ScanStatus, string> = {
    valid: 'bg-green-500',
    invalid: 'bg-red-500',
    duplicate: 'bg-orange-500',
    'wrong-event': 'bg-yellow-500',
  }
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', colors[status])} />
}

const STATUS_LABELS: Record<ScanStatus, string> = {
  valid: 'VÁLIDO',
  invalid: 'INVÁLIDO',
  duplicate: 'DUPLICADO',
  'wrong-event': 'EVENTO ERRADO',
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err || !data.user) {
        // Demo fallback
        if (email.includes('@') && password.length >= 4) {
          onLogin({ id: 'demo', email })
        } else {
          setError('Credenciais inválidas. Tente novamente.')
        }
      } else {
        onLogin({ id: data.user.id, email: data.user.email ?? email })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ACCENT}20` }}>
            <ScanLine className="h-8 w-8" style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <div className="font-mono text-xl font-bold tracking-widest uppercase" style={{ color: ACCENT }}>PULSE OPERATOR</div>
            <div className="mt-1 text-xs text-white/40 font-mono">Controle de acesso · Modo restrito</div>
          </div>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">E-mail</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-white placeholder-white/25 focus:border-white/30 focus:outline-none"
              placeholder="operador@evento.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">Senha</label>
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-white placeholder-white/25 focus:border-white/30 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <button
            type="submit" disabled={loading || !email || !password}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ScanLine className="h-5 w-5" />Entrar</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function SelectEventScreen({
  onSelect, onBack,
}: { onSelect: (e: EventInfo) => void; onBack: () => void }) {
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<EventInfo[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')

  const filtered = events.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleCodeSubmit() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    const { data } = await supabase
      .from('events').select('id, name, date_start, location_name, status')
      .eq('event_code', trimmed).single()
    setLoading(false)
    if (data) {
      onSelect({ id: data.id, name: data.name, date: data.date_start ?? '', venue: data.location_name ?? '', status: data.status })
    }
  }

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Selecionar Evento" onBack={onBack} />
      <MobileScreen className="px-4 py-4 space-y-4">
        {/* Code entry */}
        <div className="rounded-xl bg-white/6 p-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-white/50">Código direto</div>
          <div className="flex gap-2">
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              className="h-12 flex-1 rounded-xl border border-white/10 bg-black px-4 font-mono text-lg tracking-widest text-white placeholder-white/20 uppercase focus:border-white/30 focus:outline-none"
              maxLength={8}
            />
            <button
              onClick={() => void handleCodeSubmit()}
              disabled={loading || code.length < 4}
              className="h-12 w-12 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <ChevronRight className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/6 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {filtered.map((ev) => (
            <button
              key={ev.id} onClick={() => onSelect(ev)}
              className="w-full rounded-xl bg-white/6 p-4 text-left transition-colors active:bg-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{ev.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{ev.date}</div>
                  <div className="text-xs text-white/40 mt-0.5">{ev.venue}</div>
                </div>
                <span className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                  ev.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400',
                )}>
                  {ev.status === 'ongoing' ? 'Ao vivo' : 'Publicado'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </MobileScreen>
    </MobileShell>
  )
}

function SelectGateScreen({
  event, onSelect, onBack,
}: { event: EventInfo; onSelect: (g: GateInfo) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const gates: GateInfo[] = [{ id: 'all', name: 'Todas as portarias', type: 'all' }, ...MOCK_GATES]

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Selecionar Portaria" subtitle={event.name} onBack={onBack} />
      <MobileScreen className="px-4 py-4 flex flex-col gap-4">
        <div className="space-y-2 flex-1">
          {gates.map((g) => (
            <button
              key={g.id} onClick={() => setSelected(g.id)}
              className={cn(
                'w-full rounded-xl p-4 text-left transition-all border',
                selected === g.id
                  ? 'border-blue-500/60 bg-blue-500/10'
                  : 'border-white/8 bg-white/6 active:bg-white/10',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{g.name}</div>
                  {g.type !== 'all' && (
                    <div className="text-xs text-white/40 mt-0.5 capitalize">{g.type}</div>
                  )}
                </div>
                {selected === g.id && (
                  <CheckCircle2 className="h-5 w-5" style={{ color: ACCENT }} />
                )}
              </div>
            </button>
          ))}
        </div>
        <button
          disabled={!selected}
          onClick={() => {
            const gate = gates.find((g) => g.id === selected)
            if (gate) onSelect(gate)
          }}
          className="h-14 w-full rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 safe-bottom"
          style={{ backgroundColor: ACCENT }}
        >
          Iniciar Turno
        </button>
      </MobileScreen>
    </MobileShell>
  )
}

function ValidationOverlay({
  status, name, onDismiss,
}: { status: ScanStatus | null; name: string; onDismiss: () => void }) {
  useEffect(() => {
    if (!status) return
    const t = setTimeout(onDismiss, 2200)
    return () => clearTimeout(t)
  }, [status, onDismiss])

  if (!status) return null

  const isValid = status === 'valid'
  const bg = isValid ? '#22C55E' : '#EF4444'
  const Icon = isValid ? CheckCircle2 : XCircle

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: bg }}
      onClick={onDismiss}
    >
      <Icon className="h-20 w-20 text-white" />
      <div className="text-3xl font-bold text-white">{STATUS_LABELS[status]}</div>
      {name && <div className="text-lg text-white/90 font-medium">{name}</div>}
    </div>
  )
}

function ScannerScreen({
  event, gate, onManualSearch, onHistory, onOfflineQueue, onShiftSummary, onReset,
  scans, addScan, isOnline,
}: {
  event: EventInfo; gate: GateInfo
  onManualSearch: () => void; onHistory: () => void
  onOfflineQueue: () => void; onShiftSummary: () => void; onReset: () => void
  scans: ScanRecord[]; addScan: (s: ScanRecord) => void; isOnline: boolean
}) {
  const [overlayStatus, setOverlayStatus] = useState<ScanStatus | null>(null)
  const [overlayName, setOverlayName] = useState('')
  const [scanLine, setScanLine] = useState(0)
  const [activeTab, setActiveTab] = useState('scanner')

  useEffect(() => {
    const id = setInterval(() => setScanLine((l) => (l + 2) % 100), 16)
    return () => clearInterval(id)
  }, [])

  function simulateScan() {
    const statuses: ScanStatus[] = ['valid', 'valid', 'valid', 'valid', 'invalid', 'duplicate']
    const names = ['Ana Lima', 'Carlos Melo', 'Julia Rosa', 'Pedro Silva', 'Maria Santos']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const name = names[Math.floor(Math.random() * names.length)]
    setOverlayStatus(status)
    setOverlayName(name)
    addScan({ id: randomId(), time: now(), name, status, gate: gate.name })
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    if (tab === 'history') onHistory()
    if (tab === 'offline-queue') onOfflineQueue()
    if (tab === 'shift-summary') onShiftSummary()
  }

  const lastScans = scans.slice(0, 3)

  return (
    <MobileShell accent="blue">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ValidationOverlay status={overlayStatus} name={overlayName} onDismiss={() => setOverlayStatus(null)} />

        {/* Header */}
        <header className="safe-top flex shrink-0 items-center justify-between border-b border-white/8 bg-black/95 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ScanLine className="h-5 w-5 shrink-0" style={{ color: ACCENT }} />
            <div>
              <div className="font-mono text-sm font-bold uppercase tracking-widest" style={{ color: ACCENT }}>PULSE OPERATOR</div>
              <div className="text-[11px] text-white/40 truncate max-w-[180px]">{event.name} · {gate.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-mono',
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button onClick={onReset} className="rounded-full bg-white/8 p-2 active:bg-white/15">
              <LogOut className="h-4 w-4 text-white/50" />
            </button>
          </div>
        </header>

        {/* Scanner área */}
        <div className="relative flex-1 flex flex-col items-center justify-center bg-gray-950">
          {/* QR frame */}
          <div className="relative h-64 w-64">
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
            {/* Corner indicators */}
            {[['top-0 left-0', 'border-t-2 border-l-2'], ['top-0 right-0', 'border-t-2 border-r-2'],
              ['bottom-0 left-0', 'border-b-2 border-l-2'], ['bottom-0 right-0', 'border-b-2 border-r-2']].map(([pos, borders], i) => (
              <div key={i} className={cn('absolute h-8 w-8 rounded-sm', pos, borders)} style={{ borderColor: ACCENT }} />
            ))}
            {/* Scan line animation */}
            <div
              className="absolute left-2 right-2 h-0.5 opacity-80 transition-none"
              style={{ top: `${scanLine}%`, backgroundColor: ACCENT }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <QrCode className="h-16 w-16 text-white/15" />
              <span className="text-xs text-white/30 font-mono">Aponte para o QR Code</span>
            </div>
          </div>
          <button
            onClick={simulateScan}
            className="mt-6 flex h-14 items-center gap-2 rounded-xl px-8 font-bold text-white active:scale-[0.98]"
            style={{ backgroundColor: ACCENT }}
          >
            <Zap className="h-5 w-5" />Simular Scan
          </button>
          <div className="mt-3 flex gap-4">
            <button onClick={onManualSearch} className="flex items-center gap-1.5 text-sm text-white/50 active:text-white">
              <Search className="h-4 w-4" />Busca manual
            </button>
          </div>
        </div>

        {/* Last scans strip */}
        {lastScans.length > 0 && (
          <div className="shrink-0 border-t border-white/8 bg-black px-4 py-3 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/30">Últimos scans</div>
            {lastScans.map((s, i) => (
              <div key={s.id} className={cn('flex items-center gap-3 rounded-lg px-3 py-2', i === 0 ? 'opacity-100' : 'opacity-40',
                s.status === 'valid' ? 'bg-green-500/10' : 'bg-red-500/10')}>
                <StatusDot status={s.status} />
                <span className="flex-1 truncate text-xs text-white">{s.name}</span>
                <span className={cn('text-[10px] font-mono uppercase', s.status === 'valid' ? 'text-green-400' : 'text-red-400')}>
                  {STATUS_LABELS[s.status]}
                </span>
                <span className="text-[10px] font-mono text-white/30">{s.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <MobileTabBar tabs={TABS} active={activeTab} onChange={handleTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function ManualSearchScreen({ onBack, addScan }: { onBack: () => void; addScan: (s: ScanRecord) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ name: string; type: string; status: string }>>([])
  const [loading, setLoading] = useState(false)
  const [overlay, setOverlay] = useState<{ status: ScanStatus; name: string } | null>(null)

  const MOCK_RESULTS = [
    { name: 'Ana Lima', type: 'VIP', status: 'valid' },
    { name: 'Carlos Silva', type: 'Pista', status: 'used' },
    { name: 'Julia Santos', type: 'Pista', status: 'valid' },
  ]

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setResults(MOCK_RESULTS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())))
    setLoading(false)
  }

  function handleValidate(r: typeof MOCK_RESULTS[0]) {
    const s: ScanStatus = r.status === 'used' ? 'duplicate' : 'valid'
    setOverlay({ status: s, name: r.name })
    addScan({ id: randomId(), time: now(), name: r.name, status: s, gate: 'Busca manual' })
  }

  return (
    <MobileShell accent="blue">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {overlay && (
          <ValidationOverlay status={overlay.status} name={overlay.name} onDismiss={() => { setOverlay(null); onBack() }} />
        )}
        <MobileHeader title="Busca Manual" onBack={onBack} />
        <MobileScreen className="px-4 py-4 space-y-4">
          <div className="flex gap-2">
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
              placeholder="Nome, CPF ou código..."
              className="h-12 flex-1 rounded-xl border border-white/10 bg-white/6 px-4 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
            />
            <button
              onClick={() => void handleSearch()} disabled={loading}
              className="h-12 w-12 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Search className="h-5 w-5 text-white" />}
            </button>
          </div>
          {results.length === 0 && !loading && query && (
            <MobileEmptyState icon={Search} title="Nenhum resultado" subtitle="Tente outro nome ou código" />
          )}
          <div className="space-y-2">
            {results.map((r, i) => (
              <button key={i} onClick={() => handleValidate(r)}
                className="w-full rounded-xl bg-white/6 p-4 text-left active:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">Ingresso {r.type}</div>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    r.status === 'valid' ? 'bg-green-500/15 text-green-400' : 'bg-orange-500/15 text-orange-400')}>
                    {r.status === 'valid' ? 'Disponível' : 'Utilizado'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </MobileScreen>
      </div>
    </MobileShell>
  )
}

function HistoryScreen({ scans, onBack, onTabChange }: { scans: ScanRecord[]; onBack: () => void; onTabChange: (t: string) => void }) {
  const [filter, setFilter] = useState<'hoje' | '2h' | 'todos'>('hoje')
  const valid = scans.filter((s) => s.status === 'valid').length
  const invalid = scans.length - valid

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Histórico" right={
        <div className="flex gap-1">
          {(['hoje', '2h', 'todos'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                filter === f ? 'text-white' : 'text-white/40')}
              style={filter === f ? { backgroundColor: ACCENT } : undefined}>
              {f === '2h' ? 'Últ. 2h' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      } />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-green-500/10 p-4">
            <div className="text-2xl font-bold font-mono text-green-400">{valid}</div>
            <div className="text-xs text-white/50 mt-1">Entradas</div>
          </div>
          <div className="rounded-xl bg-red-500/10 p-4">
            <div className="text-2xl font-bold font-mono text-red-400">{invalid}</div>
            <div className="text-xs text-white/50 mt-1">Inválidos</div>
          </div>
        </div>
        {scans.length === 0 ? (
          <MobileEmptyState icon={History} title="Nenhum scan" subtitle="Os scans aparecerão aqui" />
        ) : (
          <div className="space-y-1.5">
            {scans.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <StatusDot status={s.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.name}</div>
                  <div className="text-xs text-white/40">{s.gate}</div>
                </div>
                <div className="text-right">
                  <div className={cn('text-xs font-semibold', s.status === 'valid' ? 'text-green-400' : 'text-red-400')}>
                    {STATUS_LABELS[s.status]}
                  </div>
                  <div className="text-[10px] font-mono text-white/30">{s.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="history" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function OfflineQueueScreen({
  queue, isOnline, onSync, onTabChange,
}: { queue: OfflineItem[]; isOnline: boolean; onSync: () => void; onTabChange: (t: string) => void }) {
  const pending = queue.filter((q) => !q.synced).length

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Fila Offline" right={
        <div className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono',
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      } />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-xl bg-white/6 p-5 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold font-mono" style={{ color: pending > 0 ? '#d97706' : '#22C55E' }}>{pending}</div>
            <div className="text-xs text-white/50 mt-1">Itens pendentes</div>
          </div>
          <button
            disabled={!isOnline || pending === 0}
            onClick={onSync}
            className="flex h-12 items-center gap-2 rounded-xl px-5 font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            <RefreshCw className="h-4 w-4" />Sincronizar
          </button>
        </div>
        {queue.length === 0 ? (
          <MobileEmptyState icon={Upload} title="Fila vazia" subtitle="Todos os scans estão sincronizados" />
        ) : (
          <div className="space-y-2">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <StatusDot status={item.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/60 truncate">{item.token}</div>
                  <div className="text-xs text-white/40">{item.gate} · {item.time}</div>
                </div>
                <span className={cn('text-xs font-semibold', item.synced ? 'text-green-400' : 'text-orange-400')}>
                  {item.synced ? 'Sincronizado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="offline-queue" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function SyncScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const steps = [
    'Conectando ao servidor...',
    'Autenticando dispositivo...',
    'Enviando scans pendentes...',
    'Verificando integridade...',
    'Sincronização concluída!',
  ]

  useEffect(() => {
    let step = 0
    const id = setInterval(() => {
      if (step < steps.length) {
        setLogs((l) => [...l, steps[step]])
        setProgress(Math.round(((step + 1) / steps.length) * 100))
        step++
      } else {
        clearInterval(id)
        setDone(true)
      }
    }, 700)
    return () => clearInterval(id)
  }, [])

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Sincronização" />
      <MobileScreen className="px-4 py-8 flex flex-col items-center gap-6">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
              stroke={done ? '#22C55E' : ACCENT}
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {done
              ? <CheckCircle2 className="h-10 w-10 text-green-400" />
              : <RefreshCw className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
            }
          </div>
        </div>
        <div className="w-full rounded-xl bg-white/5 p-4 space-y-2 font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className={cn('text-xs', i === logs.length - 1 ? 'text-white' : 'text-white/40')}>
              {'>'} {log}
            </div>
          ))}
        </div>
        {done && (
          <button onClick={onComplete}
            className="h-14 w-full rounded-xl font-bold text-white"
            style={{ backgroundColor: ACCENT }}>
            Voltar
          </button>
        )}
      </MobileScreen>
    </MobileShell>
  )
}

function ShiftSummaryScreen({
  auth, event, gate, scans, startTime, onEnd, onTabChange,
}: {
  auth: AuthUser; event: EventInfo; gate: GateInfo
  scans: ScanRecord[]; startTime: Date; onEnd: () => void; onTabChange: (t: string) => void
}) {
  const [confirmEnd, setConfirmEnd] = useState(false)
  const valid = scans.filter((s) => s.status === 'valid').length
  const invalid = scans.length - valid
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000)

  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    h: `${14 + i}h`,
    count: Math.floor(Math.random() * 30),
  }))
  const maxCount = Math.max(...hourlyData.map((d) => d.count), 1)

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Resumo do Turno" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-xl bg-white/6 p-4 space-y-1">
          <div className="text-xs text-white/50">Operador</div>
          <div className="font-semibold text-white">{auth.email}</div>
          <div className="text-xs text-white/40 mt-2">{event.name} · {gate.name}</div>
          <div className="text-xs text-white/40">Início: {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {elapsed} min</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total', value: scans.length, color: 'text-white' },
            { label: 'Válidos', value: valid, color: 'text-green-400' },
            { label: 'Inválidos', value: invalid, color: 'text-red-400' },
            { label: 'Offline', value: 0, color: 'text-orange-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-white/6 p-4">
              <div className={cn('text-2xl font-bold font-mono', kpi.color)}>{kpi.value}</div>
              <div className="text-xs text-white/40 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/6 p-4">
          <div className="text-xs text-white/50 mb-3">Entradas por hora</div>
          <div className="flex items-end gap-1 h-16">
            {hourlyData.map((d) => (
              <div key={d.h} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t" style={{ height: `${(d.count / maxCount) * 48}px`, backgroundColor: ACCENT, opacity: 0.7 }} />
                <span className="text-[9px] text-white/30 font-mono">{d.h}</span>
              </div>
            ))}
          </div>
        </div>
        {confirmEnd ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
            <div className="text-sm font-semibold text-red-400">Encerrar turno?</div>
            <div className="text-xs text-white/50">Todos os dados serão sincronizados e o turno será encerrado.</div>
            <div className="flex gap-2">
              <button onClick={onEnd} className="flex-1 h-12 rounded-xl bg-red-500 font-semibold text-white">Encerrar</button>
              <button onClick={() => setConfirmEnd(false)} className="flex-1 h-12 rounded-xl bg-white/8 font-semibold text-white">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmEnd(true)}
            className="h-14 w-full rounded-xl border border-red-500/30 bg-red-500/10 font-semibold text-red-400 active:bg-red-500/20">
            Encerrar Turno
          </button>
        )}
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="shift-summary" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OperatorApp() {
  const { current, push, pop, reset } = useMobileNav<Screen>('login')
  const [auth, setAuth] = useState<AuthUser | null>(null)
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [gate, setGate] = useState<GateInfo | null>(null)
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [offlineQueue, setOfflineQueue] = useState<OfflineItem[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [startTime] = useState(new Date())
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const addScan = useCallback((s: ScanRecord) => {
    setScans((prev) => [s, ...prev])
    if (!isOnline) {
      setOfflineQueue((prev) => [{
        id: s.id, token: `QR-${randomId().toUpperCase()}`,
        time: s.time, gate: s.gate, status: s.status, synced: false,
      }, ...prev])
    }
  }, [isOnline])

  function handleTabChange(tab: string) {
    const map: Record<string, Screen> = {
      scanner: 'scanner', history: 'history',
      'offline-queue': 'offline-queue', 'shift-summary': 'shift-summary',
    }
    reset(map[tab] ?? 'scanner')
  }

  function handleReset() {
    setAuth(null); setEvent(null); setGate(null); setScans([]); reset('login')
  }

  if (showSync) return <SyncScreen onComplete={() => setShowSync(false)} />

  switch (current.screen) {
    case 'login':
      return <LoginScreen onLogin={(u) => { setAuth(u); push('select-event') }} />
    case 'select-event':
      return <SelectEventScreen onSelect={(e) => { setEvent(e); push('select-gate') }} onBack={() => reset('login')} />
    case 'select-gate':
      return event ? (
        <SelectGateScreen event={event} onSelect={(g) => { setGate(g); reset('scanner') }} onBack={() => reset('select-event')} />
      ) : null
    case 'scanner':
      return auth && event && gate ? (
        <ScannerScreen
          event={event} gate={gate} isOnline={isOnline}
          scans={scans} addScan={addScan}
          onManualSearch={() => push('manual-search')}
          onHistory={() => reset('history')}
          onOfflineQueue={() => reset('offline-queue')}
          onShiftSummary={() => reset('shift-summary')}
          onReset={handleReset}
        />
      ) : null
    case 'manual-search':
      return <ManualSearchScreen onBack={() => pop()} addScan={addScan} />
    case 'history':
      return <HistoryScreen scans={scans} onBack={() => reset('scanner')} onTabChange={handleTabChange} />
    case 'offline-queue':
      return (
        <OfflineQueueScreen
          queue={offlineQueue} isOnline={isOnline}
          onSync={() => setShowSync(true)}
          onTabChange={handleTabChange}
        />
      )
    case 'shift-summary':
      return auth && event && gate ? (
        <ShiftSummaryScreen
          auth={auth} event={event} gate={gate} scans={scans} startTime={startTime}
          onEnd={handleReset} onTabChange={handleTabChange}
        />
      ) : null
    default:
      return null
  }
}
