import { useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Loader2, Mail, Zap } from 'lucide-react'
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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const colors = ['', 'bg-status-error', 'bg-yellow-400', 'bg-blue-400', 'bg-status-success']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-white/10'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] font-mono tracking-wider ${score <= 1 ? 'text-status-error' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-status-success'}`}>
          {labels[score]}
        </p>
      )}
    </div>
  )
}

const FEATURES = [
  'Venda ingressos com zero taxa na plataforma',
  'Check-in por QR code em tempo real',
  'Dashboard com inteligência de negócio',
  'Gestão completa de staff e portarias',
]

export function SignupPage({ onBack, onLogin }: { onBack?: () => void; onLogin?: () => void }) {
  const { signUp, signInWithGoogle, setupOrganization } = useAuthStore()
  const { t } = useAppLocale()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters', 'A senha deve ter no mínimo 8 caracteres'))
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signUp(email, password, firstName, lastName)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.needsEmailConfirmation) {
      localStorage.setItem('fe_pending_org', orgName)
      setLoading(false)
      setStep(3)
      return
    }

    const orgResult = await setupOrganization(orgName)
    if (orgResult.error) {
      setError(orgResult.error)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    if (orgName) localStorage.setItem('fe_pending_org', orgName)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070607] flex">
      {/* ── LEFT: Form ── */}
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
          {/* Back button */}
          {onBack && step === 1 && (
            <button
              onClick={onBack}
              className="mb-10 flex items-center gap-2 text-xs font-mono tracking-wider text-white/45 transition-colors hover:text-[#ae936f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('BACK', 'VOLTAR')}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => { setStep(1); setError('') }}
              className="mb-10 flex items-center gap-2 text-xs font-mono tracking-wider text-white/45 transition-colors hover:text-[#ae936f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('BACK', 'VOLTAR')}
            </button>
          )}

          {/* Logo */}
          <div className="mb-10">
            <img
              src="/logo.png"
              alt="Flow Events"
              className="h-20 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(174,147,111,0.25))' }}
            />
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="mb-8 flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-medium transition-all ${
                    step === s ? 'bg-[#d62a0b] text-white' : step > s ? 'bg-[#d62a0b]/20 text-[#d62a0b]' : 'bg-white/8 text-white/30'
                  }`}>
                    {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                  </div>
                  {s < 2 && <div className={`h-px w-8 transition-all ${step > s ? 'bg-[#d62a0b]/40' : 'bg-white/10'}`} />}
                </div>
              ))}
              <span className="ml-1 text-[11px] font-mono tracking-wider text-white/30">
                {step === 1 ? t('ACCOUNT', 'CONTA') : t('WORKSPACE', 'WORKSPACE')}
              </span>
            </div>
          )}

          {/* ── STEP 1: Personal info ── */}
          {step === 1 && (
            <>
              <h1 className="mb-1 font-display text-4xl leading-none tracking-wide text-[#ebe7e0]">
                {t('CREATE YOUR', 'CRIE SUA')}
                <br />
                {t('ACCOUNT', 'CONTA')}
                <span className="text-[#d62a0b]">.</span>
              </h1>
              <p className="mb-8 mt-2 text-sm text-white/48">
                {t('Start managing events like a pro', 'Comece a gerir eventos como um profissional')}
              </p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="mb-4 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.04] text-sm font-medium text-[#ebe7e0] transition-all hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                {t('Continue with Google', 'Continuar com Google')}
              </button>

              <div className="relative mb-4 flex items-center">
                <div className="flex-1 border-t border-white/8" />
                <span className="mx-3 text-[11px] font-mono tracking-widest text-white/30">{t('OR', 'OU')}</span>
                <div className="flex-1 border-t border-white/8" />
              </div>

              <form onSubmit={handleStep1} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">{t('First name', 'Nome')}</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d62a0b]"
                      placeholder="João"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="input-label">{t('Last name', 'Sobrenome')}</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d62a0b]"
                      placeholder="Silva"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">{t('Email', 'Email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d62a0b]"
                    placeholder={t('you@company.com', 'voce@empresa.com')}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">{t('Password', 'Senha')}</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input border-white/10 bg-white/[0.03] pr-10 text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d62a0b]"
                      placeholder="Mín. 8 caracteres"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-[#ae936f]"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {error && (
                  <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d62a0b] text-[#ebe7e0] transition-colors hover:bg-[#e14425]"
                >
                  <span>{t('Continue', 'Continuar')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/45">
                {t('Already have an account?', 'Já tem uma conta?')}{' '}
                <button onClick={onLogin} className="text-[#ae936f] transition-colors hover:text-[#c4a87f]">
                  {t('Sign in', 'Entrar')}
                </button>
              </p>
            </>
          )}

          {/* ── STEP 2: Workspace ── */}
          {step === 2 && (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Building2 className="h-5 w-5 text-[#ae936f]" />
              </div>
              <h1 className="mb-1 font-display text-4xl leading-none tracking-wide text-[#ebe7e0]">
                {t('YOUR', 'SEU')}
                <br />
                {t('WORKSPACE', 'WORKSPACE')}
                <span className="text-[#d62a0b]">.</span>
              </h1>
              <p className="mb-8 mt-2 text-sm text-white/48">
                {t('Name your organization or production company', 'Nomeie sua organização ou produtora')}
              </p>

              <form onSubmit={handleStep2} className="space-y-4">
                <div>
                  <label className="input-label">{t('Organization name', 'Nome da organização')}</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d62a0b]"
                    placeholder={t('My Events Co.', 'Minha Produtora')}
                    required
                    autoFocus
                  />
                  <p className="mt-1.5 text-[11px] text-white/30">
                    {t('Can be your name, brand, or company', 'Pode ser seu nome, marca ou empresa')}
                  </p>
                </div>

                {error && (
                  <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d62a0b] text-[#ebe7e0] transition-colors hover:bg-[#e14425] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t('Create account', 'Criar conta')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: Email confirmation ── */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] mx-auto">
                <Mail className="h-7 w-7 text-[#ae936f]" />
              </div>
              <h1 className="mb-2 font-display text-3xl leading-none tracking-wide text-[#ebe7e0]">
                {t('CHECK YOUR', 'VERIFIQUE SEU')}
                <br />
                {t('EMAIL', 'EMAIL')}
                <span className="text-[#d62a0b]">.</span>
              </h1>
              <p className="mb-2 mt-3 text-sm leading-relaxed text-white/55">
                {t('We sent a confirmation link to', 'Enviamos um link de confirmação para')}
              </p>
              <p className="mb-6 font-mono text-sm text-[#ae936f]">{email}</p>
              <p className="text-xs leading-relaxed text-white/35">
                {t(
                  'Click the link in your email to activate your account. Then sign in to continue.',
                  'Clique no link do email para ativar sua conta. Depois entre para continuar.',
                )}
              </p>
              <button
                onClick={onLogin}
                className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm text-[#ebe7e0] transition-all hover:border-white/20 hover:bg-white/[0.07]"
              >
                {t('Go to sign in', 'Ir para o login')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Visual panel ── */}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-l border-white/8 bg-[#0d0b0a] p-16 lg:flex">
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[#d62a0b]/[0.07] blur-3xl animate-orb-float" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-md">
          {step === 1 && (
            <>
              <div className="mb-8 font-display text-6xl leading-none text-[#ebe7e0] xl:text-7xl">
                {t('THE PLATFORM', 'A PLATAFORMA')}
                <br />
                {t('FOR EVENT', 'DOS')}
                <br />
                <span className="text-[#d62a0b]">{t('LEADERS', 'LÍDERES')}</span>
                <span className="text-[#ebe7e0]">.</span>
              </div>
              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#d62a0b]" />
                    <span className="text-sm leading-relaxed text-white/55">{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-8 font-display text-6xl leading-none text-[#ebe7e0] xl:text-7xl">
                {t('YOUR OWN', 'SEU PRÓPRIO')}
                <br />
                {t('EVENT', 'CENTRO DE')}
                <br />
                <span className="text-[#d62a0b]">{t('HQ', 'COMANDO')}</span>
                <span className="text-[#ebe7e0]">.</span>
              </div>
              <p className="text-sm leading-relaxed text-white/48 max-w-xs">
                {t(
                  'Your workspace centralizes events, team, finances and intelligence under one roof.',
                  'Seu workspace centraliza eventos, equipe, finanças e inteligência em um só lugar.',
                )}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { v: '∞', l: t('Events', 'Eventos') },
                  { v: '∞', l: t('Team members', 'Membros') },
                  { v: '0%', l: t('Platform fee', 'Taxa plataforma') },
                  { v: '24/7', l: t('Support', 'Suporte') },
                ].map((s) => (
                  <div key={s.l} className="rounded-sm border border-white/8 bg-white/[0.03] p-4">
                    <div className="font-display text-2xl leading-none text-[#ae936f]">{s.v}</div>
                    <div className="mt-1 font-mono text-[11px] tracking-wider text-white/42">{s.l}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mb-8 font-display text-6xl leading-none text-[#ebe7e0] xl:text-7xl">
                {t("YOU'RE", 'QUASE')}
                <br />
                {t('ALMOST', 'LÁ')}
                <span className="text-[#d62a0b]">.</span>
              </div>
              <p className="text-sm leading-relaxed text-white/48 max-w-xs mx-auto">
                {t(
                  'One click in your email and your account is live.',
                  'Um clique no seu email e sua conta estará ativa.',
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
