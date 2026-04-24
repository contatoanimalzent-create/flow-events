import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/ui/FoundationPrimitives'
import { useAppLocale } from '@/shared/i18n/app-locale'

interface AsyncPageStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function PageLoadingState({
  title,
  description,
}: Partial<AsyncPageStateProps>) {
  const { t } = useAppLocale()

  return (
    <LoadingState
      title={title ?? t('Loading', 'Carregando')}
      description={description ?? t('We are organizing the data for you. One moment, please.', 'Estamos organizando os dados para você. Um momento, por favor.')}
      icon={<Loader2 className="h-8 w-8 animate-spin" />}
    />
  )
}

export function PageErrorState({ title, description, action, icon }: AsyncPageStateProps) {
  return <ErrorState title={title} description={description} action={action} icon={icon ?? <AlertTriangle className="h-8 w-8" />} />
}

export function PageEmptyState({ title, description, action, icon }: AsyncPageStateProps) {
  return <EmptyState title={title} description={description} action={action} icon={icon ?? <Inbox className="h-8 w-8" />} />
}
