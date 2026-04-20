import { useState } from 'react'
import {
  ChevronRight, Copy, DollarSign, Loader2, Share2,
  ShoppingBag, Target, Trophy, TrendingUp,
} from 'lucide-react'
import { cn } from '@/shared/lib'
import { MobileShell, MobileScreen } from '@/features/mobile/shared/MobileShell'
import { MobileHeader, MobileTabBar } from '@/features/mobile/shared/MobileHeader'
import { MobileEmptyState } from '@/features/mobile/shared/MobileUI'
import { useMobileNav } from '@/features/mobile/shared/useMobileNav'

type Screen = 'login' | 'my-code' | 'my-sales' | 'commission' | 'ranking' | 'goals' | 'sale-detail' | 'history'

const ACCENT = '#F97316'

const TABS = [
  { key: 'codigo', label: 'Código', icon: Copy },
  { key: 'vendas', label: 'Vendas', icon: ShoppingBag },
  { key: 'comissao', label: 'Comissão', icon: DollarSign },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
  { key: 'metas', label: 'Metas', icon: Target },
]

const MOCK_PROMOTER = { id: 'p1', name: 'Carlos Melo', code: 'CARLOS20', discountPercent: 20, event: 'Flow Fest 2026', commissionRate: 0.15 }

const MOCK_SALES = [
  { id: 'sv1', buyer: 'Ana Lima', tickets: 2, ticketType: 'Pista', total: 300, commission: 45, date: '18/04 · 14:32', status: 'confirmed' as const },
  { id: 'sv2', buyer: 'Pedro Costa', tickets: 1, ticketType: 'VIP', total: 450, commission: 67.50, date: '18/04 · 16:15', status: 'confirmed' as const },
  { id: 'sv3', buyer: 'Julia Rocha', tickets: 3, ticketType: 'Pista', total: 450, commission: 67.50, date: '19/04 · 09:20', status: 'confirmed' as const },
  { id: 'sv4', buyer: 'Marcos Souza', tickets: 2, ticketType: 'VIP', total: 900, commission: 135, date: '19/04 · 11:45', status: 'pending' as const },
  { id: 'sv5', buyer: 'Fernanda Silva', tickets: 1, ticketType: 'Pista', total: 150, commission: 22.50, date: '20/04 · 08:10', status: 'confirmed' as const },
]

const MOCK_RANKING = [
  { rank: 1, name: 'Gabriel Santos', code: 'GABRIEL25', sales: 28, commission: 1890, isMe: false },
  { rank: 2, name: 'Mariana Lima', code: 'MARI10', sales: 22, commission: 1485, isMe: false },
  { rank: 3, name: 'Carlos Melo', code: 'CARLOS20', sales: 9, commission: 337.50, isMe: true },
  { rank: 4, name: 'Tiago Ferreira', code: 'TIAGO15', sales: 7, commission: 262.50, isMe: false },
  { rank: 5, name: 'Bianca Oliveira', code: 'BIANCA20', sales: 5, commission: 187.50, isMe: false },
]

const MOCK_GOALS = [
  { id: 'g1', title: 'Meta semanal', target: 15, current: 9, unit: 'vendas', reward: 'Bônus R$ 200', deadline: '25/04', daysLeft: 5 },
  { id: 'g2', title: 'Meta mensal', target: 50, current: 9, unit: 'vendas', reward: 'Comissão +5%', deadline: '30/04', daysLeft: 10 },
  { id: 'g3', title: 'Meta VIP', target: 5, current: 2, unit: 'ingressos VIP', reward: 'Credencial Staff', deadline: '20/04', daysLeft: 0 },
]

function formatR(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
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
            <TrendingUp className="h-8 w-8" style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <div className="font-mono text-xl font-bold uppercase tracking-widest" style={{ color: ACCENT }}>PULSE PROMOTER</div>
            <div className="mt-1 text-xs text-white/40 font-mono">Painel do promoter</div>
          </div>
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
      </div>
    </div>
  )
}

function MyCodeScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [copied, setCopied] = useState(false)
  const totalSales = MOCK_SALES.length
  const todayCommission = MOCK_SALES.filter((s) => s.date.startsWith('20/04')).reduce((a, s) => a + s.commission, 0)

  function copyLink() {
    void navigator.clipboard.writeText(`https://flowfest.com.br/?ref=${MOCK_PROMOTER.code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Deterministic QR-like pattern from code
  const hash = MOCK_PROMOTER.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const qrCells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10)
    const col = i % 10
    if ((row < 3 && col < 3) || (row < 3 && col > 6) || (row > 6 && col < 3)) return true
    return ((hash * (i + 1) * 2654435761) >>> 0) % 3 === 0
  })

  return (
    <MobileShell accent="orange">
      <MobileHeader title="Meu Código" subtitle={MOCK_PROMOTER.event} />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`, border: `1px solid ${ACCENT}30` }}>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Seu Código</div>
          <div className="font-mono text-5xl font-black tracking-widest" style={{ color: ACCENT }}>{MOCK_PROMOTER.code}</div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: `${ACCENT}30` }}>
            {MOCK_PROMOTER.discountPercent}% de desconto
          </span>
        </div>

        <div className="flex justify-center">
          <div className="grid bg-white p-2 rounded-xl" style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: 160, height: 160 }}>
            {qrCells.map((filled, i) => (
              <div key={i} className={filled ? 'bg-black' : 'bg-white'} />
            ))}
          </div>
        </div>
        <div className="text-center text-xs text-white/30">Compartilhe para ganhar comissão</div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={copyLink}
            className={cn('flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold transition-colors', copied ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/70 active:bg-white/12')}>
            <Copy className="h-5 w-5" />
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold bg-white/8 text-white/70 active:bg-white/12">
            <Share2 className="h-5 w-5" />Compartilhar
          </button>
          <a href={`https://wa.me/?text=Usa%20meu%20c%C3%B3digo%20${MOCK_PROMOTER.code}%20no%20Flow%20Fest%202026%20e%20garante%20${MOCK_PROMOTER.discountPercent}%25%20de%20desconto!`}
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold bg-green-600/20 text-green-400 active:bg-green-600/30">
            <span className="text-lg">📲</span>WhatsApp
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['Vendas hoje', totalSales], ['Comissão hoje', formatR(todayCommission)]].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl bg-white/6 p-4">
              <div className="text-xs text-white/40">{l}</div>
              <div className="text-xl font-bold font-mono mt-1" style={{ color: ACCENT }}>{v}</div>
            </div>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="codigo" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function MySalesScreen({ onDetail, onTabChange }: { onDetail: (s: typeof MOCK_SALES[0]) => void; onTabChange: (t: string) => void }) {
  const [filter, setFilter] = useState<'hoje' | 'semana' | 'mes'>('semana')
  const totalRevenue = MOCK_SALES.reduce((a, s) => a + s.total, 0)
  const totalCommission = MOCK_SALES.reduce((a, s) => a + s.commission, 0)

  return (
    <MobileShell accent="orange">
      <MobileHeader title="Minhas Vendas" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          {(['hoje', 'semana', 'mes'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('flex-1 rounded-xl py-2.5 text-xs font-semibold capitalize transition-colors', filter === f ? 'text-white' : 'bg-white/6 text-white/50')}
              style={filter === f ? { backgroundColor: ACCENT } : undefined}>
              {f === 'hoje' ? 'Hoje' : f === 'semana' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Vendas', MOCK_SALES.length], ['Receita', formatR(totalRevenue)], ['Comissão', formatR(totalCommission)]].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl bg-white/6 p-3 text-center">
              <div className="text-xs text-white/40">{l}</div>
              <div className={cn('font-bold font-mono mt-0.5 text-sm', String(l) === 'Comissão' ? '' : 'text-white')} style={String(l) === 'Comissão' ? { color: ACCENT } : undefined}>{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {MOCK_SALES.map((sale) => (
            <button key={sale.id} onClick={() => onDetail(sale)} className="w-full rounded-xl bg-white/6 p-4 text-left active:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ backgroundColor: `${ACCENT}25` }}>
                    {initials(sale.buyer)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{sale.buyer}</div>
                    <div className="text-xs text-white/40">{sale.tickets}x {sale.ticketType} · {sale.date}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono" style={{ color: ACCENT }}>{formatR(sale.commission)}</div>
                  <span className={cn('text-[10px] font-semibold', sale.status === 'confirmed' ? 'text-green-400' : 'text-orange-400')}>
                    {sale.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="vendas" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function SaleDetailScreen({ sale, onBack }: { sale: typeof MOCK_SALES[0]; onBack: () => void }) {
  return (
    <MobileScreen className="px-4 py-4 space-y-4">
      <MobileHeader title="Detalhe da Venda" onBack={onBack} />
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)' }}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: `${ACCENT}30` }}>
            {initials(sale.buyer)}
          </div>
          <div>
            <div className="font-bold text-white">{sale.buyer}</div>
            <div className="text-xs text-white/50">{sale.date}</div>
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="grid grid-cols-2 gap-3">
          {[['Tipo', `${sale.tickets}x ${sale.ticketType}`], ['Valor total', formatR(sale.total)]].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">{l}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white/6 p-5 space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-white/40">Sua comissão (15%)</div>
        <div className="text-4xl font-bold font-mono" style={{ color: ACCENT }}>{formatR(sale.commission)}</div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', sale.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400')}>
          {sale.status === 'confirmed' ? '✓ Confirmado' : '⏳ Aguardando confirmação'}
        </span>
      </div>
      <button className="h-12 w-full rounded-xl border border-white/10 text-sm font-medium text-white/60 active:bg-white/5">
        Reportar problema
      </button>
    </MobileScreen>
  )
}

function CommissionScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const confirmed = MOCK_SALES.filter((s) => s.status === 'confirmed').reduce((a, s) => a + s.commission, 0)
  const pending = MOCK_SALES.filter((s) => s.status === 'pending').reduce((a, s) => a + s.commission, 0)

  return (
    <MobileShell accent="orange">
      <MobileHeader title="Minha Comissão" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-2" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`, border: `1px solid ${ACCENT}30` }}>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Total acumulado</div>
          <div className="text-5xl font-black font-mono" style={{ color: ACCENT }}>{formatR(confirmed + pending)}</div>
          <div className="text-xs text-white/40">Próximo pagamento: 30/04/2026</div>
        </div>
        <div className="rounded-xl bg-white/6 p-5 space-y-3">
          {[['Confirmado', confirmed, 'text-green-400'], ['Pendente', pending, 'text-orange-400'], ['Total', confirmed + pending, '']].map(([l, v, c]) => (
            <div key={String(l)} className={cn('flex items-center justify-between', String(l) === 'Total' && 'border-t border-white/10 pt-3')}>
              <span className="text-sm text-white/60">{l}</span>
              <span className={cn('font-mono font-bold', c || '')} style={!c ? { color: ACCENT } : undefined}>
                {formatR(v as number)}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/6 p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Taxa de comissão</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Por venda confirmada</span>
            <span className="font-bold text-white" style={{ color: ACCENT }}>15%</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/6 p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Histórico de pagamentos</div>
          <MobileEmptyState icon={DollarSign} title="Primeiro pagamento em breve" subtitle="Após confirmação das vendas" />
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="comissao" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function RankingScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const top3 = MOCK_RANKING.slice(0, 3)
  const rest = MOCK_RANKING.slice(3)

  return (
    <MobileShell accent="orange">
      <MobileHeader title="Ranking de Promoters" subtitle={MOCK_PROMOTER.event} />
      <MobileScreen className="px-4 py-4 space-y-4">
        {/* Podium */}
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {[top3[1], top3[0], top3[2]].map((r, i) => {
            const heights = ['h-24', 'h-32', 'h-20']
            const positions = ['2º', '1º', '3º']
            const posIdx = i === 0 ? 1 : i === 1 ? 0 : 2
            return (
              <div key={r.rank} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: r.isMe ? ACCENT : '#333' }}>
                  {initials(r.name)}
                </div>
                <div className="text-[10px] text-white/50 text-center max-w-[60px] truncate">{r.name.split(' ')[0]}</div>
                <div className={cn('w-20 rounded-t-xl flex flex-col items-center justify-center gap-1', heights[i])} style={{ backgroundColor: i === 1 ? ACCENT : '#1a1a1a' }}>
                  <Trophy className={cn('h-5 w-5', i === 1 ? 'text-white' : 'text-white/30')} />
                  <span className={cn('text-xs font-bold', i === 1 ? 'text-white' : 'text-white/50')}>{positions[i]}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          {MOCK_RANKING.map((r) => (
            <div key={r.rank} className={cn('flex items-center gap-3 rounded-xl px-4 py-3.5', r.isMe ? 'border' : 'bg-white/6')}
              style={r.isMe ? { borderColor: ACCENT, backgroundColor: `${ACCENT}10` } : undefined}>
              <div className="w-6 text-center font-mono text-sm font-bold text-white/50">#{r.rank}</div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ backgroundColor: r.isMe ? ACCENT : '#333' }}>
                {initials(r.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{r.name} {r.isMe && <span className="text-xs text-orange-400">(você)</span>}</div>
                <div className="text-xs text-white/40 font-mono">{r.code} · {r.sales} vendas</div>
              </div>
              <div className="font-mono text-sm font-bold shrink-0" style={{ color: ACCENT }}>{formatR(r.commission)}</div>
            </div>
          ))}
        </div>
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="ranking" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

function GoalsScreen({ onTabChange }: { onTabChange: (t: string) => void }) {
  const avgProgress = MOCK_GOALS.reduce((a, g) => a + g.current / g.target, 0) / MOCK_GOALS.length
  const motivation = avgProgress < 0.3
    ? 'Comece a divulgar seu código! 🚀'
    : avgProgress < 0.7
    ? 'Você está indo bem! Continue! 💪'
    : 'Quase lá! Não pare agora! 🔥'

  return (
    <MobileShell accent="orange">
      <MobileHeader title="Minhas Metas" />
      <MobileScreen className="px-4 py-4 space-y-4">
        <div className="rounded-xl p-4" style={{ backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
          <div className="text-sm font-semibold text-white">{motivation}</div>
        </div>
        {MOCK_GOALS.map((g) => {
          const pct = Math.min(g.current / g.target, 1)
          const done = pct >= 1
          const expired = g.daysLeft === 0 && !done
          return (
            <div key={g.id} className="rounded-xl bg-white/6 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{g.title}</div>
                  <div className="text-xs text-white/50 mt-0.5">{g.current} de {g.target} {g.unit}</div>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0',
                  done ? 'bg-green-500/20 text-green-400' : expired ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50')}>
                  {done ? 'Concluída' : expired ? 'Expirada' : `${g.daysLeft}d restantes`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct * 100}%`, backgroundColor: done ? '#22C55E' : ACCENT }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">{Math.round(pct * 100)}% concluído</span>
                <span className="font-semibold text-white/60">🎁 {g.reward}</span>
              </div>
              <div className="text-[10px] text-white/30">Prazo: {g.deadline}</div>
            </div>
          )
        })}
      </MobileScreen>
      <MobileTabBar tabs={TABS} active="metas" onChange={onTabChange} accent={ACCENT} />
    </MobileShell>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PromoterApp() {
  const { current, push, pop, reset } = useMobileNav<Screen>('login')
  const [loggedIn, setLoggedIn] = useState(false)
  const [selectedSale, setSelectedSale] = useState<typeof MOCK_SALES[0] | null>(null)
  const [activeTab, setActiveTab] = useState<'codigo' | 'vendas' | 'comissao' | 'ranking' | 'metas'>('codigo')

  function handleTabChange(tab: string) {
    setActiveTab(tab as typeof activeTab)
    const map: Record<string, Screen> = { codigo: 'my-code', vendas: 'my-sales', comissao: 'commission', ranking: 'ranking', metas: 'goals' }
    reset(map[tab] ?? 'my-code')
  }

  return (
    <MobileShell accent="orange">
      {current.screen === 'login' && <LoginScreen onLogin={() => { setLoggedIn(true); reset('my-code') }} />}
      {loggedIn && (
        <>
          {current.screen === 'my-code' && <MyCodeScreen onTabChange={handleTabChange} />}
          {current.screen === 'my-sales' && (
            <MySalesScreen onDetail={(s) => { setSelectedSale(s); push('sale-detail') }} onTabChange={handleTabChange} />
          )}
          {current.screen === 'sale-detail' && selectedSale && (
            <SaleDetailScreen sale={selectedSale} onBack={() => pop()} />
          )}
          {current.screen === 'commission' && <CommissionScreen onTabChange={handleTabChange} />}
          {current.screen === 'ranking' && <RankingScreen onTabChange={handleTabChange} />}
          {current.screen === 'goals' && <GoalsScreen onTabChange={handleTabChange} />}
        </>
      )}
    </MobileShell>
  )
}
