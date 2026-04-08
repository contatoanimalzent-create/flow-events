import { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Film, ImageIcon, Loader2, Search, X } from 'lucide-react'
import type { StockMedia, StockPhoto, StockVideo } from '@/features/event-media/services/media-stock.service'
import { mediaStockService } from '@/features/event-media/services/media-stock.service'
import { cn } from '@/shared/lib'

interface MediaStockBrowserProps {
  defaultType?: 'image' | 'video'
  onSelect: (media: StockMedia) => void
}

const SUGGESTIONS = [
  'festival',
  'show ao vivo',
  'multidao',
  'palco',
  'musica',
  'corporativo',
  'summit',
  'evento',
  'celebracao',
  'noite',
]

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MediaStockBrowser({ defaultType = 'image', onSelect }: MediaStockBrowserProps) {
  const [query, setQuery] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>(defaultType)
  const [results, setResults] = useState<StockMedia[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<StockMedia | null>(null)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.ceil(total / 24)

  async function doSearch(q: string, type: 'image' | 'video', p = 1) {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await mediaStockService.search({ query: q, type, page: p, per_page: 24 })
      setResults(res.results)
      setTotal(res.total)
      setPage(p)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar na biblioteca.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    setSelected(null)
    void doSearch(query, mediaType, 1)
  }

  function handleSuggestion(suggestion: string) {
    setQuery(suggestion)
    setSelected(null)
    void doSearch(suggestion, mediaType, 1)
  }

  function handleTypeChange(type: 'image' | 'video') {
    setMediaType(type)
    setSelected(null)
    if (searched && query.trim()) {
      void doSearch(query, type, 1)
    }
  }

  function handleSelect(media: StockMedia) {
    setSelected(media)
  }

  function handleConfirm() {
    if (selected) onSelect(selected)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Tipo */}
      <div className="flex items-center gap-2">
        {([
          { key: 'image', label: 'Imagens', icon: ImageIcon },
          { key: 'video', label: 'Videos', icon: Film },
        ] as const).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => handleTypeChange(item.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all',
                mediaType === item.key
                  ? 'border-brand-acid/40 bg-brand-acid/10 text-brand-acid'
                  : 'border-bg-border bg-bg-secondary/55 text-text-muted hover:text-text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Campo de busca */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            ref={inputRef}
            className="input w-full pl-9 pr-3"
            placeholder={mediaType === 'image' ? 'Buscar imagens...' : 'Buscar videos...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="btn-primary flex items-center gap-2 px-4 text-sm"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Buscar
        </button>
      </div>

      {/* Sugestões */}
      {!searched && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="rounded-full border border-bg-border bg-bg-surface px-3 py-1 text-[11px] text-text-muted transition-colors hover:border-brand-acid/30 hover:text-brand-acid"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Erro de configuração */}
      {error && (
        <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
          {error}
        </div>
      )}

      {/* Grid de resultados */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map((media) => {
              const isSelected = selected?.id === media.id
              const thumb = media.type === 'image'
                ? (media as StockPhoto).thumbnail
                : (media as StockVideo).thumbnail

              return (
                <button
                  key={media.id}
                  onClick={() => handleSelect(media)}
                  className={cn(
                    'group relative aspect-[4/3] overflow-hidden rounded-[14px] border-2 transition-all',
                    isSelected
                      ? 'border-brand-acid ring-2 ring-brand-acid/30'
                      : 'border-transparent hover:border-white/20',
                  )}
                >
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Badge vídeo */}
                  {media.type === 'video' && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
                      <Film className="h-2.5 w-2.5" />
                      {formatDuration((media as StockVideo).duration)}
                    </div>
                  )}

                  {/* Check selecionado */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-acid/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-acid">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {total.toLocaleString('pt-BR')} resultados — página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => void doSearch(query, mediaType, page - 1)}
                  disabled={page <= 1 || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-bg-border bg-bg-surface text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void doSearch(query, mediaType, page + 1)}
                  disabled={page >= totalPages || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-bg-border bg-bg-surface text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado vazio após busca */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <X className="h-8 w-8 text-text-muted/40" />
          <p className="text-sm text-text-muted">Nenhum resultado para "{query}".</p>
          <p className="text-xs text-text-muted/60">Tente outros termos ou verifique a configuração da biblioteca.</p>
        </div>
      )}

      {/* Botão confirmar seleção */}
      {selected && (
        <div className="sticky bottom-0 flex items-center justify-between rounded-[20px] border border-brand-acid/25 bg-bg-card p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-[10px]">
              <img
                src={selected.type === 'image'
                  ? (selected as StockPhoto).thumbnail
                  : (selected as StockVideo).thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-text-primary">
                {selected.type === 'image' ? 'Imagem' : 'Video'} selecionado
              </div>
              <div className="text-[10px] text-text-muted">
                {selected.width} × {selected.height}px
              </div>
            </div>
          </div>
          <button onClick={handleConfirm} className="btn-primary flex items-center gap-2 text-sm">
            <Check className="h-4 w-4" />
            Usar este
          </button>
        </div>
      )}
    </div>
  )
}
