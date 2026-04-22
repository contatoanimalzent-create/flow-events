import React, { useState } from 'react'
import { ChevronLeft, Heart, MessageSquare, Send, Megaphone } from 'lucide-react'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const POSTS = [
  { id: 1, author: 'Organização', avatar: '🎪', official: true, text: 'O credenciamento já está aberto! Dirija-se à Portaria Principal com seu QR Code.', time: '09:05', likes: 42 },
  { id: 2, author: 'João Silva', avatar: '👤', official: false, text: 'Esse evento está incrível! A palestra de IA foi top demais 🚀', time: '10:45', likes: 8 },
  { id: 3, author: 'Organização', avatar: '🎪', official: true, text: 'Lembrete: A keynote principal começa em 15 minutos no Palco Principal!', time: '15:45', likes: 31 },
  { id: 4, author: 'Ana Lima', avatar: '👤', official: false, text: 'Alguém para trocar contatos? Sou da área de marketing digital.', time: '11:20', likes: 3 },
]

export default function FeedPage({ onNavigate }: PulsePageProps) {
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [compose, setCompose] = useState('')

  const toggleLike = (id: number) => setLiked((s) => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns })

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Feed</h1>
      </div>

      {/* Compose */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm shrink-0">👤</div>
          <input
            type="text"
            value={compose}
            onChange={(e) => setCompose(e.target.value)}
            placeholder="Compartilhe sua experiência..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 outline-none"
          />
          {compose && (
            <button
              onClick={() => setCompose('')}
              className="shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"
            >
              <Send size={12} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 px-4 space-y-3">
        {POSTS.map((post) => (
          <div
            key={post.id}
            className={`rounded-2xl border p-4 ${post.official ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/8 bg-white/4'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{post.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">{post.author}</p>
                  {post.official && (
                    <Megaphone size={12} className="text-blue-400" />
                  )}
                </div>
                <p className="text-slate-500 text-xs">{post.time}</p>
              </div>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed mb-3">{post.text}</p>
            <div className="flex gap-4">
              <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 text-xs">
                <Heart size={14} className={liked.has(post.id) ? 'text-red-400 fill-red-400' : 'text-slate-600'} />
                <span className={liked.has(post.id) ? 'text-red-400' : 'text-slate-500'}>
                  {post.likes + (liked.has(post.id) ? 1 : 0)}
                </span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500 text-xs">
                <MessageSquare size={14} />
                Responder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
