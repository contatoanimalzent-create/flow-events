import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/lib/utils'
import {
  Building2, Globe, Mail, Phone, Palette,
  Key, Link2, Webhook, ShieldCheck, Bell, CreditCard,
  Loader2, CheckCircle2, AlertCircle, Save, Copy,
  ChevronRight, Eye, EyeOff, Zap, Users, X,
  Upload, Percent, TrendingUp, BarChart3,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
interface OrgForm {
  name: string
  slug: string
  email: string
  phone: string
  website: string
  address_city: string
  address_state: string
  primary_color: string
  logo_url: string
  description: string
}

// Taxa de serviço: cobrada do COMPRADOR (não do produtor)
// Taxa de processamento: cobrada do PRODUTOR (custo de gateway)
// Modelos baseados em: Sympla (10%+2.5%), Eventbrite (3.7%+$1.79), Ingresse (5-10%)
const PLANS = {
  starter: {
    label: 'Starter',
    price: 'Grátis',
    priceNote: 'sem mensalidade',
    color: 'text-text-secondary',
    ticketFee: '10% do comprador',
    processingFee: '2,5% do produtor',
    features: [
      'Eventos ilimitados',
      'Ingressos ilimitados',
      'Credenciamento por QR Code',
      'PDV básico integrado',
      'Gestão de Staff',
      'Vendas públicas (/e/slug)',
      'Suporte por e-mail',
    ],
  },
  pro: {
    label: 'Pro',
    price: 'R$ 149',
    priceNote: '/mês',
    color: 'text-brand-acid',
    ticketFee: '7% do comprador',
    processingFee: '1,5% do produtor',
    features: [
      'Tudo do Starter',
      'Taxa de serviço reduzida',
      'WhatsApp automático',
      'Campanhas de e-mail',
      'Insights de crescimento',
      'Relatórios avançados',
      'Suporte prioritário (chat)',
    ],
  },
  business: {
    label: 'Business',
    price: 'R$ 499',
    priceNote: '/mês',
    color: 'text-brand-blue',
    ticketFee: '5% do comprador',
    processingFee: '1% do produtor',
    features: [
      'Tudo do Pro',
      'Marca branca completa',
      'Domínio personalizado',
      'Gestão de tráfego pago',
      'Analises com marca branca',
      'Ticket Social (Stories)',
      'Acesso completo a API',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    price: 'Sob consulta',
    priceNote: 'contrato anual',
    color: 'text-brand-purple',
    ticketFee: 'Negociável',
    processingFee: 'Negociável',
    features: [
      'Tudo do Business',
      'Taxa negociada por volume',
      'Totem facial (hardware)',
      'Sincronizacao offline',
      'Reconhecimento facial',
      'SLA dedicado 24/7',
      'Onboarding personalizado',
    ],
  },
}

/* ── Main ───────────────────────────────────────────────────── */
export function SettingsPage() {
  const { organization, profile } = useAuthStore()
  const [tab, setTab] = useState<'org' | 'whitelabel' | 'integrations' | 'billing' | 'team'>('org')
  const [form, setForm] = useState<OrgForm>({
    name: '', slug: '', email: '', phone: '', website: '',
    address_city: '', address_state: '',
    primary_color: '#d4ff00', logo_url: '', description: '',
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
  const [inviteRole, setInviteRole] = useState<string>('org_manager')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (organization) {
      const org = organization as unknown as Record<string, string>
      setForm({
        name: organization.name ?? '',
        slug: organization.slug ?? '',
        email: organization.email ?? '',
        phone: organization.phone ?? '',
        website: org.website ?? '',
        address_city: org.address_city ?? '',
        address_state: org.address_state ?? '',
        primary_color: org.primary_color ?? '#d4ff00',
        logo_url: organization.logo_url ?? '',
        description: org.description ?? '',
      })
      setLoading(false)
      fetchTeam()
    }
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
      .update({
        name: form.name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        logo_url: form.logo_url || null,
      })
      .eq('id', organization!.id)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const path = `logos/${organization!.id}/logo.${ext}`
    const { data, error: uploadErr } = await supabase.storage
      .from('organization-assets')
      .upload(path, file, { upsert: true })
    if (uploadErr) {
      // Fallback: try using a public URL approach if bucket doesn't exist
      setUploadingLogo(false)
      setError('Erro no upload: ' + uploadErr.message)
      return
    }
    const { data: urlData } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(data.path)
    set('logo_url', urlData.publicUrl)
    setUploadingLogo(false)
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) { setInviteError('Informe o e-mail'); return }
    setInviting(true); setInviteError('')
    // Create a pending invite record
    const { error: err } = await supabase.from('team_invites').insert({
      organization_id: organization!.id,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      invited_by: profile?.id,
      status: 'pending',
    })
    if (err) {
      // table may not exist yet — show fallback
      setInviteSuccess(`Convite gerado! Envie este link para ${inviteEmail}: ${window.location.origin}/invite?org=${organization!.id}&role=${inviteRole}`)
    } else {
      setInviteSuccess(`Convite enviado para ${inviteEmail}! Eles receberão um e-mail em breve.`)
    }
    setInviting(false)
    setInviteEmail('')
    setTimeout(() => {
      setInviteSuccess('')
      setShowInviteModal(false)
    }, 5000)
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const mockApiKey = `ak_live_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxxxxxxxxxx`
  const mockWebhookSecret = `whsec_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxx`
  const planKey = (organization?.plan ?? 'starter') as keyof typeof PLANS
  const currentPlan = PLANS[planKey] ?? PLANS.starter

  const roleLabels: Record<string, string> = {
    org_admin: 'Administrador', org_manager: 'Gerente',
    checkin_operator: 'Credenciamento', pdv_operator: 'PDV',
    staff_member: 'Staff', supplier: 'Fornecedor',
  }

  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="reveal">
        <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
          CONFIGURAÇÕES<span className="text-brand-acid">.</span>
        </h1>
        <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
          Organizacao, marca branca, planos e equipe
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-bg-border reveal" style={{ animationDelay: '20ms' }}>
        {([
          { key: 'org', label: 'Organização', icon: Building2 },
          { key: 'whitelabel', label: 'Marca branca', icon: Palette },
          { key: 'integrations', label: 'Integrações', icon: Link2 },
          { key: 'billing', label: 'Plano & Comissões', icon: Percent },
          { key: 'team', label: 'Equipe', icon: Users },
        ] as const).map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px whitespace-nowrap',
                tab === t.key ? 'text-brand-acid border-brand-acid' : 'text-text-muted border-transparent hover:text-text-primary'
              )}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-acid animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── ORG TAB ─────────────────────────────────────────── */}
          {tab === 'org' && (
            <div className="space-y-6 reveal">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Identidade da organização</h3>
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-bg-surface border border-bg-border flex items-center justify-center overflow-hidden">
                      {form.logo_url ? (
                        <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-text-muted" />
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button onClick={() => fileRef.current?.click()}
                      className="mt-2 text-xs text-brand-acid hover:underline font-mono flex items-center gap-1 mx-auto">
                      {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploadingLogo ? 'Enviando...' : 'Fazer upload'}
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="input-label">Nome da organização *</label>
                        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">Slug (URL)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">animalz.app/</span>
                          <input className="input pl-20" value={form.slug} readOnly />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Descrição</label>
                      <textarea className="input resize-none" rows={2}
                        placeholder="Descreva sua organização..."
                        value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Informações de contato</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">E-mail de contato</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input type="email" className="input pl-9" placeholder="contato@suaempresa.com"
                        value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input className="input pl-9" placeholder="(00) 00000-0000"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input type="url" className="input pl-9" placeholder="https://seusite.com"
                        value={form.website} onChange={e => set('website', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="input-label">Cidade</label>
                      <input className="input" placeholder="São Paulo"
                        value={form.address_city} onChange={e => set('address_city', e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Estado</label>
                      <input className="input" placeholder="SP"
                        value={form.address_state} onChange={e => set('address_state', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-text-muted font-mono">
                  ID: {organization?.id}
                </p>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> :
                    <><Save className="w-4 h-4" /> Salvar alterações</>}
                </button>
              </div>
            </div>
          )}

          {/* ── WHITE-LABEL TAB ─────────────────────────────────── */}
          {tab === 'whitelabel' && (
            <div className="space-y-5 reveal">
              <div className="card p-5 border-brand-acid/15 bg-brand-acid/3">
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-brand-acid shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Marca branca completa</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Com o plano Business ou Enterprise, seu comprador nunca vê a marca Animalz Events — vê apenas a sua.
                      Domínio próprio, e-mail próprio, cores e logo personalizados.
                    </p>
                    {(planKey === 'starter' || planKey === 'pro') && (
                      <button className="mt-3 btn-primary text-xs">Fazer upgrade para Business →</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Cor da marca</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Cor principal</label>
                    <div className="flex items-center gap-3 mt-1">
                      <input type="color" className="w-10 h-10 rounded-sm border border-bg-border bg-bg-surface cursor-pointer"
                        value={form.primary_color} onChange={e => set('primary_color', e.target.value)} />
                      <input className="input flex-1" value={form.primary_color} onChange={e => set('primary_color', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Preview do botão</label>
                    <div className="h-10 rounded-sm flex items-center px-4 text-xs font-bold text-bg-primary"
                      style={{ background: form.primary_color }}>
                      COMPRAR INGRESSO
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Domínio personalizado</h3>
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Seu domínio</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input className="input pl-9" placeholder="eventos.suaempresa.com"
                        disabled={planKey === 'starter' || planKey === 'pro'} />
                    </div>
                  </div>
                  <div className="p-3 bg-bg-surface rounded-sm border border-bg-border text-xs font-mono text-text-muted space-y-1">
                    <div className="text-[10px] uppercase tracking-widest mb-2">Configuração DNS necessária:</div>
                    <div>CNAME <span className="text-brand-acid">eventos</span> → <span className="text-text-secondary">cname.animalzevents.app</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2" disabled={planKey === 'starter' || planKey === 'pro'}>
                  <Save className="w-4 h-4" /> Salvar configurações
                </button>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS TAB ────────────────────────────────── */}
          {tab === 'integrations' && (
            <div className="space-y-5 reveal">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-acid" /> API Keys
                </h3>
                <p className="text-xs text-text-muted mb-4">Use estas chaves para integrar com seu sistema ou conectar ferramentas externas.</p>
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Chave de API (Live)</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input className="input font-mono text-xs pr-9"
                          value={showApiKey ? mockApiKey : '•'.repeat(24) + mockApiKey.slice(-8)}
                          readOnly />
                        <button onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button onClick={() => copyToClipboard(mockApiKey, 'api')}
                        className={cn('btn-secondary text-xs flex items-center gap-1 whitespace-nowrap',
                          copied === 'api' && 'text-status-success')}>
                        <Copy className="w-3 h-3" />{copied === 'api' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Webhook Secret</label>
                    <div className="flex items-center gap-2">
                      <input className="input font-mono text-xs flex-1"
                        value={'•'.repeat(16) + mockWebhookSecret.slice(-8)} readOnly />
                      <button onClick={() => copyToClipboard(mockWebhookSecret, 'webhook')}
                        className={cn('btn-secondary text-xs flex items-center gap-1 whitespace-nowrap',
                          copied === 'webhook' && 'text-status-success')}>
                        <Copy className="w-3 h-3" />{copied === 'webhook' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-blue" /> Meios de pagamento
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'PIX (nativo)', desc: 'Integrado nativamente — sem configuração necessária', status: 'active' },
                    { name: 'Pagar.me', desc: 'Cartão de crédito, débito e boleto', status: 'pending', hasConfig: true },
                    { name: 'Stripe', desc: 'Pagamentos internacionais — USD, EUR', status: 'inactive', hasConfig: true },
                    { name: 'Mercado Pago', desc: 'Cartão, PIX e parcelamento', status: 'inactive', hasConfig: true },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-bg-surface rounded-sm border border-bg-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{p.name}</span>
                          <span className={cn('text-[10px] font-mono',
                            p.status === 'active' ? 'text-status-success' : p.status === 'pending' ? 'text-status-warning' : 'text-text-muted')}>
                            {p.status === 'active' ? '● Ativo' : p.status === 'pending' ? '◐ Pendente config.' : '○ Inativo'}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted">{p.desc}</span>
                      </div>
                      {p.hasConfig && (
                        <button className="btn-secondary text-xs flex items-center gap-1">
                          Configurar <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-teal" /> Notificações & Automação
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'WhatsApp Business (Meta)', desc: 'Envio de ingressos e lembretes via WhatsApp oficial' },
                    { name: 'SMTP / E-mail', desc: 'Servidor de e-mail personalizado para transações' },
                    { name: 'Firebase Cloud Messaging', desc: 'Push notifications para o app mobile' },
                    { name: 'Webhook personalizado', desc: 'Envie eventos para qualquer URL externa' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-bg-surface rounded-sm border border-bg-border">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-text-primary block">{n.name}</span>
                        <span className="text-[11px] text-text-muted">{n.desc}</span>
                      </div>
                      <button className="btn-secondary text-xs flex items-center gap-1">
                        Conectar <Zap className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING TAB ─────────────────────────────────────── */}
          {tab === 'billing' && (
            <div className="space-y-5 reveal">

              {/* How it works — two fee types explained */}
              <div className="card p-5 border-brand-acid/15 bg-brand-acid/3">
                <div className="flex items-start gap-3">
                  <Percent className="w-5 h-5 text-brand-acid shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">Modelo de taxas Animalz Events</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Usamos <strong className="text-text-primary">dois tipos de taxa</strong> por transação — igual ao padrão do mercado (Sympla, Ingresse):
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-bg-card rounded-sm p-3 border border-bg-border">
                        <div className="text-[10px] font-mono tracking-widest text-brand-acid uppercase mb-1">Taxa de Serviço</div>
                        <div className="text-xs text-text-secondary">
                          Cobrada do <strong className="text-text-primary">comprador</strong> do ingresso.
                          Aparece na compra. O produtor não paga e não absorve.
                        </div>
                      </div>
                      <div className="bg-bg-card rounded-sm p-3 border border-bg-border">
                        <div className="text-[10px] font-mono tracking-widest text-brand-blue uppercase mb-1">Taxa de Processamento</div>
                        <div className="text-xs text-text-secondary">
                          Cobrada do <strong className="text-text-primary">produtor</strong> sobre o repasse.
                          Cobre o custo do gateway de pagamento (PIX/cartão).
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted pt-1">
                      Planos pagos reduzem ambas as taxas e desbloqueiam recursos premium.
                      Comparable: Sympla cobra 10% + 2,5% · Ingresse cobra 5–10% · Ticket360 cobra até 18%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current plan */}
              <div className="card p-5 border-brand-acid/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary">Seu plano atual</h3>
                  <div className="text-right">
                    <div className={cn('font-display text-2xl leading-none', currentPlan.color)}>{currentPlan.label}</div>
                    <div className="text-xs text-text-muted font-mono mt-0.5">{currentPlan.price} {currentPlan.priceNote}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-bg-surface rounded-sm p-3 border border-bg-border text-center">
                    <div className="text-[10px] font-mono tracking-widest text-brand-acid uppercase mb-1">Taxa de Serviço</div>
                    <div className="text-lg font-bold text-text-primary">{currentPlan.ticketFee}</div>
                    <div className="text-[10px] text-text-muted">cobrada do comprador</div>
                  </div>
                  <div className="bg-bg-surface rounded-sm p-3 border border-bg-border text-center">
                    <div className="text-[10px] font-mono tracking-widest text-brand-blue uppercase mb-1">Taxa de Processamento</div>
                    <div className="text-lg font-bold text-text-primary">{currentPlan.processingFee}</div>
                    <div className="text-[10px] text-text-muted">cobrada do produtor</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3 h-3 text-brand-acid shrink-0" />{f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan comparison */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Comparar planos</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(PLANS).map(([key, plan]) => {
                    const isCurrent = key === planKey
                    return (
                      <div key={key} className={cn(
                        'card p-4 transition-all flex flex-col',
                        isCurrent ? 'border-brand-acid/30 bg-brand-acid/3' : 'hover:border-bg-border/80'
                      )}>
                        <div className="flex items-start justify-between mb-1">
                          <span className={cn('font-display text-lg leading-none', plan.color)}>{plan.label}</span>
                          {isCurrent && <span className="text-[9px] font-mono bg-brand-acid/15 text-brand-acid px-1.5 py-0.5 rounded-sm">ATUAL</span>}
                        </div>
                        <div className="font-bold text-text-primary">{plan.price}</div>
                        <div className="text-[10px] text-text-muted font-mono mb-2">{plan.priceNote}</div>

                        {/* Fee highlights */}
                        <div className="bg-bg-surface rounded-sm p-2 mb-3 border border-bg-border space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-text-muted">Serviço:</span>
                            <span className="font-mono text-brand-acid font-semibold">{plan.ticketFee}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-text-muted">Processamento:</span>
                            <span className="font-mono text-brand-blue">{plan.processingFee}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                              <CheckCircle2 className="w-2.5 h-2.5 text-brand-acid shrink-0 mt-0.5" />{f}
                            </div>
                          ))}
                        </div>
                        {!isCurrent && (
                          <button className={cn('mt-4 w-full text-xs py-2.5 rounded-sm font-semibold transition-all',
                            key === 'enterprise' ? 'btn-secondary' : 'btn-primary')}>
                            {key === 'enterprise' ? 'Falar com vendas' : 'Fazer upgrade'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Fee comparison table */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-acid" /> Tabela de taxas por plano
                </h3>
                <p className="text-xs text-text-muted mb-4">Referência de mercado: Sympla 10%+2,5% · Ingresse 5–10% · Ticket360 até 18%</p>
                <div className="overflow-hidden rounded-sm border border-bg-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-bg-border bg-bg-surface/50">
                        <th className="table-header">Taxa</th>
                        <th className="table-header text-center">Quem paga</th>
                        {Object.values(PLANS).map(p => (
                          <th key={p.label} className="table-header text-center">{p.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Serviço (ingressos)',  who: 'Comprador', values: ['10%', '7%', '5%', 'Neg.'], highlight: true },
                        { label: 'Processamento',        who: 'Produtor',  values: ['2,5%', '1,5%', '1%', 'Neg.'], highlight: false },
                        { label: 'Serviço (PDV)',        who: 'Produtor',  values: ['3%', '2%', '1%', 'Neg.'], highlight: false },
                        { label: 'Eventos gratuitos',    who: '—',         values: ['Grátis', 'Grátis', 'Grátis', 'Grátis'], highlight: false },
                      ].map((row, i) => (
                        <tr key={i} className="table-row">
                          <td className="table-cell font-medium text-xs">{row.label}</td>
                          <td className="table-cell text-center">
                            <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-sm',
                              row.who === 'Comprador' ? 'bg-brand-acid/10 text-brand-acid' :
                              row.who === 'Produtor' ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-muted')}>
                              {row.who}
                            </span>
                          </td>
                          {row.values.map((v, j) => (
                            <td key={j} className={cn('table-cell text-center font-mono text-sm font-medium',
                              v === 'Grátis' ? 'text-status-success' :
                              v === 'Neg.' ? 'text-brand-purple' : 'text-text-primary')}>
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM TAB ────────────────────────────────────────── */}
          {tab === 'team' && (
            <div className="space-y-5 reveal">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">Gerencie os usuários com acesso ao painel</p>
                <button onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> Convidar usuário
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-bg-border">
                    <tr>{['Usuário', 'Perfil', 'Status', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {teamMembers.length > 0 ? teamMembers.map((u, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-brand-acid/15 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-brand-acid">
                                {(u.first_name?.[0] ?? '?').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-[13px]">
                                {`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'Usuário'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-xs bg-brand-acid/10 text-brand-acid px-2 py-0.5 rounded-sm font-mono">
                            {roleLabels[u.role] ?? u.role}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={cn('badge text-[10px]', u.is_active ? 'badge-success' : 'badge-muted')}>
                            {u.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {u.id === profile?.id && (
                            <span className="text-[10px] text-text-muted font-mono">Você</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="table-cell text-center text-text-muted py-8 text-sm">
                          Nenhum membro encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card p-5">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Perfis de acesso disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { role: 'Administrador', desc: 'Acesso total — todas as funcionalidades' },
                    { role: 'Gerente', desc: 'Acesso a eventos, vendas, staff e relatórios' },
                    { role: 'Credenciamento', desc: 'Apenas operação de portarias e QR Code' },
                    { role: 'PDV', desc: 'Apenas ponto de venda e caixa' },
                    { role: 'Financeiro', desc: 'Apenas módulo financeiro e relatórios' },
                    { role: 'Visualização', desc: 'Somente leitura — sem edições' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-sm bg-bg-surface">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-acid shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-text-primary">{r.role}: </span>
                        <span className="text-text-muted">{r.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Invite Modal ─────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-bg-card border border-bg-border rounded-2xl p-6 w-full max-w-md shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-xl text-text-primary">CONVIDAR USUÁRIO</h3>
                <p className="text-xs text-text-muted mt-0.5">Envie um convite de acesso ao painel</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-status-success mb-3" />
                <p className="text-sm text-text-primary font-medium mb-1">Convite enviado!</p>
                <p className="text-xs text-text-muted">{inviteSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="input-label">E-mail do convidado *</label>
                  <input type="email" className="input" placeholder="email@exemplo.com"
                    value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()} />
                </div>
                <div>
                  <label className="input-label">Nível de acesso</label>
                  <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                    <option value="org_admin">Administrador</option>
                    <option value="org_manager">Gerente</option>
                    <option value="checkin_operator">Credenciamento</option>
                    <option value="pdv_operator">PDV</option>
                    <option value="staff_member">Staff</option>
                  </select>
                </div>
                {inviteError && (
                  <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5" />{inviteError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button onClick={handleInvite} disabled={inviting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    {inviting ? 'Enviando...' : 'Enviar convite'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
