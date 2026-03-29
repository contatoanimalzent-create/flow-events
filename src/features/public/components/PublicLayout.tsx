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
    <div className={cn('min-h-screen bg-[#f5efe8] text-[#0b1016] public-editorial-shell', className)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[#d4a36d]/16 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#a92424]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11,16,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(11,16,22,0.04) 1px, transparent 1px), repeating-linear-gradient(135deg, rgba(11,16,22,0.02) 0 2px, transparent 2px 16px)',
            backgroundSize: '72px 72px, 72px 72px, auto',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 85%)',
          }}
        />
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
