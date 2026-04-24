import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  Globe,
  Handshake,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Sponsor, SponsorStatus, SponsorTier } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ActionConfirmationDialog } from '@/shared/components'

const TIER_LABELS: Record<SponsorTier, string> = {
  title: 'Title',
  gold: 'Ouro',
  silver: 'Prata',
  bronze: 'Bronze',
  media: 'Midia',
  support: 'Apoio',
}

const STATUS_META: Record<SponsorStatus, { label: string; color: string }> = {
  prospect: { label: 'Prospecto', color: 'text-text-muted' },
  negotiating: { label: 'Negociando', color: 'text-status-warning' },
  confirmed: { label: 'Confirmado', color: 'text-brand-blue' },
  active: { label: 'Ativo', color: 'text-brand-acid' },
  completed: { label: 'Concluido', color: 'text-status-success' },
  cancelled: { label: 'Cancelado', color: 'text-status-error' },
}

interface SponsorFormState {
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  tier: SponsorTier
  status: SponsorStatus
  investment_value: string
  website_url: string
  notes: string
}

const EMPTY_FORM: SponsorFormState = {
  company_name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  tier: 'gold',
  status: 'prospect',
  investment_value: '',
  website_url: '',
  notes: '',
}

export function SponsorsPage() {
  const organization = useAuthStore((state) => state.organization)
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SponsorStatus>('all')
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Sponsor | null>(null)

  useEffect(() => {
    if (!organization?.id) return
    void fetchSponsors()
  }, [organization?.id])

  async function fetchSponsors() {
    setLoading(true)
    const { data } = await supabase
      .from('sponsors')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: false })

    setSponsors((data ?? []) as Sponsor[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('sponsors').delete().eq('id', id)
    await fetchSponsors()
  }

  const filtered = useMemo(() => {
    return sponsors.filter((sponsor) => {
      if (statusFilter !== 'all' && sponsor.status !== statusFilter) return false
      if (!search.trim()) return true
      const query = search.toLowerCase()
      return sponsor.company_name.toLowerCase().includes(query) ||
        (sponsor.contact_name ?? '').toLowerCase().includes(query) ||
        (sponsor.contact_email ?? '').toLowerCase().includes(query)
    })
  }, [search, sponsors, statusFilter])

  function exportCsv() {
    const header = ['Empresa', 'Contato', 'E-mail', 'Telefone', 'Tier', 'Status', 'Investimento', 'Site', 'Cadastro']
    const rows = filtered.map((sponsor) => [
      sponsor.company_name,
      sponsor.contact_name ?? '',
      sponsor.contact_email ?? '',
      sponsor.contact_phone ?? '',
      TIER_LABELS[sponsor.tier],
      STATUS_META[sponsor.status].label,
      sponsor.investment_value ?? '',
      sponsor.website_url ?? '',
      formatDate(sponsor.created_at),
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `patrocinios-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const totalInvestment = sponsors
    .filter((sponsor) => ['confirmed', 'active', 'completed'].includes(sponsor.status))
    .reduce((sum, sponsor) => sum + (sponsor.investment_value ?? 0), 0)

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            PATROCINIOS<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 font-mono text-xs tracking-wider text-text-muted">
            {sponsors.length} patrocinador{sponsors.length !== 1 ? 'es' : ''} cadastrado{sponsors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo patrocinador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total', value: sponsors.length, icon: Handshake, color: 'text-text-primary' },
          { label: 'Ativos', value: sponsors.filter((sponsor) => sponsor.status === 'active').length, icon: CheckCircle2, color: 'text-brand-acid' },
          { label: 'Confirmados', value: sponsors.filter((sponsor) => ['confirmed', 'active'].includes(sponsor.status)).length, icon: CheckCircle2, color: 'text-brand-blue' },
          { label: 'Investimento', value: formatCurrency(totalInvestment), icon: DollarSign, color: 'text-status-success' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{item.label}</span>
                <Icon className={cn('h-3.5 w-3.5', item.color)} />
              </div>
              <div className={cn('text-xl font-semibold', item.color)}>{item.value}</div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-9 pl-9 text-sm"
            placeholder="Buscar por empresa ou contato..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'prospect', 'negotiating', 'confirmed', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                statusFilter === status
                  ? 'bg-brand-acid text-white'
                  : 'border border-transparent text-text-muted hover:border-bg-border hover:text-text-primary',
              )}
            >
              {status === 'all' ? 'Todos' : STATUS_META[status].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Handshake className="mb-3 h-10 w-10 text-text-muted" />
          <div className="mb-1 font-display text-2xl text-text-primary">NENHUM PATROCINADOR</div>
          <p className="mb-5 text-sm text-text-muted">Cadastre marcas parceiras e acompanhe as cotas comerciais em um único lugar.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo patrocinador</button>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Empresa', 'Tier', 'Status', 'Investimento', 'Contato', 'Cadastro', 'Acoes'].map((header) => (
                  <th key={header} className="table-header">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sponsor) => (
                <tr key={sponsor.id} className="table-row">
                  <td className="table-cell">
                    <div className="text-[13px] font-medium text-text-primary">{sponsor.company_name}</div>
                    {sponsor.website_url ? (
                      <a href={sponsor.website_url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-[10px] text-text-muted hover:text-brand-acid">
                        <Globe className="h-2.5 w-2.5" />
                        {sponsor.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    ) : null}
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      {TIER_LABELS[sponsor.tier]}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={cn('text-xs font-medium', STATUS_META[sponsor.status].color)}>
                      {STATUS_META[sponsor.status].label}
                    </span>
                  </td>
                  <td className="table-cell">
                    {sponsor.investment_value ? (
                      <span className="font-mono text-sm font-medium text-status-success">{formatCurrency(sponsor.investment_value)}</span>
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="space-y-0.5">
                      {sponsor.contact_name ? <div className="text-xs text-text-secondary">{sponsor.contact_name}</div> : null}
                      {sponsor.contact_email ? (
                        <a href={`mailto:${sponsor.contact_email}`} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-brand-acid">
                          <Mail className="h-2.5 w-2.5" />
                          {sponsor.contact_email}
                        </a>
                      ) : null}
                      {sponsor.contact_phone ? (
                        <div className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Phone className="h-2.5 w-2.5" />
                          {sponsor.contact_phone}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-text-muted">{formatDate(sponsor.created_at)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(sponsor); setShowForm(true) }} className="rounded-sm p-1.5 text-text-muted hover:bg-brand-acid/8 hover:text-brand-acid">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setPendingDelete(sponsor)} className="rounded-sm p-1.5 text-text-muted hover:bg-status-error/8 hover:text-status-error">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showForm ? (
        <SponsorFormModal
          organizationId={organization?.id ?? ''}
          sponsor={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setShowForm(false)
            setEditing(null)
            await fetchSponsors()
          }}
        />
      ) : null}

      <ActionConfirmationDialog
        open={Boolean(pendingDelete)}
        title="Remover patrocinador"
        description={pendingDelete ? `O cadastro de ${pendingDelete.company_name} sera removido.` : undefined}
        impact="Historico de investimento, contatos e entregas deixam de estar disponiveis para a equipe."
        confirmLabel="Excluir patrocinador"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return
          await handleDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function SponsorFormModal({
  organizationId,
  sponsor,
  onClose,
  onSaved,
}: {
  organizationId: string
  sponsor: Sponsor | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState<SponsorFormState>(
    sponsor
      ? {
          company_name: sponsor.company_name,
          contact_name: sponsor.contact_name ?? '',
          contact_email: sponsor.contact_email ?? '',
          contact_phone: sponsor.contact_phone ?? '',
          tier: sponsor.tier,
          status: sponsor.status,
          investment_value: sponsor.investment_value?.toString() ?? '',
          website_url: sponsor.website_url ?? '',
          notes: sponsor.notes ?? '',
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setValue = (key: keyof SponsorFormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function handleSave() {
    if (!form.company_name.trim()) {
      setError('Nome da empresa e obrigatorio')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      organization_id: organizationId,
      company_name: form.company_name.trim(),
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      tier: form.tier,
      status: form.status,
      investment_value: form.investment_value ? parseFloat(form.investment_value) : null,
      website_url: form.website_url || null,
      notes: form.notes || null,
    }

    const { error: saveError } = sponsor
      ? await supabase.from('sponsors').update(payload).eq('id', sponsor.id)
      : await supabase.from('sponsors').insert(payload)

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    await onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            {sponsor ? 'EDITAR PATROCINADOR' : 'NOVO PATROCINADOR'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div>
            <label className="input-label">Nome da empresa *</label>
            <input className="input" value={form.company_name} onChange={(event) => setValue('company_name', event.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Tier</label>
              <select className="input" value={form.tier} onChange={(event) => setValue('tier', event.target.value as SponsorTier)}>
                {Object.entries(TIER_LABELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={(event) => setValue('status', event.target.value as SponsorStatus)}>
                {Object.entries(STATUS_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Contato" value={form.contact_name} onChange={(event) => setValue('contact_name', event.target.value)} />
            <input className="input" placeholder="Telefone" value={form.contact_phone} onChange={(event) => setValue('contact_phone', event.target.value)} />
          </div>
          <input className="input" type="email" placeholder="E-mail" value={form.contact_email} onChange={(event) => setValue('contact_email', event.target.value)} />
          <input className="input" type="number" placeholder="Investimento (R$)" value={form.investment_value} onChange={(event) => setValue('investment_value', event.target.value)} />
          <input className="input" placeholder="https://site.com" value={form.website_url} onChange={(event) => setValue('website_url', event.target.value)} />
          <textarea className="input resize-none" rows={3} placeholder="Observacoes" value={form.notes} onChange={(event) => setValue('notes', event.target.value)} />

          {error ? (
            <div className="flex items-center gap-2 rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={() => void handleSave()} disabled={saving} className="btn-primary flex min-w-[180px] items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : sponsor ? 'Salvar alterações' : 'Cadastrar patrocinador'}
          </button>
        </div>
      </div>
    </div>
  )
}
