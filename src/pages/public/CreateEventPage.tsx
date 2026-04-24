import { CreateEventLanding } from '@/features/growth'
import { PublicLayout, usePublicEvents } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { LoadingState } from '@/shared/components'

export function CreateEventPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()

  if (publicEventsQuery.isPending) {
    return (
      <PublicLayout onLogin={onLogin}>
        <div className="px-5 py-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title={isPortuguese ? 'Carregando' : 'Loading'}
              description={isPortuguese ? 'Preparando as informações da plataforma.' : 'Preparing platform information.'}
              className="min-h-[18rem]"
            />
          </div>
        </div>
      </PublicLayout>
    )
  }

  return <CreateEventLanding onLogin={onLogin} events={publicEventsQuery.data ?? []} />
}
