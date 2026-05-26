import React, { useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight, User, Bell, Shield, HelpCircle,
  LogOut, Building2, Calendar, ToggleLeft, Loader2, Globe, Moon, Sun,
  CheckCircle, Camera, Save, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { usePermissions } from '@/core/permissions/permissions.store'
import { buildModeLabel, buildModeAccent } from '@/shared/utils/menu'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import { useLocale } from '@/core/i18n'
import { useTheme } from '@/core/theme/theme.store'

interface MenuItem {
  icon: LucideIcon
  label: string
  subtitle?: string
  action: () => void
  danger?: boolean
}

interface UserProfile {
  fullName: string
  email: string
  avatarUrl: string | null
}

export default function ProfilePage({ onNavigate }: PulsePageProps) {
  const { context, clearContext } = useAppContext()
  const { availableModes, clear: clearPerms } = usePermissions()
  const { locale, setLocale } = useLocale()
  const { theme, toggle } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)

  // Load real user data
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingProfile(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      const firstName = (data as any)?.first_name ?? ''
      const lastName = (data as any)?.last_name ?? ''
      const displayName = [firstName, lastName].filter(Boolean).join(' ') || user.user_metadata?.full_name || 'Usuário'

      setEditFirstName(firstName)
      setEditLastName(lastName)
      setEditPhone((data as any)?.phone ?? '')

      setProfile({
        fullName: displayName,
        email: user.email ?? '-',
        avatarUrl: (data as any)?.avatar_url ?? null,
      })
      setLoadingProfile(false)
    }
    load()
  }, [])

  const handleResetPassword = async () => {
    if (!profile?.email || resetLoading) return
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(profile.email)
    setResetLoading(false)
    setResetSent(true)
  }

  const handleLogout = async () => {
    clearContext()
    clearPerms()
    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  const mode = context?.mode ?? null
  const accent = mode ? buildModeAccent(mode) : '#4285F4'

  const menuItems: MenuItem[] = [
    {
      icon: User,
      label: 'Meu perfil',
      subtitle: 'Nome, telefone, foto',
      action: () => setEditMode(true),
    },
    { icon: Bell, label: 'Notificações', subtitle: 'Configurar alertas', action: () => onNavigate('/pulse/notifications') },
    { icon: ToggleLeft, label: 'Trocar modo', subtitle: mode ? `Modo atual: ${buildModeLabel(mode)}` : '-', action: () => onNavigate('/pulse/select-mode') },
    { icon: Building2, label: 'Trocar organização', subtitle: context?.organizationName ?? '-', action: () => onNavigate('/pulse/select-organization') },
    { icon: Calendar, label: 'Trocar evento', subtitle: context?.eventName ?? '-', action: () => onNavigate('/pulse/select-event') },
    {
      icon: Globe,
      label: locale === 'pt-BR' ? 'Idioma: Português' : 'Language: English',
      subtitle: 'Trocar idioma / Change language',
      action: () => setLocale(locale === 'pt-BR' ? 'en-US' : 'pt-BR'),
    },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Tema escuro' : 'Tema claro',
      subtitle: 'Toque para alternar',
      action: () => toggle(),
    },
    { icon: Shield, label: 'Segurança', subtitle: 'Senha e sessões', action: handleResetPassword },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      subtitle: 'Falar com o suporte Pulse',
      action: () => window.open(
        'https://wa.me/14698629040?text=' +
        encodeURIComponent(
          '👋 Olá! Vim pelo *Pulse* e preciso de ajuda.\n\n' +
          'Evento: ' + (context?.eventName ?? '-') + '\n' +
          'Organização: ' + (context?.organizationName ?? '-')
        ),
        '_blank',
      ),
    },
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
        {loadingProfile ? (
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: accent + '22' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: accent }} />
          </div>
        ) : profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-20 h-20 rounded-full border-2 mb-3 object-cover"
            style={{ borderColor: accent }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-3"
            style={{ borderColor: accent, backgroundColor: accent + '22' }}
          >
            <span className="text-2xl font-bold" style={{ color: accent }}>
              {(profile?.fullName ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <p className="text-white font-bold text-lg">{profile?.fullName ?? '-'}</p>
        <p className="text-slate-400 text-sm">{profile?.email ?? '-'}</p>

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

      {/* Profile edit panel */}
      {editMode && (
        <div className="mx-4 mb-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">Editar perfil</p>
            <button onClick={() => setEditMode(false)} className="p-1 text-slate-400">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 block">Nome</label>
              <input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
                placeholder="Nome"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 block">Sobrenome</label>
              <input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
                placeholder="Sobrenome"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 block">Telefone</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>
          {editSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle size={14} /> Perfil atualizado
            </div>
          )}
          <button
            onClick={async () => {
              setEditSaving(true)
              try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                await supabase.from('profiles').update({
                  first_name: editFirstName.trim(),
                  last_name: editLastName.trim(),
                  phone: editPhone.trim() || null,
                }).eq('id', user.id)
                const newName = [editFirstName, editLastName].filter(Boolean).join(' ') || 'Usuário'
                setProfile((p) => p ? { ...p, fullName: newName } : p)
                setEditSuccess(true)
                setTimeout(() => { setEditSuccess(false); setEditMode(false) }, 1500)
              } finally {
                setEditSaving(false)
              }
            }}
            disabled={editSaving || !editFirstName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </button>
        </div>
      )}

      {/* Security / reset password feedback */}
      {resetSent && (
        <div className="mx-4 mb-3 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <p className="text-green-300 text-sm">Email de redefinição enviado!</p>
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

      {/* Footer contact */}
      <div className="px-4 pt-4 pb-2 text-center">
        <p className="text-slate-600 text-xs">Suporte por email</p>
        <a
          href="mailto:contatopulse@animalzgroup.com"
          className="text-slate-400 text-xs underline-offset-2 hover:text-slate-300 transition-colors"
        >
          contatopulse@animalzgroup.com
        </a>
      </div>
    </div>
  )
}
