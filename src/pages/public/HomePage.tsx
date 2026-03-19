import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Zap, Shield, Globe, BarChart3, Users, ScanLine } from 'lucide-react'

/* ── Utils ──────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

/* ── Counter animation ──────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, inView } = useInView(0.5)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const t = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val.toLocaleString('pt-BR')}{suffix}</span>
}

/* ── Marquee items ───────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  'VENDA DE INGRESSOS', 'CHECK-IN EM TEMPO REAL', 'GESTÃO DE STAFF',
  'PDV E ESTOQUE', 'CREDENCIAMENTO', 'QR PREMIUM', 'ANALYTICS',
  'GROWTH SERVICES', 'FORNECEDORES', 'COMUNICAÇÃO EM MASSA',
]

/* ── Features ───────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ScanLine,
    title: 'Check-in multi-dispositivo',
    desc: 'Portarias simultâneas, offline sync, antifraude em tempo real. Nunca mais fila travada.',
    tag: 'OPERAÇÃO',
  },
  {
    icon: BarChart3,
    title: 'Dashboard operacional ao vivo',
    desc: 'Mapa de calor, fluxo por portaria, alertas automáticos. Você enxerga tudo enquanto acontece.',
    tag: 'INTELIGÊNCIA',
  },
  {
    icon: Users,
    title: 'Gestão completa de staff',
    desc: 'Ponto digital via QR, escala, supervisão, relatórios. Tudo que o Weezevent tem, com metade da complexidade.',
    tag: 'EQUIPE',
  },
  {
    icon: Zap,
    title: 'Growth Services embutido',
    desc: 'IA analisa seus dados e sugere ações para vender mais. Consultoria discreta, sem propaganda.',
    tag: 'CRESCIMENTO',
  },
  {
    icon: Globe,
    title: 'White-label completo',
    desc: 'Seu domínio, seu e-mail, sua marca. O comprador nunca vê Animalz — vê só você.',
    tag: 'BRANDING',
  },
  {
    icon: Shield,
    title: 'QR dinâmico antifraude',
    desc: 'Token rotativo, detecção de clone, bloqueio automático. Zero golpe na entrada.',
    tag: 'SEGURANÇA',
  },
]

/* ── Stats ──────────────────────────────────────────────────── */
const STATS = [
  { value: 500,  suffix: '+', label: 'Eventos gerenciados' },
  { value: 2000000, suffix: '+', label: 'Ingressos emitidos' },
  { value: 99,   suffix: '.9%', label: 'Uptime garantido' },
  { value: 3,    suffix: 'x', label: 'Mais rápido que concorrentes' },
]

/* ── Main ───────────────────────────────────────────────────── */
export function HomePage({ onLogin }: { onLogin: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="bg-[#080808] text-[#f5f5f0] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.95) 0%, transparent 100%)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#d4ff00] flex items-center justify-center rounded-sm">
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#080808', fontSize: 14 }}>A</span>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 2 }}>
            ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
          </span>
          <span className="text-[10px] text-[#6b6b6b] font-mono tracking-widest uppercase border border-[#242424] px-2 py-0.5 rounded-sm">
            Events
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-xs text-[#9a9a9a] hover:text-[#f5f5f0] transition-colors font-mono tracking-wider hidden md:block">FEATURES</a>
          <a href="#stats" className="text-xs text-[#9a9a9a] hover:text-[#f5f5f0] transition-colors font-mono tracking-wider hidden md:block">NÚMEROS</a>
          <button onClick={onLogin}
            className="flex items-center gap-2 bg-[#d4ff00] text-[#080808] px-5 py-2 text-xs font-semibold tracking-wider rounded-sm hover:shadow-[0_0_30px_rgba(212,255,0,0.3)] transition-all duration-300"
            style={{ fontFamily: 'inherit' }}>
            ACESSAR PLATAFORMA <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-32">

        {/* Grid background com parallax */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
            transition: 'transform 0.1s ease-out',
          }} />

        {/* Orb principal */}
        <div className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,255,0,0.07) 0%, transparent 70%)',
            top: '50%', left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
            transition: 'transform 0.15s ease-out',
          }} />

        {/* Orb secundário */}
        <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,255,0,0.04) 0%, transparent 70%)',
            bottom: '15%', right: '10%',
            transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`,
            transition: 'transform 0.2s ease-out',
          }} />

        {/* Linha acid no topo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#d4ff00]/20 pointer-events-none" />

        {/* Tag */}
        <div className="relative z-10 flex items-center gap-2 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.3em] text-[#d4ff00] uppercase">
            Animalz Group · Plataforma de Eventos
          </span>
        </div>

        {/* Título principal */}
        <h1 className="relative z-10 text-center leading-none animate-slide-up"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(64px, 12vw, 160px)',
            letterSpacing: '-0.02em',
            transform: `translateY(${scrollY * 0.15}px)`,
          }}>
          <span className="block">CREATE,</span>
          <span className="block">SELL,</span>
          <span className="block" style={{ color: '#d4ff00' }}>OPERATE</span>
          <span className="block">AND SCALE</span>
          <span className="block">EVENTS<span style={{ color: '#d4ff00' }}>.</span></span>
        </h1>

        {/* Scroll indicator — fora do fluxo, no rodapé da viewport */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none">
          <span className="text-[9px] font-mono tracking-widest text-[#6b6b6b]">SCROLL</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6b6b6b] animate-bounce" />
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────── */}
      <section className="py-6 border-y border-[#1a1a1a] overflow-hidden relative">
        <div className="absolute inset-0 bg-[#d4ff00]/3 pointer-events-none" />
        <div className="flex gap-16 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-4 text-xs font-mono tracking-[0.3em] text-[#6b6b6b]">
              <span className="text-[#d4ff00]">✦</span>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section id="stats" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <StatCard key={i} {...s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT ───────────────────────────────────────── */}
      <StatementSection />

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <RevealText>
              <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-4">O QUE FAZEMOS</div>
              <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                TUDO QUE SEU EVENTO<br />
                PRECISA<span style={{ color: '#d4ff00' }}>.</span>
              </h2>
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feat, i) => (
              <FeatureCard key={i} feature={feat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON STRIP ────────────────────────────────── */}
      <ComparisonSection />

      {/* ── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,255,0,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <RevealText>
            <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-6">ANIMALZ GROUP</div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 8vw, 120px)', letterSpacing: '-0.02em', lineHeight: 0.95 }}>
              PRONTO PARA<br />
              OPERAR NO<br />
              <span style={{ color: '#d4ff00' }}>PRÓXIMO NÍVEL</span>
              <span style={{ color: '#f5f5f0' }}>?</span>
            </h2>
            <p className="text-[#9a9a9a] mt-8 text-base max-w-md mx-auto leading-relaxed">
              Junte-se aos produtores que já usam a plataforma mais avançada de gestão de eventos do Brasil.
            </p>
            <div className="flex items-center justify-center gap-4 mt-12">
              <button onClick={onLogin}
                className="flex items-center gap-2 bg-[#d4ff00] text-[#080808] px-10 py-5 text-sm font-bold tracking-wider rounded-sm hover:shadow-[0_0_60px_rgba(212,255,0,0.5)] transition-all duration-300 hover:scale-105">
                ACESSAR AGORA <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#d4ff00] flex items-center justify-center rounded-sm">
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#080808', fontSize: 12 }}>A</span>
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 2 }}>
              ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>EVENTS
            </span>
          </div>
          <div className="text-[11px] text-[#6b6b6b] font-mono">
            © 2025 Animalz Group. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            {['Termos', 'Privacidade', 'Contato'].map(l => (
              <a key={l} href="#" className="text-[11px] text-[#6b6b6b] hover:text-[#d4ff00] transition-colors font-mono tracking-wider">
                {l.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className="text-center transition-all duration-700"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transitionDelay: `${index * 100}ms` }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 6vw, 80px)', color: '#d4ff00', lineHeight: 1 }}>
        <Counter to={value} suffix={suffix} />
      </div>
      <div className="text-[11px] font-mono tracking-widest text-[#6b6b6b] mt-2 uppercase">{label}</div>
    </div>
  )
}

/* ── Reveal text wrapper ────────────────────────────────────── */
function RevealText({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className="transition-all duration-700"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)' }}>
      {children}
    </div>
  )
}

/* ── Feature Card ───────────────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const { ref, inView } = useInView()
  const Icon = feature.icon
  return (
    <div ref={ref}
      className="border border-[#1a1a1a] rounded-sm p-6 group hover:border-[#d4ff00]/20 hover:bg-[#d4ff00]/2 transition-all duration-300"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transitionDelay: `${index * 80}ms`, transition: 'opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, background-color 0.3s' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#d4ff00]/8 border border-[#d4ff00]/15 rounded-sm flex items-center justify-center group-hover:bg-[#d4ff00]/15 transition-colors">
          <Icon className="w-5 h-5 text-[#d4ff00]" />
        </div>
        <span className="text-[9px] font-mono tracking-widest text-[#d4ff00] border border-[#d4ff00]/20 px-2 py-1 rounded-sm">
          {feature.tag}
        </span>
      </div>
      <h3 className="text-base font-semibold text-[#f5f5f0] mb-2 group-hover:text-[#d4ff00] transition-colors">
        {feature.title}
      </h3>
      <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{feature.desc}</p>
    </div>
  )
}

/* ── Statement Section ──────────────────────────────────────── */
function StatementSection() {
  const { ref, inView } = useInView(0.2)
  return (
    <section className="py-32 px-8 border-y border-[#1a1a1a] relative overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(212,255,0,0.03) 0%, transparent 70%)' }} />
      <div ref={ref} className="max-w-6xl mx-auto transition-all duration-1000"
        style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(50px)' }}>
        <p style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(32px, 5vw, 72px)',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
          color: '#f5f5f0',
        }}>
          ENQUANTO OS OUTROS TE DÃO UMA{' '}
          <span style={{ color: '#d4ff00' }}>FERRAMENTA DE VENDA</span>
          {', '}NÓS TE ENTREGAMOS UM{' '}
          <span style={{
            WebkitTextStroke: '1px #d4ff00',
            color: 'transparent',
          }}>SISTEMA OPERACIONAL COMPLETO</span>
          {' '}PARA SEU EVENTO<span style={{ color: '#d4ff00' }}>.</span>
        </p>
        <div className="mt-10 flex items-center gap-4">
          <div className="w-8 h-px bg-[#d4ff00]" />
          <span className="text-[11px] font-mono tracking-widest text-[#6b6b6b]">
            ANIMALZ EVENTS — PART OF ANIMALZ GROUP
          </span>
        </div>
      </div>
    </section>
  )
}

/* ── Comparison Section ─────────────────────────────────────── */
function ComparisonSection() {
  const { ref, inView } = useInView()
  const rows = [
    { feature: 'Venda de ingressos', them: true,  us: true  },
    { feature: 'Check-in operacional', them: true,  us: true  },
    { feature: 'Gestão de staff + ponto', them: false, us: true  },
    { feature: 'PDV touch + estoque', them: false, us: true  },
    { feature: 'Gestão de fornecedores', them: false, us: true  },
    { feature: 'White-label completo', them: false, us: true  },
    { feature: 'Growth services com IA', them: false, us: true  },
    { feature: 'PIX nativo (Brasil)', them: false, us: true  },
    { feature: 'Ticket social (Stories)', them: false, us: true  },
    { feature: 'Mapa de calor ao vivo', them: false, us: true  },
  ]

  return (
    <section className="py-32 px-8">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-4">POR QUE NÓS</div>
          <h2 className="mb-16" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            NÃO É SÓ MAIS UMA<br />
            PLATAFORMA<span style={{ color: '#d4ff00' }}>.</span>
          </h2>
        </RevealText>

        <div ref={ref} className="border border-[#1a1a1a] rounded-sm overflow-hidden transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)' }}>
          <div className="grid grid-cols-3 border-b border-[#1a1a1a]">
            <div className="px-6 py-4 text-[11px] font-mono tracking-widest text-[#6b6b6b]">FEATURE</div>
            <div className="px-6 py-4 text-[11px] font-mono tracking-widest text-[#6b6b6b] text-center border-x border-[#1a1a1a]">CONCORRENTES</div>
            <div className="px-6 py-4 text-[11px] font-mono tracking-widest text-[#d4ff00] text-center">ANIMALZ EVENTS</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#d4ff00]/2 transition-colors`}>
              <div className="px-6 py-4 text-[13px] text-[#9a9a9a]">{row.feature}</div>
              <div className="px-6 py-4 text-center border-x border-[#1a1a1a]">
                {row.them
                  ? <span className="text-[#6b6b6b] text-base">✓</span>
                  : <span className="text-[#2a2a2a] text-base">✗</span>}
              </div>
              <div className="px-6 py-4 text-center">
                <span className="text-[#d4ff00] text-base">✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}