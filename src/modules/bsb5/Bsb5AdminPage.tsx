import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppContext } from '@/core/context/app-context.store'
import { useEvents } from '@/core/events/events.store'
import { useOrganizations } from '@/core/organizations/organizations.store'
import { usePermissions } from '@/core/permissions/permissions.store'
import type { AppMode } from '@/core/context/app-context.types'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

const BSB5_SLUG = 'bsb-fight-5'
const BSB5_JOIN_LINK = 'https://pulse.animalzgroup.com/staff/join/bsb5'
const BSB5_PONTO_LINK = 'https://pulse.animalzgroup.com/staff/ponto/bsb-fight-5'
const ALLOWED_EMAIL = 'walteciojr@gmail.com'
const DEFAULT_MODES: AppMode[] = ['supervisor', 'operator', 'staff', 'promoter', 'attendee']
const BSB5_EVENT_DAYS = [
  { key: '2026-05-28', label: '28/05', title: 'Quinta' },
  { key: '2026-05-29', label: '29/05', title: 'Sexta' },
  { key: '2026-05-30', label: '30/05', title: 'Sábado' },
]
const BSB5_EVENT_START = '2026-05-28'
const BSB5_EVENT_END = '2026-05-30'

interface BsbEvent {
  id: string
  name: string
  slug: string
  starts_at: string
  ends_at: string | null
  status: string
  venue_name: string | null
  cover_url: string | null
  organization_id: string
}

interface BsbOrganization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  plan: string | null
}

interface BsbStaff {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  role_title: string | null
  area: string | null
  status: string | null
  is_active: boolean | null
  checked_in_at: string | null
  checked_out_at: string | null
  created_at: string | null
}

interface BsbCheckin {
  id: string
  staff_member_id: string | null
  type: string | null
  created_at: string | null
  photo_url: string | null
  latitude: number | null
  longitude: number | null
  accuracy_meters: number | null
}

function fullName(staff: Pick<BsbStaff, 'first_name' | 'last_name'>) {
  return [staff.first_name, staff.last_name].filter(Boolean).join(' ') || 'Sem nome'
}

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function saoPauloDateKey(value: string | null) {
  if (!value) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function todayBsbDay() {
  const today = saoPauloDateKey(new Date().toISOString())
  return today
}

function formatDayLabel(key: string) {
  const [, month, day] = key.split('-')
  return `${day}/${month}`
}

function dayPhase(key: string) {
  if (key < BSB5_EVENT_START) return 'Pré-evento'
  if (key > BSB5_EVENT_END) return 'Pós-evento'
  return 'Evento'
}

function dayTitle(key: string) {
  const known = BSB5_EVENT_DAYS.find((day) => day.key === key)
  if (known) return known.title
  return dayPhase(key)
}

function formatCoordinate(value: number | null) {
  return typeof value === 'number' ? value.toFixed(6) : '-'
}

function StatusBadge({ staff }: { staff: BsbStaff }) {
  const checkedIn = Boolean(staff.checked_in_at && !staff.checked_out_at)
  const label = checkedIn ? 'No evento' : staff.checked_out_at ? 'Saiu' : 'Aguardando'
  const tone = checkedIn
    ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
    : staff.checked_out_at
      ? 'border-blue-400/30 bg-blue-400/15 text-blue-200'
      : 'border-white/10 bg-white/5 text-slate-300'

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
}

export default function Bsb5AdminPage({ onNavigate }: PulsePageProps) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [event, setEvent] = useState<BsbEvent | null>(null)
  const [staff, setStaff] = useState<BsbStaff[]>([])
  const [checkins, setCheckins] = useState<BsbCheckin[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<BsbCheckin | null>(null)
  const [copyLabel, setCopyLabel] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(todayBsbDay)

  const setContext = useAppContext((s) => s.setContext)
  const setAvailableModes = useAppContext((s) => s.setAvailableModes)
  const setActiveEvent = useEvents((s) => s.setActive)
  const setActiveOrganization = useOrganizations((s) => s.setActive)
  const loadPermissions = usePermissions((s) => s.load)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      const email = user?.email?.toLowerCase() ?? ''

      if (!user || email !== ALLOWED_EMAIL) {
        setAllowed(false)
        return
      }

      setAllowed(true)

      const { data: eventRow, error: eventError } = await supabase
        .from('events')
        .select('id,name,slug,starts_at,ends_at,status,venue_name,cover_url,organization_id')
        .eq('slug', BSB5_SLUG)
        .single()

      if (eventError || !eventRow) throw eventError ?? new Error('Evento BSB5 não encontrado')

      const bsbEvent = eventRow as BsbEvent
      const { data: orgRow } = await supabase
        .from('organizations')
        .select('id,name,slug,logo_url,plan')
        .eq('id', bsbEvent.organization_id)
        .single()

      const org = orgRow as BsbOrganization | null

      if (org) {
        setActiveOrganization({
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo_url: org.logo_url,
          plan: org.plan ?? 'starter',
          userRole: 'super_admin',
          eventCount: 1,
        })
      }

      setActiveEvent({ ...bsbEvent, availableModes: DEFAULT_MODES })
      await loadPermissions(user.id, bsbEvent.organization_id, bsbEvent.id)
      const loadedModes = usePermissions.getState().availableModes
      const modes = loadedModes.length > 0 ? loadedModes : DEFAULT_MODES

      setAvailableModes(modes)
      setContext({
        organizationId: bsbEvent.organization_id,
        organizationName: org?.name ?? 'Animalz Events',
        organizationLogo: org?.logo_url ?? null,
        eventId: bsbEvent.id,
        eventName: bsbEvent.name,
        eventDate: bsbEvent.starts_at,
        eventCover: bsbEvent.cover_url,
        mode: 'supervisor',
      })

      const [staffResult, checkinResult] = await Promise.all([
        supabase
          .from('staff_members')
          .select('id,first_name,last_name,email,phone,role_title,area,status,is_active,checked_in_at,checked_out_at,created_at')
          .eq('event_id', bsbEvent.id)
          .eq('is_active', true)
          .order('first_name', { ascending: true }),
        supabase
          .from('staff_checkins')
          .select('id,staff_member_id,type,created_at,photo_url,latitude,longitude,accuracy_meters')
          .eq('event_id', bsbEvent.id)
          .order('created_at', { ascending: false })
          .limit(1000),
      ])

      setEvent(bsbEvent)
      setStaff((staffResult.data ?? []) as BsbStaff[])
      setCheckins((checkinResult.data ?? []) as BsbCheckin[])
    } finally {
      setLoading(false)
    }
  }, [loadPermissions, setActiveEvent, setActiveOrganization, setAvailableModes, setContext])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => {
    const inside = staff.filter((s) => s.checked_in_at && !s.checked_out_at).length
    return {
      total: staff.length,
      inside,
      waiting: staff.length - inside,
      checkins: checkins.length,
    }
  }, [checkins.length, staff])

  const statCards: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'Staff cadastrados', value: stats.total, Icon: Users },
    { label: 'Dentro agora', value: stats.inside, Icon: CheckCircle2 },
    { label: 'Aguardando ponto', value: stats.waiting, Icon: CalendarDays },
    { label: 'Registros recentes', value: stats.checkins, Icon: Clipboard },
  ]

  const staffByRole = useMemo(() => {
    const groups = new Map<string, BsbStaff[]>()
    staff.forEach((member) => {
      const role = member.role_title?.trim() || 'Funcao nao informada'
      const list = groups.get(role) ?? []
      list.push(member)
      groups.set(role, list)
    })

    return Array.from(groups.entries())
      .map(([role, members]) => ({
        role,
        members: members.sort((a, b) => fullName(a).localeCompare(fullName(b), 'pt-BR')),
      }))
      .sort((a, b) => a.role.localeCompare(b.role, 'pt-BR'))
  }, [staff])

  const checkinStaffNames = useMemo(() => {
    const names = new Map<string, string>()
    staff.forEach((s) => names.set(s.id, fullName(s)))
    return names
  }, [staff])

  const checkinsByDay = useMemo(() => {
    const grouped = new Map<string, BsbCheckin[]>()
    BSB5_EVENT_DAYS.forEach((day) => grouped.set(day.key, []))
    checkins.forEach((entry) => {
      const key = saoPauloDateKey(entry.created_at)
      if (!key) return
      const list = grouped.get(key) ?? []
      list.push(entry)
      grouped.set(key, list)
    })
    return grouped
  }, [checkins])

  const dayOptions = useMemo(() => {
    const keys = new Set<string>(BSB5_EVENT_DAYS.map((day) => day.key))
    checkins.forEach((entry) => {
      const key = saoPauloDateKey(entry.created_at)
      if (key) keys.add(key)
    })
    return Array.from(keys).sort().map((key) => ({
      key,
      label: formatDayLabel(key),
      title: dayTitle(key),
      phase: dayPhase(key),
    }))
  }, [checkins])

  useEffect(() => {
    if (dayOptions.length > 0 && !dayOptions.some((day) => day.key === selectedDay)) {
      setSelectedDay(dayOptions[0].key)
    }
  }, [dayOptions, selectedDay])

  const selectedDayCheckins = checkinsByDay.get(selectedDay) ?? []
  const selectedDayEntries = selectedDayCheckins.filter((entry) => entry.type !== 'checkout')
  const selectedDayExits = selectedDayCheckins.filter((entry) => entry.type === 'checkout')
  const selectedDayStaffIds = new Set(selectedDayEntries.map((entry) => entry.staff_member_id).filter(Boolean))
  const selectedDayMissing = Math.max(staff.length - selectedDayStaffIds.size, 0)

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text)
    setCopyLabel(label)
    window.setTimeout(() => setCopyLabel(null), 1600)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] text-white">
        <Loader2 className="h-7 w-7 animate-spin text-[#D4FF00]" />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#06070a] px-6 text-center text-white">
        <ShieldAlert className="mb-4 h-10 w-10 text-red-300" />
        <h1 className="text-xl font-bold">Acesso exclusivo</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Este painel direto do BSB FIGHT 5 está liberado somente para {ALLOWED_EMAIL}.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06070a] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          {event?.cover_url && (
            <div className="h-44 bg-black sm:h-64">
              <img src={event.cover_url} alt={event.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D4FF00]">Painel direto</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{event?.name ?? 'BSB FIGHT 5'}</h1>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> 28, 29 e 30 de maio</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Centro Olímpico da Estrutural, Brasília - DF</span>
                </div>
              </div>
              <button
                onClick={load}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-4">
          {statCards.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Icon className="mb-3 h-5 w-5 text-[#D4FF00]" />
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => onNavigate('/pulse/supervisor/team-live')} className="rounded-2xl bg-[#D4FF00] px-4 py-4 text-left font-bold text-black">
            Ver equipe ao vivo
          </button>
          <button onClick={() => onNavigate('/pulse/supervisor/summary')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Resumo do evento
          </button>
          <button onClick={() => copy(BSB5_JOIN_LINK, 'cadastro')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Copiar link de cadastro
          </button>
          <button onClick={() => copy(BSB5_PONTO_LINK, 'ponto')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Copiar link do ponto
          </button>
        </section>

        {copyLabel && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Link de {copyLabel} copiado.
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">Pontos por dia</h2>
              <p className="mt-1 text-xs text-slate-400">Selecione o dia para ver pré-evento, evento ou pós-evento separadamente.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {dayOptions.map((day) => {
                const dayEntries = (checkinsByDay.get(day.key) ?? []).filter((entry) => entry.type !== 'checkout')
                const active = selectedDay === day.key
                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className={`rounded-2xl border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#D4FF00] bg-[#D4FF00] text-black'
                        : 'border-white/10 bg-black/20 text-white'
                    }`}
                  >
                    <p className="text-xs font-black">{day.label}</p>
                    <p className={`text-[11px] ${active ? 'text-black/65' : 'text-slate-400'}`}>{day.title}</p>
                    <p className={`text-[10px] ${active ? 'text-black/55' : 'text-slate-500'}`}>{day.phase}</p>
                    <p className={`mt-1 text-[11px] ${active ? 'text-black/75' : 'text-[#D4FF00]'}`}>
                      {dayEntries.length} entradas
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
              <p className="text-xs text-emerald-100/70">Entradas no dia</p>
              <p className="mt-1 text-2xl font-black text-emerald-100">{selectedDayEntries.length}</p>
            </div>
            <div className="rounded-2xl border border-blue-400/15 bg-blue-400/10 p-4">
              <p className="text-xs text-blue-100/70">Saídas no dia</p>
              <p className="mt-1 text-2xl font-black text-blue-100">{selectedDayExits.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-4">
              <p className="text-xs text-amber-100/70">Cadastrados sem ponto nesse dia</p>
              <p className="mt-1 text-2xl font-black text-amber-100">
                {selectedDayMissing} {selectedDayMissing === 1 ? 'pessoa' : 'pessoas'}
              </p>
              <p className="mt-1 text-[11px] text-amber-100/55">
                Total de staff ativo menos quem bateu entrada no dia selecionado.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Staff do BSB5</h2>
              <a href={BSB5_JOIN_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4FF00]">
                Cadastro <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="space-y-4">
              {staffByRole.map((group) => (
                <div key={group.role} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-sm font-black text-white">{group.role}</h3>
                    <span className="rounded-full bg-[#D4FF00] px-2 py-0.5 text-[11px] font-black text-black">
                      {group.members.length}
                    </span>
                  </div>
                  {group.members.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{fullName(member)}</p>
                          <p className="truncate text-xs text-slate-400">{member.area || 'Sem area especifica'}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{member.phone || member.email || 'Sem contato'}</p>
                        </div>
                        <StatusBadge staff={member} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {staff.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum staff cadastrado nesse evento.</p>}
            </div>
            {false && (
            <div className="space-y-2">
              {staff.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{fullName(member)}</p>
                      <p className="truncate text-xs text-slate-400">{member.role_title || 'Função não informada'}{member.area ? ` · ${member.area}` : ''}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{member.phone || member.email || 'Sem contato'}</p>
                    </div>
                    <StatusBadge staff={member} />
                  </div>
                </div>
              ))}
              {staff.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum staff cadastrado nesse evento.</p>}
            </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Entradas e saídas do dia</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDayLabel(selectedDay)} - {dayPhase(selectedDay)}
                </p>
              </div>
              <a href={BSB5_PONTO_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4FF00]">
                Ponto <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="space-y-2">
              {selectedDayCheckins.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{entry.staff_member_id ? checkinStaffNames.get(entry.staff_member_id) ?? 'Staff' : 'Staff'}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Lat {formatCoordinate(entry.latitude)} - Lng {formatCoordinate(entry.longitude)}
                      </p>
                      <p className="text-xs text-slate-400">{entry.type === 'checkout' ? 'Saída' : 'Entrada'} · {formatDateTime(entry.created_at)}</p>
                    </div>
                    {entry.photo_url && (
                      <button onClick={() => setSelectedPhoto(entry)} className="text-xs font-semibold text-[#D4FF00]">
                        Foto
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {selectedDayCheckins.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Ainda não há registros de ponto nesse dia.</p>}
            </div>
          </div>
        </section>

        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#080b12] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">
                    {selectedPhoto.staff_member_id ? checkinStaffNames.get(selectedPhoto.staff_member_id) ?? 'Staff' : 'Staff'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedPhoto.type === 'checkout' ? 'Saida' : 'Entrada'} - {formatDateTime(selectedPhoto.created_at)}
                  </p>
                </div>
                <button onClick={() => setSelectedPhoto(null)} className="rounded-full border border-white/10 p-2 text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid max-h-[calc(92vh-60px)] overflow-y-auto lg:grid-cols-[1fr_280px]">
                <div className="bg-black">
                  <img src={selectedPhoto.photo_url ?? ''} alt="Foto do ponto" className="h-full max-h-[72vh] w-full object-contain" />
                </div>

                <div className="space-y-3 p-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4FF00]">Horario</p>
                    <p className="mt-1 text-sm text-white">{formatDateTime(selectedPhoto.created_at)}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4FF00]">Coordenadas</p>
                    <p className="mt-1 text-sm text-white">Lat {formatCoordinate(selectedPhoto.latitude)}</p>
                    <p className="text-sm text-white">Lng {formatCoordinate(selectedPhoto.longitude)}</p>
                    {typeof selectedPhoto.accuracy_meters === 'number' && (
                      <p className="mt-1 text-xs text-slate-400">Precisao aproximada: {Math.round(selectedPhoto.accuracy_meters)}m</p>
                    )}
                  </div>

                  {typeof selectedPhoto.latitude === 'number' && typeof selectedPhoto.longitude === 'number' && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedPhoto.latitude},${selectedPhoto.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-bold text-black"
                    >
                      Abrir no mapa
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
