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
    <div className={cn('min-h-screen bg-[#070607] text-white public-editorial-shell', className)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-14rem] h-[36rem] w-[36rem] rounded-full bg-[#d62a0b]/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[#ae936f]/[0.04] blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '48px 48px',
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
