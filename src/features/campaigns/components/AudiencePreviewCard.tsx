import type { CampaignAudiencePreview } from '@/features/campaigns/types'
import { formatCurrency } from '@/shared/lib'

interface AudiencePreviewCardProps {
  preview: CampaignAudiencePreview | null
}

export function AudiencePreviewCard({ preview }: AudiencePreviewCardProps) {
  if (!preview) {
    return (
      <div className="card p-5 text-sm text-text-muted">
        Configure as regras para ver o preview da audiencia.
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Preview da audiencia</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase text-text-muted">Audience</div>
          <div className="text-2xl font-bold text-brand-acid">{preview.audience_count}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-text-muted">Receita</div>
          <div className="text-xl font-bold text-status-success">{formatCurrency(preview.total_revenue)}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-text-muted">Ticket medio</div>
          <div className="text-lg font-bold text-brand-blue">{formatCurrency(preview.average_ticket)}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-text-muted">No-show</div>
          <div className="text-lg font-bold text-status-warning">{preview.no_show_customers}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {preview.sample_customers.map((customer) => (
          <div key={customer.customer_record_id} className="rounded-sm border border-bg-border bg-bg-surface p-3">
            <div className="text-sm font-medium text-text-primary">{customer.full_name}</div>
            <div className="text-[11px] text-text-muted">{customer.email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
