import React from 'react'
import { ChevronLeft, ShieldAlert, CheckCircle } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function SupervisorAlertsPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/supervisor')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Alertas Críticos</h1>
      </div>
      <div className="flex flex-col items-center py-24 text-center px-6">
        <ShieldAlert size={48} className="text-slate-700 mb-4" />
        <p className="text-white font-semibold mb-1">Sem alertas críticos</p>
        <p className="text-slate-400 text-sm">Todos os sistemas operando normalmente</p>
        <div className="flex items-center gap-2 mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-green-400 text-sm font-medium">Operação normal</span>
        </div>
      </div>
    </div>
  )
}
