import { useEffect, useState } from 'react'
import { AlertCircle, Bell, Camera, CheckCircle2, ChevronDown, Clock, Loader2, MapPin, Shield, Users } from 'lucide-react'
import {
  checkStaffPermissions,
  requestCameraPermission,
  requestLocationPermission,
  requestNotificationPermission,
  type PermissionStatus,
  type PermissionsState,
} from '@/core/native/capacitor'
import { formatCPF, normalizeCPF, normalizeCPFForStorage, unformatCPF, validateCPF } from '@/lib/validators/cpf'

interface InviteInfo {
  event_name: string
  event_date?: string | null
  event_location?: string | null
  role?: string | null
  team?: string | null
  shift?: string | null
  shift_starts_at?: string | null
  shift_ends_at?: string | null
  custom_fields?: CustomField[] | null
  organization_name?: string | null
}

interface CustomField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  options?: string[]
}

type PageState = 'loading' | 'valid' | 'error' | 'success'
type TShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

interface FormData {
  full_name: string
  email: string
  email_confirm: string
  phone: string
  phone_confirm: string
  cpf: string
  tshirt_size: TShirtSize | ''
  bio: string
  emergency_contact_name: string
  emergency_contact_phone: string
  terms_accepted: boolean
  custom_answers: Record<string, string | boolean>
}

function getToken(): string | null {
  const pathMatch = window.location.pathname.match(/\/staff\/join\/([^/?#]+)/)
  if (pathMatch) return pathMatch[1]
  return new URLSearchParams(window.location.search).get('token')
}

function formatDatePT(value?: string | null): string | null {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatTimePT(iso?: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatWhatsApp(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11)
  if (clean.length <= 2) return clean
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
}

function InputField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#f5f0e8]">
        {label}
        {required && <span className="ml-1 text-[#D4FF00]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-white/42">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4FF00]/10'

const initialPermissions: PermissionsState = {
  camera: 'prompt',
  location: 'prompt',
  notifications: 'prompt',
}

const permissionText: Record<PermissionStatus, { label: string; className: string }> = {
  granted: { label: 'Ativo', className: 'border-[#D4FF00]/25 bg-[#D4FF00]/10 text-[#D4FF00]' },
  denied: { label: 'Bloqueado', className: 'border-red-500/25 bg-red-500/10 text-red-300' },
  prompt: { label: 'Pendente', className: 'border-white/12 bg-white/[0.05] text-white/58' },
  unavailable: { label: 'Indisponivel', className: 'border-white/12 bg-white/[0.05] text-white/42' },
}

export function StaffJoinPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData | string, string>>>({})
  const [permissions, setPermissions] = useState<PermissionsState>(initialPermissions)
  const [requestingPermissions, setRequestingPermissions] = useState(false)

  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    email_confirm: '',
    phone: '',
    phone_confirm: '',
    cpf: '',
    tshirt_size: '',
    bio: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    terms_accepted: false,
    custom_answers: {},
  })

  const token = getToken()
  const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-staff-invite`

  useEffect(() => {
    if (!token) {
      setErrorMessage('Link de convite invalido ou expirado.')
      setPageState('error')
      return
    }

    const controller = new AbortController()

    async function fetchInvite() {
      try {
        const res = await fetch(`${EDGE_FN_URL}?token=${encodeURIComponent(token!)}`, {
          method: 'GET',
          signal: controller.signal,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setErrorMessage(body?.message ?? 'Este convite e invalido, expirou ou ja atingiu o limite de vagas.')
          setPageState('error')
          return
        }

        const data = await res.json()
        setInviteInfo(data)
        setPageState('valid')
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return
        setErrorMessage('Erro ao carregar o convite. Verifique sua conexao e tente novamente.')
        setPageState('error')
      }
    }

    void fetchInvite()
    return () => controller.abort()
  }, [token, EDGE_FN_URL])

  useEffect(() => {
    if (pageState !== 'success') return

    void checkStaffPermissions().then(setPermissions)
  }, [pageState])

  function setField<TKey extends keyof FormData>(key: TKey, value: FormData[TKey]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function setCustomAnswer(key: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      custom_answers: { ...prev.custom_answers, [key]: value },
    }))
    setFieldErrors((prev) => ({ ...prev, [`custom_${key}`]: undefined }))
  }

  function validate(): boolean {
    const errors: Partial<Record<string, string>> = {}
    const cpf = normalizeCPF(form.cpf)
    const email = form.email.trim().toLowerCase()
    const emailConfirm = form.email_confirm.trim().toLowerCase()
    const phone = form.phone.replace(/\D/g, '')
    const phoneConfirm = form.phone_confirm.replace(/\D/g, '')

    if (!form.full_name.trim()) errors.full_name = 'Nome completo e obrigatorio.'
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'E-mail invalido.'
    if (!emailConfirm) errors.email_confirm = 'Confirme seu e-mail.'
    else if (email !== emailConfirm) errors.email_confirm = 'Os e-mails precisam ser iguais.'
    if (!phone || phone.length < 10) errors.phone = 'WhatsApp invalido.'
    if (!phoneConfirm) errors.phone_confirm = 'Confirme seu WhatsApp.'
    else if (phone !== phoneConfirm) errors.phone_confirm = 'Os WhatsApps precisam ser iguais.'
    if (!cpf) errors.cpf = 'CPF obrigatorio.'
    else if (!validateCPF(cpf)) errors.cpf = 'CPF invalido.'
    if (!form.terms_accepted) errors.terms_accepted = 'Voce deve aceitar os termos para continuar.'

    for (const field of inviteInfo?.custom_fields ?? []) {
      if (field.required) {
        const value = form.custom_answers[field.key]
        if (!value && value !== false) errors[`custom_${field.key}`] = `${field.label} e obrigatorio.`
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        token,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: formatWhatsApp(form.phone),
        document_number: normalizeCPFForStorage(form.cpf) ?? undefined,
        t_shirt_size: form.tshirt_size || undefined,
        bio: form.bio.trim() || undefined,
        emergency_contact_name: form.emergency_contact_name.trim() || undefined,
        emergency_contact_phone: form.emergency_contact_phone.trim() || undefined,
        custom_field_answers: form.custom_answers,
        terms_accepted: true,
      }

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(body?.message ?? body?.error ?? 'Erro ao confirmar seus dados. Tente novamente.')
        setPageState('error')
        return
      }

      setPageState('success')
    } catch {
      setErrorMessage('Erro de conexao. Verifique sua internet e tente novamente.')
      setPageState('error')
    } finally {
      setSubmitting(false)
    }
  }

  async function requestRequiredPermissions() {
    setRequestingPermissions(true)
    try {
      const location = await requestLocationPermission()
      const notifications = await requestNotificationPermission()
      const camera = await requestCameraPermission()
      const nextPermissions = { camera, location, notifications }
      setPermissions(nextPermissions)

      if (notifications === 'granted' && typeof Notification !== 'undefined') {
        new Notification('Pulse Staff', {
          body: 'Permissoes ativadas. Quando chegar no evento, voce recebera o aviso para tirar a foto de presenca.',
        })
      }
    } finally {
      setRequestingPermissions(false)
    }
  }

  function PermissionItem({
    icon,
    title,
    description,
    status,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    status: PermissionStatus
  }) {
    const statusText = permissionText[status]

    return (
      <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#D4FF00]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#f5f0e8]">{title}</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${statusText.className}`}>
              {statusText.label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-white/48">{description}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <Loader2 className="h-7 w-7 animate-spin text-[#D4FF00]" />
          </div>
          <p className="text-sm text-white/52">Carregando convite...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Link invalido
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/56">{errorMessage}</p>
        </div>
        <a
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Voltar ao inicio
        </a>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Dados confirmados!
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Seu cadastro de staff foi confirmado. As orientacoes do evento serao enviadas pelo e-mail e WhatsApp informados.
          </p>
        </div>
        <div className="w-full max-w-xl rounded-[1.6rem] border border-white/8 bg-[#12161f] p-5 sm:p-6">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4FF00]/80">Obrigatorio para trabalhar</p>
            <h2 className="mt-2 text-xl font-semibold text-[#f5f0e8]">Ative camera, localizacao e notificacoes</h2>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Quando voce chegar no evento, o Pulse vai avisar para tirar a foto de presenca. Essa foto confirma o dia,
              o horario e o local do trabalho.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <PermissionItem
              icon={<Camera className="h-4 w-4" />}
              title="Camera"
              description="Usada para tirar a foto de presenca no evento."
              status={permissions.camera}
            />
            <PermissionItem
              icon={<MapPin className="h-4 w-4" />}
              title="Localizacao"
              description="Confirma que a foto foi feita no local correto."
              status={permissions.location}
            />
            <PermissionItem
              icon={<Bell className="h-4 w-4" />}
              title="Notificacoes"
              description="Envia o aviso para tirar a foto quando chegar."
              status={permissions.notifications}
            />
          </div>

          <button
            type="button"
            onClick={requestRequiredPermissions}
            disabled={requestingPermissions}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4FF00] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#06070a] transition-all hover:bg-[#c8f200] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {requestingPermissions ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ativando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Ativar permissoes
              </>
            )}
          </button>

          {(permissions.camera === 'denied' || permissions.location === 'denied' || permissions.notifications === 'denied') && (
            <p className="mt-3 text-left text-xs leading-5 text-red-300/80">
              Alguma permissao foi bloqueada. Libere camera, localizacao e notificacoes nas configuracoes do navegador ou celular.
            </p>
          )}
        </div>
        {inviteInfo && (
          <div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#D4FF00]/80">Evento</p>
            <p className="mt-1 text-base font-semibold text-[#f5f0e8]">{inviteInfo.event_name}</p>
            {inviteInfo.role && <p className="mt-1 text-sm text-white/52">{inviteInfo.role}</p>}
          </div>
        )}
      </div>
    )
  }

  const info = inviteInfo!
  const eventDate = formatDatePT(info.event_date)
  const shiftStart = formatTimePT(info.shift_starts_at)
  const shiftEnd = formatTimePT(info.shift_ends_at)

  return (
    <div className="min-h-screen bg-[#06070a]">
      <div className="relative overflow-hidden bg-[#0d1118] pb-8 pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-[60vw] -translate-x-1/2 rounded-full bg-[#D4FF00]/[0.04] blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-5">
          <div className="mb-8 flex items-center gap-3">
            <img src="/logo.png" alt="Pulse" className="h-11 w-auto brightness-0 invert" />
            {info.organization_name && (
              <span className="text-xs uppercase tracking-[0.22em] text-white/40">{info.organization_name}</span>
            )}
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-[#D4FF00]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4FF00]">
              Confirmacao de Staff
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.4rem,6vw,3.8rem)] uppercase leading-none tracking-tight text-[#f5f0e8]">
            {info.event_name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3">
            {eventDate && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-white/48" />
                <span className="text-[12px] text-white/64">{eventDate}</span>
              </div>
            )}
            {info.event_location && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-white/48" />
                <span className="text-[12px] text-white/64">{info.event_location}</span>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {info.role && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">Funcao</p>
                <p className="mt-1 text-sm font-semibold text-[#f5f0e8]">{info.role}</p>
              </div>
            )}
            {info.team && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">Equipe</p>
                <p className="mt-1 text-sm font-semibold text-[#f5f0e8]">{info.team}</p>
              </div>
            )}
            {(info.shift ?? (shiftStart && shiftEnd)) && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">Turno</p>
                <p className="mt-1 text-sm font-semibold text-[#f5f0e8]">
                  {info.shift ?? `${shiftStart}, ${shiftEnd}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-[2rem] border border-white/8 bg-[#12161f] p-6 sm:p-8">
          <h2 className="font-display text-[1.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Confirme seus dados
          </h2>
          <p className="mt-2 text-sm text-white/48">
            Estes dados entram direto na equipe operacional do evento. Confira e repita e-mail e WhatsApp para evitar erro de notificacao.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
            <section>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">Dados pessoais</h3>
              <div className="flex flex-col gap-4">
                <InputField label="Nome completo" required error={fieldErrors.full_name}>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setField('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className={inputClass}
                    autoComplete="name"
                  />
                </InputField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="E-mail" required error={fieldErrors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </InputField>

                  <InputField label="Confirmar e-mail" required error={fieldErrors.email_confirm}>
                    <input
                      type="email"
                      value={form.email_confirm}
                      onChange={(e) => setField('email_confirm', e.target.value)}
                      placeholder="repita seu@email.com"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="WhatsApp" required hint="Usado para notificacoes do evento." error={fieldErrors.phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', formatWhatsApp(e.target.value))}
                      placeholder="(11) 91234-5678"
                      className={inputClass}
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={15}
                    />
                  </InputField>

                  <InputField label="Confirmar WhatsApp" required error={fieldErrors.phone_confirm}>
                    <input
                      type="tel"
                      value={form.phone_confirm}
                      onChange={(e) => setField('phone_confirm', formatWhatsApp(e.target.value))}
                      placeholder="(11) 91234-5678"
                      className={inputClass}
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={15}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="CPF" required error={fieldErrors.cpf}>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => setField('cpf', formatCPF(unformatCPF(e.target.value).slice(0, 11)))}
                      placeholder="000.000.000-00"
                      className={inputClass}
                      inputMode="numeric"
                      maxLength={14}
                    />
                  </InputField>

                  <InputField label="Tamanho da camiseta" hint="Opcional" error={fieldErrors.tshirt_size}>
                    <div className="relative">
                      <select
                        value={form.tshirt_size}
                        onChange={(e) => setField('tshirt_size', e.target.value as TShirtSize | '')}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="">Selecione o tamanho</option>
                        {(['PP', 'P', 'M', 'G', 'GG', 'XGG'] as TShirtSize[]).map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    </div>
                  </InputField>
                </div>

                <InputField label="Experiencia / apresentacao" hint="Opcional" error={fieldErrors.bio}>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    placeholder="Conte rapidamente sua experiencia com eventos."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </InputField>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                Contato de emergencia <span className="text-white/24">(opcional)</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Nome" error={fieldErrors.emergency_contact_name}>
                  <input
                    type="text"
                    value={form.emergency_contact_name}
                    onChange={(e) => setField('emergency_contact_name', e.target.value)}
                    placeholder="Nome do contato"
                    className={inputClass}
                  />
                </InputField>
                <InputField label="Telefone" error={fieldErrors.emergency_contact_phone}>
                  <input
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={(e) => setField('emergency_contact_phone', formatWhatsApp(e.target.value))}
                    placeholder="(11) 91234-5678"
                    className={inputClass}
                    inputMode="tel"
                    maxLength={15}
                  />
                </InputField>
              </div>
            </section>

            {(info.custom_fields?.length ?? 0) > 0 && (
              <section>
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                  Informacoes adicionais
                </h3>
                <div className="flex flex-col gap-4">
                  {info.custom_fields!.map((field) => (
                    <InputField
                      key={field.key}
                      label={field.label}
                      required={field.required}
                      error={fieldErrors[`custom_${field.key}`]}
                    >
                      {field.type === 'textarea' ? (
                        <textarea
                          value={(form.custom_answers[field.key] as string) ?? ''}
                          onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                      ) : field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={(form.custom_answers[field.key] as string) ?? ''}
                            onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                            className={`${inputClass} appearance-none pr-10`}
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(form.custom_answers[field.key] as boolean) ?? false}
                            onChange={(e) => setCustomAnswer(field.key, e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 accent-[#D4FF00]"
                          />
                          <span className="text-sm text-white/68">{field.label}</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={(form.custom_answers[field.key] as string) ?? ''}
                          onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </InputField>
                  ))}
                </div>
              </section>
            )}

            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.terms_accepted}
                  onChange={(e) => setField('terms_accepted', e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 accent-[#D4FF00]"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#f5f0e8]">
                    Confirmo que meus dados estao corretos e aceito os{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:text-[#D4FF00]">
                      Termos de Uso
                    </a>{' '}
                    e a{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:text-[#D4FF00]">
                      Politica de Privacidade
                    </a>
                    . <span className="text-[#D4FF00]">*</span>
                  </span>
                  <span className="text-[11px] text-white/36">
                    Suas informacoes serao usadas exclusivamente para gerenciamento operacional do evento.
                  </span>
                </div>
              </label>
              {fieldErrors.terms_accepted && <p className="mt-2 text-[11px] text-red-400">{fieldErrors.terms_accepted}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Confirmar meus dados
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-white/30">
              Este link e para quem ja foi chamado para trabalhar no evento.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
