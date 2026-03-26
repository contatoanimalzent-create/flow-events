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
              title="Carregando"
              description="Preparando as informacoes da plataforma."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      </PublicLayout>
    )
  }

  return <CreateEventLanding onLogin={onLogin} events={publicEventsQuery.data ?? []} />
}
