import React from 'react'
import {
  Ticket,
  Calendar,
  Map,
  Rss,
  ScanLine,
  History,
  BarChart2,
  BellRing,
  Home,
  MapPin,
  FileText,
  AlertTriangle,
  Users,
  ShoppingCart,
  DollarSign,
  Trophy,
  Target,
  User,
} from 'lucide-react'
import type { TabItem } from '@/shared/utils/menu'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Ticket,
  Calendar,
  Map,
  Rss,
  ScanLine,
  History,
  BarChart2,
  BellRing,
  Home,
  MapPin,
  FileText,
  AlertTriangle,
  Users,
  ShoppingCart,
  DollarSign,
  Trophy,
  Target,
  User,
}

interface BottomTabBarProps {
  tabs: TabItem[]
  activePath: string
  accent: string
  onNavigate: (path: string) => void
}

export function BottomTabBar({ tabs, activePath, accent, onNavigate }: BottomTabBarProps) {
  return (
    <nav
      className="flex items-stretch bg-[#0f172a] border-t border-white/8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const IconComponent = ICON_MAP[tab.icon] ?? User
        const isActive =
          tab.path === '/app/profile'
            ? activePath.startsWith('/app/profile')
            : activePath === tab.path || activePath.startsWith(tab.path + '/')

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.path)}
            className="relative flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-opacity"
            style={{ opacity: isActive ? 1 : 0.45 }}
          >
            {/* Active indicator line */}
            {isActive && (
              <span
                className="absolute top-0 left-2 right-2 h-0.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}

            {/* Badge */}
            {tab.badge != null && tab.badge > 0 && (
              <span className="absolute top-1 right-1/4 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}

            <IconComponent
              size={22}
              style={{ color: isActive ? accent : undefined }}
              className={isActive ? '' : 'text-slate-400'}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? accent : undefined }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
