import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Headphones, Menu, UserRound, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)

    const handleScroll = () => setIsScrolled(window.scrollY > 24)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function isActive(href: string) {
    if (href === '/') {
      return currentPath === '/'
    }

    return currentPath.startsWith(href)
  }

  const navLinks = [
    { label: isPortuguese ? 'Inicio' : 'Home', href: '/' },
    { label: isPortuguese ? 'Experiencias' : 'Experiences', href: '/events' },
    { label: isPortuguese ? 'Sobre' : 'About', href: '/about' },
    { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
    { label: isPortuguese ? 'Ajuda' : 'Help', href: '/help' },
  ]

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
          selected ? 'bg-[#ff2d2d]/14 text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white',
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/8 bg-[rgba(5,7,10,0.86)] backdrop-blur-xl transition-all duration-300',
        isScrolled && 'bg-[rgba(5,7,10,0.96)] shadow-[0_18px_48px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      <div className="border-b border-white/6 bg-[linear-gradient(90deg,rgba(255,45,45,0.15),rgba(255,45,45,0.03),transparent)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-white/58 md:px-10 lg:px-16">
          <div className="flex min-w-0 items-center gap-2 leading-none">
            <span className="h-2 w-2 rounded-full bg-[#ff2d2d]" />
            <span className="truncate">
              {isPortuguese
                ? 'Experiencias premium, hospitalidade e acesso com curadoria Animalz Events'
                : 'Premium experiences, hospitality and access curated by Animalz Events'}
            </span>
          </div>
          <a
            href="/help"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/76 transition-all duration-300 hover:border-[#ff2d2d]/30 hover:bg-white/[0.08] hover:text-white md:inline-flex"
          >
            <Headphones className="h-3.5 w-3.5" />
            {isPortuguese ? 'Concierge e suporte' : 'Concierge and support'}
          </a>
        </div>
      </div>

      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 md:px-10 lg:px-16',
          compact ? 'py-3.5' : 'py-4.5',
        )}
      >
        <a href="/" className="flex items-center gap-3 no-underline">
          <img
            src="/logo.png"
            alt="Animalz Events"
            className="h-14 w-auto shrink-0 object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.1)] md:h-16"
          />
          <div className="hidden min-w-0 self-center md:flex md:flex-col md:justify-center">
            <div className="text-[10px] uppercase leading-none tracking-[0.3em] text-[#ff6a5c]">Animalz Events</div>
            <div className="mt-1 font-display text-[1.34rem] uppercase leading-none tracking-[0.08em] text-[#f5f7fa]">
              Experiences
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'relative py-2 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200',
                isActive(link.href) ? 'text-[#f5f7fa]' : 'text-white/56 hover:text-[#f5f7fa]',
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#ff2d2d]" />
              ) : null}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {actionSlot}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageMenuOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/82 transition-all duration-300 hover:border-[#ff2d2d]/30 hover:bg-white/[0.08] hover:text-white"
            >
              <Globe className="h-4 w-4" />
              {locale === 'en-US' ? 'EN' : 'PT-BR'}
            </button>

            {languageMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.6rem)] w-36 rounded-[1.2rem] border border-white/10 bg-[#0d1117] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.34)]">
                {renderLanguageOption('en-US', 'English')}
                {renderLanguageOption('pt-BR', 'Portuguese')}
              </div>
            ) : null}
          </div>
          {user ? (
            <a
              href="/me"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[#f5f7fa] transition-all duration-300 hover:border-[#ff2d2d]/40 hover:bg-white/[0.08]"
            >
              <UserRound className="h-4 w-4" />
              {isPortuguese ? 'Minha conta' : 'My account'}
            </a>
          ) : onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] hover:shadow-[0_16px_36px_rgba(255,45,45,0.34)]"
            >
              {isPortuguese ? 'Entrar' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#f5f7fa] lg:hidden"
          aria-label={isPortuguese ? 'Abrir menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/8 bg-[rgba(5,7,10,0.98)] px-5 py-6 md:px-10 lg:hidden">
          <nav className="grid gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-[1.25rem] border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors',
                  isActive(link.href)
                    ? 'border-[#ff2d2d]/24 bg-[#ff2d2d]/12 text-[#f5f7fa]'
                    : 'border-white/8 bg-white/[0.03] text-white/64 hover:text-[#f5f7fa]',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 border-t border-white/8 pt-5">
            <div className="mb-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/48">
                <Globe className="h-3.5 w-3.5" />
                {isPortuguese ? 'Idioma' : 'Language'}
              </div>
              <div className="grid gap-2">
                {renderLanguageOption('en-US', 'English')}
                {renderLanguageOption('pt-BR', 'Portuguese')}
              </div>
            </div>
            {actionSlot ? <div className="mb-3">{actionSlot}</div> : null}
            {user ? (
              <a
                href="/me"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-[#f5f7fa]"
              >
                <UserRound className="h-4 w-4" />
                {isPortuguese ? 'Minha conta' : 'My account'}
              </a>
            ) : onLogin ? (
              <button
                type="button"
                onClick={() => {
                  onLogin()
                  setMobileMenuOpen(false)
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
              >
                {isPortuguese ? 'Entrar' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
