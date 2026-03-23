import { Clock, Edit2, LogIn, LogOut, QrCode, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/shared/lib'
import { STAFF_STATUS_CONFIG } from '@/features/staff/types'
import type { StaffMemberRow, StaffStatus, StaffTimeEntryRow } from '@/features/staff/types'

interface StaffMemberRowProps {
  member: StaffMemberRow
  expanded: boolean
  timeEntries: StaffTimeEntryRow[]
  onToggleExpand: () => void
  onStatusChange: (status: StaffStatus) => void
  onIssueCredential: () => void
  onEdit: () => void
  onDelete: () => void
  onClockIn: () => void
  onClockOut: () => void
}

export function StaffMemberTableRow({
  member,
  expanded,
  timeEntries,
  onToggleExpand,
  onStatusChange,
  onIssueCredential,
  onEdit,
  onDelete,
  onClockIn,
  onClockOut,
}: StaffMemberRowProps) {
  const lastEntry = timeEntries[0]

  return (
    <>
      <tr className="table-row">
        <td className="table-cell">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brand-acid/15">
              <span className="text-xs font-bold text-brand-acid">
                {member.first_name?.[0]}
                {member.last_name?.[0]}
              </span>
            </div>
            <div>
              <div className="text-[13px] font-medium">
                {member.first_name} {member.last_name}
              </div>
              <div className="text-[11px] text-text-muted">{member.email}</div>
            </div>
          </div>
        </td>
        <td className="table-cell">
          <div className="text-sm">{member.role_title || '—'}</div>
          <div className="text-[11px] text-text-muted">{[member.department, member.area, member.gate?.name].filter(Boolean).join(' · ')}</div>
        </td>
        <td className="table-cell">
          <select
            value={member.status}
            onChange={(event) => onStatusChange(event.target.value as StaffStatus)}
            className={cn(
              'cursor-pointer rounded-sm border border-bg-border bg-transparent px-2 py-1 text-xs font-medium outline-none',
              STAFF_STATUS_CONFIG[member.status]?.color ?? 'text-text-muted',
            )}
          >
            {Object.entries(STAFF_STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status} className="bg-bg-card text-text-primary">
                {config.label}
              </option>
            ))}
          </select>
        </td>
        <td className="table-cell">
          {lastEntry ? (
            <div>
              <div className={cn('text-xs font-medium', lastEntry.type === 'clock_in' ? 'text-status-success' : 'text-status-error')}>
                {lastEntry.type === 'clock_in' ? '● Entrada' : '○ Saida'}
              </div>
              <div className="text-[10px] font-mono text-text-muted">{formatDate(lastEntry.recorded_at, 'HH:mm')}</div>
            </div>
          ) : (
            <span className="text-xs text-text-muted">—</span>
          )}
        </td>
        <td className="table-cell font-mono text-sm">{member.daily_rate ? formatCurrency(member.daily_rate) : '—'}</td>
        <td className="table-cell">
          <div className="flex items-center gap-1">
            <button onClick={onToggleExpand} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid">
              <Clock className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClockIn} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-status-success/8 hover:text-status-success">
              <LogIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClockOut} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-blue/8 hover:text-brand-blue">
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={onIssueCredential} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid">
              <QrCode className="h-3.5 w-3.5" />
            </button>
            <button onClick={onEdit} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-status-error/8 hover:text-status-error">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-bg-surface/30">
          <td colSpan={6} className="px-4 py-3">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">Turno e presenca — {member.first_name}</div>
            <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-text-muted">
              {member.shift_label && <span>Turno: {member.shift_label}</span>}
              {member.shift_starts_at && <span>Inicio: {formatDate(member.shift_starts_at, 'dd/MM HH:mm')}</span>}
              {member.shift_ends_at && <span>Fim: {formatDate(member.shift_ends_at, 'dd/MM HH:mm')}</span>}
              {member.linked_device_id && <span>Dispositivo: {member.linked_device_id}</span>}
            </div>

            {timeEntries.length === 0 ? (
              <p className="text-xs text-text-muted">Nenhum registro operacional</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs',
                      entry.type === 'clock_in'
                        ? 'border-status-success/20 bg-status-success/8 text-status-success'
                        : 'border-status-error/20 bg-status-error/8 text-status-error',
                    )}
                  >
                    {entry.type === 'clock_in' ? '● Entrada' : '○ Saida'}
                    <span className="font-mono text-text-muted">{formatDate(entry.recorded_at, 'dd/MM HH:mm')}</span>
                    {entry.gate?.name && <span className="text-text-muted">{entry.gate.name}</span>}
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
