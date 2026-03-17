import { useState } from 'react'
import { Ticket, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

export function LoginPage() {
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-teal flex items-center justify-center">
              <Ticket className="w-5 h-5 text-bg-primary" />
            </div>
            <div>
              <div className="font-bold text-text-primary text-lg leading-tight">Flow Events</div>
              <div className="text-xs text-text-muted">Plataforma operacional de eventos</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-text-secondary mb-8">Entre na sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-status-error bg-status-error/10 border border-status-error/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-8">
            Problemas para acessar?{' '}
            <button className="text-brand-teal hover:underline">Fale com o suporte</button>
          </p>
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden lg:flex flex-1 bg-bg-secondary border-l border-bg-border flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="text-5xl font-bold text-text-primary mb-4 leading-tight">
            Create, sell,<br />
            <span className="gradient-text">operate</span> and scale<br />
            events beautifully.
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            A plataforma operacional completa para produtores de eventos que querem crescer com inteligência.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '500+', label: 'Eventos' },
              { value: '2M+',  label: 'Ingressos' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} className="bg-bg-card border border-bg-border rounded-xl p-4">
                <div className="text-lg font-bold text-brand-teal">{s.value}</div>
                <div className="text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
