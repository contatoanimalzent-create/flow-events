import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logError } from '@/shared/lib'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    logError(error, {
      scope: 'ui',
      action: 'error-boundary',
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-16 h-16 rounded-sm bg-status-error/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-status-error" />
          </div>
          <h2 className="font-display text-2xl text-text-primary mb-2">ALGO DEU ERRADO.</h2>
          <p className="text-sm text-text-muted mb-2 max-w-md">
            Um erro inesperado ocorreu nesta página. Isso foi registrado automaticamente.
          </p>
          {this.state.error?.message && (
            <p className="text-[11px] font-mono text-status-error/70 mb-6 max-w-md bg-status-error/5 px-4 py-2 rounded-sm border border-status-error/15">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
