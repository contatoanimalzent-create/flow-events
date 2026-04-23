import React, { useEffect, useState } from 'react'
import { ChevronLeft, Sparkles, ArrowRight, Loader2, Clock, Tag } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { attendeeService } from '@/core/attendee/attendee.service'
import type { UpgradeOffer } from '@/core/attendee/attendee.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const CARD_GRADIENTS = [
  'from-amber-900/60 to-slate-900',
  'from-blue-900/60 to-slate-900',
  'from-purple-900/60 to-slate-900',
  'from-emerald-900/60 to-slate-900',
]

export default function UpgradesPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [upgrades, setUpgrades] = useState<UpgradeOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!context?.eventId) { setLoading(false); return }
      try {
        const data = await attendeeService.getUpgrades(context.eventId)
        setUpgrades(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const fmt = (n: number, cur = 'BRL') =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: cur, minimumFractionDigits: 0 })

  const fmtDeadline = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Upgrades</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : upgrades.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Sparkles size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum upgrade disponível no momento</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {upgrades.map((upgrade, idx) => (
            <div
              key={upgrade.id}
              className={`rounded-2xl border border-white/8 overflow-hidden bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]}`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {upgrade.available !== null && upgrade.available < 20 && (
                      <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">
                        🔥 Poucas vagas
                      </span>
                    )}
                    {upgrade.available === null && (
                      <span className="text-xs font-semibold bg-white/10 text-white/70 px-2.5 py-1 rounded-full">
                        ✨ Upgrade
                      </span>
                    )}
                  </div>
                  <Sparkles size={16} className="text-yellow-400" />
                </div>

                <h3 className="text-white font-bold text-lg mb-1">{upgrade.name}</h3>
                {upgrade.description && (
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{upgrade.description}</p>
                )}

                <div className="flex gap-3 flex-wrap mb-4">
                  {upgrade.available !== null && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Tag size={12} />
                      {upgrade.available} disponíveis
                    </div>
                  )}
                  {upgrade.expiresAt && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock size={12} />
                      Até {fmtDeadline(upgrade.expiresAt)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    {fmt(upgrade.price, upgrade.currency)}
                  </span>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold active:opacity-80 transition-opacity">
                    Comprar
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
