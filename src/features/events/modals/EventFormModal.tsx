import { useRef } from 'react'
import { AlertCircle, Check, ChevronRight, ImageIcon, Loader2, Upload, Video, X } from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { useEventForm } from '@/features/events/hooks'
import { EVENT_AGE_RATINGS, EVENT_CATEGORIES, getUnsplashImages } from '@/features/events/types'

interface EventFormModalProps {
  eventId: string | null
  organizationId: string
  onClose: () => void
  onSaved: () => void
}

const TOTAL_STEPS = 4

export function EventFormModal({ eventId, organizationId, onClose, onSaved }: EventFormModalProps) {
  const {
    form,
    step,
    loading,
    saving,
    uploading,
    error,
    setStep,
    setError,
    setField,
    handleUpload,
    handleSave,
  } = useEventForm({ eventId, organizationId, onSaved })
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-xl overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="font-display text-xl leading-none tracking-wide text-text-primary">
              {eventId ? 'EDITAR EVENTO' : 'NOVO EVENTO'}
              <span className="text-brand-acid">.</span>
            </h2>
            <p className="mt-0.5 text-[11px] font-mono text-text-muted">
              Etapa {step} de {TOTAL_STEPS}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex">
          {[...Array(TOTAL_STEPS)].map((_, index) => (
            <div
              key={index}
              className={cn('h-0.5 flex-1 transition-all duration-300', index < step ? 'bg-brand-acid' : 'bg-bg-border')}
            />
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
            {step === 1 && (
              <>
                <div>
                  <label className="input-label">Nome do evento *</label>
                  <input
                    className="input"
                    placeholder="ex: PULSE FESTIVAL 2025"
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">SubtÃ­tulo</label>
                  <input
                    className="input"
                    placeholder="Uma frase que descreve o evento"
                    value={form.subtitle}
                    onChange={(event) => setField('subtitle', event.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Categoria</label>
                    <select className="input" value={form.category} onChange={(event) => setField('category', event.target.value)}>
                      <option value="">Selecionar...</option>
                      {EVENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">ClassificaÃ§Ã£o etÃ¡ria</label>
                    <select className="input" value={form.age_rating} onChange={(event) => setField('age_rating', event.target.value)}>
                      {EVENT_AGE_RATINGS.map((rating) => (
                        <option key={rating} value={rating}>
                          {rating === 'livre' ? 'Livre' : `${rating} anos`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">DescriÃ§Ã£o curta</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Um resumo atrativo do evento..."
                    value={form.short_description}
                    onChange={(event) => setField('short_description', event.target.value)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">InÃ­cio *</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={form.starts_at}
                      onChange={(event) => setField('starts_at', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">TÃ©rmino</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={form.ends_at}
                      onChange={(event) => setField('ends_at', event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Abertura de portas</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.doors_open_at}
                    onChange={(event) => setField('doors_open_at', event.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-sm border border-bg-border bg-bg-surface p-3">
                  <button
                    onClick={() => setField('is_online', !form.is_online)}
                    className={cn(
                      'relative flex h-5 w-9 flex-shrink-0 rounded-full transition-all duration-200',
                      form.is_online ? 'bg-brand-acid' : 'bg-bg-border',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200',
                        form.is_online ? 'left-4' : 'left-0.5',
                      )}
                    />
                  </button>
                  <span className="text-sm text-text-secondary">Evento online</span>
                </div>

                {form.is_online ? (
                  <div>
                    <label className="input-label">URL do evento online</label>
                    <input
                      className="input"
                      placeholder="https://..."
                      value={form.online_url}
                      onChange={(event) => setField('online_url', event.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="input-label">Nome do local</label>
                      <input
                        className="input"
                        placeholder="ex: Arena XP"
                        value={form.venue_name}
                        onChange={(event) => setField('venue_name', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="input-label">EndereÃ§o</label>
                      <input
                        className="input"
                        placeholder="Rua, nÃºmero"
                        value={form.venue_street}
                        onChange={(event) => setField('venue_street', event.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="input-label">Cidade</label>
                        <input
                          className="input"
                          placeholder="SÃ£o Paulo"
                          value={form.venue_city}
                          onChange={(event) => setField('venue_city', event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="input-label">Estado</label>
                        <input
                          className="input"
                          placeholder="SP"
                          value={form.venue_state}
                          onChange={(event) => setField('venue_state', event.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="input-label">Capacidade total</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="ex: 5000"
                    value={form.total_capacity}
                    onChange={(event) => setField('total_capacity', event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Dress code</label>
                  <input
                    className="input"
                    placeholder="ex: Esporte fino, Casual, Traje de gala..."
                    value={form.dress_code}
                    onChange={(event) => setField('dress_code', event.target.value)}
                  />
                </div>
                <div className="space-y-2 rounded-sm border border-bg-border bg-bg-surface p-4">
                  <div className="text-xs font-mono text-text-muted">RESUMO</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Nome</span>
                      <span className="font-medium text-text-primary">{form.name || 'â€”'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">InÃ­cio</span>
                      <span className="font-mono text-xs text-text-primary">
                        {form.starts_at ? formatDate(form.starts_at, 'dd/MM/yyyy HH:mm') : 'â€”'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Local</span>
                      <span className="text-text-primary">{form.venue_city || (form.is_online ? 'Online' : 'â€”')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Capacidade</span>
                      <span className="text-text-primary">
                        {form.total_capacity ? formatNumber(parseInt(form.total_capacity)) : 'â€”'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                {form.cover_url && (
                  <div className="relative h-36 overflow-hidden rounded-sm">
                    <img src={form.cover_url} alt="cover" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/40 opacity-0 transition-all hover:opacity-100">
                      <button
                        onClick={() => setField('cover_url', '')}
                        className="rounded-sm bg-status-error/90 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Remover
                      </button>
                    </div>
                    <span className="absolute left-2 top-2 rounded-sm bg-bg-primary/80 px-2 py-1 text-[10px] font-mono text-brand-acid">
                      CAPA ATUAL
                    </span>
                  </div>
                )}

                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" /> Foto de capa
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void handleUpload(file)
                      }
                    }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="group flex w-full flex-col items-center gap-2 rounded-sm border-2 border-dashed border-bg-border p-6 transition-all hover:border-brand-acid/40"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
                    ) : (
                      <Upload className="h-6 w-6 text-text-muted transition-colors group-hover:text-brand-acid" />
                    )}
                    <span className="text-xs text-text-muted transition-colors group-hover:text-text-primary">
                      {uploading ? 'Enviando...' : 'Clique para enviar uma imagem (JPG, PNG, WebP)'}
                    </span>
                  </button>
                </div>

                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" /> Ou escolha do banco de imagens
                    <span className="font-normal normal-case text-text-muted">â€” categoria: {form.category || 'geral'}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getUnsplashImages(form.category).map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setField('cover_url', url)}
                        className={cn(
                          'relative aspect-video overflow-hidden rounded-sm border-2 transition-all',
                          form.cover_url === url ? 'border-brand-acid' : 'border-transparent hover:border-brand-acid/40',
                        )}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {form.cover_url === url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-acid/20">
                            <Check className="h-5 w-5 text-brand-acid" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] font-mono text-text-muted">Imagens via Unsplash Â· uso gratuito</p>
                </div>

                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <Video className="h-3 w-3" /> VÃ­deo de fundo (opcional)
                  </label>
                  <input
                    className="input"
                    placeholder="URL do vÃ­deo (MP4, WebM ou YouTube embed)"
                    value={form.video_url}
                    onChange={(event) => setField('video_url', event.target.value)}
                  />
                  <p className="mt-1 text-[10px] font-mono text-text-muted">
                    O vÃ­deo toca em loop no hero da pÃ¡gina pÃºblica do evento
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={() => (step > 1 ? setStep(step - 1) : onClose())} className="btn-secondary text-sm">
            {step > 1 ? 'â† Voltar' : 'Cancelar'}
          </button>
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => {
                if (step === 1 && !form.name.trim()) {
                  setError('Nome Ã© obrigatÃ³rio')
                  return
                }
                setError('')
                setStep(step + 1)
              }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="btn-primary flex min-w-[120px] items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : eventId ? 'âœ“ Salvar' : 'âœ“ Criar evento'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
