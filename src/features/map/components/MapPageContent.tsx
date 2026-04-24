import { useState } from 'react'
import {
  Activity, AlertTriangle, ChevronDown, Eye, Layers,
  MapPin, RefreshCw, Users, Wifi, ZoomIn, ZoomOut,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib'

type Layer = 'zones' | 'staff' | 'density' | 'alerts' | 'checkins'
type ViewMode = 'live' | 'heatmap' | 'staff'

const MOCK_ZONES = [
  { id: '1', name: 'Pista Principal', type: 'Geral', capacity: 5000, occupancy: 67, status: 'normal', x: 10, y: 20, w: 45, h: 40, color: '#22C55E' },
  { id: '2', name: 'Área VIP', type: 'VIP', capacity: 500, occupancy: 82, status: 'attention', x: 58, y: 20, w: 30, h: 22, color: '#d97706' },
  { id: '3', name: 'Stage Lateral', type: 'Stage', capacity: 800, occupancy: 45, status: 'normal', x: 58, y: 46, w: 30, h: 18, color: '#22C55E' },
  { id: '4', name: 'Bar & Alimentação', type: 'Serviço', capacity: 300, occupancy: 91, status: 'critical', x: 10, y: 64, w: 30, h: 22, color: '#EF4444' },
  { id: '5', name: 'Backstage', type: 'Restrito', capacity: 100, occupancy: 30, status: 'normal', x: 44, y: 64, w: 20, h: 22, color: '#0057E7' },
  { id: '6', name: 'Portaria Norte', type: 'Entrada', capacity: 0, occupancy: 0, status: 'normal', x: 28, y: 6, w: 12, h: 8, color: '#4285F4' },
  { id: '7', name: 'Portaria Sul', type: 'Entrada', capacity: 0, occupancy: 0, status: 'normal', x: 52, y: 88, w: 12, h: 8, color: '#4285F4' },
]

const MOCK_STAFF = [
  { id: '1', name: 'Carlos M.', role: 'Segurança', zone: 'Pista Principal', x: 22, y: 35, status: 'active' },
  { id: '2', name: 'Ana L.', role: 'Operadora', zone: 'Portaria Norte', x: 33, y: 9, status: 'active' },
  { id: '3', name: 'Pedro S.', role: 'Supervisor', zone: 'VIP', x: 67, y: 28, status: 'active' },
  { id: '4', name: 'Julia R.', role: 'Segurança', zone: 'Bar', x: 18, y: 72, status: 'outside' },
  { id: '5', name: 'Marcos T.', role: 'Técnico', zone: 'Backstage', x: 52, y: 72, status: 'active' },
]

const MOCK_ALERTS = [
  { id: '1', type: 'Superlotação', zone: 'Bar & Alimentação', severity: 'critical', time: '2 min' },
  { id: '2', type: 'Staff fora da zona', zone: 'Pista Principal', severity: 'medium', time: '5 min' },
  { id: '3', type: 'Alta taxa inválida', zone: 'Portaria Norte', severity: 'high', time: '8 min' },
]

function getOccupancyColor(pct: number) {
  if (pct >= 90) return '#EF4444'
  if (pct >= 75) return '#d97706'
  return '#22C55E'
}

export function MapPageContent() {
  const { organization } = useAuthStore()
  const [layers, setLayers] = useState<Set<Layer>>(new Set(['zones', 'staff', 'alerts']))
  const [viewMode, setViewMode] = useState<ViewMode>('live')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  if (!organization) return null

  function toggleLayer(layer: Layer) {
    setLayers((prev) => {
      const next = new Set(prev)
      next.has(layer) ? next.delete(layer) : next.add(layer)
      return next
    })
  }

  const selectedZoneData = MOCK_ZONES.find((z) => z.id === selectedZone)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Situational awareness</div>
          <h1 className="admin-title">
            Mapa Operacional<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Visão em tempo real de zonas, staff, densidade e alertas ativos no venue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/5 px-3 py-1.5">
            <Wifi className="h-3 w-3 text-status-success animate-pulse" />
            <span className="text-xs text-status-success font-medium">Live</span>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {[
          { label: 'Ocupação geral', value: '71%', sub: 'do total do venue', color: 'text-status-warning' },
          { label: 'Pessoas ativas', value: '3.840', sub: 'estimativa em tempo real', color: 'text-text-primary' },
          { label: 'Staff ativo', value: '5', sub: 'de 8 alocados', color: 'text-status-success' },
          { label: 'Fora da área', value: '1', sub: 'colaboradores', color: 'text-status-error' },
          { label: 'Zonas críticas', value: '1', sub: 'superlotação', color: 'text-status-error' },
          { label: 'Check-in/min', value: '42', sub: 'última leitura', color: 'text-brand-blue' },
          { label: 'Inválidos/min', value: '3', sub: 'tentativas negadas', color: 'text-status-warning' },
          { label: 'Alertas ativos', value: '3', sub: 'não resolvidos', color: 'text-status-error' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{kpi.label}</div>
            <div className={cn('mt-2 text-2xl font-bold font-mono', kpi.color)}>{kpi.value}</div>
            <div className="mt-0.5 text-[11px] text-text-muted">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        {/* Map canvas */}
        <div className="card p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-1">
              {([
                { key: 'live', label: 'Live' },
                { key: 'heatmap', label: 'Heatmap' },
                { key: 'staff', label: 'Staff' },
              ] as { key: ViewMode; label: string }[]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setViewMode(m.key)}
                  className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    viewMode === m.key ? 'bg-brand-blue text-white' : 'text-text-muted hover:text-text-primary',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))} className="btn-ghost p-1.5"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))} className="btn-ghost p-1.5"><ZoomOut className="h-4 w-4" /></button>
              <button className="btn-ghost p-1.5"><Eye className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2">
            <Layers className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted mr-1">Camadas:</span>
            {([
              { key: 'zones', label: 'Zonas' },
              { key: 'staff', label: 'Staff' },
              { key: 'density', label: 'Densidade' },
              { key: 'alerts', label: 'Alertas' },
              { key: 'checkins', label: 'Check-ins' },
            ] as { key: Layer; label: string }[]).map((l) => (
              <button
                key={l.key}
                onClick={() => toggleLayer(l.key)}
                className={cn('rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                  layers.has(l.key) ? 'bg-brand-blue/15 text-brand-blue' : 'text-text-muted hover:text-text-primary',
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* SVG Map */}
          <div className="relative bg-[#0d0d12] overflow-auto" style={{ minHeight: 480 }}>
            <svg
              viewBox="0 0 100 100"
              className="w-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}
            >
              {/* Grid */}
              <defs>
                <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Venue outline */}
              <rect x="8" y="4" width="82" height="90" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

              {/* Zones */}
              {layers.has('zones') && MOCK_ZONES.map((zone) => {
                const fillColor = viewMode === 'heatmap'
                  ? getOccupancyColor(zone.occupancy)
                  : zone.color
                const opacity = viewMode === 'heatmap' ? zone.occupancy / 100 * 0.6 + 0.1 : 0.12
                const isSelected = selectedZone === zone.id
                return (
                  <g key={zone.id} onClick={() => setSelectedZone(isSelected ? null : zone.id)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                      rx="1"
                      fill={fillColor}
                      fillOpacity={opacity}
                      stroke={isSelected ? '#ffffff' : fillColor}
                      strokeWidth={isSelected ? 0.6 : 0.3}
                      strokeOpacity={isSelected ? 0.8 : 0.5}
                    />
                    <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 - 1.5} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="2.2" fontFamily="Inter, sans-serif" fontWeight="500">
                      {zone.name}
                    </text>
                    {zone.type !== 'Entrada' && (
                      <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 2} textAnchor="middle" fill={fillColor} fontSize="1.8" fontFamily="IBM Plex Mono, monospace" fillOpacity="0.9">
                        {zone.occupancy}%
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Staff dots */}
              {layers.has('staff') && MOCK_STAFF.map((s) => (
                <g key={s.id}>
                  <circle
                    cx={s.x} cy={s.y} r="1.8"
                    fill={s.status === 'outside' ? '#EF4444' : '#22C55E'}
                    stroke="rgba(0,0,0,0.5)" strokeWidth="0.4"
                    className="cursor-pointer"
                  />
                  <title>{s.name}, {s.role}</title>
                </g>
              ))}

              {/* Alert indicators */}
              {layers.has('alerts') && MOCK_ALERTS.map((alert, i) => {
                const zone = MOCK_ZONES.find((z) => z.name === alert.zone)
                if (!zone) return null
                return (
                  <g key={alert.id}>
                    <circle cx={zone.x + zone.w - 2} cy={zone.y + 2} r="2" fill="#EF4444" fillOpacity="0.9">
                      <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <text x={zone.x + zone.w - 2} y={zone.y + 2.8} textAnchor="middle" fill="white" fontSize="2" fontWeight="700">!</text>
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-2">
              {[
                { color: '#22C55E', label: 'Normal' },
                { color: '#d97706', label: 'Atenção' },
                { color: '#EF4444', label: 'Crítico' },
                { color: '#0057E7', label: 'Restrito' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] text-white/60">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected zone info */}
          {selectedZoneData && (
            <div className="border-t border-white/5 p-4 flex items-center gap-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Zona selecionada</div>
                <div className="font-semibold text-text-primary mt-0.5">{selectedZoneData.name}</div>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="text-xs text-text-muted">Tipo: <span className="text-text-secondary">{selectedZoneData.type}</span></div>
              <div className="text-xs text-text-muted">Capacidade: <span className="text-text-secondary">{selectedZoneData.capacity.toLocaleString()}</span></div>
              <div className="text-xs text-text-muted">Ocupação: <span style={{ color: getOccupancyColor(selectedZoneData.occupancy) }} className="font-bold">{selectedZoneData.occupancy}%</span></div>
              <button onClick={() => setSelectedZone(null)} className="ml-auto text-xs text-text-muted hover:text-text-primary">Fechar</button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Alertas ativos</h3>
              <span className="rounded-full bg-status-error/10 px-2 py-0.5 text-xs text-status-error">{MOCK_ALERTS.length}</span>
            </div>
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className={cn('flex items-start gap-3 rounded-lg p-3 border',
                alert.severity === 'critical' ? 'border-status-error/20 bg-status-error/5' :
                alert.severity === 'high' ? 'border-status-warning/20 bg-status-warning/5' :
                'border-white/10 bg-white/[0.02]',
              )}>
                <AlertTriangle className={cn('h-4 w-4 mt-0.5 shrink-0',
                  alert.severity === 'critical' ? 'text-status-error' :
                  alert.severity === 'high' ? 'text-status-warning' : 'text-text-muted',
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary">{alert.type}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{alert.zone} · {alert.time} atrás</div>
                </div>
              </div>
            ))}
          </div>

          {/* Staff status */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Staff em campo</h3>
            {MOCK_STAFF.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={cn('h-2 w-2 rounded-full shrink-0', s.status === 'active' ? 'bg-status-success' : 'bg-status-error')} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary">{s.name}</div>
                  <div className="text-[11px] text-text-muted">{s.role} · {s.zone}</div>
                </div>
                {s.status === 'outside' && (
                  <span className="text-[10px] text-status-error font-medium">Fora da área</span>
                )}
              </div>
            ))}
          </div>

          {/* Zone density */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Densidade por zona</h3>
            {MOCK_ZONES.filter((z) => z.type !== 'Entrada').slice(0, 5).map((zone) => (
              <div key={zone.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary truncate max-w-[150px]">{zone.name}</span>
                  <span className="text-xs font-mono" style={{ color: getOccupancyColor(zone.occupancy) }}>{zone.occupancy}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${zone.occupancy}%`, backgroundColor: getOccupancyColor(zone.occupancy) }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Checkin flow */}
          <div className="card p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Check-in/min</h3>
            <div className="flex items-end gap-1 h-12">
              {[28, 35, 42, 38, 55, 61, 42, 38, 47, 42, 50, 42].map((v, i) => (
                <div key={i} className="flex-1 bg-brand-blue/30 rounded-sm transition-all" style={{ height: `${(v / 70) * 100}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>-12 min</span>
              <span className="text-brand-blue font-mono font-bold">42/min agora</span>
              <Activity className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
