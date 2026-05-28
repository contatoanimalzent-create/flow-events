import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Shield,
  Users,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

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

type PageState = 'loading' | 'valid' | 'error' | 'success' | 'already_registered'

type TShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

interface FormData {
  full_name: string
  email: string
  phone: string
  cpf: string
  role_title: string
  company: string
  pix_key: string
  shift_start: string
  shift_end: string
  shift_label: string
  tshirt_size: TShirtSize | ''
  bio: string
  emergency_contact_name: string
  emergency_contact_phone: string
  terms_accepted: boolean
  custom_answers: Record<string, string | boolean>
}

interface StaffRoleOption {
  value: string
  label: string
  scheduleLines: string[]
  shiftLabel: string
}

const BSB5_POINT_URL = 'https://pulse.animalzgroup.com/staff/ponto/bsb-fight-5'

function isAlreadyRegisteredResponse(body: Record<string, unknown>): boolean {
  const text = String(body?.error ?? body?.message ?? body?.code ?? '').toLowerCase()
  return (
    text.includes('já está cadastrado') ||
    text.includes('ja esta cadastrado') ||
    text.includes('already')
  )
}

function formatPhoneInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function formatCpfInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const standardEventStaffSchedule = [
  'Quinta, 28/05 - 08h às 16h',
  'Quinta, 28/05 - 16h às 00h',
  'Sexta, 29/05 - 08h às 16h',
  'Sexta, 29/05 - 16h às 00h',
  'Sábado, 30/05 - 16h às 00h',
]

const STAFF_ROLE_OPTIONS: StaffRoleOption[] = [
  {
    value: 'Credenciamento',
    label: 'Credenciamento',
    scheduleLines: standardEventStaffSchedule,
    shiftLabel: standardEventStaffSchedule.join(' | '),
  },
  {
    value: 'Limpeza e carregadores',
    label: 'Limpeza e carregadores',
    scheduleLines: standardEventStaffSchedule,
    shiftLabel: standardEventStaffSchedule.join(' | '),
  },
  {
    value: 'Posto médico e ambulância',
    label: 'Posto médico e ambulância',
    scheduleLines: [
      'Quinta, 28/05 - 09h às 21h30',
      'Sexta, 29/05 - 09h às 15h',
      'Sábado, 30/05 - 17h às 00h',
    ],
    shiftLabel: 'Quinta, 28/05 - 09h às 21h30 | Sexta, 29/05 - 09h às 15h | Sábado, 30/05 - 17h às 00h',
  },
  {
    value: 'Segurança eventual',
    label: 'Segurança eventual',
    scheduleLines: standardEventStaffSchedule,
    shiftLabel: standardEventStaffSchedule.join(' | '),
  },
  {
    value: 'Segurança patrimonial',
    label: 'Segurança patrimonial',
    scheduleLines: [
      'Quinta, 28/05 - 07h às 19h',
      'Quinta, 28/05 - 19h às 07h',
      'Sexta, 29/05 - 07h às 19h',
      'Sexta, 29/05 - 19h às 07h',
      'Sábado, 30/05 - 07h às 19h',
      'Sábado, 30/05 - 19h às 07h',
    ],
    shiftLabel: 'Quinta, 28/05 - 07h às 19h | Quinta, 28/05 - 19h às 07h | Sexta, 29/05 - 07h às 19h | Sexta, 29/05 - 19h às 07h | Sábado, 30/05 - 07h às 19h | Sábado, 30/05 - 19h às 07h',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  const pathMatch = window.location.pathname.match(/\/staff\/join\/([^/?#]+)/)
  if (pathMatch) return pathMatch[1]
  return new URLSearchParams(window.location.search).get('token')
}

function formatDatePT(iso?: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
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

// ─── Sub-components ──────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function StaffJoinPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData | string, string>>>({})

  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    role_title: '',
    company: '',
    pix_key: '',
    shift_start: '',
    shift_end: '',
    shift_label: '',
    tshirt_size: '',
    bio: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    terms_accepted: false,
    custom_answers: {},
  })

  const token = getToken()
  const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-staff-invite`
  const selectedRole = useMemo(
    () => STAFF_ROLE_OPTIONS.find((role) => role.value === form.role_title) ?? null,
    [form.role_title],
  )

  // Fetch invite on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage('Link de convite inválido ou expirado.')
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
          if (isAlreadyRegisteredResponse(body)) {
            setPageState('already_registered')
            return
          }
          setErrorMessage(body?.message ?? 'Este convite é inválido, expirou ou já atingiu o limite de vagas.')
          setPageState('error')
          return
        }

        const data = await res.json()
        setInviteInfo(data)
        setPageState('valid')
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return
        setErrorMessage('Erro ao carregar o convite. Verifique sua conexão e tente novamente.')
        setPageState('error')
      }
    }

    void fetchInvite()
    return () => controller.abort()
  }, [token, EDGE_FN_URL])

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function setRole(value: string) {
    const role = STAFF_ROLE_OPTIONS.find((item) => item.value === value)
    setForm((prev) => ({
      ...prev,
      role_title: value,
      shift_label: role?.shiftLabel ?? '',
      shift_start: '',
      shift_end: '',
    }))
    setFieldErrors((prev) => ({
      ...prev,
      role_title: undefined,
      shift_label: undefined,
      shift_start: undefined,
      shift_end: undefined,
    }))
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

    if (!form.full_name.trim()) errors.full_name = 'Nome completo é obrigatório.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'E-mail inválido.'
    const phoneDigits = form.phone.replace(/\D/g, '')
    const cpfDigits = form.cpf.replace(/\D/g, '')

    if (!form.phone.trim()) errors.phone = 'Telefone é obrigatório.'
    else if (phoneDigits.length < 10) errors.phone = 'Telefone inválido.'
    if (!form.cpf.trim()) errors.cpf = 'CPF é obrigatório.'
    else if (cpfDigits.length !== 11) errors.cpf = 'CPF inválido.'
    if (!form.role_title.trim()) errors.role_title = 'Função no evento é obrigatória.'
    if (!form.company.trim()) errors.company = 'Empresa é obrigatória.'
    if (!form.pix_key.trim()) errors.pix_key = 'Chave PIX é obrigatória.'
    if (!form.shift_label) errors.shift_label = 'Selecione a função para carregar o horário.'
    if (!form.tshirt_size) errors.tshirt_size = 'Tamanho da camiseta é obrigatório.'
    if (!form.bio.trim()) errors.bio = 'Experiência / apresentação é obrigatória.'
    if (!form.emergency_contact_name.trim()) errors.emergency_contact_name = 'Contato de emergência é obrigatório.'
    if (!form.emergency_contact_phone.trim()) errors.emergency_contact_phone = 'Telefone de emergência é obrigatório.'
    else if (form.emergency_contact_phone.replace(/\D/g, '').length < 10) {
      errors.emergency_contact_phone = 'Telefone de emergência inválido.'
    }
    if (!form.terms_accepted) errors.terms_accepted = 'Você deve aceitar os termos para continuar.'

    // All custom fields shown on this form are required for BSB5.
    for (const field of inviteInfo?.custom_fields ?? []) {
      const val = form.custom_answers[field.key]
      if (!val) errors[`custom_${field.key}`] = `${field.label} é obrigatório.`
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
        phone: form.phone.replace(/\D/g, ''),
        document_number: form.cpf.replace(/\D/g, '') || undefined,
        t_shirt_size: form.tshirt_size || undefined,
        role_title: form.role_title.trim() || undefined,
        company: form.company.trim(),
        pix_key: form.pix_key.trim() || undefined,
        shift_start: form.shift_start || undefined,
        shift_end: form.shift_end || undefined,
        shift_label: form.shift_label || undefined,
        bio: [
          form.bio.trim(),
          `Contato de emergência: ${form.emergency_contact_name.trim()} - ${form.emergency_contact_phone.trim()}`,
        ].join(' | '),
        terms_accepted: true,
        custom_field_answers: form.custom_answers,
      }

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (isAlreadyRegisteredResponse(body)) {
          setPageState('already_registered')
          return
        }
        setErrorMessage(body?.error ?? body?.message ?? 'Erro ao realizar cadastro. Tente novamente.')
        setPageState('error')
        return
      }

      setPageState('success')
    } catch {
      setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.')
      setPageState('error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
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

  // ── Error state ────────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Link inválido
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/56">{errorMessage}</p>
        </div>
        <a
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Voltar ao início
        </a>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (pageState === 'already_registered') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Cadastro já confirmado
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Seus dados já estão no BSB FIGHT 5. Agora use o link de ponto somente quando estiver no local do evento.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/48">
            O ponto deve ser batido todos os dias do evento.
          </p>
        </div>
        <a
          href={BSB5_POINT_URL}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-[#e2ff3d]"
        >
          Bater ponto
        </a>
        <a
          href={BSB5_POINT_URL}
          className="break-all text-sm font-medium text-[#D4FF00] underline underline-offset-4"
        >
          {BSB5_POINT_URL}
        </a>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Dados confirmados!
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Você receberá o link do ponto por e-mail e WhatsApp. Use o ponto somente quando estiver no local do evento.
          </p>
        </div>
        {inviteInfo && (
          <div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#D4FF00]/80">Evento</p>
            <p className="mt-1 text-base font-semibold text-[#f5f0e8]">{inviteInfo.event_name}</p>
            {inviteInfo.role && (
              <p className="mt-1 text-sm text-white/52">{inviteInfo.role}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Valid form state ───────────────────────────────────────────────────────
  const info = inviteInfo!
  const eventDate = formatDatePT(info.event_date)
  const shiftStart = formatTimePT(info.shift_starts_at)
  const shiftEnd = formatTimePT(info.shift_ends_at)

  return (
    <div className="min-h-screen bg-[#06070a]">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-[#0d1118] pb-8 pt-10">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-[60vw] -translate-x-1/2 rounded-full bg-[#D4FF00]/[0.04] blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-5">
          {/* Logo / brand */}
          <div className="mb-8 flex items-center gap-3">
            <img src="/logo.png" alt="Pulse" className="h-11 w-auto brightness-0 invert" />
            {info.organization_name && (
              <span className="text-xs uppercase tracking-[0.22em] text-white/40">
                {info.organization_name}
              </span>
            )}
          </div>

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-[#D4FF00]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4FF00]">
              Cadastro de Staff
            </span>
          </div>

          {/* Event name */}
          <h1 className="font-display text-[clamp(2.4rem,6vw,3.8rem)] uppercase leading-none tracking-tight text-[#f5f0e8]">
            {info.event_name}
          </h1>

          {/* Meta info */}
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

          {/* Role / Team / Shift chips */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {info.role && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">Função</p>
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

      {/* Form card */}
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-[2rem] border border-white/8 bg-[#12161f] p-6 sm:p-8">
          <h2 className="font-display text-[1.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Preencha seus dados
          </h2>
          <p className="mt-2 text-sm text-white/48">
            Campos marcados com <span className="text-[#D4FF00]">*</span> são obrigatórios.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
            {/* Personal info */}
            <section>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                Dados pessoais
              </h3>
              <div className="flex flex-col gap-4">
                <InputField label="Nome completo" required error={fieldErrors.full_name}>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setField('full_name', e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass}
                      autoComplete="name"
                      required
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
                      required
                    />
                  </InputField>

                  <InputField
                    label="Telefone / WhatsApp"
                    required
                    hint="Formato: (11) 91234-5678"
                    error={fieldErrors.phone}
                  >
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', formatPhoneInput(e.target.value))}
                      placeholder="(11) 91234-5678"
                      className={inputClass}
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={15}
                      required
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Função no evento" required error={fieldErrors.role_title}>
                    <div className="relative">
                      <select
                        value={form.role_title}
                        onChange={(e) => setRole(e.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                        style={{ colorScheme: 'dark' }}
                        required
                      >
                        <option value="" className="bg-[#12161f] text-white/50">Selecione sua função</option>
                        {STAFF_ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value} className="bg-[#12161f] text-[#f5f0e8]">
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    </div>
                  </InputField>

                  <InputField label="Empresa" required error={fieldErrors.company}>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setField('company', e.target.value)}
                      placeholder="Nome da empresa"
                      className={inputClass}
                      required
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="CPF" required error={fieldErrors.cpf}>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => setField('cpf', formatCpfInput(e.target.value))}
                      placeholder="000.000.000-00"
                      className={inputClass}
                      inputMode="numeric"
                      maxLength={14}
                      required
                    />
                  </InputField>

                  <InputField label="Chave PIX" required hint="CPF, telefone, e-mail ou chave aleatória" error={fieldErrors.pix_key}>
                    <input
                      type="text"
                      value={form.pix_key}
                      onChange={(e) => setField('pix_key', e.target.value)}
                      placeholder="Sua chave PIX para pagamento"
                      className={inputClass}
                      required
                    />
                  </InputField>
                </div>

                <InputField
                  label="Horário do trabalho"
                  required
                  hint="O horário é definido pela função escolhida e não pode ser alterado aqui."
                  error={fieldErrors.shift_label}
                >
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
                    {selectedRole ? (
                      <div className="space-y-2">
                        {selectedRole.scheduleLines.map((line) => (
                          <div key={line} className="flex items-center gap-2 text-sm text-[#f5f0e8]">
                            <Clock className="h-4 w-4 shrink-0 text-[#D4FF00]" />
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/42">Selecione uma função para ver o horário.</p>
                    )}
                  </div>
                </InputField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Tamanho da camiseta" required error={fieldErrors.tshirt_size}>
                    <div className="relative">
                      <select
                        value={form.tshirt_size}
                        onChange={(e) => setField('tshirt_size', e.target.value as TShirtSize | '')}
                        className={`${inputClass} appearance-none pr-10`}
                        style={{ colorScheme: 'dark' }}
                        required
                      >
                        <option value="" className="bg-[#12161f] text-white/50">Selecione o tamanho</option>
                        {(['PP', 'P', 'M', 'G', 'GG', 'XGG'] as TShirtSize[]).map((size) => (
                          <option key={size} value={size} className="bg-[#12161f] text-[#f5f0e8]">
                            {size}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    </div>
                  </InputField>
                </div>

                <InputField
                  label="Experiência / Apresentação"
                  error={fieldErrors.bio}
                  required
                >
                  <textarea
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    placeholder="Ex: já trabalhei em 5 festivais como coordenador de acesso..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                    required
                  />
                </InputField>
              </div>
            </section>

            {/* Emergency contact */}
            <section>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                Contato de emergência
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Nome" required error={fieldErrors.emergency_contact_name}>
                  <input
                    type="text"
                    value={form.emergency_contact_name}
                    onChange={(e) => setField('emergency_contact_name', e.target.value)}
                    placeholder="Nome do contato"
                    className={inputClass}
                    required
                  />
                </InputField>
                <InputField label="Telefone" required error={fieldErrors.emergency_contact_phone}>
                  <input
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={(e) => setField('emergency_contact_phone', formatPhoneInput(e.target.value))}
                    placeholder="(11) 91234-5678"
                    className={inputClass}
                    inputMode="numeric"
                    maxLength={15}
                    required
                  />
                </InputField>
              </div>
            </section>

            {/* Custom fields */}
            {(info.custom_fields?.length ?? 0) > 0 && (
              <section>
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                  Informações adicionais
                </h3>
                <div className="flex flex-col gap-4">
                  {info.custom_fields!.map((field) => (
                    <InputField
                      key={field.key}
                      label={field.label}
                      required
                      error={fieldErrors[`custom_${field.key}`]}
                    >
                      {field.type === 'textarea' ? (
                        <textarea
                          value={(form.custom_answers[field.key] as string) ?? ''}
                          onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                          required
                        />
                      ) : field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={(form.custom_answers[field.key] as string) ?? ''}
                            onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                            className={`${inputClass} appearance-none pr-10`}
                            style={{ colorScheme: 'dark' }}
                            required
                          >
                            <option value="" className="bg-[#12161f] text-white/50">Selecione...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#12161f] text-[#f5f0e8]">
                                {opt}
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
                            required
                          />
                          <span className="text-sm text-white/68">{field.label}</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={(form.custom_answers[field.key] as string) ?? ''}
                          onChange={(e) => setCustomAnswer(field.key, e.target.value)}
                          className={inputClass}
                          required
                        />
                      )}
                    </InputField>
                  ))}
                </div>
              </section>
            )}

            {/* Terms */}
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
                    Concordo com os{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:text-[#D4FF00]">
                      Termos de Uso
                    </a>{' '}
                    e{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:text-[#D4FF00]">
                      Política de Privacidade
                    </a>
                    . <span className="text-[#D4FF00]">*</span>
                  </span>
                  <span className="text-[11px] leading-relaxed text-white/36">
                    Em conformidade com a LGPD (Lei 13.709/2018), autorizo a coleta e tratamento dos meus dados pessoais, incluindo nome, CPF, telefone, e-mail e chave PIX, exclusivamente para fins de gestão operacional, credenciamento e pagamento relacionados ao evento. Autorizo também o uso da minha imagem (fotos de check-in/check-out) para fins de controle de presença e segurança do evento. Os dados serão armazenados de forma segura e não serão compartilhados com terceiros sem meu consentimento.
                  </span>
                </div>
              </label>
              {fieldErrors.terms_accepted && (
                <p className="mt-2 text-[11px] text-red-400">{fieldErrors.terms_accepted}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Confirmar dados
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-white/30">
              Depois da confirmação, o ponto digital só registra presença quando você estiver no local do evento.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
