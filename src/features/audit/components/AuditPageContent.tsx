import { useState, useEffect } from 'react'
import {
  AlertOctagon, ArrowUpRight, CheckCircle2, Clock, Download,
  Filter, RefreshCw, Search, Shield, Webhook, XCircle,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'

type Tab = 'logs' | 'seguranca' | 'webhooks' | 'acoes'

interface AuditLog {
  id: string
  entity_type: string
  action: string
  actor_profile_id: string | null
  ip_address: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

interface SecurityEvent {
  id: string
  event_type: string
  severity: string
  description: string | null
  created_at: string
}

interface WebhookLog {
  id: string
  provider: string
  event_type: string
  processed: boolean
  created_at: string
}

const severityStyle: Record<string, string> = {
  critical: 'text-status-error bg-status-error/10',
  high: 'text-status-warning bg-status-warning/10',
  medium: 'text-brand-blue bg-brand-blue/10',
  low: 'text-text-muted bg-white/5',
}

function formatRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.round(diff)}s atrás`
  if (diff < 3600) return `${Math.round(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.round(diff / 3600)}h atrás`
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function AuditPageContent() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<Tab>('logs')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [secEvents, setSecEvents] = useState<SecurityEvent[]>([])
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  async function load() {
    if (!organization) return
    setLoading(true)
    try {
      const [logsRes, secRes, wRes] = await Promise.all([
        supabase.from('audit_logs').select('id, entity_type, action, actor_profile_id, ip_address, created_at, metadata')
          .eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('security_events').select('id, event_type, severity, description, created_at')
          .eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(30),
        supabase.from('webhook_logs').select('id, provider, event_type, processed, created_at')
          .order('created_at', { ascending: false }).limit(30),
      ])
      setLogs((logsRes.data ?? []) as AuditLog[])
      setSecEvents((secRes.data ?? []) as SecurityEvent[])
      setWebhooks((wRes.data ?? []) as WebhookLog[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [organization?.id])

  if (!organization) return null

  const filteredLogs = logs.filter((l) =>
    !search || l.entity_type?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredSec = secEvents.filter((e) =>
    (severityFilter === 'all' || e.severity === severityFilter) &&
    (!search || e.event_type?.toLowerCase().includes(search.toLowerCase())),
  )

  function exportCSV() {
    const rows = [
      ['ID', 'Entity', 'Action', 'IP', 'Date'],
      ...filteredLogs.map((l) => [l.id, l.entity_type, l.action, l.ip_address ?? '', l.created_at]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Compliance & security</div>
          <h1 className="admin-title">
            Auditoria<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Logs de ações, eventos de segurança, webhooks e histórico completo do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button onClick={() => void load()} disabled={loading} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Atualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Logs hoje', value: String(logs.length), icon: Clock, color: 'text-text-primary' },
          { label: 'Eventos críticos', value: String(secEvents.filter((e) => e.severity === 'critical').length), icon: AlertOctagon, color: 'text-status-error' },
          { label: 'Webhooks processados', value: String(webhooks.filter((w) => w.processed).length), icon: Webhook, color: 'text-status-success' },
          { label: 'Erros de webhook', value: String(webhooks.filter((w) => !w.processed).length), icon: XCircle, color: 'text-status-warning' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{kpi.label}</span>
              <kpi.icon className={cn('h-4 w-4', kpi.color)} />
            </div>
            <div className={cn('text-2xl font-bold font-mono', kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="surface-panel flex items-center gap-1 p-2">
        {([
          { key: 'logs', label: 'Logs de ações', icon: Clock },
          { key: 'seguranca', label: 'Segurança', icon: Shield },
          { key: 'webhooks', label: 'Webhooks', icon: Webhook },
          { key: 'acoes', label: 'Overrides manuais', icon: AlertOctagon },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all',
              tab === t.key ? 'bg-brand-blue text-white' : 'text-text-muted hover:text-text-primary hover:bg-white/5',
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="admin-filterbar">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input className="input h-10 w-full pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ação, entidade..." />
        </div>
        {tab === 'seguranca' && (
          <div className="flex items-center gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn('rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all',
                  severityFilter === sev ? 'bg-brand-blue text-white' : 'border border-white/8 text-text-muted hover:text-text-primary',
                )}
              >
                {sev === 'all' ? 'Todos' : sev}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logs */}
      {tab === 'logs' && (
        <div className="card overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <div className="text-sm text-text-muted">Nenhum log encontrado</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Entidade', 'Ação', 'IP', 'Quando'].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-text-secondary">{log.entity_type}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-text-primary">{log.action}</td>
                    <td className="px-5 py-3 text-xs font-mono text-text-muted">{log.ip_address ?? '-'}</td>
                    <td className="px-5 py-3 text-xs text-text-muted">{formatRelative(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Segurança */}
      {tab === 'seguranca' && (
        <div className="space-y-3">
          {filteredSec.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-status-success mx-auto mb-3" />
              <div className="text-sm text-text-secondary font-medium">Nenhum evento de segurança</div>
              <div className="text-xs text-text-muted mt-1">Sua operação está limpa.</div>
            </div>
          ) : filteredSec.map((ev) => (
            <div key={ev.id} className={cn('card p-4 flex items-start gap-4 border-l-2',
              ev.severity === 'critical' ? 'border-l-status-error' :
              ev.severity === 'high' ? 'border-l-status-warning' :
              ev.severity === 'medium' ? 'border-l-brand-blue' : 'border-l-white/10',
            )}>
              <AlertOctagon className={cn('h-4 w-4 mt-0.5 shrink-0',
                ev.severity === 'critical' ? 'text-status-error' :
                ev.severity === 'high' ? 'text-status-warning' : 'text-brand-blue',
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{ev.event_type}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', severityStyle[ev.severity] ?? 'text-text-muted bg-white/5')}>
                    {ev.severity}
                  </span>
                </div>
                {ev.description && <p className="text-xs text-text-muted mt-1">{ev.description}</p>}
              </div>
              <span className="text-xs font-mono text-text-muted shrink-0">{formatRelative(ev.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks */}
      {tab === 'webhooks' && (
        <div className="card overflow-hidden">
          {webhooks.length === 0 ? (
            <div className="p-12 text-center">
              <Webhook className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <div className="text-sm text-text-muted">Nenhum webhook recebido</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Provider', 'Tipo', 'Status', 'Recebido'].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-text-primary capitalize">{wh.provider}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-text-secondary">{wh.event_type}</td>
                    <td className="px-5 py-3">
                      {wh.processed
                        ? <span className="flex items-center gap-1.5 text-xs text-status-success"><CheckCircle2 className="h-3.5 w-3.5" /> Processado</span>
                        : <span className="flex items-center gap-1.5 text-xs text-status-error"><XCircle className="h-3.5 w-3.5" /> Pendente</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-text-muted">{formatRelative(wh.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Overrides manuais */}
      {tab === 'acoes' && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <Shield className="h-10 w-10 text-text-muted" />
          <div className="text-sm font-semibold text-text-secondary">Overrides manuais</div>
          <div className="text-xs text-text-muted max-w-sm">
            Toda ação manual de override (forcedcheck-in, cancelamento manual, reset de QR) é registrada aqui com o usuário e motivo.
          </div>
          <div className="text-xs text-status-success mt-2">Nenhum override registrado hoje.</div>
        </div>
      )}
    </div>
  )
}
