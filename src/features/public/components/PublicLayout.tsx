import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

interface PublicLayoutProps {
  children: ReactNode
  onLogin?: () => void
  showFooter?: boolean
  headerActionSlot?: ReactNode
  compactHeader?: boolean
  className?: string
}

export function PublicLayout({
  children,
  onLogin,
  showFooter = true,
  headerActionSlot,
  compactHeader = false,
  className,
}: PublicLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-[#f8f3ea] text-[#1f1a15]', className)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[#f0dfbf]/35 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#ead8c6]/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(rgba(120,104,78,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,104,78,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 85%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <PublicHeader onLogin={onLogin} actionSlot={headerActionSlot} compact={compactHeader} />
        <main>{children}</main>
        {showFooter ? <PublicFooter /> : null}
      </div>
    </div>
  )
}
