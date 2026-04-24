import React, { useState, useEffect } from 'react'
import { Copy, Share2, Check, ShoppingCart, DollarSign, Trophy, Target, Loader2 } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { promoterService } from '@/core/promoter/promoter.service'
import { supabase } from '@/lib/supabase'
import type { PromoterStats } from '@/core/promoter/promoter.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function PromoterHomePage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [stats, setStats] = useState<PromoterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !context?.eventId) { setLoading(false); return }
      try {
        const s = await promoterService.getStats(user.id, context.eventId)
        setStats(s)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.eventId])

  const handleCopy = () => {
    const text = stats?.myCode ?? stats?.myLink ?? ''
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShare = () => {
    const text = stats?.myLink ?? `Código: ${stats?.myCode}`
    if (!text) return
    if (navigator.share) {
      navigator.share({ title: 'Meu link de promoter', text, url: stats?.myLink ?? undefined })
    } else {
      handleCopy()
    }
  }

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-slate-400 text-xs">Promoter</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName ?? '-'}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-orange-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* My code/link card */}
          {(stats?.myCode || stats?.myLink) && (
            <div className="px-4 mb-5">
              <div className="bg-gradient-to-br from-orange-900/40 to-amber-900/20 border border-orange-500/20 rounded-2xl p-4">
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">Meu código / link</p>
                {stats.myCode && (
                  <p className="text-white font-mono font-bold text-2xl mb-1">{stats.myCode}</p>
                )}
                {stats.myLink && (
                  <p className="text-slate-400 text-xs truncate mb-3">{stats.myLink}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="px-4 grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Vendas hoje', value: stats?.salesToday ?? 0, Icon: ShoppingCart, color: '#F97316' },
              { label: 'Vendas total', value: stats?.salesTotal ?? 0, Icon: Trophy, color: '#d97706' },
              { label: 'Receita hoje', value: fmt(stats?.revenueToday ?? 0), Icon: DollarSign, color: '#22C55E' },
              { label: 'Receita total', value: fmt(stats?.revenueTotal ?? 0), Icon: Target, color: '#4285F4' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <Icon size={18} style={{ color }} className="mb-2" />
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Conversion + average */}
          <div className="px-4 grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Taxa de conversão</p>
              <p className="text-white font-bold text-2xl">{stats?.conversionRate ?? 0}%</p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Ticket médio</p>
              <p className="text-white font-bold text-2xl">{fmt(stats?.averageTicket ?? 0)}</p>
            </div>
          </div>

          {/* Quick nav */}
          <div className="px-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Minhas Vendas', path: '/pulse/promoter/sales', Icon: ShoppingCart },
              { label: 'Comissão', path: '/pulse/promoter/commission', Icon: DollarSign },
              { label: 'Ranking', path: '/pulse/promoter/ranking', Icon: Trophy },
              { label: 'Metas', path: '/pulse/promoter/goals', Icon: Target },
            ].map(({ label, path, Icon }) => (
              <button
                key={path}
                onClick={() => onNavigate(path)}
                className="bg-white/5 border border-white/8 rounded-2xl p-4 text-left active:opacity-80 transition-opacity flex items-center gap-3"
              >
                <Icon size={18} className="text-orange-400 shrink-0" />
                <p className="text-white text-sm font-medium">{label}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
