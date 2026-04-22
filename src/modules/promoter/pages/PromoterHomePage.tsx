import React, { useState } from 'react'
import { Copy, Share2, Check, ShoppingCart, DollarSign, Trophy, Target } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const PROMOTER = { code: 'CARLOS20', discount: 20, commission: 15, totalSales: 42, totalRevenue: 8_400, totalCommission: 1_260 }

/** Deterministic QR-like 10×10 from code string */
function MiniQr({ code }: { code: string }) {
  const cells = Array.from({ length: 100 }, (_, i) => {
    const c = code.charCodeAt(i % code.length)
    return ((i * 11 + c * 7) % 31) > 12
  })
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: 80 }}>
      {cells.map((f, i) => (
        <div key={i} className="aspect-square rounded-[1px]" style={{ backgroundColor: f ? '#F97316' : 'transparent' }} />
      ))}
    </div>
  )
}

export default function PromoterHomePage({ onNavigate }: PulsePageProps) {
  const [copied, setCopied] = useState(false)
  const context = useAppContext((s) => s.context)

  const link = `https://evento.app/e/${context?.eventName?.toLowerCase().replace(/\s+/g, '-') ?? 'evento'}?ref=${PROMOTER.code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Meu link de indicação', url: link })
    } else {
      handleCopy()
    }
  }

  const stats = [
    { label: 'Vendas', value: PROMOTER.totalSales, icon: ShoppingCart, path: '/pulse/promoter/sales', color: '#F97316' },
    { label: 'Receita', value: `R$ ${(PROMOTER.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, path: '/pulse/promoter/commission', color: '#22C55E' },
    { label: 'Comissão', value: `R$ ${PROMOTER.totalCommission.toLocaleString('pt-BR')}`, icon: Trophy, path: '/pulse/promoter/commission', color: '#d97706' },
    { label: 'Meta', value: '84%', icon: Target, path: '/pulse/promoter/goals', color: '#7C3AED' },
  ]

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-slate-400 text-sm">Central de Vendas</p>
        <h2 className="text-xl font-bold text-white mt-0.5">{context?.eventName}</h2>
      </div>

      {/* Code card */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-br from-orange-900/40 to-slate-900 border border-orange-500/20 rounded-2xl p-5">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3">Meu código</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white font-mono font-black text-4xl tracking-widest">{PROMOTER.code}</p>
              <p className="text-slate-400 text-xs mt-1">
                {PROMOTER.discount}% de desconto · {PROMOTER.commission}% de comissão
              </p>
            </div>
            <div className="ml-auto">
              <MiniQr code={PROMOTER.code} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-green-600/20 border-green-500/30 text-green-400'
                  : 'bg-white/8 border-white/10 text-white'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {stats.map(({ label, value, icon: Icon, path, color }) => (
          <button
            key={label}
            onClick={() => onNavigate(path)}
            className="bg-white/5 border border-white/8 rounded-2xl p-4 text-left active:bg-white/10 transition-all"
          >
            <Icon size={20} style={{ color }} className="mb-2" />
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
