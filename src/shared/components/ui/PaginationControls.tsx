import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ApiPaginationMeta } from '@/shared/api'

interface PaginationControlsProps {
  pagination: ApiPaginationMeta
  onPageChange: (page: number) => void
  compact?: boolean
}

export function PaginationControls({ pagination, onPageChange, compact = false }: PaginationControlsProps) {
  if (pagination.total <= pagination.pageSize) {
    return null
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? 'pt-3' : 'border-t border-bg-border px-5 py-4'}`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
        Pagina {pagination.page} de {pagination.totalPages} · {pagination.total} registro{pagination.total !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          className="btn-secondary flex items-center gap-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="btn-secondary flex items-center gap-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proxima
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
