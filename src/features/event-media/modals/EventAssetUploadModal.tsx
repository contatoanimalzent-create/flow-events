import { useEffect, useRef, useState } from 'react'
import { Film, ImageIcon, Link2, Loader2, UploadCloud } from 'lucide-react'
import type { EventAssetUploadInput, EventMediaAssetType, EventMediaUsageType } from '@/features/event-media/types'
import {
  FormField,
  FormGrid,
  FormHint,
  FormSection,
  FormToggleCard,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from '@/shared/components'
import { cn } from '@/shared/lib'

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
      setError('Selecione um arquivo para continuar.')
      return
    }

    if (source === 'url' && !externalUrl.trim()) {
      setError('Informe uma URL para continuar.')
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
      setError(err instanceof Error ? err.message : 'Nao foi possivel publicar o asset.')
    }
  }

  return (
    <ModalShell size="xl">
      <ModalHeader
        eyebrow="Media library"
        title={
          <>
            Novo asset<span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Upload de imagem ou video para hero, capa e galeria da landing publica."
        onClose={onClose}
      />

      <ModalBody>
        <FormSection title="Origem do asset" description="Escolha se o envio sera por arquivo local ou por URL externa.">
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'file', label: 'Arquivo' },
              { key: 'url', label: 'URL externa' },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setSource(item.key)}
                className={cn(
                  'admin-filter-chip',
                  source === item.key && 'admin-filter-chip-active bg-text-primary text-bg-secondary hover:bg-text-primary hover:text-bg-secondary',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <FormGrid>
            <FormField label="Tipo do asset">
              <div className="grid grid-cols-2 gap-3">
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
                        'flex items-center justify-center gap-2 rounded-[22px] border px-4 py-3 text-sm transition-all',
                        assetType === item.key
                          ? 'border-brand-acid/35 bg-brand-acid/8 text-brand-acid'
                          : 'border-bg-border bg-bg-secondary/55 text-text-muted hover:text-text-primary',
                        item.disabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </FormField>

            <FormField label="Uso do asset">
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
            </FormField>
          </FormGrid>

          {source === 'file' ? (
            <FormField label="Arquivo" hint="Cloudinary quando configurado. Fallback automatico para storage.">
              <input
                ref={fileRef}
                type="file"
                accept={assetType === 'image' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-bg-border bg-bg-secondary/55 px-4 py-10 text-center transition-all hover:border-brand-acid/35 hover:bg-white"
              >
                <UploadCloud className="h-6 w-6 text-brand-acid" />
                <div className="text-sm font-medium text-text-primary">
                  {file?.name ?? `Selecionar ${assetType === 'image' ? 'imagem' : 'video'}`}
                </div>
                <div className="text-xs text-text-muted">Arraste ou clique para enviar um arquivo de alta qualidade.</div>
              </button>
            </FormField>
          ) : (
            <FormField label="URL do asset">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  className="input pl-9"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(event) => setExternalUrl(event.target.value)}
                />
              </div>
            </FormField>
          )}
        </FormSection>

        <FormSection title="Metadados editoriais" description="Textos e thumbnails ajudam a landing publica e a acessibilidade.">
          <FormGrid>
            <FormField label="Legenda">
              <input className="input" placeholder="Titulo curto do asset" value={caption} onChange={(event) => setCaption(event.target.value)} />
            </FormField>
            <FormField label="Alt text">
              <input className="input" placeholder="Descricao acessivel" value={altText} onChange={(event) => setAltText(event.target.value)} />
            </FormField>
          </FormGrid>

          {assetType === 'video' ? (
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
            title="Asset ativo na landing"
            description="Somente assets ativos aparecem no hero e na galeria publica."
            checked={isActive}
            onToggle={() => setIsActive((current) => !current)}
          />
        </FormSection>

        {previewUrl ? (
          <FormSection title="Preview" description="Revise o enquadramento antes de publicar.">
            <div className="overflow-hidden rounded-[24px] border border-bg-border bg-bg-surface">
              <div className="aspect-[16/9] overflow-hidden">
                {assetType === 'video' ? (
                  <video src={previewUrl} poster={thumbnailUrl || undefined} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={previewUrl} alt={altText || 'Preview do asset'} className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          </FormSection>
        ) : null}

        {error ? <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">{error}</div> : null}
      </ModalBody>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button onClick={() => void handleSubmit()} disabled={uploading} className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? 'Publicando...' : 'Publicar asset'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
