import React, { useEffect } from 'react'
import { Building2, ChevronRight, Loader2, Lock, RefreshCw, LogOut } from 'lucide-react'
import { useOrganizations } from '@/core/organizations/organizations.store'
import { useEvents } from '@/core/events/events.store'
import { useAppContext } from '@/core/context/app-context.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { UserOrganization } from '@/core/organizations/organizations.types'

export default function SelectOrganizationPage({ onNavigate }: PulsePageProps) {
  const { organizations, activeOrganization, isLoading, load, setActive } = useOrganizations()
  const { clearContext } = useAppContext()
  const loadEvents = useEvents((s) => s.load)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Sem sessão → login principal do app (único login)
        window.location.replace('/login')
        return
      }
      load(user.id)
    })
  }, [load])

  // Auto-select if only one org
  useEffect(() => {
    if (!isLoading && organizations.length === 1) {
      handleSelect(organizations[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, organizations])

  const handleSelect = async (org: UserOrganization) => {
    setActive(org)
    clearContext()

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await loadEvents(user.id, org.id)
    }

    onNavigate('/pulse/select-event')
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#060d1f]">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm mt-3">Carregando organizações...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#060d1f]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">
          Passo 1 de 3
        </p>
        <h1 className="text-2xl font-bold text-white">Organização</h1>
        <p className="text-slate-400 text-sm mt-1">Selecione a organização que deseja acessar</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-all ${i === 0 ? 'bg-blue-500' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => handleSelect(org)}
            className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/8 rounded-2xl active:bg-white/10 transition-all"
          >
            {/* Logo or icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
              {org.logo_url
                ? <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                : <Building2 size={22} className="text-blue-400" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">{org.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {org.eventCount} evento{org.eventCount !== 1 ? 's' : ''} · {org.plan}
              </p>
            </div>

            <ChevronRight size={18} className="text-slate-500 shrink-0" />
          </button>
        ))}

        {organizations.length === 0 && !isLoading && (
          <div className="flex flex-col items-center py-12 px-6 text-center bg-white/5 border border-white/8 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center mb-4">
              <Lock size={26} className="text-slate-400" />
            </div>
            <p className="text-white font-bold text-base mb-2">Acesso pendente</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Você ainda não foi adicionado a nenhuma organização. Peça ao seu supervisor ou organizador para te convidar pelo e-mail cadastrado.
            </p>
            <button
              onClick={() => supabase.auth.getUser().then(({ data: { user } }) => { if (user) load(user.id) })}
              className="mt-6 flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl active:opacity-80 transition-opacity"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.replace('/login'))}
              className="mt-3 flex items-center gap-2 text-slate-400 text-sm px-5 py-2.5 rounded-xl active:opacity-70 transition-opacity"
            >
              <LogOut size={14} />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
