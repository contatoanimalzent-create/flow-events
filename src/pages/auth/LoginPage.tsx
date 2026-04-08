import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Mail, ShieldCheck } from 'lucide-react'
import { authService } from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/lib/store/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function LoginPage({ onBack, onSignup }: { onBack?: () => void; onSignup?: () => void }) {
  const { signIn, signInWithGoogle } = useAuthStore()
  const { t } = useAppLocale()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setRecoveryMessage('')
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

  const handleRecovery = async () => {
    if (!email) {
      setError(t('Enter your email to recover access.', 'Informe seu email para recuperar o acesso.'))
      return
    }

    setError('')
    setRecoveryMessage('')
    setRecoveryLoading(true)
    const { error: recoveryError } = await authService.resetPasswordForEmail(email)
    if (recoveryError) {
      setError(recoveryError.message)
    } else {
      setRecoveryMessage(
        t(
          'Recovery instructions sent. Check your inbox.',
          'Instrucoes de recuperacao enviadas. Verifique sua caixa de entrada.',
        ),
      )
    }
    setRecoveryLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/8 px-8 py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,87,231,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(10,26,255,0.12),transparent_22%),linear-gradient(180deg,#050505_0%,#0A0A0A_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />

          <div className="relative z-10">
            {onBack ? (
              <button
                onClick={onBack}
                className="mb-12 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/44 transition-colors hover:text-[#4285F4]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('Back', 'Voltar')}
              </button>
            ) : null}

            <img
              src="/logo.png"
              alt="Pulse"
              className="h-20 w-auto object-contain brightness-0 invert"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 18px rgba(0,87,231,0.22))' }}
            />

            <div className="mt-14">
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                {recoveryMode ? t('Producer recovery', 'Recuperacao do produtor') : t('Producer access', 'Acesso do produtor')}
              </div>
              <h1 className="mt-5 text-[clamp(3.2rem,6vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
                {recoveryMode
                  ? t('Recover your operation.', 'Recupere sua operacao.')
                  : t('Enter the event cockpit.', 'Entre no cockpit do evento.')}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-8 text-white/58">
                {recoveryMode
                  ? t(
                      'We send a secure link back to the email connected to your operation.',
                      'Enviamos um link seguro para o email conectado a sua operacao.',
                    )
                  : t(
                      'One entrance for sales, access control, finance, staff and governance.',
                      'Uma unica entrada para vendas, controle de acesso, financeiro, equipe e governanca.',
                    )}
              </p>
              {!recoveryMode ? (
                <ul className="mt-8 space-y-3">
                  {[
                    t('Vendas e ingressos em tempo real', 'Real-time sales and tickets'),
                    t('Check-in com QR Code', 'QR Code check-in'),
                    t('Relatorios e financeiro', 'Reports and finance'),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0057E7]/20 text-[#4285F4]">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: 'Live', label: t('Operations', 'Operacoes') },
              { value: 'QR', label: t('Access control', 'Controle de acesso') },
              { value: '24/7', label: t('Financial trace', 'Trilha financeira') },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <div className="text-2xl font-bold uppercase leading-none tracking-[-0.03em] text-white">
                  {item.value}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/42">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-[#0A0A0A] px-8 py-10 lg:px-10 lg:py-12">
          <div className="relative z-10 w-full max-w-[28rem] mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#4285F4]">
                  {recoveryMode ? t('Recovery flow', 'Fluxo de recuperacao') : t('Secure sign in', 'Entrada segura')}
                </div>
                <div className="mt-3 text-3xl font-black leading-[0.92] tracking-[-0.03em] text-white">
                  {recoveryMode ? t('Recover access', 'Recuperar acesso') : t('Sign in', 'Entrar')}
                </div>
                <div className="mt-2 text-sm text-white/42">
                  {recoveryMode
                    ? t('Enter your email to receive a recovery link.', 'Digite seu email para receber um link de recuperacao.')
                    : t('Welcome back. Enter your credentials.', 'Bem-vindo de volta. Digite suas credenciais.')}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#4285F4]/20 bg-[#0057E7]/14 text-[#4285F4]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {!recoveryMode ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    setGoogleLoading(true)
                    await signInWithGoogle()
                    setGoogleLoading(false)
                  }}
                  disabled={googleLoading}
                  className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-[#0A0A0A] text-sm font-semibold transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  {t('Continue with Google', 'Continuar com Google')}
                </button>

                <div className="relative my-5 flex items-center">
                  <div className="flex-1 border-t border-white/8" />
                  <span className="mx-3 text-[11px] uppercase tracking-[0.22em] text-white/28">{t('or', 'ou')}</span>
                  <div className="flex-1 border-t border-white/8" />
                </div>
              </>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">{t('Email', 'Email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input border-white/10 bg-white/[0.03] pl-10 text-white placeholder:text-white/30 focus:border-[#0057E7]"
                    placeholder={t('you@email.com', 'voce@email.com')}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {!recoveryMode ? (
                <>
                  <div>
                    <label className="input-label">{t('Password', 'Senha')}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input border-white/10 bg-white/[0.03] pr-10 text-white placeholder:text-white/30 focus:border-[#0057E7]"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-[#4285F4]"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-white/12 bg-white/[0.03] text-[#0057E7] focus:ring-[#0057E7]"
                      />
                      <span className="text-xs text-white/48">{t('Keep me signed in', 'Continuar conectado')}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setError('')
                        setRecoveryMode(true)
                      }}
                      className="text-xs text-[#4285F4] transition-colors hover:text-[#0057E7]"
                    >
                      {t('Recover access', 'Recuperar acesso')}
                    </button>
                  </div>
                </>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
                  {error}
                </div>
              ) : null}

              {recoveryMessage ? (
                <div className="rounded-xl border border-status-success/20 bg-status-success/8 px-4 py-3 text-xs text-status-success">
                  {recoveryMessage}
                </div>
              ) : null}

              {!recoveryMode ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0057E7] text-base font-bold text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4] hover:shadow-[0_20px_50px_rgba(0,87,231,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                    <span>{t('Sign in', 'Entrar')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRecovery}
                  disabled={recoveryLoading}
                  className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0057E7] text-base font-bold text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recoveryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                    <span>{t('Send recovery link', 'Enviar link de recuperacao')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>}
                </button>
              )}
            </form>

            <div className="mt-6 text-center text-xs text-white/42">
              {!recoveryMode ? (
                <>
                  {t("Don't have an account?", 'Nao tem uma conta?')}{' '}
                  <button onClick={onSignup} className="text-[#4285F4] transition-colors hover:text-[#0057E7]">
                    {t('Create one', 'Criar conta')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMode(false)
                    setError('')
                    setRecoveryMessage('')
                  }}
                  className="text-[#4285F4] transition-colors hover:text-[#0057E7]"
                >
                  {t('Back to login', 'Voltar ao login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
