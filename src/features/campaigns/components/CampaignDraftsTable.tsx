import { Pencil, Trash2 } from 'lucide-react'
import type { CampaignDraftRow } from '@/features/campaigns/types'
import { CAMPAIGN_CHANNEL_LABELS } from '@/features/campaigns/types'
import { formatDate } from '@/shared/lib'

interface CampaignDraftsTableProps {
  drafts: CampaignDraftRow[]
  onEdit: (draft: CampaignDraftRow) => void
  onDelete: (draft: CampaignDraftRow) => void
}

export function CampaignDraftsTable({ drafts, onEdit, onDelete }: CampaignDraftsTableProps) {
  if (drafts.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUM DRAFT</div>
        <p className="mt-2 text-sm text-text-muted">Crie campanhas draft para organizar reengajamento e proximas acoes comerciais.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Draft', 'Canal', 'Segmento', 'Audiencia', 'Agendamento', ''].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr key={draft.id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{draft.name}</div>
                <div className="text-[11px] text-text-muted">{draft.subject ?? draft.message_body ?? 'Sem conteudo definido'}</div>
              </td>
              <td className="table-cell text-xs text-text-secondary">{CAMPAIGN_CHANNEL_LABELS[draft.channel]}</td>
              <td className="table-cell text-xs text-text-secondary">{draft.segment?.name ?? 'Sem segmento'}</td>
              <td className="table-cell font-mono text-brand-acid">{draft.audience_count}</td>
              <td className="table-cell text-[11px] text-text-muted">{draft.scheduled_at ? formatDate(draft.scheduled_at, 'dd/MM/yyyy HH:mm') : '-'}</td>
              <td className="table-cell">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(draft)} className="btn-secondary text-xs"><Pencil className="mr-1 inline h-3 w-3" />Editar</button>
                  <button onClick={() => onDelete(draft)} className="btn-secondary text-xs"><Trash2 className="mr-1 inline h-3 w-3" />Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
