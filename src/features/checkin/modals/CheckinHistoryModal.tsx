import { Clock3, DoorOpen, Loader2, X } from 'lucide-react'
import { formatDate } from '@/shared/lib'
import { useCheckinHistory } from '@/features/checkin/hooks'
import { getLogAppearance } from '@/features/checkin/components/checkin-ui'

interface CheckinHistoryModalProps {
  digitalTicketId: string
  onClose: () => void
}

export function CheckinHistoryModal({ digitalTicketId, onClose }: CheckinHistoryModalProps) {
  const historyQuery = useCheckinHistory(digitalTicketId)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-2xl p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Auditoria</div>
            <h2 className="font-display text-2xl text-text-primary">
              HISTORICO DE ACESSO<span className="text-brand-acid">.</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-text-muted transition-colors hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {historyQuery.isPending ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : historyQuery.data?.length ? (
          <div className="space-y-3">
            {historyQuery.data.map((item) => {
              const appearance = getLogAppearance(item.result, item.reason_code, item.is_exit)
              const Icon = appearance.icon

              return (
                <div key={item.id} className="rounded-sm border border-bg-border bg-bg-surface/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${appearance.color}`} />
                        <span className={`text-sm font-semibold ${appearance.color}`}>{appearance.label}</span>
                        {item.is_exit && <DoorOpen className="h-3.5 w-3.5 text-brand-blue" />}
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">{appearance.description}</div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {item.gate?.name || 'Sem portaria'} · {item.digital_ticket?.ticket_number || 'Sem ticket'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(item.checked_in_at, 'dd/MM HH:mm:ss')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-sm border border-bg-border bg-bg-surface/70 p-8 text-center text-sm text-text-muted">
            Nenhum registro operacional encontrado para este ingresso.
          </div>
        )}
      </div>
    </div>
  )
}
