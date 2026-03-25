import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'

interface AsyncPageStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function PageLoadingState({ title = 'Carregando', description = 'Estamos preparando os dados desta tela.' }: Partial<AsyncPageStateProps>) {
  return (
    <div className="surface-panel flex items-center justify-center px-8 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
        <div>
          <div className="font-serif text-3xl font-semibold leading-none text-text-primary">{title}</div>
          <div className="mt-2 text-sm text-text-muted">{description}</div>
        </div>
      </div>
    </div>
  )
}

export function PageErrorState({ title, description, action, icon }: AsyncPageStateProps) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center p-16 text-center">
      {icon ?? <AlertTriangle className="mb-3 h-10 w-10 text-status-error" />}
      <div className="font-serif text-4xl font-semibold leading-none text-text-primary">{title}</div>
      {description ? <p className="mt-3 max-w-md text-sm leading-7 text-text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function PageEmptyState({ title, description, action, icon }: AsyncPageStateProps) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center p-16 text-center">
      {icon ?? <Inbox className="mb-3 h-10 w-10 text-text-muted" />}
      <div className="font-serif text-4xl font-semibold leading-none text-text-primary">{title}</div>
      {description ? <p className="mt-3 max-w-md text-sm leading-7 text-text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
