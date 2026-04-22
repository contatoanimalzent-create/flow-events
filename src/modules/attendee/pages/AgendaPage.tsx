import React, { useState } from 'react'
import { ChevronLeft, Clock, MapPin, Heart } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const STAGES = ['Todos', 'Palco Principal', 'Sala A', 'Sala B', 'Workshop']

const SESSIONS = [
  { id: 1, title: 'Abertura Oficial', speaker: 'Comitê Organizador', stage: 'Palco Principal', time: '09:00', duration: '60min', liked: false, now: false },
  { id: 2, title: 'IA no Futuro dos Eventos', speaker: 'Dr. Ana Lima', stage: 'Palco Principal', time: '10:30', duration: '45min', liked: true, now: true },
  { id: 3, title: 'Marketing Digital 2026', speaker: 'Carlos Neves', stage: 'Sala A', time: '10:30', duration: '45min', liked: false, now: false },
  { id: 4, title: 'Workshop: Vendas B2B', speaker: 'Maria Oliveira', stage: 'Workshop', time: '14:00', duration: '90min', liked: false, now: false },
  { id: 5, title: 'Keynote: Futuro do Trabalho', speaker: 'Paulo Carvalho', stage: 'Palco Principal', time: '16:00', duration: '60min', liked: false, now: false },
  { id: 6, title: 'Encerramento', speaker: 'Comitê Organizador', stage: 'Palco Principal', time: '18:00', duration: '30min', liked: false, now: false },
]

export default function AgendaPage({ onNavigate }: PulsePageProps) {
  const [stage, setStage] = useState('Todos')
  const [liked, setLiked] = useState<Set<number>>(new Set(SESSIONS.filter((s) => s.liked).map((s) => s.id)))

  const filtered = stage === 'Todos' ? SESSIONS : SESSIONS.filter((s) => s.stage === stage)

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Agenda</h1>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${stage === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sessions */}
      <div className="flex-1 px-4 space-y-2">
        {filtered.map((session) => (
          <div
            key={session.id}
            className={`rounded-2xl border p-4 ${session.now ? 'border-blue-500/30 bg-blue-500/8' : 'border-white/8 bg-white/4'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {session.now && (
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">
                      Agora
                    </span>
                  )}
                  <p className="text-white font-semibold text-sm truncate">{session.title}</p>
                </div>
                <p className="text-slate-400 text-xs mb-2">{session.speaker}</p>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock size={10} />
                    {session.time} · {session.duration}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin size={10} />
                    {session.stage}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setLiked((s) => {
                  const ns = new Set(s)
                  ns.has(session.id) ? ns.delete(session.id) : ns.add(session.id)
                  return ns
                })}
                className="shrink-0 p-1.5"
              >
                <Heart
                  size={18}
                  className={liked.has(session.id) ? 'text-red-400 fill-red-400' : 'text-slate-600'}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
