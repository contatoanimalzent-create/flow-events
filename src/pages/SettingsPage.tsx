import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/lib/utils'
import {
  Building2, Globe, Mail, Phone, Palette,
  Key, Link2, ShieldCheck, Bell, CreditCard,
  Loader2, CheckCircle2, AlertCircle, Save, Copy,
  Eye, EyeOff, Zap, Users, X,
  Upload, Percent, BarChart3, Webhook,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
interface OrgForm {
  name: string; slug: string; email: string; phone: string
  website: string; address_city: string; address_state: string
  primary_color: string; logo_url: string; description: string
}

const PLANS = {
  starter: {
    label: 'Starter', price: 'Grátis', priceNote: 'sem mensalidade',
    ticketFee: '10%', processingFee: '2,5%',
    features: ['Eventos ilimitados', 'Ingressos ilimitados', 'Credenciamento QR Code', 'PDV básico', 'Gestão de Staff', 'Vendas públicas (/e/slug)', 'Suporte por e-mail'],
  },
  pro: {
    label: 'Pro', price: 'R$ 149', priceNote: '/mês',
    ticketFee: '7%', processingFee: '1,5%',
    features: ['Tudo do Starter', 'Taxa reduzida', 'WhatsApp automático', 'Campanhas de e-mail', 'Insights de crescimento', 'Relatórios avançados', 'Suporte prioritário'],
  },
  business: {
    label: 'Business', price: 'R$ 499', priceNote: '/mês',
    ticketFee: '5%', processingFee: '1%',
    features: ['Tudo do Pro', 'Marca branca', 'Domínio personalizado', 'Gestão de tráfego', 'API completa', 'Ticket Social', 'Análises white-label'],
  },
  enterprise: {
    label: 'Enterprise', price: 'Sob consulta', priceNote: 'contrato anual',
    ticketFee: 'Neg.', processingFee: 'Neg.',
    features: ['Tudo do Business', 'Taxa negociada', 'Totem facial', 'Offline sync', 'Reconhecimento facial', 'SLA 24/7', 'Onboarding dedicado'],
  },
}

const NAV = [
  { key: 'org',          label: 'Organização',    icon: Building2 },
  { key: 'brand',        label: 'Marca & Visual',  icon: Palette },
  { key: 'integrations', label: 'Integrações',     icon: Link2 },
  { key: 'billing',      label: 'Plano & Taxas',   icon: Percent },
  { key: 'team',         label: 'Equipe',          icon: Users },
] as const

type Tab = (typeof NAV)[number]['key']

/* ── Field ──────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</label>
      {children}
    </div>
  )
}

function Inp({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />}
      <input
        {...props}
        className={cn(
          'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all',
          'focus:border-[#0057E7]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#0057E7]/20',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          Icon && 'pl-10',
          props.className,
        )}
      />
    </div>
  )
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3 pb-5 border-b border-white/[0.06]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
        <Icon className="h-4 w-4 text-[#0057E7]" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-white/40 leading-relaxed">{desc}</p>}
      </div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────── */
export function SettingsPage() {
  const { organization, profile } = useAuthStore()
  const [tab, setTab] = useState<Tab>('org')
  const [form, setForm] = useState<OrgForm>({
    name: '', slug: '', email: '', phone: '', website: '',
    address_city: '', address_state: '',
    primary_color: '#0057E7', logo_url: '', description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('org_manager')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!organization) return
    const org = organization as unknown as Record<string, string>
    setForm({
      name: organization.name ?? '',
      slug: organization.slug ?? '',
      email: organization.email ?? '',
      phone: organization.phone ?? '',
      website: org.website ?? '',
      address_city: org.address_city ?? '',
      address_state: org.address_state ?? '',
      primary_color: org.primary_color ?? '#0057E7',
      logo_url: organization.logo_url ?? '',
      description: org.description ?? '',
    })
    setLoading(false)
    void fetchTeam()
  }, [organization])

  async function fetchTeam() {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, is_active, created_at')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: true })
    setTeamMembers(data ?? [])
  }

  const set = (k: keyof OrgForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) { setError('Nome da organização é obrigatório'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('organizations')
      .update({ name: form.name.trim(), email: form.email || null, phone: form.phone || null, logo_url: form.logo_url || null })
      .eq('id', organization!.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const path = `logos/${organization!.id}/logo.${ext}`
    const { data, error: uploadErr } = await supabase.storage.from('organization-assets').upload(path, file, { upsert: true })
    if (uploadErr) { setUploadingLogo(false); setError('Erro no upload: ' + uploadErr.message); return }
    const { data: urlData } = supabase.storage.from('organization-assets').getPublicUrl(data.path)
    set('logo_url', urlData.publicUrl); setUploadingLogo(false)
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) { setInviteError('Informe o e-mail'); return }
    setInviting(true); setInviteError('')
    const { error: err } = await supabase.from('team_invites').insert({
      organization_id: organization!.id,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole, invited_by: profile?.id, status: 'pending',
    })
    setInviting(false)
    setInviteSuccess(err
      ? `Convite gerado! Link: ${window.location.origin}/invite?org=${organization!.id}&role=${inviteRole}`
      : `Convite enviado para ${inviteEmail}!`)
    setInviteEmail('')
    setTimeout(() => { setInviteSuccess(''); setShowInviteModal(false) }, 5000)
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(''), 2000)
  }

  const mockApiKey = `ak_live_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxxxxxxxxxx`
  const mockWebhookSecret = `whsec_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxx`
  const planKey = (organization?.plan ?? 'starter') as keyof typeof PLANS
  const currentPlan = PLANS[planKey] ?? PLANS.starter

  const roleLabels: Record<string, string> = {
    org_admin: 'Administrador', org_manager: 'Gerente', super_admin: 'Super Admin',
    checkin_operator: 'Credenciamento', pdv_operator: 'PDV',
    staff_member: 'Staff', supplier: 'Fornecedor',
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="reveal">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#0057E7]">Configurações</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-none tracking-[-0.03em] text-white">
          Governança<span className="text-[#0057E7]">.</span>
        </h1>
        <p className="mt-1.5 text-sm text-white/40">
          Organização, marca, permissões, integrações e trilha operacional
        </p>
      </div>

      {/* Layout: nav + content */}
      <div className="flex gap-6 reveal" style={{ animationDelay: '40ms' }}>

        {/* Left nav */}
        <nav className="hidden w-52 shrink-0 flex-col gap-0.5 lg:flex">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left',
                tab === key
                  ? 'bg-[#0057E7]/10 text-[#0057E7] border border-[#0057E7]/20'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="flex w-full gap-1 overflow-x-auto pb-1 lg:hidden">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap transition-all',
                tab === key ? 'bg-[#0057E7]/10 text-[#0057E7]' : 'text-white/50 hover:text-white/80',
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">

          {/* ── ORG ─────────────────────────────────────────────── */}
          {tab === 'org' && (
            <div className="space-y-5 reveal">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Building2} title="Identidade da organização" desc="Nome, logo e descrição pública da sua operação." />

                <div className="mt-6 flex items-start gap-6">
                  {/* Logo */}
                  <div className="shrink-0 text-center">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                      {form.logo_url
                        ? <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
                        : <Building2 className="h-8 w-8 text-white/20" />}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button onClick={() => fileRef.current?.click()} className="mt-2 flex items-center gap-1 text-[11px] font-mono text-[#0057E7] hover:underline mx-auto">
                      {uploadingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {uploadingLogo ? 'Enviando...' : 'Logo'}
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nome da organização *">
                        <Inp value={form.name} onChange={e => set('name', e.target.value)} placeholder="Minha Empresa" />
                      </Field>
                      <Field label="Slug (URL)">
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-white/25 select-none">app/</span>
                          <Inp className="pl-12" value={form.slug} readOnly />
                        </div>
                      </Field>
                    </div>
                    <Field label="Descrição">
                      <textarea
                        rows={2}
                        placeholder="Descreva sua organização..."
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#0057E7]/50 focus:ring-1 focus:ring-[#0057E7]/20"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Mail} title="Informações de contato" desc="E-mail, telefone e localização da organização." />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Field label="E-mail de contato">
                    <Inp icon={Mail} type="email" placeholder="contato@empresa.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Telefone / WhatsApp">
                    <Inp icon={Phone} placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </Field>
                  <Field label="Website">
                    <Inp icon={Globe} type="url" placeholder="https://seusite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cidade">
                      <Inp placeholder="São Paulo" value={form.address_city} onChange={e => set('address_city', e.target.value)} />
                    </Field>
                    <Field label="UF">
                      <Inp placeholder="SP" value={form.address_state} onChange={e => set('address_state', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] text-white/25">ID: {organization?.id}</p>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" />
                    : saved ? <><CheckCircle2 className="h-4 w-4" /> Salvo!</>
                    : <><Save className="h-4 w-4" /> Salvar alterações</>}
                </button>
              </div>
            </div>
          )}

          {/* ── BRAND ───────────────────────────────────────────── */}
          {tab === 'brand' && (
            <div className="space-y-5 reveal">
              {(planKey === 'starter' || planKey === 'pro') && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#0057E7]/20 bg-[#0057E7]/[0.06] px-5 py-4">
                  <Palette className="mt-0.5 h-4 w-4 shrink-0 text-[#0057E7]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Marca branca disponível no Business</p>
                    <p className="mt-0.5 text-xs text-white/50">Com o plano Business, seu comprador vê apenas a sua marca — domínio, cores e logo.</p>
                    <button className="btn-primary mt-3 text-xs">Fazer upgrade →</button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Palette} title="Cor da marca" desc="Cor principal usada nas páginas públicas e e-mails." />
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <Field label="Cor principal (hex)">
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.primary_color} onChange={e => set('primary_color', e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent" />
                      <Inp value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="font-mono uppercase" />
                    </div>
                  </Field>
                  <Field label="Preview do botão">
                    <div className="flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold text-white" style={{ background: form.primary_color }}>
                      COMPRAR INGRESSO
                    </div>
                  </Field>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Globe} title="Domínio personalizado" desc="Aponte seu domínio para servir os eventos com sua marca." />
                <div className="mt-6 space-y-4">
                  <Field label="Seu domínio">
                    <Inp icon={Globe} placeholder="eventos.suaempresa.com" disabled={planKey === 'starter' || planKey === 'pro'} />
                  </Field>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 font-mono text-xs text-white/50 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Configuração DNS</p>
                    <p>CNAME <span className="text-[#0057E7]">eventos</span> → <span className="text-white/70">cname.pulse.events</span></p>
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary flex items-center gap-2" disabled={planKey === 'starter' || planKey === 'pro'}>
                      <Save className="h-4 w-4" /> Salvar domínio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ────────────────────────────────────── */}
          {tab === 'integrations' && (
            <div className="space-y-5 reveal">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Key} title="API Keys" desc="Chaves para integrar com sistemas externos ou ferramentas." />
                <div className="mt-6 space-y-4">
                  {[
                    { label: 'Chave de API (Live)', value: mockApiKey, key: 'api', masked: showApiKey },
                    { label: 'Webhook Secret', value: mockWebhookSecret, key: 'webhook', masked: true },
                  ].map(item => (
                    <Field key={item.key} label={item.label}>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Inp
                            className="pr-10 font-mono text-xs"
                            value={item.key === 'api' && !showApiKey ? '•'.repeat(24) + item.value.slice(-8) : item.key === 'webhook' ? '•'.repeat(16) + item.value.slice(-8) : item.value}
                            readOnly
                          />
                          {item.key === 'api' && (
                            <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                              {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                        <button onClick={() => copyToClipboard(item.value, item.key)}
                          className={cn('btn-secondary flex shrink-0 items-center gap-1.5 text-xs', copied === item.key && 'text-green-400')}>
                          <Copy className="h-3 w-3" />{copied === item.key ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </Field>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={CreditCard} title="Meios de pagamento" desc="Gateways de pagamento conectados à plataforma." />
                <div className="mt-6 space-y-2">
                  {[
                    { name: 'PIX (nativo)', desc: 'Integrado nativamente, sem configuração', status: 'active' },
                    { name: 'Pagar.me', desc: 'Cartão de crédito, débito e boleto', status: 'pending', config: true },
                    { name: 'Stripe', desc: 'Pagamentos internacionais', status: 'inactive', config: true },
                    { name: 'Mercado Pago', desc: 'Cartão, PIX e parcelamento', status: 'inactive', config: true },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          <span className={cn('text-[10px] font-mono',
                            p.status === 'active' ? 'text-green-400' : p.status === 'pending' ? 'text-yellow-400' : 'text-white/30')}>
                            {p.status === 'active' ? '● Ativo' : p.status === 'pending' ? '◐ Configurar' : '○ Inativo'}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40">{p.desc}</p>
                      </div>
                      {p.config && (
                        <button className="btn-secondary shrink-0 text-xs">Configurar</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={Bell} title="Notificações & Automação" desc="Canais para envio de mensagens e push." />
                <div className="mt-6 space-y-2">
                  {[
                    { name: 'WhatsApp Business (Meta)', desc: 'Ingressos e lembretes via WhatsApp oficial' },
                    { name: 'SMTP / E-mail', desc: 'Servidor próprio para e-mails transacionais' },
                    { name: 'Firebase Cloud Messaging', desc: 'Push notifications para o app mobile' },
                    { name: 'Webhook personalizado', desc: 'Envie eventos para qualquer URL' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{n.name}</p>
                        <p className="text-[11px] text-white/40">{n.desc}</p>
                      </div>
                      <button className="btn-secondary shrink-0 flex items-center gap-1.5 text-xs">
                        <Zap className="h-3 w-3" /> Conectar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING ─────────────────────────────────────────── */}
          {tab === 'billing' && (
            <div className="space-y-5 reveal">
              {/* Current plan */}
              <div className="rounded-2xl border border-[#0057E7]/25 bg-[#0057E7]/[0.05] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0057E7]">Plano atual</p>
                    <h2 className="mt-1 font-display text-3xl font-bold leading-none text-white">{currentPlan.label}</h2>
                    <p className="mt-1 text-sm text-white/50">{currentPlan.price} <span className="text-white/30">{currentPlan.priceNote}</span></p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-5 py-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0057E7]">Serviço</p>
                      <p className="mt-1 text-xl font-bold text-white">{currentPlan.ticketFee}</p>
                      <p className="text-[10px] text-white/30">do comprador</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-5 py-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4285F4]">Processamento</p>
                      <p className="mt-1 text-xl font-bold text-white">{currentPlan.processingFee}</p>
                      <p className="text-[10px] text-white/30">do produtor</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
                  {currentPlan.features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-white/60">
                      <CheckCircle2 className="h-3 w-3 text-[#0057E7] shrink-0" />{f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fee model explanation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#0057E7]">Taxa de Serviço</p>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    Cobrada do <strong className="text-white">comprador</strong> no checkout. Não impacta o repasse do produtor.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#4285F4]">Taxa de Processamento</p>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    Cobrada do <strong className="text-white">produtor</strong> sobre o repasse. Cobre o custo do gateway.
                  </p>
                </div>
              </div>

              {/* Plan comparison */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={BarChart3} title="Comparar planos" desc="Sympla 10%+2,5% · Ingresse 5-10% · Ticket360 até 18%" />
                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {(Object.entries(PLANS) as [string, typeof PLANS.starter][]).map(([key, plan]) => {
                    const isCurrent = key === planKey
                    return (
                      <div key={key} className={cn(
                        'flex flex-col rounded-2xl border p-4 transition-all',
                        isCurrent ? 'border-[#0057E7]/30 bg-[#0057E7]/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]',
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{plan.label}</span>
                          {isCurrent && <span className="rounded-md bg-[#0057E7]/20 px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#0057E7]">Atual</span>}
                        </div>
                        <p className="text-lg font-bold text-white leading-none">{plan.price}</p>
                        <p className="mb-3 text-[10px] text-white/30 font-mono">{plan.priceNote}</p>

                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 space-y-1 mb-3">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white/40">Serviço</span>
                            <span className="font-mono font-semibold text-[#0057E7]">{plan.ticketFee}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white/40">Processamento</span>
                            <span className="font-mono text-[#4285F4]">{plan.processingFee}</span>
                          </div>
                        </div>

                        <ul className="flex-1 space-y-1.5">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
                              <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[#0057E7]" />{f}
                            </li>
                          ))}
                        </ul>

                        {!isCurrent && (
                          <button className={cn('mt-4 w-full rounded-xl py-2.5 text-xs font-semibold transition-all',
                            key === 'enterprise' ? 'btn-secondary' : 'btn-primary')}>
                            {key === 'enterprise' ? 'Falar com vendas' : 'Fazer upgrade'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM ────────────────────────────────────────────── */}
          {tab === 'team' && (
            <div className="space-y-5 reveal">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={Users} title="Membros da equipe" desc="Usuários com acesso ao painel administrativo." />
                  <button onClick={() => setShowInviteModal(true)} className="btn-primary shrink-0 flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" /> Convidar
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                        {['Usuário', 'Perfil', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.length > 0 ? teamMembers.map((u, i) => (
                        <tr key={i} className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0057E7]/20 bg-[#0057E7]/10">
                                <span className="text-xs font-bold text-[#0057E7]">{(u.first_name?.[0] ?? '?').toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-medium text-white">
                                {`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'Usuário'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-lg bg-[#0057E7]/10 px-2.5 py-1 text-[11px] font-mono text-[#4285F4]">
                              {roleLabels[u.role] ?? u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn('rounded-lg px-2.5 py-1 text-[11px] font-semibold',
                              u.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/30')}>
                              {u.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {u.id === profile?.id && <span className="font-mono text-[10px] text-white/25">Você</span>}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-sm text-white/30">
                            Nenhum membro encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <SectionHeader icon={ShieldCheck} title="Perfis de acesso" desc="Níveis de permissão disponíveis para convidar." />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    { role: 'Administrador', desc: 'Acesso total, todas as funcionalidades' },
                    { role: 'Gerente', desc: 'Eventos, vendas, staff e relatórios' },
                    { role: 'Credenciamento', desc: 'Apenas portarias e QR Code' },
                    { role: 'PDV', desc: 'Apenas ponto de venda e caixa' },
                    { role: 'Financeiro', desc: 'Módulo financeiro e relatórios' },
                    { role: 'Visualização', desc: 'Somente leitura, sem edições' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0057E7]" />
                      <div>
                        <span className="text-xs font-semibold text-white">{r.role}</span>
                        <p className="text-[11px] text-white/40">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite Modal ─────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative w-full max-w-md animate-slide-up overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1525] shadow-2xl">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0057E7]">Equipe</p>
                  <h3 className="mt-1 text-lg font-bold text-white">Convidar usuário</h3>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {inviteSuccess ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
                  <p className="mt-3 text-sm font-semibold text-white">Convite enviado!</p>
                  <p className="mt-1 text-xs text-white/50">{inviteSuccess}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="E-mail do convidado *">
                    <Inp type="email" placeholder="email@exemplo.com"
                      value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()} />
                  </Field>
                  <Field label="Nível de acesso">
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#0057E7]/50"
                    >
                      <option value="org_admin" className="bg-[#0d1525]">Administrador</option>
                      <option value="org_manager" className="bg-[#0d1525]">Gerente</option>
                      <option value="checkin_operator" className="bg-[#0d1525]">Credenciamento</option>
                      <option value="pdv_operator" className="bg-[#0d1525]">PDV</option>
                      <option value="staff_member" className="bg-[#0d1525]">Staff</option>
                    </select>
                  </Field>
                  {inviteError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {inviteError}
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Cancelar</button>
                    <button onClick={handleInvite} disabled={inviting} className="btn-primary flex flex-1 items-center justify-center gap-2">
                      {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                      {inviting ? 'Enviando...' : 'Enviar convite'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
