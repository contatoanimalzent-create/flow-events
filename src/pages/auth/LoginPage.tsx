import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'

export function LoginPage({ onBack }: { onBack?: () => void }) {
  const { signIn } = useAuthStore()
  const { t } = useAppLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.error) {
      setError(t('Incorrect email or password. Please try again.', 'Email ou senha incorretos. Tente novamente.'))
    } else if (!rememberMe) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => localStorage.removeItem(k))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050608] flex">
      <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative w-full max-w-sm">
          {onBack ? (
            <button
              onClick={onBack}
              className="mb-10 flex items-center gap-2 text-xs font-mono tracking-wider text-white/45 transition-colors hover:text-[#d4ff00]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('BACK', 'VOLTAR')}
            </button>
          ) : null}

          <div className="mb-12">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className="h-24 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(196,154,80,0.25))' }}
            />
          </div>

          <h1 className="mb-1 font-display text-4xl leading-none tracking-wide text-[#f1eadf]">
            {t('WELCOME', 'BEM-VINDO')}
            <br />
            {t('BACK', 'DE VOLTA')}
            <span className="text-[#d4ff00]">.</span>
          </h1>
          <p className="mb-10 mt-2 text-sm text-white/48">{t('Sign in to continue', 'Entre para continuar')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">{t('Email', 'Email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input border-white/10 bg-white/[0.03] text-[#f1eadf] placeholder:text-white/30 focus:border-[#d4ff00]"
                placeholder={t('you@email.com', 'voce@email.com')}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="input-label">{t('Password', 'Senha')}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input border-white/10 bg-white/[0.03] pr-10 text-[#f1eadf] placeholder:text-white/30 focus:border-[#d4ff00]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-[#d4ff00]"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`h-4 w-4 rounded-sm border transition-colors ${rememberMe ? 'border-[#d4ff00] bg-[#d4ff00]' : 'border-white/14 bg-white/[0.03]'}`}>
                  {rememberMe && (
                    <svg className="h-4 w-4 text-[#050608]" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-white/48">{t('Keep me signed in', 'Continuar conectado')}</span>
            </label>

            {error ? (
              <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d4ff00] text-[#050608] transition-colors hover:bg-[#e5ff5c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{t('Sign in', 'Entrar')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/45">
            {t('Trouble accessing your account?', 'Problemas para acessar sua conta?')}{' '}
            <button className="text-[#d4ff00] hover:underline">{t('Contact support', 'Falar com suporte')}</button>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-l border-white/8 bg-[#090b0e] p-16 lg:flex">
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[#d4ff00]/[0.08] blur-3xl animate-orb-float" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-6 font-display text-6xl leading-none text-[#f1eadf] xl:text-7xl">
            {t('CREATE,', 'CRIAR,')}
            <br />
            {t('SELL,', 'VENDER,')}
            <br />
            <span className="text-[#d4ff00]">{t('OPERATE', 'OPERAR')}</span>
            <br />
            {t('AND SCALE', 'E ESCALAR')}
            <br />
            {t('EVENTS', 'EVENTOS')}
            <span className="text-[#d4ff00]">.</span>
          </div>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/48">
            {t(
              'The complete operating platform for event producers who want to grow with clarity, intelligence and control.',
              'A plataforma operacional completa para produtores que querem crescer com clareza, inteligencia e controle.',
            )}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { v: '500+', l: t('Events', 'Eventos') },
              { v: '2M+', l: t('Tickets', 'Ingressos') },
              { v: '99.9%', l: 'Uptime' },
            ].map((s) => (
              <div key={s.l} className="rounded-sm border border-white/8 bg-white/[0.03] p-4">
                <div className="font-display text-2xl leading-none text-[#d4ff00]">{s.v}</div>
                <div className="mt-1 font-mono text-[11px] tracking-wider text-white/42">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
