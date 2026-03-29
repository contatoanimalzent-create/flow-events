import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Orbit, ShieldCheck, Ticket } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'

export function LoginPage({ onBack }: { onBack?: () => void }) {
  const { signIn } = useAuthStore()
  const { t, isPortuguese } = useAppLocale()
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

  const highlights = [
    {
      icon: Orbit,
      label: t('Creator operation', 'Operacao de criadores'),
      text: t(
        'Event page, sales and live operation connected in the same flow.',
        'Pagina do evento, vendas e operacao ao vivo conectadas no mesmo fluxo.',
      ),
    },
    {
      icon: Ticket,
      label: t('Fast sales', 'Venda rapida'),
      text: t(
        'Configured tickets, clean checkout and audience visibility in one place.',
        'Ingressos configurados, compra limpa e visibilidade de publico em um so lugar.',
      ),
    },
    {
      icon: ShieldCheck,
      label: t('Reliable access', 'Acesso confiavel'),
      text: t(
        'Protected QR code, clear control and event-day confidence.',
        'QR code protegido, controle claro e seguranca no dia do evento.',
      ),
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-[#050608] text-[#f3ede3]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '58px 58px' }} />
        <div className="absolute left-[-8rem] top-[18%] h-[26rem] w-[26rem] rounded-full bg-[#d4ff00]/6 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[20%] h-[34rem] w-[34rem] rounded-full bg-[#c49a50]/10 blur-[140px]" />
        <div className="absolute bottom-[-8rem] right-[18%] h-[24rem] w-[24rem] rounded-full bg-[#ffffff]/4 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-16">
          <div className="w-full max-w-[31rem]">
            <div className="mb-10 flex items-center justify-between gap-4">
              {onBack ? (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/56 transition-all hover:border-[#d4ff00]/25 hover:text-[#f3ede3]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('Back', 'Voltar')}
                </button>
              ) : <div />}

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#8c8175]">
                {isPortuguese ? 'Area do app' : 'App access'}
              </div>
            </div>

            <div className="mb-8">
              <img
                src="/logo.png"
                alt="Animalz Events"
                className="h-20 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 14px rgba(196,154,80,0.28))' }}
              />
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#8c8175]">
                {isPortuguese ? 'Entrar' : 'Sign in'}
              </div>

              <h1 className="mt-6 font-display text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#f3ede3]">
                {t('Welcome back.', 'Bem-vindo de volta.')}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
                {t(
                  'Access your operation area to manage sales, audiences and event-day execution.',
                  'Acesse sua area operacional para gerenciar vendas, publico e execucao do evento.',
                )}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8c8175]">
                    {t('Email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-[1.2rem] border border-white/10 bg-[#0b0f14] px-5 text-[15px] text-[#f3ede3] outline-none transition-all placeholder:text-white/28 focus:border-[#d4ff00]/28 focus:bg-[#0c1117]"
                    placeholder={t('you@email.com', 'voce@email.com')}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8c8175]">
                    {t('Password', 'Senha')}
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 w-full rounded-[1.2rem] border border-white/10 bg-[#0b0f14] px-5 pr-12 text-[15px] text-[#f3ede3] outline-none transition-all placeholder:text-white/28 focus:border-[#d4ff00]/28 focus:bg-[#0c1117]"
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/36 transition-colors hover:text-[#f3ede3]"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${rememberMe ? 'border-[#d4ff00] bg-[#d4ff00]' : 'border-white/16 bg-transparent'}`}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      {rememberMe ? (
                        <svg className="h-3.5 w-3.5 text-[#060609]" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="text-xs text-white/54">
                      {t('Keep me signed in', 'Continuar conectado')}
                    </span>
                  </label>

                  <a href="/contact" className="text-xs text-[#c49a50] transition-colors hover:text-[#f3ede3]">
                    {t('Need help?', 'Precisa de ajuda?')}
                  </a>
                </div>

                {error ? (
                  <div className="rounded-[1.2rem] border border-[#ff5f5f]/20 bg-[#ff5f5f]/8 px-4 py-3 text-sm text-[#ff9a9a]">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#d4ff00] px-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#060609] transition-all hover:-translate-y-0.5 hover:bg-[#e3ff4d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t('Enter the app', 'Entrar no app')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-xs leading-6 text-white/42">
                {t('Trouble accessing your account?', 'Problemas para acessar sua conta?')}{' '}
                <a href="/contact" className="text-[#c49a50] transition-colors hover:text-[#f3ede3]">
                  {t('Contact support', 'Falar com suporte')}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden border-l border-white/8 lg:flex">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_38%)]" />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '58px 58px' }} />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-14 py-16 xl:px-20">
            <div className="max-w-[42rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#8c8175]">
                {isPortuguese ? 'Frente publica e operacao' : 'Public front and operations'}
              </div>

              <div className="mt-8 font-display text-[clamp(4.2rem,7vw,7.4rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-[#f3ede3]">
                {t('Create,', 'Criar,')}
                <br />
                {t('sell,', 'vender,')}
                <br />
                <span className="text-[#d4ff00]">{t('operate', 'operar')}</span>
                <br />
                {t('and scale', 'e escalar')}
                <br />
                {t('events.', 'eventos.')}
              </div>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/56">
                {t(
                  'The same front-end language that presents the experience also organizes ticket sales, audience data and live access control.',
                  'A mesma linguagem do front que apresenta a experiencia tambem organiza venda de ingressos, dados de publico e controle de acesso ao vivo.',
                )}
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-7 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#8c8175]">
                  {t('What stays connected', 'O que fica conectado')}
                </div>
                <div className="mt-6 grid gap-4">
                  {highlights.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-[#0b0f14]/80 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c49a50]/12 text-[#c49a50]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8c8175]">
                            {item.label}
                          </div>
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-7 text-white/56">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-4">
                {[
                  { value: '500+', label: t('Events', 'Eventos') },
                  { value: '2M+', label: t('Tickets', 'Ingressos') },
                  { value: '99.9%', label: 'Uptime' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="font-display text-[3rem] font-semibold leading-none tracking-[-0.05em] text-[#d4ff00]">
                      {item.value}
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.28em] text-white/44">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
