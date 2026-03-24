import { ChevronRight } from 'lucide-react'
import { CRM_CUSTOMER_STATUS_LABELS } from '@/features/crm/types'
import type { CustomerListRow } from '@/features/crm/types'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

interface CustomersTableProps {
  customers: CustomerListRow[]
  onSelect: (customer: CustomerListRow) => void
}

export function CustomersTable({ customers, onSelect }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUM CUSTOMER</div>
        <p className="mt-2 text-sm text-text-muted">Ajuste os filtros ou aguarde novos pedidos para formar a base de CRM.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Customer', 'Status', 'Pedidos', 'Receita', 'Ticket medio', 'Ultima compra', 'Tags', ''].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="table-row cursor-pointer" onClick={() => onSelect(customer)}>
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{customer.full_name}</div>
                <div className="text-[11px] text-text-muted">{customer.email}</div>
              </td>
              <td className="table-cell">
                <span
                  className={cn(
                    'rounded-sm px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                    customer.status === 'loyal'
                      ? 'bg-status-success/10 text-status-success'
                      : customer.status === 'at_risk'
                        ? 'bg-status-warning/10 text-status-warning'
                        : customer.status === 'inactive'
                          ? 'bg-bg-surface text-text-muted'
                          : 'bg-brand-blue/10 text-brand-blue',
                  )}
                >
                  {CRM_CUSTOMER_STATUS_LABELS[customer.status]}
                </span>
              </td>
              <td className="table-cell font-mono text-text-primary">{customer.total_orders}</td>
              <td className="table-cell font-mono font-semibold text-status-success">{formatCurrency(customer.total_revenue)}</td>
              <td className="table-cell font-mono text-text-secondary">{formatCurrency(customer.average_ticket)}</td>
              <td className="table-cell text-[11px] font-mono text-text-muted">
                {customer.last_purchase_at ? formatDate(customer.last_purchase_at, 'dd/MM/yyyy') : '-'}
              </td>
              <td className="table-cell">
                <div className="flex flex-wrap gap-1">
                  {customer.tags.length > 0 ? customer.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-sm bg-brand-acid/10 px-2 py-1 text-[10px] font-mono text-brand-acid">
                      {tag}
                    </span>
                  )) : <span className="text-[11px] text-text-muted">Sem tags</span>}
                </div>
              </td>
              <td className="table-cell">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="rounded-sm p-2 text-text-muted transition-all hover:bg-bg-surface hover:text-brand-acid"
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(customer)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
