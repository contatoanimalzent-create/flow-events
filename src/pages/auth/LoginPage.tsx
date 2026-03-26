import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

export function LoginPage({ onBack }: { onBack?: () => void }) {
  const { signIn } = useAuthStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.error) setError('E-mail ou senha incorretos. Tente novamente.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">

      {/* Left: form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative w-full max-w-sm">
          {/* Back button */}
          {onBack && (
            <button onClick={onBack}
              className="flex items-center gap-2 text-text-muted hover:text-brand-acid transition-colors text-xs font-mono tracking-wider mb-10">
              <ArrowLeft className="w-3.5 h-3.5" /> VOLTAR
            </button>
          )}

          {/* Logo */}
          <div className="mb-12">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className="h-14 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 8px rgba(196,154,80,0.2))' }}
            />
          </div>

          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none mb-1">
            BEM-VINDO<br />DE VOLTA<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-sm text-text-muted mb-10 mt-2">Entre na sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="seu@email.com" required autoFocus />
            </div>
            <div>
              <label className="input-label">Senha</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-acid transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 h-11 mt-2">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Entrar</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-8">
            Problemas para acessar?{' '}
            <button className="text-brand-acid hover:underline">Fale com o suporte</button>
          </p>
        </div>
      </div>

      {/* Right: hero */}
      <div className="hidden lg:flex flex-1 bg-bg-secondary border-l border-bg-border flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-acid/6 rounded-full blur-3xl animate-orb-float pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="font-display text-6xl xl:text-7xl text-text-primary leading-none mb-6">
            CREATE,<br />SELL,<br />
            <span className="text-brand-acid">OPERATE</span><br />
            AND SCALE<br />EVENTS<span className="text-brand-acid">.</span>
          </div>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">
            A plataforma operacional completa para produtores de eventos que querem crescer com inteligência.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-10">
            {[{ v: '500+', l: 'Eventos' }, { v: '2M+', l: 'Ingressos' }, { v: '99.9%', l: 'Uptime' }].map(s => (
              <div key={s.l} className="bg-bg-card border border-bg-border rounded-sm p-4">
                <div className="font-display text-2xl text-brand-acid leading-none">{s.v}</div>
                <div className="text-[11px] text-text-muted font-mono tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
