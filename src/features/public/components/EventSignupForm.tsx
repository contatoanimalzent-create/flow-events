import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CheckCircle2, Copy, Download, Loader2, QrCode, Send } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { eventSignupService, type EventSignupResult } from '@/features/public/services/event-signup.service'
import { validateEmail } from '@/lib/validators/email'
import { formatPhoneBR, unformatPhone, validatePhone } from '@/lib/validators/phone'
import { FeedbackBanner } from '@/shared/components/ui'
import { cn } from '@/shared/lib'

export interface EventSignupTicketOption {
  id: string
  label: string
}

export interface EventSignupFormProps {
  eventId: string
  availableTickets: EventSignupTicketOption[]
  className?: string
}

interface EventSignupFormValues {
  name: string
  email: string
  phone: string
  ticketType: string
}

interface SnackbarState {
  tone: 'success' | 'error' | 'info'
  message: string
}

const inputClassName =
  'mt-2 w-full rounded-[var(--pulse-radius-md)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] px-4 py-3 text-[var(--pulse-color-text-primary)] outline-none transition-all placeholder:text-[color-mix(in_srgb,var(--pulse-color-text-secondary)_82%,white)] focus:border-[var(--pulse-color-primary)] focus:ring-4 focus:ring-[var(--pulse-focus-ring)]'

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits ? formatPhoneBR(digits) : ''
}

function downloadSvg(svg: SVGSVGElement, fileName: string) {
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function EventSignupForm({ eventId, availableTickets, className }: EventSignupFormProps) {
  const [submitResult, setSubmitResult] = useState<EventSignupResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)
  const qrWrapperRef = useRef<HTMLDivElement | null>(null)
  const qrTitleId = useId()

  const ticketOptions = useMemo(() => availableTickets, [availableTickets])

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EventSignupFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      ticketType: ticketOptions[0]?.id ?? '',
    },
  })

  useEffect(() => {
    if (!snackbar) {
      return
    }

    const timeoutId = window.setTimeout(() => setSnackbar(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [snackbar])

  async function copyCode() {
    if (!submitResult) {
      return
    }

    await navigator.clipboard.writeText(submitResult.code)
    setSnackbar({ tone: 'success', message: 'Codigo copiado para a area de transferencia.' })
  }

  function handleDownloadQr() {
    const svg = qrWrapperRef.current?.querySelector('svg')

    if (!svg || !submitResult) {
      setSnackbar({ tone: 'error', message: 'Nao foi possivel gerar o download do QR Code.' })
      return
    }

    downloadSvg(svg, `${submitResult.code.toLowerCase()}-qr.svg`)
    setSnackbar({ tone: 'info', message: 'Download do QR Code iniciado.' })
  }

  async function onSubmit(values: EventSignupFormValues) {
    setSubmitError(null)

    try {
      const selectedTicket = ticketOptions.find((ticket) => ticket.id === values.ticketType)

      const result = await eventSignupService.submit({
        eventId,
        name: values.name,
        email: values.email,
        phone: unformatPhone(values.phone),
        ticketTypeId: values.ticketType,
        ticketTypeLabel: selectedTicket?.label || values.ticketType,
      })

      setSubmitResult(result)
      setSnackbar({ tone: 'success', message: 'Inscricao confirmada com sucesso.' })
      reset({
        name: '',
        email: '',
        phone: '',
        ticketType: values.ticketType,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel concluir a inscricao.'
      setSubmitError(message)
      setSnackbar({ tone: 'error', message })
    }
  }

  return (
    <>
      <section
        className={cn(
          'rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] p-6 shadow-[var(--pulse-shadow-medium)] md:p-8',
          className,
        )}
      >
        <div className="max-w-2xl">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            Event signup
          </div>
          <h3 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] font-semibold tracking-[-0.05em] text-[var(--pulse-color-text-primary)]">
            Garanta seu acesso com um fluxo simples e rapido.
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--pulse-color-text-secondary)]">
            O envio usa apenas o client publico do Supabase e environment variables do app. Confirmacoes por Resend ou Twilio devem continuar passando por edge functions para manter segredos fora do frontend.
          </p>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">Nome</label>
            <input
              {...register('name', {
                required: 'Informe seu nome.',
                minLength: {
                  value: 2,
                  message: 'O nome precisa ter pelo menos 2 caracteres.',
                },
              })}
              className={inputClassName}
              placeholder="Seu nome completo"
            />
            {errors.name ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">Email</label>
            <input
              {...register('email', {
                required: 'Informe um email valido.',
                validate: (value) => validateEmail(value) || 'Formato de email invalido.',
              })}
              className={inputClassName}
              placeholder="voce@email.com"
              type="email"
            />
            {errors.email ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.email.message}</p> : null}
          </div>

          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'Informe seu telefone.',
              validate: (value) => validatePhone(value) || 'Telefone invalido.',
            }}
            render={({ field }) => (
              <div>
                <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">Telefone</label>
                <input
                  className={inputClassName}
                  placeholder="(11) 99999-0000"
                  type="tel"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(formatPhoneInput(event.target.value))
                    clearErrors('phone')
                  }}
                />
                {errors.phone ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.phone.message}</p> : null}
              </div>
            )}
          />

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">Tipo de ingresso</label>
            <select
              {...register('ticketType', {
                required: 'Selecione um tipo de ingresso.',
              })}
              className={inputClassName}
            >
              <option value="">Selecione uma opcao</option>
              {ticketOptions.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.label}
                </option>
              ))}
            </select>
            {errors.ticketType ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.ticketType.message}</p> : null}
          </div>

          {submitError ? (
            <div className="md:col-span-2">
              <FeedbackBanner tone="error" title="Nao foi possivel concluir" message={submitError} />
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-xs leading-6 text-[var(--pulse-color-text-secondary)]">
              Ao enviar, a confirmacao transacional deve ser disparada no backend por edge function.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-[var(--pulse-color-primary)] px-6 text-sm font-semibold text-[var(--pulse-color-text-inverse)] shadow-[var(--pulse-shadow-medium)] transition-all duration-200 hover:bg-[var(--pulse-color-primary-light)] hover:shadow-[var(--pulse-shadow-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSubmitting ? 'Enviando...' : 'Confirmar inscricao'}
            </button>
          </div>
        </form>

        {submitResult ? (
          <div className="mt-8 rounded-[var(--pulse-radius-lg)] border border-[var(--pulse-status-success-border)] bg-[var(--pulse-status-success-surface)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pulse-status-success)]">
              <CheckCircle2 className="h-4 w-4" />
              Inscricao recebida com sucesso
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
              <div
                ref={qrWrapperRef}
                className="flex flex-col items-center justify-center rounded-[var(--pulse-radius-lg)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] p-4"
                aria-labelledby={qrTitleId}
              >
                <div id={qrTitleId} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-primary)]">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </div>
                <QRCodeSVG
                  value={submitResult.qrValue}
                  size={168}
                  bgColor="#FFFFFF"
                  fgColor="#0A0A0A"
                  includeMargin
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-text-secondary)]">
                    Codigo da inscricao
                  </div>
                  <div className="mt-2 rounded-[var(--pulse-radius-md)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] px-4 py-3 font-mono text-sm text-[var(--pulse-color-text-primary)]">
                    {submitResult.code}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="inline-flex min-h-[2.9rem] items-center justify-center gap-2 rounded-full border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] px-5 text-sm font-semibold text-[var(--pulse-color-text-primary)] transition-all hover:border-[var(--pulse-color-primary)] hover:text-[var(--pulse-color-primary)]"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar codigo
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="inline-flex min-h-[2.9rem] items-center justify-center gap-2 rounded-full bg-[var(--pulse-color-primary)] px-5 text-sm font-semibold text-[var(--pulse-color-text-inverse)] transition-all hover:bg-[var(--pulse-color-primary-light)]"
                  >
                    <Download className="h-4 w-4" />
                    Baixar QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {snackbar ? (
        <div className="fixed bottom-5 right-5 z-[120] w-[min(22rem,calc(100vw-2rem))]">
          <FeedbackBanner tone={snackbar.tone} message={snackbar.message} />
        </div>
      ) : null}
    </>
  )
}
