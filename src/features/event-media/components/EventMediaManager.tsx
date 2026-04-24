import { useMemo, useState } from 'react'
import { Film, ImagePlus, Library, Loader2 } from 'lucide-react'
import { ActionConfirmationDialog, FeedbackBanner, PageEmptyState, PageErrorState, PageLoadingState } from '@/shared/components'
import { useEventAssetActions, useEventAssetUpload, useEventAssets } from '@/features/event-media/hooks'
import type { EventMediaAsset } from '@/features/event-media/types'
import { EventAssetEditModal, EventAssetUploadModal } from '@/features/event-media/modals'
import { EventAssetGrid } from './EventAssetGrid'

interface EventMediaManagerProps {
  eventId: string
  organizationId: string
}

function reorderAssetIds(assets: EventMediaAsset[], currentId: string, direction: 'up' | 'down') {
  const index = assets.findIndex((asset) => asset.id === currentId)

  if (index < 0) {
    return assets.map((asset) => asset.id)
  }

  const nextIndex = direction === 'up' ? index - 1 : index + 1

  if (nextIndex < 0 || nextIndex >= assets.length) {
    return assets.map((asset) => asset.id)
  }

  const nextAssets = [...assets]
  const [item] = nextAssets.splice(index, 1)
  nextAssets.splice(nextIndex, 0, item)
  return nextAssets.map((asset) => asset.id)
}

export function EventMediaManager({ eventId, organizationId }: EventMediaManagerProps) {
  const { assets, loading, error, refetch } = useEventAssets(eventId)
  const { uploadAsset, uploading } = useEventAssetUpload({ eventId, organizationId })
  const { updateAsset, deleteAsset, reorderAssets, setCoverAsset, setHeroAsset, saving } = useEventAssetActions({
    eventId,
    organizationId,
  })
  const [editingAsset, setEditingAsset] = useState<EventMediaAsset | null>(null)
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<EventMediaAsset | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const summary = useMemo(() => {
    const activeAssets = assets.filter((asset) => asset.is_active)

    return {
      total: assets.length,
      active: activeAssets.length,
      images: assets.filter((asset) => asset.asset_type === 'image').length,
      videos: assets.filter((asset) => asset.asset_type === 'video').length,
    }
  }, [assets])

  async function handleEditSubmit(input: {
    usageType: EventMediaAsset['usage_type']
    altText: string
    caption: string
    isActive: boolean
    thumbnailUrl: string
  }) {
    if (!editingAsset) {
      return
    }

    if (input.usageType === 'cover') {
      try {
        await updateAsset(editingAsset, {
          altText: input.altText || null,
          caption: input.caption || null,
          isActive: input.isActive,
          thumbnailUrl: input.thumbnailUrl || null,
        })
        await setCoverAsset(editingAsset)
        setFeedback({ type: 'success', message: 'A capa principal do evento foi atualizada com sucesso.' })
      } catch (error) {
        setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar a capa principal.' })
        throw error
      }
      return
    }

    if (input.usageType === 'hero') {
      try {
        await updateAsset(editingAsset, {
          altText: input.altText || null,
          caption: input.caption || null,
          isActive: input.isActive,
          thumbnailUrl: input.thumbnailUrl || null,
        })
        await setHeroAsset(editingAsset)
        setFeedback({ type: 'success', message: 'O hero principal do evento foi atualizado com sucesso.' })
      } catch (error) {
        setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar o hero principal.' })
        throw error
      }
      return
    }

    try {
      await updateAsset(editingAsset, {
        usageType: input.usageType,
        altText: input.altText || null,
        caption: input.caption || null,
        isActive: input.isActive,
        thumbnailUrl: input.thumbnailUrl || null,
      })
      setFeedback({ type: 'success', message: 'Os dados editoriais do asset foram atualizados.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar as alterações do asset.' })
      throw error
    }
  }

  if (loading) {
    return <PageLoadingState title="Carregando media library" description="Buscando imagens e videos do evento." />
  }

  if (error) {
    return (
      <PageErrorState
        title="ERRO AO CARREGAR MIDIA"
        description={error}
        action={
          <button onClick={() => void refetch()} className="btn-primary">
            Tentar novamente
          </button>
        }
      />
    )
  }

  return (
    <section className="space-y-4 rounded-sm border border-bg-border bg-bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.3em] text-brand-acid">
            <Library className="h-3.5 w-3.5" />
            Media Library
          </div>
          <h3 className="mt-2 font-display text-2xl tracking-wide text-text-primary">
            ATIVOS VISUAIS DO EVENTO<span className="text-brand-acid">.</span>
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Envie seus arquivos ou use a Biblioteca de Mídia para adicionar imagens e videos ao evento.
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Novo asset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total', value: summary.total },
          { label: 'Ativos', value: summary.active },
          { label: 'Imagens', value: summary.images },
          { label: 'Videos', value: summary.videos },
        ].map((stat) => (
          <div key={stat.label} className="rounded-sm border border-bg-border bg-bg-surface px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-text-muted">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      {feedback ? (
        <FeedbackBanner
          tone={feedback.type}
          title={feedback.type === 'success' ? 'Atualizacao concluida' : 'Não foi possível concluir a ação'}
          message={feedback.message}
        />
      ) : null}

      {assets.length === 0 ? (
        <PageEmptyState
          title="BIBLIOTECA VAZIA"
          description="Adicione capa, hero video e galeria premium para a landing pública do evento."
          icon={<Film className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            <button onClick={() => setShowUploadModal(true)} className="btn-primary">
              Publicar primeiro asset
            </button>
          }
        />
      ) : (
        <EventAssetGrid
          assets={assets}
          onEdit={setEditingAsset}
          onDelete={setPendingDeleteAsset}
          onMoveUp={(asset) =>
            void reorderAssets(reorderAssetIds(assets, asset.id, 'up')).then(
              () => setFeedback({ type: 'success', message: 'A ordem editorial da galeria foi atualizada.' }),
              (error) => setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar a ordem dos assets.' }),
            )
          }
          onMoveDown={(asset) =>
            void reorderAssets(reorderAssetIds(assets, asset.id, 'down')).then(
              () => setFeedback({ type: 'success', message: 'A ordem editorial da galeria foi atualizada.' }),
              (error) => setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar a ordem dos assets.' }),
            )
          }
          onSetCover={(asset) =>
            void setCoverAsset(asset).then(
              () => setFeedback({ type: 'success', message: 'A nova capa ativa do evento já esta publicada.' }),
              (error) => setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível definir a capa principal.' }),
            )
          }
          onSetHero={(asset) =>
            void setHeroAsset(asset).then(
              () => setFeedback({ type: 'success', message: 'O hero principal já esta ativo na landing pública.' }),
              (error) => setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível definir o hero principal.' }),
            )
          }
          onToggleActive={(asset) =>
            void updateAsset(asset, { isActive: !asset.is_active }).then(
              () =>
                setFeedback({
                  type: 'success',
                  message: asset.is_active ? 'O asset foi retirado da experiência pública.' : 'O asset voltou a ficar disponível na experiência pública.',
                }),
              (error) => setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível alterar a disponibilidade do asset.' }),
            )
          }
        />
      )}

      {(uploading || saving) && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-acid" />
          Salvando alterações da media library...
        </div>
      )}

      {showUploadModal ? (
        <EventAssetUploadModal
          uploading={uploading}
          onClose={() => setShowUploadModal(false)}
          onSubmit={async (input) => {
            const asset = await uploadAsset(input)
            setFeedback({
              type: 'success',
              message: `${asset.asset_type === 'video' ? 'Video' : 'Imagem'} publicada com sucesso via ${asset.provider}.`,
            })
          }}
        />
      ) : null}

      {editingAsset ? (
        <EventAssetEditModal
          asset={editingAsset}
          saving={saving}
          onClose={() => setEditingAsset(null)}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteAsset)}
        title="Excluir asset da media library"
        description={pendingDeleteAsset ? `O arquivo ${pendingDeleteAsset.caption || pendingDeleteAsset.id.slice(0, 8)} sera removido deste evento.` : undefined}
        impact="A landing pública pode perder uma capa, um hero ou um item de galeria imediatamente após a confirmação."
        confirmLabel="Excluir asset"
        confirming={saving}
        onCancel={() => setPendingDeleteAsset(null)}
        onConfirm={async () => {
          if (!pendingDeleteAsset) {
            return
          }

          try {
            await deleteAsset(pendingDeleteAsset)
            setFeedback({ type: 'success', message: 'O asset foi removido da biblioteca do evento.' })
            setPendingDeleteAsset(null)
          } catch (error) {
            setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível remover o asset selecionado.' })
          }
        }}
      />
    </section>
  )
}
