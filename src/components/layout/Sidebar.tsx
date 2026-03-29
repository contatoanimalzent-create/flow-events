import {
  BrainCircuit,
  CalendarDays,
  DollarSign,
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
  onToggle: () => void
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
          blurb: isPortuguese ? 'Visao executiva da operacao inteira.' : 'Executive read of the whole operation.',
          icon: LayoutDashboard,
        },
        {
          id: 'events',
          label: isPortuguese ? 'Eventos' : 'Events',
          blurb: isPortuguese ? 'Portfolio, agenda e publicacao.' : 'Portfolio, schedule and publishing.',
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
          blurb: isPortuguese ? 'Pedidos, pagamentos e emissao.' : 'Orders, payments and issuance.',
          icon: TrendingUp,
        },
      ],
    },
    {
      label: isPortuguese ? 'Campo e relacionamento' : 'Field and relationship',
      items: [
        {
          id: 'crm',
          label: isPortuguese ? 'Relacionamento' : 'CRM',
          blurb: isPortuguese ? 'Publico, recorrencia e audiencia.' : 'Audience, retention and recurrence.',
          icon: Users,
        },
        {
          id: 'checkin',
          label: isPortuguese ? 'Credenciamento' : 'Check-in',
          blurb: isPortuguese ? 'Fluxo de acesso e validacao.' : 'Access flow and validation.',
          icon: ScanLine,
        },
        {
          id: 'staff',
          label: isPortuguese ? 'Equipe' : 'Staff',
          blurb: isPortuguese ? 'Escala e execucao de time.' : 'Roster and field execution.',
          icon: Users,
        },
        {
          id: 'suppliers',
          label: isPortuguese ? 'Fornecedores' : 'Suppliers',
          blurb: isPortuguese ? 'Parceiros e execucao terceirizada.' : 'Partners and outsourced execution.',
          icon: Truck,
        },
      ],
    },
    {
      label: isPortuguese ? 'Receita e crescimento' : 'Revenue and growth',
      items: [
        {
          id: 'products',
          label: isPortuguese ? 'Produtos' : 'Products',
          blurb: isPortuguese ? 'PDV, itens e consumo.' : 'POS, items and consumption.',
          icon: ShoppingBag,
        },
        {
          id: 'inventory',
          label: isPortuguese ? 'Estoque' : 'Inventory',
          blurb: isPortuguese ? 'Giro, ruptura e controle.' : 'Turns, stockouts and control.',
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
          blurb: isPortuguese ? 'Alertas e leitura executiva.' : 'Alerts and executive intelligence.',
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
          blurb: isPortuguese ? 'Aquisicao, indicacao e retorno.' : 'Acquisition, referral and return.',
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
          blurb: isPortuguese ? 'Treinamento e base operacional.' : 'Training and operational base.',
          icon: HelpCircle,
        },
      ],
    },
  ]
}

export function Sidebar({ activeSection, onNavigate, isOpen, onToggle }: SidebarProps) {
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

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label={isPortuguese ? 'Fechar navegacao' : 'Close navigation'}
        className="absolute inset-0 bg-[rgba(7,6,7,0.76)] backdrop-blur-sm"
        onClick={onToggle}
      />

      <aside className="absolute right-0 top-0 h-screen w-full max-w-[560px] overflow-y-auto overscroll-contain border-l border-white/8 bg-[#0d0b0a] shadow-[0_30px_120px_rgba(0,0,0,0.68)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[#d62a0b]/[0.14] blur-[120px]" />
          <div className="absolute right-[-6rem] top-[20%] h-[18rem] w-[18rem] rounded-full bg-[#ae936f]/[0.12] blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-full flex-col px-6 py-6 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.42em] text-[#ae936f]">
                {isPortuguese ? 'Mapa do produto' : 'Product map'}
              </div>
              <div className="mt-3 font-display text-[clamp(2.8rem,5vw,4.2rem)] leading-[0.9] tracking-[-0.05em] text-[#ebe7e0]">
                {isPortuguese ? 'Navegacao operacional.' : 'Operational navigation.'}
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[#8e847d] transition-all hover:border-[#ae936f]/30 hover:text-[#ebe7e0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 max-w-md text-sm leading-7 text-[#b8b0a8]/74">
            {isPortuguese
              ? 'Cada modulo foi reorganizado para seguir a mesma linguagem visual do produto inteiro, sem a estrutura anterior.'
              : 'Every module has been reorganized to follow the same visual language across the entire product.'}
          </div>

          <div className="mt-10 space-y-10">
            {navGroups.map((group) => (
              <section key={group.label}>
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]/85">{group.label}</div>
                <div className="mt-4 grid gap-3">
                  {group.items.map((item, index) => {
                    const Icon = item.icon
                    const isActive = item.id === activeSection

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id)
                          onToggle()
                        }}
                        className={cn(
                          'group flex items-start gap-4 rounded-[2rem] border px-5 py-5 text-left transition-all duration-300',
                          isActive
                            ? 'border-[#ae936f]/28 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.24)]'
                            : 'border-white/8 bg-white/[0.03] hover:border-[#ae936f]/20 hover:bg-white/[0.05]',
                        )}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[#ae936f]">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3">
                            <span className="text-[11px] font-mono uppercase tracking-[0.32em] text-[#ae936f]/55">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">
                              {item.label}
                            </span>
                          </div>
                          <div className="mt-2 max-w-md text-sm leading-6 text-[#b8b0a8]/70">{item.blurb}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">
              {isPortuguese ? 'Sessao ativa' : 'Live profile'}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d62a0b]/12 text-sm font-semibold text-[#d62a0b]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-[#ebe7e0]">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className="truncate text-sm text-[#8e847d]">
                  {organization?.name ?? (isPortuguese ? 'Operacao principal' : 'Primary operation')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
