import { useState } from 'react'
import { Copy, Instagram, Link2, Loader2, MessageCircle, Send } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { growthService } from '@/features/growth/services/growth.service'

interface ShareButtonsProps {
  organizationId: string
  eventId: string
  eventName: string
  eventSlug: string
  description?: string
  tone?: 'light' | 'dark'
  className?: string
}

export function ShareButtons({
  organizationId,
  eventId,
  eventName,
  eventSlug,
  description,
  tone = 'dark',
  className,
}: ShareButtonsProps) {
  const user = useAuthStore((state) => state.user)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedState, setCopiedState] = useState<'idle' | 'copied'>('idle')

  async function resolveShareUrl() {
    if (!user) {
      return growthService.buildEventShareUrl(eventSlug)
    }

    setIsGenerating(true)

    try {
      try {
        const link = await growthService.getOrCreateReferralLink({
          organizationId,
          eventId,
          eventName,
          eventSlug,
          referrerId: user.id,
        })

        return link.shareUrl
      } catch {
        return growthService.buildEventShareUrl(eventSlug)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyLink() {
    const url = await resolveShareUrl()
    await navigator.clipboard.writeText(url)
    setCopiedState('copied')
    window.setTimeout(() => setCopiedState('idle'), 2200)
  }

  async function openShare(channel: 'whatsapp' | 'telegram' | 'instagram') {
    const shareUrl = await resolveShareUrl()
    const shareText = `${eventName}${description ? ` — ${description}` : ''}`

    if (channel === 'instagram') {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedState('copied')
      window.setTimeout(() => setCopiedState('idle'), 2200)
      return
    }

    const target =
      channel === 'whatsapp'
        ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
        : `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`

    window.open(target, '_blank', 'noopener,noreferrer')
  }

  const buttonClassName =
    tone === 'light'
      ? 'inline-flex items-center gap-2 rounded-full border border-[#d9ccb8] bg-white/88 px-4 py-2 text-xs font-medium tracking-[0.18em] text-[#1f1a15] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfa98a] hover:bg-white'
      : 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/86 uppercase backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/16'

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <button type="button" onClick={() => void openShare('whatsapp')} className={buttonClassName}>
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </button>
      <button type="button" onClick={() => void openShare('instagram')} className={buttonClassName}>
        <Instagram className="h-4 w-4" />
        Instagram
      </button>
      <button type="button" onClick={() => void openShare('telegram')} className={buttonClassName}>
        <Send className="h-4 w-4" />
        Telegram
      </button>
      <button type="button" onClick={() => void copyLink()} className={buttonClassName}>
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : copiedState === 'copied' ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copiedState === 'copied' ? 'Link copiado' : 'Copiar link'}
      </button>
    </div>
  )
}
