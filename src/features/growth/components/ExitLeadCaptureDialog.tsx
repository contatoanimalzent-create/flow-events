import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Loader2, Mail, X } from 'lucide-react'
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
    if (wasLeadCaptureDismissed()) return

    // Timer: 40s on desktop, 25s on touch-only (mobile)
    const isTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const delay = isTouchOnly ? 25000 : 40000
    const timer = window.setTimeout(() => setOpen(true), delay)

    // Exit-intent: only reliable on non-touch devices
    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) setOpen(true)
    }
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    // Scroll-depth trigger for mobile: show after 70% of page scrolled
    let scrollFired = false
    const handleScroll = () => {
      if (scrollFired) return
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total >= 0.70) {
        scrollFired = true
        setOpen(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.clearTimeout(timer)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const footerCopy = useMemo(
    () =>
      status === 'success'
        ? 'Seu e-mail entrou na esteira de acesso prioritario.'
        : 'Nada de spam. So convites, viradas e beneficios relevantes.',
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
        metadata: { page: typeof window !== 'undefined' ? window.location.pathname : '' },
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

  if (!open) return null

  return (
    /* Overlay — solid dark, sem blur */
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-3 sm:items-center sm:px-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-[680px] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{
          animation: 'slideUp 0.32s cubic-bezier(0.16,1,0.3,1) both',
          background: '#0f0e0d',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(196,154,80,0.08)',
          maxHeight: 'calc(100svh - 1.5rem)',
          overflowY: 'auto',
        }}
      >
        {/* Fechar */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-[#6a6058] transition-all hover:border-[rgba(255,255,255,0.2)] hover:text-[#f0ebe2]"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[1fr_1fr]">
          {/* Lado esquerdo — oculto em mobile, visivel a partir de md */}
          <div
            className="hidden overflow-hidden px-9 py-10 md:block"
            style={{
              background: 'linear-gradient(160deg, #161410 0%, #0e0c0a 100%)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Glow decorativo */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c49a50]/08 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#c49a50]">
                <Mail className="h-3.5 w-3.5" />
                Acesso antecipado
              </div>
              <h2
                className="mt-5 font-display leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]"
                style={{ fontSize: 'clamp(2.2rem,3.5vw,3.4rem)', fontWeight: 600 }}
              >
                {title}
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#6a6058]">{description}</p>
            </div>
          </div>

          {/* Lado direito — formulario (unico coluna em mobile) */}
          <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-9">
            {/* Eyebrow visivel so em mobile (no desktop esta no painel esquerdo) */}
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#c49a50]">
                <Mail className="h-3 w-3" />
                Acesso antecipado
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-[0.3em] text-[#c49a50]">Acesso gratuito</div>
            <div className="mt-2 font-display text-[1.6rem] font-semibold leading-[0.94] tracking-[-0.04em] text-[#f0ebe2] sm:text-[1.9rem]">
              Entre uma vez e mantenha a relacao viva.
            </div>

            <div className="mt-5 sm:mt-7">
              <label className="block text-[10px] uppercase tracking-[0.26em] text-[#6a6058]">
                Seu melhor e-mail
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status !== 'idle') setStatus('idle')
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
                placeholder="voce@exemplo.com"
                className="mt-3 h-12 w-full rounded-[1rem] px-4 py-3 text-sm text-[#f0ebe2] outline-none transition-all placeholder:text-[#4a4540]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: status === 'error' ? '1px solid rgba(196,92,106,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  WebkitAppearance: 'none',
                  fontSize: '16px', // evita zoom no iOS
                }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(196,154,80,0.4)' }}
                onBlur={(e) => {
                  e.currentTarget.style.border = status === 'error'
                    ? '1px solid rgba(196,92,106,0.5)'
                    : '1px solid rgba(255,255,255,0.1)'
                }}
              />
              {status === 'error' ? (
                <p className="mt-2 text-xs text-[#c45c6a]">Revise o e-mail e tente novamente.</p>
              ) : null}
              {status === 'success' ? (
                <p className="mt-2 text-xs text-[#4a9b7f]">{footerCopy}</p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={captureLead.isPending || status === 'success'}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: '#c49a50',
                  boxShadow: '0 4px 20px rgba(196,154,80,0.28)',
                }}
              >
                {captureLead.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ArrowRight className="h-4 w-4" />}
                {status === 'success' ? 'Acesso garantido!' : 'Garantir acesso'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-full border border-[rgba(255,255,255,0.08)] py-3 text-sm font-medium text-[#6a6058] transition-all hover:border-[rgba(255,255,255,0.16)] hover:text-[#f0ebe2] active:scale-95"
              >
                Agora nao
              </button>
            </div>

            {status !== 'success' ? (
              <p className="mt-4 text-center text-[11px] text-[#4a4540]">{footerCopy}</p>
            ) : null}

            {/* Safe area para iPhones com notch */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
