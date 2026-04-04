import { useEffect, useState } from 'react'
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

type PageState = 'loading' | 'valid' | 'error' | 'success'

type TShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

interface FormData {
  full_name: string
  email: string
  phone: string
  cpf: string
  tshirt_size: TShirtSize | ''
  bio: string
  emergency_contact_name: string
  emergency_contact_phone: string
  terms_accepted: boolean
  custom_answers: Record<string, string | boolean>
}

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
    tshirt_size: '',
    bio: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    terms_accepted: false,
    custom_answers: {},
  })

  const token = getToken()
  const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-staff-invite`

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
    if (!form.phone.trim()) errors.phone = 'Telefone é obrigatório.'
    if (!form.terms_accepted) errors.terms_accepted = 'Você deve aceitar os termos para continuar.'

    // Custom required fields
    for (const field of inviteInfo?.custom_fields ?? []) {
      if (field.required) {
        const val = form.custom_answers[field.key]
        if (!val && val !== false) errors[`custom_${field.key}`] = `${field.label} é obrigatório.`
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
        phone: form.phone.trim(),
        cpf: form.cpf.trim() || undefined,
        tshirt_size: form.tshirt_size || undefined,
        bio: form.bio.trim() || undefined,
        emergency_contact_name: form.emergency_contact_name.trim() || undefined,
        emergency_contact_phone: form.emergency_contact_phone.trim() || undefined,
        custom_answers: form.custom_answers,
      }

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(body?.message ?? 'Erro ao enviar inscrição. Tente novamente.')
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
  if (pageState === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/10">
          <CheckCircle2 className="h-9 w-9 text-[#D4FF00]" />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-[2.8rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
            Inscrição recebida!
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68">
            Aguarde a aprovação da equipe. Você receberá uma confirmação por e-mail quando sua inscrição for revisada.
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
            <img src="/logo.png" alt="Flow Events" className="h-8 w-auto" />
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
              Convite para Staff
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
                  {info.shift ?? `${shiftStart} – ${shiftEnd}`}
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
            Preencha sua inscrição
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

                  <InputField
                    label="Telefone / WhatsApp"
                    required
                    hint="Formato: (11) 91234-5678"
                    error={fieldErrors.phone}
                  >
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="(11) 91234-5678"
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="CPF / Documento" hint="Opcional" error={fieldErrors.cpf}>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => setField('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className={inputClass}
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

                <InputField
                  label="Experiência / Apresentação"
                  hint="Opcional — Conte um pouco sobre sua experiência com eventos"
                  error={fieldErrors.bio}
                >
                  <textarea
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    placeholder="Ex: já trabalhei em 5 festivais como coordenador de acesso..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </InputField>
              </div>
            </section>

            {/* Emergency contact */}
            <section>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">
                Contato de emergência <span className="text-white/24">(opcional)</span>
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
                    onChange={(e) => setField('emergency_contact_phone', e.target.value)}
                    placeholder="(11) 91234-5678"
                    className={inputClass}
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
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
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
                  <span className="text-[11px] text-white/36">
                    Suas informações serão utilizadas exclusivamente para gerenciamento operacional do evento.
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
                  Enviar inscrição
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-white/30">
              Sua inscrição será analisada pela equipe do evento antes da confirmação.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
