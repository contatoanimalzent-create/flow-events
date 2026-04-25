/**
 * Pulse, HomePage
 * Referência: Rolls-Royce Whispers, NIO, Ferrari, Aston Martin, Pagani
 * Stack: React 18 · TypeScript · Framer Motion ^12 · GSAP 3.15
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  CheckCircle2,
  QrCode,
  Users,
  Activity,
  CreditCard,
} from 'lucide-react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PublicLayout } from '@/features/public'
import { useSeoMeta } from '@/shared/lib'

gsap.registerPlugin(ScrollTrigger)

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomePageProps {
  onLogin?: () => void
}

// ─── Inline animation helpers ─────────────────────────────────────────────────

/** Animated counter that counts up to `end` when in view */
function CounterAnimation({
  end,
  suffix = '',
  duration = 2000,
}: {
  end: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/** 3-D tilt card on mouse move */
function Card3D({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -10
    const rotateY = ((x - cx) / cx) * 10
    gsap.to(card, {
      rotateX,
      rotateY,
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 800,
    })
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

/** Word-by-word reveal */
function WordReveal({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: QrCode,
    title: 'Check-in Mobile',
    body: '500 leituras/min. QR code, offline, anti-fraude.',
    accent: '#C9A84C',
  },
  {
    icon: Users,
    title: 'Gestão de Staff',
    body: 'Convite por link. Ponto eletrônico. Presença em tempo real.',
    accent: '#4285F4',
  },
  {
    icon: Activity,
    title: 'Supervisor ao Vivo',
    body: 'Health score. Ocorrências. Mapa da equipe.',
    accent: '#C9A84C',
  },
  {
    icon: CreditCard,
    title: 'Pagamento D+2',
    body: 'Repasse em 2 dias. Conciliação automática.',
    accent: '#4285F4',
  },
]

const APP_FEATURES = [
  'Check-in QR offline com anti-fraude',
  'Painel do supervisor em tempo real',
  'Controle de acesso por área',
  'Relatórios exportáveis em PDF/CSV',
  'Notificações push para a equipe',
  'Suporte 24/7 durante o evento',
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function HomePage({ onLogin }: HomePageProps) {
  // Hero scroll progress for parallax
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '28%'])
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  // Phone mockup parallax
  const phoneRef = useRef<HTMLDivElement>(null)
  const phoneSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: phoneProgress } = useScroll({
    target: phoneSectionRef,
    offset: ['start end', 'end start'],
  })
  const phoneY = useTransform(phoneProgress, [0, 1], ['60px', '-60px'])

  // Horizontal features scroll
  const featuresSectionRef = useRef<HTMLElement>(null)
  const featuresTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = featuresSectionRef.current
    const track = featuresTrackRef.current
    if (!section || !track) return

    const totalScroll = track.scrollWidth - track.clientWidth

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalScroll + 200}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // Numbers counter section
  const numbersRef = useRef<HTMLElement>(null)
  const numbersInView = useInView(numbersRef, { once: true, margin: '-100px' })

  useSeoMeta({
    title: 'Pulse | Plataforma de Eventos',
    description:
      'Gestão completa de eventos: check-in, staff, ingressos e supervisão em tempo real. A plataforma que opera como uma marca de supercarros.',
    image: '/PULSE-LOGO-PRINCIPAL-FUNDO-PRETO.png',
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <>
      {/* ── Global styles ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(8px); opacity: 0.5; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 40px 8px rgba(201,168,76,0.35); }
          50%       { box-shadow: 0 0 70px 18px rgba(201,168,76,0.55); }
        }
        .marquee-track   { animation: marquee-scroll 30s linear infinite; display: flex; width: max-content; }
        .bounce-arrow    { animation: bounce-arrow 1.8s ease-in-out infinite; }
        .glow-btn        { animation: glow-pulse 2.8s ease-in-out infinite; }
        .features-scroll { overflow: hidden; }
        .preserve-3d     { transform-style: preserve-3d; }
        ::selection      { background: rgba(201,168,76,0.25); color: #F0E8D6; }
      `}</style>

      <PublicLayout onLogin={onLogin} heroPage>
        <div style={{ background: '#060B18', color: '#F0E8D6' }}>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 1, Video Hero (100vh)
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={heroRef}
            style={{
              position: 'relative',
              height: '100vh',
              minHeight: '640px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Video background with parallax */}
            <motion.div
              style={{ position: 'absolute', inset: 0, y: heroY }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/PULSE-LOGO-PRINCIPAL-FUNDO-PRETO.png"
                style={{
                  width: '100%',
                  height: '110%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              >
                <source src="/videos/video.mp4" type="video/mp4" />
              </video>
            </motion.div>

            {/* Gradient overlays */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(6,11,24,0.75) 0%, transparent 40%, rgba(6,11,24,0.95) 100%)',
                zIndex: 1,
              }}
            />
            {/* Gold glow accent */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at 50% 80%, rgba(201,168,76,0.10) 0%, transparent 55%)',
                zIndex: 2,
              }}
            />
            {/* Blue glow top */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at 50% -5%, rgba(66,133,244,0.18) 0%, transparent 45%)',
                zIndex: 2,
              }}
            />

            {/* Hero content */}
            <motion.div
              style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                padding: '0 1.5rem',
                maxWidth: '900px',
                opacity: heroOpacity,
              }}
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.65rem' }}
              >
                <span
                  style={{
                    width: 42,
                    height: 1,
                    background: 'linear-gradient(90deg, rgba(201,168,76,0), rgba(201,168,76,0.95))',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 650,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(232,208,138,0.92)',
                    textShadow: '0 12px 34px rgba(201,168,76,0.22)',
                  }}
                >
                  Do ingresso ao check-in, tudo no controle
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  margin: 0,
                  fontSize: 'clamp(4rem, 9vw, 10rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  color: '#F0E8D6',
                }}
              >
                Cada evento.{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C 0%, #e8d08a 50%, #C9A84C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Sob controle.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  marginTop: '2rem',
                  maxWidth: '38rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  color: 'rgba(240,232,214,0.65)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  lineHeight: 1.75,
                }}
              >
                Check-in, staff, ingressos e supervisão em tempo real, tudo em uma operação conectada e sem fricção.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  marginTop: '2.5rem',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <motion.a
                  href="/create-event"
                  data-cursor="magnetic"
                  data-cursor-text="Criar"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#C9A84C',
                    color: '#060B18',
                    fontWeight: 800,
                    fontSize: '1rem',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Crie seu evento
                </motion.a>
                <motion.button
                  type="button"
                  onClick={onLogin}
                  data-cursor="magnetic"
                  data-cursor-text="Demo"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(240,232,214,0.05)',
                    color: '#F0E8D6',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(240,232,214,0.18)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Ver demonstração
                </motion.button>
              </motion.div>
            </motion.div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 2, Ticker / Marquee infinito
          ══════════════════════════════════════════════════════════════════ */}
          <section
            style={{
              overflow: 'hidden',
              padding: '1.1rem 0',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(6,11,24,0.95)',
            }}
          >
            <div className="marquee-track">
              {Array.from({ length: 3 }).flatMap((_, i) =>
                ['CHECK-IN', 'STAFF', 'INGRESSOS', 'SUPERVISOR', 'RELATÓRIOS', 'PULSE'].map(
                  (item) => (
                    <span
                      key={`${i}-${item}`}
                      style={{
                        color: 'rgba(201,168,76,0.40)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.38em',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        padding: '0 1.5rem',
                      }}
                    >
                      {item}
                      <span style={{ marginLeft: '1.5rem', color: 'rgba(201,168,76,0.20)' }}>·</span>
                    </span>
                  ),
                ),
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 3, Números que impressionam
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={numbersRef}
            style={{
              background: '#060B18',
              padding: 'clamp(5rem, 10vw, 9rem) 1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle grid */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
                style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}
              >
                <p
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    marginBottom: '1rem',
                  }}
                >
                  POR QUE NOS ESCOLHEM
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.5rem, 5vw, 5.5rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#F0E8D6',
                    lineHeight: 1,
                  }}
                >
                  Números reais.
                </h2>
              </motion.div>

              {/* Counters grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  position: 'relative',
                }}
              >
                {[
                  { end: 150, suffix: '+', label: 'Eventos operados', description: 'Shows, festivais, conferências e experiências privadas.' },
                  { end: 50, suffix: 'k+', label: 'Ingressos processados', description: 'Com check-in sub-segundo e zero fraude registrada.' },
                  { end: 98, suffix: '%', label: 'Taxa de satisfação', description: 'Avaliações coletadas de produtores e equipe de campo.' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: '-60px' }}
                    style={{
                      textAlign: 'center',
                      padding: 'clamp(2rem, 4vw, 3.5rem) 1rem',
                      borderRight:
                        i < 2
                          ? '1px solid rgba(201,168,76,0.15)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #C9A84C 0%, #e8d08a 60%, #C9A84C 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {numbersInView ? (
                        <CounterAnimation end={stat.end} suffix={stat.suffix} duration={1800} />
                      ) : (
                        `0${stat.suffix}`
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: '0.75rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#F0E8D6',
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.82rem',
                        color: 'rgba(240,232,214,0.45)',
                        lineHeight: 1.6,
                        maxWidth: '18ch',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                    >
                      {stat.description}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Gold divider line */}
              <div
                style={{
                  marginTop: '3rem',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
                }}
              />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 4, Features com scroll horizontal sticky
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={featuresSectionRef}
            className="features-scroll"
            style={{
              background: '#0D1525',
              position: 'relative',
            }}
          >
            {/* Section header, visible before the pin */}
            <div
              style={{
                padding: 'clamp(4rem, 8vw, 7rem) 1.5rem 2rem',
                maxWidth: '72rem',
                margin: '0 auto',
              }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginBottom: '0.75rem',
                }}
              >
                PLATAFORMA COMPLETA
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{
                  margin: 0,
                  fontSize: 'clamp(2rem, 4vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#F0E8D6',
                  lineHeight: 1.05,
                  maxWidth: '20ch',
                }}
              >
                Quatro pilares. Uma operação.
              </motion.h2>
            </div>

            {/* Pinned horizontal scroll track */}
            <div
              ref={featuresTrackRef}
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '2rem clamp(1.5rem, 4vw, 4rem) clamp(4rem, 8vw, 7rem)',
                width: 'max-content',
              }}
            >
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <Card3D
                    key={feat.title}
                    style={{
                      width: 'clamp(300px, 30vw, 420px)',
                      flexShrink: 0,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      viewport={{ once: true, margin: '-40px' }}
                      style={{
                        background: '#060B18',
                        border: `1px solid ${feat.accent}22`,
                        borderRadius: '1.5rem',
                        padding: 'clamp(2rem, 4vw, 3rem)',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Number watermark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '1.5rem',
                          right: '1.5rem',
                          fontSize: '4rem',
                          fontWeight: 900,
                          color: `${feat.accent}0D`,
                          lineHeight: 1,
                          letterSpacing: '-0.05em',
                          userSelect: 'none',
                        }}
                      >
                        0{i + 1}
                      </div>

                      {/* Icon */}
                      <div
                        style={{
                          width: '3.5rem',
                          height: '3.5rem',
                          borderRadius: '1rem',
                          background: `${feat.accent}14`,
                          border: `1px solid ${feat.accent}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '2rem',
                        }}
                      >
                        <Icon size={22} style={{ color: feat.accent }} />
                      </div>

                      {/* Content */}
                      <h3
                        style={{
                          margin: '0 0 0.75rem',
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          color: '#F0E8D6',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {feat.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: 'rgba(240,232,214,0.55)',
                        }}
                      >
                        {feat.body}
                      </p>

                      {/* Gold bottom accent */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: `linear-gradient(90deg, transparent, ${feat.accent}60, transparent)`,
                        }}
                      />
                    </motion.div>
                  </Card3D>
                )
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 5, Manifesto / Statement bold
          ══════════════════════════════════════════════════════════════════ */}
          <section
            style={{
              background: '#0D1525',
              padding: 'clamp(6rem, 12vw, 11rem) 1.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2
                style={{
                  margin: '0 auto',
                  fontSize: 'clamp(2rem, 6vw, 7rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#F0E8D6',
                  lineHeight: 1.05,
                  maxWidth: '22ch',
                }}
              >
                <WordReveal text="Não é só um app. É a diferença entre um evento que funciona e um que trava." />
              </h2>

              {/* Gold decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
                  margin: '3rem auto',
                  maxWidth: '320px',
                  transformOrigin: 'center',
                }}
              />

              <motion.a
                href="/create-event"
                data-cursor="magnetic"
                data-cursor-text="Começar"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'transparent',
                  color: '#C9A84C',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '1rem 2.25rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(201,168,76,0.5)',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Começar agora
                <span style={{ fontSize: '1.1rem' }}>→</span>
              </motion.a>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 6, Preview do App (mockup + parallax)
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={phoneSectionRef}
            style={{
              background: '#060B18',
              padding: 'clamp(6rem, 10vw, 10rem) 1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(66,133,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(66,133,244,0.03) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                maxWidth: '78rem',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'clamp(3rem, 6vw, 6rem)',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Left, Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              >
                <p
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    marginBottom: '1rem',
                  }}
                >
                  APP DE CAMPO
                </p>
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: 'clamp(2rem, 4vw, 4rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#F0E8D6',
                    lineHeight: 1.05,
                  }}
                >
                  O app que sua equipe usa no campo.
                </h2>
                <p
                  style={{
                    marginBottom: '2rem',
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: 'rgba(240,232,214,0.55)',
                    maxWidth: '36ch',
                  }}
                >
                  Cada membro da equipe conectado. Cada portão monitorado. Zero papel, zero confusão.
                </p>

                {/* Feature list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {APP_FEATURES.map((feat, i) => (
                    <motion.li
                      key={feat}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                      viewport={{ once: true }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid rgba(240,232,214,0.06)',
                        fontSize: '0.9rem',
                        color: 'rgba(240,232,214,0.70)',
                      }}
                    >
                      <CheckCircle2 size={16} style={{ color: '#C9A84C', flexShrink: 0 }} />
                      {feat}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Right, iPhone 15 Pro mockup com parallax */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div ref={phoneRef} style={{ y: phoneY, position: 'relative' }}>

                  {/* ── Botões laterais esquerda (volume) ── */}
                  <div style={{ position: 'absolute', left: '-3px', top: '22%', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 0 }}>
                    {/* mute */}
                    <div style={{ width: 3, height: 28, borderRadius: '2px 0 0 2px', background: 'linear-gradient(180deg,#4a4a4a,#2a2a2a)', boxShadow: '-1px 0 2px rgba(0,0,0,0.6)' }} />
                    {/* vol+ */}
                    <div style={{ width: 3, height: 52, borderRadius: '2px 0 0 2px', background: 'linear-gradient(180deg,#4a4a4a,#2a2a2a)', boxShadow: '-1px 0 2px rgba(0,0,0,0.6)' }} />
                    {/* vol- */}
                    <div style={{ width: 3, height: 52, borderRadius: '2px 0 0 2px', background: 'linear-gradient(180deg,#4a4a4a,#2a2a2a)', boxShadow: '-1px 0 2px rgba(0,0,0,0.6)' }} />
                  </div>

                  {/* ── Botão power direita ── */}
                  <div style={{ position: 'absolute', right: '-3px', top: '28%', zIndex: 0 }}>
                    <div style={{ width: 3, height: 72, borderRadius: '0 2px 2px 0', background: 'linear-gradient(180deg,#4a4a4a,#2a2a2a)', boxShadow: '1px 0 2px rgba(0,0,0,0.6)' }} />
                  </div>

                  {/* ── Frame externo (titânio) ── */}
                  <div
                    style={{
                      width: 'clamp(230px, 26vw, 310px)',
                      aspectRatio: '9 / 19.5',
                      borderRadius: '3rem',
                      padding: '3px',
                      background: 'linear-gradient(145deg, #6b6b6b 0%, #2e2e2e 30%, #1a1a1a 60%, #3d3d3d 100%)',
                      boxShadow: [
                        '0 60px 120px rgba(0,0,0,0.8)',
                        '0 20px 40px rgba(0,0,0,0.5)',
                        '0 0 0 0.5px rgba(255,255,255,0.12)',
                        'inset 0 1px 0 rgba(255,255,255,0.15)',
                        '0 0 60px rgba(201,168,76,0.12)',
                      ].join(', '),
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {/* Frame interno lustre */}
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'calc(3rem - 3px)',
                        background: '#08080A',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* ── Reflexo de luz no canto superior ── */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '35%',
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
                        pointerEvents: 'none',
                        zIndex: 20,
                        borderRadius: 'inherit',
                      }} />

                      {/* ── Dynamic Island ── */}
                      <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '95px',
                        height: '30px',
                        borderRadius: '999px',
                        background: '#000000',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '10px',
                        gap: '5px',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                      }}>
                        {/* câmera dot */}
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.10)', position: 'relative' }}>
                          <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#1a3a5c', opacity: 0.8 }} />
                          <div style={{ position: 'absolute', top: 1, left: 1, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                        </div>
                        {/* face id dot */}
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </div>

                      {/* ── Tela / conteúdo do app ── */}
                      <div style={{
                        flex: 1,
                        background: 'linear-gradient(160deg, #0D1525 0%, #060B18 100%)',
                        padding: '58px 14px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        overflowY: 'hidden',
                      }}>
                        {/* Status bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0E8D6', fontFamily: 'SF Pro Text, system-ui, sans-serif' }}>9:41</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {/* signal bars */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5px' }}>
                              {[6, 9, 12, 15].map((h, i) => (
                                <div key={i} style={{ width: 3, height: h, borderRadius: '1px', background: i < 3 ? '#F0E8D6' : 'rgba(240,232,214,0.3)' }} />
                              ))}
                            </div>
                            {/* wifi */}
                            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                              <path d="M6.5 7.5a1 1 0 110 2 1 1 0 010-2z" fill="#F0E8D6"/>
                              <path d="M3.5 5.5C4.5 4.2 5.4 3.8 6.5 3.8s2 .4 3 1.7" stroke="#F0E8D6" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                              <path d="M1 3C2.8 1.1 4.5.5 6.5.5S10.2 1.1 12 3" stroke="#F0E8D6" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6"/>
                            </svg>
                            {/* battery */}
                            <div style={{ position: 'relative', width: 20, height: 10, border: '1px solid rgba(240,232,214,0.5)', borderRadius: '2px' }}>
                              <div style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)', width: 2, height: 5, background: 'rgba(240,232,214,0.5)', borderRadius: '0 1px 1px 0' }} />
                              <div style={{ position: 'absolute', inset: '1px', borderRadius: '1px', background: '#22C55E', width: '90%' }} />
                            </div>
                          </div>
                        </div>

                        {/* CHECK-IN card principal */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)',
                          border: '1px solid rgba(201,168,76,0.30)',
                          borderRadius: '16px',
                          padding: '14px',
                        }}>
                          <div style={{ fontSize: '8px', color: '#C9A84C', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>
                            CHECK-IN AO VIVO
                          </div>
                          <div style={{ fontSize: '30px', fontWeight: 900, color: '#F0E8D6', letterSpacing: '-0.04em', lineHeight: 1, fontFamily: 'system-ui' }}>
                            2.847
                          </div>
                          <div style={{ fontSize: '9px', color: 'rgba(240,232,214,0.45)', marginTop: '3px' }}>
                            Ingressos validados hoje
                          </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {[{ label: 'ATIVOS', value: '14' }, { label: 'PORTÕES', value: '6/6' }].map((s) => (
                            <div key={s.label} style={{
                              background: 'rgba(240,232,214,0.04)',
                              border: '1px solid rgba(240,232,214,0.07)',
                              borderRadius: '12px',
                              padding: '10px',
                            }}>
                              <div style={{ fontSize: '7px', color: 'rgba(240,232,214,0.38)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: '#F0E8D6', marginTop: '2px', lineHeight: 1 }}>{s.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Lista portões */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {[
                            { name: 'Portão A', status: 'OK', time: '21:34' },
                            { name: 'VIP Sul',  status: 'OK', time: '21:33' },
                            { name: 'Backstage', status: '!', time: '21:31' },
                          ].map((row, i, arr) => (
                            <div key={row.name} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 0',
                              borderBottom: i < arr.length - 1 ? '1px solid rgba(240,232,214,0.05)' : 'none',
                            }}>
                              <span style={{ fontSize: '11px', color: 'rgba(240,232,214,0.75)', fontWeight: 500 }}>{row.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', color: 'rgba(240,232,214,0.3)' }}>{row.time}</span>
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  background: row.status === 'OK' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.18)',
                                  color:       row.status === 'OK' ? '#22C55E'             : '#EAB308',
                                  border:      `1px solid ${row.status === 'OK' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.25)'}`,
                                }}>
                                  {row.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Botão Escanear */}
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #C9A84C 0%, #E8D080 50%, #C9A84C 100%)',
                            borderRadius: '14px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
                          }}>
                            <QrCode size={13} style={{ color: '#060B18' }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#060B18', letterSpacing: '0.12em' }}>
                              ESCANEAR INGRESSO
                            </span>
                          </div>

                          {/* Home indicator */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            <div style={{ width: '36%', height: '4px', borderRadius: '999px', background: 'rgba(240,232,214,0.28)' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Reflexo/sombra no chão ── */}
                  <div
                    style={{
                      marginTop: '-1rem',
                      height: '3rem',
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.15), transparent 70%)',
                      filter: 'blur(8px)',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
               SEÇÃO 7, CTA Final
          ══════════════════════════════════════════════════════════════════ */}
          <section
            style={{
              background: 'linear-gradient(160deg, #060B18 0%, #0D1525 100%)',
              padding: 'clamp(7rem, 14vw, 12rem) 1.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              borderTop: '1px solid rgba(201,168,76,0.10)',
            }}
          >
            {/* Top gold line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)',
              }}
            />

            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '60%',
                background:
                  'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 65%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
                height: '40%',
                background:
                  'radial-gradient(ellipse, rgba(66,133,244,0.06) 0%, transparent 65%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: '64rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginBottom: '1.25rem',
                }}
              >
                PRÓXIMO PASSO
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{
                  margin: '0 0 1.5rem',
                  fontSize: 'clamp(2.5rem, 6vw, 6.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#F0E8D6',
                  lineHeight: 0.95,
                }}
              >
                Pronto para operar seu próximo evento?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                style={{
                  fontSize: '1.05rem',
                  color: 'rgba(240,232,214,0.55)',
                  maxWidth: '38ch',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.75,
                  marginBottom: '3rem',
                }}
              >
                Comece gratuitamente. Sem cartão, sem burocracia. Sua operação no ar em menos de 10 minutos.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Primary CTA, gold glow */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-8px',
                      borderRadius: '999px',
                      background: 'rgba(201,168,76,0.25)',
                      filter: 'blur(16px)',
                      animation: 'glow-pulse 2.8s ease-in-out infinite',
                    }}
                  />
                  <motion.a
                    href="/create-event"
                    data-cursor="magnetic"
                    data-cursor-text="Grátis"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: '#C9A84C',
                      color: '#060B18',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      padding: '1.1rem 2.5rem',
                      borderRadius: '999px',
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Criar evento grátis
                  </motion.a>
                </div>

                {/* Secondary CTA, WhatsApp */}
                <motion.a
                  href="https://wa.me/14698629040"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="magnetic"
                  data-cursor-text="Chat"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(240,232,214,0.05)',
                    color: '#F0E8D6',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    padding: '1.1rem 2.5rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(240,232,214,0.16)',
                    textDecoration: 'none',
                    backdropFilter: 'blur(8px)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {/* WhatsApp icon inline SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Falar com a equipe
                </motion.a>
              </motion.div>

              {/* Trust footnote */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                style={{
                  marginTop: '2rem',
                  fontSize: '0.75rem',
                  color: 'rgba(240,232,214,0.25)',
                  letterSpacing: '0.05em',
                }}
              >
                Sem cartão de crédito · Cancele quando quiser · Dados protegidos pela LGPD
              </motion.p>
            </div>
          </section>

        </div>
      </PublicLayout>
    </>
  )
}

export default HomePage
