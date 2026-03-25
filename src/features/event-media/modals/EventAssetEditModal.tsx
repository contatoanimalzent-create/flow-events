import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { EventMediaAsset, EventMediaUsageType } from '@/features/event-media/types'
import {
  FormField,
  FormGrid,
  FormSection,
  FormToggleCard,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from '@/shared/components'

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
      setError(err instanceof Error ? err.message : 'Nao foi possivel atualizar o asset.')
    }
  }

  return (
    <ModalShell size="lg">
      <ModalHeader
        eyebrow="Media library"
        title={
          <>
            Editar asset<span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Ajuste uso, copy e estado de exibicao sem alterar a logica atual do evento."
        onClose={onClose}
      />

      <ModalBody>
        <FormSection title="Configuracao do asset">
          <FormField label="Uso do asset">
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
          </FormField>

          <FormGrid>
            <FormField label="Legenda">
              <input className="input" value={caption} onChange={(event) => setCaption(event.target.value)} />
            </FormField>
            <FormField label="Alt text">
              <input className="input" value={altText} onChange={(event) => setAltText(event.target.value)} />
            </FormField>
          </FormGrid>

          {asset.asset_type === 'video' ? (
            <FormField label="Thumbnail do video">
              <input
                className="input"
                placeholder="https://.../thumbnail.jpg"
                value={thumbnailUrl}
                onChange={(event) => setThumbnailUrl(event.target.value)}
              />
            </FormField>
          ) : null}

          <FormToggleCard
            title="Asset ativo"
            description="Quando desligado, sai do hero e da galeria publica."
            checked={isActive}
            onToggle={() => setIsActive((current) => !current)}
          />
        </FormSection>

        <FormSection title="Preview atual">
          <div className="overflow-hidden rounded-[24px] border border-bg-border bg-bg-surface">
            <div className="aspect-[16/9] overflow-hidden">
              {asset.asset_type === 'video' ? (
                <video
                  src={asset.secure_url ?? undefined}
                  poster={thumbnailUrl || asset.thumbnail_url || undefined}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={asset.secure_url ?? undefined}
                  alt={altText || asset.alt_text || 'Asset'}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </FormSection>

        {error ? <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">{error}</div> : null}
      </ModalBody>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button onClick={() => void handleSubmit()} disabled={saving} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : 'Salvar asset'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
