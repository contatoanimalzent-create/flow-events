import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/ui/FoundationPrimitives'

interface AsyncPageStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function PageLoadingState({ title = 'Carregando', description = 'Estamos preparando os dados desta tela.' }: Partial<AsyncPageStateProps>) {
  return <LoadingState title={title} description={description} icon={<Loader2 className="h-8 w-8 animate-spin" />} />
}

export function PageErrorState({ title, description, action, icon }: AsyncPageStateProps) {
  return <ErrorState title={title} description={description} action={action} icon={icon ?? <AlertTriangle className="h-8 w-8" />} />
}

export function PageEmptyState({ title, description, action, icon }: AsyncPageStateProps) {
  return <EmptyState title={title} description={description} action={action} icon={icon ?? <Inbox className="h-8 w-8" />} />
}
