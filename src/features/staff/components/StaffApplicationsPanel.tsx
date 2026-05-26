import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  Sliders,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waitlisted'

export interface StaffApplication {
  id: string
  event_id: string
  organization_id?: string | null
  invite_link_id?: string | null
  role_type: string
  team_id?: string | null
  shift_id?: string | null
  full_name: string
  email: string
  phone?: string | null
  document_number?: string | null
  birth_date?: string | null
  bio?: string | null
  experience?: string | null
  t_shirt_size?: string | null
  custom_field_answers?: Record<string, unknown> | null
  terms_accepted: boolean
  terms_accepted_at?: string | null
  status: ApplicationStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at?: string | null
}

type TabFilter = 'all' | ApplicationStatus

interface Props {
  eventId: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pendente',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: Clock,
  },
  approved: {
    label: 'Aprovado',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Reprovado',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: UserX,
  },
  waitlisted: {
    label: 'Lista de espera',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
    icon: AlertCircle,
  },
}

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'approved', label: 'Aprovados' },
  { key: 'rejected', label: 'Reprovados' },
  { key: 'waitlisted', label: 'Lista de espera' },
]

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-credential`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTimePT(iso?: string | null): string {
  if (!iso) return '-'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ─── Notes modal ─────────────────────────────────────────────────────────────

interface NotesModalProps {
  title: string
  initialValue: string
  onConfirm: (notes: string) => void
  onClose: () => void
  loading?: boolean
}

function NotesModal({ title, initialValue, onConfirm, onClose, loading }: NotesModalProps) {
  const [notes, setNotes] = useState(initialValue)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-[2rem] border border-white/8 bg-[#12161f] p-6 sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-[#f5f0e8]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/48 transition-all hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione uma observação (opcional)..."
          rows={4}
          className="mt-4 w-full resize-none rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-[#D4FF00]/40 focus:ring-2 focus:ring-[#D4FF00]/10"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-medium text-white/64 transition-all hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes)}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-2.5 text-sm font-bold text-[#06070a] transition-all hover:bg-[#c8f200] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Credential QR display ────────────────────────────────────────────────────

function CredentialQR({ app }: { app: StaffApplication }) {
  if (app.status !== 'approved' || !app.reviewed_at) return null
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-[#0057E7]/15 bg-[#0057E7]/5 p-5">
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-[#4285F4]" />
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4285F4]">
          Aprovado
        </span>
      </div>
      <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
        <Shield className="h-12 w-12 text-[#4285F4]/40" />
      </div>
      {app.reviewed_at && (
        <p className="text-[11px] text-white/38">
          Aprovado em {formatDateTimePT(app.reviewed_at)}
        </p>
      )}
    </div>
  )
}

// ─── Application card ─────────────────────────────────────────────────────────

interface CardProps {
  app: StaffApplication
  expanded: boolean
  onToggle: () => void
  onApprove: () => void
  onReject: () => void
  onRequestAdjustment: () => void
  actionLoading: string | null
}

function ApplicationCard({
  app,
  expanded,
  onToggle,
  onApprove,
  onReject,
  onRequestAdjustment,
  actionLoading,
}: CardProps) {
  const config = STATUS_CONFIG[app.status]
  const StatusIcon = config.icon
  const isActioning = actionLoading === app.id

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        expanded ? 'border-white/12 bg-[#181d27]' : 'border-white/8 bg-[#12161f] hover:border-white/12',
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d2330] text-sm font-bold uppercase text-[#f5f0e8]">
          {app.full_name.charAt(0)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#f5f0e8]">{app.full_name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/42">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {app.email}
            </span>
            {app.role_type && <span className="text-white/24">·</span>}
            {app.role_type && <span>{app.role_type}</span>}
          </div>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 sm:flex',
            config.bg,
          )}
        >
          <StatusIcon className={cn('h-3 w-3', config.color)} />
          <span className={cn('text-[11px] font-semibold', config.color)}>{config.label}</span>
        </div>

        {/* Date */}
        <span className="hidden shrink-0 text-[11px] text-white/30 lg:block">
          {formatDateTimePT(app.created_at)}
        </span>

        {/* Expand icon */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-white/38" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-white/38" />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4">
          {/* Mobile status */}
          <div className="mb-4 flex sm:hidden">
            <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1', config.bg)}>
              <StatusIcon className={cn('h-3 w-3', config.color)} />
              <span className={cn('text-[11px] font-semibold', config.color)}>{config.label}</span>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Telefone" value={app.phone ?? '-'} icon={<Phone className="h-3.5 w-3.5" />} />
            {app.document_number && <DetailItem label="CPF / Documento" value={app.document_number} />}
            {app.t_shirt_size && <DetailItem label="Tamanho camiseta" value={app.t_shirt_size} />}
            {app.role_type && <DetailItem label="Função" value={app.role_type} />}
            {app.experience && <DetailItem label="Experiência" value={app.experience} />}
          </div>

          {/* Bio */}
          {app.bio && (
            <div className="mt-4">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/38">Experiência</p>
              <p className="text-sm leading-6 text-white/68">{app.bio}</p>
            </div>
          )}

          {/* Custom answers */}
          {app.custom_field_answers && Object.keys(app.custom_field_answers).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/38">Respostas adicionais</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(app.custom_field_answers).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/36">{key}</p>
                    <p className="mt-0.5 text-sm text-[#f5f0e8]">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer notes */}
          {app.bio && (
            <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400">Observação</p>
              </div>
              <p className="mt-1.5 text-sm text-white/68">{app.bio}</p>
            </div>
          )}

          {/* Credential */}
          <CredentialQR app={app} />

          {/* Actions */}
          {app.status !== 'approved' && app.status !== 'rejected' && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onApprove}
                disabled={isActioning}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 disabled:opacity-50"
              >
                {isActioning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                Aprovar
              </button>

              <button
                type="button"
                onClick={onReject}
                disabled={isActioning}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" />
                Reprovar
              </button>

              <button
                type="button"
                onClick={onRequestAdjustment}
                disabled={isActioning}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/20 disabled:opacity-50"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Pedir ajuste
              </button>
            </div>
          )}

          {/* Re-evaluate if already rejected */}
          {app.status === 'rejected' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onApprove}
                disabled={isActioning}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 disabled:opacity-50"
              >
                {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                Reavaliar e aprovar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/36">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#f5f0e8]">
        {icon}
        {value}
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StaffApplicationsPanel({ eventId }: Props) {
  const [applications, setApplications] = useState<StaffApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal state
  const [notesModal, setNotesModal] = useState<{
    open: boolean
    appId: string
    title: string
    newStatus: ApplicationStatus
    initialNotes: string
    loading: boolean
  } | null>(null)

  // Fetch applications
  async function fetchApplications() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('staff_applications')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setApplications((data as StaffApplication[]) ?? [])
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao carregar inscrições.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) void fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  // Filter
  const filtered = applications.filter((app) => {
    const matchesTab = tab === 'all' || app.status === tab
    const matchesSearch =
      !search ||
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Tab counts
  const counts = applications.reduce<Partial<Record<TabFilter, number>>>(
    (acc, app) => {
      acc.all = (acc.all ?? 0) + 1
      acc[app.status] = (acc[app.status] ?? 0) + 1
      return acc
    },
    { all: 0 },
  )

  // Update status helper
  async function updateStatus(
    appId: string,
    newStatus: ApplicationStatus,
    notes?: string,
  ): Promise<void> {
    const { error: updateError } = await supabase
      .from('staff_applications')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId)

    if (updateError) throw updateError

    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: newStatus, reviewed_at: new Date().toISOString() }
          : a,
      ),
    )
  }

  // Approve, calls generate-credential edge function
  async function handleApprove(app: StaffApplication) {
    setActionLoading(app.id)
    try {
      // 1. Update status
      await updateStatus(app.id, 'approved')

      // 2. Generate credential
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ application_id: app.id, event_id: eventId }),
      })

      if (res.ok) {
        const credData = await res.json().catch(() => null)
        if (credData?.qr_url) {
          setApplications((prev) =>
            prev.map((a) =>
              a.id === app.id
                ? {
                    ...a,
                    status: 'approved' as const,
                    reviewed_at: new Date().toISOString(),
                  }
                : a,
            ),
          )
        }
      }
      // Not a fatal error if credential generation fails, status is already approved
    } catch (err: unknown) {
      console.error('Error approving application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Open notes modal for reject / adjustment
  function openNotesModal(app: StaffApplication, newStatus: ApplicationStatus, title: string) {
    setNotesModal({
      open: true,
      appId: app.id,
      title,
      newStatus,
      initialNotes: '',
      loading: false,
    })
  }

  async function handleNotesConfirm(notes: string) {
    if (!notesModal) return
    setNotesModal((prev) => prev ? { ...prev, loading: true } : null)
    setActionLoading(notesModal.appId)
    try {
      await updateStatus(notesModal.appId, notesModal.newStatus, notes || undefined)
      setNotesModal(null)
    } catch (err: unknown) {
      console.error('Error updating status:', err)
      setNotesModal((prev) => prev ? { ...prev, loading: false } : null)
    } finally {
      setActionLoading(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#D4FF00]" />
          <h2 className="text-base font-semibold text-[#f5f0e8]">Inscrições de Staff</h2>
          {!loading && (
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/52">
              {applications.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void fetchApplications()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/52 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0
          const isActive = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all',
                isActive
                  ? 'bg-[#D4FF00] text-[#06070a]'
                  : 'border border-white/8 bg-white/[0.03] text-white/52 hover:border-white/14 hover:text-white',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive ? 'bg-black/20 text-[#06070a]' : 'bg-white/8 text-white/52',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-[14px] border border-white/8 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-[#f5f0e8] placeholder-white/28 outline-none transition-all focus:border-white/16 focus:ring-2 focus:ring-white/5"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4FF00]" />
            <p className="text-sm text-white/42">Carregando inscrições...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/8 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-white/52">{error}</p>
          <button
            type="button"
            onClick={() => void fetchApplications()}
            className="mt-1 text-xs font-medium text-red-400 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
            <UserX className="h-6 w-6 text-white/28" />
          </div>
          <p className="text-sm font-medium text-white/42">
            {search || tab !== 'all' ? 'Nenhuma inscrição encontrada.' : 'Nenhuma inscrição recebida ainda.'}
          </p>
          {(search || tab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setTab('all')
              }}
              className="mt-1 text-xs text-white/36 underline hover:text-white"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              expanded={expandedId === app.id}
              onToggle={() => setExpandedId((prev) => (prev === app.id ? null : app.id))}
              onApprove={() => void handleApprove(app)}
              onReject={() =>
                openNotesModal(app, 'rejected', `Reprovar, ${app.full_name}`)
              }
              onRequestAdjustment={() =>
                openNotesModal(app, 'waitlisted', `Mover para lista de espera, ${app.full_name}`)
              }
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Notes modal */}
      {notesModal?.open && (
        <NotesModal
          title={notesModal.title}
          initialValue={notesModal.initialNotes}
          onConfirm={(notes) => void handleNotesConfirm(notes)}
          onClose={() => setNotesModal(null)}
          loading={notesModal.loading}
        />
      )}
    </div>
  )
}
