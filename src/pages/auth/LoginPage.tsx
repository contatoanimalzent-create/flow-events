import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

export function LoginPage({ onBack }: { onBack?: () => void }) {
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.error) setError('Incorrect email or password. Please try again.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <div className="relative w-full max-w-sm">
          {onBack ? (
            <button
              onClick={onBack}
              className="mb-10 flex items-center gap-2 text-xs font-mono tracking-wider text-text-muted transition-colors hover:text-brand-acid"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK
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

          <h1 className="mb-1 font-display text-4xl leading-none tracking-wide text-text-primary">
            WELCOME
            <br />
            BACK<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-2 mb-10 text-sm text-text-muted">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-brand-acid"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary mt-2 flex h-11 w-full items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-text-muted">
            Trouble accessing your account?{' '}
            <button className="text-brand-acid hover:underline">Contact support</button>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-l border-bg-border bg-bg-secondary p-16 lg:flex">
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-acid/6 blur-3xl animate-orb-float" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-6 font-display text-6xl leading-none text-text-primary xl:text-7xl">
            CREATE,
            <br />
            SELL,
            <br />
            <span className="text-brand-acid">OPERATE</span>
            <br />
            AND SCALE
            <br />
            EVENTS<span className="text-brand-acid">.</span>
          </div>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-muted">
            The complete operating platform for event producers who want to grow with clarity, intelligence and control.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[{ v: '500+', l: 'Events' }, { v: '2M+', l: 'Tickets' }, { v: '99.9%', l: 'Uptime' }].map((s) => (
              <div key={s.l} className="rounded-sm border border-bg-border bg-bg-card p-4">
                <div className="font-display text-2xl leading-none text-brand-acid">{s.v}</div>
                <div className="mt-1 font-mono text-[11px] tracking-wider text-text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
