'use client'

import { useEffect, useState } from 'react'
import { Bell, Globe, LogOut, Menu, Search, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { AuditFeedPanel } from '@/features/audit'
import { useAccessControl } from '@/features/access-control'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'
import { useAuthStore } from '@/lib/store/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { logError } from '@/shared/lib'

function getSectionTitles(isPortuguese: boolean): Record<NavSection, string> {
  return {
    dashboard: isPortuguese ? 'Painel' : 'Dashboard',
    events: isPortuguese ? 'Eventos' : 'Events',
    tickets: isPortuguese ? 'Ingressos e lotes' : 'Tickets & releases',
    sales: isPortuguese ? 'Vendas' : 'Sales',
    crm: isPortuguese ? 'Relacionamento e clientes' : 'CRM & customers',
    checkin: isPortuguese ? 'Credenciamento operacional' : 'Operational check-in',
    staff: isPortuguese ? 'Equipe e operacao' : 'Staff & crew',
    suppliers: isPortuguese ? 'Fornecedores' : 'Suppliers',
    products: isPortuguese ? 'Produtos e PDV' : 'Products & POS',
    inventory: isPortuguese ? 'Estoque e inventario' : 'Inventory & stock',
    intelligence: isPortuguese ? 'Inteligencia' : 'Intelligence',
    communication: isPortuguese ? 'Comunicacao' : 'Communications',
    financial: isPortuguese ? 'Financeiro' : 'Financial',
    billing: isPortuguese ? 'Cobranca e monetizacao' : 'Billing & monetization',
    growth: isPortuguese ? 'Operacoes de crescimento' : 'Growth services',
    help: isPortuguese ? 'Ajuda e treinamento' : 'Help & training',
    settings: isPortuguese ? 'Configuracoes' : 'Settings',
  }
}

function getSectionDescriptions(isPortuguese: boolean): Record<NavSection, string> {
  return {
    dashboard: isPortuguese ? 'Receita, operacao e sinal comercial em uma unica leitura.' : 'Revenue, operations and commercial signal in one reading.',
    events: isPortuguese ? 'Agenda, posicionamento, midia e publicacao dos eventos.' : 'Schedule, positioning, media and event publishing.',
    tickets: isPortuguese ? 'Arquitetura de lotes, precificacao e ocupacao.' : 'Release architecture, pricing and occupancy.',
    sales: isPortuguese ? 'Pedidos, pagamentos e emissao digital da jornada.' : 'Orders, payments and digital issuance across the journey.',
    crm: isPortuguese ? 'Publico, relacionamento e recorrencia por evento.' : 'Audience, relationship and recurrence by event.',
    checkin: isPortuguese ? 'Fluxo de acesso, filas, validacao e campo.' : 'Access flow, queues, validation and field operations.',
    staff: isPortuguese ? 'Escala, presenca e time operacional no evento.' : 'Roster, attendance and operational event staff.',
    suppliers: isPortuguese ? 'Base de parceiros, servicos e execucao terceirizada.' : 'Partners, services and outsourced execution base.',
    products: isPortuguese ? 'Catalogo, PDV e consumo complementar no evento.' : 'Catalog, POS and ancillary event consumption.',
    inventory: isPortuguese ? 'Controle de itens, ruptura e giro de estoque.' : 'Item control, stockouts and inventory turns.',
    intelligence: isPortuguese ? 'Saude operacional, alertas e leitura executiva.' : 'Operational health, alerts and executive reads.',
    communication: isPortuguese ? 'Campanhas, disparos e continuidade de audiencia.' : 'Campaigns, sends and audience continuity.',
    financial: isPortuguese ? 'Margem, repasse, fechamento e previsibilidade.' : 'Margin, payouts, closing and predictability.',
    billing: isPortuguese ? 'Planos, monetizacao e estrutura de cobranca.' : 'Plans, monetization and billing structure.',
    growth: isPortuguese ? 'Aquisicao, indicacao e retorno comercial do produto.' : 'Acquisition, referral and product-led commercial return.',
    help: isPortuguese ? 'Base operacional para treinar o time e padronizar execucao.' : 'Operational base to train teams and standardize execution.',
    settings: isPortuguese ? 'Marca, dominio, permissoes e parametros da operacao.' : 'Brand, domain, permissions and operational settings.',
  }
}

interface TopbarProps {
  onMenuToggle: () => void
  activeSection: NavSection
}

export function Topbar({ onMenuToggle, activeSection }: TopbarProps) {
  const { signOut } = useAuthStore()
  const access = useAccessControl()
  const notifications = useNotificationsCenter()
  const { locale, setLocale, isPortuguese, t } = useAppLocale()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [panelTab, setPanelTab] = useState<'notifications' | 'activity'>('notifications')
  const [searchQuery, setSearchQuery] = useState('')
  const sectionTitles = getSectionTitles(isPortuguese)
  const sectionDescriptions = getSectionDescriptions(isPortuguese)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setShowSearch(true)
      }
      if (event.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearch() {
    if (!searchQuery.trim()) return
    logError(`Search not implemented: ${searchQuery}`, { scope: 'topbar', action: 'search' })
    setShowSearch(false)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[84px] shrink-0 items-center gap-4 border-b border-white/6 bg-[linear-gradient(180deg,rgba(18,16,15,0.92)_0%,rgba(11,10,10,0.86)_100%)] px-6 backdrop-blur-xl">
        <button
          onClick={onMenuToggle}
          className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2 text-[#8e847d] transition-all hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ae936f]">{access.role}</div>
          <h1 className="mt-0.5 font-display text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-[#ebe7e0]">
            {sectionTitles[activeSection]}
          </h1>
          <p className="mt-1 hidden max-w-xl truncate text-xs text-[#b8b0a8]/70 xl:block">
            {sectionDescriptions[activeSection]}
          </p>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[#8e847d] transition-all hover:border-[#ae936f]/30 hover:text-[#ebe7e0] md:flex"
        >
          <Search className="h-4 w-4" />
          <span>{t('Search...', 'Buscar...')}</span>
          <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[11px]">
            Ctrl K
          </span>
        </button>

        <button
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8e847d] transition-all hover:border-[#ae936f]/30 hover:text-[#ebe7e0]"
          title={t('Switch language', 'Trocar idioma')}
        >
          <Globe className="h-4 w-4" />
          {locale === 'en-US' ? 'EN' : 'PT'}
        </button>

        <button
          onClick={() => setShowNotifications((current) => !current)}
          className="relative rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2.5 text-[#8e847d] transition-all hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]"
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[#d62a0b]" />
          ) : null}
        </button>

        <button
          onClick={signOut}
          className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2.5 text-[#8e847d] transition-all hover:border-[#d62a0b]/25 hover:text-[#d62a0b]"
          title={t('Sign out', 'Sair')}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#12100f] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
              <Search className="h-5 w-5 text-[#8e847d]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleSearch() }}
                type="text"
                placeholder={t('Search events, tickets, customers...', 'Busque eventos, ingressos, clientes...')}
                className="flex-1 bg-transparent text-[#ebe7e0] outline-none placeholder:text-[#6f6660]"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-full p-1.5 text-[#8e847d] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-center text-sm text-[#8e847d]">
              {searchQuery
                ? t('Search captured for future integration.', 'Busca registrada para integracao futura.')
                : t('Type to search', 'Digite para buscar')}
            </div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-6 top-[80px] z-40 w-[420px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#12100f] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] p-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#ae936f]">{access.role}</div>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-none tracking-[-0.03em] text-[#ebe7e0]">
                {t('Internal center', 'Centro interno')}
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="rounded-full p-1.5 text-[#8e847d] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] p-3">
            <button
              onClick={() => setPanelTab('notifications')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'notifications'
                  ? 'bg-[#d62a0b] text-[#ebe7e0] shadow-[0_6px_18px_rgba(214,42,11,0.22)]'
                  : 'text-[#8e847d] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]'
              }`}
            >
              {t('Notifications', 'Notificacoes')}
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'activity'
                  ? 'bg-[rgba(255,255,255,0.08)] text-[#ebe7e0]'
                  : 'text-[#8e847d] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ebe7e0]'
              }`}
            >
              {t('Activity', 'Atividade')}
            </button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto p-4">
            {panelTab === 'notifications' ? (
              <NotificationsPanel
                notifications={notifications.notifications}
                onMarkAsRead={notifications.markAsRead}
                pagination={notifications.pagination}
                onPageChange={notifications.setPage}
              />
            ) : (
              <AuditFeedPanel />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
