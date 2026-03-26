import { useEffect } from 'react'

interface SeoMetaInput {
  title: string
  description: string
  image?: string | null
  url?: string | null
  type?: 'website' | 'article'
}

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)

  if (!tag) {
    const createdTag = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => createdTag.setAttribute(key, value))
    document.head.appendChild(createdTag)
    tag = createdTag
  }

  return tag
}

export function useSeoMeta({ title, description, image, url, type = 'website' }: SeoMetaInput) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const descriptionTag = ensureMeta('meta[name="description"]', { name: 'description' })
    const ogTitleTag = ensureMeta('meta[property="og:title"]', { property: 'og:title' })
    const ogDescriptionTag = ensureMeta('meta[property="og:description"]', { property: 'og:description' })
    const ogTypeTag = ensureMeta('meta[property="og:type"]', { property: 'og:type' })
    const ogUrlTag = ensureMeta('meta[property="og:url"]', { property: 'og:url' })
    const ogImageTag = ensureMeta('meta[property="og:image"]', { property: 'og:image' })
    const twitterCardTag = ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' })
    const twitterTitleTag = ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' })
    const twitterDescriptionTag = ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description' })
    const twitterImageTag = ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image' })

    descriptionTag.content = description
    ogTitleTag.content = title
    ogDescriptionTag.content = description
    ogTypeTag.content = type
    ogUrlTag.content = url ?? (typeof window !== 'undefined' ? window.location.href : '')
    ogImageTag.content = image ?? ''
    twitterCardTag.content = image ? 'summary_large_image' : 'summary'
    twitterTitleTag.content = title
    twitterDescriptionTag.content = description
    twitterImageTag.content = image ?? ''

    return () => {
      document.title = previousTitle
    }
  }, [description, image, title, type, url])
}
