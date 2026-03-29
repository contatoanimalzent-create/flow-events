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
          selected ? 'bg-[#d4ff00] text-[#060609]' : 'text-white/60 hover:bg-white/10 hover:text-white',
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
          isScrolled ? 'bg-[#060609]/90 shadow-[0_1px_0_rgba(212,255,0,0.08)] backdrop-blur-2xl' : 'bg-transparent',
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 md:px-8 lg:px-10">
          <a href="/" className="group inline-flex items-center gap-3" aria-label="Animalz Events">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className={cn(
                'w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]',
                compact ? 'h-8 md:h-9' : 'h-9 md:h-10',
              )}
            />
            <span className="hidden text-sm font-bold uppercase tracking-[0.15em] text-white sm:block">
              Animalz<span className="text-[#d4ff00]">.</span>events
            </span>
          </a>

          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300',
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {actionSlot ? <div className="hidden xl:flex">{actionSlot}</div> : null}

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((c) => !c)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-all hover:border-white/20 hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === 'en-US' ? 'EN' : 'BR'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {languageMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-36 rounded-2xl border border-white/10 bg-[#111114] p-2 shadow-2xl">
                  {renderLanguageOption('en-US', 'English')}
                  {renderLanguageOption('pt-BR', 'Portugues')}
                </div>
              ) : null}
            </div>

            {user ? (
              <a href="/me" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:border-[#d4ff00]/30 hover:text-white">
                <UserRound className="h-3.5 w-3.5" /> {isPortuguese ? 'Conta' : 'Account'}
              </a>
            ) : onLogin ? (
              <button type="button" onClick={onLogin} className="hidden rounded-full bg-[#d4ff00] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#060609] transition-all hover:bg-[#e5ff4d] sm:inline-flex">
                {isPortuguese ? 'Entrar' : 'Sign in'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#d4ff00]/30 hover:text-[#d4ff00]"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MENU */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#060609] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,255,0,0.2) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 min-h-screen px-5 py-5 md:px-8 lg:px-10">
            <div className="mx-auto max-w-[1440px]">
              <div className="flex items-center justify-between gap-6">
                <a href="/" className="inline-flex items-center gap-3">
                  <img src="/logo.png" alt="Animalz Events" className="h-9 w-auto" />
                  <span className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                    Animalz<span className="text-[#d4ff00]">.</span>events
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#d4ff00]/40 hover:text-[#d4ff00]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-12 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#d4ff00]/60">
                    {isPortuguese ? 'Navegacao' : 'Navigation'}
                  </div>
                  <nav className="mt-8 grid gap-2">
                    {navLinks.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'group flex items-center justify-between gap-6 rounded-2xl px-4 py-5 transition-all duration-300 hover:bg-white/[0.04]',
                          isActive(link.href) ? 'text-white' : 'text-white/40 hover:text-white',
                        )}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="text-xs font-mono text-[#d4ff00]/40">0{index + 1}</span>
                          <span className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold uppercase leading-none tracking-tight">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                      </a>
                    ))}
                  </nav>

                  <div className="mt-10 flex flex-wrap gap-3">
                    {user ? (
                      <a href="/me" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm text-white/70 hover:text-white">
                        <UserRound className="h-4 w-4" /> {isPortuguese ? 'Minha conta' : 'My account'}
                      </a>
                    ) : onLogin ? (
                      <button
                        type="button"
                        onClick={() => { onLogin(); setMenuOpen(false) }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#d4ff00] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#060609] hover:bg-[#e5ff4d]"
                      >
                        {isPortuguese ? 'Entrar' : 'Sign in'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#d4ff00]/60">
                    {isPortuguese ? 'Eventos em destaque' : 'Featured events'}
                  </div>
                  <div className="mt-6 grid gap-3">
                    {chapterEvents.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
                        <p className="text-sm text-white/30">{isPortuguese ? 'Em breve' : 'Coming soon'}</p>
                      </div>
                    ) : chapterEvents.map((event, index) => (
                      <a
                        key={event.id}
                        href={`/e/${event.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-[#d4ff00]/20 hover:bg-white/[0.04]"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#d4ff00]/10 font-mono text-sm font-bold text-[#d4ff00]">
                          0{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">{event.name}</div>
                          <div className="mt-1 text-xs text-white/40">
                            {[event.venue_name, event.city].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4 flex-shrink-0 text-white/20 transition-all group-hover:text-[#d4ff00] group-hover:translate-x-1" />
                      </a>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
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
