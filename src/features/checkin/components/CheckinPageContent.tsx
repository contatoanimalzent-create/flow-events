import { RefreshCw, ScanLine } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useCheckinBoard, useCheckinScanner } from '@/features/checkin/hooks'
import { CheckinHistoryModal } from '@/features/checkin/modals'
import { PaginationControls } from '@/shared/components'
import { cn, formatNumber } from '@/shared/lib'
import { CheckinCameraModal } from './CheckinCameraModal'
import { CheckinStatsGrid } from './CheckinStatsGrid'
import { CommandCenterOverview } from './CommandCenterOverview'
import { RecentCheckinsTable } from './RecentCheckinsTable'

export function CheckinPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const profile = useAuthStore((state) => state.profile)
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    gates,
    selectedGateId,
    setSelectedGateId,
    search,
    setSearch,
    scanMode,
    setScanMode,
    paginatedCheckins,
    pagination,
    stats,
    commandCenter,
    loading,
    event,
    occupancyPct,
    refreshBoard,
    historyTicketId,
    setPage,
    openHistory,
    closeHistory,
  } = useCheckinBoard(organization?.id)

  const {
    scanInput,
    setScanInput,
    scanResult,
    clearScanResult,
    handleScan,
    processing,
  } = useCheckinScanner({
    eventId: selectedEventId || undefined,
    gateId: selectedGateId,
    operatorId: profile?.id,
    deviceId: typeof navigator !== 'undefined' ? navigator.userAgent : 'web-console',
  })

  const selectedGateLabel =
    selectedGateId !== 'all' ? gates.find((gate) => gate.id === selectedGateId)?.name ?? null : null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Live operations</div>
          <h1 className="admin-title">
            Check-in<span className="admin-title-accent">.</span>
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
            <span className="text-xs font-mono tracking-wider text-text-muted">AO VIVO · operacao de acesso e validacao</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => void refreshBoard()} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button
            onClick={() => setScanMode(!scanMode)}
            className={cn(
              'flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold transition-all',
              scanMode ? 'border border-status-error/30 bg-status-error/15 text-status-error' : 'btn-primary',
            )}
          >
            <ScanLine className="h-4 w-4" />
            {scanMode ? 'Fechar scanner' : 'Abrir scanner'}
          </button>
        </div>
      </div>

      {events.length > 1 && (
        <div className="admin-filterbar">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          <div className="flex flex-wrap gap-2">
            {events.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedEventId(item.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedEventId === item.id
                    ? 'bg-brand-acid text-white'
                    : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="admin-filterbar">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted">PORTARIA:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedGateId('all')}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                selectedGateId === 'all'
                  ? 'bg-brand-acid text-white'
                  : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              Todas
            </button>
            {gates.map((gate) => (
              <button
                key={gate.id}
                onClick={() => setSelectedGateId(gate.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedGateId === gate.id
                    ? 'bg-brand-acid text-white'
                    : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {gate.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CommandCenterOverview snapshot={commandCenter} />

      {scanMode && (
        <CheckinCameraModal
          eventId={selectedEventId ?? ''}
          gateId={selectedGateId !== 'all' ? selectedGateId : null}
          onScan={handleScan}
          onClose={() => setScanMode(false)}
          scanResult={scanResult}
          processing={processing}
          onClearResult={clearScanResult}
        />
      )}

      <CheckinStatsGrid stats={stats} />

      {event?.total_capacity ? (
        <div className="surface-panel p-5 reveal">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Ocupacao atual</span>
            <span className="text-xs font-mono text-brand-acid">{occupancyPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-surface">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                occupancyPct > 90 ? 'bg-status-error' : occupancyPct > 70 ? 'bg-status-warning' : 'bg-brand-acid',
              )}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-mono text-text-muted">
            <span>{formatNumber(stats.currentOccupancy)} dentro</span>
            <span>{formatNumber(event.total_capacity)} capacidade</span>
          </div>
        </div>
      ) : null}

      {gates.length > 0 && (
        <div className="reveal">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">Portarias</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {gates.map((gate) => (
              <div
                key={gate.id}
                className={cn(
                  'surface-panel flex items-center gap-3 p-4',
                  selectedGateId === gate.id && 'border-brand-acid/30',
                )}
              >
                <div
                  className={cn('h-2 w-2 rounded-full', gate.is_active ? 'animate-pulse bg-status-success' : 'bg-bg-border')}
                />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-text-primary">{gate.name}</div>
                  <div className="text-[10px] font-mono text-text-muted">
                    {gate.is_entrance && gate.is_exit ? 'Entrada/Saida' : gate.is_entrance ? 'Entrada' : 'Saida'}
                    {gate.device_count > 0 && ` · ${gate.device_count} dispositivos`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecentCheckinsTable
        checkins={paginatedCheckins}
        loading={loading}
        search={search}
        setSearch={setSearch}
        selectedGateLabel={selectedGateLabel}
        onSelectTicket={openHistory}
      />
      <PaginationControls pagination={pagination} onPageChange={setPage} />

      {historyTicketId && <CheckinHistoryModal digitalTicketId={historyTicketId} onClose={closeHistory} />}
    </div>
  )
}
