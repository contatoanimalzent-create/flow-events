import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ApiPaginationMeta } from '@/shared/api'
import { useAppLocale } from '@/shared/i18n/app-locale'

interface PaginationControlsProps {
  pagination: ApiPaginationMeta
  onPageChange: (page: number) => void
  compact?: boolean
}

export function PaginationControls({ pagination, onPageChange, compact = false }: PaginationControlsProps) {
  const { t } = useAppLocale()

  if (pagination.total <= pagination.pageSize) {
    return null
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? 'pt-3' : 'border-t border-bg-border px-5 py-4'}`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
        {t('Page', 'Pagina')} {pagination.page} {t('of', 'de')} {pagination.totalPages} · {pagination.total}{' '}
        {t(pagination.total !== 1 ? 'records' : 'record', pagination.total !== 1 ? 'registros' : 'registro')}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          className="btn-secondary flex items-center gap-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t('Previous', 'Anterior')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="btn-secondary flex items-center gap-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('Next', 'Proxima')}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
