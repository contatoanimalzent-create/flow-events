import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import type { EventMediaAsset, EventMediaUsageType } from '@/features/event-media/types'

interface EventAssetEditModalProps {
  asset: EventMediaAsset
  saving?: boolean
  onClose: () => void
  onSubmit: (input: { usageType: EventMediaUsageType; altText: string; caption: string; isActive: boolean; thumbnailUrl: string }) => Promise<void>
}

const usageOptions: EventMediaUsageType[] = ['cover', 'hero', 'gallery', 'thumbnail']

export function EventAssetEditModal({ asset, saving = false, onClose, onSubmit }: EventAssetEditModalProps) {
  const [usageType, setUsageType] = useState<EventMediaUsageType>(asset.usage_type)
  const [caption, setCaption] = useState(asset.caption ?? '')
  const [altText, setAltText] = useState(asset.alt_text ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(asset.thumbnail_url ?? '')
  const [isActive, setIsActive] = useState(asset.is_active)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset.asset_type === 'image' && usageType === 'hero') {
      setUsageType('gallery')
    }

    if (asset.asset_type === 'video' && (usageType === 'cover' || usageType === 'thumbnail')) {
      setUsageType('gallery')
    }
  }, [asset.asset_type, usageType])

  async function handleSubmit() {
    setError('')

    try {
      await onSubmit({
        usageType,
        altText,
        caption,
        isActive,
        thumbnailUrl,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel atualizar o asset')
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-5 py-4">
          <div>
            <h3 className="font-display text-xl tracking-wide text-text-primary">
              EDITAR ASSET<span className="text-brand-acid">.</span>
            </h3>
            <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">Ajuste uso, copy e estado de exibicao.</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="input-label">Uso do asset</label>
            <select className="input" value={usageType} onChange={(event) => setUsageType(event.target.value as EventMediaUsageType)}>
              {usageOptions
                .filter((option) => {
                  if (asset.asset_type === 'image') {
                    return option !== 'hero'
                  }

                  return option !== 'cover' && option !== 'thumbnail'
                })
                .map((option) => (
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="input-label">Legenda</label>
              <input className="input" value={caption} onChange={(event) => setCaption(event.target.value)} />
            </div>
            <div>
              <label className="input-label">Alt text</label>
              <input className="input" value={altText} onChange={(event) => setAltText(event.target.value)} />
            </div>
          </div>

          {asset.asset_type === 'video' && (
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

          <div className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface px-4 py-3">
            <div>
              <div className="text-sm font-medium text-text-primary">Asset ativo</div>
              <div className="text-xs text-text-muted">Quando desligado, sai do hero e da galeria publica.</div>
            </div>
            <button
              onClick={() => setIsActive((current) => !current)}
              className={`relative flex h-6 w-11 rounded-full transition-all ${isActive ? 'bg-brand-acid' : 'bg-bg-border'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {error && <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">{error}</div>}
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-5 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void handleSubmit()} disabled={saving} className="btn-primary flex min-w-[130px] items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Salvando...' : 'Salvar asset'}
          </button>
        </div>
      </div>
    </div>
  )
}
