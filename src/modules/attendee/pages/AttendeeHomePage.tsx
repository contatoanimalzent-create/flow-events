import React from 'react'
import { Ticket, Calendar, Map, Rss, Users, Sparkles } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface Card { title: string; subtitle: string; icon: React.ComponentType<{size?:number;className?:string}>; color: string; path: string; large?: boolean }

const CARDS: Card[] = [
  { title: 'Meu Ingresso', subtitle: 'Ver QR Code', icon: Ticket, color: '#4285F4', path: '/pulse/attendee/tickets', large: true },
  { title: 'Agenda', subtitle: 'Programação', icon: Calendar, color: '#1e293b', path: '/pulse/attendee/agenda' },
  { title: 'Mapa', subtitle: 'Planta do evento', icon: Map, color: '#1e293b', path: '/pulse/attendee/map' },
  { title: 'Feed', subtitle: 'Novidades', icon: Rss, color: '#1e293b', path: '/pulse/attendee/feed' },
  { title: 'Networking', subtitle: 'Conectar', icon: Users, color: '#1e293b', path: '/pulse/attendee/networking' },
  { title: 'Upgrades', subtitle: 'Ofertas exclusivas', icon: Sparkles, color: '#78350f', path: '/pulse/attendee/upgrades' },
]

export default function AttendeeHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)

  return (
    <div className="pb-6">
      {/* Hero */}
      <div
        className="relative px-4 pt-6 pb-6 mb-2"
        style={{
          background: context?.eventCover
            ? `linear-gradient(to bottom, #060d1f00, #060d1f), url(${context.eventCover}) center/cover`
            : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        }}
      >
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Bem-vindo</p>
        <h2 className="text-2xl font-bold text-white">{context?.eventName}</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {context?.eventDate ? new Date(context.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : ''}
        </p>
      </div>

      {/* Next session pill */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Próxima sessão em 32min</p>
            <p className="text-slate-400 text-xs">Abertura Oficial · Palco Principal</p>
          </div>
          <button
            onClick={() => onNavigate('/pulse/attendee/agenda')}
            className="text-blue-400 text-xs font-medium shrink-0"
          >
            Ver agenda
          </button>
        </div>
      </div>

      {/* Quick access */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.title}
              onClick={() => onNavigate(card.path)}
              className={`rounded-2xl p-4 text-left active:opacity-80 transition-opacity ${card.large ? 'col-span-2' : ''}`}
              style={{ backgroundColor: card.color + 'CC', border: `1px solid ${card.color}44` }}
            >
              <Icon size={card.large ? 28 : 22} className="text-white/80 mb-3" />
              <p className="text-white font-bold text-sm">{card.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{card.subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
