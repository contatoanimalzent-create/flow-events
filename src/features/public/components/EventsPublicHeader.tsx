import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Globe, Menu, UserRound, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { usePublicLocale, type PublicLocale } from '../lib/public-locale'

interface EventsPublicHeaderProps {
  onLogin?: () => void
  actionSlot?: ReactNode
  compact?: boolean
  className?: string
}

export function EventsPublicHeader({
  onLogin,
  actionSlot,
  compact = false,
  className,
}: EventsPublicHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const { locale, setLocale, isPortuguese } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
    const handleScroll = () => setIsScrolled(window.scrollY > 18)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = useMemo(
    () => [
      { label: isPortuguese ? 'Inicio' : 'Home', href: '/' },
      { label: isPortuguese ? 'Eventos' : 'Events', href: '/events' },
      { label: isPortuguese ? 'Sobre' : 'About', href: '/about' },
      { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
    ],
    [isPortuguese],
  )

  const chapterEvents = useMemo(() => (publicEventsQuery.data ?? []).slice(0, 4), [publicEventsQuery.data])

  function isActive(href: string) {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  function renderLanguageOption(option: PublicLocale, label: string) {
    const selected = locale === option
    return (
      <button
        type="button"
        onClick={() => { setLocale(option); setLanguageMenuOpen(false) }}
        className={cn(
          'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
          selected
            ? 'bg-brand-navy text-white'
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.06)] backdrop-blur-xl'
            : 'bg-white/80 backdrop-blur-md',
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 md:px-8 lg:px-10">
          {/* Logo */}
          <a href="/" className="group inline-flex items-center gap-3" aria-label="Animalz Events">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className={cn(
                'w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]',
                compact ? 'h-8 md:h-9' : 'h-9 md:h-10',
              )}
            />
            <span className="hidden text-sm font-bold uppercase tracking-[0.15em] text-brand-navy sm:block">
              Animalz<span className="text-brand-acid">.</span>events
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300',
                  isActive(link.href)
                    ? 'bg-brand-navy text-white'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {actionSlot ? <div className="hidden xl:flex">{actionSlot}</div> : null}

            {/* Language picker */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((c) => !c)}
                className="inline-flex items-center gap-1.5 rounded-full border border-bg-border px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-brand-navy/30 hover:text-text-primary"
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === 'en-US' ? 'EN' : 'BR'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {languageMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-36 rounded-2xl border border-bg-border bg-white p-2 shadow-card-deep">
                  {renderLanguageOption('en-US', 'English')}
                  {renderLanguageOption('pt-BR', 'Portugues')}
                </div>
              ) : null}
            </div>

            {/* Auth button */}
            {user ? (
              <a
                href="/me"
                className="inline-flex items-center gap-2 rounded-full border border-bg-border px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:border-brand-navy/30 hover:text-text-primary"
              >
                <UserRound className="h-3.5 w-3.5" />
                {isPortuguese ? 'Conta' : 'Account'}
              </a>
            ) : onLogin ? (
              <button
                type="button"
                onClick={onLogin}
                className="hidden rounded-full bg-brand-navy px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-ink-800 hover:shadow-glow-navy sm:inline-flex"
              >
                {isPortuguese ? 'Entrar' : 'Sign in'}
              </button>
            ) : null}

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bg-border text-text-secondary transition-all hover:border-brand-navy/30 hover:text-brand-navy"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MENU — white */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-white">
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(13,27,53,0.25) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Navy accent orb */}
          <div className="pointer-events-none absolute right-[-6rem] top-[-8rem] h-[32rem] w-[32rem] rounded-full bg-brand-navy/[0.06] blur-[100px]" />

          <div className="relative z-10 min-h-screen px-5 py-5 md:px-8 lg:px-10">
            <div className="mx-auto max-w-[1440px]">
              {/* Header row */}
              <div className="flex items-center justify-between gap-6">
                <a href="/" className="inline-flex items-center gap-3">
                  <img src="/logo.png" alt="Animalz Events" className="h-9 w-auto" />
                  <span className="text-sm font-bold uppercase tracking-[0.15em] text-brand-navy">
                    Animalz<span className="text-brand-acid">.</span>events
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bg-border text-text-secondary transition-all hover:border-brand-navy/30 hover:text-brand-navy"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Two-column layout */}
              <div className="mt-12 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Left: nav links */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-text-muted">
                    {isPortuguese ? 'Navegacao' : 'Navigation'}
                  </div>
                  <nav className="mt-8 grid gap-2">
                    {navLinks.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'group flex items-center justify-between gap-6 rounded-2xl px-4 py-5 transition-all duration-300 hover:bg-bg-secondary',
                          isActive(link.href) ? 'text-brand-navy' : 'text-text-muted hover:text-text-primary',
                        )}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
                          <span className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold uppercase leading-none tracking-tight">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </a>
                    ))}
                  </nav>

                  <div className="mt-10 flex flex-wrap gap-3">
                    {user ? (
                      <a
                        href="/me"
                        className="inline-flex items-center gap-2 rounded-full border border-bg-border px-5 py-3 text-sm text-text-secondary hover:text-text-primary"
                      >
                        <UserRound className="h-4 w-4" />
                        {isPortuguese ? 'Minha conta' : 'My account'}
                      </a>
                    ) : onLogin ? (
                      <button
                        type="button"
                        onClick={() => { onLogin(); setMenuOpen(false) }}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-ink-800"
                      >
                        {isPortuguese ? 'Entrar' : 'Sign in'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Right: featured events + language */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-text-muted">
                    {isPortuguese ? 'Eventos em destaque' : 'Featured events'}
                  </div>
                  <div className="mt-6 grid gap-3">
                    {chapterEvents.length === 0 ? (
                      <div className="rounded-2xl border border-bg-border bg-bg-secondary p-6 text-center">
                        <p className="text-sm text-text-muted">
                          {isPortuguese ? 'Em breve' : 'Coming soon'}
                        </p>
                      </div>
                    ) : (
                      chapterEvents.map((event, index) => (
                        <a
                          key={event.id}
                          href={`/e/${event.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-4 rounded-2xl border border-bg-border bg-white p-4 shadow-card transition-all hover:border-brand-navy/20 hover:shadow-card-hover"
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 font-mono text-sm font-bold text-brand-navy">
                            0{index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-text-primary">{event.name}</div>
                            <div className="mt-1 text-xs text-text-muted">
                              {[event.venue_name, event.city].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          <ArrowRight className="ml-auto h-4 w-4 flex-shrink-0 text-text-muted transition-all group-hover:translate-x-1 group-hover:text-brand-acid" />
                        </a>
                      ))
                    )}
                  </div>

                  <div className="mt-8 rounded-2xl border border-bg-border bg-bg-secondary p-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
                      {isPortuguese ? 'Idioma' : 'Language'}
                    </div>
                    <div className="mt-3 grid gap-2">
                      {renderLanguageOption('en-US', 'English')}
                      {renderLanguageOption('pt-BR', 'Portugues')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
