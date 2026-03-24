import { useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw, Search, UsersRound } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useCrmDashboard, useCrmMutations } from '@/features/crm/hooks'
import { CustomerDetailModal } from '@/features/crm/modals'
import { CRM_CUSTOMER_STATUS_LABELS, CRM_PERIOD_FILTER_LABELS } from '@/features/crm/types'
import type { CustomerListRow } from '@/features/crm/types'
import { PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { cn } from '@/shared/lib'
import { CustomerMetricsGrid } from './CustomerMetricsGrid'
import { CustomersTable } from './CustomersTable'

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
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="reveal flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            CRM<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">
            Customers, relacionamento, historico de compras e presenca por evento
          </p>
        </div>
        <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      <CustomerMetricsGrid summary={dashboard.summary} />

      <div className="reveal flex flex-wrap items-center gap-3">
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
              dashboard.selectedEventId === 'all' ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
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
                dashboard.selectedEventId === event.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>

      <div className="reveal flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dashboard.setStatusFilter('all')}
            className={cn(
              'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
              dashboard.statusFilter === 'all' ? 'bg-brand-blue text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
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
                dashboard.statusFilter === key ? 'bg-brand-blue text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
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
                dashboard.periodFilter === key ? 'bg-brand-purple text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
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
