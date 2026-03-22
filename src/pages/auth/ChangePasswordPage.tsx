import { useState } from 'react'
import { Ticket, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

export function ChangePasswordPage() {
  const { updatePassword, profile } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const rules = [
    { label: 'Mínimo 8 caracteres',    ok: password.length >= 8 },
    { label: 'Letra maiúscula',         ok: /[A-Z]/.test(password) },
    { label: 'Número',                  ok: /[0-9]/.test(password) },
    { label: 'Senhas coincidem',        ok: password === confirm && confirm.length > 0 },
  ]
  const valid = rules.every((r) => r.ok)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setError('')
    setLoading(true)
    const result = await updatePassword(password)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-teal flex items-center justify-center">
            <Ticket className="w-5 h-5 text-bg-primary" />
          </div>
          <div className="font-bold text-text-primary text-lg">Animalz Events</div>
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Crie sua nova senha</h1>
              <p className="text-xs text-text-secondary">Olá, {profile?.first_name}! Por segurança, defina uma senha pessoal.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Nova senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirmar senha</label>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {/* Rules */}
            <div className="bg-bg-secondary rounded-xl p-4 space-y-2">
              {rules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${rule.ok ? 'text-status-success' : 'text-bg-border'}`} />
                  <span className={`text-xs transition-colors ${rule.ok ? 'text-text-primary' : 'text-text-muted'}`}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-sm text-status-error bg-status-error/10 border border-status-error/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={!valid || loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
