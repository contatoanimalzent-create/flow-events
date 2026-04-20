import type { DashboardCustomerRankingRow } from '@/features/dashboard/types'
import { formatCurrency, formatDate } from '@/shared/lib'

interface DashboardCustomerRankingTableProps {
  rows: DashboardCustomerRankingRow[]
}

export function DashboardCustomerRankingTable({ rows }: DashboardCustomerRankingTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-bg-border px-4 py-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Ranking de clientes</div>
      </div>
      {rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-text-muted">Nenhum cliente com receita suficiente para rankear no periodo.</div>
      ) : (
        <div className="table-scroll">
        <table className="w-full">
          <thead className="border-b border-bg-border">
            <tr>
              {['Cliente', 'Pedidos', 'Receita', 'Status', 'Ultima compra'].map((header) => (
                <th key={header} className="table-header">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.customer_id} className="table-row">
                <td className="table-cell">
                  <div className="text-[13px] font-medium text-text-primary">{row.full_name}</div>
                  <div className="text-[11px] text-text-muted">{row.email}</div>
                </td>
                <td className="table-cell font-mono text-text-primary">{row.total_orders}</td>
                <td className="table-cell font-mono text-status-success">{formatCurrency(row.total_revenue)}</td>
                <td className="table-cell text-xs uppercase text-text-secondary">{row.status}</td>
                <td className="table-cell text-[11px] font-mono text-text-muted">{row.last_purchase_at ? formatDate(row.last_purchase_at, 'dd/MM/yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
