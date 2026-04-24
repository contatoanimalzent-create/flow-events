import { useAppContext } from '@/core/context/app-context.store'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function AccessDeniedPage({ onNavigate }: PulsePageProps) {
  const { context } = useAppContext()

  const handleGoHome = () => {
    if (context?.mode) {
      onNavigate('/pulse/' + context.mode)
    } else {
      onNavigate('/pulse/select-mode')
    }
  }

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
      <span style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '1.25rem' }}>🔒</span>

      <h2
        style={{
          color: '#ffffff',
          fontSize: '1.375rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}
      >
        Acesso negado
      </h2>

      <p
        style={{
          color: '#94a3b8',
          fontSize: '0.9rem',
          marginBottom: '2rem',
          maxWidth: '22rem',
        }}
      >
        Você não tem permissão para acessar está área.
      </p>

      <button
        onClick={handleGoHome}
        style={{
          backgroundColor: '#d4ff00',
          color: '#060d1f',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: '14rem',
        }}
      >
        Ir para meu início
      </button>
    </div>
  )
}
