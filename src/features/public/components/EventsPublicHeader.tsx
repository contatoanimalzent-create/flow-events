import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ArrowRight, Menu, UserRound, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'

interface EventsPublicHeaderProps {
  onLogin?: () => void
  actionSlot?: ReactNode
  compact?: boolean
  className?: string
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Experiencias', href: '/events' },
  { label: 'Sobre', href: '/about' },
  { label: 'Criar evento', href: '/create-event' },
  { label: 'Ajuda', href: '/help' },
]

export function EventsPublicHeader({
  onLogin,
  actionSlot,
  compact = false,
  className,
}: EventsPublicHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,9,13,0.88)] backdrop-blur-xl transition-all duration-300',
        isScrolled && 'bg-[rgba(7,9,13,0.96)] shadow-[0_14px_40px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 md:px-10 lg:px-16',
          compact ? 'py-3' : 'py-4',
        )}
      >
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" alt="Animalz Events" className="h-10 w-auto object-contain" />
          <div className="hidden md:block">
            <div className="text-[10px] uppercase tracking-[0.34em] text-[#ff6a5c]">Animalz Events</div>
            <div className="mt-1 text-sm text-[#a9b0bc]">Premium experiences platform</div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'relative pb-1 text-sm font-medium transition-colors duration-200',
                isActive(link.href) ? 'text-[#f5f7fa]' : 'text-[#8f97a4] hover:text-[#f5f7fa]',
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#ff2d2d]" />
              ) : null}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {actionSlot}
          {user ? (
            <a
              href="/me"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm font-medium text-[#f5f7fa] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff2d2d]/30"
            >
              <UserRound className="h-4 w-4" />
              Minha conta
            </a>
          ) : onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,45,45,0.32)]"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f5f7fa] lg:hidden"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(7,9,13,0.98)] px-5 py-6 md:px-10 lg:hidden">
          <nav className="grid gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-[1.25rem] px-4 py-3 text-sm font-medium transition-colors',
                  isActive(link.href) ? 'bg-[rgba(255,45,45,0.16)] text-[#f5f7fa]' : 'text-[#8f97a4] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f5f7fa]',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
            {actionSlot ? <div className="mb-3">{actionSlot}</div> : null}
            {user ? (
              <a
                href="/me"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-medium text-[#f5f7fa]"
              >
                <UserRound className="h-4 w-4" />
                Minha conta
              </a>
            ) : onLogin ? (
              <button
                type="button"
                onClick={() => {
                  onLogin()
                  setMobileMenuOpen(false)
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-3 text-sm font-semibold text-white"
              >
                Entrar
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
