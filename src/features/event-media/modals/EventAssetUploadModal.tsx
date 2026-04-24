import { useEffect, useRef, useState } from 'react'
import { Film, ImageIcon, Library, Link2, Loader2, UploadCloud } from 'lucide-react'
import type { StockMedia, StockPhoto, StockVideo } from '@/features/event-media/services/media-stock.service'
import type { EventAssetUploadInput, EventMediaAssetType, EventMediaUsageType } from '@/features/event-media/types'
import { MediaStockBrowser } from '@/features/event-media/components/MediaStockBrowser'
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
import { cn } from '@/shared/lib'

interface EventAssetUploadModalProps {
  onClose: () => void
  onSubmit: (input: Omit<EventAssetUploadInput, 'organizationId' | 'eventId' | 'createdBy'>) => Promise<void>
  uploading?: boolean
}

type UploadSource = 'file' | 'url' | 'library'

const usageOptions: EventMediaUsageType[] = ['cover', 'hero', 'gallery', 'thumbnail']

const SOURCE_TABS: { key: UploadSource; label: string; icon: React.ElementType }[] = [
  { key: 'file',    label: 'Arquivo',    icon: UploadCloud },
  { key: 'library', label: 'Biblioteca', icon: Library },
  { key: 'url',    label: 'URL',         icon: Link2 },
]

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
  const [selectedStock, setSelectedStock] = useState<StockMedia | null>(null)

  useEffect(() => {
    if (usageType === 'cover' || usageType === 'thumbnail') setAssetType('image')
    if (usageType === 'hero') setAssetType('video')
  }, [usageType])

  useEffect(() => {
    if (source === 'file' && file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    if (source === 'url') {
      setPreviewUrl(externalUrl.trim())
      return
    }
    if (source === 'library' && selectedStock) {
      setPreviewUrl(
        selectedStock.type === 'image'
          ? (selectedStock as StockPhoto).preview
          : (selectedStock as StockVideo).thumbnail,
      )
      return
    }
    setPreviewUrl('')
  }, [file, externalUrl, source, selectedStock])

  function handleStockSelect(media: StockMedia) {
    setSelectedStock(media)
    setAssetType(media.type === 'video' ? 'video' : 'image')
    setExternalUrl(media.url)
    setThumbnailUrl(media.type === 'video' ? (media as StockVideo).thumbnail : '')
  }

  async function handleSubmit() {
    if (source === 'file' && !file) { setError('Selecione um arquivo para continuar.'); return }
    if (source === 'url' && !externalUrl.trim()) { setError('Informe uma URL para continuar.'); return }
    if (source === 'library' && !selectedStock) { setError('Selecione uma mídia da biblioteca para continuar.'); return }
    setError('')
    try {
      await onSubmit({
        assetType,
        usageType,
        file: source === 'file' ? file : null,
        externalUrl: source !== 'file' ? externalUrl.trim() : '',
        thumbnailUrl: thumbnailUrl.trim(),
        caption,
        altText,
        isActive,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar o asset.')
    }
  }

  return (
    <ModalShell size="xl">
      <ModalHeader
        eyebrow="Ativos visuais"
        title={<>Novo asset<span className="admin-title-accent">.</span></>}
        subtitle="Adicione imagens e videos para o hero, capa e galeria da sua landing."
        onClose={onClose}
      />

      <ModalBody>
        {/* Tabs de origem */}
        <div className="flex items-center gap-1 rounded-[20px] border border-bg-border bg-bg-surface p-1">
          {SOURCE_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setSource(key); setError('') }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-xs font-medium transition-all',
                source === key
                  ? 'bg-text-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── BIBLIOTECA ── */}
        {source === 'library' ? (
          <div className="space-y-4">
            <MediaStockBrowser
              defaultType={assetType === 'video' ? 'video' : 'image'}
              onSelect={handleStockSelect}
            />

            {selectedStock && (
              <FormSection title="Configurar asset" description="Defina o uso e os textos editoriais antes de publicar.">
                <FormGrid>
                  <FormField label="Uso do asset">
                    <select className="input" value={usageType} onChange={(e) => setUsageType(e.target.value as EventMediaUsageType)}>
                      {usageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === 'cover' ? 'Capa' : opt === 'hero' ? 'Hero' : opt === 'thumbnail' ? 'Thumbnail' : 'Galeria'}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Legenda">
                    <input className="input" placeholder="Titulo curto" value={caption} onChange={(e) => setCaption(e.target.value)} />
                  </FormField>
                </FormGrid>
                <FormToggleCard
                  title="Asset ativo na landing"
                  description="Somente assets ativos aparecem no hero e na galeria pública."
                  checked={isActive}
                  onToggle={() => setIsActive((v) => !v)}
                />
              </FormSection>
            )}
          </div>
        ) : (
          <>
            {/* ── ARQUIVO / URL ── */}
            <FormSection
              title={source === 'file' ? 'Enviar arquivo' : 'Endereço do asset'}
              description={source === 'file' ? 'Formatos aceitos: JPG, PNG, WebP, MP4, MOV.' : 'Cole o link direto para a imagem ou video.'}
            >
              <FormGrid>
                <FormField label="Tipo do asset">
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'image', label: 'Imagem', icon: ImageIcon, disabled: usageType === 'hero' },
                      { key: 'video', label: 'Video',  icon: Film,      disabled: usageType === 'cover' || usageType === 'thumbnail' },
                    ] as const).map(({ key, label, icon: Icon, disabled }) => (
                      <button
                        key={key}
                        onClick={() => !disabled && setAssetType(key)}
                        disabled={disabled}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-[22px] border px-4 py-3 text-sm transition-all',
                          assetType === key
                            ? 'border-brand-acid/35 bg-brand-acid/8 text-brand-acid'
                            : 'border-bg-border bg-bg-secondary/55 text-text-muted hover:text-text-primary',
                          disabled && 'cursor-not-allowed opacity-40',
                        )}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Uso do asset">
                  <select className="input" value={usageType} onChange={(e) => setUsageType(e.target.value as EventMediaUsageType)}>
                    {usageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === 'cover' ? 'Capa' : opt === 'hero' ? 'Hero' : opt === 'thumbnail' ? 'Thumbnail' : 'Galeria'}
                      </option>
                    ))}
                  </select>
                </FormField>
              </FormGrid>

              {source === 'file' ? (
                <FormField label="Arquivo">
                  <input ref={fileRef} type="file" accept={assetType === 'image' ? 'image/*' : 'video/*'} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-bg-border bg-bg-secondary/55 px-4 py-10 text-center transition-all hover:border-brand-acid/35"
                  >
                    <UploadCloud className="h-6 w-6 text-brand-acid" />
                    <div className="text-sm font-medium text-text-primary">{file?.name ?? `Selecionar ${assetType === 'image' ? 'imagem' : 'video'}`}</div>
                    <div className="text-xs text-text-muted">Arraste ou clique para enviar.</div>
                  </button>
                </FormField>
              ) : (
                <FormField label="URL do asset">
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                    <input className="input pl-9" placeholder="https://..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                  </div>
                </FormField>
              )}
            </FormSection>

            <FormSection title="Metadados editoriais" description="Textos que aparecem na galeria e melhoram a acessibilidade.">
              <FormGrid>
                <FormField label="Legenda">
                  <input className="input" placeholder="Titulo curto do asset" value={caption} onChange={(e) => setCaption(e.target.value)} />
                </FormField>
                <FormField label="Alt text">
                  <input className="input" placeholder="Descrição acessivel" value={altText} onChange={(e) => setAltText(e.target.value)} />
                </FormField>
              </FormGrid>
              {assetType === 'video' && (
                <FormField label="Thumbnail do video">
                  <input className="input" placeholder="https://.../thumbnail.jpg" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
                </FormField>
              )}
              <FormToggleCard
                title="Asset ativo na landing"
                description="Somente assets ativos aparecem no hero e na galeria pública."
                checked={isActive}
                onToggle={() => setIsActive((v) => !v)}
              />
            </FormSection>

            {previewUrl && (
              <FormSection title="Preview" description="Revise o enquadramento antes de publicar.">
                <div className="overflow-hidden rounded-[24px] border border-bg-border bg-bg-surface">
                  <div className="aspect-[16/9] overflow-hidden">
                    {assetType === 'video'
                      ? <video src={previewUrl} poster={thumbnailUrl || undefined} controls className="h-full w-full object-cover" />
                      : <img src={previewUrl} alt={altText || 'Preview'} className="h-full w-full object-cover" />}
                  </div>
                </div>
              </FormSection>
            )}
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2 text-xs text-status-error">{error}</div>
        )}
      </ModalBody>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
        <button
          onClick={() => void handleSubmit()}
          disabled={uploading}
          className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm"
        >
          {uploading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
            : <><UploadCloud className="h-4 w-4" /> Publicar asset</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
