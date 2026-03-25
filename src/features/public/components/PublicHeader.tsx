import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
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
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-white/50 bg-[#f7f2e8]/88 backdrop-blur-xl',
        className,
      )}
    >
      <div className={cn('mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-10 lg:px-16', compact ? 'py-4' : 'py-5')}>
        <a href="/" className="flex items-center gap-3 text-[#1f1a15] no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec0] bg-white/80 text-sm font-semibold tracking-[0.28em]">
            AE
          </div>
          <div>
            <div className="font-serif text-xl font-semibold leading-none">Animalz Events</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.32em] text-[#8e7f68]">
              Luxury Event Operating System
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#5f5549] transition-colors hover:text-[#1f1a15]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {actionSlot}
          {onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full border border-[#1f1a15] px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5 hover:bg-[#1f1a15] hover:text-[#f8f3ea]"
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
