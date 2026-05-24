import React, { useEffect, useState } from 'react'
import { ChevronLeft, MapPin, Loader2, Map } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { venueMapService } from '@/core/venue-map/venue-map.service'
import type { VenueMap } from '@/core/venue-map/venue-map.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function AttendeeMapPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [map, setMap] = useState<VenueMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = async () => {
    if (!context?.eventId) { setLoading(false); return }
    setLoading(true)
    setError(false)
    try {
      const data = await venueMapService.getMap(context.eventId)
      setMap(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [context?.eventId])

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Mapa do Evento</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <p className="text-slate-400 text-sm">Erro ao carregar dados.</p>
          <button onClick={load} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : !map ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Map size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Mapa não disponível para este evento</p>
        </div>
      ) : (
        <>
          <div className="px-4 mb-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden relative">
              {map.imageUrl ? (
                <div className="relative">
                  <img
                    src={map.imageUrl}
                    alt="Mapa do evento"
                    className="w-full block"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {/* SVG zone overlay */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {(map.zones ?? []).map((zone) => (
                      <g key={zone.id}>
                        <rect
                          x={zone.x} y={zone.y} width={zone.width} height={zone.height}
                          fill={zone.color + '33'} stroke={zone.color} strokeWidth="0.5"
                        />
                        <text
                          x={zone.x + zone.width / 2} y={zone.y + zone.height / 2}
                          textAnchor="middle" dominantBaseline="middle"
                          fill={zone.color} fontSize="3" fontWeight="bold"
                        >
                          {zone.name}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1' }}>
                  <rect width="100" height="100" fill="#080f1e" />
                  {(map.zones ?? []).map((zone) => (
                    <g key={zone.id}>
                      <rect
                        x={zone.x} y={zone.y} width={zone.width} height={zone.height}
                        fill={zone.color + '22'} stroke={zone.color + '66'} strokeWidth="0.5" rx="2"
                      />
                      <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 + 1}
                        textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3">
                        {zone.name}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {(map.zones ?? []).length > 0 && (
            <div className="px-4 space-y-2">
              {map.zones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                  <MapPin size={14} style={{ color: zone.color }} className="shrink-0" />
                  <p className="text-white text-sm font-medium">{zone.name}</p>
                  {zone.description && <p className="text-slate-500 text-xs ml-auto">{zone.description}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
