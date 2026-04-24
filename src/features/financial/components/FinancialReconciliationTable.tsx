import { cn, formatCurrency, formatDate } from '@/shared/lib'
import type { FinancialReconciliationRow } from '@/features/financial/types'

interface FinancialReconciliationTableProps {
  rows: FinancialReconciliationRow[]
  selectedEventId: string
}

export function FinancialReconciliationTable({ rows, selectedEventId }: FinancialReconciliationTableProps) {
  const filteredRows = selectedEventId === 'all' ? rows : rows.filter((row) => row.event_id === selectedEventId)

  if (filteredRows.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">SEM DIVERGENCIAS</div>
        <p className="mt-2 text-sm text-text-muted">Nenhuma pendencia de conciliação encontrada para o filtro atual.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Evento', 'Comprador', 'Valor', 'Pedido', 'Pagamento', 'Status', 'Criado em'].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.order_id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{row.event_name}</div>
                <div className="text-[11px] text-text-muted">#{row.order_id.slice(0, 8).toUpperCase()}</div>
              </td>
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{row.buyer_name || 'Sem nome'}</div>
                <div className="text-[11px] text-text-muted">{row.buyer_email}</div>
              </td>
              <td className="table-cell font-mono font-semibold text-brand-acid">{formatCurrency(row.amount)}</td>
              <td className="table-cell text-xs text-text-secondary">{row.order_status}</td>
              <td className="table-cell text-xs text-text-secondary">
                {row.payment_status ?? 'sem pagamento'}
                {row.payment_provider ? <div className="text-[10px] text-text-muted">{row.payment_provider}</div> : null}
              </td>
              <td className="table-cell">
                <span
                  className={cn(
                    'badge text-[10px]',
                    row.reconciliation_status === 'matched'
                      ? 'badge-success'
                      : row.reconciliation_status === 'pending'
                        ? 'badge-blue'
                        : 'badge-warning',
                  )}
                >
                  {row.issue_label}
                </span>
              </td>
              <td className="table-cell text-[11px] font-mono text-text-muted">{formatDate(row.created_at, 'dd/MM/yy HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
