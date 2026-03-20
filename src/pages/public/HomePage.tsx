import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Zap, Shield, Globe, BarChart3, Users, ScanLine } from 'lucide-react'

const LOGO_URL = 'https://nrjizzfkhficvhiiqvtl.supabase.co/storage/v1/object/public/public-assets/animalz-logo.jpg'

/* ── useInView ───────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

/* ── Counter ─────────────────────────────────────────────────── */
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

/* ── RevealText ──────────────────────────────────────────────── */
function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(48px)',
      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

/* ── Data ────────────────────────────────────────────────────── */
const MARQUEE = [
  'VENDA DE INGRESSOS', 'CHECK-IN EM TEMPO REAL', 'GESTÃO DE STAFF',
  'PDV E ESTOQUE', 'CREDENCIAMENTO', 'QR PREMIUM', 'ANALYTICS',
  'GROWTH SERVICES', 'FORNECEDORES', 'COMUNICAÇÃO EM MASSA',
]

const FEATURES = [
  { icon: ScanLine, title: 'Check-in multi-dispositivo', desc: 'Portarias simultâneas, offline sync, antifraude em tempo real. Nunca mais fila travada.', tag: 'OPERAÇÃO' },
  { icon: BarChart3, title: 'Dashboard operacional ao vivo', desc: 'Mapa de calor, fluxo por portaria, alertas automáticos. Você enxerga tudo enquanto acontece.', tag: 'INTELIGÊNCIA' },
  { icon: Users, title: 'Gestão completa de staff', desc: 'Ponto digital via QR, escala, supervisão, relatórios. Mais completo que qualquer concorrente.', tag: 'EQUIPE' },
  { icon: Zap, title: 'Growth Services embutido', desc: 'IA analisa seus dados e sugere ações para vender mais. Consultoria discreta, sem propaganda.', tag: 'CRESCIMENTO' },
  { icon: Globe, title: 'White-label completo', desc: 'Seu domínio, seu e-mail, sua marca. O comprador nunca vê Animalz — vê só você.', tag: 'BRANDING' },
  { icon: Shield, title: 'QR dinâmico antifraude', desc: 'Token rotativo, detecção de clone, bloqueio automático. Zero golpe na entrada.', tag: 'SEGURANÇA' },
]

const STATS = [
  { value: 500,     suffix: '+',   label: 'Eventos gerenciados' },
  { value: 2000000, suffix: '+',   label: 'Ingressos emitidos' },
  { value: 99,      suffix: '.9%', label: 'Uptime garantido' },
  { value: 3,       suffix: 'x',   label: 'Mais rápido' },
]

const COMPARISON = [
  { feature: 'Venda de ingressos',       them: true,  us: true },
  { feature: 'Check-in operacional',     them: true,  us: true },
  { feature: 'Gestão de staff + ponto',  them: false, us: true },
  { feature: 'PDV touch + estoque',      them: false, us: true },
  { feature: 'Gestão de fornecedores',   them: false, us: true },
  { feature: 'White-label completo',     them: false, us: true },
  { feature: 'Growth services com IA',   them: false, us: true },
  { feature: 'PIX nativo (Brasil)',      them: false, us: true },
  { feature: 'Ticket social (Stories)',  them: false, us: true },
  { feature: 'Mapa de calor ao vivo',    them: false, us: true },
]

/* ── Cursor magnético ────────────────────────────────────────── */
function MagneticCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let ringX = 0, ringY = 0
    let dotX  = 0, dotY  = 0
    let raf: number

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      if (!dotRef.current || !ringRef.current) return
      dotRef.current.style.left  = dotX + 'px'
      dotRef.current.style.top   = dotY + 'px'
      ringX = lerp(ringX, dotX, 0.12)
      ringY = lerp(ringY, dotY, 0.12)
      ringRef.current.style.left = ringX + 'px'
      ringRef.current.style.top  = ringY + 'px'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX
      dotY = e.clientY
    }
    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,[data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: hovered ? 12 : 8, height: hovered ? 12 : 8,
        background: '#d4ff00', borderRadius: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        transition: 'width 0.2s, height 0.2s',
      }} />
      {/* Ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        width: hovered ? 56 : 36, height: hovered ? 56 : 36,
        border: `1px solid rgba(212,255,0,${hovered ? 0.8 : 0.35})`,
        borderRadius: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s',
      }} />
    </>
  )
}

/* ── Particle field ──────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let w = canvas.width  = window.innerWidth
    let h = canvas.height = window.innerHeight

    const onResize = () => {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // Particles
    const N = 80
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number }
    const particles: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    }))

    let mouse = { x: w / 2, y: h / 2 }
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    document.addEventListener('mousemove', onMove)

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        // drift toward/away from mouse subtly
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          p.vx -= dx / dist * 0.008
          p.vy -= dy / dist * 0.008
        }

        p.x += p.vx; p.y += p.vy
        // damping
        p.vx *= 0.99; p.vy *= 0.99
        // wrap
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,255,0,${p.a * 0.4})`
        ctx.fill()
      }

      // Connect nearby particles
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(212,255,0,${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', opacity: 0.6,
    }} />
  )
}

/* ── Logo reveal com efeito garra ────────────────────────────── */
function LogoReveal({ onLogin }: { onLogin: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [scratched, setScratched] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMove   = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)

    // Trigger scratch animation after load
    setTimeout(() => setScratched(true), 800)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div ref={containerRef} style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: '#080808',
    }}>
      <ParticleField />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none',
      }} />

      {/* Glow orb — segue o mouse */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,255,0,0.06) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: `translate(calc(-50% + ${mousePos.x * 60}px), calc(-50% + ${mousePos.y * 60}px))`,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s 0.3s, transform 0.8s 0.3s',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#d4ff00', display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{
          fontSize: 11, fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.3em', color: '#d4ff00', textTransform: 'uppercase',
        }}>
          Animalz Group · Plataforma de Eventos
        </span>
      </div>

      {/* LOGO com parallax 3D */}
      <div style={{
        position: 'relative', zIndex: 10,
        transform: `
          perspective(800px)
          rotateX(${mousePos.y * -6}deg)
          rotateY(${mousePos.x * 6}deg)
          translateZ(${scratched ? 20 : 0}px)
          translateY(${scrollY * -0.12}px)
        `,
        transition: 'transform 0.15s ease-out',
        opacity: loaded ? 1 : 0,
      }}>
        {/* Efeito de garra sobre a logo */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={LOGO_URL}
            alt="Animalz Events"
            onLoad={() => setLoaded(true)}
            style={{
              width: 'clamp(320px, 60vw, 700px)',
              display: 'block',
              filter: 'drop-shadow(0 0 40px rgba(212,255,0,0.2))',
              transform: `scale(${scratched ? 1.02 : 0.95})`,
              transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          />

          {/* Scratch lines — ativadas ao carregar */}
          {[
            { top: '30%', left: '-5%', width: '110%', rotate: '-8deg', delay: '0.6s', color: '#d4ff00' },
            { top: '45%', left: '-8%', width: '115%', rotate: '-6deg', delay: '0.8s', color: '#d4ff00' },
            { top: '55%', left: '-3%', width: '108%', rotate: '-7deg', delay: '1.0s', color: '#8B7CFF' },
          ].map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: s.top, left: s.left, width: s.width,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)`,
              transform: `rotate(${s.rotate})`,
              opacity: scratched ? 0.6 : 0,
              transition: `opacity 0.4s ${s.delay}`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Brilho horizontal ao carregar */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,255,0,0.15) 50%, transparent 100%)',
            transform: `translateX(${scratched ? '110%' : '-110%'})`,
            transition: 'transform 1s 0.5s cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center', marginTop: 32,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s 0.6s, transform 0.8s 0.6s',
      }}>
        <p style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(16px, 2.5vw, 28px)',
          letterSpacing: '0.15em',
          color: '#9a9a9a',
          marginBottom: 40,
        }}>
          CREATE · SELL · <span style={{ color: '#d4ff00' }}>OPERATE</span> · AND SCALE EVENTS
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={onLogin}
            data-magnetic
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#d4ff00', color: '#080808',
              padding: '16px 40px', borderRadius: 2,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.15em',
              border: 'none', cursor: 'none',
              boxShadow: '0 0 0 rgba(212,255,0,0)',
              transition: 'box-shadow 0.3s, transform 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(212,255,0,0.5)'
              ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(212,255,0,0)'
              ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            }}
          >
            ACESSAR PLATAFORMA
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Scroll indicator line */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        opacity: loaded ? 0.4 : 0, transition: 'opacity 1s 1.5s',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 1, height: 60, background: 'linear-gradient(to bottom, #d4ff00, transparent)',
          animation: 'scrollLine 2s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scrollLine { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
      `}</style>
    </div>
  )
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{
      textAlign: 'center',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s ${index * 100}ms, transform 0.7s ${index * 100}ms`,
    }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 6vw, 80px)', color: '#d4ff00', lineHeight: 1 }}>
        <Counter to={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#6b6b6b', marginTop: 8, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

/* ── Feature Card ────────────────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const { ref, inView } = useInView()
  const [hov, setHov] = useState(false)
  const Icon = feature.icon

  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? 'rgba(212,255,0,0.25)' : '#1a1a1a'}`,
        borderRadius: 4, padding: 24,
        background: hov ? 'rgba(212,255,0,0.02)' : 'transparent',
        cursor: 'none',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ${index * 80}ms, transform 0.6s ${index * 80}ms, border-color 0.3s, background 0.3s`,
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40,
          background: 'rgba(212,255,0,0.08)',
          border: '1px solid rgba(212,255,0,0.15)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color="#d4ff00" />
        </div>
        <span style={{
          fontSize: 9, fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.25em', color: '#d4ff00',
          border: '1px solid rgba(212,255,0,0.2)',
          padding: '3px 8px', borderRadius: 2,
        }}>
          {feature.tag}
        </span>
      </div>
      <h3 style={{
        fontSize: 15, fontWeight: 600, color: hov ? '#d4ff00' : '#f5f5f0',
        marginBottom: 8, transition: 'color 0.3s',
      }}>
        {feature.title}
      </h3>
      <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.6 }}>{feature.desc}</p>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export function HomePage({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ background: '#080808', color: '#f5f5f0', overflowX: 'hidden', cursor: 'none' }}>
      <MagneticCursor />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, background: '#d4ff00', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#080808', fontSize: 14 }}>A</span>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 3 }}>
            ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
          </span>
          <span style={{
            fontSize: 9, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em',
            color: '#6b6b6b', border: '1px solid #242424', padding: '3px 8px', borderRadius: 2,
            textTransform: 'uppercase',
          }}>Events</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#9a9a9a', textDecoration: 'none', cursor: 'none' }}>FEATURES</a>
          <a href="#numbers" style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#9a9a9a', textDecoration: 'none', cursor: 'none' }}>NÚMEROS</a>
          <button
            onClick={onLogin}
            data-magnetic
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#d4ff00', color: '#080808',
              padding: '10px 24px', borderRadius: 2, border: 'none',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', cursor: 'none',
              transition: 'box-shadow 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(212,255,0,0.4)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
          >
            ACESSAR <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* HERO — Logo + particles */}
      <LogoReveal onLogin={onLogin} />

      {/* MARQUEE */}
      <section style={{ padding: '24px 0', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', overflow: 'hidden', position: 'relative' }}>
        <div style={{ background: 'rgba(212,255,0,0.03)', position: 'absolute', inset: 0 }} />
        <div style={{ display: 'flex', gap: 64, width: 'max-content', animation: 'marquee 28s linear infinite' }}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.3em', color: '#6b6b6b', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#d4ff00' }}>✦</span>{item}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* NUMBERS */}
      <section id="numbers" style={{ padding: '120px 64px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {STATS.map((s, i) => <StatCard key={i} {...s} index={i} />)}
        </div>
      </section>

      {/* STATEMENT */}
      <section style={{ padding: '80px 64px', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealText>
            <p style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(32px, 5vw, 64px)',
              letterSpacing: '-0.01em', lineHeight: 1.15, color: '#f5f5f0',
            }}>
              ENQUANTO OS OUTROS TE DÃO UMA{' '}
              <span style={{ color: '#d4ff00' }}>FERRAMENTA DE VENDA</span>
              {', '}NÓS TE ENTREGAMOS UM{' '}
              <span style={{ WebkitTextStroke: '1px #d4ff00', color: 'transparent' }}>SISTEMA OPERACIONAL COMPLETO</span>
              {' '}PARA SEU EVENTO<span style={{ color: '#d4ff00' }}>.</span>
            </p>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 1, background: '#d4ff00' }} />
              <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#6b6b6b' }}>
                ANIMALZ EVENTS — PART OF ANIMALZ GROUP
              </span>
            </div>
          </RevealText>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealText>
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.3em', color: '#d4ff00', marginBottom: 16, textTransform: 'uppercase' }}>
              O que fazemos
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 64 }}>
              TUDO QUE SEU EVENTO<br />PRECISA<span style={{ color: '#d4ff00' }}>.</span>
            </h2>
          </RevealText>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: '120px 64px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <RevealText>
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.3em', color: '#d4ff00', marginBottom: 16, textTransform: 'uppercase' }}>Por que nós</div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 64 }}>
              NÃO É SÓ MAIS UMA<br />PLATAFORMA<span style={{ color: '#d4ff00' }}>.</span>
            </h2>
          </RevealText>
          <div style={{ border: '1px solid #1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '14px 24px', fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#6b6b6b' }}>FEATURE</div>
              <div style={{ padding: '14px 24px', fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#6b6b6b', textAlign: 'center', borderLeft: '1px solid #1a1a1a' }}>CONCORRENTES</div>
              <div style={{ padding: '14px 24px', fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', color: '#d4ff00', textAlign: 'center' }}>ANIMALZ EVENTS</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < COMPARISON.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ padding: '14px 24px', fontSize: 13, color: '#9a9a9a' }}>{row.feature}</div>
                <div style={{ padding: '14px 24px', textAlign: 'center', borderLeft: '1px solid #1a1a1a', color: row.them ? '#6b6b6b' : '#2a2a2a', fontSize: 16 }}>
                  {row.them ? '✓' : '✗'}
                </div>
                <div style={{ padding: '14px 24px', textAlign: 'center', color: '#d4ff00', fontSize: 16 }}>✓</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '160px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <RevealText>
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', letterSpacing: '0.3em', color: '#d4ff00', marginBottom: 24, textTransform: 'uppercase' }}>Animalz Group</div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 8vw, 112px)', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: 16 }}>
              PRONTO PARA<br />OPERAR NO<br /><span style={{ color: '#d4ff00' }}>PRÓXIMO NÍVEL</span>?
            </h2>
            <p style={{ color: '#9a9a9a', marginTop: 24, marginBottom: 48, fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '24px auto 48px' }}>
              Junte-se aos produtores que já usam a plataforma mais avançada de gestão de eventos do Brasil.
            </p>
            <button
              onClick={onLogin}
              data-magnetic
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: '#d4ff00', color: '#080808',
                padding: '20px 48px', borderRadius: 2, border: 'none',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', cursor: 'none',
                transition: 'box-shadow 0.3s, transform 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(212,255,0,0.6)'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }}
            >
              ACESSAR AGORA <ArrowRight size={18} />
            </button>
          </RevealText>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '48px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 24, background: '#d4ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#080808', fontSize: 12 }}>A</span>
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 3 }}>
              ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>EVENTS
            </span>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#6b6b6b' }}>
            © 2025 Animalz Group. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['TERMOS', 'PRIVACIDADE', 'CONTATO'].map(l => (
              <a key={l} href="#" style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#6b6b6b', textDecoration: 'none', cursor: 'none', letterSpacing: '0.15em', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#d4ff00'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b6b6b'}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}