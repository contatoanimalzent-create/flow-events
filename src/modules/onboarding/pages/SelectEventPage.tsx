import React, { useEffect } from 'react'
import { Calendar, ChevronRight, ChevronLeft, Loader2, MapPin } from 'lucide-react'
import { useEvents } from '@/core/events/events.store'
import { useOrganizations } from '@/core/organizations/organizations.store'
import { usePermissions } from '@/core/permissions/permissions.store'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { UserEvent } from '@/core/events/events.types'

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  ongoing: 'Em andamento',
  finished: 'Encerrado',
  draft: 'Rascunho',
}

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-400 bg-green-500/15',
  published: 'text-blue-400 bg-blue-500/15',
  finished: 'text-slate-400 bg-slate-500/15',
}

export default function SelectEventPage({ onNavigate }: PulsePageProps) {
  const { events, activeEvent, isLoading, setActive } = useEvents()
  const { activeOrganization } = useOrganizations()
  const loadPermissions = usePermissions((s) => s.load)

  // Auto-select if only one event
  useEffect(() => {
    if (!isLoading && events.length === 1) {
      handleSelect(events[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, events])

  const handleSelect = async (event: UserEvent) => {
    setActive(event)

    const { data: { user } } = await supabase.auth.getUser()
    if (user && activeOrganization) {
      await loadPermissions(user.id, activeOrganization.id, event.id)
    }

    onNavigate('/pulse/select-mode')
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#060d1f]">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm mt-3">Carregando eventos...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#060d1f]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <button
          onClick={() => onNavigate('/pulse/select-organization')}
          className="flex items-center gap-1 text-slate-400 text-sm mb-6 -ml-1"
        >
          <ChevronLeft size={16} />
          Organização
        </button>
        <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">
          Passo 2 de 3
        </p>
        <h1 className="text-2xl font-bold text-white">Evento</h1>
        <p className="text-slate-400 text-sm mt-1">
          Selecione o evento que deseja acessar
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-all ${i <= 1 ? 'bg-blue-500' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-3 pb-10">
        {events.map((event) => {
          const statusColor = STATUS_COLORS[event.status] ?? 'text-slate-400 bg-slate-500/15'
          return (
            <button
              key={event.id}
              onClick={() => handleSelect(event)}
              className="w-full flex items-stretch gap-0 bg-white/5 border border-white/8 rounded-2xl overflow-hidden active:bg-white/10 transition-all"
            >
              {/* Cover */}
              <div className="w-20 bg-slate-800 shrink-0">
                {event.cover_url
                  ? <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Calendar size={20} className="text-slate-600" />
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 p-4 text-left">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white font-semibold text-sm leading-tight">{event.name}</p>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {STATUS_LABELS[event.status] ?? event.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{formatEventDate(event.start_date)}</p>
                {event.venue_name && (
                  <p className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin size={10} />
                    {event.venue_name}
                  </p>
                )}
                {/* Mode chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.availableModes.slice(0, 3).map((m) => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-slate-300 capitalize">
                      {m}
                    </span>
                  ))}
                  {event.availableModes.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-slate-400">
                      +{event.availableModes.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center pr-3">
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </button>
          )
        })}

        {events.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar size={40} className="text-slate-700 mb-3" />
            <p className="text-slate-400 text-sm">Nenhum evento encontrado</p>
            <p className="text-slate-600 text-xs mt-1">
              Você precisa estar vinculado a um evento para continuar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
