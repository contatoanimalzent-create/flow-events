import { useState, useEffect } from 'react'
import {
  Bell, Calendar, ChevronRight, Heart, LayoutGrid, Loader2,
  Map, MessageSquare, QrCode, Search, Share2, Shield, Star, Ticket,
  TrendingUp, User, Users, X, Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib'
import { MobileShell, MobileScreen } from '@/features/mobile/shared/MobileShell'
import { MobileHeader, MobileTabBar } from '@/features/mobile/shared/MobileHeader'
import { MobileEmptyState } from '@/features/mobile/shared/MobileUI'
import { useMobileNav } from '@/features/mobile/shared/useMobileNav'

type Screen = 'onboarding' | 'login' | 'my-tickets' | 'qr-ticket' | 'agenda' | 'session-detail' | 'event-map' | 'feed' | 'notifications' | 'networking' | 'upgrades' | 'upgrade-detail' | 'profile' | 'event-history' | 'purchased-experiences'

const ACCENT = '#0057E7'

const TABS = [
  { key: 'ingressos', label: 'Ingressos', icon: Ticket },
  { key: 'agenda', label: 'Agenda', icon: Calendar },
  { key: 'mapa', label: 'Mapa', icon: Map },
  { key: 'feed', label: 'Feed', icon: LayoutGrid },
  { key: 'perfil', label: 'Perfil', icon: User },
]

const MOCK_USER = { id: 'u1', name: 'João Silva', email: 'joao@email.com' }

const MOCK_EVENT = { name: 'Flow Fest 2026', date: '20 de Abril de 2026', time: '14:00 – 23:00', venue: 'Arena São Paulo' }

const MOCK_TICKETS = [
  { id: 't1', type: 'Pista', holder: 'João Silva', token: 'FLW-2026-A1B2C3', used: false, sector: 'Geral' },
  { id: 't2', type: 'VIP', holder: 'João Silva', token: 'FLW-2026-X9Y8Z7', used: false, sector: 'Área VIP' },
]

const MOCK_AGENDA = [
  { id: 's1', time: '14:00', duration: '60 min', title: 'Abertura', stage: 'Palco Principal', artist: 'DJ Intro', type: 'music' as const, now: false },
  { id: 's2', time: '15:30', duration: '90 min', title: 'Headliner 1', stage: 'Palco Principal', artist: 'The Waves', type: 'music' as const, now: true },
  { id: 's3', time: '16:00', duration: '45 min', title: 'Talk: Futuro da música', stage: 'Palco Alt.', artist: 'Maria Lopes', type: 'talk' as const, now: false },
  { id: 's4', time: '18:00', duration: '120 min', title: 'Headliner 2', stage: 'Palco Principal', artist: 'Neon City', type: 'music' as const, now: false },
  { id: 's5', time: '20:30', duration: '30 min', title: 'Intervalo / Food', stage: 'Alimentação', artist: null, type: 'break' as const, now: false },
  { id: 's6', time: '21:00', duration: '120 min', title: 'Headliner Final', stage: 'Palco Principal', artist: 'FlowMasters', type: 'music' as const, now: false },
]

const MOCK_FEED = [
  { id: 'f1', author: 'Organização', avatar: 'O', text: 'Portões abertos! Bem-vindos ao Flow Fest 2026 🎉', time: '2 min', likes: 142, official: true },
  { id: 'f2', author: 'Rafael M.', avatar: 'R', text: 'Chegando! Alguém mais na fila da entrada sul?', time: '5 min', likes: 23, official: false },
  { id: 'f3', author: 'Organização', avatar: 'O', text: 'The Waves sobe ao palco em 30 minutos. Não perca!', time: '12 min', likes: 89, official: true },
  { id: 'f4', author: 'Ana P.', avatar: 'A', text: 'O Palco Alternativo está incrível! Muito menos lotado que o principal', time: '18 min', likes: 56, official: false },
]

const MOCK_UPGRADES = [
  { id: 'u1', name: 'Upgrade VIP', description: 'Acesso à área VIP com open bar durante todo o evento.', price: 150, available: 18, type: 'upgrade' },
  { id: 'u2', name: 'Meet & Greet', description: 'Encontro exclusivo com The Waves após o show com foto e autógrafo.', price: 500, available: 3, type: 'experience' },
  { id: 'u3', name: 'Networking Pass', description: 'Acesso à área de networking premium com drinks incluídos.', price: 80, available: 42, type: 'networking' },
]

const MOCK_CONNECTIONS = [
  { id: 'c1', name: 'Marina F.', role: 'Produtora Musical', mutual: 2, connected: false },
  { id: 'c2', name: 'Lucas B.', role: 'Engenheiro de Som', mutual: 1, connected: true },
  { id: 'c3', name: 'Sofia C.', role: 'Manager de Artistas', mutual: 4, connected: false },
]

const MOCK_NOTIFS = [
  { id: 'n1', type: 'announcement' as const, title: 'The Waves começa em 10 min!', time: '5 min', read: false },
  { id: 'n2', type: 'promo' as const, title: 'Desconto: Meet & Greet por R$400', time: '20 min', read: false },
  { id: 'n3', type: 'security' as const, title: 'Aviso: Entrada lateral fechada', time: '45 min', read: true },
]

function formatR(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// QR pattern from token (deterministic)
function QRPattern({ token }: { token: string }) {
  const hash = token.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const size = 12
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size)
    const col = i % size
    if (row < 3 && col < 3) return true
    if (row < 3 && col >= size - 3) return true
    if (row >= size - 3 && col < 3) return true
    return ((hash * (i + 1) * 2654435761) >>> 0) % 3 === 0
  })
  return (
    <div className="grid bg-white p-3 rounded-xl" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 200, height: 200 }}>
      {cells.map((filled, i) => (
        <div key={i} className={filled ? 'bg-black' : 'bg-white'} />
      ))}
    </div>
  )
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: Ticket, title: 'Seus ingressos,\nsempre com você', sub: 'QR dinâmico que se atualiza a cada 30 segundos.' },
    { icon: Calendar, title: 'Acompanhe a\nagenda ao vivo', sub: 'Salve sessões, artistas e receba alertas.' },
    { icon: Users, title: 'Conheça quem\nestá aqui', sub: 'Conecte-se com pessoas do setor no evento.' },
  ]
  const current = steps[step]
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-black px-8 py-16">
      <div />
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ACCENT}20` }}>
          <current.icon className="h-10 w-10" style={{ color: ACCENT }} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white leading-tight whitespace-pre-line">{current.title}</div>
          <div className="mt-3 text-sm text-white/50">{current.sub}</div>
        </div>
      </div>
      <div className="w-full space-y-6">
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === step ? 24 : 8, backgroundColor: i === step ? ACCENT : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
        <button
          onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onDone() }}
          className="h-14 w-full rounded-xl font-bold text-white" style={{ backgroundColor: ACCENT }}>
          {step < steps.length - 1 ? 'Próximo' : 'Começar'}
        </button>
      </div>
    </div>
  )
}

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
    <div className="flex min-h-screen flex-col bg-black">
      <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, #0057E7, #7C3AED)' }} />
      <div className="flex flex-1 flex-col items-center justify-center px-6 -mt-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="font-mono text-lg font-bold uppercase tracking-widest" style={{ color: ACCENT }}>PULSE</div>
            <div className="text-xs text-white/40 mt-1">Participante</div>
          </div>
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            {[{ label: 'E-mail', type: 'email', value: email, set: setEmail, ph: 'seu@email.com' },
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
          <div className="text-center text-xs text-white/30">
            Meu ingresso está aqui → <button className="text-blue-400 underline">Buscar por CPF</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MyTicketsScreen({ onQR, onTabChange }: { onQR: (t: typeof MOCK_TICKETS[0]) => void; onTabChange: (t: string) => void }) {
  return (
    <MobileShell accent="blue">
      <MobileHeader title="Meus Ingressos" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-2xl p-4 space-y-1" style={{ background: 'linear-gradient(135deg, #0057E7, #7C3AED)' }}>
          <div className="font-bold text-white text-lg">{MOCK_EVENT.name}</div>
          <div className="text-white/80 text-sm">{MOCK_EVENT.date}</div>
          <div className="text-white/60 text-xs">{MOCK_EVENT.time} · {MOCK_EVENT.venue}</div>
        </div>
        <div className="space-y-3">
          {MOCK_TICKETS.map((ticket) => (
            <div key={ticket.id} className={cn('rounded-2xl overflow-hidden', ticket.used && 'opacity-60')}>
              <div className="p-4" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/50 font-mono uppercase tracking-widest">{MOCK_EVENT.name}</div>
                    <div className="text-2xl font-bold text-white mt-1">{ticket.type}</div>
                    <div className="text-xs text-white/50 mt-1">{ticket.sector}</div>
                  </div>
                  <Ticket className="h-10 w-10 text-white/20" />
                </div>
                <div className="mt-3 font-mono text-xs text-white/40 tracking-widest">{ticket.token}</div>
                <div className="text-xs text-white/60 mt-1">{ticket.holder}</div>
              </div>
              <button
                onClick={() => !ticket.used && onQR(ticket)}
                disabled={ticket.used}
                className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: ticket.used ? '#333' : ACCENT, color: 'white' }}>
                {ticket.used ? '✓ UTILIZADO' : <><QrCode className="h-4 w-4" />Ver QR Code</>}
              </button>
            </div>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="ingressos" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function QRTicketScreen({ ticket, onBack }: { ticket: typeof MOCK_TICKETS[0]; onBack: () => void }) {
  const [countdown, setCountdown] = useState(30)
  useEffect(() => {
    const id = setInterval(() => setCountdown((c) => (c <= 1 ? 30 : c - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-black px-6 py-8 safe-top safe-bottom">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="rounded-full bg-white/8 p-2.5"><X className="h-5 w-5 text-white" /></button>
        <div className="font-semibold text-white">Ingresso {ticket.type}</div>
        <div className="w-10" />
      </div>
      <div className="flex flex-col items-center gap-4">
        {ticket.used ? (
          <div className="flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-red-500/50 bg-red-500/10">
            <div className="text-center">
              <X className="h-16 w-16 text-red-400 mx-auto" />
              <div className="text-red-400 font-bold mt-2">UTILIZADO</div>
            </div>
          </div>
        ) : (
          <QRPattern token={ticket.token} />
        )}
        <div className="text-center space-y-1">
          <div className="font-mono text-xs text-white/40 tracking-widest">{ticket.token}</div>
          <div className="text-sm font-semibold text-white">{ticket.holder}</div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-xs text-white/50">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-green-400" />
          QR dinâmico · Atualiza em {countdown}s
        </div>
      </div>
      <div className="text-xs text-white/20 text-center">Apresente este QR na portaria do evento</div>
    </div>
  )
}

function AgendaScreen({ liked, onLike, onSession, onTabChange }: {
  liked: Set<string>; onLike: (id: string) => void; onSession: (s: typeof MOCK_AGENDA[0]) => void; onTabChange: (t: string) => void
}) {
  const [filter, setFilter] = useState('Todos')
  const stages = ['Todos', 'Palco Principal', 'Palco Alt.']
  const filtered = MOCK_AGENDA.filter((s) => filter === 'Todos' || s.stage === filter)

  return (
    <MobileShell accent="blue">
      <MobileHeader title={`Agenda – ${MOCK_EVENT.name}`} />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stages.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors', filter === s ? 'text-white' : 'bg-white/6 text-white/50')}
              style={filter === s ? { backgroundColor: ACCENT } : undefined}>{s}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((session) => (
            <button key={session.id} onClick={() => onSession(session)}
              className={cn('w-full rounded-xl p-4 text-left active:bg-white/10', session.now ? 'border border-blue-500/40 bg-blue-500/8' : 'bg-white/6')}>
              <div className="flex items-start gap-3">
                <div className="w-12 shrink-0">
                  <div className="font-mono text-xs font-bold text-white">{session.time}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{session.duration}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {session.now && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-bold text-white">AGORA</span>}
                    <span className="text-sm font-semibold text-white truncate">{session.title}</span>
                  </div>
                  {session.artist && <div className="text-xs text-white/60 mt-0.5">{session.artist}</div>}
                  <div className="text-[10px] text-white/40 mt-0.5">{session.stage}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onLike(session.id) }} className="shrink-0 p-1">
                  <Heart className={cn('h-5 w-5 transition-colors', liked.has(session.id) ? 'fill-red-500 text-red-500' : 'text-white/30')} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="agenda" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function EventMapScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const zones = [
    { x: 5, y: 2, w: 90, h: 15, label: 'Entrada / Portaria', emoji: '🚪', color: '#0057E7' },
    { x: 15, y: 22, w: 55, h: 45, label: 'Palco Principal', emoji: '🎵', color: '#7C3AED' },
    { x: 5, y: 22, w: 8, h: 45, label: 'Palco Alt.', emoji: '🎤', color: '#22C55E' },
    { x: 72, y: 22, w: 23, h: 20, label: 'Área VIP', emoji: '⭐', color: '#d97706' },
    { x: 72, y: 47, w: 23, h: 20, label: 'Bar & Food', emoji: '🍺', color: '#EF4444' },
    { x: 5, y: 72, w: 40, h: 10, label: 'WC', emoji: '🚻', color: '#666' },
    { x: 55, y: 72, w: 40, h: 10, label: 'WC', emoji: '🚻', color: '#666' },
  ]
  return (
    <MobileShell accent="blue">
      <MobileHeader title="Mapa do Evento" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-2xl overflow-hidden bg-gray-950">
          <svg viewBox="0 0 100 85" className="w-full">
            <rect width="100" height="85" fill="#0a0a0a" />
            {zones.map((z) => (
              <g key={z.label + z.x}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={`${z.color}18`} stroke={z.color} strokeWidth="0.5" rx="2" />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 1} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="4">{z.label}</text>
              </g>
            ))}
            {/* User dot */}
            <circle cx="25" cy="40" r="3" fill={ACCENT} />
            <circle cx="25" cy="40" r="5" fill={ACCENT} fillOpacity="0.3" />
            <text x="25" y="35" textAnchor="middle" fill="white" fontSize="3">Você</text>
          </svg>
        </div>
        <div className="text-xs text-white/40 text-center">📍 Você está na Pista Principal</div>
        <div className="space-y-2">
          {zones.slice(0, 5).map((z) => (
            <div key={z.label + z.x} className="flex items-center gap-3 rounded-xl bg-white/6 px-4 py-3">
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
              <span className="text-xs text-white">{z.emoji} {z.label}</span>
            </div>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="mapa" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function FeedScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [compose, setCompose] = useState(false)
  const [text, setText] = useState('')

  return (
    <MobileShell accent="blue">
      <MobileHeader title="Feed do Evento" right={
        <div className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">📍 Pista Principal</div>
      } />
      <MobileScreen className="px-4 py-4 space-y-3">
        <button onClick={() => setCompose(!compose)} className="w-full rounded-xl bg-white/6 px-4 py-3.5 text-left text-sm text-white/40 active:bg-white/8">
          Compartilhe o momento...
        </button>
        {compose && (
          <div className="rounded-xl bg-white/8 p-4 space-y-3">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="O que está acontecendo?"
              className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none resize-none h-20" />
            <div className="flex justify-end">
              <button disabled={!text.trim()} onClick={() => { setCompose(false); setText('') }}
                className="h-9 rounded-full px-5 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: ACCENT }}>Publicar</button>
            </div>
          </div>
        )}
        {MOCK_FEED.map((post) => (
          <div key={post.id} className={cn('rounded-xl p-4 space-y-3', post.official ? 'border-l-2 bg-blue-500/6' : 'bg-white/6')} style={post.official ? { borderLeftColor: ACCENT } : undefined}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ backgroundColor: post.official ? ACCENT : '#333' }}>
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{post.author}</span>
                  {post.official && <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">OFICIAL</span>}
                </div>
                <div className="text-xs text-white/40">{post.time} atrás</div>
              </div>
            </div>
            <div className="text-sm text-white/80">{post.text}</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setLiked((l) => { const n = new Set(l); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n })}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: liked.has(post.id) ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>
                <Heart className={cn('h-4 w-4', liked.has(post.id) && 'fill-current')} />
                {post.likes + (liked.has(post.id) ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-white/40"><MessageSquare className="h-4 w-4" />Responder</button>
            </div>
          </div>
        ))}
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="feed" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [read, setRead] = useState<Set<string>>(new Set())
  const icons = { announcement: Bell, promo: Zap, security: Shield } as Record<string, React.ElementType>

  return (
    <MobileScreen className="px-4 py-4 space-y-2">
      <MobileHeader title="Notificações" onBack={onBack} right={
        <button onClick={() => setRead(new Set(MOCK_NOTIFS.map((n) => n.id)))} className="text-xs text-white/50 active:text-white">Ler tudo</button>
      } />
      {MOCK_NOTIFS.map((n) => {
        const Icon = icons[n.type] ?? Bell
        const isRead = read.has(n.id) || n.read
        return (
          <button key={n.id} onClick={() => setRead((r) => new Set([...r, n.id]))}
            className={cn('w-full rounded-xl bg-white/6 px-4 py-4 text-left active:bg-white/8', !isRead && 'border-l-2 border-blue-500/60')}>
            <div className="flex items-start gap-3">
              <Icon className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm', isRead ? 'text-white/50' : 'text-white font-semibold')}>{n.title}</div>
                <div className="text-[10px] font-mono text-white/30 mt-1">{n.time} atrás</div>
              </div>
              {!isRead && <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1" />}
            </div>
          </button>
        )
      })}
    </MobileScreen>
  )
}

function NetworkingScreen({ onBack }: { onBack: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set(['c2']))
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Networking" onBack={onBack} />
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
        <div className="text-sm font-semibold text-white">Quem está aqui</div>
        <div className="text-xs text-white/50 mt-0.5">Compartilhe sua presença para se conectar</div>
      </div>
      <div className="space-y-2">
        {MOCK_CONNECTIONS.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/6 px-4 py-3.5">
            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: `${ACCENT}30` }}>
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm">{c.name}</div>
              <div className="text-xs text-white/40">{c.role} · {c.mutual} em comum</div>
            </div>
            <button
              onClick={() => setConnected((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n })}
              className={cn('h-9 rounded-full px-3 text-xs font-semibold shrink-0 transition-colors', connected.has(c.id) ? 'bg-white/8 text-white/60' : 'text-white')}
              style={!connected.has(c.id) ? { backgroundColor: ACCENT } : undefined}>
              {connected.has(c.id) ? 'Conectado' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>
    </MobileScreen>
  )
}

function UpgradesScreen({ onUpgrade, onBack }: { onUpgrade: (u: typeof MOCK_UPGRADES[0]) => void; onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-3">
      <MobileHeader title="Upgrades & Experiências" onBack={onBack} />
      {MOCK_UPGRADES.map((u) => (
        <button key={u.id} onClick={() => onUpgrade(u)} className="w-full rounded-xl bg-white/6 p-4 text-left active:bg-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-semibold text-white">{u.name}</div>
              <div className="text-xs text-white/50 mt-1">{u.description}</div>
              {u.available < 5 && (
                <div className="mt-2 text-xs text-orange-400 font-semibold">⚠ Apenas {u.available} vagas</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold font-mono" style={{ color: ACCENT }}>{formatR(u.price)}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{u.available} disponíveis</div>
            </div>
          </div>
        </button>
      ))}
    </MobileScreen>
  )
}

function UpgradeDetailScreen({ upgrade, onBack }: { upgrade: typeof MOCK_UPGRADES[0]; onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title={upgrade.name} onBack={onBack} />
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0057E7, #7C3AED)' }}>
        <div className="text-2xl font-bold text-white">{formatR(upgrade.price)}</div>
        <div className="text-white/70 text-sm mt-1">{upgrade.available} vagas disponíveis</div>
      </div>
      <div className="rounded-xl bg-white/6 p-4">
        <div className="text-sm text-white/80">{upgrade.description}</div>
      </div>
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-300">
        Pagamento via Pagar.me — integração em breve.
      </div>
      <button className="h-14 w-full rounded-xl font-bold text-white" style={{ backgroundColor: ACCENT }}>
        Finalizar Compra
      </button>
    </MobileScreen>
  )
}

function ProfileScreen({ user, onLogout, onNotifs, onNetworking, onUpgrades, onHistory, onTabChange }: {
  user: typeof MOCK_USER; onLogout: () => void
  onNotifs: () => void; onNetworking: () => void; onUpgrades: () => void; onHistory: () => void; onTabChange: (t: string) => void
}) {
  const sections = [
    { title: 'Evento atual', items: [{ label: 'Upgrades & Experiências', icon: Star, action: onUpgrades }, { label: 'Networking', icon: Users, action: onNetworking }] },
    { title: 'Conta', items: [{ label: 'Notificações', icon: Bell, action: onNotifs }, { label: 'Histórico de eventos', icon: Calendar, action: onHistory }] },
  ]
  return (
    <MobileShell accent="blue">
      <MobileHeader title="Perfil" />
      <MobileScreen className="px-4 py-4 space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0" style={{ backgroundColor: ACCENT }}>
            {user.name[0]}
          </div>
          <div>
            <div className="text-lg font-bold text-white">{user.name}</div>
            <div className="text-sm text-white/50">{user.email}</div>
          </div>
        </div>
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 px-1 pb-1">{section.title}</div>
            <div className="rounded-xl overflow-hidden bg-white/6">
              {section.items.map((item, i) => (
                <button key={item.label} onClick={item.action}
                  className={cn('flex w-full items-center gap-3 px-4 py-3.5 active:bg-white/8', i > 0 && 'border-t border-white/6')}>
                  <item.icon className="h-5 w-5 text-white/50 shrink-0" />
                  <span className="flex-1 text-sm text-white text-left">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={onLogout} className="h-14 w-full rounded-xl border border-red-500/20 text-red-400 font-semibold text-sm active:bg-red-500/10">
          Sair da conta
        </button>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="perfil" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ParticipantApp() {
  const { current, push, pop, reset } = useMobileNav<Screen>('onboarding')
  const [user, setUser] = useState<typeof MOCK_USER | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null)
  const [selectedUpgrade, setSelectedUpgrade] = useState<typeof MOCK_UPGRADES[0] | null>(null)
  const [selectedSession, setSelectedSession] = useState<typeof MOCK_AGENDA[0] | null>(null)
  const [liked, setLiked] = useState<Set<string>>(new Set(['s2', 's4']))
  const [activeTab, setActiveTab] = useState<'ingressos' | 'agenda' | 'mapa' | 'feed' | 'perfil'>('ingressos')

  function handleTabChange(tab: string) {
    setActiveTab(tab as typeof activeTab)
    const map: Record<string, Screen> = { ingressos: 'my-tickets', agenda: 'agenda', mapa: 'event-map', feed: 'feed', perfil: 'profile' }
    reset(map[tab] ?? 'my-tickets')
  }

  function toggleLike(id: string) {
    setLiked((l) => { const n = new Set(l); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <MobileShell accent="blue">
      {current.screen === 'onboarding' && <OnboardingScreen onDone={() => reset('login')} />}
      {current.screen === 'login' && <LoginScreen onLogin={() => { setUser(MOCK_USER); reset('my-tickets') }} />}
      {user && (
        <>
          {current.screen === 'my-tickets' && (
            <MyTicketsScreen onQR={(t) => { setSelectedTicket(t); push('qr-ticket') }} onTabChange={handleTabChange} />
          )}
          {current.screen === 'qr-ticket' && selectedTicket && (
            <QRTicketScreen ticket={selectedTicket} onBack={() => pop()} />
          )}
          {current.screen === 'agenda' && (
            <AgendaScreen liked={liked} onLike={toggleLike}
              onSession={(s) => { setSelectedSession(s); push('session-detail') }}
              onTabChange={handleTabChange} />
          )}
          {current.screen === 'session-detail' && selectedSession && (
            <MobileScreen className="px-4 py-4 space-y-4">
              <MobileHeader title={selectedSession.title} onBack={() => pop()} />
              <div className="rounded-2xl p-5 space-y-1" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <div className="text-xl font-bold text-white">{selectedSession.artist ?? selectedSession.title}</div>
                <div className="text-white/60 text-sm">{selectedSession.time} · {selectedSession.duration} · {selectedSession.stage}</div>
              </div>
              <div className="rounded-xl bg-white/6 p-4 text-sm text-white/70">
                Uma das apresentações mais esperadas do evento. Prepare-se para uma experiência inesquecível de som e luz.
              </div>
              <button onClick={() => toggleLike(selectedSession.id)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white" style={{ backgroundColor: ACCENT }}>
                <Heart className={cn('h-5 w-5', liked.has(selectedSession.id) && 'fill-current')} />
                {liked.has(selectedSession.id) ? 'Salvo na agenda' : 'Salvar na agenda'}
              </button>
            </MobileScreen>
          )}
          {current.screen === 'event-map' && <EventMapScreen onTabChange={handleTabChange} />}
          {current.screen === 'feed' && <FeedScreen onTabChange={handleTabChange} />}
          {current.screen === 'notifications' && <NotificationsScreen onBack={() => pop()} />}
          {current.screen === 'networking' && <NetworkingScreen onBack={() => pop()} />}
          {current.screen === 'upgrades' && (
            <UpgradesScreen onUpgrade={(u) => { setSelectedUpgrade(u); push('upgrade-detail') }} onBack={() => pop()} />
          )}
          {current.screen === 'upgrade-detail' && selectedUpgrade && (
            <UpgradeDetailScreen upgrade={selectedUpgrade} onBack={() => pop()} />
          )}
          {current.screen === 'profile' && (
            <ProfileScreen user={user} onLogout={() => { setUser(null); reset('login') }}
              onNotifs={() => push('notifications')} onNetworking={() => push('networking')}
              onUpgrades={() => push('upgrades')} onHistory={() => push('event-history')}
              onTabChange={handleTabChange} />
          )}
          {current.screen === 'event-history' && (
            <MobileScreen className="px-4 py-4 space-y-4">
              <MobileHeader title="Histórico de Eventos" onBack={() => pop()} />
              {[{ name: 'Flow Fest 2025', date: '15 Abr 2025', type: 'VIP' }, { name: 'Tech Summit 2025', date: '20 Mar 2025', type: 'Pista' }].map((e) => (
                <div key={e.name} className="rounded-xl bg-white/6 px-4 py-4">
                  <div className="font-semibold text-white">{e.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{e.date} · {e.type}</div>
                </div>
              ))}
            </MobileScreen>
          )}
        </>
      )}
    </MobileShell>
  )
}
