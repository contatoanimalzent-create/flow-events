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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="metric-card min-h-[148px]">
            <div className="flex items-start justify-between gap-3">
              <span className="metric-label">{card.label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-secondary">
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className={`metric-value text-[1.95rem] ${card.color}`}>{card.value.toLocaleString('pt-BR')}</div>
            <div className="mt-3 text-[11px] text-text-muted">Leitura comercial, segmentação e execução.</div>
          </div>
        )
      })}
    </div>
  )
}
