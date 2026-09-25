import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Camera, CheckCircle2, HelpCircle, Loader2, Swords, X } from 'lucide-react'
import { InAppBrowserWarning } from '@/shared/components/ui/InAppBrowserWarning'

type PageState = 'loading' | 'form' | 'submitting' | 'success' | 'error'
type CornerColor = 'azul' | 'vermelho'

interface EventInfo {
  id: string
  name: string
  slug: string
  starts_at?: string | null
  venue_name?: string | null
}

interface CornerResult {
  full_name: string
  ok: boolean
  reason?: string
}

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-athlete-register`

// Quando o servidor esta fora, o cadastro nao pode parar. Fica guardado no
// proprio aparelho e sobe sozinho assim que o servidor volta.
const FILA_KEY = 'pulse-atletas-pendentes'

interface Pendente {
  id: string
  quando: string
  payload: Record<string, unknown>
}

function lerFila(): Pendente[] {
  try {
    const raw = localStorage.getItem(FILA_KEY)
    return raw ? (JSON.parse(raw) as Pendente[]) : []
  } catch {
    return []
  }
}

function gravarFila(itens: Pendente[]) {
  try {
    localStorage.setItem(FILA_KEY, JSON.stringify(itens))
  } catch {
    // aparelho sem espaco: nao da para fazer nada aqui, o aviso na tela cobre
  }
}

function enfileirar(payload: Record<string, unknown>): Pendente {
  const item: Pendente = {
    id: (crypto.randomUUID?.() ?? String(Date.now())),
    quando: new Date().toISOString(),
    payload,
  }
  gravarFila([...lerFila(), item])
  return item
}

// Sobe o que estiver guardado. Roda ao abrir a pagina e de tempos em tempos.
async function enviarFila(): Promise<number> {
  const itens = lerFila()
  if (itens.length === 0) return 0

  const restantes: Pendente[] = []
  let enviados = 0

  for (const item of itens) {
    try {
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })
      // 2xx entrou agora; 409 quer dizer que ja estava la. Nos dois casos, sai da fila.
      if (res.ok || res.status === 409) {
        enviados += 1
        continue
      }
      // 4xx de validacao nao adianta repetir
      if (res.status >= 400 && res.status < 500) {
        enviados += 1
        continue
      }
      restantes.push(item)
    } catch {
      restantes.push(item)
    }
  }

  gravarFila(restantes)
  return enviados
}

// Texto para a pessoa mandar para a producao, caso ela feche o navegador.
function resumoParaTexto(p: Record<string, unknown>): string {
  const c = (p.corners as Array<Record<string, string>> | undefined) ?? []
  return [
    'CADASTRO DE ATLETA - BSB FIGHT 7',
    '',
    `Nome: ${p.full_name ?? ''}`,
    `CPF: ${p.cpf ?? ''}`,
    `Lado: ${p.corner_color ?? ''}`,
    `Nascimento: ${p.birth_date ?? ''}`,
    `Equipe: ${p.gym ?? '-'}`,
    `Categoria: ${p.weight_class ?? '-'}  Peso: ${p.weight_kg ?? '-'}`,
    `Cartel: ${p.record_wins ?? 0}-${p.record_losses ?? 0}-${p.record_draws ?? 0}`,
    `WhatsApp: ${p.phone ?? '-'}`,
    `E-mail: ${p.email ?? '-'}`,
    `Cidade: ${p.city ?? '-'}/${p.state ?? '-'}`,
    `Instagram: ${p.instagram ?? '-'}`,
    '',
    'CORNERS:',
    ...(c.length
      ? c.map((x, i) => `${i + 1}. ${x.full_name} - CPF ${x.cpf}${x.gym ? ' - ' + x.gym : ''}`)
      : ['nenhum']),
  ].join('\n')
}
const ACCENT = '#D4FF00'
const MAX_PHOTO_EDGE = 1280

const CORNER_COLORS: Array<{ value: CornerColor; label: string; hex: string }> = [
  { value: 'azul', label: 'Azul', hex: '#2E6BFF' },
  { value: 'vermelho', label: 'Vermelho', hex: '#FF3B3B' },
]

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

function HelpTip({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`O que é ${title}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-white/48 transition-all hover:border-[#D4FF00]/50 hover:text-[#D4FF00]"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          role="note"
          className="absolute left-0 top-7 z-20 w-[min(19rem,75vw)] rounded-[14px] border border-white/12 bg-[#12161f] p-4 text-left shadow-[0_18px_44px_rgba(0,0,0,0.6)]"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4FF00]">
              {title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="-mt-0.5 text-white/40 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
          <span className="mt-2 block text-[12.5px] font-normal normal-case leading-5 tracking-normal text-white/76">
            {children}
          </span>
        </span>
      )}
    </span>
  )
}

function Field({
  label,
  required,
  hint,
  error,
  help,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  help?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#f5f0e8]">
        <span>
          {label}
          {required && <span className="ml-1 text-[#D4FF00]">*</span>}
        </span>
        {help && <HelpTip title={label}>{help}</HelpTip>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] leading-relaxed text-white/42">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="pt-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
        {children}
      </h2>
      {note && <p className="mt-1.5 text-[12px] leading-5 text-white/48">{note}</p>}
    </div>
  )
}

const emptyCorner = { full_name: '', cpf: '', gym: '' }

export function AthleteJoinPage() {
  const eventSlug = getEventSlug()

  const [pageState, setPageState] = useState<PageState>('loading')
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
  })
  const [cornerColor, setCornerColor] = useState<CornerColor | ''>('')
  const [corners, setCorners] = useState([{ ...emptyCorner }, { ...emptyCorner }])

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [result, setResult] = useState<{ corners: CornerResult[]; color?: CornerColor } | null>(null)
  const [pendente, setPendente] = useState<Record<string, unknown> | null>(null)
  const [jaCadastrado, setJaCadastrado] = useState<{ nome?: string; tipo?: string; recado?: string } | null>(null)
  const [servidorFora, setServidorFora] = useState(false)
  const [copiado, setCopiado] = useState(false)

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    clearError(key)
  }

  function clearError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function setCorner(index: number, key: keyof typeof emptyCorner, value: string) {
    setCorners((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)))
    clearError(`corner_${index}_${key}`)
  }

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
        setPageState('form')
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        // Servidor fora nao pode impedir o cadastro. Abre o formulario assim
        // mesmo e guarda no aparelho; sobe sozinho quando o servidor voltar.
        setServidorFora(true)
        setEvent({ id: '', name: 'BSB FIGHT 7', slug: eventSlug })
        setPageState('form')
      })
    return () => controller.abort()
  }, [eventSlug])

  // Sobe o que ficou guardado, ao abrir e de tempos em tempos.
  useEffect(() => {
    let vivo = true
    const tentar = async () => {
      const n = await enviarFila()
      if (vivo && n > 0) setServidorFora(false)
    }
    void tentar()
    const timer = window.setInterval(() => { void tentar() }, 30_000)
    return () => { vivo = false; window.clearInterval(timer) }
  }, [])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBusy(true)
    clearError('photo')
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
    if (!photoPreview) errors.photo = 'A foto do atleta é obrigatória.'
    if (!form.birth_date) errors.birth_date = 'Informe a data de nascimento.'
    if (!cornerColor) errors.corner_color = 'Escolha o seu lado: azul ou vermelho.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido.'

    const cpfs = [form.cpf.replace(/\D/g, '')]
    corners.forEach((corner, index) => {
      const preenchido = corner.full_name.trim() || corner.cpf.replace(/\D/g, '')
      if (!preenchido) return
      if (corner.full_name.trim().split(/\s+/).length < 2) {
        errors[`corner_${index}_full_name`] = 'Informe nome e sobrenome.'
      }
      const digits = corner.cpf.replace(/\D/g, '')
      if (!isValidCpf(corner.cpf)) {
        errors[`corner_${index}_cpf`] = 'CPF inválido.'
      } else if (cpfs.includes(digits)) {
        errors[`corner_${index}_cpf`] = 'Este CPF já foi usado neste cadastro.'
      } else {
        cpfs.push(digits)
      }
    })

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      setErrorMessage('Confira os campos destacados.')
      return
    }

    setPageState('submitting')
    setErrorMessage('')

    const payload = {
      event_slug: eventSlug,
      kind: 'athlete',
      full_name: form.full_name.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      corner_color: cornerColor,
      photo_base64: photoPreview,
      birth_date: form.birth_date,
      phone: form.phone.replace(/\D/g, '') || undefined,
      email: form.email.trim().toLowerCase() || undefined,
      weight_class: form.weight_class || undefined,
      weight_kg: form.weight_kg || undefined,
      record_wins: form.record_wins || undefined,
      record_losses: form.record_losses || undefined,
      record_draws: form.record_draws || undefined,
      gym: form.gym.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state || undefined,
      instagram: form.instagram.trim() || undefined,
      sherdog_url: form.sherdog_url.trim() || undefined,
      corners: corners
        .filter((c) => c.full_name.trim() || c.cpf.replace(/\D/g, ''))
        .map((c) => ({
          full_name: c.full_name.trim(),
          cpf: c.cpf.replace(/\D/g, ''),
          gym: c.gym.trim() || undefined,
        })),
    }

    try {
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // Servidor fora do ar (502/503/504/522) ou sem resposta: guarda e sobe depois.
      if (res.status >= 500) {
        enfileirar(payload)
        setPendente(payload)
        setPageState('success')
        return
      }

      const body = await res.json().catch(() => ({}))

      // Ja cadastrado nao e falha: e informacao. Mandar 'tente novamente' faz a
      // pessoa repetir o envio varias vezes sem entender o que houve.
      if (res.status === 409 && body?.already_registered) {
        setJaCadastrado({ nome: body?.full_name, tipo: body?.kind, recado: body?.message })
        setPageState('success')
        return
      }

      if (!res.ok) {
        // O motivo vem em 'error' ou em 'message', depende do caso. Sem isso a
        // pessoa so ve um texto generico e nao sabe o que corrigir.
        setErrorMessage(
          body?.error ?? body?.message ?? 'Não foi possível concluir o cadastro. Tente novamente.',
        )
        setPageState('form')
        return
      }

      setResult({ corners: body.corners ?? [], color: body.corner_color })
      setPageState('success')
    } catch {
      // Sem rede ou servidor mudo: mesma coisa, o cadastro nao se perde.
      enfileirar(payload)
      setPendente(payload)
      setPageState('success')
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

  if (pageState === 'success' && jaCadastrado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-10 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border"
          style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}1a` }}
        >
          <CheckCircle2 className="h-9 w-9" style={{ color: ACCENT }} />
        </div>

        <h1 className="font-display text-[2.4rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
          Você já está cadastrado
        </h1>

        <p className="max-w-md text-base leading-7 text-white/72">
          {jaCadastrado.nome ? (
            <><strong className="text-[#f5f0e8]">{jaCadastrado.nome}</strong>. </>
          ) : null}
          {jaCadastrado.recado ?? 'O seu cadastro já foi feito.'} Não precisa cadastrar de novo.
        </p>

        <div className="max-w-md rounded-[18px] border border-amber-400/25 bg-amber-400/[0.07] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">No dia do evento</p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Leve um documento com foto. No credenciamento você e seus corners retiram a camisa e as
            pulseiras.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/72">
            Precisa corrigir algum dado ou incluir corner? Fale com a produção, não tente cadastrar
            outra vez.
          </p>
        </div>
      </div>
    )
  }

  if (pageState === 'success' && pendente) {
    const texto = resumoParaTexto(pendente)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
          <CheckCircle2 className="h-9 w-9 text-amber-300" />
        </div>

        <h1 className="font-display text-[2.2rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
          Cadastro recebido
        </h1>

        <p className="max-w-md text-base leading-7 text-white/72">
          Seus dados ficaram <strong className="text-[#f5f0e8]">guardados neste celular</strong> porque o
          sistema está fora do ar neste momento. Assim que ele voltar, o cadastro entra sozinho.
        </p>

        <div className="max-w-md rounded-[18px] border border-amber-400/25 bg-amber-400/[0.07] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Importante</p>
          <p className="mt-2 text-sm leading-6 text-white/78">
            <strong className="text-[#f5f0e8]">Não feche esta aba.</strong> Deixe ela aberta que o envio
            acontece sozinho. Se precisar fechar, mande seus dados para a produção pelo botão abaixo.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3">
          <button
            type="button"
            onClick={async () => {
              const dados = { title: 'Cadastro BSB FIGHT 7', text: texto }
              if (navigator.share) {
                try { await navigator.share(dados); return } catch { /* segue para copiar */ }
              }
              try {
                await navigator.clipboard.writeText(texto)
                setCopiado(true)
                setTimeout(() => setCopiado(false), 2500)
              } catch { /* nada a fazer */ }
            }}
            className="rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black"
            style={{ background: ACCENT }}
          >
            {copiado ? 'Dados copiados' : 'Enviar meus dados para a produção'}
          </button>

          <button
            type="button"
            onClick={async () => {
              const n = await enviarFila()
              if (n > 0) window.location.reload()
            }}
            className="rounded-full border border-white/15 px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/64"
          >
            Tentar enviar agora
          </button>
        </div>

        <p className="max-w-md text-[12px] leading-5 text-white/42">
          A sua foto fica guardada aqui e sobe junto. Se você mandar os dados pelo botão acima, a foto
          é tirada de novo no credenciamento.
        </p>
      </div>
    )
  }

  if (pageState === 'success') {
    const ok = result?.corners.filter((c) => c.ok) ?? []
    const falhou = result?.corners.filter((c) => !c.ok) ?? []
    const cor = CORNER_COLORS.find((c) => c.value === result?.color)

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#06070a] px-5 py-10 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border"
          style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}1a` }}
        >
          <CheckCircle2 className="h-9 w-9" style={{ color: ACCENT }} />
        </div>

        <h1 className="font-display text-[2.4rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
          Cadastro confirmado
        </h1>

        {cor && (
          <span
            className="inline-flex items-center gap-2.5 rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#f5f0e8]"
            style={{ borderColor: cor.hex, background: `${cor.hex}26` }}
          >
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: cor.hex }} />
            Corner {cor.label}
          </span>
        )}

        <div className="w-full max-w-md rounded-[18px] border border-white/10 bg-white/[0.04] p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
            Corners cadastrados
          </p>
          {ok.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-white/56">
              Você não cadastrou nenhum corner. Fale com a produção se precisar incluir.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ok.map((c) => (
                <li key={c.full_name} className="flex items-center gap-2 text-sm text-[#f5f0e8]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                  {c.full_name}
                </li>
              ))}
            </ul>
          )}
          {falhou.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {falhou.map((c) => (
                <li key={c.full_name} className="flex items-start gap-2 text-sm text-amber-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {c.full_name || 'Corner'}: {c.reason}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="max-w-md rounded-[18px] border border-amber-400/25 bg-amber-400/[0.07] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">No dia do evento</p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Leve um documento com foto. No credenciamento você e seus corners retiram a camisa e as pulseiras.
          </p>
        </div>
      </div>
    )
  }

  const submitting = pageState === 'submitting'

  return (
    <div className="min-h-screen bg-[#06070a] px-5 py-10">
      <div className="mx-auto max-w-lg">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ background: `${ACCENT}1a`, color: ACCENT }}
        >
          <Swords className="h-3.5 w-3.5" /> Cadastro de atleta
        </span>

        <h1 className="mt-5 font-display text-[2.6rem] uppercase leading-[1.14] tracking-wide text-[#f5f0e8]">
          {event?.name}
        </h1>
        {(eventDate || event?.venue_name) && (
          <p className="mt-3 text-sm text-white/52">
            {[eventDate, event?.venue_name].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="mt-5 text-sm leading-6 text-white/64">
          Preencha os seus dados e, no fim, cadastre os seus corners. São no máximo 2.
        </p>

        <p className="mt-3 flex items-center gap-2 text-[12px] leading-5 text-white/48">
          <span className="text-[#D4FF00]">*</span>
          campo obrigatório. Onde tiver
          <HelpTip title="Ajuda">
            Toque neste sinal em qualquer campo para entender o que está sendo pedido e por quê.
          </HelpTip>
          você toca e vê o que significa.
        </p>

        <div className="mt-6" />
        <InAppBrowserWarning acao="enviar sua foto" />

        {servidorFora && (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-amber-400/30 bg-amber-400/[0.08] p-4 text-left">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-100">
              O sistema está instável agora. <strong>Pode preencher normalmente:</strong> seus dados ficam
              guardados neste celular e entram sozinhos assim que voltar.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-red-500/25 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm leading-6 text-red-200">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <SectionTitle>Seus dados</SectionTitle>

          <Field label="Nome completo" required error={fieldErrors.full_name}>
            <input
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Seu nome completo"
              className={inputClass}
              required
            />
          </Field>

          <Field
            label="CPF"
            required
            error={fieldErrors.cpf}
            help={
              <>
                Usamos o CPF para emitir a sua credencial e conferir a sua identidade no
                credenciamento. <strong className="text-[#f5f0e8]">Leve o documento com foto no dia</strong>,
                porque o nome e o CPF precisam bater com o que você preencheu aqui.
              </>
            }
          >
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
            label="Seu lado na luta"
            required
            hint="Seus corners entram no mesmo lado."
            error={fieldErrors.corner_color}
            help={
              <>
                Em cada luta um atleta fica no canto <strong className="text-[#f5f0e8]">azul</strong> e o
                outro no <strong className="text-[#f5f0e8]">vermelho</strong>. Marque o seu. Se ainda não
                souber, escolha agora e fale com a produção no dia para ajustar.
              </>
            }
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
                      clearError('corner_color')
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
                      style={{ background: option.hex, boxShadow: active ? `0 0 12px ${option.hex}` : 'none' }}
                    />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field
            label="Sua foto"
            required
            hint="Rosto visível, sem boné e sem óculos escuros."
            error={fieldErrors.photo}
            help={
              <>
                É a foto que vai na sua credencial e é o que a produção usa para te identificar na
                entrada. Pode tirar na hora pelo celular. Não precisa ser foto de documento.
              </>
            }
          >
            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} className="hidden" />
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
                alt="Sua foto"
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

          <Field label="Equipe / academia" error={fieldErrors.gym}>
            <input
              value={form.gym}
              onChange={(e) => setField('gym', e.target.value)}
              placeholder="Nome da equipe"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Categoria">
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
            <Field label="Peso (kg)">
              <input
                value={form.weight_kg}
                onChange={(e) => setField('weight_kg', e.target.value.replace(/[^\d.,]/g, '').slice(0, 6))}
                placeholder="70,5"
                inputMode="decimal"
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Cartel"
            hint="Vitórias, derrotas e empates."
            help={
              <>
                É o seu retrospecto na carreira, na ordem
                <strong className="text-[#f5f0e8]"> vitórias, derrotas e empates</strong>. Quem tem 12
                vitórias, 3 derrotas e 1 empate preenche 12, 3 e 1. Se estiver começando, pode deixar
                em branco.
              </>
            }
          >
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
            <Field label="Cidade">
              <input
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Brasília"
                className={inputClass}
              />
            </Field>
            <Field label="UF">
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

          <Field label="Instagram" hint="Só o @ ou o link do perfil.">
            <input
              value={form.instagram}
              onChange={(e) => setField('instagram', e.target.value)}
              placeholder="@seuperfil"
              autoCapitalize="none"
              className={inputClass}
            />
          </Field>

          <Field
            label="Sherdog"
            hint="Link do seu perfil, se tiver."
            help={
              <>
                O Sherdog é o site que registra o cartel oficial dos lutadores. Se você tem perfil por
                lá, cole o link. Serve para a produção conferir o seu retrospecto. Se não tiver, deixe
                em branco.
              </>
            }
          >
            <input
              value={form.sherdog_url}
              onChange={(e) => setField('sherdog_url', e.target.value)}
              placeholder="sherdog.com/fighter/..."
              autoCapitalize="none"
              className={inputClass}
            />
          </Field>

          <div className="flex items-center gap-2 pt-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              Seus corners
            </h2>
            <HelpTip title="Seus corners">
              São as pessoas que ficam no seu canto durante a luta, geralmente o treinador e um
              auxiliar. <strong className="text-[#f5f0e8]">No máximo 2 por atleta.</strong> Quem você
              cadastrar aqui entra no evento e retira camisa e pulseira no credenciamento. Eles não
              precisam preencher nada, você cadastra por eles.
            </HelpTip>
          </div>
          <p className="-mt-3 text-[12px] leading-5 text-white/48">
            No máximo 2. Se tiver só um, deixe o segundo em branco.
          </p>

          {corners.map((corner, index) => (
            <div key={index} className="space-y-4 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Corner {index + 1}
              </p>

              <Field label="Nome completo" error={fieldErrors[`corner_${index}_full_name`]}>
                <input
                  value={corner.full_name}
                  onChange={(e) => setCorner(index, 'full_name', e.target.value)}
                  placeholder="Nome do corner"
                  className={inputClass}
                />
              </Field>

              <Field
                label="CPF"
                error={fieldErrors[`corner_${index}_cpf`]}
                help={
                  <>
                    O CPF do corner, não o seu. É com ele que a produção emite a credencial dessa
                    pessoa. Ela também precisa levar documento com foto no dia.
                  </>
                }
              >
                <input
                  value={corner.cpf}
                  onChange={(e) => setCorner(index, 'cpf', formatCpfInput(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  className={inputClass}
                />
              </Field>

              <Field label="Academia" hint="Opcional. Em branco, usa a sua equipe.">
                <input
                  value={corner.gym}
                  onChange={(e) => setCorner(index, 'gym', e.target.value)}
                  placeholder="Academia do corner"
                  className={inputClass}
                />
              </Field>
            </div>
          ))}

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
