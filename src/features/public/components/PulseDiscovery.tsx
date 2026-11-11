import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, CalendarDays, Check, Compass, Heart, MapPin, Menu, Search, SlidersHorizontal, Users, X } from 'lucide-react'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { usePublicLocale } from '../lib/public-locale'
import { useAuthStore } from '@/lib/store/auth'
import { useSeoMeta } from '@/shared/lib'
import { TRACK_RECORD_AS_OF, TRACK_RECORD_TOTALS } from '@/shared/lib/public-track-record'
import type { PublicEventSummary } from '../types/public.types'
import { selectDiscoveryEvents, isPastEvent } from '../lib/discovery-filters'
import './pulse-discovery.css'

gsap.registerPlugin(ScrollTrigger)
const SAVED_KEY = 'pulse-saved-events-v1'
const officialMedia: Record<string, string> = {
  'capital-strike-nos-confins-da-terra': 'https://www.capitalstrike.com.br/assets/confins/terra-arrasada-1200.webp',
  'bsb-fight-5': 'https://nrjizzfkhficvhiiqvtl.supabase.co/storage/v1/object/public/event-assets/bsb-fight-5/background-octagon.png',
}
function Brand({ symbol = false }: { symbol?: boolean }) {
  return <span className={symbol ? 'pd-brand-symbol' : 'pd-brand-crop'}><img src="/logo.png" alt={symbol ? '' : 'Pulse'} decoding="async" /></span>
}

function eventImage(event: PublicEventSummary) {
  return officialMedia[event.slug] || event.mediaPresentation.coverAsset?.secure_url || event.cover_url || ''
}
function EventImage({ event, priority = false }: { event: PublicEventSummary; priority?: boolean }) {
  const [failed, setFailed] = useState(false)
  const src = eventImage(event)
  if (!src || failed) return <div className="pd-art" aria-label={event.name}><span>{event.name.split(' ').slice(0, 2).join(' ')}</span><small>{event.city || 'Pulse'}</small></div>
  return <img src={src} alt={event.name} loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
}
function dateText(event: PublicEventSummary, locale: string, long = false) {
  const date = new Date(event.starts_at)
  return Number.isNaN(date.getTime()) ? (locale === 'pt-BR' ? 'Data a confirmar' : 'Date to be confirmed') : new Intl.DateTimeFormat(locale, { day: '2-digit', month: long ? 'long' : 'short', year: long ? 'numeric' : undefined, timeZone: 'America/Sao_Paulo' }).format(date)
}
export function PulseDiscovery({ onLogin, catalog = false }: { onLogin?: () => void; catalog?: boolean }) {
  const { isPortuguese: pt, locale, toggleLocale } = usePublicLocale()
  const user = useAuthStore(s => s.user)
  const query = usePublicEvents()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [period, setPeriod] = useState<'upcoming' | 'past' | 'all'>('all')
  const [city, setCity] = useState('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [menu, setMenu] = useState(false)
  const [filters, setFilters] = useState(false)
  const [notice, setNotice] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const events = (query.data ?? []).filter(e => !e.is_private)
  const now = Date.now()
  const categories = [...new Set(events.map(e => e.category).filter(Boolean))]
  const cities = [...new Set(events.map(e => e.city).filter(Boolean))].sort()
  const upcoming = events.filter(e => !isPastEvent(e, now)).sort((a,b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  const featured = upcoming.find(e => Boolean(eventImage(e))) ?? upcoming[0] ?? events[events.length - 1]
  const second = events.find(e => e.slug === 'bsb-fight-5') ?? events.find(e => e.id !== featured?.id)
  const filtered = selectDiscoveryEvents(events, { search, category, period, city, savedOnly, saved }, now)
  const t = (br: string, en: string) => pt ? br : en

  useSeoMeta({
    title: t(catalog ? 'Encontre seu próximo evento | Pulse' : 'Pulse — Viva o próximo encontro', catalog ? 'Find your next event | Pulse' : 'Pulse — Your next moment'),
    description: t('Descubra experiências, conheça os eventos que já fizeram parte da nossa história e conecte-se ao próximo encontro com a Pulse.', 'Discover experiences, explore our event history and find your next moment with Pulse.'),
    image: featured ? eventImage(featured) : null,
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
      if (Array.isArray(value)) setSaved(value.filter((id): id is string => typeof id === 'string'))
    } catch { /* A blocked storage does not prevent discovery. */ }
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    if (!menu) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); menuButtonRef.current?.focus() }
      if (e.key === 'Tab') {
        const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a,button') ?? [])
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey) }
  }, [menu])
  useEffect(() => {
    if (reduce || catalog || !heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.to('[data-photo-layer]', { y: -55, rotation: -3, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: .8 } })
      gsap.to('[data-ticket-layer]', { y: -95, rotation: 7, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: .8 } })
    }, heroRef)
    return () => ctx.revert()
  }, [reduce, catalog, featured?.id])
  function save(id: string) {
    const next = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]
    setSaved(next)
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); setNotice(t(next.includes(id) ? 'Evento salvo neste aparelho.' : 'Evento removido dos salvos.', next.includes(id) ? 'Saved on this device.' : 'Removed from saved events.')) }
    catch { setNotice(t('Salvo nesta sessão. O navegador não permitiu guardar no aparelho.', 'Saved for this session. Device storage is unavailable.')) }
  }
  function reset() { setSearch(''); setCategory('all'); setCity('all'); setPeriod('all'); setSavedOnly(false) }
  function explore() { document.getElementById('explorar')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }) }

  return <div className="pd">
    <a className="pd-skip" href="#pd-main">{t('Pular para o conteúdo', 'Skip to content')}</a>
    <header className="pd-header">
      <a className="pd-logo" href="/" aria-label="Pulse, início"><Brand/></a>
      <nav className="pd-nav" aria-label={t('Navegação principal', 'Main navigation')}>
        <a className={!catalog ? 'active' : ''} href="/">{t('Descobrir', 'Discover')}</a>
        <a className={catalog ? 'active' : ''} href="/events">{t('Eventos', 'Events')}</a>
        <a href="/cases">{t('Nossa história', 'Our story')}</a>
      </nav>
      <div className="pd-header-actions">
        <button className="pd-language" onClick={toggleLocale} aria-label={t('Switch to English', 'Mudar para português')}>{pt ? 'PT' : 'EN'}</button>
        <a className="pd-producer-link" href="/producer">{t('Sou produtor', 'For producers')} ↗</a>
        {user ? <a className="pd-button pd-small" href="/me">{t('Minha conta', 'My account')}</a> : <button className="pd-button pd-small" onClick={onLogin}>{t('Entrar', 'Sign in')} <ArrowRight size={16}/></button>}
        <button ref={menuButtonRef} className="pd-icon-button pd-mobile-menu" aria-label={t('Abrir menu', 'Open menu')} aria-expanded={menu} onClick={() => setMenu(true)}><Menu size={22}/></button>
      </div>
    </header>
    <AnimatePresence>
      {menu && <motion.div ref={menuRef} className="pd-menu" role="dialog" aria-modal="true" aria-label={t('Menu', 'Menu')} initial={{ opacity: 0, y: reduce ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -6 }}>
        <a href="/" className="pd-logo"><Brand/></a>
        <button className="pd-menu-close pd-icon-button" onClick={() => {setMenu(false); menuButtonRef.current?.focus()}} aria-label={t('Fechar menu', 'Close menu')}><X/></button>
        <a href="/events">{t('Explorar eventos', 'Explore events')} <ArrowRight/></a>
        <a href="/cases">{t('Nossa história', 'Our story')} <ArrowRight/></a>
        <a href="/producer">{t('Sou produtor', 'For producers')} <ArrowRight/></a>
        <a href="/ajuda">{t('Preciso de ajuda', 'Help')} <ArrowRight/></a>
        <button onClick={() => {setMenu(false); onLogin?.()}} className="pd-button">{t('Entrar na Pulse', 'Sign in to Pulse')}</button>
      </motion.div>}
    </AnimatePresence>
    <main id="pd-main">
      {!catalog && <section className="pd-hero" ref={heroRef}>
        <div className="pd-hero-copy">
          <span className="pd-eyebrow"><span className="pd-brand-small" aria-hidden="true"><Brand symbol/></span>{t('A vida acontece no encontro', 'Life happens together')}</span>
          <h1>{t('Tem momentos', 'Some moments')}<br/>{t('que só', 'you just')} <em>{t('vivendo.', 'have to live.')}</em></h1>
          <p>{t('Um novo lugar. Gente que conecta. Uma história para chamar de sua. Encontre seu próximo evento com a Pulse.', 'A new place. People who connect. A story to call your own. Find your next event with Pulse.')}</p>
          <button className="pd-button pd-hero-button" onClick={explore}>{t('Encontrar meu próximo evento', 'Find my next event')} <ArrowRight size={20}/></button>
          <div className="pd-hero-foot"><div className="pd-event-marks"><span>BSB</span><span>CS</span><span>PT</span></div><span>{t('Encontros reais.', 'Real moments.')}<strong>{t(' Histórias que já começaram.', ' Stories already in motion.')}</strong></span></div>
        </div>
        <div className="pd-hero-stage" aria-label={t('Eventos que fazem parte da Pulse', 'Events in the Pulse story')}>
          <div className="pd-orbit pd-orbit-one"/><div className="pd-orbit pd-orbit-two"/>
          <span className="pd-stage-emblem" aria-hidden="true"><Brand symbol/></span>
          {featured ? <a className="pd-main-photo" data-photo-layer href={'/e/'+featured.slug}>
            <EventImage event={featured} priority/>
            <span className="pd-photo-scrim"/>
            <span className="pd-photo-top"><span>{t('Próximo encontro', 'Next up')}</span><span className="pd-photo-arrow"><ArrowRight size={20}/></span></span>
            <span className="pd-photo-bottom"><small><MapPin size={13}/>{featured.city || featured.venue_name}</small><strong>{featured.name}</strong><span>{dateText(featured,locale,true)}</span></span>
          </a> : <div className="pd-hero-skeleton" aria-label={t('Carregando destaque', 'Loading featured event')}/>}
          {second && <a className="pd-memory-ticket" data-ticket-layer href={'/e/'+second.slug}>
            <div className="pd-ticket-image"><EventImage event={second}/></div>
            <span className="pd-ticket-copy"><small>{t('Já fez história', 'Part of our story')}</small><strong>{second.name}</strong><span><MapPin size={12}/> {second.city || 'Pulse'}</span></span>
            <span className="pd-ticket-perforation"/><span className="pd-ticket-stub">PULSE<br/><Brand symbol/></span>
          </a>}
          <div className="pd-stage-sticker"><span>✦</span>{t('Sai da rotina.', 'Go beyond routine.')}<br/><strong>{t('Entra na história.', 'Make a memory.')}</strong></div>
          <span className="pd-stage-caption">{t('Pessoas, lugares e boas histórias.', 'People, places and good stories.')}</span>
        </div>
        <button className="pd-scroll-cue" onClick={explore} aria-label={t('Ver eventos', 'See events')}><ArrowDown size={17}/></button>
      </section>}

      <section className="pd-explore" id="explorar">
        <div className="pd-section-heading"><div><span className="pd-eyebrow">{t('Escolha sua próxima história', 'Pick your next story')}</span><h2>{catalog ? t('Qual vai ser o próximo?', 'What’s your next moment?') : t('Encontros com a sua vibe.', 'Find your kind of moment.')}</h2></div><span className="pd-count">{query.isPending ? '—' : filtered.length} {t('eventos', 'events')}</span></div>
        <div className="pd-search-row">
          <label className="pd-search"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Evento, lugar ou algo que você ama...', 'An event, a place, something you love...')} aria-label={t('Buscar eventos', 'Search events')}/>{search && <button onClick={()=>setSearch('')} aria-label={t('Limpar busca', 'Clear search')}><X size={16}/></button>}</label>
          <button className={'pd-filter-button '+(filters?'selected':'')} onClick={()=>setFilters(v=>!v)} aria-expanded={filters} aria-controls="pd-filter-panel"><SlidersHorizontal size={18}/>{t('Filtros', 'Filters')}{city!=='all' && <span className="pd-filter-dot"/>}</button>
          <button className={'pd-filter-button pd-saved-button '+(savedOnly?'selected':'')} aria-pressed={savedOnly} onClick={()=>setSavedOnly(v=>!v)}><Heart size={18} fill={savedOnly?'currentColor':'none'}/>{t('Salvos', 'Saved')}<span>{saved.length}</span></button>
        </div>
        <AnimatePresence initial={false}>{filters && <motion.div id="pd-filter-panel" className="pd-filter-panel" initial={{opacity:0,y:reduce?0:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduce?0:-4}}><label>{t('Cidade', 'City')}<select value={city} onChange={e=>setCity(e.target.value)}><option value="all">{t('Todas as cidades', 'All cities')}</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select></label><button onClick={reset}>{t('Limpar todos os filtros', 'Clear all filters')}</button></motion.div>}</AnimatePresence>
        <div className="pd-discovery-toolbar">
          <div className="pd-periods" aria-label={t('Período dos eventos', 'Event period')}>{(['upcoming','past','all'] as const).map(p=><button key={p} aria-pressed={period===p} className={period===p?'active':''} onClick={()=>setPeriod(p)}>{p==='upcoming'?t('Próximos','Upcoming'):p==='past'?t('Já aconteceram','Past events'):t('Todos','All events')}</button>)}</div>
          <div className="pd-categories"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')} aria-pressed={category==='all'}><Compass size={16}/>{t('Tudo para descobrir', 'Discover everything')}</button>{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)} aria-pressed={category===c}>{c}</button>)}</div>
        </div>
        {query.isPending ? <div className="pd-event-grid" aria-busy="true" aria-label={t('Carregando eventos', 'Loading events')}>{[0,1,2].map(n=><div key={n} className="pd-skeleton-card"><div/><span/><span/></div>)}</div>
          : query.isError ? <div className="pd-empty" role="alert"><span>↻</span><h3>{t('Não conseguimos carregar os eventos.', 'We couldn’t load the events.')}</h3><p>{t('Confira sua conexão e tente novamente.', 'Check your connection and try again.')}</p><button className="pd-button" onClick={()=>void query.refetch()} disabled={query.isFetching}>{query.isFetching?t('Tentando...','Retrying...'):t('Tentar novamente','Try again')}</button></div>
          : filtered.length===0 ? <div className="pd-empty"><Search size={30}/><h3>{t('Ainda não encontramos esse encontro.', 'No matching moments yet.')}</h3><p>{savedOnly?t('Seus favoritos ficam salvos neste aparelho. Toque no coração de um evento para começar.','Save events on this device using the heart button.'):t('Experimente outro termo, categoria ou período.','Try another search, category or period.')}</p><button className="pd-button" onClick={reset}>{t('Ver todos os eventos', 'See all events')}</button></div>
          : <motion.div layout={!reduce} className="pd-event-grid"><AnimatePresence mode="popLayout" initial={false}>{filtered.map(event=><motion.article layout={!reduce} key={event.id} className="pd-event-card" initial={{opacity:0,y:reduce?0:12}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:reduce?1:.98}} transition={{duration:reduce?0:.18}}>
            <div className="pd-card-visual"><a href={'/e/'+event.slug} tabIndex={-1} aria-hidden="true"><EventImage event={event}/></a><span className={'pd-event-tag '+(isPastEvent(event,now)?'past':'')}>{isPastEvent(event,now)?t('Já aconteceu','Past event'):t('Vem aí','Coming up')}</span><button className={'pd-save '+(saved.includes(event.id)?'saved':'')} onClick={()=>save(event.id)} aria-label={t((saved.includes(event.id)?'Remover dos salvos: ':'Salvar evento: ')+event.name,(saved.includes(event.id)?'Unsave: ':'Save event: ')+event.name)} aria-pressed={saved.includes(event.id)}><Heart size={19} fill={saved.includes(event.id)?'currentColor':'none'}/></button><span className="pd-card-date"><strong>{new Intl.DateTimeFormat(locale,{day:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(event.starts_at))}</strong><small>{new Intl.DateTimeFormat(locale,{month:'short',timeZone:'America/Sao_Paulo'}).format(new Date(event.starts_at))}</small></span></div>
            <div className="pd-card-body"><span className="pd-card-category">{event.category || t('Experiência','Experience')}</span><h3><a href={'/e/'+event.slug}>{event.name}</a></h3><p><MapPin size={14}/>{[event.venue_name,event.city].filter(Boolean).join(' · ') || t('Local a confirmar','Venue to be confirmed')}</p><div className="pd-card-bottom"><span><CalendarDays size={14}/>{dateText(event,locale,true)}</span><a href={'/e/'+event.slug} aria-label={t('Conhecer ','Explore ')+event.name}><ArrowRight size={19}/></a></div></div>
          </motion.article>)}</AnimatePresence></motion.div>}
        <p className="pd-live-region" role="status" aria-live="polite">{!query.isPending && !query.isError ? t(filtered.length+' eventos encontrados.',filtered.length+' events found.') : ''}</p>
      </section>
      <section className="pd-proof"><div className="pd-proof-intro"><span className="pd-mini-star">✳</span><div><h2>{t('A nossa história é de verdade.', 'Our story is real.')}</h2><p>{t('Encontros que já aconteceram. Registros que fazem parte da Pulse.', 'Real events. Real records in the Pulse story.')}</p><a href="/cases">{t('Conheça nossa trajetória', 'Explore our story')} <ArrowRight size={16}/></a></div></div><div className="pd-proof-numbers"><div><strong>{TRACK_RECORD_TOTALS.events}</strong><span>{t('eventos realizados', 'past events')}</span></div><div><strong>{TRACK_RECORD_TOTALS.tickets.toLocaleString(locale)}</strong><span>{t('credenciais digitais', 'digital credentials')}</span></div><div><strong>{TRACK_RECORD_TOTALS.staff}</strong><span>{t('vínculos de equipe', 'staff assignments')}</span></div></div><small>{t('Base conferida em '+TRACK_RECORD_AS_OF+'. Credenciais não equivalem a presenças; vínculos não são pessoas únicas.','Records checked on '+TRACK_RECORD_AS_OF+'. Credentials are not attendance; assignments are not unique people.')}</small></section>
      <section className="pd-producer"><div><span className="pd-eyebrow">{t('Do outro lado do encontro?', 'Behind the next great event?')}</span><h2>{t('Você cria a experiência.', 'You create the experience.')}<br/><em>{t('A Pulse conecta a operação.', 'Pulse connects the operation.')}</em></h2><p>{t('Equipe, acesso e supervisão no mesmo lugar. Para quem faz cada detalhe acontecer.', 'Staff, access and supervision together. For the people who make every detail happen.')}</p><a href="/producer" className="pd-button">{t('Conhecer a Pulse para produtores', 'Meet Pulse for producers')} <ArrowRight size={18}/></a></div><div className="pd-operation-art" aria-hidden="true"><div className="pd-operation-brand"><Brand/></div><span className="pd-operation-path"/><span className="pd-operation-node"><Check size={25}/></span><span className="pd-operation-label">PULSE / OPERAÇÃO</span><div><Users size={30}/><strong>{t('Gente conectada.', 'People connected.')}</strong><small>{t('Do primeiro acesso ao último detalhe.', 'From the first entry to the final detail.')}</small></div></div></section>
    </main>
    <footer className="pd-footer"><div className="pd-footer-top"><a className="pd-logo" href="/"><Brand/></a><p>{t('Encontros que viram história.', 'Moments that become stories.')}</p><a href="https://wa.me/5561992946515" target="_blank" rel="noreferrer">{t('Vamos conversar', 'Let’s talk')} ↗</a></div><div className="pd-footer-bottom"><span>© {new Date().getFullYear()} Pulse · Animalz Group</span><nav aria-label={t('Links institucionais','Footer links')}><a href="/events">{t('Eventos','Events')}</a><a href="/ajuda">{t('Ajuda','Help')}</a><a href="/privacidade">{t('Privacidade','Privacy')}</a><a href="/termos">{t('Termos','Terms')}</a></nav><span>universopulse.com</span></div></footer>
    <nav className="pd-bottom-nav" aria-label={t('Atalhos mobile','Mobile navigation')}><a href="/" aria-current={!catalog?'page':undefined}><Compass size={21}/>{t('Descobrir','Discover')}</a><a href="/events" aria-current={catalog?'page':undefined}><CalendarDays size={21}/>{t('Eventos','Events')}</a><button aria-pressed={savedOnly} onClick={()=>{setSavedOnly(v=>!v); explore()}}><Heart size={21} fill={savedOnly?'currentColor':'none'}/>{t('Salvos','Saved')}</button><button onClick={() => user ? window.location.assign('/me') : onLogin?.()}><Users size={21}/>{t('Minha Pulse','My Pulse')}</button></nav>
    <AnimatePresence>{notice && <motion.div className="pd-toast" role="status" initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduce?0:4}}><Check size={16}/>{notice}</motion.div>}</AnimatePresence>
  </div>
}
