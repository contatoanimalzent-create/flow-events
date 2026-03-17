import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'teal' | 'purple' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  error:   'bg-status-error/10 text-status-error',
  info:    'bg-status-info/10 text-status-info',
  teal:    'bg-brand-teal/10 text-brand-teal',
  purple:  'bg-brand-purple/10 text-brand-purple',
  muted:   'bg-bg-border text-text-secondary',
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      badgeVariants[variant], className)}>
      {children}
    </span>
  )
}

// ─── StatCard ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, iconColor, className }: StatCardProps) {
  return (
    <div className={cn('card p-5 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColor ?? 'bg-brand-teal/10')}>
            <Icon className={cn('w-4 h-4', iconColor ? 'text-current' : 'text-brand-teal')} />
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-text-primary">{value}</div>
      {change && (
        <span className={cn('text-xs font-medium', {
          'text-status-success': changeType === 'up',
          'text-status-error':   changeType === 'down',
          'text-text-muted':     changeType === 'neutral',
        })}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
        </span>
      )}
    </div>
  )
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-text-muted" />
        </div>
      )}
      <h3 className="text-base font-medium text-text-primary mb-2">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-bg-card border border-bg-border rounded-2xl', padding && 'p-5', className)}>
      {children}
    </div>
  )
}

// ─── SectionHeader ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────
interface AlertBannerProps {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  onClose?: () => void
}

const alertStyles = {
  success: 'bg-status-success/10 border-status-success/20 text-status-success',
  warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
  error:   'bg-status-error/10 border-status-error/20 text-status-error',
  info:    'bg-status-info/10 border-status-info/20 text-status-info',
}

export function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm', alertStyles[type])}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  )
}
