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
          description="Connect referrals, sharing, social proof and remarketing from the authenticated organization."
        />
        <ErrorState
          title="Organization not found"
          description="Sign in with a profile linked to an organization to open the growth cockpit."
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
          description="We are consolidating referrals, organic signals, sharing and social proof into a single layer."
        />
        <LoadingState
          title="Building the acquisition cockpit"
          description="Bringing in links, leads, conversions and recent signals for the new visual foundation."
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
          description="The growth layer depends on links, leads and conversions connected to the product."
        />
        <ErrorState
          title="Unable to load growth"
          description="Review the growth migration or try again in a moment to recover the cockpit."
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Growth"
        title="Acquisition, referral and retention in one flow."
        description="This page now surfaces referrals, leads captured by the public layer, internal remarketing signals and the real conversion trail coming from checkout."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4c6b3] bg-white/92 px-4 py-2 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
            >
              View creator landing
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-4 py-2 text-sm font-medium text-[#f7f2e8] transition-all hover:-translate-y-0.5"
            >
              Open public layer
              <Zap className="h-4 w-4" />
            </a>
          </div>
        }
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-white/92 p-8 shadow-[0_20px_60px_rgba(68,49,24,0.06)]">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">Growth architecture</div>
          <div className="mt-4 font-display text-[clamp(2.5rem,3.5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
            Viral loops that begin in media, pass through checkout and return to CRM and campaigns.
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#665948]">
            Every share can become an attributed link, every exit can capture a lead, and every conversion can feed internal notifications and future automations.
          </p>
        </div>

        <div className="rounded-[2.4rem] border border-[#e4d7c6] bg-[#1f1a15] p-8 text-white shadow-[0_20px_60px_rgba(68,49,24,0.12)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] uppercase tracking-[0.26em] text-white/64">
            <Sparkles className="h-4 w-4" />
            Live status
          </div>
          <div className="mt-5 font-display text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.04em] text-white">
            Sharing, referrals and remarketing now appear as product features, not as a parallel layer.
          </div>
          <div className="mt-6 space-y-3 text-sm leading-7 text-white/72">
            <p>Shareable links carry referral attribution when an authenticated user generates an invite.</p>
            <p>Leads captured by the public layer feed this cockpit and can trigger existing notifications and campaigns.</p>
            <p>Checkout conversions return to operations as attributable proof of growth.</p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ReferralDashboard overview={growthOverviewQuery.data} />
      </div>
    </div>
  )
}
