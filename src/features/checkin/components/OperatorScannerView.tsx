import { useState, useEffect } from 'react'
import { RotateCcw, ScanLine } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { checkinQueries } from '@/features/checkin/services'
import { useCheckinScanner } from '@/features/checkin/hooks'
import type { CheckinSubmissionResult } from '@/features/checkin/types'
import { getValidationAppearance } from './checkin-ui'
import { CheckinCameraModal } from './CheckinCameraModal'
import { cn } from '@/shared/lib'

// ─── Props ────────────────────────────────────────────────────────────────────

interface OperatorScannerViewProps {
  eventId: string
  eventName: string
  orgId: string
  onReset: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OperatorScannerView({ eventId, eventName, onReset }: OperatorScannerViewProps) {
  const [selectedGateId, setSelectedGateId] = useState('all')

  // Fetch gates for this event directly
  const { data: gates = [] } = useQuery(checkinQueries.gates(eventId))

  const { scanResult, clearScanResult, handleScan, processing } = useCheckinScanner({
    eventId,
    gateId: selectedGateId !== 'all' ? selectedGateId : null,
    operatorId: null,
    deviceId: typeof navigator !== 'undefined' ? navigator.userAgent : 'op-device',
  })

  // ── Keep a rolling history of the last 5 results ─────────────────────────
  const [history, setHistory] = useState<CheckinSubmissionResult[]>([])

  useEffect(() => {
    if (scanResult) {
      setHistory((prev) => [scanResult, ...prev].slice(0, 5))
    }
  }, [scanResult])

  // ── Event gates for this event only ──────────────────────────────────────
  const eventGates = gates.filter((g) => !g.event_id || g.event_id === eventId)

  return (
    <div className="flex h-screen flex-col bg-black text-text-primary overflow-hidden">

      {/* ── Top header bar ───────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <ScanLine className="h-5 w-5 shrink-0 text-brand-acid" />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold uppercase tracking-widest text-brand-acid">
              PULSE CHECK-IN
            </div>
            <div className="truncate text-[11px] font-mono text-text-muted max-w-[200px]">
              {eventName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gate selector */}
          {eventGates.length > 0 && (
            <select
              value={selectedGateId}
              onChange={(e) => setSelectedGateId(e.target.value)}
              className="rounded-sm border border-bg-border bg-bg-card px-2 py-1.5 font-mono text-xs text-text-primary focus:border-brand-acid focus:outline-none"
            >
              <option value="all">Todas portarias</option>
              {eventGates.map((gate) => (
                <option key={gate.id} value={gate.id}>
                  {gate.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Trocar evento"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Trocar
          </button>
        </div>
      </header>

      {/* ── Camera (inline, fills remaining height) ──────────────────────── */}
      <CheckinCameraModal
        inline
        eventId={eventId}
        gateId={selectedGateId !== 'all' ? selectedGateId : null}
        onScan={handleScan}
        onClose={() => { /* operator mode — camera always on */ }}
        scanResult={scanResult}
        processing={processing}
        onClearResult={clearScanResult}
      />

      {/* ── Recent history strip ─────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="shrink-0 border-t border-white/10 bg-gray-900 px-4 py-3">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">
            Últimos scans
          </div>
          <div className="flex flex-col gap-1.5">
            {history.map((item, idx) => {
              const app = getValidationAppearance(item.validation_status, item.reason_code)
              const isFirst = idx === 0
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2 transition-opacity',
                    isFirst ? 'opacity-100' : 'opacity-50',
                    item.validation_status === 'valid' || item.validation_status === 'reentry_allowed'
                      ? 'bg-status-success/10'
                      : 'bg-status-error/10',
                  )}
                >
                  <app.icon className={cn('h-3.5 w-3.5 shrink-0', app.color)} />
                  <span className="flex-1 truncate font-mono text-xs text-text-primary">
                    {item.digital_ticket?.holder_name ?? '—'}
                  </span>
                  <span className={cn('font-mono text-[10px] uppercase tracking-wider', app.color)}>
                    {app.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
