import React from 'react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function NotFoundPage({ onNavigate }: PulsePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060d1f] px-6 text-center">
      <p className="text-8xl font-bold leading-none mb-4" style={{ color: '#7C3AED' }}>
        404
      </p>
      <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
      <p className="text-slate-400 text-sm mb-8">
        O endereço que você acessou não existe.
      </p>
      <button
        onClick={() => onNavigate('/pulse')}
        className="bg-[#7C3AED] text-white font-semibold text-sm px-6 py-3 rounded-2xl active:opacity-80 transition-opacity"
      >
        Ir para o início
      </button>
    </div>
  )
}
