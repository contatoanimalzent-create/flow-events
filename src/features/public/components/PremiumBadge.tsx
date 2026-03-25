import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface PremiumBadgeProps {
  children: ReactNode
  tone?: 'default' | 'muted' | 'accent' | 'success'
  className?: string
}

const TONE_CLASSNAME: Record<NonNullable<PremiumBadgeProps['tone']>, string> = {
  default: 'border-white/60 bg-white/75 text-[#3b352e]',
  muted: 'border-[#d8cec0] bg-[#f5ede0] text-[#6f6557]',
  accent: 'border-[#dac38d] bg-[#f7edd1] text-[#6d5324]',
  success: 'border-[#b8d6c7] bg-[#edf6f0] text-[#365844]',
}

export function PremiumBadge({ children, tone = 'default', className }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em]',
        TONE_CLASSNAME[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
