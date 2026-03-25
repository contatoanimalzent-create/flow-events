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
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {props.assets.map((asset, index) => (
        <EventAssetCard
          key={asset.id}
          asset={asset}
          isFirst={index === 0}
          isLast={index === props.assets.length - 1}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onMoveUp={props.onMoveUp}
          onMoveDown={props.onMoveDown}
          onSetCover={props.onSetCover}
          onSetHero={props.onSetHero}
          onToggleActive={props.onToggleActive}
        />
      ))}
    </div>
  )
}
