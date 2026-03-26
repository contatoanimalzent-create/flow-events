import { memo, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Film, ImageIcon, Pencil, Star, Trash2, Video } from 'lucide-react'
import { cn } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media/types'
import type { EventMediaAsset } from '@/features/event-media/types'

interface EventAssetCardProps {
  asset: EventMediaAsset
  isFirst: boolean
  isLast: boolean
  onEdit: (asset: EventMediaAsset) => void
  onDelete: (asset: EventMediaAsset) => void
  onMoveUp: (asset: EventMediaAsset) => void
  onMoveDown: (asset: EventMediaAsset) => void
  onSetCover: (asset: EventMediaAsset) => void
  onSetHero: (asset: EventMediaAsset) => void
  onToggleActive: (asset: EventMediaAsset) => void
}

function usageLabel(asset: EventMediaAsset) {
  switch (asset.usage_type) {
    case 'cover':
      return 'Capa'
    case 'hero':
      return 'Hero'
    case 'thumbnail':
      return 'Thumb'
    case 'gallery':
    default:
      return 'Galeria'
  }
}

function EventAssetCardBase({
  asset,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSetCover,
  onSetHero,
  onToggleActive,
}: EventAssetCardProps) {
  const previewUrl = asset.thumbnail_url ?? getEventAssetUrl(asset)
  const mediaRef = useRef<HTMLDivElement>(null)
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (asset.asset_type !== 'video') return
    const node = mediaRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoSrc(getEventAssetUrl(asset))
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [asset])

  return (
    <article className={cn('card overflow-hidden transition-all', !asset.is_active && 'opacity-70')}>
      <div ref={mediaRef} className="relative aspect-[4/3] overflow-hidden bg-bg-surface">
        {asset.asset_type === 'video' ? (
          <video
            src={videoSrc}
            poster={asset.thumbnail_url ?? undefined}
            preload="none"
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={previewUrl} alt={asset.alt_text ?? asset.caption ?? 'Asset do evento'} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-sm border border-brand-acid/20 bg-bg-primary/70 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-acid backdrop-blur-sm">
            {usageLabel(asset)}
          </span>
          <span className="rounded-sm bg-bg-primary/70 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary backdrop-blur-sm">
            {asset.asset_type === 'image' ? 'Imagem' : 'Video'}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {asset.asset_type === 'image' ? (
            <ImageIcon className="h-4 w-4 text-white/80" />
          ) : (
            <Film className="h-4 w-4 text-white/80" />
          )}
          {!asset.is_active && (
            <span className="rounded-sm bg-status-warning/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-bg-primary">
              Inativo
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1.5">
          <div className="line-clamp-1 text-sm font-semibold text-text-primary">
            {asset.caption?.trim() || asset.alt_text?.trim() || `Asset ${asset.id.slice(0, 8)}`}
          </div>
          <div className="line-clamp-2 text-xs text-text-muted">
            {asset.alt_text?.trim() || asset.secure_url || asset.url}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {asset.asset_type === 'image' ? (
            <button onClick={() => onSetCover(asset)} className="btn-secondary text-[11px]">
              <Star className="mr-1 inline h-3 w-3" />
              Definir capa
            </button>
          ) : (
            <button onClick={() => onSetHero(asset)} className="btn-secondary text-[11px]">
              <Video className="mr-1 inline h-3 w-3" />
              Definir hero
            </button>
          )}
          <button onClick={() => onEdit(asset)} className="btn-secondary text-[11px]">
            <Pencil className="mr-1 inline h-3 w-3" />
            Editar
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-bg-border pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMoveUp(asset)}
              disabled={isFirst}
              className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onMoveDown(asset)}
              disabled={isLast}
              className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onToggleActive(asset)}
              className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
            >
              {asset.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={() => onDelete(asset)}
            className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-status-error/10 hover:text-status-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

export const EventAssetCard = memo(EventAssetCardBase)
