import React, { useEffect } from 'react'
import { ChevronLeft, ShieldAlert, CheckCircle, Bell, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useNotifications } from '@/core/notifications/notifications.store'
import type { AppNotification } from '@/core/notifications/notifications.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  critical: { icon: ShieldAlert, color: 'text-red-400', bg: 'border-red-500/20 bg-red-500/5' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
  info: { icon: Info, color: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'border-green-500/20 bg-green-500/5' },
}

function NotifCard({ notif, onRead, onRemove }: {
  notif: AppNotification
  onRead: (id: string) => void
  onRemove: (id: string) => void
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
  const Icon = cfg.icon
  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={`rounded-2xl border px-4 py-4 flex items-start gap-3 ${cfg.bg} ${!notif.isRead ? 'ring-1 ring-white/10' : 'opacity-70'}`}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      <Icon size={16} className={`${cfg.color} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-white text-sm font-semibold">{notif.title}</p>
          {!notif.isRead && (
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
          )}
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{notif.message}</p>
        <p className="text-slate-600 text-[10px] mt-1">{fmtTime(notif.createdAt)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(notif.id) }}
        className="shrink-0 p-1 -mr-1 text-slate-600 hover:text-slate-400"
      >
        <XCircle size={14} />
      </button>
    </div>
  )
}

export default function SupervisorAlertsPage({ onNavigate }: PulsePageProps) {
  const { notifications, markRead, markAllRead, remove } = useNotifications()

  // Only show warning/critical to supervisor as "alerts"
  const alerts = notifications.filter((n) => n.type === 'critical' || n.type === 'warning')
  const unread = alerts.filter((n) => !n.isRead)
  const read = alerts.filter((n) => n.isRead)

  useEffect(() => {
    // Mark all as read when opening
    return () => { markAllRead() }
  }, [])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-área-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Alertas Críticos</h1>
        {unread.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            {unread.length} novo{unread.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center px-6">
          <ShieldAlert size={48} className="text-slate-700 mb-4" />
          <p className="text-white font-semibold mb-1">Sem alertas críticos</p>
          <p className="text-slate-400 text-sm">Todos os sistemas operando normalmente</p>
          <div className="flex items-center gap-2 mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">Operação normal</span>
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {unread.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Não lidos</p>
                <button onClick={markAllRead} className="text-xs text-slate-500 underline">
                  Marcar todos lidos
                </button>
              </div>
              <div className="space-y-2">
                {unread.map((n) => (
                  <NotifCard key={n.id} notif={n} onRead={markRead} onRemove={remove} />
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Lidos</p>
              <div className="space-y-2">
                {read.map((n) => (
                  <NotifCard key={n.id} notif={n} onRead={markRead} onRemove={remove} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
