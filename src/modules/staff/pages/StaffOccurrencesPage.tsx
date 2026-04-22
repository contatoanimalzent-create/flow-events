import React, { useState } from 'react'
import { ChevronLeft, AlertTriangle, Plus, Send, Clock } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface OccurrenceItem { id: number; description: string; type: string; time: string }

const TYPES = ['Incidente', 'Equipamento', 'Participante', 'Acesso', 'Outro']

export default function StaffOccurrencesPage({ onNavigate }: PulsePageProps) {
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [items, setItems] = useState<OccurrenceItem[]>([
    { id: 1, description: 'Participante sem ingresso alegando perda de celular', type: 'Participante', time: '13:45' },
    { id: 2, description: 'Scanner com bateria baixa — trocado por reserva', type: 'Equipamento', time: '13:12' },
  ])

  const handleSubmit = () => {
    if (!description.trim()) return
    setItems((prev) => [
      { id: Date.now(), description, type, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ])
    setDescription('')
    setShowForm(false)
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/staff')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Ocorrências</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-600 rounded-xl text-white text-xs font-semibold"
        >
          <Plus size={14} />
          Nova
        </button>
      </div>

      {/* New occurrence form */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-white text-sm font-semibold">Registrar ocorrência</p>
            {/* Type selector */}
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t ? 'bg-green-600 text-white' : 'bg-white/8 text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o ocorrido..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-slate-300 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send size={14} />
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 font-semibold">
                    {item.type}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock size={10} />
                    {item.time}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
