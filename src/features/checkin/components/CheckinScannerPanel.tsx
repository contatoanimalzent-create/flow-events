import { CheckCircle2, Loader2, ScanLine, X } from 'lucide-react'
import { cn } from '@/shared/lib'
import type { CheckinSubmissionResult } from '@/features/checkin/types'
import { getValidationAppearance } from './checkin-ui'

interface CheckinScannerPanelProps {
  scanInput: string
  setScanInput: (value: string) => void
  scanResult: CheckinSubmissionResult | null
  processing: boolean
  onScan: (token: string, isExit?: boolean) => void | Promise<void>
  onClearResult: () => void
}

export function CheckinScannerPanel({
  scanInput,
  setScanInput,
  scanResult,
  processing,
  onScan,
  onClearResult,
}: CheckinScannerPanelProps) {
  const appearance = scanResult ? getValidationAppearance(scanResult.validation_status, scanResult.reason_code) : null

  return (
    <div className="card animate-slide-up border-brand-acid/30 p-5 reveal">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-acid/15">
          <ScanLine className="h-4 w-4 text-brand-acid" />
        </div>
        <div>
          <div className="text-sm font-semibold text-text-primary">Scanner ativo</div>
          <div className="text-[11px] text-text-muted">Leia o QR code ou use o token manual como fallback</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="input flex-1 font-mono"
          placeholder="Aguardando leitura do QR code..."
          value={scanInput}
          onChange={(event) => setScanInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void onScan(scanInput)
            }
          }}
          autoComplete="off"
        />

        <div className="flex gap-2">
          <button onClick={() => void onScan(scanInput, false)} disabled={processing || !scanInput} className="btn-primary px-5">
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
          <button onClick={() => void onScan(scanInput, true)} disabled={processing || !scanInput} className="btn-secondary px-5">
            Saida
          </button>
        </div>
      </div>

      {scanResult && appearance && (
        <div className={cn('mt-4 flex items-center gap-3 rounded-sm border p-4 animate-slide-up', appearance.bg)}>
          <appearance.icon className={cn('h-6 w-6 shrink-0', appearance.color)} />
          <div className="flex-1">
            <div className={cn('text-sm font-semibold', appearance.color)}>{appearance.label}</div>
            <div className="mt-0.5 text-xs text-text-secondary">{appearance.description}</div>
            {scanResult.digital_ticket?.holder_name && (
              <div className="mt-1 text-xs text-text-secondary">{scanResult.digital_ticket.holder_name}</div>
            )}
            {scanResult.digital_ticket?.ticket_number && (
              <div className="text-[11px] font-mono text-text-muted">{scanResult.digital_ticket.ticket_number}</div>
            )}
          </div>
          <button onClick={onClearResult} className="text-text-muted transition-colors hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
