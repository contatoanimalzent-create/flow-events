import React, { useState } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const INSTRUCTIONS = [
  {
    title: 'Procedimentos de entrada',
    content: 'Solicitar o QR Code do ingresso ao participante. Verificar documento de identidade com foto para ingressos VIP. Em caso de dúvida, acionar o supervisor imediatamente.',
  },
  {
    title: 'Situações de emergência',
    content: 'Em caso de incidente, acionar o código de emergência via rádio canal 3. Não intervir fisicamente em conflitos. Preservar a cena e aguardar a equipe de segurança.',
  },
  {
    title: 'Posicionamento da equipe',
    content: 'Portaria principal: 2 operadores de scanner, 1 orientador de fila. Portaria lateral: 1 operador. Não abandonar o posto sem comunicar o supervisor.',
  },
  {
    title: 'Uso do equipamento',
    content: 'Manter o aparelho carregado acima de 30%. Em caso de falha no scanner, usar a verificação manual. Reportar qualquer problema técnico via ocorrência.',
  },
]

export default function StaffInstructionsPage({ onNavigate }: PulsePageProps) {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Instruções</h1>
      </div>

      <div className="px-4 space-y-2">
        {INSTRUCTIONS.map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
            >
              <FileText size={16} className="text-green-400 shrink-0" />
              <p className="text-white text-sm font-semibold flex-1">{item.title}</p>
              {expanded === i
                ? <ChevronUp size={16} className="text-slate-500 shrink-0" />
                : <ChevronDown size={16} className="text-slate-500 shrink-0" />
              }
            </button>
            {expanded === i && (
              <div className="px-4 pb-4">
                <p className="text-slate-300 text-sm leading-relaxed">{item.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
