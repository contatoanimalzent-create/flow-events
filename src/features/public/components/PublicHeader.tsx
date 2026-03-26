import type { ReactNode } from 'react'
import { ArrowRight, UserRound } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'

interface PublicHeaderProps {
  onLogin?: () => void
  actionSlot?: ReactNode
  compact?: boolean
  className?: string
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Eventos', href: '/events' },
  { label: 'Sobre', href: '/about' },
  { label: 'Criar evento', href: '/create-event' },
  { label: 'Contato', href: '/contact' },
]

export function PublicHeader({ onLogin, actionSlot, compact = false, className }: PublicHeaderProps) {
  const user = useAuthStore((state) => state.user)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0908]',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-10 lg:px-16',
          compact ? 'py-4' : 'py-5',
        )}
      >
        <a href="/" className="flex items-center no-underline">
          <img
            src="/logo.png"
            alt="Animalz Events"
            className="h-12 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(196,154,80,0.18))' }}
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#9a9088] transition-colors hover:text-[#f0ebe2]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
    </header>
  )
}
