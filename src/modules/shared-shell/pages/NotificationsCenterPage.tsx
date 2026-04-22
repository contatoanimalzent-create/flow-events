import React from 'react'
import { ChevronLeft, Bell, BellOff, Info, AlertTriangle, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNotifications } from '@/core/notifications/notifications.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { NotificationType } from '@/core/notifications/notifications.store'

const TYPE_CONFIG: Record<NotificationType, { icon: LucideIcon, color: string }> = {
  info: { icon: Info, color: '#4285F4' },
  warning: { icon: AlertTriangle, color: '#d97706' },
  critical: { icon: AlertCircle, color: '#EF4444' },
  success: { icon: CheckCircle, color: '#22C55E' },
}

export default function NotificationsCenterPage({ onNavigate }: PulsePageProps) {
  const { notifications, markRead, markAllRead, remove } = useNotifications()

  const unread = notifications.filter((n) => !n.isRead)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div
        className="flex items-center gap-3 px-4 pt-5 pb-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
      >
        <button onClick={() => window.history.back()} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Notificações</h1>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="ml-auto text-blue-400 text-xs font-medium">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <BellOff size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 text-sm">Sem notificações</p>
        </div>
      ) : (
        <div className="flex-1 px-4 space-y-2">
          {notifications.map((notif) => {
            const { icon: Icon, color } = TYPE_CONFIG[notif.type]
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-4 transition-all cursor-pointer ${
                  notif.isRead ? 'border-white/6 bg-white/3 opacity-70' : 'border-white/10 bg-white/6'
                }`}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + '22' }}>
                  <Icon size={16} style={{ color }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{notif.message}</p>
                  <p className="text-slate-600 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(notif.id) }}
                  className="p-1 shrink-0 text-slate-600 active:text-slate-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
