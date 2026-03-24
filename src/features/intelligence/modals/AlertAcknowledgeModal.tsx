import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import type { IntelligenceAlert } from '@/features/intelligence/types'

interface AlertAcknowledgeModalProps {
  alert: IntelligenceAlert
  saving: boolean
  onClose: () => void
  onConfirm: (notes: string) => Promise<void>
}

export function AlertAcknowledgeModal({ alert, saving, onClose, onConfirm }: AlertAcknowledgeModalProps) {
  const [notes, setNotes] = useState(alert.notes ?? '')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-lg overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            RECONHECER ALERTA<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <div className="text-sm font-semibold text-text-primary">{alert.title}</div>
            <div className="mt-1 text-sm text-text-secondary">{alert.description}</div>
          </div>

          <div>
            <label className="input-label">Observacoes</label>
            <textarea className="input resize-none" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void onConfirm(notes)} disabled={saving} className="btn-primary flex min-w-[140px] items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reconhecer'}
          </button>
        </div>
      </div>
    </div>
  )
}
