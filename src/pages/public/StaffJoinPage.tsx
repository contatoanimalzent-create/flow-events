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

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface InviteInfo {
  event_name: string
  event_slug?: string | null
  event_date?: string | null
  event_location?: string | null
  role?: string | null
  team?: string | null
  shift?: string | null
  shift_starts_at?: string | null
  shift_ends_at?: string | null
  organization_name?: string | null
}

type PageState = 'loading' | 'valid' | 'error' | 'success' | 'already_registered'

interface FormData {
  full_name: string
  cpf: string
  role_title: string
  pix_key: string
  shift_start: string
  shift_end: string
  shift_label: string
  terms_accepted: boolean
}

interface StaffRoleOption {
  value: string
  label: string
  scheduleLines: string[]
  shiftLabel: string
}

function getPointUrl(inviteInfo?: InviteInfo | null, token?: string | null): string {
  const slug = inviteInfo?.event_slug || (token === 'bsb5' ? 'bsb-fight-5' : token)
  return `https://pulse.animalzgroup.com/staff/ponto/${slug || 'bsb-fight-5'}`
}

function isAlreadyRegisteredResponse(body: Record<string, unknown>): boolean {
  const text = String(body?.error ?? body?.message ?? body?.code ?? '').toLowerCase()
  return (
    text.includes('jÃ¡ estÃ¡ cadastrado') ||
    text.includes('ja esta cadastrado') ||
    text.includes('already')
  )
}

function formatCpfInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const standardEventStaffSchedule = [
  'Quinta, 28/05 - 08h Ã s 16h',
  'Quinta, 28/05 - 16h Ã s 00h',
  'Sexta, 29/05 - 08h Ã s 16h',
  'Sexta, 29/05 - 16h Ã s 00h',
  'SÃ¡bado, 30/05 - 16h Ã s 00h',
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
    value: 'ProduÃ§Ã£o',
    label: 'ProduÃ§Ã£o',
    scheduleLines: standardEventStaffSchedule,
    shiftLabel: standardEventStaffSchedule.join(' | '),
  },
  {
    value: 'Posto mÃ©dico e ambulÃ¢ncia',
    label: 'Posto mÃ©dico e ambulÃ¢ncia',
    scheduleLines: [
      'Quinta, 28/05 - 09h Ã s 21h30',
      'Sexta, 29/05 - 09h Ã s 15h',
      'SÃ¡bado, 30/05 - 17h Ã s 00h',
    ],
    shiftLabel: 'Quinta, 28/05 - 09h Ã s 21h30 | Sexta, 29/05 - 09h Ã s 15h | SÃ¡bado, 30/05 - 17h Ã s 00h',
  },
  {
    value: 'SeguranÃ§a eventual',
    label: 'SeguranÃ§a eventual',
    scheduleLines: standardEventStaffSchedule,
    shiftLabel: standardEventStaffSchedule.join(' | '),
  },
  {
    value: 'SeguranÃ§a patrimonial',
    label: 'SeguranÃ§a patrimonial',
    scheduleLines: [
      'Quinta, 28/05 - 07h Ã s 19h',
      'Quinta, 28/05 - 19h Ã s 07h',
      'Sexta, 29/05 - 07h Ã s 19h',
      'Sexta, 29/05 - 19h Ã s 07h',
      'SÃ¡bado, 30/05 - 07h Ã s 19h',
      'SÃ¡bado, 30/05 - 19h Ã s 07h',
    ],
    shiftLabel: 'Quinta, 28/05 - 07h Ã s 19h | Quinta, 28/05 - 19h Ã s 07h | Sexta, 29/05 - 07h Ã s 19h | Sexta, 29/05 - 19h Ã s 07h | SÃ¡bado, 30/05 - 07h Ã s 19h | SÃ¡bado, 30/05 - 19h Ã s 07h',
  },
]

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function StaffJoinPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData | string, string>>>({})

  const [form, setForm] = useState<FormData>({
    full_name: '',
    cpf: '',
    role_title: '',
    pix_key: '',
    shift_start: '',
    shift_end: '',
    shift_label: '',
    terms_accepted: false,
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
      setErrorMessage('Link de convite invÃ¡lido ou expirado.')
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
          setErrorMessage(body?.message ?? 'Este convite Ã© invÃ¡lido, expirou ou jÃ¡ atingiu o limite de vagas.')
          setPageState('error')
          return
        }

        const data = await res.json()
        setInviteInfo({
          event_name: data.event_name ?? data.event?.name ?? 'BSB FIGHT 5',
          event_slug: data.event_slug ?? data.event?.slug ?? null,
          event_date: data.event_date ?? data.event?.starts_at ?? null,
          event_location: data.event_location ?? data.event?.venue_name ?? null,
          role: data.role ?? data.invite?.role_type ?? null,
          team: data.team?.name ?? data.team ?? null,
          shift: data.shift?.name ?? data.shift ?? null,
          shift_starts_at: data.shift_starts_at ?? data.shift?.starts_at ?? null,
          shift_ends_at: data.shift_ends_at ?? data.shift?.ends_at ?? null,
          organization_name: data.organization_name ?? null,
        })
        setPageState('valid')
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return
        setErrorMessage('Erro ao carregar o convite. Verifique sua conexÃ£o e tente novamente.')
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

  function validate(): boolean {
    const errors: Partial<Record<string, string>> = {}

    if (!form.full_name.trim()) errors.full_name = 'Nome completo Ã© obrigatÃ³rio.'
    const cpfDigits = form.cpf.replace(/\D/g, '')

    if (!form.cpf.trim()) errors.cpf = 'CPF Ã© obrigatÃ³rio.'
    else if (cpfDigits.length !== 11) errors.cpf = 'CPF invÃ¡lido.'
    if (!form.pix_key.trim()) errors.pix_key = 'Chave PIX Ã© obrigatÃ³ria.'
    if (!form.terms_accepted) errors.terms_accepted = 'VocÃª deve aceitar os termos para continuar.'

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
        document_number: form.cpf.replace(/\D/g, '') || undefined,
        role_title: 'Staff',
        pix_key: form.pix_key.trim() || undefined,
        terms_accepted: true,
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
      setErrorMessage('Erro de conexÃ£o. Verifique sua internet e tente novamente.')
      setPageState('error')
    } finally {
      setSubmitting(false)
    }
  }

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Error state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Link invÃ¡lido
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/56">{errorMessage}</p>
        </div>
        <a
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Voltar ao inÃ­cio
        </a>
      </div>
    )
  }

  // â”€â”€ Success state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (pageState === 'already_registered') {
    const pontoUrl = getPointUrl(inviteInfo, token)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Cadastro jÃ¡ confirmado
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Seus dados jÃ¡ estÃ£o no evento. Agora use o link de ponto somente quando estiver no local.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/48">
            O ponto deve ser batido todos os dias do evento.
          </p>
        </div>
        <a
          href={pontoUrl}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-[#e2ff3d]"
        >
          Bater ponto
        </a>
        <a
          href={pontoUrl}
          className="break-all text-sm font-medium text-[#D4FF00] underline underline-offset-4"
        >
          {pontoUrl}
        </a>
      </div>
    )
  }

  if (pageState === 'success') {
    const pontoUrl = getPointUrl(inviteInfo, token)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Dados confirmados!
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Cadastro concluido. No dia do evento, use o botao abaixo para acessar seu ponto rapidamente.
          </p>
        </div>
        <a
          href={pontoUrl}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-[#e2ff3d]"
        >
          Acessar meu ponto
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(pontoUrl)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
        >
          Copiar link do ponto
        </button>
        {inviteInfo && (
          <div className="mt-1 rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#D4FF00]/80">Evento</p>
            <p className="mt-1 text-base font-semibold text-[#f5f0e8]">{inviteInfo.event_name}</p>
            {inviteInfo.role && <p className="mt-1 text-sm text-white/52">{inviteInfo.role}</p>}
          </div>
        )}

        <div className="w-full max-w-md space-y-3">
          <a
            href={pontoUrl}
            className="block w-full rounded-2xl bg-[#D4FF00] px-6 py-5 text-base font-bold uppercase tracking-[0.14em] text-[#06070a] transition-all hover:-translate-y-0.5 hover:bg-[#c8f200] hover:shadow-[0_12px_36px_rgba(212,255,0,0.24)] active:scale-[0.98]"
          >
            ðŸ‘‰ Bater meu ponto agora
          </a>
          <p className="text-xs text-white/50 break-all">
            ou copie o link: <span className="text-white/70">{pontoUrl}</span>
          </p>
        </div>

        <div className="mt-2 max-w-md rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 px-5 py-4 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">âš ï¸ AtenÃ§Ã£o</p>
          <p className="mt-2 text-sm leading-6 text-amber-100">
            O ponto <strong>SÃ“ funciona quando vocÃª estiver dentro do local do evento</strong>. Ative GPS, cÃ¢mera e notificaÃ§Ãµes no seu celular. O sistema bloqueia o registro se vocÃª estiver longe.
          </p>
        </div>

        <p className="max-w-md text-xs leading-6 text-white/40">
          VocÃª tambÃ©m recebeu o link por e-mail e WhatsApp. Bata o ponto todos os dias que trabalhar e mostre o comprovante no credenciamento para retirar sua pulseira.
        </p>
      </div>
    )
  }

  // â”€â”€ Valid form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">FunÃ§Ã£o</p>
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
            Campos marcados com <span className="text-[#D4FF00]">*</span> sÃ£o obrigatÃ³rios.
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
                  {false && (
                  <InputField label="FunÃ§Ã£o no evento" required error={fieldErrors.role_title}>
                    <div className="relative">
                      <select
                        value={form.role_title}
                        onChange={(e) => setRole(e.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                        style={{ colorScheme: 'dark' }}
                        required
                      >
                        <option value="" className="bg-[#12161f] text-white/50">Selecione sua funÃ§Ã£o</option>
                        {STAFF_ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value} className="bg-[#12161f] text-[#f5f0e8]">
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    </div>
                  </InputField>
                  )}

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

                  <InputField label="Chave PIX" required hint="CPF, telefone, e-mail ou chave aleatÃ³ria" error={fieldErrors.pix_key}>
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

                {false && (
                <InputField
                  label="HorÃ¡rio do trabalho"
                  required
                  hint="O horÃ¡rio Ã© definido pela funÃ§Ã£o escolhida e nÃ£o pode ser alterado aqui."
                  error={fieldErrors.shift_label}
                >
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
                    {selectedRole ? (
                      <div className="space-y-2">
                        {selectedRole?.scheduleLines.map((line) => (
                          <div key={line} className="flex items-center gap-2 text-sm text-[#f5f0e8]">
                            <Clock className="h-4 w-4 shrink-0 text-[#D4FF00]" />
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/42">Selecione uma funÃ§Ã£o para ver o horÃ¡rio.</p>
                    )}
                  </div>
                </InputField>
                )}

              </div>
            </section>

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
                      PolÃ­tica de Privacidade
                    </a>
                    . <span className="text-[#D4FF00]">*</span>
                  </span>
                  <span className="text-[11px] leading-relaxed text-white/36">
                    Em conformidade com a LGPD (Lei 13.709/2018), autorizo a coleta e tratamento dos dados informados neste cadastro exclusivamente para gestao operacional, credenciamento, controle de presenca e pagamento relacionados ao evento.
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
              Depois da confirmaÃ§Ã£o, o ponto digital sÃ³ registra presenÃ§a quando vocÃª estiver no local do evento.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
