import { Download, Loader2, Plus, Search, Upload, Users } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useStaffActions, useStaffList } from '@/features/staff/hooks'
import { staffKeys, staffQueries } from '@/features/staff/services'
import { STAFF_STATUS_CONFIG } from '@/features/staff/types'
import type { StaffTimeEntryRow } from '@/features/staff/types'
import { PageEmptyState, PageLoadingState } from '@/shared/components'
import { cn } from '@/shared/lib'
import { StaffFormModal } from '@/features/staff/modals'
import { StaffStatsGrid } from './StaffStatsGrid'
import { StaffMemberTableRow } from './StaffMemberRow'

export function StaffPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const access = useAccessControl()
  const canManageStaff = access.can('staff', 'manage')
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    staff,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    expandedId,
    setExpandedId,
    stats,
    refreshStaff,
  } = useStaffList(organization?.id)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { updateStatus, issueCredential, deleteStaff, recordPresence } = useStaffActions(selectedEventId)

  const staffTimeEntriesQueries = useQueries({
    queries: staff.map((member) => ({
      ...(selectedEventId && expandedId === member.id
        ? staffQueries.timeEntries(member.id, selectedEventId)
        : { queryKey: staffKeys.timeEntries(member.id, selectedEventId || 'empty'), queryFn: async () => [] as StaffTimeEntryRow[] }),
      enabled: Boolean(selectedEventId && expandedId === member.id),
    })),
  })

  const timeEntriesMap = staff.reduce<Record<string, StaffTimeEntryRow[]>>((accumulator, member, index) => {
    accumulator[member.id] = staffTimeEntriesQueries[index]?.data ?? []
    return accumulator
  }, {})

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            STAFF<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">
            {stats.total} membro{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> Importar
          </button>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          {canManageStaff ? (
            <button
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          ) : null}
        </div>
      </div>

      {events.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                selectedEventId === event.id ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      )}

      <StaffStatsGrid stats={stats} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-9 pl-9 text-sm"
            placeholder="Buscar por nome, e-mail ou funcao..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'invited', 'confirmed', 'active', 'no_show', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                statusFilter === status ? 'bg-brand-acid text-bg-primary' : 'border border-transparent text-text-muted hover:border-bg-border hover:text-text-primary',
              )}
            >
              {status === 'all' ? 'Todos' : STAFF_STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoadingState title="Carregando staff" description="Buscando equipe, presenca e alocacoes operacionais." />
      ) : staff.length === 0 ? (
        <PageEmptyState
          title="NENHUM MEMBRO"
          description={search || statusFilter !== 'all' ? 'Nenhum resultado encontrado.' : 'Adicione membros ao staff.'}
          icon={<Users className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            !search && statusFilter === 'all' && canManageStaff ? (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                + Adicionar
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Membro', 'Funcao / Area', 'Status', 'Ultimo ponto', 'Custo', 'Acoes'].map((header) => (
                  <th key={header} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <StaffMemberTableRow
                  key={member.id}
                  member={member}
                  expanded={expandedId === member.id}
                  timeEntries={timeEntriesMap[member.id] ?? []}
                  onToggleExpand={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  onStatusChange={(nextStatus) => void updateStatus(member.id, nextStatus)}
                  onIssueCredential={() => void issueCredential(member.id)}
                  onEdit={() => {
                    setEditingId(member.id)
                    setShowForm(true)
                  }}
                  onDelete={() => void deleteStaff(member.id)}
                  onClockIn={() => void recordPresence(member.id, 'clock_in', member.gate_id ?? null)}
                  onClockOut={() => void recordPresence(member.id, 'clock_out', member.gate_id ?? null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && organization && selectedEventId && (
        <StaffFormModal
          eventId={selectedEventId}
          organizationId={organization.id}
          staffId={editingId}
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
          }}
          onSaved={() => {
            void refreshStaff()
            setShowForm(false)
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}
