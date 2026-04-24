import React from 'react'
import { ChevronLeft, ScanLine, Clock, Users, Ticket, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePermissions } from '@/core/permissions/permissions.store'
import { useEvents } from '@/core/events/events.store'
import { useOrganizations } from '@/core/organizations/organizations.store'
import { useAppContext } from '@/core/context/app-context.store'
import { buildModeAccent, buildHomeRoute, buildModeLabel } from '@/shared/utils/menu'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { AppMode } from '@/core/context/app-context.types'

const MODE_ICONS: Record<AppMode, LucideIcon> = {
  operator: ScanLine,
  staff: Clock,
  supervisor: Users,
  attendee: Ticket,
  promoter: Tag,
}

const MODE_DESCRIPTIONS: Record<AppMode, string> = {
  operator: 'Validar ingressos e controlar acesso',
  staff: 'Gerenciar turno, presença e ocorrências',
  supervisor: 'Monitorar equipe em tempo real',
  attendee: 'Acessar ingresso, agenda e experiência',
  promoter: 'Acompanhar vendas, comissões e metas',
}

export default function SelectModePage({ onNavigate }: PulsePageProps) {
  const { availableModes } = usePermissions()
  const { activeEvent } = useEvents()
  const { activeOrganization } = useOrganizations()
  const { setContext, setAvailableModes } = useAppContext()

  const handleSelect = (mode: AppMode) => {
    if (!activeEvent || !activeOrganization) return

    setAvailableModes(availableModes)

    setContext({
      organizationId: activeOrganization.id,
      organizationName: activeOrganization.name,
      organizationLogo: activeOrganization.logo_url,
      eventId: activeEvent.id,
      eventName: activeEvent.name,
      eventDate: activeEvent.start_date,
      eventCover: activeEvent.cover_url,
      mode,
    })

    onNavigate(buildHomeRoute(mode))
  }

  // Auto-select if only one mode
  React.useEffect(() => {
    if (availableModes.length === 1) {
      handleSelect(availableModes[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModes])

  return (
    <div className="flex flex-col min-h-screen bg-[#060d1f]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <button
          onClick={() => onNavigate('/pulse/select-event')}
          className="flex items-center gap-1 text-slate-400 text-sm mb-6 -ml-1"
        >
          <ChevronLeft size={16} />
          Evento
        </button>
        <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">
          Passo 3 de 3
        </p>
        <h1 className="text-2xl font-bold text-white">Modo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Como você vai participar de{' '}
          <span className="text-white font-medium">{activeEvent?.name}</span>?
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 rounded-full flex-1 bg-blue-500" />
        ))}
      </div>

      {/* Mode list */}
      <div className="px-4 space-y-3 pb-10">
        {(availableModes ?? []).map((mode) => {
          const Icon = MODE_ICONS[mode]
          const accent = buildModeAccent(mode)

          return (
            <button
              key={mode}
              onClick={() => handleSelect(mode)}
              className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/8 rounded-2xl active:bg-white/10 transition-all"
            >
              {/* Icon */}
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent + '22' }}
              >
                <Icon size={24} style={{ color: accent }} />
              </span>

              {/* Info */}
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">{buildModeLabel(mode)}</p>
                <p className="text-slate-400 text-xs mt-0.5">{MODE_DESCRIPTIONS[mode]}</p>
              </div>

              {/* Arrow */}
              <ChevronLeft
                size={18}
                className="text-slate-500 rotate-180 shrink-0"
              />
            </button>
          )
        })}

        {(availableModes ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-400 text-sm">Nenhum modo disponível</p>
            <p className="text-slate-600 text-xs mt-1">
              Você não tem permissão para acessar este evento
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
