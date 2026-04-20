import { ArrowLeft, MoreVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
  accent?: string
  className?: string
}

export function MobileHeader({ title, subtitle, onBack, right, className }: MobileHeaderProps) {
  return (
    <header className={cn(
      'safe-top flex shrink-0 items-center gap-3 border-b border-white/8 bg-black/95 px-4 py-3 backdrop-blur-sm',
      className,
    )}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 transition-colors active:bg-white/16"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold text-white">{title}</div>
        {subtitle && <div className="truncate text-[11px] text-white/50 font-mono mt-0.5">{subtitle}</div>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}

interface MobileTabBarProps {
  tabs: Array<{ key: string; label: string; icon: React.ElementType; badge?: number }>
  active: string
  onChange: (key: string) => void
  accent?: string
}

export function MobileTabBar({ tabs, active, onChange, accent = '#0057E7' }: MobileTabBarProps) {
  return (
    <nav className="safe-bottom shrink-0 border-t border-white/8 bg-black/95 backdrop-blur-sm">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-opacity active:opacity-70"
            >
              <div className="relative">
                <tab.icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: isActive ? accent : 'rgba(255,255,255,0.4)' }}
                />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? accent : 'rgba(255,255,255,0.4)' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileMenu() {
  return (
    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8">
      <MoreVertical className="h-5 w-5 text-white/60" />
    </button>
  )
}
