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
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        <div>
          <div className="text-sm font-medium text-text-primary">{title}</div>
          <div className="text-xs text-text-muted">{description}</div>
        </div>
      </div>
    </div>
  )
}

export function PageErrorState({ title, description, action, icon }: AsyncPageStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center p-16 text-center">
      {icon ?? <AlertTriangle className="mb-3 h-10 w-10 text-status-error" />}
      <div className="font-display text-2xl text-text-primary">{title}</div>
      {description ? <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function PageEmptyState({ title, description, action, icon }: AsyncPageStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center p-16 text-center">
      {icon ?? <Inbox className="mb-3 h-10 w-10 text-text-muted" />}
      <div className="font-display text-2xl text-text-primary">{title}</div>
      {description ? <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
