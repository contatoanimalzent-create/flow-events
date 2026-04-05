import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@/shared/lib'

type PageContainerSize = 'content' | 'wide' | 'full'

interface PageContainerProps<T extends ElementType = 'section'> {
  as?: T
  size?: PageContainerSize
  children: ReactNode
  className?: string
}

const sizeClassNames: Record<PageContainerSize, string> = {
  content: 'max-w-[var(--pulse-app-content-max-width)]',
  wide: 'max-w-[var(--pulse-app-content-max-width-wide)]',
  full: 'max-w-none',
}

export function PageContainer<T extends ElementType = 'section'>({
  as,
  size = 'content',
  className,
  children,
  ...props
}: PageContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof PageContainerProps<T>>) {
  const Component = as ?? 'section'

  return (
    <Component
      className={cn(
        'mx-auto w-full px-[var(--pulse-app-content-padding-x-mobile)] lg:px-[var(--pulse-app-content-padding-x-desktop)]',
        sizeClassNames[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
