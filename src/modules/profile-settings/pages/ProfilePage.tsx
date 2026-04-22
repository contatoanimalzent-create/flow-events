import React from 'react'
import {
  ChevronLeft, ChevronRight, User, Bell, Shield, HelpCircle,
  LogOut, Building2, Calendar, ToggleLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { usePermissions } from '@/core/permissions/permissions.store'
import { buildModeLabel, buildModeAccent, buildModeIcon } from '@/shared/utils/menu'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface MenuItem {
  icon: LucideIcon
  label: string
  subtitle?: string
  action: () => void
  danger?: boolean
}

export default function ProfilePage({ onNavigate }: PulsePageProps) {
  const { context, clearContext } = useAppContext()
  const { availableModes, clear: clearPerms } = usePermissions()

  const handleLogout = async () => {
    clearContext()
    clearPerms()
    await supabase.auth.signOut()
    window.location.replace('/login') // login único do app
  }

  const mode = context?.mode ?? null
  const accent = mode ? buildModeAccent(mode) : '#4285F4'

  const menuItems: MenuItem[] = [
    { icon: User, label: 'Meu perfil', subtitle: 'Nome, foto, preferências', action: () => {} },
    { icon: Bell, label: 'Notificações', subtitle: 'Configurar alertas', action: () => onNavigate('/pulse/notifications') },
    { icon: ToggleLeft, label: 'Trocar modo', subtitle: mode ? `Modo atual: ${buildModeLabel(mode)}` : '—', action: () => {} },
    { icon: Building2, label: 'Trocar organização', subtitle: context?.organizationName ?? '—', action: () => onNavigate('/pulse/select-organization') },
    { icon: Calendar, label: 'Trocar evento', subtitle: context?.eventName ?? '—', action: () => onNavigate('/pulse/select-event') },
    { icon: Shield, label: 'Segurança', subtitle: 'Senha e sessões', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', subtitle: 'Central de suporte', action: () => {} },
    { icon: LogOut, label: 'Sair da conta', action: handleLogout, danger: true },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => window.history.back()} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Perfil</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-6">
        <div
          className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-3"
          style={{ borderColor: accent, backgroundColor: accent + '22' }}
        >
          <User size={36} style={{ color: accent }} />
        </div>
        <p className="text-white font-bold text-lg">Usuário</p>
        <p className="text-slate-400 text-sm">usuário@exemplo.com</p>

        {/* Mode badges */}
        {availableModes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {availableModes.map((m) => (
              <span
                key={m}
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: buildModeAccent(m) + '22', color: buildModeAccent(m) }}
              >
                {buildModeLabel(m)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Context info */}
      {context && (
        <div className="px-4 mb-4">
          <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
            <p className="text-slate-400 text-xs mb-2">Contexto ativo</p>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Organização</p>
                <p className="text-white text-xs font-medium mt-0.5">{context.organizationName}</p>
              </div>
              <div className="flex-1">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Evento</p>
                <p className="text-white text-xs font-medium mt-0.5">{context.eventName}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 space-y-1">
        {menuItems.map(({ icon: Icon, label, subtitle, action, danger }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl active:bg-white/5 transition-all text-left"
          >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/15' : 'bg-white/8'}`}>
              <Icon size={18} className={danger ? 'text-red-400' : 'text-slate-400'} />
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
              {subtitle && <p className="text-slate-500 text-xs truncate">{subtitle}</p>}
            </div>
            {!danger && <ChevronRight size={16} className="text-slate-600 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}
