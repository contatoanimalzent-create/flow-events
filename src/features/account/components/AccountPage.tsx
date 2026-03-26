import { useEffect, useMemo, useState } from 'react'
import { Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { PublicLayout } from '@/features/public'
import { useAccountOverview } from '@/features/account/hooks'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/shared/components'
import { UserEventDetail } from './UserEventDetail'
import { UserEventsSection } from './UserEventsSection'
import { UserHeader } from './UserHeader'

export function AccountPage() {
  const signOut = useAuthStore((state) => state.signOut)
  const overviewQuery = useAccountOverview()
  const overview = overviewQuery.data
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

    setSelectedEventId((current) =>
      current && allEvents.some((event) => event.id === current) ? current : allEvents[0].id,
    )
  }, [allEvents])

  const selectedEvent = allEvents.find((event) => event.id === selectedEventId) ?? allEvents[0] ?? null

  return (
    <PublicLayout showFooter={false} compactHeader>
      <div className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="Account"
            title="Seus eventos, seus tickets, seu acesso."
            description="Uma area autenticada pensada para o pos-compra: simples para abrir, clara para usar e pronta para acompanhar voce ate a entrada."
          />

          {overviewQuery.isPending ? (
            <LoadingState
              title="Carregando sua conta"
              description="Estamos reunindo seus eventos comprados, tickets digitais e historico recente."
              className="min-h-[20rem]"
            />
          ) : overviewQuery.isError ? (
            <ErrorState
              title="Nao foi possivel abrir sua conta agora"
              description="Tente novamente em instantes. Seus ingressos continuam seguros na plataforma."
            />
          ) : !overview ? (
            <EmptyState
              title="Sua conta ainda nao tem acessos carregados"
              description="Assim que um pedido confirmado estiver associado ao seu e-mail, ele aparece aqui automaticamente."
            />
          ) : (
            <>
              <UserHeader overview={overview} onSignOut={signOut} />

              {overview.stats.totalEvents === 0 ? (
                <EmptyState
                  title="Nenhum evento associado ao seu perfil"
                  description="Quando voce concluir uma compra ou inscricao, seus tickets e instrucoes passam a aparecer aqui."
                  action={
                    <a
                      href="/events"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
                    >
                      <Ticket className="h-4 w-4" />
                      Explorar eventos
                    </a>
                  }
                />
              ) : (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
                  <div className="space-y-8">
                    <UserEventsSection
                      title="Proximos eventos"
                      description="Acessos ativos e experiencias que ja fazem parte da sua agenda."
                      events={overview.upcomingEvents}
                      activeEventId={selectedEventId}
                      onSelect={setSelectedEventId}
                      emptyTitle="Nenhum evento futuro no momento"
                      emptyDescription="Quando uma nova experiencia estiver confirmada, ela aparece aqui com acesso rapido ao ticket."
                    />

                    <UserEventsSection
                      title="Eventos passados"
                      description="Historico recente para voce reencontrar tickets usados e experiencias anteriores."
                      events={overview.pastEvents}
                      activeEventId={selectedEventId}
                      onSelect={setSelectedEventId}
                      emptyTitle="Seu historico ainda esta vazio"
                      emptyDescription="Depois do primeiro evento, este espaco vira sua memoria de experiencias ja vividas."
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
