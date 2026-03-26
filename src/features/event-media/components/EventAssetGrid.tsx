import { useCallback } from 'react'
import type { EventMediaAsset } from '@/features/event-media/types'
import { EventAssetCard } from './EventAssetCard'

interface EventAssetGridProps {
  assets: EventMediaAsset[]
  onEdit: (asset: EventMediaAsset) => void
  onDelete: (asset: EventMediaAsset) => void
  onMoveUp: (asset: EventMediaAsset) => void
  onMoveDown: (asset: EventMediaAsset) => void
  onSetCover: (asset: EventMediaAsset) => void
  onSetHero: (asset: EventMediaAsset) => void
  onToggleActive: (asset: EventMediaAsset) => void
}

export function EventAssetGrid(props: EventAssetGridProps) {
  const { onEdit, onDelete, onMoveUp, onMoveDown, onSetCover, onSetHero, onToggleActive } = props

  const handleEdit = useCallback((asset: EventMediaAsset) => onEdit(asset), [onEdit])
  const handleDelete = useCallback((asset: EventMediaAsset) => onDelete(asset), [onDelete])
  const handleMoveUp = useCallback((asset: EventMediaAsset) => onMoveUp(asset), [onMoveUp])
  const handleMoveDown = useCallback((asset: EventMediaAsset) => onMoveDown(asset), [onMoveDown])
  const handleSetCover = useCallback((asset: EventMediaAsset) => onSetCover(asset), [onSetCover])
  const handleSetHero = useCallback((asset: EventMediaAsset) => onSetHero(asset), [onSetHero])
  const handleToggleActive = useCallback((asset: EventMediaAsset) => onToggleActive(asset), [onToggleActive])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {props.assets.map((asset, index) => (
        <EventAssetCard
          key={asset.id}
          asset={asset}
          isFirst={index === 0}
          isLast={index === props.assets.length - 1}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onSetCover={handleSetCover}
          onSetHero={handleSetHero}
          onToggleActive={handleToggleActive}
        />
      ))}
    </div>
  )
}
