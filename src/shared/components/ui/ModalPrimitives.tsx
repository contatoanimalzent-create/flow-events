import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn } from '@/shared/lib'

interface ModalShellProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  className?: string
  panelClassName?: string
}

const SIZE_CLASSNAME: Record<NonNullable<ModalShellProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
  '4xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
}

export function ModalShell({ children, size = 'lg', className, panelClassName }: ModalShellProps) {
  return (
    <div className={cn('pulse-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'pulse-modal-panel animate-slide-up flex w-full flex-col overflow-hidden rounded-[30px]',
          SIZE_CLASSNAME[size],
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  onClose?: () => void
  className?: string
}

export function ModalHeader({ title, subtitle, eyebrow, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn('pulse-modal-header flex items-start justify-between gap-4 border-b px-6 py-5', className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="pulse-modal-eyebrow text-[10px] uppercase tracking-[0.32em]">{eyebrow}</div> : null}
        <h2 className="pulse-modal-title mt-1 font-display leading-none tracking-[-0.04em]">{title}</h2>
        {subtitle ? <p className="pulse-modal-subtitle mt-2 max-w-2xl text-sm leading-6">{subtitle}</p> : null}
      </div>
      {onClose ? (
        <button
          onClick={onClose}
          className="pulse-modal-close rounded-full p-2 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('max-h-[72vh] space-y-5 overflow-y-auto px-6 py-6', className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return <div className={cn('pulse-modal-footer flex items-center justify-between gap-3 border-t px-6 py-5', className)}>{children}</div>
}

interface FormSectionProps {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn('pulse-form-section space-y-4 rounded-[24px] p-5', className)}>
      {title || description ? (
        <div>
          {title ? <div className="pulse-form-title text-sm font-semibold">{title}</div> : null}
          {description ? <div className="pulse-form-description mt-1 text-xs leading-5">{description}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

interface FormGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface FormFieldProps {
  label: ReactNode
  children: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
}

export function FormField({ label, children, hint, error, required = false, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="input-label">
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
      {hint ? <FormHint>{hint}</FormHint> : null}
      {error ? <FormError>{error}</FormError> : null}
    </div>
  )
}

interface FormHintProps {
  children: ReactNode
  className?: string
}

export function FormHint({ children, className }: FormHintProps) {
  return <p className={cn('pulse-form-hint text-[11px] leading-5', className)}>{children}</p>
}

interface FormErrorProps {
  children: ReactNode
  className?: string
}

export function FormError({ children, className }: FormErrorProps) {
  return <div className={cn('pulse-form-error rounded-2xl px-3 py-2 text-xs', className)}>{children}</div>
}

interface FormToggleCardProps {
  title: ReactNode
  description?: ReactNode
  checked: boolean
  onToggle: () => void
  className?: string
}

export function FormToggleCard({ title, description, checked, onToggle, className }: FormToggleCardProps) {
  return (
    <div className={cn('pulse-toggle-card flex items-center justify-between gap-4 rounded-[22px] px-4 py-3', className)}>
      <div>
        <div className="pulse-form-title text-sm font-medium">{title}</div>
        {description ? <div className="pulse-form-description mt-1 text-xs">{description}</div> : null}
      </div>
      <button
        onClick={onToggle}
        className={cn('pulse-toggle-switch relative flex h-6 w-11 shrink-0 rounded-full transition-all', checked && 'pulse-toggle-switch--checked')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', checked ? 'left-5' : 'left-0.5')} />
      </button>
    </div>
  )
}

interface ConfirmActionBoxProps {
  tone?: 'default' | 'danger'
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export function ConfirmActionBox({ tone = 'default', title, description, children, className }: ConfirmActionBoxProps) {
  return (
    <div
      className={cn(
        'pulse-confirm-box rounded-[24px] border px-4 py-4',
        tone === 'danger' && 'pulse-confirm-box--danger',
        className,
      )}
    >
      <div className={cn('pulse-confirm-title text-sm font-semibold', tone === 'danger' && 'text-[var(--pulse-status-error)]')}>{title}</div>
      {description ? <div className="pulse-confirm-description mt-1 text-xs leading-5">{description}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

interface FeedbackBannerProps {
  tone?: 'success' | 'error' | 'info'
  title?: ReactNode
  message: ReactNode
  className?: string
}

export function FeedbackBanner({ tone = 'info', title, message, className }: FeedbackBannerProps) {
  const toneClassName =
    tone === 'success'
      ? 'pulse-feedback-banner--success'
      : tone === 'error'
        ? 'pulse-feedback-banner--error'
        : 'pulse-feedback-banner--info'

  return (
    <div className={cn('pulse-feedback-banner rounded-2xl border px-4 py-3', toneClassName, className)}>
      {title ? <div className="text-sm font-semibold">{title}</div> : null}
      <div className={cn('text-sm leading-6', title ? 'mt-1' : '')}>{message}</div>
    </div>
  )
}

interface ActionConfirmationDialogProps {
  open: boolean
  tone?: 'default' | 'danger'
  title: ReactNode
  description?: ReactNode
  impact?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ActionConfirmationDialog({
  open,
  tone = 'danger',
  title,
  description,
  impact,
  confirmLabel,
  cancelLabel,
  confirming = false,
  onConfirm,
  onCancel,
}: ActionConfirmationDialogProps) {
  const { t } = useAppLocale()

  if (!open) {
    return null
  }

  return (
    <ModalShell size="md" className="z-[130]">
      <ModalHeader eyebrow={t('Confirmation', 'Confirmacao')} title={title} subtitle={description} onClose={onCancel} />
      <ModalBody>
        <ConfirmActionBox tone={tone} title={t('Impact of this action', 'Impacto desta acao')} description={impact} />
      </ModalBody>
      <ModalFooter>
        <button onClick={onCancel} className="btn-secondary text-sm">
          {cancelLabel ?? t('Back', 'Voltar')}
        </button>
        <button onClick={() => void onConfirm()} className={tone === 'danger' ? 'btn-danger text-sm' : 'btn-primary text-sm'} disabled={confirming}>
          {confirming ? t('Processing...', 'Processando...') : confirmLabel}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
