import {
  AlertTriangle,
  Inbox,
  Info,
  Loader2,
  Lock,
} from 'lucide-react'
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TableHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/shared/lib'
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalPrimitives'

type Tone = 'neutral' | 'public' | 'admin'

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  width?: 'md' | 'lg' | 'xl' | 'full'
}

const widthClassName: Record<NonNullable<PageShellProps['width']>, string> = {
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-[1560px]',
}

export function PageShell({ tone = 'neutral', width = 'full', className, children, ...props }: PageShellProps) {
  return (
    <div
      className={cn(
        'page-shell',
        tone === 'public' && 'page-shell-public',
        tone === 'admin' && 'page-shell-admin',
        widthClassName[width],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SectionShellProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'tight' | 'base' | 'spacious'
}

export function SectionShell({ spacing = 'base', className, children, ...props }: SectionShellProps) {
  return (
    <section
      className={cn(
        'section-shell',
        spacing === 'tight' && 'section-shell-tight',
        spacing === 'spacious' && 'section-shell-spacious',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

interface SurfacePanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'base' | 'muted' | 'accent'
}

export function SurfacePanel({ tone = 'base', className, children, ...props }: SurfacePanelProps) {
  return (
    <div
      className={cn(
        'surface-panel',
        tone === 'muted' && 'surface-panel-muted',
        tone === 'accent' && 'surface-panel-accent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PremiumCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SurfacePanel className={cn('premium-card', className)} {...props}>
      {children}
    </SurfacePanel>
  )
}

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
  helper?: ReactNode
  trend?: ReactNode
  icon?: ReactNode
}

export function MetricCard({ label, value, helper, trend, icon, className, ...props }: MetricCardProps) {
  return (
    <PremiumCard className={cn('metric-card', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="metric-label">{label}</div>
        {icon ? <div className="metric-icon">{icon}</div> : null}
      </div>
      <div className="metric-value">{value}</div>
      {helper || trend ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {helper ? <div className="metric-helper">{helper}</div> : null}
          {trend ? <div className="metric-trend">{trend}</div> : null}
        </div>
      ) : null}
    </PremiumCard>
  )
}

export function PremiumTable({ className, children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="premium-table-shell">
      <table className={cn('premium-table', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function PremiumFilterBar({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('premium-filterbar', className)} {...props}>
      {children}
    </div>
  )
}

interface PremiumTabsProps<T extends string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Array<{ key: T; label: ReactNode; badge?: ReactNode; disabled?: boolean }>
  activeKey: T
  onChange: (key: T) => void
}

export function PremiumTabs<T extends string>({ tabs, activeKey, onChange, className, ...props }: PremiumTabsProps<T>) {
  return (
    <div className={cn('premium-tabs', className)} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          disabled={tab.disabled}
          onClick={() => onChange(tab.key)}
          className={cn('premium-tab', activeKey === tab.key && 'premium-tab-active')}
        >
          <span>{tab.label}</span>
          {tab.badge ? <span className="premium-tab-badge">{tab.badge}</span> : null}
        </button>
      ))}
    </div>
  )
}

export const PremiumInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PremiumInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn('premium-input', className)} {...props} />
})

export const PremiumSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function PremiumSelect(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn('premium-input premium-select', className)} {...props} />
})

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function PremiumTextarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn('premium-input premium-textarea', className)} {...props} />
})

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function PremiumButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: PremiumButtonProps) {
  return (
    <button
      className={cn(
        'premium-button',
        variant === 'secondary' && 'premium-button-secondary',
        variant === 'ghost' && 'premium-button-ghost',
        variant === 'danger' && 'premium-button-danger',
        size === 'sm' && 'premium-button-sm',
        size === 'lg' && 'premium-button-lg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info'
}

export function PremiumBadge({ tone = 'default', className, children, ...props }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        'premium-badge',
        tone === 'accent' && 'premium-badge-accent',
        tone === 'success' && 'premium-badge-success',
        tone === 'warning' && 'premium-badge-warning',
        tone === 'error' && 'premium-badge-error',
        tone === 'info' && 'premium-badge-info',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface BaseStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

function BaseState({
  title,
  description,
  action,
  icon,
  className,
  iconClassName,
}: BaseStateProps & { iconClassName?: string }) {
  return (
    <SurfacePanel className={cn('foundation-state', className)}>
      {icon ? <div className={cn('foundation-state-icon', iconClassName)}>{icon}</div> : null}
      <div className="foundation-state-title">{title}</div>
      {description ? <p className="foundation-state-description">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </SurfacePanel>
  )
}

export function EmptyState({ title, description, action, icon, className }: BaseStateProps) {
  return (
    <BaseState
      title={title}
      description={description}
      action={action}
      icon={icon ?? <Inbox className="h-8 w-8" />}
      className={className}
      iconClassName="text-[var(--pulse-color-text-muted)]"
    />
  )
}

export function ErrorState({ title, description, action, icon, className }: BaseStateProps) {
  return (
    <BaseState
      title={title}
      description={description}
      action={action}
      icon={icon ?? <AlertTriangle className="h-8 w-8" />}
      className={className}
      iconClassName="text-[var(--pulse-status-error)]"
    />
  )
}

export function InfoState({ title, description, action, icon, className }: BaseStateProps) {
  return (
    <BaseState
      title={title}
      description={description}
      action={action}
      icon={icon ?? <Info className="h-8 w-8" />}
      className={className}
      iconClassName="text-[var(--pulse-status-info)]"
    />
  )
}

export function PermissionBlockedState({ title, description, action, icon, className }: BaseStateProps) {
  return (
    <BaseState
      title={title}
      description={description}
      action={action}
      icon={icon ?? <Lock className="h-8 w-8" />}
      className={className}
      iconClassName="text-[var(--pulse-status-warning)]"
    />
  )
}

export function LoadingState({
  title = 'Preparando',
  description = 'Estamos montando tudo para você. Um momento, por favor.',
  className,
}: Partial<BaseStateProps>) {
  return (
    <BaseState
      title={title}
      description={description}
      icon={<Loader2 className="h-8 w-8 animate-spin" />}
      className={className}
      iconClassName="text-[var(--pulse-color-primary-accent)]"
    />
  )
}

interface MediaFrameProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: 'square' | 'video' | 'portrait' | 'cinema'
}

export function MediaFrame({ ratio = 'video', className, children, ...props }: MediaFrameProps) {
  return (
    <div
      className={cn(
        'media-frame',
        ratio === 'square' && 'aspect-square',
        ratio === 'portrait' && 'aspect-[4/5]',
        ratio === 'cinema' && 'aspect-[21/9]',
        ratio === 'video' && 'aspect-[16/9]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('divider', className)} {...props} />
}

interface HeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions, className, ...props }: HeaderProps) {
  return (
    <div className={cn('page-header', className)} {...props}>
      <div>
        {eyebrow ? <div className="page-eyebrow">{eyebrow}</div> : null}
        <h1 className="page-title-luxury">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  )
}

export function SectionHeader({ eyebrow, title, description, actions, className, ...props }: HeaderProps) {
  return (
    <div className={cn('section-header', className)} {...props}>
      <div>
        {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
        <h2 className="section-title-luxury">{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {actions ? <div className="section-header-actions">{actions}</div> : null}
    </div>
  )
}

export function AdminShell({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('admin-shell-foundation', className)} {...props}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              'linear-gradient(var(--pulse-surface-accent) 1px, transparent 1px), linear-gradient(90deg, var(--pulse-surface-accent) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full blur-[150px]" style={{ background: 'var(--pulse-surface-accent)' }} />
        <div className="absolute right-[-8rem] top-[18%] h-[24rem] w-[24rem] rounded-full blur-[150px]" style={{ background: 'var(--pulse-overlay-soft)' }} />
        <div className="absolute bottom-[-10rem] left-[34%] h-[24rem] w-[24rem] rounded-full blur-[170px]" style={{ background: 'var(--pulse-button-secondary-hover)' }} />
      </div>
      <div className="relative z-10 flex min-h-screen w-full">
        {children}
      </div>
    </div>
  )
}

export function AdminPageLayout({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <PageShell tone="admin" className={cn('admin-page-layout', className)} {...props}>
      {children}
    </PageShell>
  )
}

export function AdminMetricSection({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SectionShell className={cn('admin-metric-section', className)} {...props}>
      {children}
    </SectionShell>
  )
}

export function AdminTableSection({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SectionShell className={cn('admin-table-section', className)} {...props}>
      {children}
    </SectionShell>
  )
}

export function AdminFormSection({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SectionShell className={cn('admin-form-section', className)} {...props}>
      {children}
    </SectionShell>
  )
}

interface AdminModalShellProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onClose?: () => void
  size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
}

export function AdminModalShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'xl',
}: AdminModalShellProps) {
  return (
    <ModalShell size={size} panelClassName="luxury-modal-shell">
      <ModalHeader eyebrow={eyebrow} title={title} subtitle={description} onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      {footer ? <ModalFooter>{footer}</ModalFooter> : null}
    </ModalShell>
  )
}

export function AdminActionBar({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('admin-action-bar', className)} {...props}>
      {children}
    </div>
  )
}

interface AdminFeedbackStatesProps {
  state: 'loading' | 'empty' | 'error' | 'blocked' | 'info'
  title: string
  description?: string
  action?: ReactNode
}

export function AdminFeedbackStates({ state, title, description, action }: AdminFeedbackStatesProps) {
  if (state === 'loading') {
    return <LoadingState title={title} description={description} />
  }

  if (state === 'empty') {
    return <EmptyState title={title} description={description} action={action} />
  }

  if (state === 'blocked') {
    return <PermissionBlockedState title={title} description={description} action={action} />
  }

  if (state === 'info') {
    return <InfoState title={title} description={description} action={action} />
  }

  return <ErrorState title={title} description={description} action={action} />
}
