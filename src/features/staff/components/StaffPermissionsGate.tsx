import { useEffect, useState } from 'react'
import { Bell, Camera, CheckCircle2, Loader2, MapPin, ShieldAlert } from 'lucide-react'
import {
  checkStaffPermissions,
  requestStaffPermissions,
  requestLocationPermission,
  requestNotificationPermission,
  requestCameraPermission,
  type PermissionsState,
  type PermissionStatus,
} from '@/core/native/capacitor'

interface StaffPermissionsGateProps {
  /** Chamado quando localização E notificação estão concedidas (câmera é pedida na hora da foto) */
  onReady?: () => void
  /** Se true, bloqueia o conteúdo até localização + notificação serem concedidas */
  blocking?: boolean
  children?: React.ReactNode
}

const STORAGE_KEY = 'pulse_staff_permissions_asked'

function StatusIcon({ status }: { status: PermissionStatus }) {
  if (status === 'granted') return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  if (status === 'denied') return <ShieldAlert className="h-5 w-5 text-red-400" />
  return <div className="h-5 w-5 rounded-full border-2 border-white/20" />
}

/**
 * Tela que solicita as permissões essenciais do staff:
 * - Localização (obrigatória) — confirmar presença no evento
 * - Notificações (obrigatória) — receber aviso de chegada e avisos do evento
 * - Câmera (pedida ao tirar a foto)
 */
export function StaffPermissionsGate({ onReady, blocking = true, children }: StaffPermissionsGateProps) {
  const [perms, setPerms] = useState<PermissionsState | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    void checkStaffPermissions().then((p) => {
      setPerms(p)
      setChecked(true)
    })
  }, [])

  useEffect(() => {
    if (perms && perms.location === 'granted' && perms.notifications === 'granted') {
      onReady?.()
    }
  }, [perms, onReady])

  async function handleRequestAll() {
    setRequesting(true)
    try {
      const result = await requestStaffPermissions()
      setPerms(result)
      localStorage.setItem(STORAGE_KEY, '1')
    } finally {
      setRequesting(false)
    }
  }

  async function handleRetry(kind: 'location' | 'notifications' | 'camera') {
    setRequesting(true)
    try {
      let status: PermissionStatus
      if (kind === 'location') status = await requestLocationPermission()
      else if (kind === 'notifications') status = await requestNotificationPermission()
      else status = await requestCameraPermission()
      setPerms((prev) => (prev ? { ...prev, [kind]: status } : prev))
    } finally {
      setRequesting(false)
    }
  }

  const ready = perms && perms.location === 'granted' && perms.notifications === 'granted'

  // Já está tudo concedido → renderiza o conteúdo
  if (ready || !blocking) {
    return <>{children}</>
  }

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    )
  }

  const items = [
    {
      key: 'location' as const,
      icon: MapPin,
      title: 'Localização',
      desc: 'Para confirmar sua presença no local do evento.',
      required: true,
    },
    {
      key: 'notifications' as const,
      icon: Bell,
      title: 'Notificações',
      desc: 'Para avisar quando você chegar e receber comunicados do evento.',
      required: true,
    },
    {
      key: 'camera' as const,
      icon: Camera,
      title: 'Câmera',
      desc: 'Para tirar a foto de confirmação de presença.',
      required: false,
    },
  ]

  const anyDenied = perms && (perms.location === 'denied' || perms.notifications === 'denied')

  return (
    <div className="flex min-h-[70vh] flex-col justify-center px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A1AFF]/15">
            <ShieldAlert className="h-7 w-7 text-[#4d5cff]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Permissões necessárias</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Para trabalhar no evento, o Pulse precisa de localização e notificações ativas. Sem elas não é possível confirmar sua presença.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const status = perms?.[item.key] ?? 'prompt'
            return (
              <div
                key={item.key}
                className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <item.icon className="h-5 w-5 text-white/70" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    {item.required && (
                      <span className="rounded-full bg-[#0A1AFF]/20 px-2 py-0.5 text-[10px] font-medium text-[#7d8bff]">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-white/50">{item.desc}</p>
                  {status === 'denied' && (
                    <button
                      onClick={() => handleRetry(item.key)}
                      className="mt-2 text-xs font-medium text-[#7d8bff] underline"
                    >
                      Permitir novamente
                    </button>
                  )}
                </div>
                <StatusIcon status={status} />
              </div>
            )
          })}
        </div>

        {anyDenied && (
          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-200">
            Você negou uma permissão obrigatória. Abra as <strong>configurações do app</strong> no seu celular e ative Localização e Notificações manualmente.
          </p>
        )}

        <button
          onClick={handleRequestAll}
          disabled={requesting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1AFF] py-4 text-sm font-semibold text-white transition-all hover:bg-[#0A1AFF]/85 disabled:opacity-50"
        >
          {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {requesting ? 'Solicitando...' : 'Permitir acesso'}
        </button>
      </div>
    </div>
  )
}
