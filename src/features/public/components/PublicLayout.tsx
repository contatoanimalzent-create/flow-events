import type { ReactNode } from 'react'
import { PageShell } from '@/shared/components'
import { MotionPage } from '@/shared/motion'
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
    <div className={cn('min-h-screen bg-white text-text-primary', className)}>
      {/* Subtle ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-brand-sky/[0.04] blur-[100px]" />
        <div className="absolute bottom-[-12rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-brand-navy/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10">
        <PublicHeader onLogin={onLogin} actionSlot={headerActionSlot} compact={compactHeader} />
        <MotionPage>
          <main>
            <PageShell tone="public" width="xl" className="px-0 py-0">
              {children}
            </PageShell>
          </main>
        </MotionPage>
        {showFooter ? <PublicFooter /> : null}
      </div>
    </div>
  )
}
