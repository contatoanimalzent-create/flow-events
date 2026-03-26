import type { ReactNode } from 'react'
import { MediaFrame, PremiumCard, SectionHeader } from '@/shared/components'
import { PublicReveal } from './PublicReveal'

interface MediaStoryBlockProps {
  eyebrow?: string
  title: string
  description: string
  media?: ReactNode
  aside?: ReactNode
}

export function MediaStoryBlock({ eyebrow, title, description, media, aside }: MediaStoryBlockProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <PublicReveal>
        <PremiumCard className="overflow-hidden p-3">
          <MediaFrame ratio="cinema">
            {media ?? <div className="h-full w-full bg-[linear-gradient(145deg,#f4ecdf_0%,#e9ddcb_48%,#f7f2e8_100%)]" />}
          </MediaFrame>
        </PremiumCard>
      </PublicReveal>
      <PublicReveal delayMs={110}>
        <PremiumCard className="flex h-full flex-col justify-between gap-6 p-8">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          {aside ? <div>{aside}</div> : null}
        </PremiumCard>
      </PublicReveal>
    </div>
  )
}
