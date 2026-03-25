import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type {
  EventAssetListOptions,
  EventAssetReorderInput,
  EventAssetUpdateInput,
  EventAssetUploadInput,
  EventMediaAsset,
} from '@/features/event-media/types'
import { removeEventMediaFile, uploadEventMediaFile } from './event-media.provider'

const eventMediaApi = createApiClient('event-media')

function assertUploadResult(asset: {
  provider: string
  url: string
  secureUrl: string
  thumbnailUrl: string | null
  mimeType: string | null
  width: number | null
  height: number | null
  duration: number | null
}, assetType: EventAssetUploadInput['assetType']) {
  if (!asset.provider || !asset.url || !asset.secureUrl) {
    throw new Error('Upload incompleto: provider e URLs finais sao obrigatorios')
  }

  if (assetType === 'video' && !asset.thumbnailUrl) {
    throw new Error('Upload incompleto: video precisa de thumbnail_url')
  }

  if (assetType === 'image' && asset.duration) {
    throw new Error('Upload invalido: imagens nao devem registrar duracao')
  }
}

async function getEventActiveAssets(eventId: string) {
  const result = await supabase
    .from('event_assets')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (result.error) {
    throw new Error(result.error.message)
  }

  return (result.data as EventMediaAsset[] | null) ?? []
}

async function getEventAssetOrThrow(assetId: string) {
  const result = await supabase.from('event_assets').select('*').eq('id', assetId).single()

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? 'Asset nao encontrado')
  }

  return result.data as EventMediaAsset
}

async function getNextSortOrder(eventId: string) {
  const result = await supabase
    .from('event_assets')
    .select('sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (result.error) {
    throw new Error(result.error.message)
  }

  return ((result.data?.[0]?.sort_order as number | undefined) ?? -1) + 1
}

async function syncLegacyEventMediaFields(eventId: string) {
  const eventResult = await supabase.from('events').select('cover_url, settings').eq('id', eventId).single()

  if (eventResult.error || !eventResult.data) {
    throw new Error(eventResult.error?.message ?? 'Evento nao encontrado')
  }

  const assets = await getEventActiveAssets(eventId)
  const coverAsset = assets.find((asset) => asset.usage_type === 'cover' && asset.asset_type === 'image')
  const heroAsset = assets.find((asset) => asset.usage_type === 'hero' && asset.asset_type === 'video')
  const currentSettings = (eventResult.data.settings as Record<string, unknown> | null) ?? {}
  const nextSettings = { ...currentSettings }

  if (heroAsset?.secure_url ?? heroAsset?.url) {
    nextSettings.video_url = heroAsset.secure_url ?? heroAsset.url
  } else {
    delete nextSettings.video_url
  }

  const updateResult = await supabase
    .from('events')
    .update({
      cover_url: coverAsset?.secure_url ?? coverAsset?.url ?? null,
      settings: nextSettings,
    })
    .eq('id', eventId)

  if (updateResult.error) {
    throw new Error(updateResult.error.message)
  }
}

async function deactivateSiblingUsage(eventId: string, usageType: 'cover' | 'hero', assetId: string) {
  const result = await supabase
    .from('event_assets')
    .update({ is_active: false })
    .eq('event_id', eventId)
    .eq('usage_type', usageType)
    .neq('id', assetId)

  if (result.error) {
    throw new Error(result.error.message)
  }
}

export const eventMediaService = {
  async listEventAssets(eventId: string, options: EventAssetListOptions = {}) {
    return eventMediaApi.query('list_event_assets', async () => {
      let query = supabase
        .from('event_assets')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (options.activeOnly) {
        query = query.eq('is_active', true)
      }

      const result = await query

      if (result.error) {
        throw new Error(result.error.message)
      }

      return (result.data as EventMediaAsset[] | null) ?? []
    }, { eventId, activeOnly: options.activeOnly ?? false })
  },

  async uploadEventAsset(input: EventAssetUploadInput) {
    return eventMediaApi.mutation('upload_event_asset', async () => {
      const uploadedAsset = await uploadEventMediaFile({
        organizationId: input.organizationId,
        eventId: input.eventId,
        assetType: input.assetType,
        file: input.file,
        externalUrl: input.externalUrl?.trim(),
        thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
      })
      assertUploadResult(uploadedAsset, input.assetType)

      const sortOrder = await getNextSortOrder(input.eventId)
      const insertResult = await supabase
        .from('event_assets')
        .insert({
          organization_id: input.organizationId,
          event_id: input.eventId,
          asset_type: input.assetType,
          usage_type: input.usageType,
          provider: uploadedAsset.provider,
          provider_asset_id: uploadedAsset.providerAssetId,
          url: uploadedAsset.url,
          secure_url: uploadedAsset.secureUrl,
          thumbnail_url: uploadedAsset.thumbnailUrl,
          width: uploadedAsset.width,
          height: uploadedAsset.height,
          duration: uploadedAsset.duration,
          mime_type: uploadedAsset.mimeType,
          alt_text: input.altText?.trim() || null,
          caption: input.caption?.trim() || null,
          sort_order: sortOrder,
          is_active: input.isActive ?? true,
          created_by: input.createdBy ?? null,
        })
        .select('*')
        .single()

      if (insertResult.error || !insertResult.data) {
        throw new Error(insertResult.error?.message ?? 'Nao foi possivel salvar o asset')
      }

      const asset = insertResult.data as EventMediaAsset

      if (asset.usage_type === 'cover' && asset.is_active) {
        await deactivateSiblingUsage(asset.event_id, 'cover', asset.id)
      }

      if (asset.usage_type === 'hero' && asset.is_active) {
        await deactivateSiblingUsage(asset.event_id, 'hero', asset.id)
      }

      await syncLegacyEventMediaFields(input.eventId)
      return asset
    }, { organizationId: input.organizationId, eventId: input.eventId, usageType: input.usageType, assetType: input.assetType })
  },

  async updateEventAsset(input: EventAssetUpdateInput) {
    return eventMediaApi.mutation('update_event_asset', async () => {
      const currentAsset = await getEventAssetOrThrow(input.assetId)
      const nextUsageType = input.usageType ?? currentAsset.usage_type
      const result = await supabase
        .from('event_assets')
        .update({
          usage_type: nextUsageType,
          alt_text: input.altText === undefined ? currentAsset.alt_text : input.altText,
          caption: input.caption === undefined ? currentAsset.caption : input.caption,
          is_active: input.isActive ?? currentAsset.is_active,
          sort_order: input.sortOrder ?? currentAsset.sort_order,
          thumbnail_url: input.thumbnailUrl === undefined ? currentAsset.thumbnail_url : input.thumbnailUrl,
        })
        .eq('id', input.assetId)
        .select('*')
        .single()

      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? 'Nao foi possivel atualizar o asset')
      }

      const asset = result.data as EventMediaAsset

      if (asset.usage_type === 'cover' && asset.is_active) {
        await deactivateSiblingUsage(asset.event_id, 'cover', asset.id)
      }

      if (asset.usage_type === 'hero' && asset.is_active) {
        await deactivateSiblingUsage(asset.event_id, 'hero', asset.id)
      }

      await syncLegacyEventMediaFields(asset.event_id)
      return asset
    }, { assetId: input.assetId })
  },

  async deleteEventAsset(assetId: string) {
    return eventMediaApi.mutation('delete_event_asset', async () => {
      const asset = await getEventAssetOrThrow(assetId)

      await removeEventMediaFile(asset)

      const result = await supabase.from('event_assets').delete().eq('id', assetId)

      if (result.error) {
        throw new Error(result.error.message)
      }

      await syncLegacyEventMediaFields(asset.event_id)
      return true
    }, { assetId })
  },

  async reorderEventAssets(input: EventAssetReorderInput) {
    return eventMediaApi.mutation('reorder_event_assets', async () => {
      const results = await Promise.all(
        input.orderedIds.map((assetId, index) =>
          supabase.from('event_assets').update({ sort_order: index }).eq('id', assetId),
        ),
      )

      const failedResult = results.find((result) => result.error)

      if (failedResult?.error) {
        throw new Error(failedResult.error.message)
      }

      await syncLegacyEventMediaFields(input.eventId)
      return true
    }, { eventId: input.eventId, assetCount: input.orderedIds.length })
  },

  async setEventCoverAsset(eventId: string, assetId: string) {
    return eventMediaApi.mutation('set_event_cover_asset', async () => {
      const asset = await getEventAssetOrThrow(assetId)

      if (asset.asset_type !== 'image') {
        throw new Error('A capa do evento precisa ser uma imagem')
      }

      await deactivateSiblingUsage(eventId, 'cover', assetId)
      const result = await supabase
        .from('event_assets')
        .update({ usage_type: 'cover', is_active: true })
        .eq('id', assetId)
        .eq('event_id', eventId)

      if (result.error) {
        throw new Error(result.error.message)
      }

      await syncLegacyEventMediaFields(eventId)
      return true
    }, { eventId, assetId })
  },

  async setEventHeroAsset(eventId: string, assetId: string) {
    return eventMediaApi.mutation('set_event_hero_asset', async () => {
      const asset = await getEventAssetOrThrow(assetId)

      if (asset.asset_type !== 'video') {
        throw new Error('O hero principal precisa ser um video')
      }

      await deactivateSiblingUsage(eventId, 'hero', assetId)
      const result = await supabase
        .from('event_assets')
        .update({ usage_type: 'hero', is_active: true })
        .eq('id', assetId)
        .eq('event_id', eventId)

      if (result.error) {
        throw new Error(result.error.message)
      }

      await syncLegacyEventMediaFields(eventId)
      return true
    }, { eventId, assetId })
  },
}
