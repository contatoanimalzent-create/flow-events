import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import type { AudienceSegmentRow } from '@/features/campaigns/types'
import { formatDate } from '@/shared/lib'

interface SegmentsTableProps {
  segments: AudienceSegmentRow[]
  onPreview: (segment: AudienceSegmentRow) => void
  onEdit: (segment: AudienceSegmentRow) => void
  onCreateDraft: (segment: AudienceSegmentRow) => void
  onDelete: (segment: AudienceSegmentRow) => void
}

export function SegmentsTable({ segments, onPreview, onEdit, onCreateDraft, onDelete }: SegmentsTableProps) {
  if (segments.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUM PUBLICO SALVO</div>
        <p className="mt-2 text-sm text-text-muted">Estruture segmentos de alto valor para transformar o CRM em audiencias prontas para acao.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Segmento', 'Audiencia', 'Ultima leitura', 'Atualizado', ''].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{segment.name}</div>
                {segment.description ? <div className="text-[11px] text-text-muted">{segment.description}</div> : <div className="text-[11px] text-text-muted">Segmento sem nota editorial.</div>}
              </td>
              <td className="table-cell font-mono text-brand-acid">{segment.audience_count}</td>
              <td className="table-cell text-[11px] text-text-muted">
                {segment.last_previewed_at ? formatDate(segment.last_previewed_at, 'dd/MM/yyyy HH:mm') : 'Ainda nao analisado'}
              </td>
              <td className="table-cell text-[11px] text-text-muted">{formatDate(segment.updated_at, 'dd/MM/yyyy HH:mm')}</td>
              <td className="table-cell">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onPreview(segment)} className="btn-secondary text-xs"><Eye className="mr-1 inline h-3 w-3" />Abrir preview</button>
                  <button onClick={() => onEdit(segment)} className="btn-secondary text-xs"><Pencil className="mr-1 inline h-3 w-3" />Editar</button>
                  <button onClick={() => onCreateDraft(segment)} className="btn-secondary text-xs"><Plus className="mr-1 inline h-3 w-3" />Criar draft</button>
                  <button onClick={() => onDelete(segment)} className="btn-secondary text-xs"><Trash2 className="mr-1 inline h-3 w-3" />Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
