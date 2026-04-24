import { useEffect, useState } from 'react'
import { ClipboardList, Shield, Swords, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'

interface InscricoesStats {
  total: number
  coalizao: number
  alianca: number
  confirmados: number
}

export function DashboardInscricoesPanel() {
  const [stats, setStats] = useState<InscricoesStats>({ total: 0, coalizao: 0, alianca: 0, confirmados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('inscricoes').select('exercito,confirmado')
      if (!data) { setLoading(false); return }
      setStats({
        total: data.length,
        coalizao: data.filter((r) => r.exercito === 'COALIZAO').length,
        alianca: data.filter((r) => r.exercito === 'ALIANCA').length,
        confirmados: data.filter((r) => r.confirmado).length,
      })
      setLoading(false)
    }
    void load()
  }, [])

  const items = [
    { label: 'Total inscritos', value: stats.total,      icon: ClipboardList, color: 'text-text-primary', bg: 'bg-bg-border/40' },
    { label: 'COALIZAO',        value: stats.coalizao,   icon: Shield,        color: 'text-[#FACC15]',    bg: 'bg-[#FACC15]/8' },
    { label: 'ALIANCA',         value: stats.alianca,    icon: Swords,        color: 'text-[#0EA5E9]',    bg: 'bg-[#0EA5E9]/8' },
    { label: 'Confirmados',     value: stats.confirmados, icon: UserCheck,    color: 'text-status-success', bg: 'bg-status-success/8' },
  ]

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Capital Strike, A Origem</div>
        <span className="rounded-full border border-bg-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Inscrições externas
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-text-muted">
          <span className="h-3 w-3 animate-spin rounded-full border border-brand-acid border-t-transparent" />
          Carregando...
        </div>
      ) : stats.total === 0 ? (
        <div className="py-4 text-sm text-text-muted">Nenhuma inscrição registrada ainda.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className={cn('flex flex-col gap-1.5 rounded-sm border border-bg-border p-3', item.bg)}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{item.label}</span>
                  <Icon className={cn('h-3.5 w-3.5', item.color)} />
                </div>
                <div className={cn('font-mono text-xl font-bold', item.color)}>{item.value}</div>
                <div className="text-[10px] text-text-muted">
                  {item.label !== 'Total inscritos'
                    ? `${stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}% do total`
                    : `${stats.total} participantes`}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && stats.total > 0 ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-border">
            <div className="h-full bg-[#FACC15] transition-all" style={{ width: `${(stats.coalizao / stats.total) * 100}%` }} />
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-border">
            <div className="h-full bg-[#0EA5E9] transition-all" style={{ width: `${(stats.alianca / stats.total) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] text-text-muted">{stats.coalizao} vs {stats.alianca}</span>
        </div>
      ) : null}
    </div>
  )
}
