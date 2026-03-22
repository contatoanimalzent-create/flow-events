import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/lib/utils'
import {
  Building2, Globe, Mail, Phone, Image, Palette,
  Key, Link2, Webhook, ShieldCheck, Bell, CreditCard,
  Loader2, CheckCircle2, AlertCircle, Save, Copy,
  ChevronRight, Eye, EyeOff, Zap, Package, Users,
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
  address_country: string
  primary_color: string
  logo_url: string
  description: string
}

const PLANS = {
  starter:  { label: 'Starter',     price: 'Grátis',     color: 'text-text-muted',   features: ['3 eventos/mês', '500 ingressos', 'QR Code básico', 'Check-in'] },
  pro:      { label: 'Pro',         price: 'R$ 149/mês', color: 'text-brand-acid',   features: ['Eventos ilimitados', '5.000 ingressos', 'PDV básico', 'Staff', 'Financeiro', 'WhatsApp básico'] },
  business: { label: 'Business',    price: 'R$ 349/mês', color: 'text-brand-blue',   features: ['Tudo do Pro', 'White-label', 'Fornecedores', 'Growth IA', 'Ticket Social', 'API access'] },
  enterprise:{ label: 'Enterprise', price: 'Sob consulta', color: 'text-brand-purple', features: ['Tudo do Business', 'Totem facial', 'Offline sync', 'Reconhecimento facial', 'SLA dedicado', 'Onboarding'] },
}

/* ── Main ───────────────────────────────────────────────────── */
export function SettingsPage() {
  const { organization, profile } = useAuthStore()
  const [tab, setTab] = useState<'org' | 'whitelabel' | 'integrations' | 'billing' | 'team'>('org')
  const [form, setForm] = useState<OrgForm>({
    name: '', slug: '', email: '', phone: '', website: '',
    address_city: '', address_state: '', address_country: 'Brasil',
    primary_color: '#d4ff00', logo_url: '', description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name ?? '',
        slug: organization.slug ?? '',
        email: organization.email ?? '',
        phone: organization.phone ?? '',
        website: (organization as unknown as Record<string, string>).website ?? '',
        address_city: '',
        address_state: '',
        address_country: 'Brasil',
        primary_color: (organization as unknown as Record<string, string>).primary_color ?? '#d4ff00',
        logo_url: organization.logo_url ?? '',
        description: (organization as unknown as Record<string, string>).description ?? '',
      })
      setLoading(false)
    }
  }, [organization])

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

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const mockApiKey = `ak_live_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxxxxxxxxxx`
  const mockWebhookSecret = `whsec_${organization?.id?.slice(0, 8) ?? 'xxxxxxxx'}xxxxxxxxxxxxxxxx`

  const planKey = organization?.plan ?? 'starter'
  const currentPlan = PLANS[planKey as keyof typeof PLANS] ?? PLANS.starter

  return (
    <div className="p-6 space-y-5 max-w-[1000px] mx-auto">

      {/* Header */}
      <div className="reveal">
        <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
          CONFIGURAÇÕES<span className="text-brand-acid">.</span>
        </h1>
        <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
          Organização, white-label e integrações
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-bg-border reveal" style={{ transitionDelay: '20ms' }}>
        {([
          { key: 'org', label: 'Organização', icon: Building2 },
          { key: 'whitelabel', label: 'White-label', icon: Palette },
          { key: 'integrations', label: 'Integrações', icon: Link2 },
          { key: 'billing', label: 'Plano & Cobrança', icon: CreditCard },
          { key: 'team', label: 'Equipe', icon: Users },
        ] as const).map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px',
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
              {/* Logo section */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Identidade da organização</h3>
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-sm bg-bg-surface border border-bg-border flex items-center justify-center overflow-hidden">
                      {form.logo_url ? (
                        <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-text-muted" />
                      )}
                    </div>
                    <button className="mt-2 text-xs text-brand-acid hover:underline font-mono block text-center">
                      Alterar logo
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
                          <input className="input pl-24" value={form.slug} onChange={e => set('slug', e.target.value)} readOnly />
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

              {/* Contact info */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Informações de contato</h3>
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

              {/* Save */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-text-muted">
                  ID da organização: <span className="font-mono text-text-secondary">{organization?.id}</span>
                </p>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex items-center gap-2">
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
                    <h3 className="text-sm font-semibold text-text-primary">White-label completo</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Com o plano Business ou Enterprise, seu comprador nunca vê a marca Animalz — vê apenas a sua.
                      Domínio próprio, e-mail próprio, cores e logo personalizados.
                    </p>
                    {planKey === 'starter' || planKey === 'pro' ? (
                      <button className="mt-3 btn-primary text-xs">Fazer upgrade para Business →</button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Cores da marca</h3>
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
                    <label className="input-label">Preview</label>
                    <div className="h-10 rounded-sm flex items-center px-4 text-xs font-bold text-bg-primary"
                      style={{ background: form.primary_color }}>
                      BOTÃO COMPRAR
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Domínio personalizado</h3>
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

              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">E-mail personalizado</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">E-mail de envio</label>
                    <input className="input" placeholder="noreply@suaempresa.com"
                      disabled={planKey === 'starter' || planKey === 'pro'} />
                  </div>
                  <div>
                    <label className="input-label">Nome de exibição</label>
                    <input className="input" placeholder="Nome Empresa Eventos"
                      disabled={planKey === 'starter' || planKey === 'pro'} />
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
              {/* API Keys */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-acid" /> API Keys
                </h3>
                <p className="text-xs text-text-muted mb-4">Use estas chaves para integrar com seu sistema ou conectar ferramentas externas.</p>
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Chave de API (Live)</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input className="input font-mono text-xs pr-9"
                          value={showApiKey ? mockApiKey : mockApiKey.replace(/./g, '•').slice(0, -8) + mockApiKey.slice(-8)}
                          readOnly />
                        <button onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button onClick={() => copyToClipboard(mockApiKey, 'api')}
                        className={cn('btn-secondary text-xs flex items-center gap-1 whitespace-nowrap',
                          copied === 'api' && 'text-status-success')}>
                        <Copy className="w-3 h-3" />
                        {copied === 'api' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Webhook Secret</label>
                    <div className="flex items-center gap-2">
                      <input className="input font-mono text-xs flex-1"
                        value={mockWebhookSecret.replace(/./g, '•').slice(0, -8) + mockWebhookSecret.slice(-8)}
                        readOnly />
                      <button onClick={() => copyToClipboard(mockWebhookSecret, 'webhook')}
                        className={cn('btn-secondary text-xs flex items-center gap-1 whitespace-nowrap',
                          copied === 'webhook' && 'text-status-success')}>
                        <Copy className="w-3 h-3" />
                        {copied === 'webhook' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment integrations */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-blue" /> Meios de pagamento
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'PIX (nativo)', desc: 'Integrado nativamente — sem configuração necessária', status: 'active', color: 'text-status-success' },
                    { name: 'Pagar.me', desc: 'Cartão de crédito, débito e boleto', status: 'pending', color: 'text-status-warning', hasConfig: true },
                    { name: 'Stripe', desc: 'Pagamentos internacionais — USD, EUR', status: 'inactive', color: 'text-text-muted', hasConfig: true },
                    { name: 'Mercado Pago', desc: 'Cartão, PIX e parcelamento', status: 'inactive', color: 'text-text-muted', hasConfig: true },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-bg-surface rounded-sm border border-bg-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{p.name}</span>
                          <span className={cn('text-[10px] font-mono', p.color)}>
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

              {/* Notification integrations */}
              <div className="card p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-teal" /> Notificações & Automação
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'WhatsApp Business (Meta)', desc: 'Envio de ingressos e lembretes via WhatsApp oficial', status: 'inactive', hasConfig: true },
                    { name: 'SMTP / E-mail', desc: 'Servidor de e-mail personalizado para transações', status: 'inactive', hasConfig: true },
                    { name: 'Firebase Cloud Messaging', desc: 'Push notifications para o app mobile', status: 'inactive', hasConfig: true },
                    { name: 'Webhook personalizado', desc: 'Envie eventos para qualquer URL externa', status: 'inactive', hasConfig: true },
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
              {/* Current plan */}
              <div className="card p-5 border-brand-acid/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-primary">Plano atual</h3>
                  <span className={cn('font-display text-lg leading-none', currentPlan.color)}>
                    {currentPlan.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3 h-3 text-brand-acid shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan comparison */}
              <h3 className="text-sm font-medium text-text-primary">Comparar planos</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(PLANS).map(([key, plan]) => {
                  const isCurrent = key === planKey
                  return (
                    <div key={key} className={cn('card p-4 transition-all', isCurrent && 'border-brand-acid/30 bg-brand-acid/3')}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn('font-display text-lg leading-none', plan.color)}>{plan.label}</span>
                        {isCurrent && <span className="text-[9px] font-mono bg-brand-acid/15 text-brand-acid px-1.5 py-0.5 rounded-sm">ATUAL</span>}
                      </div>
                      <div className="font-mono text-text-primary font-bold mb-3">{plan.price}</div>
                      <div className="space-y-1.5">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                            <CheckCircle2 className="w-2.5 h-2.5 text-brand-acid shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                      {!isCurrent && (
                        <button className={cn('mt-3 w-full text-xs py-2 rounded-sm font-medium transition-all',
                          key === 'enterprise' ? 'btn-secondary' : 'btn-primary')}>
                          {key === 'enterprise' ? 'Falar com vendas' : 'Fazer upgrade'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TEAM TAB ────────────────────────────────────────── */}
          {tab === 'team' && (
            <div className="space-y-5 reveal">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">Gerencie os usuários com acesso ao painel</p>
                <button className="btn-primary flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> Convidar usuário
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-bg-border">
                    <tr>{['Usuário', 'Perfil', 'Acesso', 'Último login', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[
                      { name: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : 'Admin', email: organization?.email ?? '', role: 'org_admin', label: 'Administrador', access: 'Total', lastLogin: 'Hoje' },
                    ].map((u, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-brand-acid/15 flex items-center justify-center">
                              <span className="text-xs font-bold text-brand-acid">{u.name[0] ?? 'A'}</span>
                            </div>
                            <div>
                              <div className="font-medium text-[13px]">{u.name || 'Administrador'}</div>
                              <div className="text-[11px] text-text-muted">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-xs bg-brand-acid/15 text-brand-acid px-2 py-0.5 rounded-sm font-mono">
                            {u.label}
                          </span>
                        </td>
                        <td className="table-cell text-xs text-text-secondary">{u.access}</td>
                        <td className="table-cell text-xs text-text-muted font-mono">{u.lastLogin}</td>
                        <td className="table-cell">
                          <span className="text-[10px] text-text-muted">Você</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role descriptions */}
              <div className="card p-5">
                <h4 className="text-sm font-medium text-text-primary mb-3">Perfis de acesso disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { role: 'Administrador', desc: 'Acesso total — todas as funcionalidades' },
                    { role: 'Gerente', desc: 'Acesso a eventos, vendas, staff e relatórios' },
                    { role: 'Check-in', desc: 'Apenas operação de portarias e QR Code' },
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
    </div>
  )
}
