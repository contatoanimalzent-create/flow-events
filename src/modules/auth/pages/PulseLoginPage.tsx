import React, { useState } from 'react'
import { Zap, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function PulseLoginPage({ onNavigate }: PulsePageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    // Store marker for PulseApp routing guard
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      ;(window as any).__pulseAuthUser = user.id
    }

    onNavigate('/pulse/select-organization')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#060d1f]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Logo area */}
      <div className="flex flex-col items-center pt-20 pb-10">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
          <Zap size={32} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pulse</h1>
        <p className="text-slate-400 text-sm mt-1">Sua plataforma de eventos</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="px-6 space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            E-mail
          </label>
          <div className="flex items-center bg-white/6 border border-white/10 rounded-xl px-4 gap-3 focus-within:border-blue-500/50">
            <Mail size={16} className="text-slate-500 shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 bg-transparent py-4 text-white placeholder:text-slate-600 outline-none text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Senha
          </label>
          <div className="flex items-center bg-white/6 border border-white/10 rounded-xl px-4 gap-3 focus-within:border-blue-500/50">
            <Lock size={16} className="text-slate-500 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-transparent py-4 text-white placeholder:text-slate-600 outline-none text-sm"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 p-1"
            >
              {showPassword
                ? <EyeOff size={16} className="text-slate-500" />
                : <Eye size={16} className="text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-sm transition-opacity disabled:opacity-50 active:opacity-80 mt-2"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Forgot password */}
        <button
          type="button"
          onClick={() => onNavigate('/pulse/auth/recover')}
          className="w-full text-center text-sm text-slate-400 py-2"
        >
          Esqueci minha senha
        </button>
      </form>

      {/* Bottom brand */}
      <div className="mt-auto pb-10 flex justify-center">
        <p className="text-[11px] text-slate-600">
          Pulse by Flow Events
        </p>
      </div>
    </div>
  )
}
