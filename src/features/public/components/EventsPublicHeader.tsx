import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Globe, Headphones, Menu, UserRound, X } from 'lucide-react'
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

function AnimalzMonogram() {
  return (
    <a href="/" className="group inline-flex items-start gap-3 no-underline text-white">
      <div className="relative flex flex-col leading-none">
        <span className="font-display text-[2.45rem] font-semibold uppercase tracking-[-0.08em]">A</span>
        <span className="-mt-2.5 ml-6 font-display text-[2.95rem] font-semibold uppercase tracking-[-0.1em]">E</span>
        <span className="absolute bottom-[0.55rem] left-0 h-[2px] w-[4.4rem] bg-white/90 transition-all duration-300 group-hover:w-[5rem]" />
      </div>
      <div className="hidden pt-1 md:block">
        <div className="text-[10px] uppercase tracking-[0.42em] text-white/44">Animalz</div>
        <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.28em] text-white/78">Experiences</div>
      </div>
    </a>
  )
}

export function EventsPublicHeader({
  onLogin,
  actionSlot,
  compact = false,
  className,
}: EventsPublicHeaderProps) {
  const conciergeNumber = '+1 469 862 9040'
  const conciergeHref = 'tel:+14698629040'
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
      { label: isPortuguese ? 'Home' : 'Home', href: '/' },
      { label: isPortuguese ? 'Experiencias' : 'Experiences', href: '/events' },
      { label: isPortuguese ? 'Sobre' : 'About', href: '/about' },
      { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
      { label: isPortuguese ? 'Ajuda' : 'Help', href: '/help' },
    ],
    [isPortuguese],
  )

  const chapterEvents = useMemo(
    () => (publicEventsQuery.data ?? []).slice(0, 4),
    [publicEventsQuery.data],
  )

  function isActive(href: string) {
    if (href === '/') {
      return currentPath === '/'
    }

    return currentPath.startsWith(href)
  }

  function renderLanguageOption(option: PublicLocale, label: string) {
    const selected = locale === option

    return (
      <button
        type="button"
        onClick={() => {
          setLocale(option)
          setLanguageMenuOpen(false)
        }}
        className={cn(
          'w-full rounded-[1rem] px-3 py-2 text-left text-sm font-medium transition-colors',
          selected ? 'bg-white/12 text-white' : 'text-white/68 hover:bg-white/[0.06] hover:text-white',
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
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-[rgba(4,7,12,0.82)] backdrop-blur-xl' : 'bg-transparent',
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-5 px-4 py-4 md:px-8 lg:px-12">
          <AnimalzMonogram />

          <div className="flex items-center gap-3">
            {actionSlot ? <div className="hidden items-center gap-3 xl:flex">{actionSlot}</div> : null}

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82 transition-all duration-300 hover:border-white/22 hover:bg-white/[0.08]"
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === 'en-US' ? 'EN' : 'PT-BR'}
              </button>

              {languageMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] w-36 rounded-[1.25rem] border border-white/10 bg-[rgba(4,7,12,0.98)] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.36)]">
                  {renderLanguageOption('en-US', 'English')}
                  {renderLanguageOption('pt-BR', 'Portuguese')}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <span className="hidden md:inline-flex items-center gap-2">
                {isPortuguese ? 'Capitulos' : 'Chapters'}
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(3,6,11,0.98)] text-white backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '88px 88px',
            }}
          />
          <div className="relative z-10 min-h-screen px-4 py-5 md:px-8 lg:px-12">
            <div className="flex items-start justify-between gap-6">
              <AnimalzMonogram />

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-all duration-300 hover:border-white/22 hover:bg-white/[0.08]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <div className="text-[11px] uppercase tracking-[0.36em] text-white/38">
                  {isPortuguese ? 'Navegacao principal' : 'Primary navigation'}
                </div>
                <nav className="mt-8 grid gap-4">
                  {navLinks.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'group inline-flex items-end justify-between gap-6 border-b border-white/8 py-4 transition-colors duration-300',
                        isActive(link.href) ? 'text-white' : 'text-white/58 hover:text-white',
                      )}
                    >
                      <span className="font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
                        {link.label}
                      </span>
                      <span className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/34 transition-transform duration-300 group-hover:translate-x-1">
                        0{index + 1}
                      </span>
                    </a>
                  ))}
                </nav>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <a
                    href={conciergeHref}
                    className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:border-white/22 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/42">
                      <Headphones className="h-4 w-4" />
                      {isPortuguese ? 'Concierge' : 'Concierge'}
                    </div>
                    <div className="mt-4 text-lg font-medium text-white">{conciergeNumber}</div>
                    <div className="mt-2 text-sm leading-6 text-white/58">
                      {isPortuguese ? 'Suporte para acesso, hospitalidade e convites premium.' : 'Support for access, hospitality and premium invitations.'}
                    </div>
                  </a>

                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">
                      {isPortuguese ? 'Idioma' : 'Language'}
                    </div>
                    <div className="mt-4 grid gap-2">
                      {renderLanguageOption('en-US', 'English')}
                      {renderLanguageOption('pt-BR', 'Portuguese')}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  {user ? (
                    <a
                      href="/me"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/24 hover:bg-white/[0.1]"
                    >
                      <UserRound className="h-4 w-4" />
                      {isPortuguese ? 'Minha conta' : 'My account'}
                    </a>
                  ) : onLogin ? (
                    <button
                      type="button"
                      onClick={() => {
                        onLogin()
                        setMenuOpen(false)
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#0b1016] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {isPortuguese ? 'Entrar' : 'Sign in'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.36em] text-white/38">
                    {isPortuguese ? 'Capitulos em destaque' : 'Featured chapters'}
                  </div>
                  <a
                    href="/events"
                    onClick={() => setMenuOpen(false)}
                    className="text-[11px] uppercase tracking-[0.28em] text-white/54 transition-colors hover:text-white"
                  >
                    {isPortuguese ? 'Ver tudo' : 'View all'}
                  </a>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {chapterEvents.map((event, index) => (
                    <a
                      key={event.id}
                      href={`/e/${event.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'group relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.06]',
                        index === 0 ? 'md:col-span-2 min-h-[25rem]' : 'min-h-[20rem]',
                      )}
                    >
                      <div className="absolute inset-0">
                        <img
                          src={event.mediaPresentation.coverAsset?.secure_url || event.cover_url || ''}
                          alt={event.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.08)_0%,rgba(4,7,12,0.18)_24%,rgba(4,7,12,0.86)_100%)]" />
                      </div>
                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/82">
                            {event.category || (isPortuguese ? 'Evento' : 'Event')}
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.32em] text-white/38">0{index + 1}</div>
                        </div>
                        <div>
                          <div className={cn('font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white', index === 0 ? 'text-[3.6rem]' : 'text-[2.4rem]')}>
                            {event.name}
                          </div>
                          <div className="mt-3 text-sm leading-7 text-white/70">
                            {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
