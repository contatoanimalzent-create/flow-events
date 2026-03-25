import { useEffect, useRef, useState } from 'react'
import { Film, ImageIcon, Link2, Loader2, UploadCloud, X } from 'lucide-react'
import { cn } from '@/shared/lib'
import type { EventAssetUploadInput, EventMediaAssetType, EventMediaUsageType } from '@/features/event-media/types'

interface EventAssetUploadModalProps {
  onClose: () => void
  onSubmit: (input: Omit<EventAssetUploadInput, 'organizationId' | 'eventId' | 'createdBy'>) => Promise<void>
  uploading?: boolean
}

type UploadSource = 'file' | 'url'

const usageOptions: EventMediaUsageType[] = ['cover', 'hero', 'gallery', 'thumbnail']

export function EventAssetUploadModal({ onClose, onSubmit, uploading = false }: EventAssetUploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<UploadSource>('file')
  const [assetType, setAssetType] = useState<EventMediaAssetType>('image')
  const [usageType, setUsageType] = useState<EventMediaUsageType>('gallery')
  const [file, setFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [altText, setAltText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (usageType === 'cover' || usageType === 'thumbnail') {
      setAssetType('image')
    }

    if (usageType === 'hero') {
      setAssetType('video')
    }
  }, [usageType])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(source === 'url' ? externalUrl.trim() : '')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [externalUrl, file, source])

  async function handleSubmit() {
    if (source === 'file' && !file) {
      setError('Selecione um arquivo para continuar')
      return
    }

    if (source === 'url' && !externalUrl.trim()) {
      setError('Informe uma URL para continuar')
      return
    }

    setError('')

    try {
      await onSubmit({
        assetType,
        usageType,
        file,
        externalUrl: externalUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        caption,
        altText,
        isActive,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel publicar o asset')
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-5 py-4">
          <div>
            <h3 className="font-display text-xl tracking-wide text-text-primary">
              NOVO ASSET<span className="text-brand-acid">.</span>
            </h3>
            <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">
              Upload de imagem ou video para a landing publica
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'file', label: 'Arquivo' },
              { key: 'url', label: 'URL externa' },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setSource(item.key)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  source === item.key
                    ? 'bg-brand-acid/15 text-brand-acid'
                    : 'border border-bg-border text-text-muted hover:bg-bg-surface hover:text-text-primary',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="input-label">Tipo do asset</label>
              <div className="flex gap-2">
                {([
                  { key: 'image', label: 'Imagem', icon: ImageIcon, disabled: usageType === 'hero' },
                  { key: 'video', label: 'Video', icon: Film, disabled: usageType === 'cover' || usageType === 'thumbnail' },
                ] as const).map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      onClick={() => !item.disabled && setAssetType(item.key)}
                      disabled={item.disabled}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-sm border px-3 py-2 text-sm transition-all',
                        assetType === item.key
                          ? 'border-brand-acid/40 bg-brand-acid/8 text-brand-acid'
                          : 'border-bg-border text-text-muted hover:text-text-primary',
                        item.disabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="input-label">Uso do asset</label>
              <select className="input" value={usageType} onChange={(event) => setUsageType(event.target.value as EventMediaUsageType)}>
                {usageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'cover'
                      ? 'Capa'
                      : option === 'hero'
                        ? 'Hero'
                        : option === 'thumbnail'
                          ? 'Thumbnail'
                          : 'Galeria'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {source === 'file' ? (
            <div>
              <label className="input-label">Arquivo</label>
              <input
                ref={fileRef}
                type="file"
                accept={assetType === 'image' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-bg-border px-4 py-8 text-center transition-all hover:border-brand-acid/40"
              >
                <UploadCloud className="h-6 w-6 text-brand-acid" />
                <span className="text-sm text-text-primary">{file?.name ?? `Selecionar ${assetType === 'image' ? 'imagem' : 'video'}`}</span>
                <span className="text-xs text-text-muted">Cloudinary quando configurado. Fallback automatico para storage.</span>
              </button>
            </div>
          ) : (
            <div>
              <label className="input-label">URL do asset</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  className="input pl-9"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(event) => setExternalUrl(event.target.value)}
                />
              </div>
            </div>
          )}

          {assetType === 'video' && (
            <div>
              <label className="input-label">Thumbnail do video</label>
              <input
                className="input"
                placeholder="https://.../thumbnail.jpg"
                value={thumbnailUrl}
                onChange={(event) => setThumbnailUrl(event.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="input-label">Legenda</label>
              <input className="input" placeholder="Titulo curto do asset" value={caption} onChange={(event) => setCaption(event.target.value)} />
            </div>
            <div>
              <label className="input-label">Alt text</label>
              <input className="input" placeholder="Descricao acessivel" value={altText} onChange={(event) => setAltText(event.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface px-4 py-3">
            <div>
              <div className="text-sm font-medium text-text-primary">Asset ativo na landing</div>
              <div className="text-xs text-text-muted">Somente assets ativos aparecem no hero e na galeria publica.</div>
            </div>
            <button
              onClick={() => setIsActive((current) => !current)}
              className={cn('relative flex h-6 w-11 rounded-full transition-all', isActive ? 'bg-brand-acid' : 'bg-bg-border')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', isActive ? 'left-5' : 'left-0.5')} />
            </button>
          </div>

          {previewUrl ? (
            <div className="overflow-hidden rounded-sm border border-bg-border bg-bg-surface">
              <div className="border-b border-bg-border px-4 py-2 text-[11px] font-mono tracking-wider text-text-muted">PREVIEW</div>
              <div className="aspect-[16/9] overflow-hidden">
                {assetType === 'video' ? (
                  <video src={previewUrl} poster={thumbnailUrl || undefined} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={previewUrl} alt={altText || 'Preview do asset'} className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          ) : null}

          {error && <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">{error}</div>}
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-5 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void handleSubmit()} disabled={uploading} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? 'Publicando...' : 'Publicar asset'}
          </button>
        </div>
      </div>
    </div>
  )
}
