import type { ReactNode } from 'react'
import { PageShell } from '@/shared/components'
import { MotionPage } from '@/shared/motion'
import { cn } from '@/shared/lib'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { SmoothScroll } from './animations/SmoothScroll'
import { MagneticCursor } from './animations/MagneticCursor'

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
  const hasFineMouse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  return (
    <SmoothScroll>
      <div className={cn('min-h-screen bg-[#050507] text-[#f5f0e8]', className)}>
        {hasFineMouse && <MagneticCursor />}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,30,178,0.16),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(199,155,68,0.12),transparent_16%),linear-gradient(180deg,#06070a_0%,#050507_38%,#090b10_100%)]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '84px 84px',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.18))',
            }}
          />
          <div className="absolute left-[-10rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[#6d2fe5]/16 blur-[120px]" />
          <div className="absolute bottom-[-10rem] right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-[#c79b44]/10 blur-[120px]" />
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
    </SmoothScroll>
  )
}
