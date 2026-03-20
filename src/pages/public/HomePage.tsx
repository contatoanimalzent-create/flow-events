import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowRight, Zap, Shield, Globe, BarChart3, Users, ScanLine } from 'lucide-react'

/* ── i18n ────────────────────────────────────────────────────── */
type Lang = 'en' | 'pt' | 'es' | 'ar'

const LANGS: { code: Lang; label: string; flag: string; dir?: 'rtl' }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'ar', label: 'AR', flag: '🇦🇪', dir: 'rtl' },
]

const T: Record<Lang, Record<string, string | string[]>> = {
  en: {
    badge:       'Animalz Group · Event Platform',
    line1:       'CREATE,',
    line2:       'SELL,',
    line3:       'OPERATE',
    line4:       'AND SCALE',
    line5:       'EVENTS',
    tagline:     'The most complete operational platform in Brazil for event producers who want to grow intelligently.',
    cta:         'ACCESS PLATFORM',
    features:    'FEATURES',
    numbers:     'NUMBERS',
    access:      'ACCESS',
    sect_what:   'WHAT WE DO',
    sect_title:  'EVERYTHING YOUR\nEVENT NEEDS',
    statement:   'WHILE OTHERS GIVE YOU A SELLING TOOL, WE GIVE YOU A COMPLETE OPERATIONAL SYSTEM FOR YOUR EVENT.',
    why:         'WHY US',
    not_just:    "IT'S NOT JUST\nANOTHER PLATFORM",
    ready:       'READY TO OPERATE\nAT THE NEXT LEVEL?',
    ready_sub:   'Join the producers who already use the most advanced event management platform in Brazil.',
    cta2:        'ACCESS NOW',
    feat:        ['OPERATION','INTELLIGENCE','TEAM','GROWTH','BRANDING','SECURITY'],
    feat_title:  ['Multi-device check-in','Live operational dashboard','Complete staff management','Built-in Growth Services','Full white-label','Dynamic anti-fraud QR'],
    feat_desc:   [
      'Simultaneous gates, offline sync, real-time anti-fraud. No more stuck lines.',
      'Heat map, gate flow, automatic alerts. You see everything as it happens.',
      'Digital time-tracking via QR, scheduling, supervision, reports.',
      'AI analyzes your data and suggests actions to sell more.',
      'Your domain, your email, your brand. Buyers only see you.',
      'Rotating token, clone detection, automatic blocking. Zero fraud at entry.',
    ],
    comparison_feat: 'FEATURE',
    comparison_them: 'COMPETITORS',
    comparison_us:   'ANIMALZ EVENTS',
    rows: ['Ticket sales','Operational check-in','Staff + time tracking','Touch POS + inventory','Supplier management','Full white-label','Growth services with AI','Native PIX (Brazil)','Social ticket (Stories)','Live heat map'],
    footer_rights: '© 2025 Animalz Group. All rights reserved.',
    stat_labels: ['Events managed','Tickets issued','Uptime guaranteed','Faster than competitors'],
  },
  pt: {
    badge:       'Animalz Group · Plataforma de Eventos',
    line1:       'CREATE,',
    line2:       'SELL,',
    line3:       'OPERATE',
    line4:       'AND SCALE',
    line5:       'EVENTS',
    tagline:     'A plataforma operacional mais completa do Brasil para produtores que querem crescer com inteligência.',
    cta:         'ACESSAR PLATAFORMA',
    features:    'FEATURES',
    numbers:     'NÚMEROS',
    access:      'ACESSAR',
    sect_what:   'O QUE FAZEMOS',
    sect_title:  'TUDO QUE SEU\nEVENTO PRECISA',
    statement:   'ENQUANTO OS OUTROS TE DÃO UMA FERRAMENTA DE VENDA, NÓS TE ENTREGAMOS UM SISTEMA OPERACIONAL COMPLETO PARA SEU EVENTO.',
    why:         'POR QUE NÓS',
    not_just:    'NÃO É SÓ MAIS\nUMA PLATAFORMA',
    ready:       'PRONTO PARA OPERAR\nNO PRÓXIMO NÍVEL?',
    ready_sub:   'Junte-se aos produtores que já usam a plataforma mais avançada de gestão de eventos do Brasil.',
    cta2:        'ACESSAR AGORA',
    feat:        ['OPERAÇÃO','INTELIGÊNCIA','EQUIPE','CRESCIMENTO','BRANDING','SEGURANÇA'],
    feat_title:  ['Check-in multi-dispositivo','Dashboard operacional ao vivo','Gestão completa de staff','Growth Services embutido','White-label completo','QR dinâmico antifraude'],
    feat_desc:   [
      'Portarias simultâneas, offline sync, antifraude em tempo real. Nunca mais fila travada.',
      'Mapa de calor, fluxo por portaria, alertas automáticos. Você enxerga tudo enquanto acontece.',
      'Ponto digital via QR, escala, supervisão, relatórios.',
      'IA analisa seus dados e sugere ações para vender mais.',
      'Seu domínio, seu e-mail, sua marca. O comprador nunca vê Animalz.',
      'Token rotativo, detecção de clone, bloqueio automático. Zero golpe na entrada.',
    ],
    comparison_feat: 'FEATURE',
    comparison_them: 'CONCORRENTES',
    comparison_us:   'ANIMALZ EVENTS',
    rows: ['Venda de ingressos','Check-in operacional','Staff + ponto','PDV touch + estoque','Gestão de fornecedores','White-label completo','Growth services com IA','PIX nativo (Brasil)','Ticket social (Stories)','Mapa de calor ao vivo'],
    footer_rights: '© 2025 Animalz Group. Todos os direitos reservados.',
    stat_labels: ['Eventos gerenciados','Ingressos emitidos','Uptime garantido','Mais rápido que concorrentes'],
  },
  es: {
    badge:       'Animalz Group · Plataforma de Eventos',
    line1:       'CREATE,',
    line2:       'SELL,',
    line3:       'OPERATE',
    line4:       'AND SCALE',
    line5:       'EVENTS',
    tagline:     'La plataforma operacional más completa de Brasil para productores que quieren crecer con inteligencia.',
    cta:         'ACCEDER A LA PLATAFORMA',
    features:    'FEATURES',
    numbers:     'NÚMEROS',
    access:      'ACCEDER',
    sect_what:   'LO QUE HACEMOS',
    sect_title:  'TODO LO QUE TU\nEVENTO NECESITA',
    statement:   'MIENTRAS OTROS TE DAN UNA HERRAMIENTA DE VENTA, NOSOTROS TE ENTREGAMOS UN SISTEMA OPERACIONAL COMPLETO PARA TU EVENTO.',
    why:         'POR QUÉ NOSOTROS',
    not_just:    'NO ES SOLO OTRA\nPLATAFORMA',
    ready:       '¿LISTO PARA OPERAR\nAL SIGUIENTE NIVEL?',
    ready_sub:   'Únete a los productores que ya usan la plataforma más avanzada de gestión de eventos de Brasil.',
    cta2:        'ACCEDER AHORA',
    feat:        ['OPERACIÓN','INTELIGENCIA','EQUIPO','CRECIMIENTO','BRANDING','SEGURIDAD'],
    feat_title:  ['Check-in multi-dispositivo','Dashboard operacional en vivo','Gestión completa de staff','Growth Services integrado','White-label completo','QR dinámico antifraude'],
    feat_desc:   [
      'Puertas simultáneas, sincronización offline, antifraude en tiempo real.',
      'Mapa de calor, flujo por puerta, alertas automáticas.',
      'Control de asistencia digital vía QR, turnos, supervisión, informes.',
      'La IA analiza tus datos y sugiere acciones para vender más.',
      'Tu dominio, tu email, tu marca. El comprador solo te ve a ti.',
      'Token rotativo, detección de clones, bloqueo automático.',
    ],
    comparison_feat: 'FEATURE',
    comparison_them: 'COMPETIDORES',
    comparison_us:   'ANIMALZ EVENTS',
    rows: ['Venta de entradas','Check-in operacional','Staff + control horario','TPV táctil + inventario','Gestión de proveedores','White-label completo','Growth services con IA','PIX nativo (Brasil)','Ticket social (Stories)','Mapa de calor en vivo'],
    footer_rights: '© 2025 Animalz Group. Todos los derechos reservados.',
    stat_labels: ['Eventos gestionados','Entradas emitidas','Uptime garantizado','Más rápido que competidores'],
  },
  ar: {
    badge:       'مجموعة أنيمالز · منصة الفعاليات',
    line1:       'CREATE,',
    line2:       'SELL,',
    line3:       'OPERATE',
    line4:       'AND SCALE',
    line5:       'EVENTS',
    tagline:     'المنصة التشغيلية الأكثر اكتمالاً لمنظمي الفعاليات الذين يريدون النمو بذكاء.',
    cta:         'الوصول إلى المنصة',
    features:    'المميزات',
    numbers:     'الأرقام',
    access:      'دخول',
    sect_what:   'ما نقدمه',
    sect_title:  'كل ما تحتاجه\nفعاليتك',
    statement:   'بينما يمنحك الآخرون أداة بيع، نحن نمنحك نظاماً تشغيلياً متكاملاً لفعاليتك.',
    why:         'لماذا نحن',
    not_just:    'ليست مجرد\nمنصة أخرى',
    ready:       'هل أنت مستعد للعمل\nبالمستوى التالي؟',
    ready_sub:   'انضم إلى المنظمين الذين يستخدمون أكثر منصات إدارة الفعاليات تطوراً.',
    cta2:        'الوصول الآن',
    feat:        ['العمليات','الذكاء','الفريق','النمو','العلامة التجارية','الأمان'],
    feat_title:  ['تسجيل دخول متعدد الأجهزة','لوحة تحكم تشغيلية مباشرة','إدارة شاملة للطاقم','خدمات النمو المدمجة','علامة بيضاء كاملة','رمز QR ديناميكي مضاد للاحتيال'],
    feat_desc:   [
      'بوابات متزامنة، مزامنة دون اتصال، مكافحة الاحتيال في الوقت الفعلي.',
      'خريطة حرارية، تدفق البوابات، تنبيهات تلقائية.',
      'تتبع الوقت الرقمي عبر QR، جداول العمل، الإشراف.',
      'تحلل الذكاء الاصطناعي بياناتك وتقترح إجراءات لزيادة المبيعات.',
      'نطاقك، بريدك الإلكتروني، علامتك التجارية.',
      'رمز دوار، كشف الاستنساخ، حظر تلقائي.',
    ],
    comparison_feat: 'الميزة',
    comparison_them: 'المنافسون',
    comparison_us:   'أنيمالز إيفنتس',
    rows: ['بيع التذاكر','تسجيل الدخول التشغيلي','الطاقم + تتبع الوقت','نقطة بيع + مخزون','إدارة الموردين','علامة بيضاء كاملة','خدمات النمو بالذكاء','PIX المحلي','تذكرة اجتماعية','خريطة حرارية مباشرة'],
    footer_rights: '© 2025 مجموعة أنيمالز. جميع الحقوق محفوظة.',
    stat_labels: ['فعالية مُدارة','تذكرة صادرة','ضمان الوقت الفعلي','أسرع من المنافسين'],
  },
}

/* ── useInView ───────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
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
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
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

/* ── Cursor com trail estilo Lando Norris ────────────────────── */
function MagneticCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement[]>([])
  const TRAIL_LEN = 12
  const positions = useRef<{x:number;y:number}[]>(Array(TRAIL_LEN).fill({x:0,y:0}))
  const cur = useRef({x:0,y:0,rx:0,ry:0})

  useEffect(() => {
    // Cria elementos de trail
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;'
    document.body.appendChild(container)

    const trails: HTMLDivElement[] = []
    for (let i = 0; i < TRAIL_LEN; i++) {
      const el = document.createElement('div')
      const size = 4 - (i * 0.25)
      el.style.cssText = `position:absolute;border-radius:50%;background:#d4ff00;pointer-events:none;transform:translate(-50%,-50%);transition:none;`
      el.style.width  = size + 'px'
      el.style.height = size + 'px'
      el.style.opacity = String(0.6 - i * 0.05)
      container.appendChild(el)
      trails.push(el)
    }
    trailRef.current = trails

    let raf: number
    const tick = () => {
      // Dot segue diretamente
      if (dotRef.current) {
        dotRef.current.style.left = cur.current.x + 'px'
        dotRef.current.style.top  = cur.current.y + 'px'
      }
      // Ring com lerp
      cur.current.rx += (cur.current.x - cur.current.rx) * 0.1
      cur.current.ry += (cur.current.y - cur.current.ry) * 0.1
      if (ringRef.current) {
        ringRef.current.style.left = cur.current.rx + 'px'
        ringRef.current.style.top  = cur.current.ry + 'px'
      }
      // Trail — cada posição segue a anterior com delay
      positions.current.unshift({x: cur.current.x, y: cur.current.y})
      positions.current = positions.current.slice(0, TRAIL_LEN)
      trails.forEach((el, i) => {
        const p = positions.current[i] ?? positions.current[positions.current.length - 1]
        el.style.left = p.x + 'px'
        el.style.top  = p.y + 'px'
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => { cur.current.x = e.clientX; cur.current.y = e.clientY }
    const onEnter = () => {
      if (dotRef.current)  { dotRef.current.style.transform  = 'translate(-50%,-50%) scale(2)'; dotRef.current.style.background = '#d4ff00' }
      if (ringRef.current) { ringRef.current.style.transform = 'translate(-50%,-50%) scale(1.8)'; ringRef.current.style.borderColor = 'rgba(212,255,0,0.9)' }
    }
    const onLeave = () => {
      if (dotRef.current)  { dotRef.current.style.transform  = 'translate(-50%,-50%) scale(1)' }
      if (ringRef.current) { ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)'; ringRef.current.style.borderColor = 'rgba(212,255,0,0.35)' }
    }
    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      document.body.removeChild(container)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{ position:'fixed',top:0,left:0,zIndex:9999,width:8,height:8,background:'#d4ff00',borderRadius:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',transition:'transform 0.2s,background 0.2s' }} />
      <div ref={ringRef} style={{ position:'fixed',top:0,left:0,zIndex:9998,width:38,height:38,border:'1px solid rgba(212,255,0,0.35)',borderRadius:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1),border-color 0.3s' }} />
    </>
  )
}

/* ── Particle Canvas ─────────────────────────────────────────── */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let w = c.width = innerWidth, h = c.height = innerHeight
    const onResize = () => { w = c.width = innerWidth; h = c.height = innerHeight }
    window.addEventListener('resize', onResize)
    type P = { x:number;y:number;vx:number;vy:number;r:number;a:number }
    const ps: P[] = Array.from({length:70},()=>({ x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.2+.3,a:Math.random() }))
    let mx=w/2,my=h/2
    const onMove=(e:MouseEvent)=>{mx=e.clientX;my=e.clientY}
    document.addEventListener('mousemove',onMove)
    let raf:number
    const draw=()=>{
      ctx.clearRect(0,0,w,h)
      for(const p of ps){
        const dx=mx-p.x,dy=my-p.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<180){p.vx-=dx/d*.006;p.vy-=dy/d*.006}
        p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.vy*=.99
        if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(212,255,0,${p.a*.35})`;ctx.fill()
      }
      for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
        const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<110){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=`rgba(212,255,0,${.07*(1-d/110)})`;ctx.lineWidth=.5;ctx.stroke()}
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{ cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);document.removeEventListener('mousemove',onMove) }
  },[])
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />
}

/* ── Lang Switcher ───────────────────────────────────────────── */
function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const current = LANGS.find(l => l.code === lang)!
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        data-hover
        style={{ display:'flex',alignItems:'center',gap:6,fontSize:11,fontFamily:'DM Mono,monospace',letterSpacing:'0.15em',color:'#9a9a9a',background:'none',border:'1px solid #242424',padding:'6px 12px',borderRadius:2,cursor:'none',transition:'border-color 0.2s,color 0.2s' }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(212,255,0,0.4)';(e.currentTarget as HTMLElement).style.color='#d4ff00'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#242424';(e.currentTarget as HTMLElement).style.color='#9a9a9a'}}
      >
        {current.flag} {current.label}
      </button>
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:'#0e0e0e',border:'1px solid #242424',borderRadius:2,overflow:'hidden',zIndex:100,minWidth:100 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }}
              style={{ display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 14px',fontSize:11,fontFamily:'DM Mono,monospace',letterSpacing:'0.15em',color: lang === l.code ? '#d4ff00' : '#9a9a9a',background:'none',border:'none',cursor:'none',transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(212,255,0,0.06)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── StatementText — sem duplicação ─────────────────────────── */
function StatementText({ lang, isRtl, t }: { lang: Lang; isRtl: boolean; t: Record<string, string | string[]> }) {
  const style: React.CSSProperties = {
    fontFamily: 'Bebas Neue,sans-serif',
    fontSize: 'clamp(28px,4.5vw,60px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.15,
    color: '#f5f5f0',
    textAlign: isRtl ? 'right' : 'left',
  }
  const acid  = { color: '#d4ff00' }
  const outline: React.CSSProperties = { WebkitTextStroke: '1px #d4ff00', color: 'transparent' }

  if (lang === 'en') return (
    <p style={style}>
      WHILE OTHERS GIVE YOU A <span style={acid}>SELLING TOOL</span>, WE GIVE YOU A{' '}
      <span style={outline}>COMPLETE OPERATIONAL SYSTEM</span> FOR YOUR EVENT.
    </p>
  )
  if (lang === 'pt') return (
    <p style={style}>
      ENQUANTO OS OUTROS TE DÃO UMA <span style={acid}>FERRAMENTA DE VENDA</span>, NÓS TE ENTREGAMOS UM{' '}
      <span style={outline}>SISTEMA OPERACIONAL COMPLETO</span> PARA SEU EVENTO.
    </p>
  )
  if (lang === 'es') return (
    <p style={style}>
      MIENTRAS OTROS TE DAN UNA <span style={acid}>HERRAMIENTA DE VENTA</span>, NOSOTROS TE ENTREGAMOS UN{' '}
      <span style={outline}>SISTEMA OPERACIONAL COMPLETO</span> PARA TU EVENTO.
    </p>
  )
  return <p style={style}>{t.statement as string}</p>
}

/* ── TitleWithClipEffect — efeito estilo Lando Norris ───────── */
function TitleWithClipEffect({ t, scrollY, mounted }: { t: Record<string, string | string[]>; scrollY: number; mounted: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [clipX, setClipX] = useState(0)
  const [clipY, setClipY] = useState(0)
  const [inside, setInside] = useState(false)
  const size = 280

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setClipX(e.clientX - rect.left)
    setClipY(e.clientY - rect.top)
  }, [])

  const baseStyle: React.CSSProperties = {
    fontFamily: 'Bebas Neue,sans-serif',
    fontSize: 'clamp(72px,13vw,180px)',
    letterSpacing: '-0.02em',
    lineHeight: 0.92,
    textAlign: 'center',
    userSelect: 'none',
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setInside(true)}
      onMouseLeave={() => setInside(false)}
      style={{
        position: 'relative',
        zIndex: 10,
        transform: `translateY(${scrollY * -0.12}px)`,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.8s 0.3s',
      }}
    >
      {/* Camada base — branco normal */}
      <h1 style={{ ...baseStyle, color: '#f5f5f0', margin: 0 }}>
        <span style={{ display:'block' }}>{t.line1 as string}</span>
        <span style={{ display:'block' }}>{t.line2 as string}</span>
        <span style={{ display:'block', color:'#d4ff00' }}>{t.line3 as string}</span>
        <span style={{ display:'block' }}>{t.line4 as string}</span>
        <span style={{ display:'block' }}>{t.line5 as string}<span style={{ color:'#d4ff00' }}>.</span></span>
      </h1>

      {/* Camada revelada pelo cursor — acid glow + outline */}
      <h1 style={{
        ...baseStyle, margin: 0,
        position: 'absolute', inset: 0,
        color: '#d4ff00',
        WebkitTextStroke: '1px #d4ff00',
        textShadow: '0 0 40px rgba(212,255,0,0.8), 0 0 80px rgba(212,255,0,0.4)',
        clipPath: inside
          ? `circle(${size / 2}px at ${clipX}px ${clipY}px)`
          : 'circle(0px at 50% 50%)',
        transition: inside ? 'clip-path 0.1s ease-out' : 'clip-path 0.5s ease-in',
        pointerEvents: 'none',
      }}>
        <span style={{ display:'block' }}>{t.line1 as string}</span>
        <span style={{ display:'block' }}>{t.line2 as string}</span>
        <span style={{ display:'block' }}>{t.line3 as string}</span>
        <span style={{ display:'block' }}>{t.line4 as string}</span>
        <span style={{ display:'block' }}>{t.line5 as string}<span>.</span></span>
      </h1>
    </div>
  )
}

/* ── StatItem ────────────────────────────────────────────────── */
function StatItem({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{ textAlign:'center',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(30px)',transition:`opacity 0.7s ${index*100}ms,transform 0.7s ${index*100}ms` }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(48px,6vw,80px)',color:'#d4ff00',lineHeight:1 }}>
        <Counter to={value} suffix={suffix} />
      </div>
      <div style={{ fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#6b6b6b',marginTop:8,textTransform:'uppercase' }}>{label}</div>
    </div>
  )
}

/* ── FeatureItem ─────────────────────────────────────────────── */
function FeatureItem({ Icon, tag, title, desc, index }: { Icon: React.ElementType; tag: string; title: string; desc: string; index: number }) {
  const { ref, inView } = useInView()
  const [hov, setHov] = useState(false)
  return (
    <div ref={ref} data-hover
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border:`1px solid ${hov?'rgba(212,255,0,0.25)':'#1a1a1a'}`,borderRadius:4,padding:24,background:hov?'rgba(212,255,0,0.02)':'transparent',cursor:'none',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(30px)',transition:`opacity 0.6s ${index*80}ms,transform 0.6s ${index*80}ms,border-color 0.3s,background 0.3s` }}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16 }}>
        <div style={{ width:40,height:40,background:'rgba(212,255,0,0.08)',border:'1px solid rgba(212,255,0,0.15)',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon size={18} color="#d4ff00" />
        </div>
        <span style={{ fontSize:9,fontFamily:'DM Mono,monospace',letterSpacing:'0.25em',color:'#d4ff00',border:'1px solid rgba(212,255,0,0.2)',padding:'3px 8px',borderRadius:2 }}>{tag}</span>
      </div>
      <h3 style={{ fontSize:15,fontWeight:600,color:hov?'#d4ff00':'#f5f5f0',marginBottom:8,transition:'color 0.3s' }}>{title}</h3>
      <p style={{ fontSize:13,color:'#6b6b6b',lineHeight:1.6 }}>{desc}</p>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export function HomePage({ onLogin }: { onLogin: () => void }) {
  const [lang, setLang] = useState<Lang>('en')
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const t = T[lang]
  const isRtl = lang === 'ar'

  useEffect(() => {
    setMounted(true)
    // Detect browser language
    const bl = navigator.language?.toLowerCase()
    if (bl.startsWith('pt')) setLang('pt')
    else if (bl.startsWith('es')) setLang('es')
    else if (bl.startsWith('ar')) setLang('ar')

    const onScroll = () => setScrollY(window.scrollY)
    const onMove   = (e: MouseEvent) => setMouse({ x:(e.clientX/innerWidth-.5)*2, y:(e.clientY/innerHeight-.5)*2 })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove) }
  }, [])

  const COMPARISON_ROWS = t.rows as string[]
  const FEAT = (t.feat as string[])
  const FEAT_TITLE = (t.feat_title as string[])
  const FEAT_DESC  = (t.feat_desc as string[])
  const ICONS = [ScanLine, BarChart3, Users, Zap, Globe, Shield]

  return (
    <div style={{ background:'#080808',color:'#f5f5f0',overflowX:'hidden',cursor:'none',direction: isRtl ? 'rtl' : 'ltr' }}>
      <MagneticCursor />

      {/* ── NAV ── */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 48px',background:'linear-gradient(to bottom,rgba(8,8,8,0.92) 0%,transparent 100%)',backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:28,height:28,background:'#d4ff00',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ fontFamily:'Bebas Neue,sans-serif',color:'#080808',fontSize:14 }}>A</span>
          </div>
          <span style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:3 }}>
            ANIMALZ<span style={{ color:'#d4ff00' }}>.</span>
          </span>
          <span style={{ fontSize:9,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#6b6b6b',border:'1px solid #242424',padding:'3px 8px',borderRadius:2,textTransform:'uppercase' }}>Events</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:28 }}>
          <a href="#features" data-hover style={{ fontSize:11,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#9a9a9a',textDecoration:'none',cursor:'none',transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#d4ff00'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9a9a9a'}>
            {t.features}
          </a>
          <a href="#numbers" data-hover style={{ fontSize:11,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#9a9a9a',textDecoration:'none',cursor:'none',transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#d4ff00'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9a9a9a'}>
            {t.numbers}
          </a>
          <LangSwitcher lang={lang} setLang={setLang} />
          <button onClick={onLogin} data-hover
            style={{ display:'flex',alignItems:'center',gap:8,background:'#d4ff00',color:'#080808',padding:'10px 24px',borderRadius:2,border:'none',fontSize:11,fontWeight:700,letterSpacing:'0.15em',cursor:'none',transition:'box-shadow 0.3s,transform 0.15s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='0 0 30px rgba(212,255,0,0.5)';(e.currentTarget as HTMLElement).style.transform='scale(1.04)' }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.transform='scale(1)' }}>
            {t.access} <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
        <Particles />

        {/* Grid parallax */}
        <div style={{ position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(#d4ff00 1px,transparent 1px),linear-gradient(90deg,#d4ff00 1px,transparent 1px)',backgroundSize:'80px 80px',transform:`translate(${mouse.x*-10}px,${mouse.y*-10}px)`,transition:'transform 0.12s ease-out',pointerEvents:'none' }} />

        {/* Glow orb */}
        <div style={{ position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,255,0,0.07) 0%,transparent 70%)',top:'50%',left:'50%',transform:`translate(calc(-50% + ${mouse.x*80}px),calc(-50% + ${mouse.y*80}px))`,transition:'transform 0.25s ease-out',pointerEvents:'none' }} />

        {/* Badge */}
        <div style={{ position:'relative',zIndex:10,display:'flex',alignItems:'center',gap:8,marginBottom:48,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(20px)',transition:'opacity 0.8s 0.2s,transform 0.8s 0.2s' }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#d4ff00',display:'inline-block',animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11,fontFamily:'DM Mono,monospace',letterSpacing:'0.3em',color:'#d4ff00',textTransform:'uppercase' }}>
            {t.badge}
          </span>
        </div>

        {/* TITLE — clip-path effect estilo Lando Norris */}
        <TitleWithClipEffect t={t} scrollY={scrollY} mounted={mounted} />

        {/* Scroll line */}
        <div style={{ position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,opacity:mounted?0.4:0,transition:'opacity 1s 1.5s',pointerEvents:'none' }}>
          <div style={{ width:1,height:56,background:'linear-gradient(to bottom,#d4ff00,transparent)',animation:'scrollLine 2.5s ease-in-out infinite' }} />
        </div>

        <style>{`
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes scrollLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
          @keyframes marquee{to{transform:translateX(-50%)}}
        `}</style>
      </section>

      {/* ── MARQUEE ── */}
      <section style={{ padding:'24px 0',borderTop:'1px solid #1a1a1a',borderBottom:'1px solid #1a1a1a',overflow:'hidden',position:'relative' }}>
        <div style={{ position:'absolute',inset:0,background:'rgba(212,255,0,0.02)',pointerEvents:'none' }} />
        <div style={{ display:'flex',gap:64,width:'max-content',animation:'marquee 30s linear infinite' }}>
          {['CREATE','SELL','OPERATE','AND SCALE','EVENTS','·','CHECK-IN','TICKETS','STAFF','PDV','ANALYTICS','GROWTH','·','CREATE','SELL','OPERATE','AND SCALE','EVENTS','·','CHECK-IN','TICKETS','STAFF','PDV','ANALYTICS','GROWTH','·'].map((item,i)=>(
            <span key={i} style={{ fontSize:12,fontFamily:'Bebas Neue,sans-serif',letterSpacing:'0.3em',color:item==='·'?'#d4ff00':'#4b4b4b',whiteSpace:'nowrap' }}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── NUMBERS ── */}
      <section id="numbers" style={{ padding:'120px 64px' }}>
        <div style={{ maxWidth:960,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:32 }}>
          {([{value:500,suffix:'+'},{value:2000000,suffix:'+'},{value:99,suffix:'.9%'},{value:3,suffix:'x'}] as const).map((s,i)=>(
            <StatItem key={i} value={s.value} suffix={s.suffix} label={(t.stat_labels as string[])[i]} index={i} />
          ))}
        </div>
      </section>

      {/* ── STATEMENT ── */}
      <section style={{ padding:'80px 64px',borderTop:'1px solid #1a1a1a',borderBottom:'1px solid #1a1a1a' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <RevealText>
            <StatementText lang={lang} isRtl={isRtl} t={t} />
            <div style={{ marginTop:32,display:'flex',alignItems:'center',gap:16,flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <div style={{ width:40,height:1,background:'#d4ff00' }} />
              <span style={{ fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#6b6b6b' }}>ANIMALZ EVENTS — PART OF ANIMALZ GROUP</span>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'120px 64px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <RevealText>
            <div style={{ fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.3em',color:'#d4ff00',marginBottom:16 }}>{t.sect_what}</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(40px,6vw,80px)',letterSpacing:'-0.02em',lineHeight:1,marginBottom:64 }}>
              {(t.sect_title as string).split('\n')[0]}<br/>{(t.sect_title as string).split('\n')[1]}<span style={{ color:'#d4ff00' }}>.</span>
            </h2>
          </RevealText>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16 }}>
            {ICONS.map((Icon,i)=>(
              <FeatureItem key={i} Icon={Icon} tag={FEAT[i]} title={FEAT_TITLE[i]} desc={FEAT_DESC[i]} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ padding:'120px 64px' }}>
        <div style={{ maxWidth:800,margin:'0 auto' }}>
          <RevealText>
            <div style={{ fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.3em',color:'#d4ff00',marginBottom:16 }}>{t.why}</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(40px,6vw,80px)',letterSpacing:'-0.02em',lineHeight:1,marginBottom:64 }}>
              {(t.not_just as string).split('\n')[0]}<br/>{(t.not_just as string).split('\n')[1]}<span style={{ color:'#d4ff00' }}>.</span>
            </h2>
          </RevealText>
          <RevealText delay={100}>
            <div style={{ border:'1px solid #1a1a1a',borderRadius:4,overflow:'hidden' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:'1px solid #1a1a1a' }}>
                <div style={{ padding:'14px 24px',fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#6b6b6b' }}>{t.comparison_feat}</div>
                <div style={{ padding:'14px 24px',fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#6b6b6b',textAlign:'center',borderLeft:'1px solid #1a1a1a' }}>{t.comparison_them}</div>
                <div style={{ padding:'14px 24px',fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.2em',color:'#d4ff00',textAlign:'center' }}>{t.comparison_us}</div>
              </div>
              {[true,true,false,false,false,false,false,false,false,false].map((them,i)=>(
                <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:i<9?'1px solid #1a1a1a':'none' }}>
                  <div style={{ padding:'13px 24px',fontSize:13,color:'#9a9a9a' }}>{COMPARISON_ROWS[i]}</div>
                  <div style={{ padding:'13px 24px',textAlign:'center',borderLeft:'1px solid #1a1a1a',color:them?'#6b6b6b':'#252525',fontSize:16 }}>{them?'✓':'✗'}</div>
                  <div style={{ padding:'13px 24px',textAlign:'center',color:'#d4ff00',fontSize:16 }}>✓</div>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding:'160px 64px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(212,255,0,0.05) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(#d4ff00 1px,transparent 1px),linear-gradient(90deg,#d4ff00 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:10,maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <RevealText>
            <div style={{ fontSize:10,fontFamily:'DM Mono,monospace',letterSpacing:'0.3em',color:'#d4ff00',marginBottom:24 }}>ANIMALZ GROUP</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(48px,8vw,112px)',letterSpacing:'-0.02em',lineHeight:0.95,marginBottom:0,whiteSpace:'pre-line' }}>
              {(t.ready as string).split('\n')[0]}<br/>
              {(t.ready as string).split('\n')[1].replace('?','')}
              <span style={{ color:'#d4ff00' }}>?</span>
            </h2>
            <p style={{ color:'#9a9a9a',margin:'32px auto 48px',fontSize:15,lineHeight:1.7,maxWidth:460 }}>{t.ready_sub}</p>
            <button onClick={onLogin} data-hover
              style={{ display:'inline-flex',alignItems:'center',gap:12,background:'#d4ff00',color:'#080808',padding:'20px 56px',borderRadius:2,border:'none',fontSize:14,fontWeight:700,letterSpacing:'0.15em',cursor:'none',transition:'box-shadow 0.3s,transform 0.15s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='0 0 70px rgba(212,255,0,0.6)';(e.currentTarget as HTMLElement).style.transform='scale(1.05)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.transform='scale(1)' }}>
              {t.cta2} <ArrowRight size={18} />
            </button>
          </RevealText>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid #1a1a1a',padding:'48px 64px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:24,flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:24,height:24,background:'#d4ff00',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ fontFamily:'Bebas Neue,sans-serif',color:'#080808',fontSize:12 }}>A</span>
            </div>
            <span style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:16,letterSpacing:3 }}>
              ANIMALZ<span style={{ color:'#d4ff00' }}>.</span>EVENTS
            </span>
          </div>
          <div style={{ fontSize:11,fontFamily:'DM Mono,monospace',color:'#6b6b6b' }}>{t.footer_rights}</div>
          <div style={{ display:'flex',gap:28 }}>
            {['TERMS','PRIVACY','CONTACT'].map(l=>(
              <a key={l} href="#" data-hover style={{ fontSize:11,fontFamily:'DM Mono,monospace',color:'#6b6b6b',textDecoration:'none',cursor:'none',letterSpacing:'0.15em',transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#d4ff00'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#6b6b6b'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}