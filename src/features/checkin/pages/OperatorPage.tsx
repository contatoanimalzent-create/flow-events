import { useState } from 'react'
import { Loader2, ScanLine, AlertTriangle, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OperatorScannerView } from '@/features/checkin/components/OperatorScannerView'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInfo {
  id: string
  name: string
  org_id: string
}

// ─── Event code entry form ────────────────────────────────────────────────────

function EventCodeForm({ onSuccess }: { onSuccess: (event: EventInfo) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setError(null)
    setLoading(true)

    const { data, error: dbError } = await supabase
      .from('events')
      .select('id, name, organization_id')
      .eq('event_code', trimmed)
      .in('status', ['published', 'ongoing'])
      .single()

    setLoading(false)

    if (dbError || !data) {
      setError('Código inválido ou evento não está ativo.')
      return
    }

    onSuccess({
      id: data.id,
      name: data.name,
      org_id: data.organization_id,
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-brand-acid/15">
            <ScanLine className="h-7 w-7 text-brand-acid" />
          </div>
          <div className="text-center">
            <div className="font-display text-xl font-bold uppercase tracking-widest text-brand-acid">
              PULSE CHECK-IN
            </div>
            <div className="mt-1 font-mono text-xs text-text-muted">
              Modo operador · Acesso restrito
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-text-muted">
              Código do evento
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full rounded-sm border border-bg-border bg-bg-card pl-10 pr-3 py-4 font-mono text-2xl font-bold tracking-[0.3em] text-brand-acid placeholder-text-muted/30 focus:border-brand-acid focus:outline-none transition-colors text-center uppercase"
                placeholder="XXXXXX"
              />
            </div>
            <p className="mt-2 font-mono text-[10px] text-text-muted text-center">
              Solicite o código ao organizador do evento
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-sm border border-status-error/30 bg-status-error/10 px-3 py-2.5 text-sm text-status-error">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.trim().length < 4}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <ScanLine className="h-5 w-5" />
                Abrir Scanner
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OperatorPage() {
  const [event, setEvent] = useState<EventInfo | null>(null)

  if (!event) {
    return <EventCodeForm onSuccess={setEvent} />
  }

  return (
    <OperatorScannerView
      eventId={event.id}
      eventName={event.name}
      orgId={event.org_id}
      onReset={() => setEvent(null)}
    />
  )
}
