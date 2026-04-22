import React from 'react'
import { ChevronLeft, Sparkles, ArrowRight } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const UPGRADES = [
  { id: 1, title: 'Upgrade para VIP', description: 'Acesso ao camarote exclusivo, open bar e meet & greet com palestrantes', price: 'R$ 150', color: '#78350f', badge: '🌟 Limitado' },
  { id: 2, title: 'Jantar VIP', description: 'Jantar privativo com os palestrantes após o encerramento', price: 'R$ 200', color: '#1e3a5f', badge: '🍽️ Poucas vagas' },
  { id: 3, title: 'Gravação das palestras', description: 'Acesso às gravações de todas as sessões por 30 dias', price: 'R$ 50', color: '#1e293b', badge: '📹 Digital' },
]

export default function UpgradesPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Upgrades</h1>
      </div>

      <div className="px-4 space-y-4">
        {UPGRADES.map((upgrade) => (
          <div
            key={upgrade.id}
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${upgrade.color}99, #0f172a)` }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white/70">
                  {upgrade.badge}
                </span>
                <Sparkles size={16} className="text-yellow-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{upgrade.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{upgrade.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{upgrade.price}</span>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold active:opacity-80">
                  Comprar
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
