import type { ReactNode } from 'react'
import { PublicReveal } from './PublicReveal'

interface EditorialContentBlockProps {
  eyebrow: string
  title: string
  description: string
  note?: string
  children?: ReactNode
}

export function EditorialContentBlock({
  eyebrow,
  title,
  description,
  note,
  children,
}: EditorialContentBlockProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
      <PublicReveal>
        <div className="max-w-xl">
          <div className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">{eyebrow}</div>
          <h3 className="font-serif text-4xl font-semibold leading-none text-[#1f1a15] md:text-5xl">
            {title}
          </h3>
          <p className="mt-5 text-base leading-7 text-[#5f5549] md:text-lg">{description}</p>
          {note ? <div className="mt-6 text-sm uppercase tracking-[0.24em] text-[#8e7f68]">{note}</div> : null}
        </div>
      </PublicReveal>
      <PublicReveal delayMs={120}>
        {children}
      </PublicReveal>
    </div>
  )
}
