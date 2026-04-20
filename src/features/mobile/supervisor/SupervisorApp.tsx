import { useState } from 'react'
import {
  AlertTriangle, Bell, CheckCircle2, ChevronRight, ClipboardList,
  Loader2, Map, Phone, Shield, Users, X, XCircle, Plus,
} from 'lucide-react'
import { cn } from '@/shared/lib'
import { MobileShell, MobileScreen } from '@/features/mobile/shared/MobileShell'
import { MobileHeader, MobileTabBar } from '@/features/mobile/shared/MobileHeader'
import { MobileEmptyState } from '@/features/mobile/shared/MobileUI'
import { useMobileNav } from '@/features/mobile/shared/useMobileNav'

type Screen = 'login' | 'team-live' | 'late' | 'absent' | 'out-of-zone' | 'team-map' | 'occurrences' | 'approvals' | 'alerts'

const ACCENT = '#7C3AED'

const TABS = [
  { key: 'equipe', label: 'Equipe', icon: Users },
  { key: 'mapa', label: 'Mapa', icon: Map },
  { key: 'ocorrencias', label: 'Ocorrências', icon: ClipboardList },
  { key: 'alertas', label: 'Alertas', icon: Bell },
]

type StaffMember = typeof MOCK_TEAM[0]

const MOCK_TEAM = [
  { id: '1', name: 'Ana Costa', role: 'Segurança', area: 'Entrada Principal', status: 'active' as const, inZone: true, checkInTime: '14:00', phone: '+55 11 99999-0001' },
  { id: '2', name: 'Bruno Lima', role: 'Recepção', area: 'Área VIP', status: 'active' as const, inZone: false, checkInTime: '14:05', phone: '+55 11 99999-0002' },
  { id: '3', name: 'Carla Mendes', role: 'Segurança', area: 'Pista Principal', status: 'late' as const, inZone: false, checkInTime: null, phone: '+55 11 99999-0003' },
  { id: '4', name: 'Diego Santos', role: 'Bar', area: 'Bar & Alimentação', status: 'absent' as const, inZone: false, checkInTime: null, phone: '+55 11 99999-0004' },
  { id: '5', name: 'Elena Rocha', role: 'Segurança', area: 'Entrada Principal', status: 'active' as const, inZone: true, checkInTime: '13:58', phone: '+55 11 99999-0005' },
  { id: '6', name: 'Felipe Gomes', role: 'Técnico', area: 'Palco', status: 'active' as const, inZone: true, checkInTime: '14:10', phone: '+55 11 99999-0006' },
]

const MOCK_OCCURRENCES = [
  { id: 'o1', type: 'Incidente de segurança', desc: 'Confusão na fila da entrada principal.', reporter: 'Ana Costa', time: '15:32', status: 'pending' as const },
  { id: 'o2', type: 'Problema técnico', desc: 'Scanner offline por 5 minutos.', reporter: 'Felipe Gomes', time: '16:10', status: 'resolved' as const },
  { id: 'o3', type: 'Reclamação', desc: 'Participante reclamou da demora na fila VIP.', reporter: 'Bruno Lima', time: '16:45', status: 'pending' as const },
]

const MOCK_APPROVALS = [
  { id: 'a1', type: 'Saída autorizada', requestor: 'Ana Costa', reason: 'Pausa para refeição', time: '16:00' },
  { id: 'a2', type: 'Troca de área', requestor: 'Felipe Gomes', reason: 'Problema técnico no palco', time: '17:00' },
]

const MOCK_ALERTS = [
  { id: 'al1', severity: 'critical' as const, title: 'Membro fora da zona', desc: 'Bruno Lima está fora da zona há 12 min.', time: '15 min', resolved: false },
  { id: 'al2', severity: 'high' as const, title: 'Ausência não justificada', desc: 'Diego Santos não realizou check-in.', time: '1h', resolved: false },
  { id: 'al3', severity: 'medium' as const, title: 'Área com capacidade baixa', desc: 'Área VIP com apenas 1 staff ativo.', time: '20 min', resolved: true },
]

function statusColor(m: StaffMember) {
  if (m.status === 'absent') return '#EF4444'
  if (m.status === 'late') return '#d97706'
  if (!m.inZone) return '#F97316'
  return '#22C55E'
}

function MemberCard({ m, onTap }: { m: StaffMember; onTap: (m: StaffMember) => void }) {
  return (
    <button onClick={() => onTap(m)} className="w-full flex items-center gap-3 rounded-xl bg-white/6 px-4 py-3.5 active:bg-white/10 text-left">
      <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: `${statusColor(m)}25` }}>
        {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm">{m.name}</div>
        <div className="text-xs text-white/40">{m.role} · {m.area}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-semibold" style={{ color: statusColor(m) }}>
          {m.status === 'absent' ? 'AUSENTE' : m.status === 'late' ? 'ATRASADO' : m.inZone ? 'ATIVO' : 'FORA DA ZONA'}
        </div>
        <div className="text-[10px] font-mono text-white/30">{m.checkInTime ?? '—'}</div>
      </div>
    </button>
  )
}

function MemberOverlay({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70" onClick={onClose}>
      <div className="rounded-t-2xl bg-gray-900 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-white">{member.name}</div>
            <div className="text-sm text-white/50">{member.role} · {member.area}</div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/8 p-2"><X className="h-4 w-4 text-white/60" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['Status', member.status], ['Check-in', member.checkInTime ?? 'N/A'], ['Zona', member.inZone ? 'Dentro' : 'Fora'], ['Cargo', member.role]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-white/6 p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">{l}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${member.phone}`} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm">
            <Phone className="h-4 w-4" />Ligar
          </a>
          <button className="h-12 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: ACCENT }}>
            Registrar exceção
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    onLogin()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ACCENT}20` }}>
            <Shield className="h-8 w-8" style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <div className="font-mono text-xl font-bold uppercase tracking-widest" style={{ color: ACCENT }}>PULSE SUPERVISOR</div>
            <div className="mt-1 text-xs text-white/40 font-mono">Controle da equipe · Acesso restrito</div>
          </div>
        </div>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          {[{ label: 'E-mail', type: 'email', value: email, set: setEmail, ph: 'supervisor@evento.com' },
            { label: 'Senha', type: 'password', value: password, set: setPassword, ph: '••••••••' }].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">{f.label}</label>
              <input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} required
                className="h-14 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-white placeholder-white/25 focus:border-white/30 focus:outline-none" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function TeamLiveScreen({ onMember, onTabChange }: { onMember: (m: StaffMember) => void; onTabChange: (t: string) => void }) {
  const active = MOCK_TEAM.filter((m) => m.status === 'active' && m.inZone).length
  const late = MOCK_TEAM.filter((m) => m.status === 'late').length
  const absent = MOCK_TEAM.filter((m) => m.status === 'absent').length
  const outZone = MOCK_TEAM.filter((m) => m.status === 'active' && !m.inZone).length

  return (
    <MobileShell accent="purple">
      <MobileHeader title="Equipe ao Vivo" subtitle="Flow Fest 2026" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[{ label: 'Ativos', value: active, color: '#22C55E' }, { label: 'Atrasados', value: late, color: '#d97706' },
            { label: 'Ausentes', value: absent, color: '#EF4444' }, { label: 'Fora da zona', value: outZone, color: '#F97316' }].map((k) => (
            <div key={k.label} className="rounded-xl bg-white/6 p-3 text-center">
              <div className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {MOCK_TEAM.map((m) => <MemberCard key={m.id} m={m} onTap={onMember} />)}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="equipe" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function TeamMapScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const zones = [
    { x: 5, y: 5, w: 45, h: 25, label: 'Entrada Principal', color: '#0057E7' },
    { x: 5, y: 35, w: 65, h: 40, label: 'Pista Principal', color: '#7C3AED' },
    { x: 75, y: 5, w: 20, h: 40, label: 'Área VIP', color: '#22C55E' },
    { x: 75, y: 50, w: 20, h: 25, label: 'Bar', color: '#d97706' },
  ]
  const staffDots = MOCK_TEAM.filter((m) => m.status === 'active').map((m, i) => ({
    ...m,
    cx: [15, 82, 20, 82, 25, 20][i] ?? 50,
    cy: [15, 20, 50, 60, 45, 55][i] ?? 50,
  }))

  return (
    <MobileShell accent="purple">
      <MobileHeader title="Mapa da Equipe" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-gray-950">
          <svg viewBox="0 0 100 80" className="w-full">
            <rect width="100" height="80" fill="#0a0a0a" />
            {zones.map((z) => (
              <g key={z.label}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={`${z.color}15`} stroke={z.color} strokeWidth="0.5" rx="2" />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="4">{z.label}</text>
              </g>
            ))}
            {staffDots.map((s) => (
              <g key={s.id} onClick={() => setTooltip(tooltip === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                <circle cx={s.cx} cy={s.cy} r="5" fill={s.inZone ? '#22C55E' : '#F97316'} fillOpacity="0.9" />
                <text x={s.cx} y={s.cy + 1.5} textAnchor="middle" fill="white" fontSize="3" fontWeight="bold">
                  {s.name[0]}
                </text>
                {tooltip === s.id && (
                  <g>
                    <rect x={s.cx - 15} y={s.cy - 12} width="30" height="8" fill="#1a1a1a" rx="2" />
                    <text x={s.cx} y={s.cy - 6} textAnchor="middle" fill="white" fontSize="3">{s.name.split(' ')[0]}</text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>
        <div className="flex gap-4 px-1">
          {[['#22C55E', 'Na zona'], ['#F97316', 'Fora da zona']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />{l}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {MOCK_TEAM.filter((m) => !m.inZone).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/8 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{m.name}</div>
                <div className="text-xs text-white/40">{m.area}</div>
              </div>
              <button className="text-xs text-orange-400 font-semibold active:opacity-70">Chamar</button>
            </div>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="mapa" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function OccurrencesScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'resolvidos'>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const filtered = MOCK_OCCURRENCES.filter((o) =>
    filter === 'todos' || (filter === 'pendentes' && o.status === 'pending') || (filter === 'resolvidos' && o.status === 'resolved'))

  return (
    <MobileShell accent="purple">
      <MobileHeader title="Ocorrências" right={
        <button className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: ACCENT }}>
          <Plus className="h-4 w-4 text-white" />
        </button>
      } />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          {(['todos', 'pendentes', 'resolvidos'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('flex-1 rounded-xl py-2.5 text-xs font-semibold capitalize transition-colors', filter === f ? 'text-white' : 'bg-white/6 text-white/50')}
              style={filter === f ? { backgroundColor: ACCENT } : undefined}>{f}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((o) => (
            <button key={o.id} onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              className="w-full rounded-xl bg-white/6 p-4 text-left active:bg-white/10">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{o.type}</div>
                  <div className={cn('text-xs text-white/50 mt-0.5', expanded !== o.id && 'truncate')}>{o.desc}</div>
                  {expanded === o.id && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-white/40">Reportado por: {o.reporter}</div>
                      <div className="flex gap-2">
                        <button className="flex-1 h-10 rounded-xl bg-green-500/20 text-green-400 text-xs font-semibold">Resolver</button>
                        <button className="flex-1 h-10 rounded-xl bg-red-500/20 text-red-400 text-xs font-semibold">Escalar</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    o.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400')}>
                    {o.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </span>
                  <div className="text-[10px] font-mono text-white/30 mt-1">{o.time}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="ocorrencias" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function ApprovalsScreen({ onBack }: { onBack: () => void }) {
  const [approved, setApproved] = useState<Set<string>>(new Set())
  const [denied, setDenied] = useState<Set<string>>(new Set())
  const pending = MOCK_APPROVALS.filter((a) => !approved.has(a.id) && !denied.has(a.id))

  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Aprovações Pendentes" subtitle={`${pending.length} pendentes`} onBack={onBack} />
      {pending.length === 0
        ? <MobileEmptyState icon={CheckCircle2} title="Tudo aprovado" subtitle="Nenhuma aprovação pendente" />
        : pending.map((a) => (
          <div key={a.id} className="rounded-xl bg-white/6 p-4 space-y-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-white/40">{a.type}</div>
              <div className="font-semibold text-white mt-0.5">{a.requestor}</div>
              <div className="text-sm text-white/60 mt-0.5">{a.reason}</div>
              <div className="text-xs font-mono text-white/30 mt-1">{a.time}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApproved((s) => new Set([...s, a.id]))}
                className="flex-1 h-12 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm active:bg-green-500/30">
                Aprovar
              </button>
              <button onClick={() => setDenied((s) => new Set([...s, a.id]))}
                className="flex-1 h-12 rounded-xl bg-red-500/20 text-red-400 font-semibold text-sm active:bg-red-500/30">
                Recusar
              </button>
            </div>
          </div>
        ))
      }
    </MobileScreen>
  )
}

function AlertsScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [filter, setFilter] = useState<'todos' | 'critical' | 'high' | 'medium'>('todos')
  const [resolved, setResolved] = useState<Set<string>>(new Set(['al3']))
  const filtered = MOCK_ALERTS.filter((a) => filter === 'todos' || a.severity === filter)
  const colors = { critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRÍTICO' },
    high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'ALTO' },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'MÉDIO' } }

  return (
    <MobileShell accent="purple">
      <MobileHeader title="Alertas Críticos" right={
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
          {MOCK_ALERTS.filter((a) => !resolved.has(a.id)).length}
        </span>
      } />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'critical', 'high', 'medium'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('shrink-0 rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-colors', filter === f ? 'text-white' : 'bg-white/6 text-white/50')}
              style={filter === f ? { backgroundColor: ACCENT } : undefined}>
              {f === 'todos' ? 'Todos' : f === 'critical' ? 'Crítico' : f === 'high' ? 'Alto' : 'Médio'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((a) => {
            const c = colors[a.severity]
            const isResolved = resolved.has(a.id)
            return (
              <div key={a.id} className={cn('rounded-xl border p-4', c.bg, c.border, isResolved && 'opacity-40')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn('h-4 w-4 shrink-0', c.text)} />
                      <span className={cn('text-sm font-bold', c.text)}>{a.title}</span>
                      <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold', c.bg, c.text)}>{c.label}</span>
                    </div>
                    <div className="text-xs text-white/60 mt-1 ml-6">{a.desc}</div>
                    <div className="text-[10px] font-mono text-white/30 mt-1 ml-6">{a.time} atrás</div>
                  </div>
                </div>
                {!isResolved && (
                  <button onClick={() => setResolved((s) => new Set([...s, a.id]))}
                    className="mt-3 h-10 w-full rounded-xl bg-white/8 text-xs font-semibold text-white/60 active:bg-white/12">
                    Marcar como resolvido
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="alertas" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SupervisorApp() {
  const { current, push, pop, reset } = useMobileNav<Screen>('login')
  const [loggedIn, setLoggedIn] = useState(false)
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null)
  const [activeTab, setActiveTab] = useState<'equipe' | 'mapa' | 'ocorrencias' | 'alertas'>('equipe')

  function handleTabChange(tab: string) {
    setActiveTab(tab as typeof activeTab)
    const map: Record<string, Screen> = { equipe: 'team-live', mapa: 'team-map', ocorrencias: 'occurrences', alertas: 'alerts' }
    reset(map[tab] ?? 'team-live')
  }

  return (
    <MobileShell accent="purple">
      {current.screen === 'login' && <LoginScreen onLogin={() => { setLoggedIn(true); reset('team-live') }} />}
      {loggedIn && (
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {selectedMember && <MemberOverlay member={selectedMember} onClose={() => setSelectedMember(null)} />}
          {current.screen === 'team-live' && (
            <TeamLiveScreen onMember={(m) => setSelectedMember(m)} onTabChange={handleTabChange} />
          )}
          {current.screen === 'team-map' && <TeamMapScreen onTabChange={handleTabChange} />}
          {current.screen === 'occurrences' && <OccurrencesScreen onTabChange={handleTabChange} />}
          {current.screen === 'approvals' && <ApprovalsScreen onBack={() => pop()} />}
          {current.screen === 'alerts' && <AlertsScreen onTabChange={handleTabChange} />}
        </div>
      )}
    </MobileShell>
  )
}
