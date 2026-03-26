import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { PublicReveal } from '@/features/public'
import { useLeadCapture } from '@/features/growth/hooks/useGrowthOverview'
import { dismissLeadCapture, wasLeadCaptureDismissed } from '@/features/growth/services/growth.storage'

interface ExitLeadCaptureDialogProps {
  source: string
  organizationId?: string | null
  eventId?: string | null
  title?: string
  description?: string
}

export function ExitLeadCaptureDialog({
  source,
  organizationId,
  eventId,
  title = 'Receba a proxima janela antes do resto do mercado.',
  description = 'Salvamos seu acesso a futuras experiencias, viradas de lote e convites premium sem poluir sua caixa.',
}: ExitLeadCaptureDialogProps) {
  const captureLead = useLeadCapture()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (wasLeadCaptureDismissed()) {
      return
    }

    const timer = window.setTimeout(() => setOpen(true), 10000)

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 12) {
        setOpen(true)
      }
    }

    document.addEventListener('mouseout', handleMouseLeave)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mouseout', handleMouseLeave)
    }
  }, [])

  const footerCopy = useMemo(
    () => (status === 'success' ? 'Seu e-mail entrou na esteira de acesso prioritario.' : 'Nada de spam. So convites, viradas e beneficios relevantes.'),
    [status],
  )

  async function handleSubmit() {
    if (!email.trim()) {
      setStatus('error')
      return
    }

    try {
      await captureLead.mutateAsync({
        email,
        organizationId,
        eventId,
        source,
        metadata: {
          page: typeof window !== 'undefined' ? window.location.pathname : '',
        },
      })
      setStatus('success')
      dismissLeadCapture()
    } catch {
      setStatus('error')
    }
  }

  function handleClose() {
    setOpen(false)
    dismissLeadCapture()
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#201812]/32 px-4 pb-4 pt-20 backdrop-blur-md md:items-center">
      <PublicReveal className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-[2.4rem] border border-[#eadfce] bg-[#f8f3ea] shadow-[0_24px_80px_rgba(37,24,10,0.18)]">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-[#1f1a15] px-7 py-8 text-white md:px-9 md:py-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/78">
                <Mail className="h-4 w-4" />
                Acesso antecipado
              </div>
              <div className="mt-5 font-display text-[clamp(2.6rem,4vw,4rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                {title}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/72">{description}</p>
            </div>

            <div className="px-7 py-8 md:px-8 md:py-10">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">Growth capture</div>
              <div className="mt-3 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.04em] text-[#1f1a15]">
                Entre uma vez e mantenha a relacao viva.
              </div>
              <div className="mt-6">
                <label className="text-xs uppercase tracking-[0.24em] text-[#8b7c69]">Seu melhor e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (status !== 'idle') {
                      setStatus('idle')
                    }
                  }}
                  placeholder="voce@exemplo.com"
                  className="mt-3 h-14 w-full rounded-[1.2rem] border border-[#dfd1bd] bg-white px-4 text-sm text-[#1f1a15] outline-none transition-all focus:border-[#c4a977] focus:ring-2 focus:ring-[#f0dfbf]"
                />
                {status === 'error' ? <div className="mt-3 text-xs leading-6 text-[#9f4b3d]">Revise o e-mail e tente novamente.</div> : null}
                {status === 'success' ? <div className="mt-3 text-xs leading-6 text-[#496348]">{footerCopy}</div> : null}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={captureLead.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {captureLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Garantir acesso
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center rounded-full border border-[#d5c7b4] px-4 py-3 text-sm font-medium text-[#5f5549] transition-colors hover:border-[#bfa98a] hover:text-[#1f1a15]"
                >
                  Agora nao
                </button>
              </div>

              {status !== 'success' ? <div className="mt-4 text-xs leading-6 text-[#8a7d6c]">{footerCopy}</div> : null}
            </div>
          </div>
        </div>
      </PublicReveal>
    </div>
  )
}
