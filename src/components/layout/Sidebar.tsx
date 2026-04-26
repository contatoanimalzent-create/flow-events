import {
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
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
      label: isPortuguese ? 'Operação central' : 'Core operation',
      items: [
        { id: 'dashboard',  label: isPortuguese ? 'Painel'     : 'Dashboard', blurb: isPortuguese ? 'Leitura executiva do dia.' : 'Executive daily read.',          icon: LayoutDashboard },
        { id: 'events',     label: isPortuguese ? 'Eventos'    : 'Events',    blurb: isPortuguese ? 'Agenda e portfolio.'       : 'Schedule and portfolio.',        icon: CalendarDays    },
        { id: 'tickets',    label: isPortuguese ? 'Ingressos'  : 'Tickets',   blurb: isPortuguese ? 'Lotes e ocupacao.'         : 'Releases and occupancy.',        icon: Ticket          },
        { id: 'sales',      label: isPortuguese ? 'Vendas'     : 'Sales',     blurb: isPortuguese ? 'Pedidos e pagamento.'      : 'Orders and payments.',           icon: TrendingUp      },
      ],
    },
    {
      label: isPortuguese ? 'Campo e pessoas' : 'Field and people',
      items: [
        { id: 'crm',           label: isPortuguese ? 'Participantes' : 'Participants',   blurb: isPortuguese ? 'Público, CRM e audiencias.'     : 'Audience, CRM and retention.',    icon: Users       },
        { id: 'checkin',       label: isPortuguese ? 'Credenciamento' : 'Check-in',      blurb: isPortuguese ? 'Acesso e válidação.'             : 'Access and validation.',          icon: ScanLine    },
        { id: 'staff',         label: isPortuguese ? 'Staff'          : 'Staff',         blurb: isPortuguese ? 'Cadastro e escala.'              : 'Roster and shifts.',              icon: Users       },
        { id: 'suppliers',     label: isPortuguese ? 'Fornecedores'   : 'Suppliers',     blurb: isPortuguese ? 'Parceiros.'                      : 'Partners.',                       icon: Truck       },
        { id: 'registrations', label: isPortuguese ? 'Inscrições'     : 'Registrations', blurb: isPortuguese ? 'Capital Strike.'                 : 'External registrations.',         icon: ClipboardList },
        { id: 'sponsors',      label: isPortuguese ? 'Patrocinios'    : 'Sponsors',      blurb: isPortuguese ? 'Cotas e entregas.'               : 'Tiers and deliverables.',         icon: Handshake   },
      ],
    },
    {
      label: isPortuguese ? 'Comercial e leitura' : 'Commerce and reading',
      items: [
        { id: 'products',      label: isPortuguese ? 'PDV'        : 'POS',           blurb: isPortuguese ? 'Catálogo e caixa.'       : 'Catalog and checkout.',    icon: ShoppingBag  },
        { id: 'inventory',     label: isPortuguese ? 'Estoque'    : 'Inventory',     blurb: isPortuguese ? 'Saldo e ruptura.'         : 'Stock and stockouts.',      icon: Package      },
        { id: 'communication', label: isPortuguese ? 'Comunicacao': 'Communication', blurb: isPortuguese ? 'Campanhas.'               : 'Campaigns.',                icon: MessageSquare },
        { id: 'intelligence',  label: isPortuguese ? 'Inteligência': 'Intelligence', blurb: isPortuguese ? 'Alertas e leitura.'       : 'Alerts and readouts.',      icon: BrainCircuit },
        { id: 'financial',     label: isPortuguese ? 'Financeiro' : 'Financial',     blurb: isPortuguese ? 'Margem e fechamento.'     : 'Margin and closeout.',      icon: DollarSign   },
        { id: 'billing',       label: isPortuguese ? 'Cobranca'   : 'Billing',       blurb: isPortuguese ? 'Planos.'                  : 'Plans.',                    icon: WalletCards  },
        { id: 'growth',        label: isPortuguese ? 'Crescimento': 'Growth',        blurb: isPortuguese ? 'Aquisição e retorno.'     : 'Acquisition and return.',   icon: Zap          },
      ],
    },
    {
      label: isPortuguese ? 'Sistema' : 'System',
      items: [
        { id: 'settings', label: isPortuguese ? 'Governança' : 'Governance', blurb: isPortuguese ? 'Marca, permissões e documentos.' : 'Brand, permissions and documents.', icon: Settings   },
        { id: 'help',     label: isPortuguese ? 'Ajuda'         : 'Help',     blurb: isPortuguese ? 'Suporte.'            : 'Support.',               icon: HelpCircle },
      ],
    },
  ]
}

/* ── Nav item button ── */
function NavButton({
  item,
  isActive,
  onNavigate,
  compact,
}: {
  item: NavItem
  isActive: boolean
  onNavigate: () => void
  compact: boolean
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200',
        isActive
          ? [
              'border-[rgba(0,87,231,0.22)]',
              'bg-[rgba(0,87,231,0.10)]',
            ]
          : [
              'border-transparent',
              'hover:border-[rgba(240,232,214,0.07)]',
              'hover:bg-[rgba(240,232,214,0.04)]',
            ],
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
          isActive
            ? [
                'border-[rgba(0,87,231,0.28)]',
                'bg-[rgba(0,87,231,0.14)]',
                'text-[#4285F4]',
              ]
            : [
                'border-[rgba(240,232,214,0.07)]',
                'bg-[rgba(240,232,214,0.03)]',
                'text-[rgba(240,232,214,0.35)]',
                'group-hover:border-[rgba(240,232,214,0.12)]',
                'group-hover:text-[rgba(240,232,214,0.70)]',
              ],
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-sm font-semibold leading-none tracking-[-0.01em] transition-colors',
            isActive ? 'text-[#4285F4]' : 'text-[rgba(240,232,214,0.75)] group-hover:text-[#F0E8D6]',
          )}
        >
          {item.label}
        </div>
        {!compact && (
          <div
            className={cn(
              'mt-1.5 text-[11px] leading-4 transition-colors',
              isActive ? 'text-[rgba(240,232,214,0.55)]' : 'text-[rgba(240,232,214,0.35)] group-hover:text-[rgba(240,232,214,0.55)]',
            )}
          >
            {item.blurb}
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Sidebar nav scroll área ── */
function SidebarNav({
  activeSection,
  onNavigate,
  navGroups,
  compact = false,
}: {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  navGroups: NavGroup[]
  compact?: boolean
}) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
      {navGroups.map((group) => (
        <section key={group.label}>
          {/* Group label */}
          <div className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.38em] text-[rgba(240,232,214,0.30)]">
            {group.label}
          </div>

          <div className="space-y-1">
            {group.items.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={item.id === activeSection}
                onNavigate={() => onNavigate(item.id)}
                compact={compact}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ── Main Sidebar component ── */
export function Sidebar({ activeSection, onNavigate, isOpen, onClose }: SidebarProps) {
  const { profile, organization, signOut } = useAuthStore()
  const access = useAccessControl()
  const { isPortuguese } = useAppLocale()

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    const prevOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.overscrollBehavior = prevOverscroll
    }
  }, [isOpen])

  const navGroups = createNavGroups(isPortuguese)
    .map((g) => ({ ...g, items: g.items.filter((i) => access.canAccessSection(i.id)) }))
    .filter((g) => g.items.length > 0)

  const initials = getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)

  /* ── Shared header ── */
  const SidebarHeader = () => (
    <div className="relative shrink-0 border-b border-[rgba(240,232,214,0.07)] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-[#060B18] border border-[rgba(201,168,76,0.18)]">
          <img src="/logo.png" alt="Pulse" className="h-9 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.38em] text-[rgba(240,232,214,0.35)]">
            {isPortuguese ? 'Área do produtor' : 'Producer area'}
          </div>
          <div className="mt-0.5 text-lg font-bold leading-none tracking-[-0.02em] text-[#F0E8D6]">
            Pulse
          </div>
        </div>
      </div>
    </div>
  )

  /* ── User card footer ── */
  const UserFooter = () => (
    <div className="shrink-0 border-t border-[rgba(240,232,214,0.07)] px-3 pb-3 pt-2">
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(240,232,214,0.07)] bg-[rgba(240,232,214,0.03)] p-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0057E7] text-xs font-bold text-white">
          {initials || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#F0E8D6]">
            {profile?.first_name} {profile?.last_name}
          </div>
          <div className="truncate text-[11px] text-[rgba(240,232,214,0.40)]">
            {organization?.name ?? (isPortuguese ? 'Operação principal' : 'Primary operation')}
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => signOut()}
          title={isPortuguese ? 'Sair' : 'Sign out'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(240,232,214,0.10)] bg-[rgba(240,232,214,0.04)] text-[rgba(240,232,214,0.40)] transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden h-screen w-[300px] shrink-0 flex-col border-r border-[rgba(240,232,214,0.07)] bg-[#060B18] lg:flex">
        <SidebarHeader />
        <SidebarNav
          activeSection={activeSection}
          onNavigate={onNavigate}
          navGroups={navGroups}
        />
        <UserFooter />
      </aside>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label={isPortuguese ? 'Fechar navegação' : 'Close navigation'}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-screen w-[88vw] max-w-[320px] flex-col border-r border-[rgba(240,232,214,0.07)] bg-[#060B18] shadow-2xl">
            {/* Mobile header */}
            <div className="flex items-center justify-between border-b border-[rgba(240,232,214,0.07)] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-[#060B18] border border-[rgba(201,168,76,0.18)]">
                  <img src="/logo.png" alt="Pulse" className="h-8 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="text-lg font-bold leading-none tracking-[-0.02em] text-[#F0E8D6]">
                  {isPortuguese ? 'Navegação' : 'Navigation'}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(240,232,214,0.10)] bg-[rgba(240,232,214,0.04)] text-[rgba(240,232,214,0.55)] transition-all hover:bg-[rgba(240,232,214,0.08)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarNav
              activeSection={activeSection}
              onNavigate={(s) => { onNavigate(s); onClose() }}
              navGroups={navGroups}
              compact
            />

            <UserFooter />
          </aside>
        </div>
      )}
    </>
  )
}
