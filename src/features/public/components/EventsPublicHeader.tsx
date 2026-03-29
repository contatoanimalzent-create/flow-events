import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Globe, Headphones, Menu, Phone, UserRound, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { usePublicLocale, type PublicLocale } from '../lib/public-locale'
import { AnimalzBrandMark } from './AnimalzBrandMark'

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
      { label: 'Home', href: '/' },
      { label: isPortuguese ? 'Experiences' : 'Experiences', href: '/events' },
      { label: isPortuguese ? 'About' : 'About', href: '/about' },
      { label: isPortuguese ? 'Create Event' : 'Create Event', href: '/create-event' },
      { label: isPortuguese ? 'Help' : 'Help', href: '/help' },
    ],
    [isPortuguese],
  )

  const chapterEvents = useMemo(() => (publicEventsQuery.data ?? []).slice(0, 4), [publicEventsQuery.data])

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
          selected ? 'bg-[#0b1016] text-white' : 'text-[#5b6168] hover:bg-black/[0.04] hover:text-[#0b1016]',
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
          isScrolled ? 'bg-[rgba(245,239,232,0.88)] shadow-[0_8px_30px_rgba(11,16,22,0.08)] backdrop-blur-xl' : 'bg-transparent',
          className,
        )}
      >
        {!compact ? (
          <div className="border-b border-[#0b1016]/8">
            <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-5 px-4 py-2 md:px-8 lg:px-12">
              <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#6d727a]">
                Curated ticketing, hospitality and live experiences
              </div>
              <a
                href={conciergeHref}
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0b1016]/72 transition-colors hover:text-[#0b1016]"
              >
                <Phone className="h-3.5 w-3.5" />
                {conciergeNumber}
              </a>
            </div>
          </div>
        ) : null}

        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-5 px-4 py-4 md:px-8 lg:px-12">
          <AnimalzBrandMark compact={compact} />

          <nav className="hidden items-center gap-8 xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[12px] font-semibold uppercase tracking-[0.24em] transition-colors',
                  isActive(link.href) ? 'text-[#0b1016]' : 'text-[#0b1016]/58 hover:text-[#0b1016]',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {actionSlot ? <div className="hidden items-center gap-3 xl:flex">{actionSlot}</div> : null}

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-[#0b1016]/10 bg-white/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0b1016] transition-all duration-300 hover:border-[#0b1016]/18 hover:bg-white"
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === 'en-US' ? 'EN' : 'PT-BR'}
              </button>

              {languageMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] w-36 rounded-[1.25rem] border border-[#0b1016]/10 bg-[#f5efe8] p-2 shadow-[0_18px_48px_rgba(11,16,22,0.14)]">
                  {renderLanguageOption('en-US', 'English')}
                  {renderLanguageOption('pt-BR', 'Portuguese')}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-3 rounded-full border border-[#0b1016]/10 bg-[#0b1016] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-[#141b23]"
            >
              <span className="hidden md:inline-flex items-center gap-2">
                {isPortuguese ? 'Chapters' : 'Chapters'}
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(245,239,232,0.98)] text-[#0b1016] backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(rgba(11,16,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,16,22,0.05) 1px, transparent 1px)',
              backgroundSize: '88px 88px',
            }}
          />

          <div className="relative z-10 min-h-screen px-4 py-5 md:px-8 lg:px-12">
            <div className="flex items-start justify-between gap-6">
              <AnimalzBrandMark />

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0b1016]/10 bg-white/40 text-[#0b1016] transition-all duration-300 hover:border-[#0b1016]/20 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <div className="text-[11px] uppercase tracking-[0.36em] text-[#6d727a]">
                  Primary navigation
                </div>
                <nav className="mt-8 grid gap-4">
                  {navLinks.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'group inline-flex items-end justify-between gap-6 border-b border-[#0b1016]/8 py-4 transition-colors duration-300',
                        isActive(link.href) ? 'text-[#0b1016]' : 'text-[#0b1016]/54 hover:text-[#0b1016]',
                      )}
                    >
                      <span className="font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
                        {link.label}
                      </span>
                      <span className="mb-2 text-[11px] uppercase tracking-[0.28em] text-[#6d727a] transition-transform duration-300 group-hover:translate-x-1">
                        0{index + 1}
                      </span>
                    </a>
                  ))}
                </nav>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <a
                    href={conciergeHref}
                    className="rounded-[1.6rem] border border-[#0b1016]/10 bg-white/50 p-5 transition-all duration-300 hover:border-[#0b1016]/18 hover:bg-white"
                  >
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#6d727a]">
                      <Headphones className="h-4 w-4" />
                      Concierge
                    </div>
                    <div className="mt-4 text-lg font-medium text-[#0b1016]">{conciergeNumber}</div>
                    <div className="mt-2 text-sm leading-6 text-[#5b6168]">
                      Support for access, hospitality and premium invitations.
                    </div>
                  </a>

                  <div className="rounded-[1.6rem] border border-[#0b1016]/10 bg-white/50 p-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-[#6d727a]">Language</div>
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
                      className="inline-flex items-center gap-2 rounded-full border border-[#0b1016]/12 bg-white/60 px-5 py-3 text-sm font-medium text-[#0b1016] transition-all duration-300 hover:border-[#0b1016]/24 hover:bg-white"
                    >
                      <UserRound className="h-4 w-4" />
                      My account
                    </a>
                  ) : onLogin ? (
                    <button
                      type="button"
                      onClick={() => {
                        onLogin()
                        setMenuOpen(false)
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0b1016] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.36em] text-[#6d727a]">
                    Featured chapters
                  </div>
                  <a
                    href="/events"
                    onClick={() => setMenuOpen(false)}
                    className="text-[11px] uppercase tracking-[0.28em] text-[#0b1016]/54 transition-colors hover:text-[#0b1016]"
                  >
                    View all
                  </a>
                </div>

                <div className="mt-6 grid gap-4">
                  {chapterEvents.map((event, index) => (
                    <a
                      key={event.id}
                      href={`/e/${event.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="group rounded-[2rem] border border-[#0b1016]/10 bg-[#0b1016] p-4 text-white shadow-[0_20px_60px_rgba(11,16,22,0.18)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                            0{index + 1}
                          </div>
                          <div className="mt-2 font-display text-[1.7rem] font-semibold uppercase leading-[0.92] tracking-[-0.04em]">
                            {event.name}
                          </div>
                          <div className="mt-2 text-sm text-white/58">
                            {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/56 transition-transform duration-300 group-hover:translate-x-1" />
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
