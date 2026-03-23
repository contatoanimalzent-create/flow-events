import { Loader2, ScanLine, Search } from 'lucide-react'
import { cn, formatDate } from '@/shared/lib'
import type { CheckinHistoryRow } from '@/features/checkin/types'
import { getLogAppearance } from './checkin-ui'

interface RecentCheckinsTableProps {
  checkins: CheckinHistoryRow[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  selectedGateLabel?: string | null
  onSelectTicket?: (ticketId: string) => void
}

export function RecentCheckinsTable({
  checkins,
  loading,
  search,
  setSearch,
  selectedGateLabel,
  onSelectTicket,
}: RecentCheckinsTableProps) {
  return (
    <div className="reveal">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
          Log de check-ins {selectedGateLabel ? `· ${selectedGateLabel}` : ''}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-8 w-52 pl-8 text-xs"
            placeholder="Buscar por nome ou ticket..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : checkins.length === 0 ? (
        <div className="card p-12 text-center">
          <ScanLine className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <div className="mb-1 font-display text-xl text-text-primary">NENHUM CHECK-IN</div>
          <p className="text-sm text-text-muted">Os registros operacionais vao aparecer aqui em tempo real</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Portador', 'Ingresso', 'Portaria', 'Resultado', 'Horario'].map((header) => (
                  <th key={header} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checkins.map((checkin) => {
                const appearance = getLogAppearance(checkin.result, checkin.reason_code, checkin.is_exit)
                const Icon = appearance.icon

                return (
                  <tr
                    key={checkin.id}
                    className={cn('table-row', checkin.digital_ticket_id && 'cursor-pointer')}
                    onClick={() => {
                      if (checkin.digital_ticket_id) {
                        onSelectTicket?.(checkin.digital_ticket_id)
                      }
                    }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {checkin.digital_ticket?.is_vip && (
                          <span className="rounded-sm bg-brand-acid/15 px-1.5 py-0.5 text-[9px] font-mono text-brand-acid">VIP</span>
                        )}
                        <div>
                          <div className="text-[13px] font-medium">{checkin.digital_ticket?.holder_name || '—'}</div>
                          <div className="text-[11px] text-text-muted">{checkin.digital_ticket?.holder_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-xs text-text-secondary">
                      <div>{checkin.digital_ticket?.ticket_type?.name || '—'}</div>
                      <div className="text-[11px] font-mono text-text-muted">{checkin.digital_ticket?.ticket_number}</div>
                    </td>
                    <td className="table-cell text-xs text-text-secondary">{checkin.gate?.name || '—'}</td>
                    <td className="table-cell">
                      <div className={cn('flex items-center gap-1.5 text-xs font-medium', appearance.color)}>
                        <Icon className="h-3.5 w-3.5" />
                        {appearance.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-text-muted">{appearance.description}</div>
                    </td>
                    <td className="table-cell text-[11px] font-mono text-text-muted">{formatDate(checkin.checked_in_at, 'HH:mm:ss')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
