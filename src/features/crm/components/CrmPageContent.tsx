import { useState } from 'react'
import { AlertTriangle, Download, Loader2, RefreshCw, Search, UsersRound } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useCrmDashboard, useCrmMutations } from '@/features/crm/hooks'
import { CustomerDetailModal } from '@/features/crm/modals'
import { CRM_CUSTOMER_STATUS_LABELS, CRM_PERIOD_FILTER_LABELS } from '@/features/crm/types'
import type { CustomerListRow } from '@/features/crm/types'
import { PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { cn, formatCurrency, formatDate } from '@/shared/lib'
import { CustomerMetricsGrid } from './CustomerMetricsGrid'
import { CustomersTable } from './CustomersTable'

function exportCustomersCsv(customers: CustomerListRow[]) {
  const rows = [
    ['Nome', 'E-mail', 'Telefone', 'Status', 'Pedidos', 'Receita Total', 'Ticket Médio', 'Eventos', 'Última compra', 'Tags'],
    ...customers.map(c => [
      c.full_name, c.email, c.phone ?? '', c.status,
      c.total_orders, formatCurrency(c.total_revenue), formatCurrency(c.average_ticket),
      c.attended_events_count,
      c.last_purchase_at ? formatDate(c.last_purchase_at, 'dd/MM/yyyy') : '',
      (c.tags ?? []).join(';'),
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `participantes-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export function CrmPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const dashboard = useCrmDashboard(organization?.id)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListRow | null>(null)
  const mutations = useCrmMutations({
    organizationId: organization?.id,
    selectedCustomerId: selectedCustomer?.id ?? null,
  })

  if (!organization) {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Customer intelligence</div>
          <h1 className="admin-title">
            CRM<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Customers, relacionamento, historico de compras e presenca por evento
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dashboard.allCustomers.length > 0 && (
            <button
              onClick={() => exportCustomersCsv(dashboard.allCustomers)}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
          )}
          <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>
      </div>

      <CustomerMetricsGrid summary={dashboard.summary} />

      <div className="admin-filterbar">
        <div className="relative min-w-[260px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-10 pl-9"
            value={dashboard.search}
            onChange={(event) => dashboard.setSearch(event.target.value)}
            placeholder="Buscar por nome, email ou tag..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dashboard.setSelectedEventId('all')}
            className={cn(
              'rounded-sm px-3 py-2 text-xs font-medium transition-all',
              dashboard.selectedEventId === 'all' ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
            )}
          >
            Todos eventos
          </button>
          {dashboard.events.map((event) => (
            <button
              key={event.id}
              onClick={() => dashboard.setSelectedEventId(event.id)}
              className={cn(
                'rounded-sm px-3 py-2 text-xs font-medium transition-all',
                dashboard.selectedEventId === event.id ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-filterbar">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dashboard.setStatusFilter('all')}
            className={cn(
              'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
              dashboard.statusFilter === 'all' ? 'bg-brand-blue text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
            )}
          >
            Todos status
          </button>
          {Object.entries(CRM_CUSTOMER_STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => dashboard.setStatusFilter(key as keyof typeof CRM_CUSTOMER_STATUS_LABELS)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.statusFilter === key ? 'bg-brand-blue text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(CRM_PERIOD_FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => dashboard.setPeriodFilter(key as keyof typeof CRM_PERIOD_FILTER_LABELS)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.periodFilter === key ? 'bg-brand-purple text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {dashboard.loading ? (
        <PageLoadingState title="Carregando CRM" description="Consolidando clientes, tags e historico de relacionamento." />
      ) : dashboard.error ? (
        <PageErrorState title="ERRO AO CARREGAR CRM" description={dashboard.error} icon={<AlertTriangle className="mb-3 h-10 w-10 text-status-error" />} />
      ) : dashboard.allCustomers.length === 0 ? (
        <PageEmptyState
          title="NENHUM CUSTOMER ENCONTRADO"
          description="Assim que os pedidos e check-ins acontecerem, a base de CRM aparece aqui."
          icon={<UsersRound className="mb-3 h-10 w-10 text-text-muted" />}
        />
      ) : (
        <div className="space-y-3">
          <CustomersTable customers={dashboard.customers} onSelect={(customer) => setSelectedCustomer(customer)} />
          <PaginationControls pagination={dashboard.pagination} onPageChange={dashboard.setPage} />
        </div>
      )}

      {selectedCustomer ? (
        <CustomerDetailModal
          organizationId={organization.id}
          customer={selectedCustomer}
          savingNotes={mutations.savingNotes}
          savingTags={mutations.savingTags}
          onClose={() => setSelectedCustomer(null)}
          onSaveNotes={async (notes) => {
            await mutations.updateNotes({
              organizationId: organization.id,
              customerId: selectedCustomer.id,
              notes,
            })
          }}
          onSaveTags={async (tags) => {
            await mutations.updateTags({
              organizationId: organization.id,
              customerId: selectedCustomer.id,
              tags,
            })
          }}
        />
      ) : null}
    </div>
  )
}
}