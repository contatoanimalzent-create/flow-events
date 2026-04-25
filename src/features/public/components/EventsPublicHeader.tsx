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
  const [languageOpen, setLanguageOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
    const onScroll = () => setIsScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = useMemo(
    () => [
      { label: isPortuguese ? 'Inicio' : 'Home', href: '/' },
      { label: isPortuguese ? 'Eventos' : 'Events', href: '/events' },
      { label: isPortuguese ? 'Produtor' : 'Producer', href: '/producer' },
    ],
    [isPortuguese],
  )

  const featuredEvents = useMemo(() => (publicEventsQuery.data ?? []).slice(0, 3), [publicEventsQuery.data])

  function isActive(href: string) {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  function languageOption(option: PublicLocale, label: string) {
    const selected = locale === option
    return (
      <button
        type="button"
        onClick={() => {
          setLocale(option)
          setLanguageOpen(false)
        }}
        className={cn(
          'w-full rounded-xl px-3 py-2 text-left text-sm transition-colors',
          selected ? 'bg-[rgba(0,87,231,0.14)] text-[#4285F4]' : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
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
          'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500',
          isScrolled
            ? 'border-white/8 bg-[rgba(8,8,8,0.94)] backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'border-transparent bg-transparent',
          className,
        )}
      >
        <div className="relative mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-6 py-3 md:px-8 lg:px-10 xl:px-14">
          <a href="/" className="group relative z-10 inline-flex min-w-0 shrink-0 items-center" aria-label="Pulse">
            <span className="pointer-events-none absolute -left-8 top-1/2 hidden h-24 w-44 -translate-y-1/2 rounded-full bg-[#0057E7]/12 blur-3xl transition-opacity duration-500 group-hover:opacity-90 md:block" />
            <img
              src="/logo.png"
              alt="Pulse"
              className={cn(
                'relative z-10 w-auto max-w-[138px] object-contain transition-all duration-500 group-hover:scale-[1.035] md:max-w-[160px]',
                compact ? 'h-10 md:h-11 xl:h-12' : 'h-11 md:h-12 xl:h-14',
                /* sempre branca, header agora é sempre dark */
                'brightness-0 invert drop-shadow-[0_0_22px_rgba(255,255,255,0.2)]',
              )}
            />
          </a>

          <nav className="absolute left-1/2 top-1/2 hidden max-w-[min(44vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.045] p-1 shadow-[0_18px_55px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                  isActive(link.href)
                    ? 'bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-white/66 hover:bg-white/[0.07] hover:text-white',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-2">
            {actionSlot ? <div className="hidden xl:flex">{actionSlot}</div> : null}

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageOpen((current) => !current)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-all',
                  'border-white/10 bg-white/[0.04] text-white/64 hover:border-white/20 hover:text-white',
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === 'en-US' ? 'EN' : 'BR'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {languageOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.65rem)] w-36 rounded-2xl border border-white/10 bg-[#111111] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                  {languageOption('en-US', 'English')}
                  {languageOption('pt-BR', 'Portugues')}
                </div>
              ) : null}
            </div>

            {user ? (
              <a
                href="/me"
                className={cn(
                  'hidden items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-all sm:inline-flex',
                  'border-white/10 bg-white/[0.04] text-white/68 hover:border-white/20 hover:text-white',
                )}
              >
                <UserRound className="h-3.5 w-3.5" />
                {isPortuguese ? 'Conta' : 'Account'}
              </a>
            ) : onLogin ? (
              <button
                type="button"
                onClick={onLogin}
                className="hidden rounded-full bg-[#0057E7] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#4285F4] sm:inline-flex"
              >
                {isPortuguese ? 'Entrar' : 'Sign in'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/72 transition-all hover:border-white/20 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(5,5,5,0.98)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,87,231,0.18),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(10,26,255,0.10),transparent_18%)]" />
          <div className="relative z-10 min-h-screen px-5 py-5 md:px-8 lg:px-10">
            <div className="mx-auto max-w-[1540px]">
              <div className="flex items-center justify-between gap-6">
                <a href="/" className="inline-flex items-center">
                  {/* mobile menu sempre escuro → logo branca */}
                  <img src="/logo.png" alt="Pulse" className="h-11 w-auto brightness-0 invert" />
                </a>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/72 transition-all hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-12 grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                    {isPortuguese ? 'Navegação' : 'Navigation'}
                  </div>
                  <nav className="mt-8 grid gap-2">
                    {navLinks.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center justify-between gap-6 rounded-2xl px-4 py-5 transition-all duration-300 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-white/30">0{index + 1}</span>
                          <span className="text-[clamp(2.2rem,4vw,4rem)] font-bold uppercase leading-none tracking-[-0.04em] text-white">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/38 transition-all group-hover:translate-x-1 group-hover:text-white" />
                      </a>
                    ))}
                  </nav>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                    {isPortuguese ? 'Eventos ativos' : 'Active events'}
                  </div>
                  <div className="mt-6 grid gap-3">
                    {featuredEvents.map((event, index) => (
                      <a
                        key={event.id}
                        href={`/e/${event.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 transition-all duration-300 hover:border-white/14 hover:bg-white/[0.06]"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/22 font-mono text-sm text-[#4285F4]">
                          0{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-white">{event.name}</div>
                          <div className="mt-1 text-xs text-white/42">
                            {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/34 transition-all group-hover:translate-x-1 group-hover:text-white" />
                      </a>
                    ))}
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
