import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { formatDate, cn } from '@/lib/utils'
import {
  MessageSquare, Mail, Send, Plus, Search, Edit2, Trash2,
  Loader2, X, AlertCircle, Instagram, Smartphone,
  Zap, Star, Share2, CheckCircle2, Clock, Users,
  Image, FileText, Megaphone, Bell, ChevronRight,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type CampaignType = 'email' | 'whatsapp' | 'sms' | 'push'
type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled'
type TemplateType = 'confirmation' | 'reminder' | 'checkin_open' | 'ticket_social' | 'promotional' | 'thank_you'

interface Campaign {
  id: string
  name: string
  channel: CampaignType
  status: CampaignStatus
  subject?: string
  body: string
  audience_filter?: Record<string, unknown>
  scheduled_at?: string
  sent_count?: number
  opened_count?: number
  clicked_count?: number
  event_id?: string
  created_at: string
}

interface Template {
  id: string
  name: string
  type: TemplateType
  channel: CampaignType
  subject?: string
  body: string
  is_active: boolean
}

const CHANNEL_CONFIG: Record<CampaignType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  email:    { label: 'E-mail',    icon: Mail,          color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare,  color: 'text-status-success', bg: 'bg-status-success/10' },
  sms:      { label: 'SMS',      icon: Smartphone,     color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  push:     { label: 'Push',     icon: Bell,           color: 'text-brand-teal',   bg: 'bg-brand-teal/10' },
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  draft:     { label: 'Rascunho',  color: 'text-text-muted',     dot: 'bg-text-muted' },
  scheduled: { label: 'Agendado',  color: 'text-status-warning', dot: 'bg-status-warning' },
  sent:      { label: 'Enviado',   color: 'text-status-success', dot: 'bg-status-success' },
  cancelled: { label: 'Cancelado', color: 'text-status-error',   dot: 'bg-status-error' },
}

const TEMPLATE_TYPES: Record<TemplateType, { label: string; description: string; icon: React.ElementType }> = {
  confirmation:  { label: 'Confirmação de compra', description: 'Enviado após pagamento confirmado', icon: CheckCircle2 },
  reminder:      { label: 'Lembrete do evento',    description: '24h e 1h antes do evento começar', icon: Clock },
  checkin_open:  { label: 'Check-in aberto',       description: 'Aviso de abertura das portarias',  icon: Zap },
  ticket_social: { label: 'Ticket Social',         description: 'Arte para Stories do Instagram',   icon: Instagram },
  promotional:   { label: 'Campanha promocional',  description: 'Divulgação e oferta especial',     icon: Megaphone },
  thank_you:     { label: 'Pós-evento',            description: 'Agradecimento e avaliação',        icon: Star },
}

/* ── Default Templates ──────────────────────────────────────── */
const DEFAULT_TEMPLATES: Omit<Template, 'id'>[] = [
  {
    name: 'Confirmação de compra',
    type: 'confirmation',
    channel: 'email',
    subject: '🎟️ Seu ingresso está confirmado — {{event_name}}',
    body: `Oi {{buyer_name}},\n\nSeu ingresso para {{event_name}} está confirmado! 🎉\n\n📅 Data: {{event_date}}\n📍 Local: {{venue_name}}\n🎫 Ingresso: {{ticket_type}}\n\nSeu QR Code está anexo neste e-mail. Guarde com carinho!\n\nAté lá 🤘`,
    is_active: true,
  },
  {
    name: 'Lembrete 24h',
    type: 'reminder',
    channel: 'whatsapp',
    body: `Ei {{buyer_name}}! 👋\n\nAmanhã é dia de *{{event_name}}*! 🔥\n\n🕐 Abertura das portas: {{doors_open}}\n📍 Local: {{venue_name}}\n\nSeu ingresso já está no app. Não esqueça! 🎫`,
    is_active: true,
  },
  {
    name: 'Portarias abertas',
    type: 'checkin_open',
    channel: 'push',
    subject: '🚨 Check-in aberto!',
    body: `As portarias de {{event_name}} estão abertas! Venha com seu QR Code em mãos. Boa festa! 🎉`,
    is_active: true,
  },
  {
    name: 'Pós-evento',
    type: 'thank_you',
    channel: 'email',
    subject: '💛 Obrigado por ter estado lá — {{event_name}}',
    body: `{{buyer_name}}, que experiência incrível!\n\nFoi incrível ter você em {{event_name}}. Esperamos que tenha sido uma noite inesquecível. 🙏\n\nFique de olho nos próximos eventos — você vai querer estar lá!\n\nCom amor,\n{{org_name}}`,
    is_active: true,
  },
]

/* ── Main ───────────────────────────────────────────────────── */
export function CommunicationPage() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<'campaigns' | 'templates' | 'social' | 'automations'>('campaigns')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | CampaignType>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    if (organization) fetchCampaigns()
  }, [organization])

  async function fetchCampaigns() {
    setLoading(true)
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: false })
    setCampaigns((data ?? []) as Campaign[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta campanha?')) return
    await supabase.from('campaigns').delete().eq('id', id)
    fetchCampaigns()
  }

  const filtered = campaigns.filter(c => {
    if (typeFilter !== 'all' && c.channel !== typeFilter) return false
    if (!search) return true
    return c.name.toLowerCase().includes(search.toLowerCase())
  })

  const totalSent = campaigns.filter(c => c.status === 'sent').reduce((s, c) => s + (c.sent_count ?? 0), 0)
  const avgOpen = campaigns.filter(c => c.opened_count && c.sent_count).length > 0
    ? Math.round(campaigns.filter(c => c.opened_count).reduce((s, c) => s + ((c.opened_count ?? 0) / (c.sent_count ?? 1) * 100), 0) / campaigns.filter(c => c.opened_count).length)
    : 0

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between reveal">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-text-primary leading-none">
            COMUNICAÇÃO<span className="text-brand-acid">.</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono tracking-wider">
            Campanhas, templates e automações
          </p>
        </div>
        {tab === 'campaigns' && (
          <button onClick={() => { setEditingCampaign(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova campanha
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal" style={{ transitionDelay: '30ms' }}>
        {[
          { label: 'Campanhas', value: campaigns.length, icon: Megaphone, color: 'text-brand-acid' },
          { label: 'Msgs enviadas', value: totalSent.toLocaleString('pt-BR'), icon: Send, color: 'text-brand-blue' },
          { label: 'Taxa de abertura', value: `${avgOpen}%`, icon: Mail, color: 'text-status-success' },
          { label: 'Automações ativas', value: '3', icon: Zap, color: 'text-brand-teal' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{s.label}</span>
                <Icon className={cn('w-3.5 h-3.5', s.color)} />
              </div>
              <div className={cn('text-xl font-semibold', s.color)}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-bg-border reveal" style={{ transitionDelay: '40ms' }}>
        {([
          { key: 'campaigns', label: 'Campanhas', icon: Megaphone },
          { key: 'templates', label: 'Templates', icon: FileText },
          { key: 'social', label: 'Ticket Social', icon: Instagram },
          { key: 'automations', label: 'Automações', icon: Zap },
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

      {/* ── CAMPAIGNS TAB ─────────────────────────────────────── */}
      {tab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input className="input pl-9 h-9 text-sm" placeholder="Buscar campanha..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setTypeFilter('all')}
                className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all',
                  typeFilter === 'all' ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                Todos
              </button>
              {Object.entries(CHANNEL_CONFIG).map(([k, v]) => {
                const Icon = v.icon
                return (
                  <button key={k} onClick={() => setTypeFilter(k as CampaignType)}
                    className={cn('px-3 py-1.5 rounded-sm text-xs font-medium transition-all flex items-center gap-1',
                      typeFilter === k ? 'bg-brand-acid text-bg-primary' : 'text-text-muted border border-transparent hover:border-bg-border')}>
                    <Icon className="w-3 h-3" /> {v.label}
                  </button>
                )
              })}
            </div>
          </div>

          {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-acid animate-spin" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="card p-16 flex flex-col items-center text-center">
              <Megaphone className="w-10 h-10 text-text-muted mb-3" />
              <div className="font-display text-2xl text-text-primary mb-1">NENHUMA CAMPANHA</div>
              <p className="text-sm text-text-muted mb-5">Crie campanhas para se comunicar com seu público</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">+ Nova campanha</button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((c, i) => {
                const chCfg = CHANNEL_CONFIG[c.channel]
                const stCfg = STATUS_CONFIG[c.status]
                const Icon = chCfg.icon
                const openRate = c.sent_count && c.opened_count ? Math.round((c.opened_count / c.sent_count) * 100) : null
                return (
                  <div key={c.id} className="card p-4 reveal flex items-center gap-4" style={{ transitionDelay: `${i * 40}ms` }}>
                    <div className={cn('w-10 h-10 rounded-sm flex items-center justify-center shrink-0', chCfg.bg)}>
                      <Icon className={cn('w-4 h-4', chCfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13px] text-text-primary">{c.name}</span>
                        <span className={cn('flex items-center gap-1 text-[10px] font-mono', stCfg.color)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', stCfg.dot)} />
                          {stCfg.label}
                        </span>
                      </div>
                      {c.subject && <div className="text-[11px] text-text-muted truncate">{c.subject}</div>}
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-text-muted">
                        {c.scheduled_at && <span>Agendado: {formatDate(c.scheduled_at, 'dd/MM HH:mm')}</span>}
                        {c.sent_count && <span>{c.sent_count.toLocaleString()} enviados</span>}
                        {openRate !== null && <span className="text-status-success">{openRate}% abertura</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setEditingCampaign(c); setShowForm(true) }}
                        className="p-1.5 rounded-sm text-text-muted hover:text-brand-acid hover:bg-brand-acid/8 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {c.status === 'draft' && (
                        <button className="ml-1 btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                          <Send className="w-3 h-3" /> Enviar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATES TAB ─────────────────────────────────────── */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Templates padrão prontos para usar. Personalize as variáveis entre {'{{chaves}}'} antes de enviar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_TEMPLATES.map((t, i) => {
              const typeCfg = TEMPLATE_TYPES[t.type]
              const chCfg = CHANNEL_CONFIG[t.channel]
              const TypeIcon = typeCfg.icon
              const ChIcon = chCfg.icon
              return (
                <div key={i} className="card p-5 reveal group" style={{ transitionDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm bg-brand-acid/10 flex items-center justify-center">
                        <TypeIcon className="w-4 h-4 text-brand-acid" />
                      </div>
                      <div>
                        <div className="font-medium text-[13px] text-text-primary">{typeCfg.label}</div>
                        <div className="text-[11px] text-text-muted">{typeCfg.description}</div>
                      </div>
                    </div>
                    <span className={cn('flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-sm', chCfg.bg, chCfg.color)}>
                      <ChIcon className="w-3 h-3" /> {chCfg.label}
                    </span>
                  </div>
                  {t.subject && (
                    <div className="text-[11px] text-text-muted mb-2 font-medium">{t.subject}</div>
                  )}
                  <div className="bg-bg-surface rounded-sm p-3 text-[11px] text-text-secondary font-mono whitespace-pre-line line-clamp-4 border border-bg-border">
                    {t.body}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button className="btn-secondary text-xs flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Personalizar
                    </button>
                    <button className="btn-primary text-xs flex items-center gap-1">
                      <Send className="w-3 h-3" /> Usar template
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TICKET SOCIAL TAB ─────────────────────────────────── */}
      {tab === 'social' && (
        <div className="space-y-6">
          {/* Highlight card */}
          <div className="card p-6 border-brand-acid/20 bg-brand-acid/3 reveal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-brand-acid/20 flex items-center justify-center shrink-0">
                <Instagram className="w-6 h-6 text-brand-acid" />
              </div>
              <div>
                <h3 className="font-display text-xl text-text-primary leading-none mb-1">
                  TICKET SOCIAL<span className="text-brand-acid">.</span>
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  Transforme cada ingresso vendido em marketing orgânico. O comprador recebe o QR Code
                  já formatado como arte para Instagram Stories — pronto para postar e divulgar o evento automaticamente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: Share2, title: 'Marketing orgânico', desc: 'Cada comprador se torna um divulgador espontâneo do evento' },
                    { icon: Image, title: 'Arte pronta para Stories', desc: 'Layout gerado automaticamente com identidade do produtor' },
                    { icon: Zap, title: 'Zero esforço para o comprador', desc: 'Recebe a arte por e-mail e WhatsApp, só clicar e postar' },
                  ].map((f, i) => {
                    const FIcon = f.icon
                    return (
                      <div key={i} className="bg-bg-surface rounded-sm p-3 border border-bg-border">
                        <FIcon className="w-4 h-4 text-brand-acid mb-2" />
                        <div className="text-xs font-semibold text-text-primary mb-1">{f.title}</div>
                        <div className="text-[11px] text-text-muted">{f.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Template preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3">Preview do Ticket Social</h4>
              <div className="relative w-full max-w-[240px] mx-auto aspect-[9/16] bg-gradient-to-br from-bg-card to-bg-surface rounded-sm border border-bg-border overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-[8px] font-mono text-brand-acid tracking-widest uppercase mb-4 opacity-60">SEU LOGO AQUI</div>
                  <div className="font-display text-2xl text-text-primary leading-none mb-2">EVENTO<br />2025</div>
                  <div className="text-[10px] text-text-muted mb-4">São Paulo · 15 JAN · 22H</div>
                  <div className="w-16 h-16 bg-brand-acid/20 border border-brand-acid/40 rounded-sm flex items-center justify-center mb-3">
                    <span className="text-[8px] font-mono text-brand-acid">QR CODE</span>
                  </div>
                  <div className="text-[9px] font-mono text-text-muted">INGRESSO • VIP</div>
                  <div className="text-[8px] font-mono text-brand-acid mt-1">JOÃO SILVA</div>
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1 text-[7px] text-text-muted font-mono tracking-widest">
                    POWERED BY ANIMALZ EVENTS
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-text-primary">Configurar Ticket Social</h4>
              <div className="space-y-3">
                <div>
                  <label className="input-label">Logo da organização</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-bg-surface border border-bg-border rounded-sm flex items-center justify-center">
                      <Image className="w-4 h-4 text-text-muted" />
                    </div>
                    <button className="btn-secondary text-xs">Fazer upload</button>
                  </div>
                </div>
                <div>
                  <label className="input-label">Cor de destaque</label>
                  <div className="flex items-center gap-2">
                    {['#d4ff00', '#5BE7C4', '#4BA3FF', '#8B7CFF', '#FF5A6B', '#FFB020'].map(c => (
                      <button key={c} className="w-7 h-7 rounded-sm border-2 border-transparent hover:border-white transition-all"
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Texto personalizado</label>
                  <input className="input" placeholder="ex: Nos vemos lá! 🔥" />
                </div>
                <div className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-bg-border">
                  <div>
                    <div className="text-sm text-text-secondary">Enviar automaticamente após compra</div>
                    <div className="text-[11px] text-text-muted mt-0.5">Por e-mail e WhatsApp para cada comprador</div>
                  </div>
                  <div className="w-9 h-5 bg-brand-acid rounded-full relative">
                    <span className="absolute top-0.5 left-4 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <button className="btn-primary w-full">Salvar configurações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AUTOMATIONS TAB ───────────────────────────────────── */}
      {tab === 'automations' && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Automações disparam comunicações automaticamente com base em eventos do sistema.
          </p>
          <div className="space-y-3">
            {[
              {
                title: 'Confirmação de compra',
                desc: 'Disparo imediato após pagamento confirmado',
                trigger: 'Pagamento aprovado',
                channels: ['email', 'whatsapp'] as CampaignType[],
                active: true,
                icon: CheckCircle2,
              },
              {
                title: 'Lembrete 24 horas antes',
                desc: 'Enviado 24h antes do evento começar',
                trigger: '24h antes do início',
                channels: ['whatsapp', 'push'] as CampaignType[],
                active: true,
                icon: Clock,
              },
              {
                title: 'Portarias abertas',
                desc: 'Avisa quando o check-in for liberado',
                trigger: 'Check-in ativado',
                channels: ['push', 'whatsapp'] as CampaignType[],
                active: true,
                icon: Zap,
              },
              {
                title: 'Pós-evento',
                desc: 'Agradecimento e pesquisa de satisfação',
                trigger: '2h após o encerramento',
                channels: ['email'] as CampaignType[],
                active: false,
                icon: Star,
              },
              {
                title: 'Abandono de carrinho',
                desc: 'Lembra quem iniciou mas não finalizou a compra',
                trigger: '30min sem finalizar',
                channels: ['whatsapp', 'email'] as CampaignType[],
                active: false,
                icon: AlertCircle,
              },
            ].map((auto, i) => {
              const AIcon = auto.icon
              return (
                <div key={i} className="card p-4 reveal flex items-center gap-4" style={{ transitionDelay: `${i * 40}ms` }}>
                  <div className={cn('w-10 h-10 rounded-sm flex items-center justify-center shrink-0',
                    auto.active ? 'bg-brand-acid/10' : 'bg-bg-surface')}>
                    <AIcon className={cn('w-4 h-4', auto.active ? 'text-brand-acid' : 'text-text-muted')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[13px] text-text-primary">{auto.title}</span>
                      <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-sm',
                        auto.active ? 'bg-brand-acid/15 text-brand-acid' : 'bg-bg-surface text-text-muted border border-bg-border')}>
                        {auto.active ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted">{auto.desc}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> {auto.trigger}
                      </span>
                      <div className="flex items-center gap-1">
                        {auto.channels.map(ch => {
                          const ChIcon = CHANNEL_CONFIG[ch].icon
                          return (
                            <span key={ch} className={cn('text-[10px] font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm', CHANNEL_CONFIG[ch].bg, CHANNEL_CONFIG[ch].color)}>
                              <ChIcon className="w-2.5 h-2.5" /> {CHANNEL_CONFIG[ch].label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="btn-ghost text-xs flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Configurar
                    </button>
                    <button className={cn('w-9 h-5 rounded-full relative transition-all duration-200', auto.active ? 'bg-brand-acid' : 'bg-bg-border')}>
                      <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200', auto.active ? 'left-4' : 'left-0.5')} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Campaign Form Modal */}
      {showForm && (
        <CampaignFormModal
          organizationId={organization!.id}
          campaign={editingCampaign}
          onClose={() => { setShowForm(false); setEditingCampaign(null) }}
          onSaved={() => { fetchCampaigns(); setShowForm(false); setEditingCampaign(null) }}
        />
      )}
    </div>
  )
}

/* ── Campaign Form Modal ────────────────────────────────────── */
function CampaignFormModal({ organizationId, campaign, onClose, onSaved }: {
  organizationId: string
  campaign: Campaign | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(campaign?.name ?? '')
  const [type, setType] = useState<CampaignType>(campaign?.type ?? 'email')
  const [subject, setSubject] = useState(campaign?.subject ?? '')
  const [body, setBody] = useState(campaign?.body ?? '')
  const [sendAt, setSendAt] = useState(campaign?.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Nome da campanha é obrigatório'); return }
    if (!body.trim()) { setError('Mensagem é obrigatória'); return }
    setSaving(true); setError('')

    const payload = {
      organization_id: organizationId,
      name: name.trim(),
      channel: type,
      subject: subject || null,
      body: body.trim(),
      scheduled_at: sendAt || null,
      status: 'draft' as CampaignStatus,
    }

    const { error: err } = campaign
      ? await supabase.from('campaigns').update(payload).eq('id', campaign.id)
      : await supabase.from('campaigns').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-bg-border rounded-sm overflow-hidden animate-slide-up shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-xl leading-none">
            {campaign ? 'EDITAR CAMPANHA' : 'NOVA CAMPANHA'}<span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-sm transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="input-label">Nome da campanha *</label>
            <input className="input" placeholder="ex: Lembrete pré-evento Festival XP"
              value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Canal</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as CampaignType)}>
                {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Agendamento</label>
              <input type="datetime-local" className="input"
                value={sendAt} onChange={e => setSendAt(e.target.value)} />
            </div>
          </div>

          {type === 'email' && (
            <div>
              <label className="input-label">Assunto do e-mail</label>
              <input className="input" placeholder="ex: Seu ingresso para o FESTIVAL XP está confirmado!"
                value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          )}

          <div>
            <label className="input-label">Mensagem *</label>
            <textarea className="input resize-none" rows={6}
              placeholder={'Use {{buyer_name}}, {{event_name}}, {{event_date}}, {{venue_name}} como variáveis dinâmicas'}
              value={body} onChange={e => setBody(e.target.value)} />
            <div className="mt-1 flex flex-wrap gap-1">
              {['{{buyer_name}}', '{{event_name}}', '{{event_date}}', '{{venue_name}}', '{{ticket_type}}'].map(v => (
                <button key={v} onClick={() => setBody(prev => prev + v)}
                  className="text-[10px] font-mono px-2 py-0.5 bg-brand-acid/10 text-brand-acid rounded-sm hover:bg-brand-acid/20 transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-bg-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving}
              className="btn-secondary flex items-center gap-2 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓ Salvar rascunho'}
            </button>
            <button className="btn-primary flex items-center gap-2 text-sm">
              <Send className="w-3.5 h-3.5" /> Enviar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
