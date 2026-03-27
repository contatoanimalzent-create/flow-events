import { ArrowUpRight, Sparkles, Zap } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { ReferralDashboard, useGrowthOverview } from '@/features/growth'
import { ErrorState, LoadingState, PageHeader } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'

export function GrowthPage() {
  const organization = useAuthStore((state) => state.organization)
  const growthOverviewQuery = useGrowthOverview(organization?.id)
  const { t } = useAppLocale()

  if (!organization) {
    return (
      <div className="admin-page">
        <PageHeader
          eyebrow="Growth"
          title={t('Growth loops', 'Loops de crescimento')}
          description={t(
            'Connect referrals, sharing, social proof and remarketing from the authenticated organization.',
            'Conecte referrals, compartilhamento, prova social e remarketing a partir da organizacao autenticada.',
          )}
        />
        <ErrorState
          title={t('Organization not found', 'Organizacao nao encontrada')}
          description={t(
            'Sign in with a profile linked to an organization to open the growth cockpit.',
            'Entre com um perfil vinculado a uma organizacao para abrir o cockpit de crescimento.',
          )}
          className="mt-8"
        />
      </div>
    )
  }

  if (growthOverviewQuery.isPending) {
    return (
      <div className="admin-page">
        <PageHeader
          eyebrow="Growth"
          title={t('Growth loops', 'Loops de crescimento')}
          description={t(
            'We are consolidating referrals, organic signals, sharing and social proof into a single layer.',
            'Estamos consolidando referrals, sinais organicos, compartilhamento e prova social em uma unica camada.',
          )}
        />
        <LoadingState
          title={t('Building the acquisition cockpit', 'Montando o cockpit de aquisicao')}
          description={t(
            'Bringing in links, leads, conversions and recent signals for the new visual foundation.',
            'Trazendo links, leads, conversoes e sinais recentes para a nova fundacao visual.',
          )}
          className="mt-8"
        />
      </div>
    )
  }

  if (growthOverviewQuery.isError || !growthOverviewQuery.data) {
    return (
      <div className="admin-page">
        <PageHeader
          eyebrow="Growth"
          title={t('Growth loops', 'Loops de crescimento')}
          description={t(
            'The growth layer depends on links, leads and conversions connected to the product.',
            'A camada de crescimento depende de links, leads e conversoes conectadas ao produto.',
          )}
        />
        <ErrorState
          title={t('Unable to load growth', 'Nao foi possivel carregar crescimento')}
          description={t(
            'Review the growth migration or try again in a moment to recover the cockpit.',
            'Revise a migration de growth ou tente novamente em instantes para recuperar o cockpit.',
          )}
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Growth"
        title={t('Acquisition, referral and retention in one flow.', 'Aquisicao, referral e retencao em um unico fluxo.')}
        description={t(
          'This page now surfaces referrals, leads captured by the public layer, internal remarketing signals and the real conversion trail coming from checkout.',
          'Esta pagina agora mostra referrals, leads capturados pela camada publica, sinais internos de remarketing e a trilha real de conversao vinda do checkout.',
        )}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4c6b3] bg-white/92 px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
            >
              {t('View creator landing', 'Ver landing de criador')}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-4 py-2 text-sm font-medium text-[#f7f2e8] transition-all hover:-translate-y-0.5"
            >
              {t('Open public layer', 'Abrir camada publica')}
              <Zap className="h-4 w-4" />
            </a>
          </div>
        }
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-white/92 p-8 shadow-[0_20px_60px_rgba(68,49,24,0.06)]">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">{t('Growth architecture', 'Arquitetura de crescimento')}</div>
          <div className="mt-4 font-display text-[clamp(2.5rem,3.5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
            {t(
              'Viral loops that begin in media, pass through checkout and return to CRM and campaigns.',
              'Loops virais que comecam na midia, passam pelo checkout e retornam para CRM e campanhas.',
            )}
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#665948]">
            {t(
              'Every share can become an attributed link, every exit can capture a lead, and every conversion can feed internal notifications and future automations.',
              'Cada compartilhamento pode virar um link atribuido, cada saida pode capturar um lead e cada conversao pode alimentar notificacoes internas e automacoes futuras.',
            )}
          </p>
        </div>

        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-[#1f1a15] p-8 text-white shadow-[0_20px_60px_rgba(68,49,24,0.12)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] uppercase tracking-[0.26em] text-white/64">
            <Sparkles className="h-4 w-4" />
            {t('Live status', 'Status ao vivo')}
          </div>
          <div className="mt-5 font-display text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.04em] text-white">
            {t(
              'Sharing, referrals and remarketing now appear as product features, not as a parallel layer.',
              'Compartilhamento, referrals e remarketing agora aparecem como recursos de produto, nao como camada paralela.',
            )}
          </div>
          <div className="mt-6 space-y-3 text-sm leading-7 text-white/72">
            <p>{t('Shareable links carry referral attribution when an authenticated user generates an invite.', 'Links compartilhaveis levam atribuicao de referral quando um usuario autenticado gera um convite.')}</p>
            <p>{t('Leads captured by the public layer feed this cockpit and can trigger existing notifications and campaigns.', 'Leads capturados pela camada publica alimentam este cockpit e podem disparar notificacoes e campanhas existentes.')}</p>
            <p>{t('Checkout conversions return to operations as attributable proof of growth.', 'Conversoes do checkout retornam para a operacao como prova atribuivel de crescimento.')}</p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ReferralDashboard overview={growthOverviewQuery.data} />
      </div>
    </div>
  )
}
