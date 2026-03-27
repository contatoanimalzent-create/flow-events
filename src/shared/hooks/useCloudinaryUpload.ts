import { useState } from 'react'

interface UploadOptions {
  maxSize?: number // in MB
  folder?: string
}

export function useCloudinaryUpload(options: UploadOptions = {}) {
  const { maxSize = 10, folder = 'capital-strike' } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File): Promise<string | null> => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande (máximo ${maxSize}MB)`)
      return null
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '')
      formData.append('folder', `flow-events/${folder}`)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.secure_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload error'
      setError(message)
      console.error('Cloudinary upload error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return { upload, loading, error, clearError }
}
