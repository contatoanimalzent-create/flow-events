import { useState } from 'react'
import {
  Building2, Globe, Key, Link2, Mail, Phone, RefreshCw,
  Save, Shield, Upload, UserPlus, Users, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib'

type Tab = 'geral' | 'membros' | 'permissoes' | 'integracoes' | 'documentos'

const ROLES = [
  { code: 'owner', label: 'Owner', color: 'text-status-warning', bg: 'bg-status-warning/10' },
  { code: 'admin', label: 'Admin', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { code: 'manager', label: 'Manager', color: 'text-status-info', bg: 'bg-status-info/10' },
  { code: 'operator', label: 'Operator', color: 'text-status-success', bg: 'bg-status-success/10' },
  { code: 'finance', label: 'Finance', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  { code: 'checkin', label: 'Check-in', color: 'text-text-secondary', bg: 'bg-white/5' },
  { code: 'read_only', label: 'Read Only', color: 'text-text-muted', bg: 'bg-white/5' },
]

const PERMISSIONS = [
  { module: 'Eventos', items: ['events.create', 'events.edit', 'events.delete', 'events.publish'] },
  { module: 'Ingressos', items: ['tickets.manage', 'tickets.checkin'] },
  { module: 'Staff', items: ['staff.manage', 'staff.view'] },
  { module: 'Financeiro', items: ['finance.view', 'finance.manage'] },
  { module: 'Relatórios', items: ['reports.view'] },
  { module: 'Comunicação', items: ['campaigns.manage'] },
  { module: 'Comunidade', items: ['feed.moderate'] },
  { module: 'Config', items: ['settings.manage'] },
  { module: 'IA', items: ['ai.view', 'ai.act'] },
]

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  owner: ['events.create','events.edit','events.delete','events.publish','tickets.manage','tickets.checkin','staff.manage','staff.view','finance.view','finance.manage','reports.view','campaigns.manage','feed.moderate','settings.manage','ai.view','ai.act'],
  admin: ['events.create','events.edit','events.delete','events.publish','tickets.manage','tickets.checkin','staff.manage','staff.view','finance.view','finance.manage','reports.view','campaigns.manage','feed.moderate','settings.manage','ai.view','ai.act'],
  manager: ['events.create','events.edit','events.publish','tickets.manage','tickets.checkin','staff.manage','staff.view','finance.view','reports.view','campaigns.manage','feed.moderate','ai.view'],
  operator: ['tickets.checkin','staff.view','reports.view','ai.view'],
  finance: ['finance.view','finance.manage','reports.view'],
  checkin: ['tickets.checkin'],
  read_only: ['reports.view'],
}

export function OrganizationsPageContent() {
  const { organization, profile } = useAuthStore()
  const [tab, setTab] = useState<Tab>('geral')
  const [selectedRole, setSelectedRole] = useState('owner')
  const [saving, setSaving] = useState(false)

  if (!organization) return null

  const permsForRole = ROLE_PERMISSION_MAP[selectedRole] ?? []

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Workspace</div>
          <h1 className="admin-title">
            Organização<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Dados da empresa, membros, papéis, permissões e integrações.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-xs">
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {/* Org identity banner */}
      <div className="card p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
          <Building2 className="h-8 w-8 text-brand-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-text-primary truncate">{organization.name}</div>
          <div className="text-xs text-text-muted mt-0.5">{organization.slug ?? organization.id}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-status-success/10 px-3 py-1 text-xs font-medium text-status-success">Ativo</span>
          {organization.subscription_plan_id && (
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">Pro</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="surface-panel flex items-center gap-1 p-2">
        {([
          { key: 'geral', label: 'Dados gerais', icon: Building2 },
          { key: 'membros', label: 'Membros', icon: Users },
          { key: 'permissoes', label: 'Permissões', icon: Shield },
          { key: 'integracoes', label: 'Integrações', icon: Link2 },
          { key: 'documentos', label: 'Documentos', icon: Key },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all',
              tab === t.key
                ? 'bg-brand-blue text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5',
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Dados gerais */}
      {tab === 'geral' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-text-primary">Informações da empresa</h3>
            <div className="space-y-4">
              {[
                { label: 'Nome fantasia', value: organization.name, icon: Building2 },
                { label: 'E-mail', value: organization.email ?? '-', icon: Mail },
                { label: 'Telefone', value: organization.phone ?? '-', icon: Phone },
                { label: 'Website', value: '-', icon: Globe },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <field.icon className="h-4 w-4 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted">{field.label}</div>
                    <div className="text-sm text-text-primary truncate">{field.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-text-primary">Branding & identidade</h3>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-blue/40 transition-colors">
                <Upload className="h-6 w-6 text-text-muted" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Logo da organização</div>
                <div className="text-xs text-text-muted mt-1">PNG, SVG ou JPG · Máx 2MB</div>
                <button className="btn-secondary mt-2 text-xs py-1 px-3">Fazer upload</button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="input-label">Cor primária</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="color" defaultValue="#0057E7" className="h-9 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                  <input className="input flex-1 font-mono text-sm" defaultValue="#0057E7" />
                </div>
              </div>
              <div>
                <label className="input-label">Domínio personalizado</label>
                <input className="input mt-1.5 w-full font-mono text-sm" placeholder="eventos.suaempresa.com.br" />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4 xl:col-span-2">
            <h3 className="text-sm font-semibold text-text-primary">Dados fiscais</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Razão social', placeholder: 'Nome jurídico completo' },
                { label: 'CNPJ', placeholder: '00.000.000/0001-00' },
                { label: 'Inscrição estadual', placeholder: 'IE' },
                { label: 'Código de atividade', placeholder: 'CNAE' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="input-label">{f.label}</label>
                  <input className="input mt-1.5 w-full text-sm" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Membros */}
      {tab === 'membros' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">1 membro ativo</div>
            <button className="btn-primary flex items-center gap-2 text-xs">
              <UserPlus className="h-3.5 w-3.5" /> Convidar membro
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Membro</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Papel</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Status</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Desde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue">
                        {(profile?.first_name ?? 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{profile?.first_name ?? '-'}</div>
                        <div className="text-xs text-text-muted">Admin da conta</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-status-warning/10 px-2.5 py-0.5 text-xs font-medium text-status-warning">Owner</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-status-success/10 px-2.5 py-0.5 text-xs text-status-success">Ativo</span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-text-muted">Hoje</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Permissões */}
      {tab === 'permissoes' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">Papéis do sistema</div>
            {ROLES.map((role) => (
              <button
                key={role.code}
                onClick={() => setSelectedRole(role.code)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all',
                  selectedRole === role.code ? 'bg-brand-blue/10 border border-brand-blue/20' : 'hover:bg-white/5 border border-transparent',
                )}
              >
                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', role.color, role.bg)}>{role.label}</span>
              </button>
            ))}
          </div>
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary capitalize">
                Permissões, <span className="text-brand-blue">{selectedRole}</span>
              </h3>
              <span className="text-xs text-text-muted">{permsForRole.length} permissões ativas</span>
            </div>
            <div className="space-y-5">
              {PERMISSIONS.map((group) => (
                <div key={group.module}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">{group.module}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((perm) => {
                      const active = permsForRole.includes(perm)
                      return (
                        <div
                          key={perm}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs border',
                            active
                              ? 'border-status-success/20 bg-status-success/5 text-status-success'
                              : 'border-white/5 bg-white/[0.02] text-text-muted',
                          )}
                        >
                          <div className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-status-success' : 'bg-white/20')} />
                          <span className="font-mono">{perm}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Integrações */}
      {tab === 'integracoes' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { name: 'Stripe', desc: 'Pagamentos online e connect', icon: '💳', status: 'connected', color: 'text-status-success' },
            { name: 'Pagar.me', desc: 'Gateway de pagamentos BR', icon: '🇧🇷', status: 'pending', color: 'text-status-warning' },
            { name: 'Firebase FCM', desc: 'Push notifications mobile', icon: '🔔', status: 'disconnected', color: 'text-text-muted' },
            { name: 'WhatsApp Business', desc: 'Mensagens e campanhas', icon: '💬', status: 'disconnected', color: 'text-text-muted' },
            { name: 'Cloudinary', desc: 'CDN de mídias e assets', icon: '☁️', status: 'connected', color: 'text-status-success' },
            { name: 'Webhook', desc: 'Endpoint personalizado', icon: '🔗', status: 'disconnected', color: 'text-text-muted' },
          ].map((integration) => (
            <div key={integration.name} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">{integration.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{integration.desc}</div>
                  </div>
                </div>
                <span className={cn('text-[10px] font-medium uppercase tracking-wide', integration.color)}>
                  {integration.status === 'connected' ? '● Ativo' : integration.status === 'pending' ? '◐ Pendente' : '○ Inativo'}
                </span>
              </div>
              <button className={cn('w-full text-xs py-2 rounded-lg border transition-colors',
                integration.status === 'connected'
                  ? 'border-white/10 text-text-muted hover:border-status-error/30 hover:text-status-error'
                  : 'border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5',
              )}>
                {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Documentos */}
      {tab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">Documentos e dados fiscais da organização</div>
            <button className="btn-secondary flex items-center gap-2 text-xs">
              <Upload className="h-3.5 w-3.5" /> Enviar documento
            </button>
          </div>
          <div className="card p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-white/8">
            <Key className="h-8 w-8 text-text-muted" />
            <div className="text-sm font-medium text-text-secondary">Nenhum documento enviado</div>
            <div className="text-xs text-text-muted max-w-xs">
              Contrato social, CNPJ, certidões e outros documentos fiscais ficam armazenados aqui com controle de validade.
            </div>
            <button className="btn-primary mt-2 text-xs">Enviar primeiro documento</button>
          </div>
        </div>
      )}
    </div>
  )
}
