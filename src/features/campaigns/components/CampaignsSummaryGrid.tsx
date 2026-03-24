import { Users, Layers3, FileText, BadgeDollarSign, RadioTower } from 'lucide-react'

interface CampaignsSummaryGridProps {
  summary: {
    saved_segments: number
    draft_campaigns: number
    active_runs: number
    addressable_customers: number
    high_value_customers: number
  }
}

export function CampaignsSummaryGrid({ summary }: CampaignsSummaryGridProps) {
  const cards = [
    { label: 'Segmentos salvos', value: summary.saved_segments, icon: Layers3, color: 'text-brand-acid' },
    { label: 'Drafts', value: summary.draft_campaigns, icon: FileText, color: 'text-brand-blue' },
    { label: 'Execucoes ativas', value: summary.active_runs, icon: RadioTower, color: 'text-status-warning' },
    { label: 'Audiencia ativa', value: summary.addressable_customers, icon: Users, color: 'text-status-success' },
    { label: 'High value', value: summary.high_value_customers, icon: BadgeDollarSign, color: 'text-brand-purple' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString('pt-BR')}</div>
          </div>
        )
      })}
    </div>
  )
}
