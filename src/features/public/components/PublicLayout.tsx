import type { ReactNode } from 'react'
import { PageShell } from '@/shared/components'
import { MotionPage } from '@/shared/motion'
import { cn } from '@/shared/lib'
import { ExitLeadCaptureDialog } from '@/features/growth/components/ExitLeadCaptureDialog'
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
    <div className={cn('min-h-screen bg-bg-primary text-text-primary luxury-canvas', className)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[#ff2d2d]/22 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#445066]/18 blur-3xl" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 16px)',
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
      <ExitLeadCaptureDialog source="public_exit" />
    </div>
  )
}
