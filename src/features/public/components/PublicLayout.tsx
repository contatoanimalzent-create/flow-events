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
  /** true → sem padding-top no main (para páginas com hero full-screen) */
  heroPage?: boolean
}

export function PublicLayout({
  children,
  onLogin,
  showFooter = true,
  headerActionSlot,
  compactHeader = false,
  className,
  heroPage = false,
}: PublicLayoutProps) {
  const hasFineMouse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  return (
    <SmoothScroll>
      <div className={cn('min-h-screen bg-[#060B18] text-[#F0E8D6]', className)}>
        {hasFineMouse && <MagneticCursor />}

        {/* Header fixo — flutua sobre o conteúdo, transparente no topo */}
        <PublicHeader onLogin={onLogin} actionSlot={headerActionSlot} compact={compactHeader} />

        <MotionPage>
          <main>
            {/* Spacer para páginas sem hero (evita conteúdo sob o header fixo) */}
            {!heroPage && <div style={{ height: '80px' }} />}
            <PageShell tone="public" width="xl" className="px-0 py-0">
              {children}
            </PageShell>
          </main>
        </MotionPage>

        {showFooter ? <PublicFooter /> : null}
      </div>
    </SmoothScroll>
  )
}
