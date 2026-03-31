import {
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  ScanLine,
  Settings,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import type { NavSection } from '@/app/layout'
import { useAccessControl } from '@/features/access-control'
import { useAuthStore } from '@/lib/store/auth'
import { getInitials } from '@/lib/utils'
import { cn } from '@/shared/lib'
import { useAppLocale } from '@/shared/i18n/app-locale'

interface SidebarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: NavSection
  label: string
  blurb: string
  icon: React.ElementType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function createNavGroups(isPortuguese: boolean): NavGroup[] {
  return [
    {
      label: isPortuguese ? 'Operacao central' : 'Core operation',
      items: [
        {
          id: 'dashboard',
          label: isPortuguese ? 'Painel' : 'Dashboard',
          blurb: isPortuguese ? 'Leitura executiva do dia e gargalos.' : 'Executive read for the day and bottlenecks.',
          icon: LayoutDashboard,
        },
        {
          id: 'events',
          label: isPortuguese ? 'Eventos' : 'Events',
          blurb: isPortuguese ? 'Agenda, portfolio e publicacao.' : 'Schedule, portfolio and publishing.',
          icon: CalendarDays,
        },
        {
          id: 'tickets',
          label: isPortuguese ? 'Ingressos' : 'Tickets',
          blurb: isPortuguese ? 'Lotes, precos e ocupacao.' : 'Releases, pricing and occupancy.',
          icon: Ticket,
        },
        {
          id: 'sales',
          label: isPortuguese ? 'Vendas' : 'Sales',
          blurb: isPortuguese ? 'Pedidos, pagamento e emissao.' : 'Orders, payments and issuance.',
          icon: TrendingUp,
        },
      ],
    },
    {
      label: isPortuguese ? 'Campo e pessoas' : 'Field and people',
      items: [
        {
          id: 'crm',
          label: isPortuguese ? 'Relacionamento' : 'CRM',
          blurb: isPortuguese ? 'Publico, recorrencia e audiencias.' : 'Audience, retention and recurrence.',
          icon: Users,
        },
        {
          id: 'checkin',
          label: isPortuguese ? 'Credenciamento' : 'Check-in',
          blurb: isPortuguese ? 'Acesso, validacao e filas.' : 'Access, validation and queues.',
          icon: ScanLine,
        },
        {
          id: 'staff',
          label: isPortuguese ? 'Staff' : 'Staff',
          blurb: isPortuguese ? 'Cadastro, escala e credencial.' : 'Roster, shifts and credentials.',
          icon: Users,
        },
        {
          id: 'suppliers',
          label: isPortuguese ? 'Fornecedores' : 'Suppliers',
          blurb: isPortuguese ? 'Parceiros e execucao terceirizada.' : 'Partners and outsourced execution.',
          icon: Truck,
        },
        {
          id: 'registrations',
          label: isPortuguese ? 'Inscricoes' : 'Registrations',
          blurb: isPortuguese ? 'Capital Strike e eventos externos.' : 'Capital Strike and external events.',
          icon: ClipboardList,
        },
        {
          id: 'sponsors',
          label: isPortuguese ? 'Patrocinios' : 'Sponsors',
          blurb: isPortuguese ? 'Cotas, entregas de marca e negociacao.' : 'Sponsorship tiers, deliverables and negotiations.',
          icon: Handshake,
        },
      ],
    },
    {
      label: isPortuguese ? 'Comercial e leitura' : 'Commerce and reading',
      items: [
        {
          id: 'products',
          label: isPortuguese ? 'PDV' : 'POS',
          blurb: isPortuguese ? 'Venda rapida, catalogo e caixa.' : 'Fast selling, commercial catalog and checkout.',
          icon: ShoppingBag,
        },
        {
          id: 'inventory',
          label: isPortuguese ? 'Estoque' : 'Inventory',
          blurb: isPortuguese ? 'Saldo, ruptura e reposicao.' : 'Availability, stockouts and replenishment.',
          icon: Package,
        },
        {
          id: 'communication',
          label: isPortuguese ? 'Comunicacao' : 'Communication',
          blurb: isPortuguese ? 'Campanhas e jornadas.' : 'Campaigns and journeys.',
          icon: MessageSquare,
        },
        {
          id: 'intelligence',
          label: isPortuguese ? 'Inteligencia' : 'Intelligence',
          blurb: isPortuguese ? 'Alertas e leitura executiva.' : 'Alerts and executive readouts.',
          icon: BrainCircuit,
        },
        {
          id: 'financial',
          label: isPortuguese ? 'Financeiro' : 'Financial',
          blurb: isPortuguese ? 'Margem, repasse e fechamento.' : 'Margin, payouts and closeout.',
          icon: DollarSign,
        },
        {
          id: 'billing',
          label: isPortuguese ? 'Cobranca' : 'Billing',
          blurb: isPortuguese ? 'Planos e monetizacao.' : 'Plans and monetization.',
          icon: WalletCards,
        },
        {
          id: 'growth',
          label: isPortuguese ? 'Crescimento' : 'Growth',
          blurb: isPortuguese ? 'Aquisicao, canais e retorno.' : 'Acquisition, channels and return.',
          icon: Zap,
        },
      ],
    },
    {
      label: isPortuguese ? 'Sistema' : 'System',
      items: [
        {
          id: 'settings',
          label: isPortuguese ? 'Configuracoes' : 'Settings',
          blurb: isPortuguese ? 'Marca, dominio e permissoes.' : 'Brand, domain and permissions.',
          icon: Settings,
        },
        {
          id: 'help',
          label: isPortuguese ? 'Ajuda' : 'Help',
          blurb: isPortuguese ? 'Treinamento e suporte operacional.' : 'Training and operational support.',
          icon: HelpCircle,
        },
      ],
    },
  ]
}

function SidebarNav({
  activeSection,
  onNavigate,
  navGroups,
  isPortuguese,
  compact = false,
}: {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  navGroups: NavGroup[]
  isPortuguese: boolean
  compact?: boolean
}) {
  return (
    <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-6">
      {navGroups.map((group) => (
        <section key={group.label}>
          <div className="px-3 text-[10px] uppercase tracking-[0.34em] text-[#ae936f]/78">{group.label}</div>
          <div className="mt-3 space-y-2">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeSection

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-[1.5rem] border px-4 py-3 text-left transition-all duration-300',
                    isActive
                      ? 'border-[#ae936f]/26 bg-[linear-gradient(180deg,rgba(214,42,11,0.14),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.22)]'
                      : 'border-white/6 bg-white/[0.02] hover:border-[#ae936f]/20 hover:bg-white/[0.04]',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                      isActive ? 'border-[#d62a0b]/18 bg-[#d62a0b]/12 text-[#ebe7e0]' : 'border-white/8 bg-white/[0.03] text-[#8e847d]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[1.8rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">{item.label}</div>
                    {!compact ? <div className="mt-2 text-xs leading-5 text-[#9d938c]">{item.blurb}</div> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4">
        <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">{isPortuguese ? 'Logica do produto' : 'Product logic'}</div>
        <div className="mt-3 text-sm leading-6 text-[#b8b0a8]/72">
          {isPortuguese
            ? 'Vendas operam no PDV. Disponibilidade e ruptura vivem em Estoque. Pessoas entram por Staff.'
            : 'Sales run in POS. Availability and stockouts live in Inventory. People operations start in Staff.'}
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ activeSection, onNavigate, isOpen, onClose }: SidebarProps) {
  const { profile, organization } = useAuthStore()
  const access = useAccessControl()
  const { isPortuguese } = useAppLocale()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
    }
  }, [isOpen])

  const navGroups = createNavGroups(isPortuguese)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => access.canAccessSection(item.id)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <>
      <aside className="hidden h-screen w-[320px] shrink-0 border-r border-white/6 bg-[linear-gradient(180deg,#0f0d0c_0%,#0a0909_100%)] lg:flex lg:flex-col">
        <div className="border-b border-white/6 px-6 py-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Animalz Events" className="h-10 w-auto object-contain" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#ae936f]">{isPortuguese ? 'Area do produtor' : 'Producer area'}</div>
              <div className="mt-1 font-display text-[1.6rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">Operacao</div>
            </div>
          </div>
        </div>

        <SidebarNav activeSection={activeSection} onNavigate={onNavigate} navGroups={navGroups} isPortuguese={isPortuguese} />

        <div className="border-t border-white/6 p-4">
          <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d62a0b]/12 text-sm font-semibold text-[#d62a0b]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#ebe7e0]">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className="truncate text-xs text-[#8e847d]">
                  {organization?.name ?? (isPortuguese ? 'Operacao principal' : 'Primary operation')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={isPortuguese ? 'Fechar navegacao' : 'Close navigation'}
            className="absolute inset-0 bg-[rgba(7,6,7,0.76)] backdrop-blur-sm"
            onClick={onClose}
          />

          <aside className="absolute left-0 top-0 h-screen w-[92vw] max-w-[340px] border-r border-white/8 bg-[linear-gradient(180deg,#0f0d0c_0%,#0a0909_100%)] shadow-[0_30px_120px_rgba(0,0,0,0.68)]">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#ae936f]">{isPortuguese ? 'Mapa do produto' : 'Product map'}</div>
                <div className="mt-2 font-display text-[2rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">
                  {isPortuguese ? 'Navegacao.' : 'Navigation.'}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[#8e847d] transition-all hover:text-[#ebe7e0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarNav
              activeSection={activeSection}
              onNavigate={(section) => {
                onNavigate(section)
                onClose()
              }}
              navGroups={navGroups}
              isPortuguese={isPortuguese}
              compact
            />
          </aside>
        </div>
      ) : null}
    </>
  )
}
