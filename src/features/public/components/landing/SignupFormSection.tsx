import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { validateCPF, unformatCPF } from '@/lib/validators/cpf'
import { validateEmail } from '@/lib/validators/email'
import { formatPhoneBR, unformatPhone, validatePhone } from '@/lib/validators/phone'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useAnimationPreset } from '@/shared/motion'

export interface SignupTicketOption {
  value: string
  label: string
}

export interface SignupFormValues {
  fullName: string
  email: string
  phone: string
  ticketOptionId: string
  cpf: string
  additionalInfo: string
}

interface SignupFormSectionProps {
  ticketOptions: SignupTicketOption[]
  defaultTicketOptionId?: string
  onSubmit: (values: SignupFormValues) => Promise<void>
}

const inputClassName =
  'mt-2 w-full rounded-[var(--pulse-radius-md)] border border-[rgba(255,255,255,0.10)] bg-[var(--pulse-surface-elevated)] px-4 py-3 text-[var(--pulse-color-text-primary)] outline-none transition-all placeholder:text-[var(--pulse-color-text-muted)] focus:border-[var(--pulse-color-primary)] focus:ring-4 focus:ring-[var(--pulse-focus-ring)]'

function formatCpfInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export function SignupFormSection({ ticketOptions, defaultTicketOptionId, onSubmit }: SignupFormSectionProps) {
  const { isPortuguese } = usePublicLocale()
  const sectionAnimation = useAnimationPreset('fadeIn', { durationMs: 420, amount: 0.05 })
  const formAnimation = useAnimationPreset('slideUp', { durationMs: 460, distance: 18, amount: 0.1 })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      ticketOptionId: defaultTicketOptionId || ticketOptions[0]?.value || '',
      cpf: '',
      additionalInfo: '',
    },
  })

  useEffect(() => {
    if (!defaultTicketOptionId) {
      return
    }

    setValue('ticketOptionId', defaultTicketOptionId, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [defaultTicketOptionId, setValue])

  async function submitForm(values: SignupFormValues) {
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      await onSubmit({
        ...values,
        cpf: values.cpf ? unformatCPF(values.cpf) : '',
        phone: unformatPhone(values.phone),
      })

      setSubmitSuccess(
        isPortuguese
          ? 'Inscrição enviada com sucesso. Em instantes você recebe a confirmação.'
          : 'Registration submitted successfully. Confirmation is on the way.',
      )

      reset({
        fullName: '',
        email: '',
        phone: '',
        ticketOptionId: values.ticketOptionId,
        cpf: '',
        additionalInfo: '',
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : isPortuguese
            ? 'Não foi possível concluir a inscrição agora.'
            : 'We could not complete the registration right now.',
      )
    }
  }

  return (
    <motion.section
      id="inscricao"
      className="bg-[var(--pulse-color-surface)] py-20 md:py-28"
      initial={sectionAnimation.initial}
      whileInView={sectionAnimation.whileInView}
      viewport={sectionAnimation.viewport}
      variants={sectionAnimation.variants}
    >
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 md:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(25rem,0.88fr)] lg:gap-12 lg:px-10">
        <motion.div
          initial={formAnimation.initial}
          whileInView={formAnimation.whileInView}
          viewport={formAnimation.viewport}
          variants={formAnimation.variants}
        >
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Formulário de inscrição' : 'Registration form'}
          </div>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Confirme seus dados e reserve seu lugar.' : 'Confirm your details and secure your place.'}
          </h2>
          <p className="mt-5 max-w-[34rem] text-[1rem] leading-8 text-[var(--pulse-color-text-secondary)]">
            {isPortuguese
              ? 'O formulário foi pensado para ser rápido no mobile, com válidação em tempo real e um fluxo direto para capturar o interesse no evento.'
              : 'The form is built for mobile speed, with real-time validation and a direct path to capture attendee intent.'}
          </p>
        </motion.div>

        <motion.div
          className="rounded-[calc(var(--pulse-radius-lg)+0.35rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] p-6 shadow-[var(--pulse-shadow-medium)] md:p-8"
          initial={formAnimation.initial}
          whileInView={formAnimation.whileInView}
          viewport={formAnimation.viewport}
          variants={formAnimation.variants}
        >
          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">
                  {isPortuguese ? 'Nome completo' : 'Full name'}
                </label>
                <input
                  {...register('fullName', {
                    required: isPortuguese ? 'Informe seu nome completo.' : 'Enter your full name.',
                    validate: (value) =>
                      value.trim().split(' ').length >= 2 ||
                      (isPortuguese ? 'Digite nome e sobrenome.' : 'Please enter first and last name.'),
                  })}
                  className={inputClassName}
                  placeholder={isPortuguese ? 'Como você quer aparecer na lista' : 'How you want to appear on the guest list'}
                />
                {errors.fullName ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.fullName.message}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">E-mail</label>
                <input
                  {...register('email', {
                    required: isPortuguese ? 'Informe um e-mail valido.' : 'Enter a valid email.',
                    validate: (value) => validateEmail(value) || (isPortuguese ? 'E-mail invalido.' : 'Invalid email.'),
                  })}
                  className={inputClassName}
                  placeholder="você@email.com"
                  type="email"
                />
                {errors.email ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.email.message}</p> : null}
              </div>

              <Controller
                control={control}
                name="phone"
                rules={{
                  required: isPortuguese ? 'Informe seu telefone.' : 'Enter your phone number.',
                  validate: (value) => validatePhone(value) || (isPortuguese ? 'Telefone invalido.' : 'Invalid phone number.'),
                }}
                render={({ field }) => (
                  <div>
                    <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">
                      {isPortuguese ? 'Telefone' : 'Phone'}
                    </label>
                    <input
                      className={inputClassName}
                      placeholder="(11) 99999-0000"
                      type="tel"
                      value={field.value}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 11)
                        field.onChange(digits ? formatPhoneBR(digits) : '')
                        clearErrors('phone')
                      }}
                    />
                    {errors.phone ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.phone.message}</p> : null}
                  </div>
                )}
              />

              <div>
                <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">
                  {isPortuguese ? 'Tipo de ingresso' : 'Ticket type'}
                </label>
                <select
                  {...register('ticketOptionId', {
                    required: isPortuguese ? 'Selecione um ingresso.' : 'Select a ticket.',
                  })}
                  className={inputClassName}
                >
                  <option value="">{isPortuguese ? 'Selecione uma opcao' : 'Select an option'}</option>
                  {ticketOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.ticketOptionId ? (
                  <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.ticketOptionId.message}</p>
                ) : null}
              </div>

              <Controller
                control={control}
                name="cpf"
                rules={{
                  validate: (value) =>
                    !value || validateCPF(value) || (isPortuguese ? 'CPF invalido.' : 'Invalid CPF.'),
                }}
                render={({ field }) => (
                  <div>
                    <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">
                      {isPortuguese ? 'CPF (opcional)' : 'CPF (optional)'}
                    </label>
                    <input
                      className={inputClassName}
                      placeholder="000.000.000-00"
                      type="text"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(formatCpfInput(event.target.value))
                        clearErrors('cpf')
                      }}
                    />
                    {errors.cpf ? <p className="mt-1.5 text-xs text-[var(--pulse-status-error)]">{errors.cpf.message}</p> : null}
                  </div>
                )}
              />

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[var(--pulse-color-text-primary)]">
                  {isPortuguese ? 'Informações adicionais' : 'Additional information'}
                </label>
                <textarea
                  {...register('additionalInfo')}
                  className={`${inputClassName} min-h-[7.5rem] resize-y`}
                  placeholder={
                    isPortuguese
                      ? 'Empresa, cargo, observacoes de acesso ou qualquer detalhe relevante.'
                      : 'Company, role, access notes or any relevant detail.'
                  }
                />
              </div>
            </div>

            {submitError ? (
              <div className="rounded-[var(--pulse-radius-md)] border border-[var(--pulse-status-error-border)] bg-[var(--pulse-status-error-surface)] px-4 py-3 text-sm text-[var(--pulse-status-error)]">
                {submitError}
              </div>
            ) : null}

            {submitSuccess ? (
              <div className="rounded-[var(--pulse-radius-md)] border border-[var(--pulse-status-success-border)] bg-[var(--pulse-status-success-surface)] px-4 py-3 text-sm text-[var(--pulse-status-success)]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {submitSuccess}
                </span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-full bg-[var(--pulse-color-primary)] px-6 text-sm font-semibold text-[var(--pulse-color-text-inverse)] shadow-[var(--pulse-shadow-medium)] transition-all duration-200 hover:bg-[var(--pulse-color-primary-light)] hover:shadow-[var(--pulse-shadow-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSubmitting
                ? isPortuguese
                  ? 'Enviando inscrição...'
                  : 'Submitting registration...'
                : isPortuguese
                  ? 'Confirmar inscrição'
                  : 'Confirm registration'}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.section>
  )
}
