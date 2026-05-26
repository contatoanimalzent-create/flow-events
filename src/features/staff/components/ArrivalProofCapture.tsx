import { useState } from 'react'
import { Camera, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { takePicture, getCurrentPosition } from '@/core/native/capacitor'
import { submitArrivalProof, dataUrlToFile, type ArrivalProofResult } from '@/features/staff/services/arrival-proof.service'

interface ArrivalProofCaptureProps {
  eventId: string
  eventName: string
  organizationId: string
  /** posição já detectada pelo geofence (fallback re-coleta) */
  initialPosition?: { lat: number; lng: number; accuracy?: number } | null
  onSubmitted: (result: ArrivalProofResult) => void
  onDismiss?: () => void
}

type Phase = 'prompt' | 'capturing' | 'preview' | 'submitting' | 'done' | 'error'

/**
 * Prompt mostrado quando o staff chega no local do evento.
 * Captura foto + GPS + horário como prova de presença.
 */
export function ArrivalProofCapture({
  eventId,
  eventName,
  organizationId,
  initialPosition,
  onSubmitted,
  onDismiss,
}: ArrivalProofCaptureProps) {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<ArrivalProofResult | null>(null)

  async function handleCapture() {
    setPhase('capturing')
    setErrorMsg('')
    try {
      // Tenta câmera nativa; fallback para input file
      const native = await takePicture()
      if (native) {
        setPhotoDataUrl(native)
        setPhase('preview')
      } else {
        // Web fallback: dispara input file
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'
        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) {
            setPhase('prompt')
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            setPhotoDataUrl(reader.result as string)
            setPhase('preview')
          }
          reader.readAsDataURL(file)
        }
        input.click()
      }
    } catch {
      setErrorMsg('Não foi possível abrir a câmera. Tente novamente.')
      setPhase('error')
    }
  }

  async function handleSubmit() {
    if (!photoDataUrl) return
    setPhase('submitting')
    setErrorMsg('')
    try {
      // Re-coleta posição no momento do envio (mais precisa)
      const pos = (await getCurrentPosition()) ?? initialPosition
      if (!pos) {
        setErrorMsg('Não foi possível obter sua localização. Ative o GPS e tente novamente.')
        setPhase('error')
        return
      }

      const file = dataUrlToFile(photoDataUrl, `arrival-${Date.now()}.jpg`)
      const res = await submitArrivalProof({
        eventId,
        organizationId,
        photoFile: file,
        latitude: pos.lat,
        longitude: pos.lng,
        accuracyMeters: pos.accuracy,
      })
      setResult(res)
      setPhase('done')
      onSubmitted(res)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao enviar a prova de chegada.')
      setPhase('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A1AFF]/15">
              <MapPin className="h-5 w-5 text-[#4d5cff]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Você chegou!</h2>
              <p className="text-xs text-white/50">{eventName}</p>
            </div>
          </div>
          {onDismiss && phase !== 'submitting' && phase !== 'done' && (
            <button onClick={onDismiss} className="text-white/40 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {(phase === 'prompt' || phase === 'capturing') && (
          <>
            <p className="mb-6 text-sm leading-6 text-white/70">
              Confirme sua presença no evento tirando uma foto agora. Sua localização e o horário serão registrados automaticamente.
            </p>
            <button
              onClick={handleCapture}
              disabled={phase === 'capturing'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1AFF] py-4 text-sm font-semibold text-white transition-all hover:bg-[#0A1AFF]/85 disabled:opacity-50"
            >
              {phase === 'capturing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {phase === 'capturing' ? 'Abrindo câmera...' : 'Tirar foto de presença'}
            </button>
          </>
        )}

        {phase === 'preview' && photoDataUrl && (
          <>
            <img src={photoDataUrl} alt="Prova de chegada" className="mb-4 max-h-72 w-full rounded-2xl object-cover" />
            <div className="flex gap-3">
              <button
                onClick={() => { setPhotoDataUrl(null); setPhase('prompt') }}
                className="flex-1 rounded-2xl border border-white/15 py-3.5 text-sm font-medium text-white/70 hover:bg-white/5"
              >
                Refazer
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-2xl bg-[#0A1AFF] py-3.5 text-sm font-semibold text-white hover:bg-[#0A1AFF]/85"
              >
                Confirmar presença
              </button>
            </div>
          </>
        )}

        {phase === 'submitting' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#4d5cff]" />
            <p className="text-sm text-white/60">Enviando prova de chegada...</p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <p className="text-base font-semibold text-white">{result.message}</p>
            {result.distance_meters != null && (
              <p className="text-xs text-white/50">
                Distância do local: {Math.round(result.distance_meters)}m ·{' '}
                {new Date(result.captured_at).toLocaleTimeString('pt-BR')}
              </p>
            )}
            <button
              onClick={onDismiss}
              className="mt-3 rounded-2xl bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/15"
            >
              Fechar
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="space-y-4">
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMsg}
            </p>
            <button
              onClick={() => setPhase('prompt')}
              className="w-full rounded-2xl bg-[#0A1AFF] py-3.5 text-sm font-semibold text-white"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
