import { useRef } from 'react'
import { AlertCircle, Check, ChevronRight, ImageIcon, Loader2, Upload, Video } from 'lucide-react'
import { EventMediaManager } from '@/features/event-media'
import { FeeConfigurationPanel } from '@/features/billing'
import { useEventForm } from '@/features/events/hooks'
import { EVENT_AGE_RATINGS, EVENT_CATEGORIES, getUnsplashImages } from '@/features/events/types'
import {
  ConfirmActionBox,
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
import { cn, formatDate, formatNumber } from '@/shared/lib'

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
    <ModalShell size="2xl">
      <ModalHeader
        eyebrow="Events"
        title={
          <>
            {eventId ? 'Editar evento' : 'Novo evento'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle={`Etapa ${step} de ${TOTAL_STEPS} para configurar posicionamento, agenda, operação e media.`}
        onClose={onClose}
      />

      <div className="flex px-6 pb-1">
        {[...Array(TOTAL_STEPS)].map((_, index) => (
          <div
            key={index}
            className={cn('h-1 flex-1 rounded-full transition-all duration-300', index < step ? 'bg-brand-acid' : 'bg-bg-border')}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : (
        <>
          <ModalBody>
            {step === 1 ? (
              <FormSection title="Identidade do evento" description="Defina nome, categoria e narrativa principal do evento.">
                <FormField label="Nome do evento" required>
                  <input
                    className="input"
                    placeholder="ex: Pulse Festival 2025"
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </FormField>

                <FormField label="Subtitulo">
                  <input
                    className="input"
                    placeholder="Uma frase que descreve o evento"
                    value={form.subtitle}
                    onChange={(event) => setField('subtitle', event.target.value)}
                  />
                </FormField>

                <FormGrid>
                  <FormField label="Categoria">
                    <select className="input" value={form.category} onChange={(event) => setField('category', event.target.value)}>
                      <option value="">Selecionar...</option>
                      {EVENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Classificacao etaria">
                    <select className="input" value={form.age_rating} onChange={(event) => setField('age_rating', event.target.value)}>
                      {EVENT_AGE_RATINGS.map((rating) => (
                        <option key={rating} value={rating}>
                          {rating === 'livre' ? 'Livre' : `${rating} anos`}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </FormGrid>

                <FormField label="Descrição curta">
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Um resumo atrativo do evento..."
                    value={form.short_description}
                    onChange={(event) => setField('short_description', event.target.value)}
                  />
                </FormField>
              </FormSection>
            ) : null}

            {step === 2 ? (
              <FormSection title="Agenda e local" description="Configure horário, abertura de portas e formato presencial ou online.">
                <FormGrid>
                  <FormField label="Inicio" required>
                    <input type="datetime-local" className="input" value={form.starts_at} onChange={(event) => setField('starts_at', event.target.value)} />
                  </FormField>
                  <FormField label="Termino">
                    <input type="datetime-local" className="input" value={form.ends_at} onChange={(event) => setField('ends_at', event.target.value)} />
                  </FormField>
                </FormGrid>

                <FormField label="Abertura de portas">
                  <input type="datetime-local" className="input" value={form.doors_open_at} onChange={(event) => setField('doors_open_at', event.target.value)} />
                </FormField>

                <FormToggleCard
                  title="Evento online"
                  description="Quando ativado, a experiência usa URL remota no lugar do venue presencial."
                  checked={form.is_online}
                  onToggle={() => setField('is_online', !form.is_online)}
                />

                {form.is_online ? (
                  <FormField label="URL do evento online">
                    <input className="input" placeholder="https://..." value={form.online_url} onChange={(event) => setField('online_url', event.target.value)} />
                  </FormField>
                ) : (
                  <>
                    <FormField label="Nome do local">
                      <input className="input" placeholder="ex: Arena XP" value={form.venue_name} onChange={(event) => setField('venue_name', event.target.value)} />
                    </FormField>
                    <FormField label="Endereco">
                      <input className="input" placeholder="Rua, número" value={form.venue_street} onChange={(event) => setField('venue_street', event.target.value)} />
                    </FormField>
                    <FormGrid>
                      <FormField label="Cidade">
                        <input className="input" placeholder="São Paulo" value={form.venue_city} onChange={(event) => setField('venue_city', event.target.value)} />
                      </FormField>
                      <FormField label="Estado">
                        <input className="input" placeholder="SP" value={form.venue_state} onChange={(event) => setField('venue_state', event.target.value)} />
                      </FormField>
                    </FormGrid>
                  </>
                )}
              </FormSection>
            ) : null}

            {step === 3 ? (
              <>
                <FormSection title="Capacidade e operação" description="Consolide a base operacional antes de seguir para a landing e a mídia.">
                  <FormField label="Capacidade total">
                    <input
                      type="number"
                      className="input"
                      placeholder="ex: 5000"
                      value={form.total_capacity}
                      onChange={(event) => setField('total_capacity', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Dress code">
                    <input
                      className="input"
                      placeholder="ex: Esporte fino, Casual, Traje de gala..."
                      value={form.dress_code}
                      onChange={(event) => setField('dress_code', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Limite de ingressos por pedido">
                    <input
                      type="number"
                      min={1}
                      className="input"
                      placeholder="ex: 4 (deixe em branco para sem limite)"
                      value={form.max_tickets_per_order}
                      onChange={(event) => setField('max_tickets_per_order', event.target.value)}
                    />
                  </FormField>

                  <FormToggleCard
                    title="Lista de espera"
                    description="Quando esgotado, compradores podem entrar na fila de espera e ser notificados se vagas abrirem."
                    checked={form.waitlist_enabled}
                    onToggle={() => setField('waitlist_enabled', !form.waitlist_enabled)}
                  />

                  <FormToggleCard
                    title="Evento privado"
                    description="Exige senha de acesso na página pública. Ideal para eventos corporativos ou exclusivos."
                    checked={form.is_private}
                    onToggle={() => setField('is_private', !form.is_private)}
                  />

                  {form.is_private && (
                    <FormField label="Senha de acesso">
                      <input
                        className="input"
                        placeholder="ex: PULSE2025"
                        value={form.access_password}
                        onChange={(event) => setField('access_password', event.target.value)}
                      />
                    </FormField>
                  )}
                </FormSection>

                <FormSection title="Monetização do evento" description="Defina como a plataforma monetiza este evento e como a taxa aparece para o comprador.">
                  <FeeConfigurationPanel
                    feeType={form.fee_type}
                    feeValue={form.fee_value}
                    absorbFee={form.absorb_fee}
                    onFeeTypeChange={(value) => setField('fee_type', value)}
                    onFeeValueChange={(value) => setField('fee_value', value)}
                    onAbsorbFeeChange={(value) => setField('absorb_fee', value)}
                  />
                </FormSection>

                <ConfirmActionBox
                  title="Resumo da configuração"
                  description={`${form.name || 'Evento sem nome'} · ${form.venue_city || (form.is_online ? 'Online' : 'Local pendente')}`}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Início</span>
                      <span className="font-mono text-xs text-text-primary">
                        {form.starts_at ? formatDate(form.starts_at, 'dd/MM/yyyy HH:mm') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Capacidade</span>
                      <span className="text-text-primary">
                        {form.total_capacity ? formatNumber(parseInt(form.total_capacity, 10)) : '-'}
                      </span>
                    </div>
                  </div>
                </ConfirmActionBox>
              </>
            ) : null}

            {step === 4 ? (
              <>
                {/* ── Specs de mídia ───────────────────────────────── */}
                <div className="rounded-[20px] border border-brand-acid/20 bg-brand-acid/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5 text-brand-acid shrink-0" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-brand-acid">Especificacoes de mídia</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {([
                      { label: 'Capa do evento',     spec: '1920 × 1080 px', detail: 'JPG/PNG/WebP · max 5 MB · 16:9',  icon: '🖼️' },
                      { label: 'Banner mobile',      spec: '1080 × 1350 px', detail: 'JPG/PNG/WebP · max 5 MB · 4:5',   icon: '📱' },
                      { label: 'Thumb / miniatura',  spec: '800 × 800 px',   detail: 'JPG/PNG · max 2 MB · 1:1',        icon: '🔲' },
                      { label: 'Logo do evento',     spec: '400 × 400 px',   detail: 'PNG transparente · max 1 MB · 1:1', icon: '🎯' },
                      { label: 'Video hero (loop)',  spec: '1920 × 1080 px', detail: 'MP4/WebM · max 50 MB · max 60s',  icon: '🎬' },
                      { label: 'Video reel/vertical',spec: '1080 × 1920 px', detail: 'MP4 · max 30 MB · 9:16',         icon: '📹' },
                    ] as const).map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5 rounded-[14px] border border-bg-border bg-bg-secondary/60 px-3 py-2.5">
                        <span className="text-base leading-none mt-0.5">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-text-primary">{item.label}</div>
                          <div className="text-[11px] font-mono text-brand-acid">{item.spec}</div>
                          <div className="text-[10px] text-text-muted mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Use arquivos otimizados para carregamento rápido na página pública. Arquivos acima do limite serão rejeitados automaticamente.
                  </p>
                </div>

                <FormSection title="Cover e hero" description="Esses campos seguem como fallback de compatibilidade para a landing.">
                  {form.cover_url ? (
                    <div className="relative h-40 overflow-hidden rounded-[24px]">
                      <img src={form.cover_url} alt="cover" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#211d18]/18 opacity-0 transition-all hover:opacity-100">
                        <button onClick={() => setField('cover_url', '')} className="btn-danger text-xs">
                          Remover capa
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <FormField label={<span className="flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Foto de capa</span>}>
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
                      className="group flex w-full flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-bg-border bg-bg-secondary/55 p-8 transition-all hover:border-brand-acid/35"
                    >
                      {uploading ? <Loader2 className="h-6 w-6 animate-spin text-brand-acid" /> : <Upload className="h-6 w-6 text-text-muted transition-colors group-hover:text-brand-acid" />}
                      <span className="text-sm text-text-primary">{uploading ? 'Enviando...' : 'Clique para enviar uma imagem'}</span>
                    </button>
                  </FormField>

                  <FormField
                    label={
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="h-3 w-3" /> Banco de imagens
                      </span>
                    }
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {getUnsplashImages(form.category).map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setField('cover_url', url)}
                          className={cn(
                            'relative aspect-video overflow-hidden rounded-[20px] border-2 transition-all',
                            form.cover_url === url ? 'border-brand-acid' : 'border-transparent hover:border-brand-acid/35',
                          )}
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          {form.cover_url === url ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-brand-acid/20">
                              <Check className="h-5 w-5 text-brand-acid" />
                            </div>
                          ) : null}
                        </button>
                      ))}
                    </div>
                    <FormHint>Imagens via Unsplash · uso gratuito</FormHint>
                  </FormField>

                  <FormField label={<span className="flex items-center gap-1.5"><Video className="h-3 w-3" /> Video de fundo</span>}>
                    <input
                      className="input"
                      placeholder="URL do video (MP4, WebM ou YouTube embed)"
                      value={form.video_url}
                      onChange={(event) => setField('video_url', event.target.value)}
                    />
                    <FormHint>O video toca em loop no hero da página pública do evento.</FormHint>
                  </FormField>
                </FormSection>

                <FormSection title="Tema do email de ingresso" description="Personalize as cores do email de confirmação que o comprador recebe com o QR code.">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Cor de destaque">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.email_accent_color}
                          onChange={(event) => setField('email_accent_color', event.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-lg border border-bg-border bg-transparent p-0.5"
                        />
                        <input
                          className="input flex-1 font-mono text-xs uppercase"
                          value={form.email_accent_color}
                          onChange={(event) => setField('email_accent_color', event.target.value)}
                          maxLength={7}
                        />
                      </div>
                    </FormField>
                    <FormField label="Fundo do email">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.email_bg_color}
                          onChange={(event) => setField('email_bg_color', event.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-lg border border-bg-border bg-transparent p-0.5"
                        />
                        <input
                          className="input flex-1 font-mono text-xs uppercase"
                          value={form.email_bg_color}
                          onChange={(event) => setField('email_bg_color', event.target.value)}
                          maxLength={7}
                        />
                      </div>
                    </FormField>
                    <FormField label="Cor do texto">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.email_text_color}
                          onChange={(event) => setField('email_text_color', event.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-lg border border-bg-border bg-transparent p-0.5"
                        />
                        <input
                          className="input flex-1 font-mono text-xs uppercase"
                          value={form.email_text_color}
                          onChange={(event) => setField('email_text_color', event.target.value)}
                          maxLength={7}
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* Preview mini */}
                  <div
                    className="mt-2 overflow-hidden rounded-2xl border border-bg-border"
                    style={{ backgroundColor: form.email_bg_color }}
                  >
                    {form.cover_url ? (
                      <div className="relative h-32 w-full overflow-hidden">
                        <img src={form.cover_url} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${form.email_bg_color} 5%, transparent 60%)` }} />
                      </div>
                    ) : (
                      <div className="flex h-20 items-center justify-center" style={{ backgroundColor: form.email_accent_color + '22' }}>
                        <ImageIcon className="h-5 w-5" style={{ color: form.email_accent_color }} />
                      </div>
                    )}
                    <div className="px-4 pb-4 pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: form.email_accent_color }}>
                        {form.starts_at ? new Date(form.starts_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : 'DATA DO EVENTO'}
                      </div>
                      <div className="mt-1 text-lg font-black uppercase tracking-tight" style={{ color: form.email_text_color }}>
                        {form.name || 'NOME DO EVENTO'}
                      </div>
                      <div className="mt-1 text-[10px]" style={{ color: form.email_text_color + '88' }}>
                        {form.venue_name || 'Local do evento'} {form.venue_city ? `· ${form.venue_city}` : ''}
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border" style={{ borderColor: form.email_accent_color + '44' }}>
                          <span className="text-[8px] font-bold" style={{ color: form.email_accent_color }}>QR</span>
                        </div>
                        <div className="text-[9px] font-medium uppercase tracking-widest" style={{ color: form.email_accent_color }}>
                          Pulse Events
                        </div>
                      </div>
                    </div>
                  </div>
                  <FormHint>Preview de como o email de ingresso vai aparecer para o comprador.</FormHint>
                </FormSection>

                <FormSection title="Media Library" description="Use assets dedicados para hero video, capa e galeria.">
                  {eventId ? (
                    <EventMediaManager eventId={eventId} organizationId={organizationId} />
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-bg-border bg-bg-secondary px-4 py-5 text-sm text-text-muted">
                      Salve o evento primeiro para liberar uploads, ordenacao e gestão completa da media library.
                    </div>
                  )}
                </FormSection>
              </>
            ) : null}

            {error ? (
              <div className="flex items-center gap-2 rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <button onClick={() => (step > 1 ? setStep(step - 1) : onClose())} className="btn-secondary text-sm">
              {step > 1 ? 'Voltar' : 'Cancelar'}
            </button>
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => {
                  if (step === 1 && !form.name.trim()) {
                    setError('Nome e obrigatorio.')
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
              <button onClick={() => void handleSave()} disabled={saving} className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Salvando...' : eventId ? 'Salvar evento' : 'Criar evento'}
              </button>
            )}
          </ModalFooter>
        </>
      )}
    </ModalShell>
  )
}
