import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

function requiredEnv(name: string) {
  const value = Deno.env.get(name)

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function sha1Hex(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(digest))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('')
}

async function buildCloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return sha1Hex(`${serialized}${apiSecret}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // ── Auth check ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const organizationId = String(formData.get('organizationId') ?? '')
    const eventId = String(formData.get('eventId') ?? '')
    const assetType = String(formData.get('assetType') ?? 'image')
    const inputThumbnailUrl = String(formData.get('thumbnailUrl') ?? '')
    const cloudName = requiredEnv('CLOUDINARY_CLOUD_NAME')
    const folder = String(formData.get('folder') ?? Deno.env.get('CLOUDINARY_FOLDER') ?? 'animalz-events')

    if (!(file instanceof File)) {
      return Response.json({ error: 'file is required' }, { status: 400, headers: corsHeaders })
    }

    if (!organizationId || !eventId) {
      return Response.json({ error: 'organizationId and eventId are required' }, { status: 400, headers: corsHeaders })
    }

    if (assetType !== 'image' && assetType !== 'video') {
      return Response.json({ error: 'assetType must be image or video' }, { status: 400, headers: corsHeaders })
    }

    const publicId = `${folder}/${Date.now()}-${sanitizeFileName(file.name || assetType)}`
    const timestamp = String(Math.floor(Date.now() / 1000))
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')
    const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET')

    if (apiKey && apiSecret) {
      const signature = await buildCloudinarySignature(
        {
          folder,
          public_id: publicId,
          timestamp,
        },
        apiSecret,
      )

      uploadFormData.append('api_key', apiKey)
      uploadFormData.append('timestamp', timestamp)
      uploadFormData.append('signature', signature)
      uploadFormData.append('folder', folder)
      uploadFormData.append('public_id', publicId)
    } else if (uploadPreset) {
      uploadFormData.append('upload_preset', uploadPreset)
      uploadFormData.append('folder', folder)
      uploadFormData.append('public_id', publicId)
    } else {
      return Response.json(
        { error: 'Cloudinary credentials are not configured in the edge environment' },
        { status: 500, headers: corsHeaders },
      )
    }

    const resourceType = assetType === 'video' ? 'video' : 'image'
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const payload = await response.json().catch(() => null) as
      | {
          error?: { message?: string }
          public_id?: string
          url?: string
          secure_url?: string
          width?: number
          height?: number
          duration?: number
          format?: string
          resource_type?: string
        }
      | null

    if (!response.ok || !payload?.secure_url) {
      return Response.json(
        { error: payload?.error?.message ?? 'Cloudinary upload failed' },
        { status: response.ok ? 500 : response.status, headers: corsHeaders },
      )
    }

    const thumbnailUrl =
      inputThumbnailUrl ||
      (assetType === 'video' && payload.public_id
        ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${payload.public_id}.jpg`
        : payload.secure_url)

    return Response.json(
      {
        provider: 'cloudinary',
        providerAssetId: payload.public_id ?? null,
        url: payload.url ?? payload.secure_url,
        secureUrl: payload.secure_url,
        thumbnailUrl,
        width: payload.width ?? null,
        height: payload.height ?? null,
        duration: payload.duration ?? null,
        mimeType: file.type || null,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error('[cloudinary-upload]', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected upload error' },
      { status: 500, headers: corsHeaders },
    )
  }
})
