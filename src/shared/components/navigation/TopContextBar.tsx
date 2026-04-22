import React from 'react'
import { ChevronDown, Bell, Wifi, WifiOff } from 'lucide-react'
import type { AppMode } from '@/core/context/app-context.types'
import { buildModeLabel, buildModeAccent } from '@/shared/utils/menu'

interface TopContextBarProps {
  mode: AppMode
  eventName: string
  organizationName: string
  unreadCount: number
  isOnline: boolean
  onContextTap: () => void
  onNotificationsTap: () => void
}

export function TopContextBar({
  mode,
  eventName,
  organizationName,
  unreadCount,
  isOnline,
  onContextTap,
  onNotificationsTap,
}: TopContextBarProps) {
  const accent = buildModeAccent(mode)
  const modeLabel = buildModeLabel(mode)

  return (
    <header
      className="flex items-center px-4 py-2 bg-[#0a0f1e] border-b border-white/8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
    >
      {/* Left: context info */}
      <button
        onClick={onContextTap}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        {/* Mode pill */}
        <span
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: accent + '22', color: accent }}
        >
          {modeLabel}
        </span>

        {/* Event + org */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[13px] font-semibold text-white truncate leading-tight">
            {eventName}
          </span>
          <span className="text-[10px] text-slate-400 truncate leading-tight">
            {organizationName}
          </span>
        </div>

        <ChevronDown size={14} className="text-slate-500 shrink-0" />
      </button>

      {/* Right: status icons */}
      <div className="flex items-center gap-3">
        {/* Offline indicator */}
        {!isOnline && (
          <span className="flex items-center gap-1 text-[10px] text-yellow-400">
            <WifiOff size={12} />
            Offline
          </span>
        )}
        {isOnline && <Wifi size={12} className="text-slate-600" />}

        {/* Notifications */}
        <button onClick={onNotificationsTap} className="relative p-1">
          <Bell size={20} className="text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
