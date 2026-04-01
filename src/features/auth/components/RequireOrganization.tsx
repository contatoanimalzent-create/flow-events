import { type ReactNode, useState } from 'react'
import { ArrowRight, Building2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
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
    <div className="min-h-screen bg-[#070607] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-[#d62a0b]/[0.07] blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Building2 className="h-6 w-6 text-[#ae936f]" />
        </div>

        <h1 className="mb-1 font-display text-4xl leading-none tracking-wide text-[#ebe7e0]">
          {t('ONE LAST', 'UM ÚLTIMO')}
          <br />
          {t('STEP', 'PASSO')}
          <span className="text-[#d62a0b]">.</span>
        </h1>
        <p className="mb-8 mt-2 text-sm text-white/48">
          {t('Name your organization to get started', 'Nomeie sua organização para começar')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {t('Can be changed later in Settings', 'Pode ser alterado depois nas Configurações')}
            </p>
          </div>

          {error && (
            <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-4 py-3 text-xs text-status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !orgName.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d62a0b] text-[#ebe7e0] transition-colors hover:bg-[#e14425] disabled:cursor-not-allowed disabled:opacity-60"
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
