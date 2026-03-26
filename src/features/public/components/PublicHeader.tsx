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
  { label: 'Contato', href: '/contact' },
]

export function PublicHeader({ onLogin, actionSlot, compact = false, className }: PublicHeaderProps) {
  const user = useAuthStore((state) => state.user)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-bg-border/60 bg-[#f7f2e8]/88 backdrop-blur-xl',
        className,
      )}
    >
      <div className={cn('mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-10 lg:px-16', compact ? 'py-4' : 'py-5')}>
        <a href="/" className="flex items-center gap-3 text-[#1f1a15] no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-white/84 text-sm font-semibold tracking-[0.28em] shadow-card">
            AE
          </div>
          <div>
            <div className="font-display text-[2rem] font-semibold leading-none tracking-[-0.04em] text-text-primary">Animalz Events</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.32em] text-text-muted">
              Luxury Event Operating System
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
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
              className="inline-flex items-center gap-2 rounded-full border border-text-primary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:-translate-y-0.5 hover:bg-text-primary hover:text-bg-secondary"
            >
              <UserRound className="h-4 w-4" />
              Minha conta
            </a>
          ) : onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full border border-text-primary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:-translate-y-0.5 hover:bg-text-primary hover:text-bg-secondary"
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
