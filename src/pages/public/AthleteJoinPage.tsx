import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Swords,
  Users,
} from 'lucide-react'

type Kind = 'athlete' | 'corner'
type PageState = 'loading' | 'choose' | 'form' | 'submitting' | 'success' | 'error'

interface EventInfo {
  id: string
  name: string
  slug: string
  starts_at?: string | null
  venue_name?: string | null
}

type CornerColor = 'azul' | 'vermelho'

interface AthleteLookup {
  full_name: string
  gym: string | null
  corners_left: number
  corners_used: number
  corner_color: CornerColor | null
}

const CORNER_COLORS: Array<{ value: CornerColor; label: string; hex: string }> = [
  { value: 'azul', label: 'Corner azul', hex: '#2E6BFF' },
  { value: 'vermelho', label: 'Corner vermelho', hex: '#FF3B3B' },
]

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-athlete-register`
const ACCENT = '#D4FF00'
const MAX_PHOTO_EDGE = 1280

const WEIGHT_CLASSES = [
  'Peso palha',
  'Peso mosca',
  'Peso galo',
  'Peso pena',
  'Peso leve',
  'Peso meio-médio',
  'Peso médio',
  'Peso meio-pesado',
  'Peso pesado',
  'Casadinha / peso combinado',
]

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR',
  'PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

function getEventSlug(): string {
  const match = window.location.pathname.match(/\/atletas\/([^/?#]+)/)
  return match ? match[1] : ''
}

function formatCpfInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhoneInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let digit = ((sum * 10) % 11) % 10
  if (Number(cpf[9]) !== digit) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  digit = ((sum * 10) % 11) % 10
  return Number(cpf[10]) === digit
}

// O celular manda foto de 4 MB sem pensar duas vezes. Reduz antes de enviar.
function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'))
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

const inputClass =
  'w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4FF00]/10'

function Field({
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
      {hint && !error && <p className="text-[11px] leading-relaxed text-white/42">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

export function AthleteJoinPage() {
  const eventSlug = getEventSlug()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [kind, setKind] = useState<Kind>('athlete')
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    email: '',
    birth_date: '',
    weight_class: '',
    weight_kg: '',
    record_wins: '',
    record_losses: '',
    record_draws: '',
    gym: '',
    city: '',
    state: '',
    instagram: '',
    sherdog_url: '',
    athlete_code: '',
  })
  const [cornerColor, setCornerColor] = useState<CornerColor | ''>('')

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [lookup, setLookup] = useState<AthleteLookup | null>(null)
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle')

  const [result, setResult] = useState<{ code?: string; athleteName?: string; cornerColor?: CornerColor } | null>(null)
  const [copied, setCopied] = useState(false)

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // ── Carrega o evento ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventSlug) {
      setErrorMessage('Link inválido.')
      setPageState('error')
      return
    }
    const controller = new AbortController()
    fetch(`${EDGE_FN_URL}?event_slug=${encodeURIComponent(eventSlug)}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error ?? 'Evento não encontrado.')
        setEvent(body.event)
        setPageState('choose')
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setErrorMessage(err.message || 'Não foi possível carregar o evento.')
        setPageState('error')
      })
    return () => controller.abort()
  }, [eventSlug])

  // ── Consulta o codigo do atleta enquanto o corner digita ──────────────────
  const rawCode = form.athlete_code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  useEffect(() => {
    if (kind !== 'corner' || rawCode.length !== 6) {
      setLookup(null)
      setLookupState('idle')
      return
    }
    const controller = new AbortController()
    setLookupState('loading')
    const timer = setTimeout(() => {
      fetch(`${EDGE_FN_URL}?event_slug=${encodeURIComponent(eventSlug)}&athlete_code=${rawCode}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          const body = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(body?.error ?? 'Código não encontrado.')
          setLookup({
            full_name: body.athlete.full_name,
            gym: body.athlete.gym ?? null,
            corners_left: body.corners_left,
            corners_used: body.corners_used,
            corner_color: body.corner_color ?? null,
          })
          setLookupState('ok')
          // O outro corner do mesmo atleta ja escolheu o lado: sugere o mesmo.
          if (body.corner_color) setCornerColor(body.corner_color)
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return
          setLookup(null)
          setLookupState('fail')
        })
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [kind, rawCode, eventSlug])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBusy(true)
    setFieldErrors((prev) => ({ ...prev, photo: '' }))
    try {
      setPhotoPreview(await shrinkImage(file))
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, photo: (err as Error).message }))
    } finally {
      setPhotoBusy(false)
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (form.full_name.trim().split(/\s+/).length < 2) errors.full_name = 'Informe nome e sobrenome.'
    if (!isValidCpf(form.cpf)) errors.cpf = 'CPF inválido.'

    if (kind === 'athlete') {
      if (!photoPreview) errors.photo = 'A foto do atleta é obrigatória.'
      if (!form.birth_date) errors.birth_date = 'Informe a data de nascimento.'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido.'
    } else {
      if (rawCode.length !== 6) errors.athlete_code = 'O código tem 6 caracteres.'
      else if (lookupState === 'fail') errors.athlete_code = 'Código não encontrado.'
      else if (lookup && lookup.corners_left === 0) errors.athlete_code = 'Este atleta já tem 2 corners.'
      if (!cornerColor) errors.corner_color = 'Escolha o lado: azul ou vermelho.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setPageState('submitting')
    setErrorMessage('')

    const payload: Record<string, unknown> = {
      event_slug: eventSlug,
      kind,
      full_name: form.full_name.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      gym: form.gym.trim() || undefined,
    }

    if (kind === 'athlete') {
      Object.assign(payload, {
        phone: form.phone.replace(/\D/g, '') || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        birth_date: form.birth_date,
        weight_class: form.weight_class || undefined,
        weight_kg: form.weight_kg || undefined,
        record_wins: form.record_wins || undefined,
        record_losses: form.record_losses || undefined,
        record_draws: form.record_draws || undefined,
        city: form.city.trim() || undefined,
        state: form.state || undefined,
        instagram: form.instagram.trim() || undefined,
        sherdog_url: form.sherdog_url.trim() || undefined,
        photo_base64: photoPreview,
      })
    } else {
      payload.athlete_code = rawCode
      payload.corner_color = cornerColor
    }

    try {
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))

      if (res.status === 409 && body?.already_registered) {
        setResult({ code: body.athlete_code, athleteName: body.full_name })
        setErrorMessage('Este CPF já está cadastrado neste evento.')
        setPageState('success')
        return
      }

      if (!res.ok) {
        setErrorMessage(body?.error ?? 'Não foi possível concluir o cadastro. Tente novamente.')
        setPageState('form')
        return
      }

      setResult({
        code: body.athlete_code,
        athleteName: body.athlete_name,
        cornerColor: body.corner_color ?? undefined,
      })
      setPageState('success')
    } catch {
      setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.')
      setPageState('form')
    }
  }

  const eventDate = useMemo(() => {
    if (!event?.starts_at) return null
    try {
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        .format(new Date(event.starts_at))
    } catch {
      return null
    }
  }, [event?.starts_at])

  // ── Estados simples ───────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#06070a] px-5 text-center">
        <AlertCircle className="h-14 w-14 text-red-400" />
        <h1 className="font-display text-3xl uppercase tracking-wide text-[#f5f0e8]">Link indisponível</h1>
        <p className="max-w-sm text-sm leading-6 text-white/64">{errorMessage}</p>
      </div>
    )
  }

  if (pageState === 'success') {
    const isAthlete = Boolean(result?.code)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-10 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border"
          style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}1a` }}
        >
          <CheckCircle2 className="h-9 w-9" style={{ color: ACCENT }} />
        </div>

        <h1 className="font-display text-[2.4rem] uppercase leading-none tracking-wide text-[#f5f0e8]">
          {errorMessage ? 'Já cadastrado' : 'Cadastro confirmado'}
        </h1>

        {errorMessage && <p className="max-w-md text-sm leading-6 text-amber-300">{errorMessage}</p>}

        {isAthlete ? (
          <div className="w-full max-w-md space-y-4">
            <p className="text-base leading-7 text-white/68">
              Guarde o código abaixo. Seus corners precisam dele para se cadastrar.
              Cada atleta pode ter no máximo <strong className="text-[#f5f0e8]">2 corners</strong>.
            </p>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                Código do atleta
              </p>
              <p
                className="mt-2 font-mono text-[2.6rem] font-bold leading-none tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                {result?.code}
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(result?.code ?? '')
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/64 transition-all hover:border-white/20 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copiado' : 'Copiar código'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md space-y-4">
            {result?.cornerColor && (
              <span
                className="inline-flex items-center gap-2.5 rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#f5f0e8]"
                style={{
                  borderColor: result.cornerColor === 'azul' ? '#2E6BFF' : '#FF3B3B',
                  background: result.cornerColor === 'azul' ? '#2E6BFF26' : '#FF3B3B26',
                }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: result.cornerColor === 'azul' ? '#2E6BFF' : '#FF3B3B' }}
                />
                Corner {result.cornerColor}
              </span>
            )}
            <p className="text-base leading-7 text-white/68">
              Cadastro de corner confirmado
              {result?.athleteName ? (
                <>
                  {' '}para <strong className="text-[#f5f0e8]">{result.athleteName}</strong>
                </>
              ) : null}
              .
            </p>
          </div>
        )}

        <div className="max-w-md rounded-[18px] border border-amber-400/25 bg-amber-400/[0.07] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">No dia do evento</p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Leve um documento com foto. No credenciamento você retira a camisa e as pulseiras.
          </p>
        </div>
      </div>
    )
  }

  // ── Escolha do tipo ───────────────────────────────────────────────────────

  if (pageState === 'choose') {
    return (
      <div className="min-h-screen bg-[#06070a] px-5 py-12">
        <div className="mx-auto max-w-lg text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ background: `${ACCENT}1a`, color: ACCENT }}
          >
            <Swords className="h-3.5 w-3.5" /> Atletas e corners
          </span>
          <h1 className="mt-5 font-display text-[3rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
            {event?.name}
          </h1>
          {(eventDate || event?.venue_name) && (
            <p className="mt-3 text-sm text-white/52">
              {[eventDate, event?.venue_name].filter(Boolean).join(' · ')}
            </p>
          )}

          <p className="mt-8 text-base leading-7 text-white/68">Quem está se cadastrando?</p>

          <div className="mt-6 grid gap-4">
            <button
              onClick={() => {
                setKind('athlete')
                setPageState('form')
              }}
              className="group flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-left transition-all hover:border-[#D4FF00]/40 hover:bg-white/[0.07]"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}1a` }}
              >
                <Swords className="h-5 w-5" style={{ color: ACCENT }} />
              </span>
              <span>
                <span className="block text-base font-bold uppercase tracking-[0.1em] text-[#f5f0e8]">
                  Sou atleta
                </span>
                <span className="mt-1 block text-[13px] leading-5 text-white/56">
                  Cadastro completo e foto. Você recebe um código para passar aos seus corners.
                </span>
              </span>
            </button>

            <button
              onClick={() => {
                setKind('corner')
                setPageState('form')
              }}
              className="group flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-left transition-all hover:border-[#D4FF00]/40 hover:bg-white/[0.07]"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}1a` }}
              >
                <Users className="h-5 w-5" style={{ color: ACCENT }} />
              </span>
              <span>
                <span className="block text-base font-bold uppercase tracking-[0.1em] text-[#f5f0e8]">
                  Sou corner
                </span>
                <span className="mt-1 block text-[13px] leading-5 text-white/56">
                  Peça o código ao seu atleta. São no máximo 2 corners por atleta.
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulario ────────────────────────────────────────────────────────────

  const submitting = pageState === 'submitting'

  return (
    <div className="min-h-screen bg-[#06070a] px-5 py-10">
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => {
            setPageState('choose')
            setErrorMessage('')
            setFieldErrors({})
          }}
          className="text-xs font-medium uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white/70"
        >
          Voltar
        </button>

        <h1 className="mt-4 font-display text-[2.4rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
          {kind === 'athlete' ? 'Cadastro de atleta' : 'Cadastro de corner'}
        </h1>
        <p className="mt-2 text-sm text-white/52">{event?.name}</p>

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-red-500/25 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm leading-6 text-red-200">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {kind === 'corner' && (
            <Field
              label="Código do atleta"
              required
              hint="Seis caracteres, fornecidos pelo atleta no cadastro dele."
              error={fieldErrors.athlete_code}
            >
              <input
                value={form.athlete_code}
                onChange={(e) => setField('athlete_code', e.target.value.toUpperCase().slice(0, 8))}
                placeholder="ABC123"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className={`${inputClass} font-mono text-lg tracking-[0.3em]`}
                required
              />
              {lookupState === 'loading' && (
                <p className="flex items-center gap-2 text-[11px] text-white/42">
                  <Loader2 className="h-3 w-3 animate-spin" /> Conferindo o código...
                </p>
              )}
              {lookupState === 'ok' && lookup && (
                <div
                  className="flex items-start gap-2 rounded-[12px] border p-3"
                  style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0f` }}
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                  <p className="text-[13px] leading-5 text-white/78">
                    Atleta: <strong className="text-[#f5f0e8]">{lookup.full_name}</strong>
                    {lookup.gym ? ` · ${lookup.gym}` : ''}
                    <br />
                    {lookup.corners_left > 0
                      ? `${lookup.corners_left === 1 ? 'Resta 1 vaga' : 'Restam 2 vagas'} de corner.`
                      : 'Este atleta já tem 2 corners cadastrados.'}
                  </p>
                </div>
              )}
            </Field>
          )}

          {kind === 'corner' && (
            <Field
              label="Lado do corner"
              required
              hint={
                lookup?.corner_color
                  ? `O outro corner deste atleta se cadastrou como ${lookup.corner_color}.`
                  : 'O mesmo lado do seu atleta na luta.'
              }
              error={fieldErrors.corner_color}
            >
              <div className="grid grid-cols-2 gap-3">
                {CORNER_COLORS.map((option) => {
                  const active = cornerColor === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCornerColor(option.value)
                        setFieldErrors((prev) => {
                          if (!prev.corner_color) return prev
                          const next = { ...prev }
                          delete next.corner_color
                          return next
                        })
                      }}
                      aria-pressed={active}
                      className="flex items-center justify-center gap-2.5 rounded-[14px] border px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-all"
                      style={{
                        borderColor: active ? option.hex : 'rgba(255,255,255,0.10)',
                        background: active ? `${option.hex}26` : 'rgba(255,255,255,0.05)',
                        color: active ? '#f5f0e8' : 'rgba(245,240,232,0.56)',
                        boxShadow: active ? `0 0 0 1px ${option.hex}` : 'none',
                      }}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{
                          background: option.hex,
                          boxShadow: active ? `0 0 12px ${option.hex}` : 'none',
                        }}
                      />
                      {option.value === 'azul' ? 'Azul' : 'Vermelho'}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          <Field label="Nome completo" required error={fieldErrors.full_name}>
            <input
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Seu nome completo"
              className={inputClass}
              required
            />
          </Field>

          <Field label="CPF" required error={fieldErrors.cpf}>
            <input
              value={form.cpf}
              onChange={(e) => setField('cpf', formatCpfInput(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              className={inputClass}
              required
            />
          </Field>

          <Field
            label={kind === 'athlete' ? 'Equipe / academia' : 'Academia'}
            hint={kind === 'corner' ? 'Opcional.' : undefined}
            error={fieldErrors.gym}
          >
            <input
              value={form.gym}
              onChange={(e) => setField('gym', e.target.value)}
              placeholder="Nome da equipe"
              className={inputClass}
            />
          </Field>

          {kind === 'athlete' && (
            <>
              <Field label="Foto do atleta" required hint="Rosto visível, sem boné e sem óculos escuros." error={fieldErrors.photo}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy}
                  className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-sm font-semibold text-white/64 transition-all hover:border-[#D4FF00]/40 hover:text-white disabled:opacity-50"
                >
                  {photoBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Preparando a foto...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" /> {photoPreview ? 'Trocar foto' : 'Tirar ou escolher foto'}
                    </>
                  )}
                </button>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Foto do atleta"
                    className="mt-1 h-40 w-40 rounded-[14px] border border-white/10 object-cover"
                  />
                )}
              </Field>

              <Field label="Data de nascimento" required error={fieldErrors.birth_date}>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setField('birth_date', e.target.value)}
                  className={inputClass}
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="WhatsApp" error={fieldErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setField('phone', formatPhoneInput(e.target.value))}
                    placeholder="(61) 90000-0000"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </Field>
                <Field label="E-mail" error={fieldErrors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="seu@email.com"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Categoria" error={fieldErrors.weight_class}>
                  <select
                    value={form.weight_class}
                    onChange={(e) => setField('weight_class', e.target.value)}
                    className={inputClass}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#12161f]">Selecione</option>
                    {WEIGHT_CLASSES.map((w) => (
                      <option key={w} value={w} className="bg-[#12161f]">{w}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Peso (kg)" error={fieldErrors.weight_kg}>
                  <input
                    value={form.weight_kg}
                    onChange={(e) => setField('weight_kg', e.target.value.replace(/[^\d.,]/g, '').slice(0, 6))}
                    placeholder="70,5"
                    inputMode="decimal"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Cartel" hint="Vitórias, derrotas e empates.">
                <div className="grid grid-cols-3 gap-3">
                  {([
                    ['record_wins', 'V'],
                    ['record_losses', 'D'],
                    ['record_draws', 'E'],
                  ] as const).map(([key, letter]) => (
                    <div key={key} className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/32">
                        {letter}
                      </span>
                      <input
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="0"
                        inputMode="numeric"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_120px]">
                <Field label="Cidade" error={fieldErrors.city}>
                  <input
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="Brasília"
                    className={inputClass}
                  />
                </Field>
                <Field label="UF" error={fieldErrors.state}>
                  <select
                    value={form.state}
                    onChange={(e) => setField('state', e.target.value)}
                    className={inputClass}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#12161f]">UF</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf} className="bg-[#12161f]">{uf}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Instagram" hint="Só o @ ou o link do perfil." error={fieldErrors.instagram}>
                <input
                  value={form.instagram}
                  onChange={(e) => setField('instagram', e.target.value)}
                  placeholder="@seuperfil"
                  autoCapitalize="none"
                  className={inputClass}
                />
              </Field>

              <Field label="Sherdog" hint="Link do seu perfil, se tiver." error={fieldErrors.sherdog_url}>
                <input
                  value={form.sherdog_url}
                  onChange={(e) => setField('sherdog_url', e.target.value)}
                  placeholder="sherdog.com/fighter/..."
                  autoCapitalize="none"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          <button
            type="submit"
            disabled={submitting || photoBusy}
            className="flex w-full items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              'Confirmar cadastro'
            )}
          </button>

          <p className="pb-4 text-center text-[11px] leading-5 text-white/38">
            Em conformidade com a LGPD (Lei 13.709/2018), os dados informados são usados apenas para
            credenciamento, controle de acesso e produção deste evento.
          </p>
        </form>
      </div>
    </div>
  )
}
