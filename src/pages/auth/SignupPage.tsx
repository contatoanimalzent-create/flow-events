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
  const colors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 'bg-[#d4ff00]']

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
        <p className={`text-[11px] tracking-wider ${
          score <= 1 ? 'text-red-400' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-[#d4ff00]'
        }`}>
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
    if (orgResult.error) setError(orgResult.error)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    if (orgName) localStorage.setItem('fe_pending_org', orgName)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f0e8]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* ── LEFT: Form ──────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center px-8 py-12 lg:px-10">
          {/* bg grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          {/* purple glow top-left */}
          <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#5c1eb2]/18 blur-3xl" />

          <div className="relative z-10 w-full max-w-[32rem]">
            {/* Back / step back */}
            {((onBack && step === 1) || step === 2) && (
              <button
                onClick={step === 2 ? () => { setStep(1); setError('') } : onBack}
                className="mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/44 transition-colors hover:text-[#d8c39a]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('Back', 'Voltar')}
              </button>
            )}

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Flow Events"
              className="mb-10 h-16 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 16px rgba(212,255,0,0.18))' }}
            />

            {/* Step indicator */}
            {step < 3 && (
              <div className="mb-8 flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                      step === s
                        ? 'bg-[#d4ff00] text-[#050507]'
                        : step > s
                        ? 'bg-[#d4ff00]/20 text-[#d4ff00]'
                        : 'bg-white/8 text-white/30'
                    }`}>
                      {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                    </div>
                    {s < 2 && (
                      <div className={`h-px w-8 transition-all ${step > s ? 'bg-[#d4ff00]/30' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
                <span className="ml-1 text-[10px] uppercase tracking-[0.3em] text-white/35">
                  {step === 1 ? t('Account', 'Conta') : t('Workspace', 'Workspace')}
                </span>
              </div>
            )}

            {/* Card */}
            <div className="rounded-[2.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-7 shadow-[0_32px_120px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">

              {/* ── STEP 1: Account ── */}
              {step === 1 && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                        {t('New account', 'Nova conta')}
                      </div>
                      <div className="mt-3 font-display text-[2.2rem] uppercase leading-[0.92] tracking-[-0.04em] text-[#fff8ef]">
                        {t('Create', 'Criar')}
                        <br />
                        {t('account', 'conta')}
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/8 text-[#d4ff00]">
                      <Zap className="h-5 w-5" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.04] text-sm font-medium text-[#ebe7e0] transition-all hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    {t('Continue with Google', 'Continuar com Google')}
                  </button>

                  <div className="relative my-5 flex items-center">
                    <div className="flex-1 border-t border-white/8" />
                    <span className="mx-3 text-[11px] uppercase tracking-[0.22em] text-white/28">{t('or', 'ou')}</span>
                    <div className="flex-1 border-t border-white/8" />
                  </div>

                  <form onSubmit={handleStep1} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="input-label">{t('First name', 'Nome')}</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d4ff00]"
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
                          className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d4ff00]"
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
                        className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d4ff00]"
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
                          className="input border-white/10 bg-white/[0.03] pr-10 text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d4ff00]"
                          placeholder="Mín. 8 caracteres"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-[#d8c39a]"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d4ff00] font-semibold text-[#050507] transition-all hover:bg-[#c8f200] hover:shadow-[0_0_28px_rgba(212,255,0,0.28)]"
                    >
                      <span>{t('Continue', 'Continuar')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-6 text-center text-xs text-white/40">
                    {t('Already have an account?', 'Já tem uma conta?')}{' '}
                    <button onClick={onLogin} className="text-[#d8c39a] transition-colors hover:text-[#e8d4b0]">
                      {t('Sign in', 'Entrar')}
                    </button>
                  </p>
                </>
              )}

              {/* ── STEP 2: Workspace ── */}
              {step === 2 && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                        {t('Your workspace', 'Seu workspace')}
                      </div>
                      <div className="mt-3 font-display text-[2.2rem] uppercase leading-[0.92] tracking-[-0.04em] text-[#fff8ef]">
                        {t('Name your', 'Nomeie sua')}
                        <br />
                        {t('organization', 'organização')}
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8c39a]/20 bg-[#5c1eb2]/14 text-[#e7d7ff]">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>

                  <form onSubmit={handleStep2} className="mt-8 space-y-4">
                    <div>
                      <label className="input-label">{t('Organization name', 'Nome da organização')}</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="input border-white/10 bg-white/[0.03] text-[#ebe7e0] placeholder:text-white/30 focus:border-[#d4ff00]"
                        placeholder={t('My Events Co.', 'Minha Produtora')}
                        required
                        autoFocus
                      />
                      <p className="mt-1.5 text-[11px] text-white/30">
                        {t('Can be your name, brand or company', 'Pode ser seu nome, marca ou empresa')}
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d4ff00] font-semibold text-[#050507] transition-all hover:bg-[#c8f200] hover:shadow-[0_0_28px_rgba(212,255,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#050507]" />
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
                <div className="py-4 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4ff00]/20 bg-[#d4ff00]/8">
                    <Mail className="h-7 w-7 text-[#d4ff00]" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    {t('Almost there', 'Quase lá')}
                  </div>
                  <div className="mt-3 font-display text-[2rem] uppercase leading-[0.92] tracking-[-0.04em] text-[#fff8ef]">
                    {t('Check your', 'Verifique seu')}
                    <br />
                    {t('email', 'email')}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/50">
                    {t('We sent a confirmation link to', 'Enviamos um link de confirmação para')}
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#d8c39a]">{email}</p>
                  <p className="mt-4 text-xs leading-relaxed text-white/32">
                    {t(
                      'Click the link to activate your account, then sign in to continue.',
                      'Clique no link para ativar sua conta e depois entre para continuar.',
                    )}
                  </p>
                  <button
                    onClick={onLogin}
                    className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm text-[#ebe7e0] transition-all hover:border-[#d4ff00]/30 hover:bg-white/[0.07]"
                  >
                    {t('Go to sign in', 'Ir para o login')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Editorial panel ──────────────────────────────────── */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-l border-white/8 px-10 py-12 lg:flex">
          {/* background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_top_left,rgba(92,30,178,0.22),transparent_32%),linear-gradient(180deg,#06070a_0%,#090b10_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />

          {/* top spacer */}
          <div />

          {/* editorial copy */}
          <div className="relative z-10">
            {step === 1 && (
              <>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#d8c39a]">
                  {t('The platform for', 'A plataforma dos')}
                </div>
                <h2 className="mt-4 font-display text-[clamp(3.4rem,5.5vw,5.6rem)] uppercase leading-[0.88] tracking-[-0.05em] text-[#fff8ef]">
                  {t('Event', 'Líderes')}
                  <br />
                  <span className="text-[#d4ff00]">{t('Leaders', 'de Evento')}</span>
                </h2>
                <div className="mt-8 space-y-3">
                  {FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4ff00]/12">
                        <Zap className="h-3 w-3 text-[#d4ff00]" />
                      </div>
                      <span className="text-sm leading-relaxed text-white/55">{f}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#d8c39a]">
                  {t('Your own', 'Seu próprio')}
                </div>
                <h2 className="mt-4 font-display text-[clamp(3.4rem,5.5vw,5.6rem)] uppercase leading-[0.88] tracking-[-0.05em] text-[#fff8ef]">
                  {t('Event', 'Centro de')}
                  <br />
                  <span className="text-[#d4ff00]">{t('HQ', 'Comando')}</span>
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-8 text-white/50">
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
                    <div key={s.l} className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                      <div className="font-display text-[1.7rem] uppercase leading-none tracking-[-0.04em] text-[#d4ff00]">
                        {s.v}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/42">{s.l}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#d8c39a]">
                  {t('One click away', 'Um clique de distância')}
                </div>
                <h2 className="mt-4 font-display text-[clamp(3.4rem,5.5vw,5.6rem)] uppercase leading-[0.88] tracking-[-0.05em] text-[#fff8ef]">
                  {t("You're", 'Quase')}
                  <br />
                  <span className="text-[#d4ff00]">{t('Almost In', 'Chegando')}</span>
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-8 text-white/50">
                  {t(
                    'One click in your email and your account is live. Welcome to your event command center.',
                    'Um clique no seu email e sua conta estará ativa. Bem-vindo ao seu centro de comando.',
                  )}
                </p>
              </>
            )}
          </div>

          {/* bottom stats */}
          <div className="relative z-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: 'Live', label: t('Operations', 'Operações') },
              { value: 'QR', label: t('Access control', 'Controle de acesso') },
              { value: '0%', label: t('Platform fee', 'Taxa plataforma') },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="font-display text-[1.7rem] uppercase leading-none tracking-[-0.04em] text-[#fff8ef]">
                  {item.value}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/42">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
