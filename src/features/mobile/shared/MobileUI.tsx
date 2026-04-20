import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface MobileCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  accent?: boolean
  accentColor?: string
}

export function MobileCard({ children, className, onClick, accent, accentColor }: MobileCardProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'w-full rounded-xl bg-white/6 p-4 text-left transition-colors',
        onClick && 'active:bg-white/10',
        accent && 'border-l-2',
        className,
      )}
      style={accent && accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      {children}
    </Tag>
  )
}

interface MobileBtnProps {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  accentColor?: string
  type?: 'button' | 'submit' | 'reset'
}

export function MobileBtn({
  children, onClick, loading, disabled, variant = 'primary', size = 'md', className, accentColor, type = 'button',
}: MobileBtnProps) {
  const sizes = { sm: 'h-10 px-4 text-sm', md: 'h-14 px-5 text-base', lg: 'h-16 px-6 text-lg' }
  const variants = {
    primary:   'text-white font-bold',
    secondary: 'bg-white/10 text-white font-semibold',
    ghost:     'text-white/70 font-medium',
    danger:    'bg-red-500/10 text-red-400 font-semibold border border-red-500/30',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.98]',
        sizes[size],
        variants[variant],
        (disabled || loading) && 'opacity-40',
        className,
      )}
      style={variant === 'primary' && accentColor ? { backgroundColor: accentColor } : undefined}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function MobileInput({
  label, placeholder, value, onChange, type = 'text', icon: Icon, ...rest
}: {
  label?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
  icon?: React.ElementType
  [key: string]: unknown
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-14 w-full rounded-xl border border-white/10 bg-white/6 text-white placeholder-white/25 focus:border-white/30 focus:outline-none transition-colors',
            Icon ? 'pl-11 pr-4' : 'px-4',
          )}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>
    </div>
  )
}

export function MobileBadge({
  children, color = 'blue',
}: { children: ReactNode; color?: 'blue' | 'green' | 'red' | 'orange' | 'gray' }) {
  const colors = {
    blue:   'bg-blue-500/15 text-blue-400',
    green:  'bg-green-500/15 text-green-400',
    red:    'bg-red-500/15 text-red-400',
    orange: 'bg-orange-500/15 text-orange-400',
    gray:   'bg-white/8 text-white/50',
  }
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', colors[color])}>
      {children}
    </span>
  )
}

export function MobileEmptyState({
  icon: Icon, title, subtitle, action,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/6">
        <Icon className="h-8 w-8 text-white/30" />
      </div>
      <div className="text-base font-semibold text-white/70">{title}</div>
      {subtitle && <div className="text-sm text-white/40">{subtitle}</div>}
      {action}
    </div>
  )
}

export function MobileLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-white/30" />
    </div>
  )
}

export function MobileDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="h-px flex-1 bg-white/8" />
      {label && <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">{label}</span>}
      <div className="h-px flex-1 bg-white/8" />
    </div>
  )
}

export function MobileListItem({
  left, title, subtitle, right, onClick, className,
}: {
  left?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3.5 transition-colors',
        onClick && 'active:bg-white/5',
        className,
      )}
    >
      {left && <div className="shrink-0">{left}</div>}
      <div className="flex-1 min-w-0 text-left">
        <div className="truncate text-sm font-medium text-white">{title}</div>
        {subtitle && <div className="truncate text-xs text-white/45 mt-0.5">{subtitle}</div>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Tag>
  )
}
