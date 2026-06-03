import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
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
import { normalizeOperationalRole, OPERATIONAL_STAFF_ROLES } from '@/modules/staff/staffRoles'

const BSB5_SLUG = 'bsb-fight-5'
const ALLOWED_EMAILS = ['walteciojr@gmail.com', 'hds.vieira@gmail.com']
const DEFAULT_MODES: AppMode[] = ['supervisor', 'operator', 'staff', 'promoter', 'attendee']
type AdminTab = 'staff' | 'checkins'

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
  cpf: string | null
  email: string | null
  phone: string | null
  role_title: string | null
  company: string | null
  area: string | null
  notes: string | null
  shift_label: string | null
  pix_key: string | null
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
  work_role?: string | null
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

function formatDateRange(event: BsbEvent | null) {
  if (!event?.starts_at) return 'Datas a definir'
  const start = new Date(event.starts_at)
  const end = event.ends_at ? new Date(event.ends_at) : null
  const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
  if (!end || saoPauloDateKey(event.starts_at) === saoPauloDateKey(event.ends_at)) return day.format(start)
  return `${day.format(start)} a ${day.format(end)}`
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

function eventDayKeys(event: BsbEvent | null) {
  if (!event?.starts_at) return []
  const startKey = saoPauloDateKey(event.starts_at)
  const endKey = saoPauloDateKey(event.ends_at ?? event.starts_at)
  const start = new Date(`${startKey}T03:00:00.000Z`)
  const end = new Date(`${endKey}T03:00:00.000Z`)
  const keys: string[] = []
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)) {
    keys.push(cursor.toISOString().slice(0, 10))
  }
  return keys
}

function dayPhase(key: string, event: BsbEvent | null) {
  const start = event?.starts_at ? saoPauloDateKey(event.starts_at) : ''
  const end = event?.ends_at ? saoPauloDateKey(event.ends_at) : start
  if (start && key < start) return 'Pre-evento'
  if (end && key > end) return 'Pos-evento'
  return 'Evento'
}

function dayTitle(key: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' })
    .format(new Date(`${key}T12:00:00.000Z`))
}

function formatCoordinate(value: number | null) {
  return typeof value === 'number' ? value.toFixed(6) : '-'
}

function normalizeSearch(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function excelEscape(value: unknown) {
  const text = String(value ?? '')
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

export default function Bsb5AdminPage({ onNavigate, eventSlug = BSB5_SLUG }: PulsePageProps & { eventSlug?: string }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [event, setEvent] = useState<BsbEvent | null>(null)
  const [staff, setStaff] = useState<BsbStaff[]>([])
  const [checkins, setCheckins] = useState<BsbCheckin[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<BsbCheckin | null>(null)
  const [copyLabel, setCopyLabel] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(todayBsbDay)
  const [staffSearch, setStaffSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [editingStaff, setEditingStaff] = useState<BsbStaff | null>(null)
  const [editDraft, setEditDraft] = useState<Record<string, string>>({})
  const [savingStaff, setSavingStaff] = useState(false)
  const [staffMessage, setStaffMessage] = useState<string | null>(null)
  const [adminTab, setAdminTab] = useState<AdminTab>('staff')
  const [manualDraft, setManualDraft] = useState<Record<string, string>>({
    full_name: '',
    role_title: 'Outros',
    phone: '',
    cpf: '',
    email: '',
    company: '',
    area: '',
    shift_label: '',
    notes: '',
  })
  const [manualPointRole, setManualPointRole] = useState('Outros')
  const [eventDraft, setEventDraft] = useState<Record<string, string>>({
    name: '',
    slug: '',
    starts_at: '',
    ends_at: '',
    venue_name: '',
  })
  const [manualBusy, setManualBusy] = useState<string | null>(null)
  const joinLink = `${window.location.origin}/staff/join/${eventSlug === 'bsb-fight-5' ? 'bsb5' : eventSlug}`
  const pointLink = `${window.location.origin}/staff/ponto/${eventSlug}`

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
      setAuthEmail(email || null)

      if (!user || !ALLOWED_EMAILS.includes(email)) {
        setAllowed(false)
        return
      }

      setAllowed(true)

      const { data: eventRow, error: eventError } = await supabase
        .from('events')
        .select('id,name,slug,starts_at,ends_at,status,venue_name,cover_url,organization_id')
        .eq('slug', eventSlug)
        .single()

      if (eventError || !eventRow) throw eventError ?? new Error('Evento não encontrado')

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
          .select('id,first_name,last_name,cpf,email,phone,role_title,company,area,notes,shift_label,pix_key,status,is_active,checked_in_at,checked_out_at,created_at')
          .eq('event_id', bsbEvent.id)
          .eq('is_active', true)
          .order('first_name', { ascending: true }),
        supabase
          .from('staff_checkins')
          .select('id,staff_member_id,type,work_role,created_at,photo_url,latitude,longitude,accuracy_meters')
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
  }, [eventSlug, loadPermissions, setActiveEvent, setActiveOrganization, setAvailableModes, setContext])

  useEffect(() => { load() }, [load])

  async function loginAdmin(event: React.FormEvent) {
    event.preventDefault()
    setLoginBusy(true)
    setLoginError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    })

    if (error) {
      setLoginError('E-mail ou senha inválidos.')
      setLoginBusy(false)
      return
    }

    setLoginBusy(false)
    await load()
  }

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

  const filteredStaff = useMemo(() => {
    const term = normalizeSearch(staffSearch).trim()
    return staff.filter((member) => {
      const sector = normalizeOperationalRole(member.role_title)
      if (sectorFilter !== 'all' && sector !== sectorFilter) return false
      if (!term) return true

      const searchable = [
        fullName(member),
        member.cpf,
        member.email,
        member.phone,
        member.role_title,
        member.company,
        member.area,
        member.shift_label,
        member.notes,
        member.pix_key,
      ].map(normalizeSearch).join(' ')

      return searchable.includes(term)
    })
  }, [sectorFilter, staff, staffSearch])

  const sectorOptions = useMemo(() => {
    const sectors = new Set(staff.map((member) => normalizeOperationalRole(member.role_title)))
    return Array.from(sectors).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [staff])

  const operationalBySector = useMemo(() => {
    const checkedStaffIds = new Set(
      checkins
        .filter((entry) => entry.type !== 'checkout' && entry.staff_member_id)
        .map((entry) => entry.staff_member_id as string),
    )
    const groups = new Map<string, { sector: string; total: number; checked: number; pending: number; names: string[] }>()

    staff.forEach((member) => {
      const sector = normalizeOperationalRole(member.role_title)
      const group = groups.get(sector) ?? { sector, total: 0, checked: 0, pending: 0, names: [] }
      const hasCheckin = checkedStaffIds.has(member.id)
      group.total += 1
      group.checked += hasCheckin ? 1 : 0
      group.pending += hasCheckin ? 0 : 1
      group.names.push(fullName(member))
      groups.set(sector, group)
    })

    return Array.from(groups.values())
      .map((group) => ({ ...group, names: group.names.sort((a, b) => a.localeCompare(b, 'pt-BR')) }))
      .sort((a, b) => a.sector.localeCompare(b.sector, 'pt-BR'))
  }, [checkins, staff])

  const staffByRole = useMemo(() => {
    const groups = new Map<string, BsbStaff[]>()
    filteredStaff.forEach((member) => {
      const role = normalizeOperationalRole(member.role_title)
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
  }, [filteredStaff])

  const checkinStaffNames = useMemo(() => {
    const names = new Map<string, string>()
    staff.forEach((s) => names.set(s.id, fullName(s)))
    return names
  }, [staff])

  const checkinsByDay = useMemo(() => {
    const grouped = new Map<string, BsbCheckin[]>()
    eventDayKeys(event).forEach((key) => grouped.set(key, []))
    checkins.forEach((entry) => {
      const key = saoPauloDateKey(entry.created_at)
      if (!key) return
      const list = grouped.get(key) ?? []
      list.push(entry)
      grouped.set(key, list)
    })
    return grouped
  }, [checkins, event])

  const dayOptions = useMemo(() => {
    const keys = new Set<string>(eventDayKeys(event))
    checkins.forEach((entry) => {
      const key = saoPauloDateKey(entry.created_at)
      if (key) keys.add(key)
    })
    return Array.from(keys).sort().map((key) => ({
      key,
      label: formatDayLabel(key),
      title: dayTitle(key),
      phase: dayPhase(key, event),
    }))
  }, [checkins, event])

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

  function exportOperationalExcel() {
    const staffMap = new Map(staff.map((member) => [member.id, member]))
    const rows = checkins
      .filter((entry) => entry.type !== 'checkout' && entry.staff_member_id)
      .map((entry) => {
        const member = staffMap.get(entry.staff_member_id as string)
        const role = normalizeOperationalRole(entry.work_role || member?.role_title)
        return [
          formatDayLabel(saoPauloDateKey(entry.created_at)),
          role,
          member ? fullName(member) : 'Staff',
          member?.cpf ?? '',
          member?.pix_key ?? '',
          member?.phone ?? '',
          member?.area ?? '',
          formatDateTime(entry.created_at),
        ]
      })
      .sort((a, b) => `${a[0]}|${a[1]}|${a[2]}`.localeCompare(`${b[0]}|${b[1]}|${b[2]}`, 'pt-BR'))

    const csv = [
      ['Dia', 'Função', 'Nome', 'CPF', 'Pix', 'Telefone', 'Área/Base', 'Entrada'],
      ...rows,
    ].map((row) => row.map(excelEscape).join(';')).join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `relacao-${event?.slug ?? eventSlug}-por-funcao.xls`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function openStaffEditor(member: BsbStaff) {
    setEditingStaff(member)
    setStaffMessage(null)
    setEditDraft({
      first_name: member.first_name ?? '',
      last_name: member.last_name ?? '',
      cpf: member.cpf ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      role_title: member.role_title ?? '',
      company: member.company ?? '',
      area: member.area ?? '',
      pix_key: member.pix_key ?? '',
      shift_label: member.shift_label ?? '',
      notes: member.notes ?? '',
    })
  }

  async function saveStaff() {
    if (!editingStaff) return
    setSavingStaff(true)
    setStaffMessage(null)

    const payload = {
      first_name: editDraft.first_name?.trim() || null,
      last_name: editDraft.last_name?.trim() || null,
      cpf: editDraft.cpf?.trim() || null,
      email: editDraft.email?.trim() || null,
      phone: editDraft.phone?.trim() || null,
      role_title: editDraft.role_title?.trim() || null,
      company: editDraft.company?.trim() || null,
      area: editDraft.area?.trim() || null,
      pix_key: editDraft.pix_key?.trim() || null,
      shift_label: editDraft.shift_label?.trim() || null,
      notes: editDraft.notes?.trim() || null,
    }

    const { data, error } = await supabase
      .from('staff_members')
      .update(payload)
      .eq('id', editingStaff.id)
      .select('id,first_name,last_name,cpf,email,phone,role_title,company,area,notes,shift_label,pix_key,status,is_active,checked_in_at,checked_out_at,created_at')
      .single()

    setSavingStaff(false)

    if (error) {
      setStaffMessage(`Erro ao salvar: ${error.message}`)
      return
    }

    const updated = data as BsbStaff
    setStaff((current) => current.map((member) => (member.id === updated.id ? updated : member)))
    setEditingStaff(updated)
    setStaffMessage('Dados atualizados.')
  }

  async function runAdminAction(action: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke('bsb5-admin-action', {
      body: { action, event_slug: eventSlug, ...payload },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function createOperationalEvent() {
    if (!eventDraft.name.trim() || !eventDraft.slug.trim()) {
      setStaffMessage('Informe nome e slug do evento.')
      return
    }

    setManualBusy('create_event')
    setStaffMessage(null)
    try {
      const payload = {
        ...eventDraft,
        organization_id: event?.organization_id,
        starts_at: eventDraft.starts_at ? new Date(eventDraft.starts_at).toISOString() : undefined,
        ends_at: eventDraft.ends_at ? new Date(eventDraft.ends_at).toISOString() : undefined,
        geofence_radius_meters: 650,
      }
      const data = await runAdminAction('create_event', payload)
      const slug = data?.event?.slug ?? eventDraft.slug.trim()
      setStaffMessage(`Evento ${data?.event?.name ?? eventDraft.name} criado.`)
      window.location.href = `/pulse/${slug}/admin`
    } catch (error) {
      setStaffMessage(error instanceof Error ? error.message : 'Erro ao criar evento.')
    } finally {
      setManualBusy(null)
    }
  }

  async function createManualStaff() {
    if (!manualDraft.full_name.trim()) {
      setStaffMessage('Informe pelo menos o nome da pessoa.')
      return
    }

    setManualBusy('create')
    setStaffMessage(null)
    try {
      const data = await runAdminAction('create_staff', manualDraft)
      if (data?.staff) {
        setStaff((current) => [data.staff as BsbStaff, ...current])
        setManualDraft({
          full_name: '',
          role_title: 'Outros',
          phone: '',
          cpf: '',
          email: '',
          company: '',
          area: '',
          shift_label: '',
          notes: '',
        })
      }
      setStaffMessage('Colaborador cadastrado manualmente.')
    } catch (error) {
      setStaffMessage(error instanceof Error ? error.message : 'Erro ao cadastrar manualmente.')
    } finally {
      setManualBusy(null)
    }
  }

  async function manualPoint(member: BsbStaff, type: 'checkin' | 'checkout') {
    const label = type === 'checkin' ? 'entrada' : 'saida'
    setManualBusy(`${type}:${member.id}`)
    setStaffMessage(null)
    try {
      const data = await runAdminAction(type === 'checkin' ? 'manual_checkin' : 'manual_checkout', {
        staff_member_id: member.id,
        work_role: manualPointRole,
      })

      if (data?.staff) {
        const updated = data.staff as BsbStaff
        setStaff((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      }
      if (data?.checkin) {
        setCheckins((current) => [data.checkin as BsbCheckin, ...current])
      }
      setStaffMessage(`Registro manual de ${label} realizado para ${fullName(member)}.`)
    } catch (error) {
      setStaffMessage(error instanceof Error ? error.message : `Erro ao registrar ${label}.`)
    } finally {
      setManualBusy(null)
    }
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
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] px-5 py-8 text-white">
        <form onSubmit={loginAdmin} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <ShieldAlert className="mb-4 h-9 w-9 text-[#D4FF00]" />
          <h1 className="text-2xl font-black tracking-tight">Admin BSB FIGHT 5</h1>
          <p className="mt-2 text-sm text-slate-400">
            Entre com o e-mail autorizado para acessar somente o painel do BSB FIGHT 5.
          </p>

          {authEmail && !ALLOWED_EMAILS.includes(authEmail) && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-100">
              Sessão atual: {authEmail}. Este e-mail não está liberado para este painel.
            </div>
          )}

          <label className="mt-5 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">E-mail</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="admin@email.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="mt-3 block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Senha</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 focus-within:border-[#D4FF00]">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {loginError && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginBusy || !loginEmail || !loginPassword}
            className="mt-5 w-full rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-black text-black disabled:opacity-60"
          >
            {loginBusy ? 'Entrando...' : 'Entrar no admin'}
          </button>
        </form>
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
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDateRange(event)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event?.venue_name ?? 'Local a definir'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={exportOperationalExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-black text-black"
                >
                  <Clipboard className="h-4 w-4" />
                  Exportar Excel
                </button>
                <button
                  onClick={load}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </button>
              </div>
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

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">Operacao por setor</h2>
              <p className="mt-1 text-xs text-slate-400">Total cadastrado, check-ins realizados e pendentes por funcao.</p>
            </div>
            <select
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
            >
              <option value="all">Todos os setores</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operationalBySector.map((group) => (
              <div key={group.sector} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white">{group.sector} ({group.total})</h3>
                    <p className="mt-1 text-xs text-slate-400">{group.names.slice(0, 5).join(', ')}</p>
                  </div>
                  <span className="rounded-full bg-[#D4FF00] px-2 py-0.5 text-[11px] font-black text-black">{group.total}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/[0.04] p-2">
                    <p className="text-[10px] text-slate-500">Total</p>
                    <p className="text-lg font-black">{group.total}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-400/10 p-2">
                    <p className="text-[10px] text-emerald-100/60">Check-in</p>
                    <p className="text-lg font-black text-emerald-100">{group.checked}</p>
                  </div>
                  <div className="rounded-xl bg-amber-400/10 p-2">
                    <p className="text-[10px] text-amber-100/60">Pendentes</p>
                    <p className="text-lg font-black text-amber-100">{group.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => onNavigate('/pulse/supervisor/team-live')} className="rounded-2xl bg-[#D4FF00] px-4 py-4 text-left font-bold text-black">
            Ver equipe ao vivo
          </button>
          <button onClick={() => onNavigate('/pulse/supervisor/summary')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Resumo do evento
          </button>
          <button onClick={() => copy(joinLink, 'cadastro')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Copiar link de cadastro
          </button>
          <button onClick={() => copy(pointLink, 'ponto')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-white">
            Copiar link do ponto
          </button>
        </section>

        {copyLabel && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Link de {copyLabel} copiado.
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4">
            <h2 className="font-bold">Criar novo evento operacional</h2>
            <p className="mt-1 text-xs text-slate-400">
              Use para abrir o painel de staff/ponto de qualquer evento, como Capital Strike.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['name', 'Nome do evento', 'Capital Strike'],
              ['slug', 'Slug', 'capital-strike'],
              ['starts_at', 'Início', '2026-06-10T08:00'],
              ['ends_at', 'Fim', '2026-06-10T23:59'],
              ['venue_name', 'Local', 'Arena / endereço'],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
                <input
                  type={key === 'starts_at' || key === 'ends_at' ? 'datetime-local' : 'text'}
                  value={eventDraft[key] ?? ''}
                  onChange={(event) => setEventDraft((draft) => ({ ...draft, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={createOperationalEvent}
              disabled={manualBusy === 'create_event'}
              className="rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-black text-black disabled:opacity-60"
            >
              {manualBusy === 'create_event' ? 'Criando...' : 'Criar e abrir painel'}
            </button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {[
            ['staff', 'Cadastrados', `${filteredStaff.length} colaboradores`],
            ['checkins', 'Pontos', `${checkins.length} registros`],
          ].map(([tab, label, detail]) => {
            const active = adminTab === tab
            return (
              <button
                key={tab}
                onClick={() => setAdminTab(tab as AdminTab)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? 'border-[#D4FF00] bg-[#D4FF00] text-black'
                    : 'border-white/10 bg-white/[0.04] text-white'
                }`}
              >
                <p className="text-sm font-black">{label}</p>
                <p className={`mt-1 text-xs ${active ? 'text-black/65' : 'text-slate-400'}`}>{detail}</p>
              </button>
            )
          })}
        </section>

        {adminTab === 'checkins' && (
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

          <div className="mt-4 space-y-2">
            {selectedDayCheckins.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{entry.staff_member_id ? checkinStaffNames.get(entry.staff_member_id) ?? 'Staff' : 'Staff'}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Lat {formatCoordinate(entry.latitude)} - Lng {formatCoordinate(entry.longitude)}
                    </p>
                    <p className="text-xs text-slate-400">{entry.type === 'checkout' ? 'Saida' : 'Entrada'} | {formatDateTime(entry.created_at)}</p>
                  </div>
                  {entry.photo_url && (
                    <button onClick={() => setSelectedPhoto(entry)} className="text-xs font-semibold text-[#D4FF00]">
                      Foto
                    </button>
                  )}
                </div>
              </div>
            ))}
            {selectedDayCheckins.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Ainda nao ha registros de ponto nesse dia.</p>}
          </div>
        </section>
        )}

        {adminTab === 'staff' && (
        <>
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4">
            <h2 className="font-bold">Cadastro manual de colaborador</h2>
            <p className="mt-1 text-xs text-slate-400">
              Use quando a pessoa não conseguir preencher tudo ou estiver com problema de permissões no celular.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['full_name', 'Nome completo *'],
              ['role_title', 'Função'],
              ['phone', 'Telefone'],
              ['cpf', 'CPF'],
              ['email', 'E-mail'],
              ['company', 'Empresa'],
              ['area', 'Área'],
              ['shift_label', 'Turno / horário'],
            ].map(([key, label]) => (
              <label key={key} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
                {key === 'role_title' ? (
                  <select
                    value={manualDraft.role_title ?? ''}
                    onChange={(event) => setManualDraft((draft) => ({ ...draft, role_title: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                  >
                    {OPERATIONAL_STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={manualDraft[key] ?? ''}
                    onChange={(event) => setManualDraft((draft) => ({ ...draft, [key]: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                  />
                )}
              </label>
            ))}
          </div>

          <label className="mt-3 block space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Observação</span>
            <textarea
              value={manualDraft.notes ?? ''}
              onChange={(event) => setManualDraft((draft) => ({ ...draft, notes: event.target.value }))}
              rows={2}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
              placeholder="Ex.: pessoa sem CPF em mãos, registro feito no credenciamento..."
            />
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Depois de criar, use os botões de entrada/saída manual na lista abaixo.
            </p>
            <button
              onClick={createManualStaff}
              disabled={manualBusy === 'create'}
              className="rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-black text-black disabled:opacity-60"
            >
              {manualBusy === 'create' ? 'Cadastrando...' : 'Cadastrar manualmente'}
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold">Staff do evento</h2>
                <p className="mt-1 text-xs text-slate-400">{filteredStaff.length} de {staff.length} colaboradores</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <a href={joinLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4FF00]">
                  Cadastro <ExternalLink className="h-3 w-3" />
                </a>
                <label className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  Funcao no ponto manual
                  <select
                    value={manualPointRole}
                    onChange={(event) => setManualPointRole(event.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-[#D4FF00]"
                  >
                    {OPERATIONAL_STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <input
              value={staffSearch}
              onChange={(event) => setStaffSearch(event.target.value)}
              placeholder="Pesquisar por nome, função, CPF, telefone, e-mail, empresa..."
              className="mb-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#D4FF00]"
            />
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
                          <p className="truncate text-xs text-slate-400">CPF: {member.cpf || '-'} | {member.phone || 'Sem telefone'}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{member.email || 'Sem e-mail'}{member.company ? ` | ${member.company}` : ''}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <StatusBadge staff={member} />
                          <button onClick={() => openStaffEditor(member)} className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold text-[#D4FF00]">
                            Ver / editar
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() => manualPoint(member, 'checkin')}
                              disabled={manualBusy === `checkin:${member.id}` || Boolean(member.checked_in_at && !member.checked_out_at)}
                              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {manualBusy === `checkin:${member.id}` ? '...' : 'Entrada'}
                            </button>
                            <button
                              onClick={() => manualPoint(member, 'checkout')}
                              disabled={manualBusy === `checkout:${member.id}` || !Boolean(member.checked_in_at && !member.checked_out_at)}
                              className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-black text-blue-100 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {manualBusy === `checkout:${member.id}` ? '...' : 'Saida'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {staff.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum staff cadastrado nesse evento.</p>}
              {staff.length > 0 && filteredStaff.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum colaborador encontrado nessa busca.</p>}
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

          {false && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Entradas e saídas do dia</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDayLabel(selectedDay)} - {dayPhase(selectedDay, event)}
                </p>
              </div>
              <a href={pointLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4FF00]">
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
          )}
        </section>
        </>
        )}

        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#080b12] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{fullName(editingStaff)}</p>
                  <p className="text-xs text-slate-400">{editingStaff.role_title || 'Funcao nao informada'}</p>
                </div>
                <button onClick={() => setEditingStaff(null)} className="rounded-full border border-white/10 p-2 text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-62px)] space-y-4 overflow-y-auto p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['first_name', 'Nome'],
                    ['last_name', 'Sobrenome'],
                    ['cpf', 'CPF'],
                    ['phone', 'Telefone'],
                    ['email', 'E-mail'],
                    ['role_title', 'Funcao'],
                    ['company', 'Empresa'],
                    ['area', 'Area'],
                    ['pix_key', 'Chave Pix'],
                  ].map(([key, label]) => (
                    <label key={key} className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
                      <input
                        value={editDraft[key] ?? ''}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, [key]: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                      />
                    </label>
                  ))}
                </div>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Turno / horario</span>
                  <textarea
                    value={editDraft.shift_label ?? ''}
                    onChange={(event) => setEditDraft((draft) => ({ ...draft, shift_label: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Observacoes</span>
                  <textarea
                    value={editDraft.notes ?? ''}
                    onChange={(event) => setEditDraft((draft) => ({ ...draft, notes: event.target.value }))}
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#D4FF00]"
                  />
                </label>

                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-300 sm:grid-cols-2">
                  <p>Status: <strong className="text-white">{editingStaff.status || '-'}</strong></p>
                  <p>Cadastrado: <strong className="text-white">{formatDateTime(editingStaff.created_at)}</strong></p>
                  <p>Entrada atual: <strong className="text-white">{formatDateTime(editingStaff.checked_in_at)}</strong></p>
                  <p>Saida atual: <strong className="text-white">{formatDateTime(editingStaff.checked_out_at)}</strong></p>
                </div>

                {staffMessage && (
                  <div className="rounded-2xl border border-[#D4FF00]/20 bg-[#D4FF00]/10 px-4 py-3 text-sm text-[#D4FF00]">
                    {staffMessage}
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button onClick={() => setEditingStaff(null)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200">
                    Fechar
                  </button>
                  <button
                    onClick={saveStaff}
                    disabled={savingStaff}
                    className="rounded-2xl bg-[#D4FF00] px-4 py-3 text-sm font-black text-black disabled:opacity-60"
                  >
                    {savingStaff ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
