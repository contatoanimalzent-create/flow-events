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
    const { data } = await supabase
      .from('venue_maps')
      .select('id, event_id, image_url, zones, updated_at')
      .eq('event_id', eventId)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      eventId: data.event_id,
      imageUrl: data.image_url ?? null,
      zones: (data.zones as VenueZone[]) ?? [],
      updatedAt: data.updated_at,
    }
  },

  async saveMap(eventId: string, imageUrl: string | null, zones: VenueZone[]): Promise<void> {
    await supabase.from('venue_maps').upsert({
      event_id: eventId,
      image_url: imageUrl,
      zones,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_id' })
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
