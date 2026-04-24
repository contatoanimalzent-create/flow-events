import { Download, Loader2, Plus, Search, Upload, Users } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useStaffActions, useStaffList } from '@/features/staff/hooks'
import { staffKeys, staffQueries } from '@/features/staff/services'
import { STAFF_STATUS_CONFIG } from '@/features/staff/types'
import type { StaffMemberRow, StaffTimeEntryRow } from '@/features/staff/types'
import { ActionConfirmationDialog, PageEmptyState, PageLoadingState, PaginationControls } from '@/shared/components'
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
    allStaff,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    expandedId,
    setExpandedId,
    stats,
    refreshStaff,
    pagination,
    setPage,
  } = useStaffList(organization?.id)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDeleteMember, setPendingDeleteMember] = useState<StaffMemberRow | null>(null)
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
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Operação de pessoas</div>
          <h1 className="admin-title">
            Staff<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Cadastre pessoas da operação, defina área e turno, e libere acesso operacional com clareza. Use Staff para equipe; use Credenciamento para público.
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
              <Plus className="h-4 w-4" /> Cadastrar membro
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: '1. Identificacao',
            description: 'Nome, contato e documento para o time saber exatamente quem esta entrando na operação.',
          },
          {
            title: '2. Alocacao',
            description: 'Defina funcao, área, turno e portaria para a pessoa cair no lugar certo sem retrabalho.',
          },
          {
            title: '3. Acesso',
            description: 'Libere permissões, emita credencial e acompanhe presença direto da mesma área.',
          },
        ].map((item) => (
          <div key={item.title} className="card p-5">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#4285F4]">{item.title}</div>
            <p className="mt-4 text-sm leading-7 text-text-secondary">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[#0057E7]">Quando usar este módulo</div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-medium text-text-primary">Staff</div>
            <div className="mt-2 text-sm leading-7 text-text-muted">Equipe, escala, credencial, presencia e permissão operacional.</div>
          </div>
          <div>
            <div className="font-medium text-text-primary">Credenciamento</div>
            <div className="mt-2 text-sm leading-7 text-text-muted">Fluxo de acesso do público, válidação e leitura de entrada.</div>
          </div>
          <div>
            <div className="font-medium text-text-primary">Fornecedores</div>
            <div className="mt-2 text-sm leading-7 text-text-muted">Parceiros externos, contratos e execução terceirizada.</div>
          </div>
        </div>
      </div>

      {events.length > 1 && (
        <div className="admin-filterbar">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                selectedEventId === event.id ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      )}

      <StaffStatsGrid stats={stats} />

      <div className="admin-filterbar">
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
                statusFilter === status ? 'bg-brand-acid text-white' : 'border border-transparent text-text-muted hover:border-bg-border hover:text-text-primary',
              )}
            >
              {status === 'all' ? 'Todos' : STAFF_STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoadingState title="Carregando staff" description="Buscando equipe, presença e alocacoes operacionais." />
      ) : allStaff.length === 0 ? (
        <PageEmptyState
          title="NENHUM MEMBRO"
          description={search || statusFilter !== 'all' ? 'Nenhum resultado encontrado.' : 'Adicione membros ao staff.'}
          icon={<Users className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            !search && statusFilter === 'all' && canManageStaff ? (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                + Cadastrar membro
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Membro', 'Funcao / Área', 'Status', 'Último ponto', 'Custo', 'Ações'].map((header) => (
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
                  onDelete={() => setPendingDeleteMember(member)}
                  onClockIn={() => void recordPresence(member.id, 'clock_in', member.gate_id ?? null)}
                  onClockOut={() => void recordPresence(member.id, 'clock_out', member.gate_id ?? null)}
                />
              ))}
            </tbody>
          </table>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
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

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteMember)}
        title="Remover membro de staff"
        description={
          pendingDeleteMember
            ? `O cadastro de ${pendingDeleteMember.first_name} ${pendingDeleteMember.last_name} sera removido deste evento.`
            : undefined
        }
        impact="A remocao afeta alocacao, credencial e histórico operacional vinculado a este membro no contexto do evento."
        confirmLabel="Remover membro"
        onCancel={() => setPendingDeleteMember(null)}
        onConfirm={async () => {
          if (!pendingDeleteMember) {
            return
          }

          await deleteStaff(pendingDeleteMember.id)
          setPendingDeleteMember(null)
        }}
      />
    </div>
  )
}
