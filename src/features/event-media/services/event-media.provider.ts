import { supabase } from '@/lib/supabase'
import type { EventMediaAsset, EventMediaAssetType, EventMediaProvider, EventMediaProviderStatus } from '@/features/event-media/types'

interface UploadedProviderAsset {
  provider: EventMediaProvider
  providerAssetId: string | null
  url: string
  secureUrl: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  duration: number | null
  mimeType: string | null
}

interface UploadProviderInput {
  organizationId: string
  eventId: string
  assetType: EventMediaAssetType
  file?: File | null
  externalUrl?: string
  thumbnailUrl?: string
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER ?? 'animalz-events'
const SUPABASE_BUCKET = import.meta.env.VITE_EVENT_MEDIA_SUPABASE_BUCKET ?? 'organization-assets'
const CLOUDINARY_EDGE_FUNCTION = 'cloudinary-upload'

function hasCloudinaryConfig() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)
}

function hasSupabaseFunctionConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-')
}

function buildCloudinaryThumbnailUrl(publicId: string, assetType: EventMediaAssetType) {
  if (!CLOUDINARY_CLOUD_NAME || assetType !== 'video') {
    return null
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${publicId}.jpg`
}

async function uploadToCloudinary(input: UploadProviderInput): Promise<UploadedProviderAsset> {
  if (!input.file || !hasSupabaseFunctionConfig()) {
    throw new Error('Cloudinary upload indisponivel')
  }

  const formData = new FormData()
  formData.append('file', input.file)
  formData.append('organizationId', input.organizationId)
  formData.append('eventId', input.eventId)
  formData.append('assetType', input.assetType)
  formData.append('folder', `${CLOUDINARY_FOLDER}/${input.organizationId}/${input.eventId}`)

  if (input.thumbnailUrl) {
    formData.append('thumbnailUrl', input.thumbnailUrl)
  }

  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${CLOUDINARY_EDGE_FUNCTION}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: formData,
  })

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string
        provider?: EventMediaProvider
        providerAssetId?: string | null
        url?: string
        secureUrl?: string
        thumbnailUrl?: string | null
        width?: number | null
        height?: number | null
        duration?: number | null
        mimeType?: string | null
      }
    | null

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Nao foi possivel enviar o arquivo para o Cloudinary')
  }

  if (!payload?.secureUrl) {
    throw new Error('Cloudinary retornou um asset sem URL segura')
  }

  return {
    provider: payload.provider ?? 'cloudinary',
    providerAssetId: payload.providerAssetId ?? null,
    url: payload.url ?? payload.secureUrl,
    secureUrl: payload.secureUrl,
    thumbnailUrl:
      payload.thumbnailUrl ??
      input.thumbnailUrl ??
      buildCloudinaryThumbnailUrl(payload.providerAssetId ?? '', input.assetType),
    width: payload.width ?? null,
    height: payload.height ?? null,
    duration: payload.duration ?? null,
    mimeType: payload.mimeType ?? input.file.type ?? null,
  }
}

async function uploadToSupabaseStorage(input: UploadProviderInput): Promise<UploadedProviderAsset> {
  if (!input.file) {
    throw new Error('Arquivo obrigatorio para upload no storage')
  }

  const fileName = sanitizeFileName(input.file.name)
  const filePath = `events/${input.organizationId}/${input.eventId}/${Date.now()}-${fileName}`
  const result = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, input.file, { upsert: true })

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? 'Nao foi possivel enviar o arquivo para o storage')
  }

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(result.data.path)

  return {
    provider: 'supabase_storage',
    providerAssetId: result.data.path,
    url: data.publicUrl,
    secureUrl: data.publicUrl,
    thumbnailUrl: input.thumbnailUrl ?? (input.assetType === 'image' ? data.publicUrl : null),
    width: null,
    height: null,
    duration: null,
    mimeType: input.file.type || null,
  }
}

function mapExternalUrlAsset(input: UploadProviderInput): UploadedProviderAsset {
  if (!input.externalUrl) {
    throw new Error('URL externa obrigatoria')
  }

  return {
    provider: 'url',
    providerAssetId: null,
    url: input.externalUrl,
    secureUrl: input.externalUrl,
    thumbnailUrl: input.thumbnailUrl ?? (input.assetType === 'image' ? input.externalUrl : null),
    width: null,
    height: null,
    duration: null,
    mimeType: null,
  }
}

export function getEventMediaProviderStatus(): EventMediaProviderStatus {
  return {
    primaryProvider: hasSupabaseFunctionConfig() ? 'cloudinary' : 'supabase_storage',
    cloudinaryEnabled: hasSupabaseFunctionConfig() || hasCloudinaryConfig(),
    fallbackProvider: 'supabase_storage',
    bucketName: SUPABASE_BUCKET,
  }
}

export async function uploadEventMediaFile(input: UploadProviderInput): Promise<UploadedProviderAsset> {
  if (input.externalUrl?.trim()) {
    return mapExternalUrlAsset(input)
  }

  if (hasSupabaseFunctionConfig()) {
    try {
      return await uploadToCloudinary(input)
    } catch (error) {
      if (!input.file) {
        throw error
      }
    }
  }

  return uploadToSupabaseStorage(input)
}

export async function removeEventMediaFile(asset: Pick<EventMediaAsset, 'provider' | 'provider_asset_id'>) {
  if (asset.provider === 'supabase_storage' && asset.provider_asset_id) {
    const result = await supabase.storage.from(SUPABASE_BUCKET).remove([asset.provider_asset_id])

    if (result.error) {
      throw new Error(result.error.message)
    }
  }
}
