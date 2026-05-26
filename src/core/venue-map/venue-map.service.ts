import { supabase } from '@/lib/supabase'

export interface VenueZone {
  id: string
  name: string
  color: string
  // Normalized coordinates 0-100 (percentage of image dimensions)
  x: number
  y: number
  width: number
  height: number
  description: string | null
}

export interface VenueMap {
  id: string
  eventId: string
  imageUrl: string | null
  zones: VenueZone[]
  updatedAt: string
}

export const venueMapService = {
  async getMap(eventId: string): Promise<VenueMap | null> {
    // venue_maps uses venue_id (FK to venues) and map_image_url;
    // zones live in the separate venue_zones table, joined via venue_map_id.
    const { data } = await supabase
      .from('venue_maps')
      .select(`
        id, venue_id, map_image_url, updated_at,
        venue_zones (id, name, color, polygon_coords, capacity, zone_type)
      `)
      .eq('venue_id', eventId)
      .maybeSingle()

    if (!data) return null

    const zones: VenueZone[] = ((data as any).venue_zones ?? []).map((z: any) => ({
      id: z.id,
      name: z.name,
      color: z.color ?? '#888',
      x: z.polygon_coords?.[0]?.x ?? 0,
      y: z.polygon_coords?.[0]?.y ?? 0,
      width: 0,
      height: 0,
      description: z.zone_type ?? null,
    }))

    return {
      id: data.id,
      eventId: data.venue_id,
      imageUrl: data.map_image_url ?? null,
      zones,
      updatedAt: data.updated_at,
    }
  },

  async saveMap(eventId: string, imageUrl: string | null, _zones: VenueZone[]): Promise<void> {
    // venue_maps stores venue_id + map_image_url; zones are rows in venue_zones.
    await supabase.from('venue_maps').upsert({
      venue_id: eventId,
      map_image_url: imageUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'venue_id' })
  },

  async uploadFloorPlan(eventId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `venue-maps/${eventId}/floor-plan.${ext}`

    const { error } = await supabase.storage
      .from('event-assets')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage
      .from('event-assets')
      .getPublicUrl(path)

    return publicUrl
  },
}
