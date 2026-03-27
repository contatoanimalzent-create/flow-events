import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ArrowRight, Menu, UserRound, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'

interface PublicHeaderProps {
  onLogin?: () => void
  actionSlot?: ReactNode
  compact?: boolean
  className?: string
}

const NAV_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Eventos', href: '/events' },
  { label: 'Sobre', href: '/about' },
  { label: 'Criar evento', href: '/create-event' },
  { label: 'Contato', href: '/contact' },
]

export function PublicHeader({ onLogin, actionSlot, compact = false, className }: PublicHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0908] transition-all duration-300',
        isScrolled && 'border-[rgba(255,255,255,0.1)] backdrop-blur-md',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-10 lg:px-16',
          compact ? 'py-3' : 'py-4',
        )}
      >
        <a href="/" className="flex items-center no-underline">
          <img
            src="/logo.png"
            alt="Animalz Events"
            className="h-10 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(196,154,80,0.22))' }}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-200 relative pb-1',
                isActive(link.href)
                  ? 'text-[#f0ebe2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-full after:bg-[#c49a50]'
                  : 'text-[#9a9088] hover:text-[#f0ebe2]'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center lg:hidden"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-[#f0ebe2]" />
          ) : (
            <Menu className="h-6 w-6 text-[#f0ebe2]" />
          )}
        </button>

        {/* Desktop Auth & Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {actionSlot}
          {user ? (
            <a
              href="/me"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium text-[#f0ebe2] transition-all hover:-translate-y-0.5 hover:border-[#c49a50]/40 hover:bg-[#c49a50]/10"
            >
              <UserRound className="h-4 w-4" />
              Minha conta
            </a>
          ) : onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-[#c49a50] px-5 py-2.5 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(196,154,80,0.35)]"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="border-t border-[rgba(255,255,255,0.07)] bg-[#0a0908] px-5 py-6 md:px-10 lg:hidden">
          <nav className="grid gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors py-2',
                  isActive(link.href)
                    ? 'text-[#c49a50]'
                    : 'text-[#9a9088] hover:text-[#f0ebe2]'
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile Auth */}
          <div className="mt-6 border-t border-[rgba(255,255,255,0.07)] pt-6">
            {user ? (
              <a
                href="/me"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-sm font-medium text-[#f0ebe2] transition-all"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c49a50] px-5 py-2.5 text-sm font-semibold text-[#0a0908] transition-all"
              >
                Entrar
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  )
}
