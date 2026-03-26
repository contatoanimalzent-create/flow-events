import { ArrowUpRight, Sparkles, Zap } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { ReferralDashboard, useGrowthOverview } from '@/features/growth'
import { ErrorState, LoadingState, PageHeader } from '@/shared/components'

export function GrowthPage() {
  const organization = useAuthStore((state) => state.organization)
  const growthOverviewQuery = useGrowthOverview(organization?.id)

  if (!organization) {
    return (
      <div className="admin-page">
        <PageHeader
          eyebrow="Growth"
          title="Growth loops"
          description="Conecte referrals, compartilhamento, prova social e remarketing a partir da organizacao autenticada."
        />
        <ErrorState
          title="Organizacao nao encontrada"
          description="Faça login com um perfil vinculado a uma organizacao para abrir o cockpit de crescimento."
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
          title="Growth loops"
          description="Estamos consolidando referrals, sinais organicos, compartilhamento e prova social em uma camada unica."
        />
        <LoadingState
          title="Montando o cockpit de aquisicao"
          description="Trazendo links, leads, conversoes e sinais recentes para a nova fundacao visual."
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
          title="Growth loops"
          description="A camada de crescimento depende de links, leads e conversoes conectadas ao produto."
        />
        <ErrorState
          title="Nao foi possivel carregar growth"
          description="Revise a migration de growth ou tente novamente em instantes para recuperar o cockpit."
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Growth"
        title="Aquisição, indicação e retenção no mesmo fluxo."
        description="A pagina agora mostra referrals, leads salvos pela camada publica, sinais de remarketing interno e o rastro real de conversao vindo do checkout."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4c6b3] bg-white/92 px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
            >
              Ver landing de criacao
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-4 py-2 text-sm font-medium text-[#f7f2e8] transition-all hover:-translate-y-0.5"
            >
              Abrir camada publica
              <Zap className="h-4 w-4" />
            </a>
          </div>
        }
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-white/92 p-8 shadow-[0_20px_60px_rgba(68,49,24,0.06)]">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">Growth architecture</div>
          <div className="mt-4 font-display text-[clamp(2.5rem,3.5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
            Loops virais que nascem na mídia, atravessam o checkout e voltam para CRM e campaigns.
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#665948]">
            Cada compartilhamento agora pode virar link atribuído, cada saída pode capturar lead e cada conversão pode alimentar notificações internas e automações futuras.
          </p>
        </div>

        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-[#1f1a15] p-8 text-white shadow-[0_20px_60px_rgba(68,49,24,0.12)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] uppercase tracking-[0.26em] text-white/64">
            <Sparkles className="h-4 w-4" />
            Live status
          </div>
          <div className="mt-5 font-display text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.04em] text-white">
            Compartilhamento, referral e remarketing ja aparecem como produto, nao como camada paralela.
          </div>
          <div className="mt-6 space-y-3 text-sm leading-7 text-white/72">
            <p>Links compartilhaveis carregam codigo de indicacao quando o usuario autenticado gera o convite.</p>
            <p>Leads da camada publica alimentam este cockpit e podem acionar notificacoes e campaigns existentes.</p>
            <p>Conversoes do checkout voltam para a operacao como prova de crescimento atribuivel.</p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ReferralDashboard overview={growthOverviewQuery.data} />
      </div>
    </div>
  )
}
