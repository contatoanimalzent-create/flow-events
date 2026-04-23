import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PulseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[PulseErrorBoundary] Caught error', {
      route: this.props.routeName,
      error,
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            backgroundColor: '#060d1f',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '1.25rem' }}>⚠️</span>

          <h2
            style={{
              color: '#ffffff',
              fontSize: '1.375rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Algo deu errado
          </h2>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              maxWidth: '22rem',
            }}
          >
            Um erro inesperado ocorreu nesta tela.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '18rem' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                backgroundColor: '#d4ff00',
                color: '#060d1f',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Recarregar tela
            </button>

            <button
              onClick={() => {
                window.history.replaceState({}, '', '/pulse')
                window.location.reload()
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
