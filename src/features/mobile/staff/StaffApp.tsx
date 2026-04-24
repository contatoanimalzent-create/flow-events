import { useState, useEffect } from 'react'
import {
  AlertTriangle, Bell, BookOpen, CheckCircle2, ChevronRight,
  Clock, FileText, Home, Loader2, LogOut, MapPin, MessageSquare,
  Navigation, Plus, Shield, Star, Users, X,
} from 'lucide-react'
import { cn } from '@/shared/lib'
import { MobileShell, MobileScreen } from '@/features/mobile/shared/MobileShell'
import { MobileHeader, MobileTabBar } from '@/features/mobile/shared/MobileHeader'
import { MobileBtn, MobileCard, MobileEmptyState, MobileListItem } from '@/features/mobile/shared/MobileUI'
import { useMobileNav } from '@/features/mobile/shared/useMobileNav'

type Screen = 'login' | 'my-event' | 'my-shift' | 'my-location' | 'presence' | 'zone-alert' | 'documents' | 'instructions' | 'occurrences' | 'notifications' | 'day-history'
type PresenceStatus = 'idle' | 'active' | 'ended'

const ACCENT = '#22C55E'

const TABS = [
  { key: 'home', label: 'Início', icon: Home },
  { key: 'presenca', label: 'Presença', icon: Clock },
  { key: 'comunicacao', label: 'Avisos', icon: Bell },
  { key: 'historico', label: 'Histórico', icon: Star },
]

const MOCK_STAFF = { id: 's1', name: 'Rodrigo Silva', pin: '123456', role: 'Segurança', area: 'Entrada Principal', supervisor: 'Ana Coordenadora' }
const MOCK_EVENT = { name: 'Flow Fest 2026', date: '20 de Abril de 2026', startTime: '14:00', endTime: '23:00', venue: 'Arena São Paulo' }
const MOCK_SHIFT = { date: '20/04/2026', start: '14:00', end: '22:00', area: 'Entrada Principal', supervisor: 'Ana Coordenadora', teammates: [{ id: 't1', name: 'Bruno Costa', role: 'Segurança' }, { id: 't2', name: 'Carla Lima', role: 'Recepção' }] }
const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'announcement' as const, title: 'Portões abertos!', body: 'Posicionem-se nas entradas designadas.', time: '5 min', read: false },
  { id: 'n2', type: 'alert' as const, title: 'Headliner em 30 min', body: 'Reforço na área VIP necessário.', time: '12 min', read: false },
  { id: 'n3', type: 'message' as const, title: 'Ana Coordenadora', body: 'Rodrigo, confirma posição?', time: '20 min', read: true },
]
const MOCK_DOCS = [
  { id: 'd1', name: 'Briefing Operacional', type: 'PDF', size: '1.2 MB' },
  { id: 'd2', name: 'Mapa do Evento', type: 'PDF', size: '3.4 MB' },
  { id: 'd3', name: 'Protocolo de Segurança', type: 'PDF', size: '0.8 MB' },
]
const MOCK_OCCURRENCES = [
  { id: 'o1', type: 'Incidente de segurança', description: 'Pessoa tentou entrar sem ingresso.', time: '15:32', status: 'resolved' as const },
  { id: 'o2', type: 'Problema técnico', description: 'Scanner parou de funcionar por 5 min.', time: '16:10', status: 'pending' as const },
]

function fmt(secs: number) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    if (pin === MOCK_STAFF.pin && code.length >= 4) {
      onLogin()
    } else {
      setError('PIN ou código de evento inválido.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ACCENT}20` }}>
            <Users className="h-8 w-8" style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <div className="font-mono text-xl font-bold uppercase tracking-widest" style={{ color: ACCENT }}>PULSE STAFF</div>
            <div className="mt-1 text-xs text-white/40 font-mono">App da equipe operacional</div>
          </div>
        </div>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">PIN do Staff</label>
            <input type="tel" required maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="h-14 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-center font-mono text-2xl tracking-widest text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
              placeholder="• • • • • •" inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">Código do Evento</label>
            <input type="text" required maxLength={8} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-14 w-full rounded-xl border border-white/10 bg-white/6 px-4 font-mono text-lg uppercase tracking-widest text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
              placeholder="XXXXXX" autoCapitalize="characters" />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <button type="submit" disabled={loading || pin.length < 4 || code.length < 4}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-40 active:scale-[0.98]"
            style={{ backgroundColor: ACCENT }}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function MyEventScreen({ presenceStatus, onViewShift, onViewLocation, onPresence }: {
  presenceStatus: PresenceStatus; onViewShift: () => void; onViewLocation: () => void; onPresence: () => void
}) {
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <div className="rounded-2xl p-5 space-y-2" style={{ background: 'linear-gradient(135deg, #0057E7, #22C55E)' }}>
        <div className="text-xl font-bold text-white">{MOCK_EVENT.name}</div>
        <div className="text-white/80 text-sm">{MOCK_EVENT.date}</div>
        <div className="text-white/60 text-xs">{MOCK_EVENT.venue}</div>
        <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white">EM ANDAMENTO</span>
      </div>
      <div className="rounded-xl bg-white/6 p-4 space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-white/40">Minha Função</div>
        <div className="flex justify-between">
          <div>
            <div className="font-semibold text-white">{MOCK_STAFF.name}</div>
            <div className="text-sm mt-0.5" style={{ color: ACCENT }}>{MOCK_STAFF.role}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40">Supervisor</div>
            <div className="text-sm text-white">{MOCK_STAFF.supervisor}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <MapPin className="h-3.5 w-3.5" />{MOCK_STAFF.area}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ver Turno', icon: Clock, action: onViewShift },
          { label: 'Ver Local', icon: Navigation, action: onViewLocation },
          { label: presenceStatus === 'idle' ? 'Presença' : 'Presença Ativa', icon: CheckCircle2, action: onPresence },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action}
            className="flex flex-col items-center gap-2 rounded-xl bg-white/6 py-4 active:bg-white/10">
            <btn.icon className="h-5 w-5" style={{ color: presenceStatus === 'active' && btn.label.includes('Presença') ? ACCENT : 'rgba(255,255,255,0.6)' }} />
            <span className="text-xs text-white/60 text-center leading-tight">{btn.label}</span>
          </button>
        ))}
      </div>
    </MobileScreen>
  )
}

function MyShiftScreen({ onBack }: { onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Meu Turno" onBack={onBack} />
      <div className="rounded-xl bg-white/6 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[['Data', MOCK_SHIFT.date], ['Início', MOCK_SHIFT.start], ['Término', MOCK_SHIFT.end], ['Área', MOCK_SHIFT.area]].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">{l}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Supervisor</div>
          <div className="text-sm font-semibold text-white">{MOCK_SHIFT.supervisor}</div>
        </div>
        <span className="inline-block rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-semibold text-green-400">EM ANDAMENTO</span>
      </div>
      <div className="rounded-xl bg-white/6 p-4 space-y-1">
        <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Progresso do turno</div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '45%', backgroundColor: ACCENT }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1">
          <span>{MOCK_SHIFT.start}</span><span>45%</span><span>{MOCK_SHIFT.end}</span>
        </div>
      </div>
      <div className="rounded-xl bg-white/6 p-4">
        <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Equipe na área</div>
        <div className="space-y-2">
          {MOCK_SHIFT.teammates.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: `${ACCENT}30` }}>
                {t.name[0]}
              </div>
              <div>
                <div className="text-sm text-white">{t.name}</div>
                <div className="text-xs text-white/40">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  )
}

function MyLocationScreen({ inZone, onToggle, onBack }: { inZone: boolean; onToggle: () => void; onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Meu Local" onBack={onBack} />
      <div className={cn('rounded-xl p-4 flex items-center gap-3', inZone ? 'bg-green-500/10' : 'bg-red-500/10 animate-pulse')}>
        {inZone
          ? <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
          : <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />}
        <div>
          <div className={cn('font-bold', inZone ? 'text-green-400' : 'text-red-400')}>
            {inZone ? 'DENTRO DA ÁREA' : 'FORA DA ÁREA'}
          </div>
          <div className="text-xs text-white/50">{MOCK_STAFF.area}</div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden bg-gray-900">
        <svg viewBox="0 0 200 120" className="w-full">
          <rect width="200" height="120" fill="#111" rx="8" />
          <rect x="20" y="20" width="80" height="60" fill={`${inZone ? '#22C55E' : '#0057E7'}15`} stroke={inZone ? '#22C55E' : '#0057E7'} strokeWidth="1" rx="4" />
          <text x="60" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Entrada Principal</text>
          <circle cx={inZone ? 55 : 150} cy={inZone ? 50 : 85} r="6" fill={inZone ? '#22C55E' : '#EF4444'} />
          <circle cx={inZone ? 55 : 150} cy={inZone ? 50 : 85} r="10" fill={inZone ? '#22C55E' : '#EF4444'} fillOpacity="0.3" />
        </svg>
      </div>
      <div className="text-xs text-white/40 text-center">Última atualização: agora</div>
      <button onClick={onToggle} className="h-12 w-full rounded-xl bg-white/8 text-sm font-medium text-white/60 active:bg-white/12">
        {inZone ? '⚠ Simular saída de área' : '✓ Simular retorno à área'}
      </button>
    </MobileScreen>
  )
}

function PresenceScreen({ status, elapsed, inZone, onStart, onEnd }: {
  status: PresenceStatus; elapsed: number; inZone: boolean; onStart: () => void; onEnd: () => void
}) {
  const [confirm, setConfirm] = useState(false)

  if (status === 'idle') return (
    <MobileScreen className="px-4 py-8 flex flex-col items-center justify-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${ACCENT}20` }}>
        <Clock className="h-10 w-10" style={{ color: ACCENT }} />
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">Iniciar Presença</div>
        <div className="text-sm text-white/50 mt-1">Turno {MOCK_SHIFT.start}-{MOCK_SHIFT.end}</div>
        <div className="text-xs text-white/40 mt-0.5">{MOCK_STAFF.area}</div>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-2 text-xs text-green-400">
        <MapPin className="h-3.5 w-3.5" />GPS: Permitido
      </div>
      <button onClick={onStart} className="h-16 w-full rounded-2xl font-bold text-lg text-white active:scale-[0.98]" style={{ backgroundColor: ACCENT }}>
        INICIAR PRESENÇA
      </button>
      <div className="text-xs text-white/30 text-center px-4">Sua presença será registrada com localização GPS</div>
    </MobileScreen>
  )

  if (status === 'ended') return (
    <MobileScreen className="px-4 py-8 flex flex-col items-center justify-center gap-6">
      <CheckCircle2 className="h-20 w-20 text-green-400" />
      <div className="text-center">
        <div className="text-xl font-bold text-white">TURNO ENCERRADO</div>
        <div className="text-sm text-white/50 mt-2">Total: {fmt(elapsed)}</div>
        <div className="text-xs text-white/40 mt-1">Início: {MOCK_SHIFT.start} · Área: {MOCK_STAFF.area}</div>
      </div>
    </MobileScreen>
  )

  return (
    <MobileScreen className="px-4 py-6 flex flex-col items-center gap-6">
      {confirm && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-8 gap-6">
          <div className="text-lg font-bold text-white">Encerrar turno?</div>
          <div className="text-sm text-white/50 text-center">Seu tempo será registrado e o turno encerrado.</div>
          <div className="flex w-full gap-3">
            <button onClick={() => { setConfirm(false); onEnd() }} className="flex-1 h-14 rounded-xl bg-red-500 font-bold text-white">Encerrar</button>
            <button onClick={() => setConfirm(false)} className="flex-1 h-14 rounded-xl bg-white/10 font-bold text-white">Cancelar</button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
        <span className="text-sm font-semibold" style={{ color: ACCENT }}>PRESENÇA ATIVA</span>
      </div>
      <div className="font-mono text-6xl font-bold text-white tracking-tight">{fmt(elapsed)}</div>
      <div className={cn('rounded-full px-4 py-2 text-xs font-semibold', inZone ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
        {inZone ? '✓ DENTRO DA ÁREA' : '⚠ FORA DA ÁREA'}
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {[['Início', MOCK_SHIFT.start], ['Local', MOCK_STAFF.area]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-white/6 p-3 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">{l}</div>
            <div className="text-sm font-semibold text-white mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setConfirm(true)} className="h-14 w-full rounded-xl border border-red-500/30 bg-red-500/10 font-semibold text-red-400 active:bg-red-500/20">
        ENCERRAR PRESENÇA
      </button>
    </MobileScreen>
  )
}

function DocumentsScreen({ onBack }: { onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-2">
      <MobileHeader title="Documentos" onBack={onBack} />
      {MOCK_DOCS.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 rounded-xl bg-white/6 px-4 py-3.5">
          <FileText className="h-5 w-5 text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">{doc.name}</div>
            <div className="text-xs text-white/40">{doc.type} · {doc.size}</div>
          </div>
          <button className="rounded-lg bg-white/8 px-3 py-1.5 text-xs text-white/60 active:bg-white/15">Ver</button>
        </div>
      ))}
    </MobileScreen>
  )
}

function InstructionsScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>('geral')
  const sections = [
    { id: 'geral', title: 'Instruções Gerais', content: 'Mantenha-se no posto designado durante todo o turno. Comunique qualquer intercorrência imediatamente ao supervisor. Use o rádio canal 3 para comunicações internas. Em caso de emergência, acione o protocolo de evacuação.' },
    { id: 'area', title: `Área: ${MOCK_STAFF.area}`, content: 'Verifique todos os ingressos na entrada. Não permita reentrada sem autorização do supervisor. Mantenha a fila organizada. Monitore a capacidade da área, máximo 500 pessoas.' },
    { id: 'emergencia', title: 'Emergência', content: 'Polícia: 190 | SAMU: 192 | Bombeiros: 193 | Coordenação interna: ramal 9999. Em caso de evacuação, guie o público para as saídas sinalizadas em verde.' },
  ]
  return (
    <MobileScreen className="px-4 py-4 space-y-2">
      <MobileHeader title="Instruções" onBack={onBack} />
      {sections.map((s) => (
        <div key={s.id} className="rounded-xl bg-white/6 overflow-hidden">
          <button onClick={() => setOpen(open === s.id ? null : s.id)}
            className="flex w-full items-center justify-between px-4 py-4 active:bg-white/8">
            <span className="font-medium text-white text-sm">{s.title}</span>
            <ChevronRight className={cn('h-4 w-4 text-white/40 transition-transform', open === s.id && 'rotate-90')} />
          </button>
          {open === s.id && <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed">{s.content}</div>}
        </div>
      ))}
    </MobileScreen>
  )
}

function OccurrencesScreen({ onBack }: { onBack: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('Segurança')
  const [desc, setDesc] = useState('')
  const types = ['Segurança', 'Técnico', 'Reclamação', 'Outro']
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Ocorrências" onBack={onBack} right={
        <button onClick={() => setShowForm(!showForm)} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: ACCENT }}>
          <Plus className="h-4 w-4 text-white" />
        </button>
      } />
      {showForm && (
        <div className="rounded-xl border border-white/10 bg-white/6 p-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Nova Ocorrência</div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', type === t ? 'text-white' : 'bg-white/8 text-white/50')}
                style={type === t ? { backgroundColor: ACCENT } : undefined}>{t}</button>
            ))}
          </div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descreva o que aconteceu..."
            className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-white placeholder-white/25 focus:border-white/30 focus:outline-none resize-none h-24" />
          <button onClick={() => { setShowForm(false); setDesc('') }}
            className="h-12 w-full rounded-xl font-semibold text-white" style={{ backgroundColor: ACCENT }}>
            Enviar Ocorrência
          </button>
        </div>
      )}
      <div className="space-y-2">
        {MOCK_OCCURRENCES.map((o) => (
          <div key={o.id} className="rounded-xl bg-white/6 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{o.type}</div>
                <div className="text-xs text-white/50 mt-0.5">{o.description}</div>
              </div>
              <div className="text-right shrink-0">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  o.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400')}>
                  {o.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                </span>
                <div className="text-[10px] font-mono text-white/30 mt-1">{o.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileScreen>
  )
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [read, setRead] = useState<Set<string>>(new Set())
  const icons = { announcement: Bell, alert: AlertTriangle, message: MessageSquare }
  const colors = { announcement: 'text-blue-400 border-blue-500/40', alert: 'text-orange-400 border-orange-500/40', message: 'text-white/60 border-white/10' }
  return (
    <MobileScreen className="px-4 py-4 space-y-2">
      <MobileHeader title="Notificações" onBack={onBack} right={
        <button onClick={() => setRead(new Set(MOCK_NOTIFICATIONS.map((n) => n.id)))} className="text-xs text-white/50 active:text-white">Ler tudo</button>
      } />
      {MOCK_NOTIFICATIONS.map((n) => {
        const Icon = icons[n.type]
        const isRead = read.has(n.id) || n.read
        return (
          <button key={n.id} onClick={() => { setExpanded(expanded === n.id ? null : n.id); setRead((r) => new Set([...r, n.id])) }}
            className={cn('w-full rounded-xl border-l-2 bg-white/6 px-4 py-4 text-left active:bg-white/8', colors[n.type])}>
            <div className="flex items-start gap-3">
              <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colors[n.type].split(' ')[0])} />
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold', isRead ? 'text-white/60' : 'text-white')}>{n.title}</div>
                <div className={cn('text-xs mt-0.5', isRead ? 'text-white/30' : 'text-white/50', expanded === n.id ? '' : 'truncate')}>{n.body}</div>
                {expanded !== n.id && <div className="text-[10px] font-mono text-white/30 mt-1">{n.time} atrás</div>}
              </div>
              {!isRead && <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1" />}
            </div>
          </button>
        )
      })}
    </MobileScreen>
  )
}

function DayHistoryScreen({ onBack }: { onBack: () => void }) {
  const timeline = [
    { time: '14:00', label: 'Check-in de presença', color: '#22C55E' },
    { time: '14:32', label: 'Ocorrência registrada', color: '#d97706' },
    { time: '16:10', label: 'Saída da área', color: '#EF4444' },
    { time: '16:12', label: 'Retorno à área', color: '#22C55E' },
    { time: '22:00', label: 'Check-out de presença', color: '#22C55E' },
  ]
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Histórico do Dia" onBack={onBack} />
      <div className="text-sm text-white/50">{MOCK_EVENT.date}</div>
      <div className="grid grid-cols-3 gap-2">
        {[['8h 00min', 'Trabalhadas'], ['0', 'Ocorrências'], ['1', 'Saídas de área']].map(([v, l]) => (
          <div key={l} className="rounded-xl bg-white/6 p-3 text-center">
            <div className="text-lg font-bold font-mono text-white">{v}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{l}</div>
          </div>
        ))}
      </div>
      <div className="space-y-0">
        {timeline.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
              {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" style={{ minHeight: 24 }} />}
            </div>
            <div className="pb-4">
              <div className="text-xs font-mono text-white/40">{item.time}</div>
              <div className="text-sm text-white">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </MobileScreen>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StaffApp() {
  const { current, push, pop, reset } = useMobileNav<Screen>('login')
  const [loggedIn, setLoggedIn] = useState(false)
  const [presenceStatus, setPresenceStatus] = useState<PresenceStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [inZone, setInZone] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'presenca' | 'comunicacao' | 'historico'>('home')

  useEffect(() => {
    if (presenceStatus !== 'active') return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [presenceStatus])

  function handleTabChange(tab: string) {
    setActiveTab(tab as typeof activeTab)
    const map: Record<string, Screen> = { home: 'my-event', presenca: 'presence', comunicacao: 'notifications', historico: 'day-history' }
    reset(map[tab] ?? 'my-event')
  }

  const isMain = ['my-event', 'presence', 'notifications', 'day-history'].includes(current.screen)

  return (
    <MobileShell accent="green">
      {current.screen === 'login' && <LoginScreen onLogin={() => { setLoggedIn(true); reset('my-event') }} />}
      {loggedIn && (
        <>
          {current.screen === 'my-event' && (
            <MyEventScreen presenceStatus={presenceStatus}
              onViewShift={() => push('my-shift')}
              onViewLocation={() => push('my-location')}
              onPresence={() => { if (!isMain) return; setActiveTab('presenca'); reset('presence') }} />
          )}
          {current.screen === 'my-shift' && <MyShiftScreen onBack={() => pop()} />}
          {current.screen === 'my-location' && (
            <MyLocationScreen inZone={inZone} onToggle={() => setInZone((z) => !z)} onBack={() => pop()} />
          )}
          {current.screen === 'presence' && (
            <PresenceScreen status={presenceStatus} elapsed={elapsed} inZone={inZone}
              onStart={() => setPresenceStatus('active')}
              onEnd={() => { setPresenceStatus('ended') }} />
          )}
          {current.screen === 'documents' && <DocumentsScreen onBack={() => pop()} />}
          {current.screen === 'instructions' && <InstructionsScreen onBack={() => pop()} />}
          {current.screen === 'occurrences' && <OccurrencesScreen onBack={() => pop()} />}
          {current.screen === 'notifications' && <NotificationsScreen onBack={() => reset('my-event')} />}
          {current.screen === 'day-history' && <DayHistoryScreen onBack={() => reset('my-event')} />}
          {isMain && <MobileTabBar tabs={TABS} active={activeTab} onChange={handleTabChange} accent={ACCENT} />}
        </>
      )}
    </MobileShell>
  )
}
