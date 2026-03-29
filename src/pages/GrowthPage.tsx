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
          eyebrow={t('Growth', 'Crescimento')}
          title={t('Growth loops', 'Ciclos de crescimento')}
          description={t(
            'Connect referrals, sharing, social proof and remarketing from the authenticated organization.',
            'Conecte indicacoes, compartilhamento, prova social e reativacao a partir da organizacao autenticada.',
          )}
        />
        <ErrorState
          title={t('Organization not found', 'Organizacao nao encontrada')}
          description={t(
            'Sign in with a profile linked to an organization to open the growth cockpit.',
            'Entre com um perfil vinculado a uma organizacao para abrir o painel de crescimento.',
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
          eyebrow={t('Growth', 'Crescimento')}
          title={t('Growth loops', 'Ciclos de crescimento')}
          description={t(
            'We are consolidating referrals, organic signals, sharing and social proof into a single layer.',
            'Estamos consolidando indicacoes, sinais organicos, compartilhamento e prova social em uma unica camada.',
          )}
        />
        <LoadingState
          title={t('Building the acquisition cockpit', 'Montando o painel de aquisicao')}
          description={t(
            'Bringing in links, leads, conversions and recent signals for the new visual foundation.',
            'Trazendo links, contatos, conversoes e sinais recentes para a nova fundacao visual.',
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
          eyebrow={t('Growth', 'Crescimento')}
          title={t('Growth loops', 'Ciclos de crescimento')}
          description={t(
            'The growth layer depends on links, leads and conversions connected to the product.',
            'A camada de crescimento depende de links, contatos e conversoes conectadas ao produto.',
          )}
        />
        <ErrorState
          title={t('Unable to load growth', 'Nao foi possivel carregar crescimento')}
          description={t(
            'Review the growth migration or try again in a moment to recover the cockpit.',
            'Revise a migracao de crescimento ou tente novamente em instantes para recuperar o painel.',
          )}
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={t('Growth', 'Crescimento')}
        title={t('Acquisition, referral and retention in one flow.', 'Aquisicao, indicacao e retencao em um unico fluxo.')}
        description={t(
          'This page now surfaces referrals, leads captured by the public layer, internal remarketing signals and the real conversion trail coming from checkout.',
          'Esta pagina agora mostra indicacoes, contatos capturados pela camada publica, sinais internos de reativacao e a trilha real de conversao vinda da compra.',
        )}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4c6b3] bg-white/92 px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
            >
              {t('View creator landing', 'Ver pagina para criadores')}
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

      <section className="novare-stage">
        <div className="novare-stage-panel">
          <div className="novare-stage-label">{t('Growth architecture', 'Arquitetura de crescimento')}</div>
          <div className="novare-stage-title">
            {t(
              'Viral loops that begin in media, pass through checkout and return to CRM and campaigns.',
              'Ciclos virais que comecam na midia, passam pela compra e retornam para relacionamento e campanhas.',
            )}
          </div>
          <p className="novare-stage-copy">
            {t(
              'Every share can become an attributed link, every exit can capture a lead, and every conversion can feed internal notifications and future automations.',
              'Cada compartilhamento pode virar um link atribuido, cada saida pode capturar um contato e cada conversao pode alimentar notificacoes internas e automacoes futuras.',
            )}
          </p>
        </div>

        <div className="novare-stage-panel-dark">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-[#ae936f]">
            <Sparkles className="h-4 w-4" />
            {t('Live status', 'Status ao vivo')}
          </div>
          <div className="novare-stage-title">
            {t(
              'Sharing, referrals and remarketing now appear as product features, not as a parallel layer.',
              'Compartilhamento, indicacoes e reativacao agora aparecem como recursos de produto, nao como camada paralela.',
            )}
          </div>
          <div className="novare-stage-copy">
            <p>{t('Shareable links carry referral attribution when an authenticated user generates an invite.', 'Links compartilhaveis levam atribuicao de indicacao quando um usuario autenticado gera um convite.')}</p>
            <p className="mt-3">{t('Leads captured by the public layer feed this cockpit and can trigger existing notifications and campaigns.', 'Contatos capturados pela camada publica alimentam este painel e podem disparar notificacoes e campanhas existentes.')}</p>
            <p className="mt-3">{t('Checkout conversions return to operations as attributable proof of growth.', 'Conversoes da compra retornam para a operacao como prova atribuivel de crescimento.')}</p>
          </div>
        </div>
      </section>

      <section className="novare-stage-stack">
        {growthOverviewQuery.data.metrics.slice(0, 3).map((metric) => (
          <article key={metric.label} className="novare-stage-metric">
            <div className="novare-stage-label">{metric.label}</div>
            <div className="novare-stage-metric-value">{metric.value}</div>
            <div className="novare-stage-metric-copy">{metric.note}</div>
          </article>
        ))}
      </section>

      <div className="mt-8">
        <ReferralDashboard overview={growthOverviewQuery.data} />
      </div>
    </div>
  )
}
