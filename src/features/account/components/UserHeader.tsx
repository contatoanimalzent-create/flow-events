import { ArrowRight, LogOut, Mail, Sparkles, Ticket } from 'lucide-react'
import type { AccountOverview } from '@/features/account/types'
import { PremiumButton, PremiumCard } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { formatCurrency } from '@/shared/lib'

interface UserHeaderProps {
  overview: AccountOverview
  onSignOut: () => Promise<void>
}

export function UserHeader({ overview, onSignOut }: UserHeaderProps) {
  const { t } = useAppLocale()

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <PremiumCard className="rounded-[2.2rem] border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,241,232,0.84))] p-7 md:p-8">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">{t('My account', 'Minha conta')}</div>
        <div className="mt-4 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#1f1a15]">
          {overview.user.name}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#5f5549]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadcc6] bg-white/80 px-4 py-2">
            <Mail className="h-4 w-4 text-[#7b6440]" />
            {overview.user.email}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadcc6] bg-[#faf4e8] px-4 py-2 text-[#7b6440]">
            <Sparkles className="h-4 w-4" />
            {overview.user.statusLabel}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-base leading-7 text-[#5f5549]">
          {t(
            'Your access, your events and your relationship with the platform gathered in a simple visual experience that is ready for event day.',
            'Seus acessos, seus eventos e o relacionamento com a plataforma reunidos em uma experiencia simples, visual e pronta para o dia do evento.',
          )}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5"
          >
            {t('Explore events', 'Explorar eventos')}
            <ArrowRight className="h-4 w-4" />
          </a>
          <PremiumButton variant="ghost" onClick={() => void onSignOut()} className="rounded-full px-5 py-3">
            <LogOut className="h-4 w-4" />
            {t('Sign out', 'Sair')}
          </PremiumButton>
        </div>
      </PremiumCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <PremiumCard className="rounded-[1.8rem] p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">{t('Events', 'Eventos')}</div>
          <div className="mt-3 font-display text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
            {overview.stats.totalEvents}
          </div>
          <div className="mt-2 text-sm text-[#5f5549]">
            {overview.stats.upcomingEvents} {t('upcoming on your agenda', 'futuros na sua agenda')}
          </div>
        </PremiumCard>

        <PremiumCard className="rounded-[1.8rem] p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">{t('Active tickets', 'Ingressos ativos')}</div>
          <div className="mt-3 flex items-center gap-3">
            <Ticket className="h-5 w-5 text-[#7b6440]" />
            <div className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
              {overview.stats.activeTickets}
            </div>
          </div>
          <div className="mt-2 text-sm text-[#5f5549]">
            {overview.stats.usedTickets} {t('already used', 'ja utilizados')} · {formatCurrency(overview.stats.totalSpent)} {t('in purchases', 'em compras')}
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}
