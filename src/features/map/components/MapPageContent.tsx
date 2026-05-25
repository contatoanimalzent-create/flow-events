import { useCallback, useEffect, useState } from 'react'
import {
  Activity, AlertTriangle, ChevronDown, Eye, Layers,
  MapPin, RefreshCw, Users, Wifi, ZoomIn, ZoomOut,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import type { Event, Gate, StaffMember, Checkin } from '@/lib/supabase'
import { cn } from '@/shared/lib'

type Layer = 'zones' | 'staff' | 'density' | 'alerts' | 'checkins'
type ViewMode = 'live' | 'heatmap' | 'staff'

// ── Derived display types ────────────────────────────────────────────────────

interface ZoneDisplay {
  id: string
  name: string
  type: string
  capacity: number
  occupancy: number
  status: 'normal' | 'attention' | 'critical'
  x: number
  y: number
  w: number
  h: number
  color: string
}

interface StaffDisplay {
  id: string
  name: string
  role: string
  zone: string
  x: number
  y: number
  status: 'active' | 'outside'
}

interface AlertDisplay {
  id: string
  type: string
  zone: string
  severity: 'critical' | 'high' | 'medium'
  time: string
}

interface KpiData {
  checkedIn: number
  totalCapacity: number
  staffActive: number
  staffTotal: number
  staffOutside: number
  criticalZones: number
  checkinRate: number
  invalidRate: number
  alertCount: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOccupancyColor(pct: number) {
  if (pct >= 90) return '#EF4444'
  if (pct >= 75) return '#d97706'
  return '#22C55E'
}

function getStatusFromOccupancy(pct: number): 'normal' | 'attention' | 'critical' {
  if (pct >= 90) return 'critical'
  if (pct >= 75) return 'attention'
  return 'normal'
}

function getZoneColor(type: string, occupancy: number): string {
  if (type === 'Entrada') return '#4285F4'
  if (type === 'Restrito') return '#0057E7'
  return getOccupancyColor(occupancy)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  return `${hours}h`
}

/** Distribute zones evenly across the SVG canvas */
function layoutZones(count: number, index: number): { x: number; y: number; w: number; h: number } {
  const cols = count <= 4 ? 2 : 3
  const row = Math.floor(index / cols)
  const col = index % cols
  const totalRows = Math.ceil(count / cols)

  const marginX = 10
  const marginY = 12
  const gapX = 3
  const gapY = 3
  const usableW = 80 - (cols - 1) * gapX
  const usableH = 76 - (totalRows - 1) * gapY
  const w = usableW / cols
  const h = usableH / totalRows

  return {
    x: marginX + col * (w + gapX),
    y: marginY + row * (h + gapY),
    w,
    h,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function MapPageContent() {
  const { organization } = useAuthStore()

  // Data states
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [zones, setZones] = useState<ZoneDisplay[]>([])
  const [staff, setStaff] = useState<StaffDisplay[]>([])
  const [alerts, setAlerts] = useState<AlertDisplay[]>([])
  const [kpis, setKpis] = useState<KpiData>({
    checkedIn: 0,
    totalCapacity: 0,
    staffActive: 0,
    staffTotal: 0,
    staffOutside: 0,
    criticalZones: 0,
    checkinRate: 0,
    invalidRate: 0,
    alertCount: 0,
  })
  const [checkinHistory, setCheckinHistory] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [layers, setLayers] = useState<Set<Layer>>(new Set(['zones', 'staff', 'alerts']))
  const [viewMode, setViewMode] = useState<ViewMode>('live')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [eventSelectorOpen, setEventSelectorOpen] = useState(false)

  // ── Fetch events for this organization ───────────────────────────────────

  useEffect(() => {
    if (!organization) return

    async function fetchEvents() {
      try {
        const { data } = await supabase
          .from('events')
          .select('id,name,slug,starts_at,ends_at,status,total_capacity,checked_in_count,sold_tickets')
          .eq('organization_id', organization!.id)
          .in('status', ['published', 'ongoing', 'finished'])
          .order('starts_at', { ascending: false })

        const eventList = (data ?? []) as Event[]
        setEvents(eventList)

        // Auto-select first ongoing event, or first event
        if (eventList.length > 0 && !selectedEventId) {
          const ongoing = eventList.find((e) => e.status === 'ongoing')
          setSelectedEventId(ongoing?.id ?? eventList[0].id)
        }
      } catch (err) {
        console.error('MapPage: failed to fetch events', err)
        setEvents([])
      }
    }

    fetchEvents()
  }, [organization])

  // ── Fetch map data when event changes ────────────────────────────────────

  const fetchMapData = useCallback(async () => {
    if (!organization || !selectedEventId) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Parallel fetches
      const [
        eventRes,
        gatesRes,
        staffRes,
        failedCheckinsRes,
        recentCheckinsRes,
      ] = await Promise.all([
        // Event details
        supabase
          .from('events')
          .select('id,name,checked_in_count,total_capacity,sold_tickets')
          .eq('id', selectedEventId)
          .single(),

        // Gates as zones
        supabase
          .from('gates')
          .select('*')
          .eq('event_id', selectedEventId)
          .order('name'),

        // Active staff
        supabase
          .from('staff_members')
          .select('id,first_name,last_name,role_title,area,status,checked_in_at,checked_out_at,is_active')
          .eq('event_id', selectedEventId)
          .eq('is_active', true),

        // Failed checkins (last 10) for alerts
        supabase
          .from('checkins')
          .select('id,result,checked_in_at,gate_id,reason_code,notes')
          .eq('event_id', selectedEventId)
          .neq('result', 'success')
          .order('checked_in_at', { ascending: false })
          .limit(10),

        // Recent checkins (last 12 minutes) for rate calculation
        supabase
          .from('checkins')
          .select('id,result,checked_in_at')
          .eq('event_id', selectedEventId)
          .gte('checked_in_at', new Date(Date.now() - 12 * 60_000).toISOString())
          .order('checked_in_at', { ascending: false }),
      ])

      const event = eventRes.data as Event | null
      const gates = (gatesRes.data ?? []) as Gate[]
      const staffMembers = (staffRes.data ?? []) as StaffMember[]
      const failedCheckins = (failedCheckinsRes.data ?? []) as Checkin[]
      const recentCheckins = (recentCheckinsRes.data ?? []) as Checkin[]

      // ── Build zones from gates ──────────────────────────────────────────

      const gateZones: ZoneDisplay[] = gates.map((gate, i) => {
        const layout = layoutZones(gates.length, i)

        // Determine type
        let type = 'Operação'
        if (gate.is_entrance && gate.is_exit) type = 'Entrada/Saída'
        else if (gate.is_entrance) type = 'Entrada'
        else if (gate.is_exit) type = 'Saída'

        // Count staff in this zone
        const staffInZone = staffMembers.filter(
          (s) => s.area === gate.name || s.gate_id === gate.id,
        ).length

        // Use device_count as rough capacity proxy; occupancy based on staff ratio
        const capacity = gate.device_count * 500 || 0
        const occupancy = capacity > 0 ? Math.min(100, Math.round((staffInZone / Math.max(capacity / 500, 1)) * 100)) : 0

        const status = gate.status === 'offline' ? 'critical' as const
          : gate.status === 'warning' ? 'attention' as const
          : getStatusFromOccupancy(occupancy)

        return {
          id: gate.id,
          name: gate.name,
          type,
          capacity,
          occupancy,
          status,
          ...layout,
          color: getZoneColor(type, occupancy),
        }
      })

      setZones(gateZones)

      // ── Build staff display ─────────────────────────────────────────────

      const staffDisplay: StaffDisplay[] = staffMembers.map((s) => {
        const zone = gateZones.find((z) => z.name === s.area || z.id === s.gate_id)

        // Position staff inside their zone with some jitter
        const hash = s.id.charCodeAt(0) + (s.id.charCodeAt(1) || 0)
        const jitterX = ((hash % 7) - 3) * 1.2
        const jitterY = (((hash >> 2) % 5) - 2) * 1.2

        const baseX = zone ? zone.x + zone.w / 2 : 50
        const baseY = zone ? zone.y + zone.h / 2 : 50

        const isActive = s.status === 'active' || (s.checked_in_at && !s.checked_out_at)
        const isOutside = !zone && s.status === 'active'

        return {
          id: s.id,
          name: `${s.first_name} ${(s.last_name ?? '').charAt(0)}.`.trim(),
          role: s.role_title ?? 'Staff',
          zone: zone?.name ?? s.area ?? 'Sem área',
          x: Math.max(2, Math.min(98, baseX + jitterX)),
          y: Math.max(2, Math.min(98, baseY + jitterY)),
          status: isOutside ? 'outside' : 'active',
        }
      })

      setStaff(staffDisplay)

      // ── Build alerts from failed checkins ───────────────────────────────

      const alertDisplay: AlertDisplay[] = failedCheckins.map((c) => {
        const gate = gates.find((g) => g.id === c.gate_id)
        let alertType = 'Check-in inválido'
        let severity: 'critical' | 'high' | 'medium' = 'medium'

        if (c.reason_code === 'already_used' || c.result === 'already_checked_in') {
          alertType = 'Ingresso já utilizado'
          severity = 'high'
        } else if (c.reason_code === 'invalid_ticket' || c.result === 'invalid') {
          alertType = 'Ingresso inválido'
          severity = 'critical'
        } else if (c.reason_code === 'expired') {
          alertType = 'Ingresso expirado'
          severity = 'medium'
        } else if (c.result === 'denied') {
          alertType = 'Acesso negado'
          severity = 'high'
        }

        return {
          id: c.id,
          type: alertType,
          zone: gate?.name ?? 'Portaria desconhecida',
          severity,
          time: timeAgo(c.checked_in_at),
        }
      })

      setAlerts(alertDisplay)

      // ── Compute KPIs ────────────────────────────────────────────────────

      const checkedIn = event?.checked_in_count ?? 0
      const totalCapacity = event?.total_capacity ?? event?.sold_tickets ?? 0
      const activeStaff = staffMembers.filter(
        (s) => s.status === 'active' || (s.checked_in_at && !s.checked_out_at),
      ).length
      const outsideStaff = staffDisplay.filter((s) => s.status === 'outside').length
      const criticalZones = gateZones.filter((z) => z.status === 'critical').length

      // Check-in rate: count from last minute
      const oneMinAgo = Date.now() - 60_000
      const lastMinCheckins = recentCheckins.filter(
        (c) => new Date(c.checked_in_at).getTime() >= oneMinAgo,
      )
      const checkinRate = lastMinCheckins.length
      const invalidRate = lastMinCheckins.filter((c) => c.result !== 'success').length

      setKpis({
        checkedIn,
        totalCapacity,
        staffActive: activeStaff,
        staffTotal: staffMembers.length,
        staffOutside: outsideStaff,
        criticalZones,
        checkinRate,
        invalidRate,
        alertCount: alertDisplay.length,
      })

      // ── Checkin history (12 one-minute buckets) ─────────────────────────

      const history: number[] = []
      const now = Date.now()
      for (let i = 11; i >= 0; i--) {
        const bucketStart = now - (i + 1) * 60_000
        const bucketEnd = now - i * 60_000
        const count = recentCheckins.filter((c) => {
          const t = new Date(c.checked_in_at).getTime()
          return t >= bucketStart && t < bucketEnd
        }).length
        history.push(count)
      }
      setCheckinHistory(history)
    } catch (err) {
      console.error('MapPage: failed to fetch map data', err)
    } finally {
      setLoading(false)
    }
  }, [organization, selectedEventId])

  useEffect(() => {
    fetchMapData()
  }, [fetchMapData])

  // ── Guard ────────────────────────────────────────────────────────────────

  if (!organization) return null

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  function toggleLayer(layer: Layer) {
    setLayers((prev) => {
      const next = new Set(prev)
      next.has(layer) ? next.delete(layer) : next.add(layer)
      return next
    })
  }

  const selectedZoneData = zones.find((z) => z.id === selectedZone)
  const occupancyPct = kpis.totalCapacity > 0
    ? Math.round((kpis.checkedIn / kpis.totalCapacity) * 100)
    : 0
  const maxCheckinHistory = Math.max(...checkinHistory, 1)

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
          {/* Event selector */}
          {events.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setEventSelectorOpen(!eventSelectorOpen)}
                className="btn-secondary flex items-center gap-2 text-xs"
              >
                <span className="max-w-[160px] truncate">{selectedEvent?.name ?? 'Selecionar evento'}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {eventSelectorOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-white/10 bg-bg-card shadow-xl">
                  {events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setSelectedEventId(evt.id)
                        setEventSelectorOpen(false)
                        setSelectedZone(null)
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-xs transition-colors',
                        evt.id === selectedEventId
                          ? 'bg-brand-blue/10 text-brand-blue'
                          : 'text-text-muted hover:text-text-primary hover:bg-white/5',
                      )}
                    >
                      <div className="font-medium">{evt.name}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{evt.status}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/5 px-3 py-1.5">
            <Wifi className="h-3 w-3 text-status-success animate-pulse" />
            <span className="text-xs text-status-success font-medium">Live</span>
          </div>
          <button onClick={fetchMapData} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Atualizar
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && zones.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-text-muted">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Carregando mapa operacional...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !selectedEventId && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-text-muted">
            <MapPin className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum evento encontrado para esta organização.</p>
          </div>
        </div>
      )}

      {/* Main content */}
      {selectedEventId && !(loading && zones.length === 0) && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {[
              { label: 'Ocupação geral', value: `${occupancyPct}%`, sub: 'do total do venue', color: occupancyPct >= 75 ? 'text-status-warning' : 'text-text-primary' },
              { label: 'Checked in', value: kpis.checkedIn.toLocaleString('pt-BR'), sub: `de ${kpis.totalCapacity.toLocaleString('pt-BR')} capacidade`, color: 'text-text-primary' },
              { label: 'Staff ativo', value: String(kpis.staffActive), sub: `de ${kpis.staffTotal} alocados`, color: 'text-status-success' },
              { label: 'Fora da área', value: String(kpis.staffOutside), sub: 'colaboradores', color: kpis.staffOutside > 0 ? 'text-status-error' : 'text-text-muted' },
              { label: 'Zonas críticas', value: String(kpis.criticalZones), sub: 'superlotação', color: kpis.criticalZones > 0 ? 'text-status-error' : 'text-text-muted' },
              { label: 'Check-in/min', value: String(kpis.checkinRate), sub: 'última leitura', color: 'text-brand-blue' },
              { label: 'Inválidos/min', value: String(kpis.invalidRate), sub: 'tentativas negadas', color: kpis.invalidRate > 0 ? 'text-status-warning' : 'text-text-muted' },
              { label: 'Alertas ativos', value: String(kpis.alertCount), sub: 'não resolvidos', color: kpis.alertCount > 0 ? 'text-status-error' : 'text-text-muted' },
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
                  {layers.has('zones') && zones.map((zone) => {
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
                        {zone.type !== 'Entrada' && zone.capacity > 0 && (
                          <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 2} textAnchor="middle" fill={fillColor} fontSize="1.8" fontFamily="IBM Plex Mono, monospace" fillOpacity="0.9">
                            {zone.occupancy}%
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Empty zone placeholder */}
                  {layers.has('zones') && zones.length === 0 && !loading && (
                    <text x="50" y="50" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="3" fontFamily="Inter, sans-serif">
                      Nenhuma portaria configurada
                    </text>
                  )}

                  {/* Staff dots */}
                  {layers.has('staff') && staff.map((s) => (
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
                  {layers.has('alerts') && alerts.map((alert) => {
                    const zone = zones.find((z) => z.name === alert.zone)
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
                  <span className="rounded-full bg-status-error/10 px-2 py-0.5 text-xs text-status-error">{alerts.length}</span>
                </div>
                {alerts.length === 0 && (
                  <div className="text-xs text-text-muted py-2">Nenhum alerta ativo.</div>
                )}
                {alerts.map((alert) => (
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
                {staff.length === 0 && (
                  <div className="text-xs text-text-muted py-2">Nenhum staff ativo.</div>
                )}
                {staff.map((s) => (
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
                {zones.filter((z) => z.type !== 'Entrada' && z.capacity > 0).length === 0 && (
                  <div className="text-xs text-text-muted py-2">Sem dados de densidade.</div>
                )}
                {zones.filter((z) => z.type !== 'Entrada' && z.capacity > 0).slice(0, 5).map((zone) => (
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
                  {(checkinHistory.length > 0 ? checkinHistory : Array(12).fill(0)).map((v, i) => (
                    <div key={i} className="flex-1 bg-brand-blue/30 rounded-sm transition-all" style={{ height: `${(v / maxCheckinHistory) * 100}%`, minHeight: v > 0 ? '2px' : '0px' }} />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>-12 min</span>
                  <span className="text-brand-blue font-mono font-bold">{kpis.checkinRate}/min agora</span>
                  <Activity className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
