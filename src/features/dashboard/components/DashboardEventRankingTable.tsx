import type { DashboardEventRankingRow } from '@/features/dashboard/types'
import { formatCurrency, formatDate } from '@/shared/lib'

interface DashboardEventRankingTableProps {
  rows: DashboardEventRankingRow[]
}

export function DashboardEventRankingTable({ rows }: DashboardEventRankingTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-bg-border px-4 py-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Ranking de eventos</div>
      </div>
      {rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-text-muted">Nenhum evento encontrado para o filtro selecionado.</div>
      ) : (
        <table className="w-full">
          <thead className="border-b border-bg-border">
            <tr>
              {['Evento', 'Bruta', 'Liquida', 'Resultado', 'Margem'].map((header) => (
                <th key={header} className="table-header">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.event_id} className="table-row">
                <td className="table-cell">
                  <div className="text-[13px] font-medium text-text-primary">{row.event_name}</div>
                  <div className="text-[11px] text-text-muted">{formatDate(row.starts_at, 'dd/MM/yyyy')}</div>
                </td>
                <td className="table-cell font-mono text-text-primary">{formatCurrency(row.gross_sales)}</td>
                <td className="table-cell font-mono text-status-success">{formatCurrency(row.net_sales)}</td>
                <td className="table-cell font-mono text-brand-acid">{formatCurrency(row.result)}</td>
                <td className="table-cell font-mono text-text-secondary">{row.margin_percent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
