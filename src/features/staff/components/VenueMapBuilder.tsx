import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Save,
  Loader2,
  Layers,
  MicVocal,
  ShoppingBag,
  DoorOpen,
  CheckSquare,
  Crown,
  Users,
  Car,
  Lock,
  Package,
  MapPin,
  ChevronRight,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────────────

type ZoneType = 'stage' | 'stand' | 'gate' | 'checkpoint' | 'vip' | 'general' | 'parking' | 'backstage'

interface VenueZone {
  id:           string
  name:         string
  zone_type:    ZoneType
  x:            number
  y:            number
  width:        number
  height:       number
  capacity?:    number
  status?:      string
  responsible?: string
  color?:       string
}

interface VenueItem {
  id:         string
  name:       string
  item_type:  string
  x:          number
  y:          number
  zone_id?:   string
}

interface VenueMapBuilderProps {
  eventId:   string
  readOnly?: boolean
}

// ─── Zone config ────────────────────────────────────────────────────────────

const ZONE_CONFIG: Record<ZoneType, { fill: string; stroke: string; label: string }> = {
  stage:      { fill: '#f97316', stroke: '#ea580c', label: 'Palco'       },
  stand:      { fill: '#3b82f6', stroke: '#2563eb', label: 'Stand'       },
  gate:       { fill: '#22c55e', stroke: '#16a34a', label: 'Portão'      },
  checkpoint: { fill: '#ec4899', stroke: '#db2777', label: 'Checkpoint'  },
  vip:        { fill: '#d4a017', stroke: '#b8860b', label: 'VIP'         },
  general:    { fill: '#9ca3af', stroke: '#6b7280', label: 'Geral'       },
  parking:    { fill: '#64748b', stroke: '#475569', label: 'Estacionam.' },
  backstage:  { fill: '#a855f7', stroke: '#9333ea', label: 'Backstage'   },
}

const ZONE_TYPES = Object.keys(ZONE_CONFIG) as ZoneType[]

function ZoneIcon({ type, size = 16 }: { type: string; size?: number }) {
  const props = { size, className: 'shrink-0' }
  switch (type) {
    case 'stage':      return <MicVocal     {...props} />
    case 'stand':      return <ShoppingBag  {...props} />
    case 'gate':       return <DoorOpen     {...props} />
    case 'checkpoint': return <CheckSquare  {...props} />
    case 'vip':        return <Crown        {...props} />
    case 'general':    return <Users        {...props} />
    case 'parking':    return <Car          {...props} />
    case 'backstage':  return <Lock         {...props} />
    default:           return <Package      {...props} />
  }
}

function ItemIcon({ type, size = 14 }: { type: string; size?: number }) {
  const props = { size }
  switch (type) {
    case 'stage':   return <MicVocal  {...props} />
    case 'gate':    return <DoorOpen  {...props} />
    case 'vip':     return <Crown     {...props} />
    default:        return <MapPin    {...props} />
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

const GRID_SIZE = 20

function snapToGrid(val: number) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Component ──────────────────────────────────────────────────────────────

export function VenueMapBuilder({ eventId, readOnly = false }: VenueMapBuilderProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [zones,          setZones]          = useState<VenueZone[]>([])
  const [items,          setItems]          = useState<VenueItem[]>([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saveMsg,        setSaveMsg]        = useState<string | null>(null)
  const [selectedZone,   setSelectedZone]   = useState<VenueZone | null>(null)
  const [zoom,           setZoom]           = useState(1)
  const [pan,            setPan]            = useState({ x: 0, y: 0 })
  const [drawMode,       setDrawMode]       = useState<ZoneType>('general')
  const [drawing,        setDrawing]        = useState<{ startX: number; startY: number; x: number; y: number; w: number; h: number } | null>(null)
  const svgRef  = useRef<SVGSVGElement>(null)
  const panRef  = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
    dragging: false, startX: 0, startY: 0, originX: 0, originY: 0,
  })

  const CANVAS_W = 1200
  const CANVAS_H = 800

  // ── Load data ────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Venue maps
        const { data: mapData } = await supabase
          .from('venue_maps' as never)
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle() as { data: { id: string } | null }

        const mapId = mapData?.id

        if (mapId) {
          const [{ data: zoneData }, { data: itemData }] = await Promise.all([
            supabase.from('venue_zones' as never).select('*').eq('map_id', mapId),
            supabase.from('venue_items' as never).select('*').eq('map_id', mapId),
          ])
          if (zoneData) setZones(zoneData as unknown as VenueZone[])
          if (itemData) setItems(itemData as unknown as VenueItem[])
        }
      } catch (err) {
        console.warn('VenueMapBuilder: could not load map data', err)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [eventId])

  // ── SVG coordinate from mouse event ─────────────────────────────────
  const svgPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const x    = (e.clientX - rect.left - pan.x) / zoom
    const y    = (e.clientY - rect.top  - pan.y) / zoom
    return { x, y }
  }, [zoom, pan])

  // ── Pan handlers (middle mouse / space+drag) ─────────────────────────
  const onSVGMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || e.button === 1 || e.altKey) {
      panRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y }
      e.preventDefault()
      return
    }
    if (e.button !== 0) return
    const pt = svgPoint(e)
    setDrawing({ startX: snapToGrid(pt.x), startY: snapToGrid(pt.y), x: snapToGrid(pt.x), y: snapToGrid(pt.y), w: 0, h: 0 })
    setSelectedZone(null)
  }, [readOnly, pan, svgPoint])

  const onSVGMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (panRef.current.dragging) {
      const dx = e.clientX - panRef.current.startX
      const dy = e.clientY - panRef.current.startY
      setPan({ x: panRef.current.originX + dx, y: panRef.current.originY + dy })
      return
    }
    if (drawing) {
      const pt = svgPoint(e)
      const sx = drawing.startX
      const sy = drawing.startY
      const cx = snapToGrid(pt.x)
      const cy = snapToGrid(pt.y)
      setDrawing({
        startX: sx, startY: sy,
        x: Math.min(sx, cx),
        y: Math.min(sy, cy),
        w: Math.abs(cx - sx),
        h: Math.abs(cy - sy),
      })
    }
  }, [drawing, svgPoint])

  const onSVGMouseUp = useCallback(() => {
    if (panRef.current.dragging) {
      panRef.current.dragging = false
      return
    }
    if (drawing && drawing.w > GRID_SIZE && drawing.h > GRID_SIZE) {
      const newZone: VenueZone = {
        id:        uid(),
        name:      `Nova zona ${zones.length + 1}`,
        zone_type: drawMode,
        x:         drawing.x,
        y:         drawing.y,
        width:     drawing.w,
        height:    drawing.h,
      }
      setZones(prev => [...prev, newZone])
      setSelectedZone(newZone)
    }
    setDrawing(null)
  }, [drawing, drawMode, zones.length])

  // ── Wheel zoom ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    setZoom(z => Math.min(3, Math.max(0.3, z - e.deltaY * 0.001)))
  }, [])

  // ── Zoom buttons ─────────────────────────────────────────────────────
  const zoomIn  = () => setZoom(z => Math.min(3, +(z + 0.2).toFixed(1)))
  const zoomOut = () => setZoom(z => Math.max(0.3, +(z - 0.2).toFixed(1)))

  // ── Delete zone ───────────────────────────────────────────────────────
  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
    if (selectedZone?.id === id) setSelectedZone(null)
  }

  // ── Update zone field ─────────────────────────────────────────────────
  const updateZone = (id: string, patch: Partial<VenueZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...patch } : z))
    setSelectedZone(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      // Upsert venue_map
      const { data: mapRow, error: mapErr } = await supabase
        .from('venue_maps' as never)
        .upsert({ event_id: eventId, updated_at: new Date().toISOString() }, { onConflict: 'event_id' })
        .select('id')
        .single() as { data: { id: string } | null; error: unknown }

      if (mapErr || !mapRow) throw mapErr ?? new Error('no map row')
      const mapId = mapRow.id

      // Upsert zones
      if (zones.length > 0) {
        const payload = zones.map(z => ({ ...z, map_id: mapId, event_id: eventId }))
        await supabase.from('venue_zones' as never).upsert(payload, { onConflict: 'id' })
      }

      setSaveMsg('Mapa salvo com sucesso!')
    } catch (err) {
      console.error('Save failed', err)
      setSaveMsg('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Carregando mapa do venue...</span>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white font-sans">

      {/* ── Left sidebar ──────────────────────────────────────────────── */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-bg-secondary shrink-0">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-acid" />
            <span className="text-sm font-bold text-text-primary">Mapa do Venue</span>
          </div>
          <div className="mt-0.5 text-xs text-text-muted">{zones.length} zonas · {items.length} itens</div>
        </div>

        {/* Zone type selector */}
        {!readOnly && (
          <div className="border-b border-gray-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Tipo de zona</p>
            <div className="grid grid-cols-2 gap-1">
              {ZONE_TYPES.map(type => {
                const cfg = ZONE_CONFIG[type]
                return (
                  <button
                    key={type}
                    onClick={() => setDrawMode(type)}
                    className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-all ${
                      drawMode === type
                        ? 'ring-2 ring-offset-1'
                        : 'hover:bg-gray-100'
                    }`}
                    style={drawMode === type ? { background: `${cfg.fill}20`, color: cfg.stroke, outlineColor: cfg.fill } : {}}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ background: cfg.fill }}
                    />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-text-muted">Arraste no mapa para criar zona</p>
          </div>
        )}

        {/* Zone list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Zonas</p>
          {zones.length === 0 && (
            <p className="text-xs text-text-muted py-4 text-center">Nenhuma zona adicionada.</p>
          )}
          {zones.map(zone => {
            const cfg = ZONE_CONFIG[zone.zone_type] ?? ZONE_CONFIG.general
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-all hover:bg-gray-100 ${
                  selectedZone?.id === zone.id ? 'bg-gray-100 ring-1 ring-gray-300' : ''
                }`}
              >
                <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: cfg.fill }} />
                <span className="flex-1 truncate font-medium text-text-primary">{zone.name}</span>
                <ChevronRight className="h-3 w-3 text-text-muted" />
              </button>
            )
          })}
        </div>

        {/* Save button */}
        {!readOnly && (
          <div className="border-t border-gray-200 p-3">
            {saveMsg && (
              <div className={`mb-2 rounded px-2 py-1.5 text-xs font-medium ${
                saveMsg.includes('sucesso') ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
              }`}>
                {saveMsg}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-yellow py-2 text-sm font-bold text-brand-navy disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Salvar Mapa'}
            </button>
          </div>
        )}
      </aside>

      {/* ── Main canvas area ──────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden bg-gray-50">

        {/* Zoom controls */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white shadow-sm">
          <button onClick={zoomIn}  className="flex h-8 w-8 items-center justify-center hover:bg-gray-50 transition-colors rounded-t-lg">
            <ZoomIn  className="h-4 w-4 text-gray-600" />
          </button>
          <div className="border-t border-gray-200 py-0.5 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</div>
          <button onClick={zoomOut} className="flex h-8 w-8 items-center justify-center hover:bg-gray-50 transition-colors rounded-b-lg border-t border-gray-200">
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Mode hint */}
        {!readOnly && (
          <div className="absolute left-4 top-4 z-10 rounded-md bg-white/80 border border-gray-200 px-3 py-1.5 text-xs text-gray-500 backdrop-blur-sm shadow-sm">
            Arraste para criar · Alt+drag para mover · Scroll para zoom
          </div>
        )}

        {/* SVG canvas */}
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className={`block ${!readOnly ? 'cursor-crosshair' : 'cursor-grab'}`}
          onMouseDown={onSVGMouseDown}
          onMouseMove={onSVGMouseMove}
          onMouseUp={onSVGMouseUp}
          onMouseLeave={onSVGMouseUp}
          onWheel={onWheel}
          style={{ userSelect: 'none' }}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

            {/* Grid background */}
            <defs>
              <pattern id="grid-small" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-large" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
                <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#grid-small)" />
                <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#d1d5db" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid-large)" rx="4" />

            {/* Canvas border */}
            <rect width={CANVAS_W} height={CANVAS_H} fill="none" stroke="#d1d5db" strokeWidth="1" rx="4" />

            {/* Zones */}
            {zones.map(zone => {
              const cfg       = ZONE_CONFIG[zone.zone_type] ?? ZONE_CONFIG.general
              const isSelected = selectedZone?.id === zone.id
              return (
                <g
                  key={zone.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedZone(zone) }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={zone.x} y={zone.y}
                    width={zone.width} height={zone.height}
                    fill={`${cfg.fill}30`}
                    stroke={isSelected ? cfg.stroke : cfg.fill}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    rx={4}
                    strokeDasharray={isSelected ? '6 3' : undefined}
                  />
                  {/* Zone label */}
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + zone.height / 2 - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill={cfg.stroke}
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif', pointerEvents: 'none' }}
                  >
                    {zone.name}
                  </text>
                  {/* Zone type sub-label */}
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + zone.height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill={`${cfg.stroke}99`}
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif', pointerEvents: 'none' }}
                  >
                    {cfg.label}{zone.capacity ? ` · Cap ${zone.capacity}` : ''}
                  </text>
                </g>
              )
            })}

            {/* Items */}
            {items.map(item => (
              <g key={item.id} transform={`translate(${item.x},${item.y})`} style={{ cursor: 'default' }}>
                <circle r={10} fill="#fff" stroke="#d1d5db" strokeWidth={1} />
                <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#374151">
                  <ItemIcon type={item.item_type} />
                </text>
              </g>
            ))}

            {/* Drawing preview */}
            {drawing && drawing.w > 0 && drawing.h > 0 && (
              <rect
                x={drawing.x} y={drawing.y}
                width={drawing.w} height={drawing.h}
                fill={`${ZONE_CONFIG[drawMode]?.fill ?? '#6b7280'}20`}
                stroke={ZONE_CONFIG[drawMode]?.fill ?? '#6b7280'}
                strokeWidth={2}
                strokeDasharray="6 3"
                rx={4}
              />
            )}
          </g>
        </svg>
      </div>

      {/* ── Zone detail panel ─────────────────────────────────────────── */}
      {selectedZone && (
        <aside className="flex w-64 flex-col border-l border-gray-200 bg-white shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <ZoneIcon type={selectedZone.zone_type} size={14} />
              <span className="text-sm font-bold text-text-primary">Detalhes</span>
            </div>
            <button onClick={() => setSelectedZone(null)} className="rounded p-0.5 hover:bg-gray-100">
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="flex-1 space-y-4 p-4">
            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Nome</label>
              {readOnly ? (
                <p className="text-sm font-medium text-text-primary">{selectedZone.name}</p>
              ) : (
                <input
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-acid focus:outline-none"
                  value={selectedZone.name}
                  onChange={e => updateZone(selectedZone.id, { name: e.target.value })}
                />
              )}
            </div>

            {/* Type */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Tipo</label>
              {readOnly ? (
                <p className="text-sm font-medium text-text-primary">{ZONE_CONFIG[selectedZone.zone_type]?.label ?? selectedZone.zone_type}</p>
              ) : (
                <select
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-acid focus:outline-none"
                  value={selectedZone.zone_type}
                  onChange={e => updateZone(selectedZone.id, { zone_type: e.target.value as ZoneType })}
                >
                  {ZONE_TYPES.map(t => (
                    <option key={t} value={t}>{ZONE_CONFIG[t].label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Capacidade</label>
              {readOnly ? (
                <p className="text-sm text-text-primary">{selectedZone.capacity ?? '—'}</p>
              ) : (
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-acid focus:outline-none"
                  value={selectedZone.capacity ?? ''}
                  placeholder="Ex: 500"
                  onChange={e => updateZone(selectedZone.id, { capacity: Number(e.target.value) || undefined })}
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Status</label>
              {readOnly ? (
                <p className="text-sm text-text-primary">{selectedZone.status ?? '—'}</p>
              ) : (
                <select
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-acid focus:outline-none"
                  value={selectedZone.status ?? ''}
                  onChange={e => updateZone(selectedZone.id, { status: e.target.value || undefined })}
                >
                  <option value="">—</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="locked">Bloqueado</option>
                </select>
              )}
            </div>

            {/* Responsible */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Responsável</label>
              {readOnly ? (
                <p className="text-sm text-text-primary">{selectedZone.responsible ?? '—'}</p>
              ) : (
                <input
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-acid focus:outline-none"
                  value={selectedZone.responsible ?? ''}
                  placeholder="Nome do responsável..."
                  onChange={e => updateZone(selectedZone.id, { responsible: e.target.value || undefined })}
                />
              )}
            </div>

            {/* Position / size info */}
            <div className="rounded-md bg-gray-50 p-3 text-xs text-text-muted space-y-0.5">
              <p>X: {selectedZone.x}  Y: {selectedZone.y}</p>
              <p>Largura: {selectedZone.width}  Altura: {selectedZone.height}</p>
            </div>

            {/* Delete */}
            {!readOnly && (
              <button
                onClick={() => deleteZone(selectedZone.id)}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-status-error/30 bg-status-error/5 py-2 text-xs font-semibold text-status-error hover:bg-status-error/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Excluir zona
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
