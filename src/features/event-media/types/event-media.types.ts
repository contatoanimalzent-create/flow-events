import type { AssetProvider, AssetType, AssetUsage, EventAsset } from '@/lib/supabase'

export type EventMediaAsset = EventAsset
export type EventMediaAssetType = AssetType
export type EventMediaUsageType = AssetUsage
export type EventMediaProvider = AssetProvider

export interface EventAssetListOptions {
  activeOnly?: boolean
}

export interface EventAssetUploadInput {
  organizationId: string
  eventId: string
  assetType: EventMediaAssetType
  usageType: EventMediaUsageType
  file?: File | null
  externalUrl?: string
  thumbnailUrl?: string
  altText?: string
  caption?: string
  isActive?: boolean
  createdBy?: string | null
}

export interface EventAssetUpdateInput {
  assetId: string
  usageType?: EventMediaUsageType
  altText?: string | null
  caption?: string | null
  isActive?: boolean
  sortOrder?: number
  thumbnailUrl?: string | null
}

export interface EventAssetReorderInput {
  eventId: string
  orderedIds: string[]
}

export interface EventMediaProviderStatus {
  primaryProvider: EventMediaProvider
  cloudinaryEnabled: boolean
  fallbackProvider: EventMediaProvider
  bucketName: string
}

export interface EventMediaPresentation {
  coverAsset: EventMediaAsset | null
  heroAsset: EventMediaAsset | null
  galleryImages: EventMediaAsset[]
  galleryVideos: EventMediaAsset[]
  assets: EventMediaAsset[]
}

export interface LegacyEventMediaSource {
  name?: string
  cover_url?: string | null
  settings?: {
    video_url?: string | null
  } | null
}

function sortAssets(left: EventMediaAsset, right: EventMediaAsset) {
  if (left.sort_order !== right.sort_order) {
    return left.sort_order - right.sort_order
  }

  return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
}

export function getEventAssetUrl(asset?: Pick<EventMediaAsset, 'secure_url' | 'url'> | null) {
  return asset?.secure_url ?? asset?.url ?? ''
}

export function isImageAsset(asset: Pick<EventMediaAsset, 'asset_type'>) {
  return asset.asset_type === 'image'
}

export function isVideoAsset(asset: Pick<EventMediaAsset, 'asset_type'>) {
  return asset.asset_type === 'video'
}

function createLegacyAsset(params: {
  id: string
  eventName?: string
  assetType: EventMediaAssetType
  usageType: EventMediaUsageType
  url: string
}): EventMediaAsset {
  return {
    id: params.id,
    organization_id: 'legacy',
    event_id: 'legacy',
    asset_type: params.assetType,
    usage_type: params.usageType,
    provider: 'url',
    provider_asset_id: null,
    url: params.url,
    secure_url: params.url,
    thumbnail_url: params.assetType === 'image' ? params.url : null,
    width: null,
    height: null,
    duration: null,
    mime_type: null,
    alt_text: params.eventName ? `${params.eventName} ${params.usageType}` : null,
    caption: null,
    sort_order: 0,
    is_active: true,
    created_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  }
}

export function buildEventMediaPresentation(
  assets: EventMediaAsset[],
  fallbackEvent?: LegacyEventMediaSource | null,
): EventMediaPresentation {
  const activeAssets = assets.filter((asset) => asset.is_active).sort(sortAssets)

  const coverAsset =
    activeAssets.find((asset) => asset.usage_type === 'cover' && asset.asset_type === 'image') ??
    (fallbackEvent?.cover_url
      ? createLegacyAsset({
          id: 'legacy-cover',
          eventName: fallbackEvent.name,
          assetType: 'image',
          usageType: 'cover',
          url: fallbackEvent.cover_url,
        })
      : null)

  const heroAsset =
    activeAssets.find((asset) => asset.usage_type === 'hero' && asset.asset_type === 'video') ??
    (fallbackEvent?.settings?.video_url
      ? createLegacyAsset({
          id: 'legacy-hero',
          eventName: fallbackEvent.name,
          assetType: 'video',
          usageType: 'hero',
          url: fallbackEvent.settings.video_url,
        })
      : null)

  return {
    coverAsset,
    heroAsset,
    galleryImages: activeAssets.filter((asset) => asset.usage_type === 'gallery' && asset.asset_type === 'image'),
    galleryVideos: activeAssets.filter((asset) => asset.usage_type === 'gallery' && asset.asset_type === 'video'),
    assets: activeAssets,
  }
}
