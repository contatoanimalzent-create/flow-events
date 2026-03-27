import { useState } from 'react'
import { Upload, Check, AlertCircle } from 'lucide-react'

interface CloudinaryUploadProps {
  onUpload: (url: string) => void
  label?: string
  className?: string
}

export function CloudinaryUpload({ onUpload, label = 'Upload Image', className = '' }: CloudinaryUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef: React.RefObject<HTMLInputElement> = React.useRef(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '')

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
      onUpload(data.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload error')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#c49a50] px-4 py-2 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0908] border-t-transparent" />
            Enviando...
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-4 w-4" />
            {label}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {label}
          </>
        )}
      </button>

      {error && <p className="mt-2 text-xs text-[#c45c6a]">{error}</p>}
    </div>
  )
}
