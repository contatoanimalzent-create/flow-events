import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { IntelligenceAlert } from '@/features/intelligence/types'
import { ConfirmActionBox, FormField, ModalBody, ModalFooter, ModalHeader, ModalShell } from '@/shared/components'

interface AlertAcknowledgeModalProps {
  alert: IntelligenceAlert
  saving: boolean
  onClose: () => void
  onConfirm: (notes: string) => Promise<void>
}

export function AlertAcknowledgeModal({ alert, saving, onClose, onConfirm }: AlertAcknowledgeModalProps) {
  const [notes, setNotes] = useState(alert.notes ?? '')

  return (
    <ModalShell size="md">
      <ModalHeader
        eyebrow="Intelligence"
        title={
          <>
            Reconhecer alerta<span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Registre contexto operacional para manter a trilha de resposta clara no time."
        onClose={onClose}
      />

      <ModalBody>
        <ConfirmActionBox
          tone={alert.severity === 'critical' ? 'danger' : 'default'}
          title={alert.title}
          description={alert.description}
        />

        <FormField label="Observacoes">
          <textarea className="input resize-none" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>
      </ModalBody>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button onClick={() => void onConfirm(notes)} disabled={saving} className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Reconhecendo...' : 'Reconhecer alerta'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
