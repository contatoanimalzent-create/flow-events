import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useArrivalDetection } from '@/features/staff/hooks/useArrivalDetection'
import { ArrivalProofCapture } from './ArrivalProofCapture'

interface ArrivalProofGateProps {
  eventId: string | null
  eventName: string
  organizationId: string | null
  profileId: string | null
}

/**
 * Gate que monitora a localização do staff e, ao detectar chegada no evento,
 * mostra automaticamente o prompt de foto de presença.
 * Renderiza um indicador discreto enquanto rastreia.
 */
export function ArrivalProofGate({ eventId, eventName, organizationId, profileId }: ArrivalProofGateProps) {
  const { state, distanceMeters, currentPosition, markProofSubmitted } = useArrivalDetection({
    eventId,
    profileId,
  })
  const [dismissed, setDismissed] = useState(false)

  if (!eventId || !organizationId || !profileId) return null
  if (state === 'idle' || state === 'disabled') return null

  // Já enviou prova → badge confirmado
  if (state === 'proof_submitted') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
        <MapPin className="h-3.5 w-3.5" />
        Presença confirmada no evento.
      </div>
    )
  }

  // Rastreando, ainda longe → indicador de distância
  if (state === 'tracking') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
        <MapPin className="h-3.5 w-3.5 animate-pulse" />
        {distanceMeters != null
          ? `A ${Math.round(distanceMeters)}m do evento — aproxime-se para confirmar presença.`
          : 'Localizando você...'}
      </div>
    )
  }

  // Chegou no raio → mostra o prompt de foto (a menos que tenha fechado)
  if (state === 'arrived' && !dismissed) {
    return (
      <ArrivalProofCapture
        eventId={eventId}
        eventName={eventName}
        organizationId={organizationId}
        initialPosition={currentPosition}
        onSubmitted={() => markProofSubmitted()}
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Chegou mas fechou o prompt → botão para reabrir
  if (state === 'arrived' && dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A1AFF]/40 bg-[#0A1AFF]/15 px-3 py-2.5 text-xs font-medium text-[#7d8bff]"
      >
        <MapPin className="h-3.5 w-3.5" />
        Confirmar presença com foto
      </button>
    )
  }

  return null
}
