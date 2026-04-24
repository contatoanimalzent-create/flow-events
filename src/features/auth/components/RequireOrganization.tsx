import { type ReactNode, useState } from 'react'
import { ArrowRight, Building2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/services'
import { useAppLocale } from '@/shared/i18n/app-locale'

export function RequireOrganization({ children }: { children: ReactNode }) {
  const { organization, setupOrganization } = useAuthStore()
  const { t } = useAppLocale()
  const [orgName, setOrgName] = useState(() => localStorage.getItem('fe_pending_org') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (organization) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await setupOrganization(orgName)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      {/* Subtle blue radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,87,231,0.14),transparent_32%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(0,87,231,0.3)] bg-[rgba(0,87,231,0.12)]">
          <Building2 className="h-6 w-6 text-[#4285F4]" />
        </div>

        {/* Heading */}
        <h1 className="mb-1 text-4xl font-bold leading-none tracking-[-0.03em] text-white">
          {t('One last', 'Um último')}
          <br />
          {t('step', 'passo')}
          <span className="text-[#0057E7]">.</span>
        </h1>
        <p className="mb-8 mt-3 text-sm text-white/48">
          {t('Name your organization to get started', 'Nomeie sua organização para comecar')}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-white/50">
              {t('Organization name', 'Nome da organização')}
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#0057E7] focus:bg-white/[0.05]"
              placeholder={t('My Events Co.', 'Minha Produtora')}
              required
              autoFocus
            />
            <p className="mt-1.5 text-[11px] text-white/30">
              {t('Can be changed later in Settings', 'Pode ser alterado depois nas Configurações')}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/8 px-4 py-3 text-xs text-[#EF4444]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !orgName.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0057E7] text-white transition-all hover:bg-[#4285F4] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{t('Enter platform', 'Entrar na plataforma')}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
