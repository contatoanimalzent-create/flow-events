import { useEffect, useMemo, useState } from 'react'
import { Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { PublicLayout } from '@/features/public'
import { useAccountOverview } from '@/features/account/hooks'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { UserEventDetail } from './UserEventDetail'
import { UserEventsSection } from './UserEventsSection'
import { UserHeader } from './UserHeader'

export function AccountPage() {
  const signOut = useAuthStore((state) => state.signOut)
  const overviewQuery = useAccountOverview()
  const overview = overviewQuery.data
  const { t } = useAppLocale()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const allEvents = useMemo(
    () => [...(overview?.upcomingEvents ?? []), ...(overview?.pastEvents ?? [])],
    [overview?.pastEvents, overview?.upcomingEvents],
  )

  useEffect(() => {
    if (!allEvents.length) {
      setSelectedEventId(null)
      return
    }

    setSelectedEventId((current) => (current && allEvents.some((event) => event.id === current) ? current : allEvents[0].id))
  }, [allEvents])

  const selectedEvent = allEvents.find((event) => event.id === selectedEventId) ?? allEvents[0] ?? null

  return (
    <PublicLayout showFooter={false} compactHeader>
      <div className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow={t('Account', 'Conta')}
            title={t('Your events, your tickets, your access.', 'Seus eventos, seus ingressos, seu acesso.')}
            description={t(
              'An authenticated área built for post-purchase: simple to open, clear to use and ready to carry you all the way to entry.',
              'Uma área autenticada pensada para o pós-compra: simples para abrir, clara para usar e pronta para acompanhar você até a entrada.',
            )}
          />

          {overviewQuery.isPending ? (
            <LoadingState
              title={t('Loading your account', 'Carregando sua conta')}
              description={t(
                'We are gathering your purchased events, digital tickets and recent history.',
                'Estamos reunindo seus eventos comprados, ingressos digitais e histórico recente.',
              )}
              className="min-h-[20rem]"
            />
          ) : overviewQuery.isError ? (
            <ErrorState
              title={t('Unable to open your account right now', 'Não foi possível abrir sua conta agora')}
              description={t(
                'Try again in a moment. Your tickets remain safe inside the platform.',
                'Tente novamente em instantes. Seus ingressos continuam seguros na plataforma.',
              )}
            />
          ) : !overview ? (
            <EmptyState
              title={t('Your account does not have any access loaded yet', 'Sua conta ainda não tem acessos carregados')}
              description={t(
                'As soon as a confirmed order is linked to your email, it appears here automatically.',
                'Assim que um pedido confirmado estiver associado ao seu email, ele aparece aqui automaticamente.',
              )}
            />
          ) : (
            <>
              <UserHeader overview={overview} onSignOut={signOut} />

              {overview.stats.totalEvents === 0 ? (
                <EmptyState
                  title={t('No events linked to your profile', 'Nenhum evento associado ao seu perfil')}
                  description={t(
                    'Once you complete a purchase or registration, your tickets and instructions will appear here.',
                    'Quando você concluir uma compra ou inscrição, seus ingressos e instruções passam a aparecer aqui.',
                  )}
                  action={
                    <a
                      href="/events"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
                    >
                      <Ticket className="h-4 w-4" />
                      {t('Explore events', 'Explorar eventos')}
                    </a>
                  }
                />
              ) : (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
                  <div className="space-y-8">
                    <UserEventsSection
                      title={t('Upcoming events', 'Próximos eventos')}
                      description={t(
                        'Active access and experiences already on your agenda.',
                        'Acessos ativos e experiências que já fazem parte da sua agenda.',
                      )}
                      events={overview.upcomingEvents}
                      activeEventId={selectedEventId}
                      onSelect={setSelectedEventId}
                      emptyTitle={t('No upcoming events right now', 'Nenhum evento futuro no momento')}
                      emptyDescription={t(
                        'When a new experience is confirmed, it will appear here with quick ticket access.',
                        'Quando uma nova experiência estiver confirmada, ela aparece aqui com acesso rápido ao ticket.',
                      )}
                    />

                    <UserEventsSection
                      title={t('Past events', 'Eventos passados')}
                      description={t(
                        'Recent history so you can revisit used tickets and previous experiences.',
                        'Histórico recente para você reencontrar ingressos usados e experiências anteriores.',
                      )}
                      events={overview.pastEvents}
                      activeEventId={selectedEventId}
                      onSelect={setSelectedEventId}
                      emptyTitle={t('Your history is still empty', 'Seu histórico ainda está vazio')}
                      emptyDescription={t(
                        'After your first event, this space becomes your memory of experiences already lived.',
                        'Depois do primeiro evento, este espaco vira sua memoria de experiências já vividas.',
                      )}
                    />
                  </div>

                  <div className="xl:sticky xl:top-28 xl:self-start">
                    <UserEventDetail event={selectedEvent} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
