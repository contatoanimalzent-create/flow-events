import React from 'react'
import { X, ScanLine, Clock, Users, Ticket, Tag, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppMode } from '@/core/context/app-context.types'
import { buildModeLabel, buildModeAccent } from '@/shared/utils/menu'

const MODE_ICONS: Record<AppMode, LucideIcon> = {
  operator: ScanLine,
  staff: Clock,
  supervisor: Users,
  attendee: Ticket,
  promoter: Tag,
}

const MODE_DESCRIPTIONS: Record<AppMode, string> = {
  operator: 'Controle de acesso e check-in',
  staff: 'Turno, presença e ocorrências',
  supervisor: 'Monitor de equipe em tempo real',
  attendee: 'Ingresso, agenda e experiência',
  promoter: 'Vendas, comissões e metas',
}

interface ModeSwitcherProps {
  availableModes: AppMode[]
  activeMode: AppMode
  onSelect: (mode: AppMode) => void
  onClose: () => void
}

export function ModeSwitcher({ availableModes, activeMode, onSelect, onClose }: ModeSwitcherProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] rounded-t-2xl border-t border-white/10 animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Modo ativo
            </p>
            <p className="text-white font-semibold text-base">
              {buildModeLabel(activeMode)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={16} className="text-slate-300" />
          </button>
        </div>

        {/* Mode list */}
        <div className="px-4 pb-6 space-y-2">
          {availableModes.map((mode) => {
            const Icon = MODE_ICONS[mode]
            const accent = buildModeAccent(mode)
            const isActive = mode === activeMode

            return (
              <button
                key={mode}
                onClick={() => onSelect(mode)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-white/20 bg-white/8'
                    : 'border-white/5 bg-white/3 active:bg-white/8'
                }`}
              >
                {/* Icon */}
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accent + '22' }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </span>

                {/* Info */}
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm">{buildModeLabel(mode)}</p>
                  <p className="text-slate-400 text-xs">{MODE_DESCRIPTIONS[mode]}</p>
                </div>

                {/* Active check */}
                {isActive && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    <Check size={14} className="text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Safe area spacer */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  )
}
