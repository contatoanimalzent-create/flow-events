import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib'

const columnSpanClassNames = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
} as const

const tabletSpanClassNames = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
} as const

const desktopSpanClassNames = {
  1: 'xl:col-span-1',
  2: 'xl:col-span-2',
  3: 'xl:col-span-3',
  4: 'xl:col-span-4',
  5: 'xl:col-span-5',
  6: 'xl:col-span-6',
  7: 'xl:col-span-7',
  8: 'xl:col-span-8',
  9: 'xl:col-span-9',
  10: 'xl:col-span-10',
  11: 'xl:col-span-11',
  12: 'xl:col-span-12',
} as const

interface AppGridProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'dense' | 'base'
}

export function AppGrid({ gap = 'base', className, children, ...props }: AppGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-12',
        gap === 'dense' ? 'gap-[var(--pulse-app-grid-gap-dense)]' : 'gap-[var(--pulse-app-grid-gap)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface AppGridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: keyof typeof columnSpanClassNames
  tabletSpan?: keyof typeof tabletSpanClassNames
  desktopSpan?: keyof typeof desktopSpanClassNames
}

export function AppGridItem({
  span = 12,
  tabletSpan,
  desktopSpan,
  className,
  children,
  ...props
}: AppGridItemProps) {
  return (
    <div
      className={cn(
        'min-w-0',
        columnSpanClassNames[span],
        tabletSpan ? tabletSpanClassNames[tabletSpan] : null,
        desktopSpan ? desktopSpanClassNames[desktopSpan] : null,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
