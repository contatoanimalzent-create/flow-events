import { Pencil, Play, Trash2 } from 'lucide-react'
import type { CampaignDraftRow } from '@/features/campaigns/types'
import { CAMPAIGN_CHANNEL_LABELS } from '@/features/campaigns/types'
import { formatDate } from '@/shared/lib'

interface CampaignDraftsTableProps {
  drafts: CampaignDraftRow[]
  onEdit: (draft: CampaignDraftRow) => void
  onDelete: (draft: CampaignDraftRow) => void
  onLaunch: (draft: CampaignDraftRow) => void
  launchingDraftId?: string | null
}

export function CampaignDraftsTable({ drafts, onEdit, onDelete, onLaunch, launchingDraftId }: CampaignDraftsTableProps) {
  if (drafts.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUMA CAMPANHA EM PREPARO</div>
        <p className="mt-2 text-sm text-text-muted">Monte o próximo disparo com calma e deixe a operação pronta para lancar no melhor momento.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Campanha', 'Canal', 'Segmento', 'Audiencia', 'Janela', ''].map((header) => (
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
                <div className="text-[11px] text-text-muted">{draft.subject ?? draft.message_body ?? 'Conteúdo editorial ainda em construção'}</div>
              </td>
              <td className="table-cell text-xs text-text-secondary">{CAMPAIGN_CHANNEL_LABELS[draft.channel]}</td>
              <td className="table-cell text-xs text-text-secondary">{draft.segment?.name ?? 'Segmento livre'}</td>
              <td className="table-cell font-mono text-brand-acid">{draft.audience_count}</td>
              <td className="table-cell text-[11px] text-text-muted">{draft.scheduled_at ? formatDate(draft.scheduled_at, 'dd/MM/yyyy HH:mm') : 'Sem horário definido'}</td>
              <td className="table-cell">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onLaunch(draft)} disabled={launchingDraftId === draft.id} className="btn-secondary text-xs">
                    <Play className="mr-1 inline h-3 w-3" />
                    {launchingDraftId === draft.id ? 'Lancando...' : 'Lancar'}
                  </button>
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
