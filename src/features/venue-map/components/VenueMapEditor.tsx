import React, { useState, useRef } from 'react'
import { Upload, Trash2, Save, Loader2 } from 'lucide-react'
import { venueMapService } from '@/core/venue-map/venue-map.service'
import type { VenueZone, VenueMap } from '@/core/venue-map/venue-map.service'

interface Props {
  eventId: string
  initialMap?: VenueMap | null
  onSaved?: () => void
}

const ZONE_COLORS = ['#0057E7', '#22C55E', '#F97316', '#7C3AED', '#d97706', '#EF4444', '#06b6d4', '#ec4899']

export function VenueMapEditor({ eventId, initialMap, onSaved }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialMap?.imageUrl ?? null)
  const [zones, setZones] = useState<VenueZone[]>(initialMap?.zones ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const toRelative = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * 100),
      y: Math.round(((clientY - rect.top) / rect.height) * 100),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return
    const pos = toRelative(e.clientX, e.clientY)
    setDrawStart(pos)
    setDrawCurrent(pos)
    setDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !drawStart) return
    setDrawCurrent(toRelative(e.clientX, e.clientY))
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !drawStart) return
    const end = toRelative(e.clientX, e.clientY)
    const x = Math.min(drawStart.x, end.x)
    const y = Math.min(drawStart.y, end.y)
    const width = Math.abs(end.x - drawStart.x)
    const height = Math.abs(end.y - drawStart.y)
    if (width > 3 && height > 3) {
      const newZone: VenueZone = {
        id: `zone-${Date.now()}`,
        name: `Zona ${zones.length + 1}`,
        color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
        x, y, width, height,
        description: null,
      }
      setZones((prev) => [...prev, newZone])
      setEditingZone(newZone.id)
    }
    setDrawing(false)
    setDrawStart(null)
    setDrawCurrent(null)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await venueMapService.uploadFloorPlan(eventId, file)
      setImageUrl(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Erro ao fazer upload: ' + message)
    } finally {
      setUploading(false)
    }
  }

  const updateZone = (id: string, updates: Partial<VenueZone>) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, ...updates } : z))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await venueMapService.saveMap(eventId, imageUrl, zones)
      onSaved?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Erro ao salvar: ' + message)
    } finally {
      setSaving(false)
    }
  }

  const drawRect = drawStart && drawCurrent ? {
    x: Math.min(drawStart.x, drawCurrent.x),
    y: Math.min(drawStart.y, drawCurrent.y),
    w: Math.abs(drawCurrent.x - drawStart.x),
    h: Math.abs(drawCurrent.y - drawStart.y),
  } : null

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold"
          disabled={uploading}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {imageUrl ? 'Trocar imagem' : 'Upload da planta'}
        </button>
        {imageUrl && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar mapa
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {!imageUrl ? (
        <div className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex items-center justify-center text-slate-500 text-sm">
          Faça upload de uma planta ou foto do espaço
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-xs">Clique e arraste sobre o mapa para criar zonas</p>
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-white/10 select-none"
            style={{ cursor: 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img src={imageUrl} alt="Planta" className="w-full block" draggable={false} />

            {/* Existing zones */}
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="absolute border-2 flex items-center justify-center text-center text-[10px] font-bold cursor-pointer"
                style={{
                  left: `${zone.x}%`, top: `${zone.y}%`,
                  width: `${zone.width}%`, height: `${zone.height}%`,
                  backgroundColor: zone.color + '33',
                  borderColor: zone.color,
                  color: zone.color,
                }}
                onClick={(e) => { e.stopPropagation(); setEditingZone(zone.id) }}
              >
                {zone.name}
              </div>
            ))}

            {/* Drawing preview */}
            {drawRect && (
              <div
                className="absolute pointer-events-none border-2 border-dashed border-white/60 bg-white/10"
                style={{
                  left: `${drawRect.x}%`, top: `${drawRect.y}%`,
                  width: `${drawRect.w}%`, height: `${drawRect.h}%`,
                }}
              />
            )}
          </div>

          {/* Zone list */}
          {zones.length > 0 && (
            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${editingZone === zone.id ? 'border-white/20 bg-white/8' : 'border-white/8 bg-white/4'}`}
                >
                  <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: zone.color }} />
                  {editingZone === zone.id ? (
                    <>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        className="flex-1 bg-transparent text-white text-sm outline-none border-b border-white/20"
                        autoFocus
                        onBlur={() => setEditingZone(null)}
                      />
                      <div className="flex gap-1">
                        {ZONE_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateZone(zone.id, { color: c })}
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="flex-1 text-white text-sm">{zone.name}</p>
                  )}
                  <button
                    onClick={() => setZones((prev) => prev.filter((z) => z.id !== zone.id))}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
