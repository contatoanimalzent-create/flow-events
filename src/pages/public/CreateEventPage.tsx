import { CreateEventLanding } from '@/features/growth'
import { PublicLayout, usePublicEvents } from '@/features/public'
import { LoadingState } from '@/shared/components'

export function CreateEventPage({ onLogin }: { onLogin: () => void }) {
  const publicEventsQuery = usePublicEvents()

  if (publicEventsQuery.isPending) {
    return (
      <PublicLayout onLogin={onLogin}>
        <div className="px-5 py-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title="Preparando a jornada de produtor"
              description="Estamos organizando sinais de venda, prova social e narrativa comercial para esta entrada."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      </PublicLayout>
    )
  }

  return <CreateEventLanding onLogin={onLogin} events={publicEventsQuery.data ?? []} />
}
