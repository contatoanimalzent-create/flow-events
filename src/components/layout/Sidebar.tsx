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
      label: isPortuguese ? 'Operacao central' : 'Core operation',
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
        { id: 'crm',           label: isPortuguese ? 'Relacionamento' : 'CRM',           blurb: isPortuguese ? 'Publico e audiencias.'           : 'Audience and retention.',         icon: Users       },
        { id: 'checkin',       label: isPortuguese ? 'Credenciamento' : 'Check-in',      blurb: isPortuguese ? 'Acesso e validacao.'             : 'Access and validation.',          icon: ScanLine    },
        { id: 'staff',         label: isPortuguese ? 'Staff'          : 'Staff',         blurb: isPortuguese ? 'Cadastro e escala.'              : 'Roster and shifts.',              icon: Users       },
        { id: 'suppliers',     label: isPortuguese ? 'Fornecedores'   : 'Suppliers',     blurb: isPortuguese ? 'Parceiros.'                      : 'Partners.',                       icon: Truck       },
        { id: 'registrations', label: isPortuguese ? 'Inscricoes'     : 'Registrations', blurb: isPortuguese ? 'Capital Strike.'                 : 'External registrations.',         icon: ClipboardList },
        { id: 'sponsors',      label: isPortuguese ? 'Patrocinios'    : 'Sponsors',      blurb: isPortuguese ? 'Cotas e entregas.'               : 'Tiers and deliverables.',         icon: Handshake   },
      ],
    },
    {
      label: isPortuguese ? 'Comercial e leitura' : 'Commerce and reading',
      items: [
        { id: 'products',      label: isPortuguese ? 'PDV'        : 'POS',           blurb: isPortuguese ? 'Catalogo e caixa.'       : 'Catalog and checkout.',    icon: ShoppingBag  },
        { id: 'inventory',     label: isPortuguese ? 'Estoque'    : 'Inventory',     blurb: isPortuguese ? 'Saldo e ruptura.'         : 'Stock and stockouts.',      icon: Package      },
        { id: 'communication', label: isPortuguese ? 'Comunicacao': 'Communication', blurb: isPortuguese ? 'Campanhas.'               : 'Campaigns.',                icon: MessageSquare },
        { id: 'intelligence',  label: isPortuguese ? 'Inteligencia': 'Intelligence', blurb: isPortuguese ? 'Alertas e leitura.'       : 'Alerts and readouts.',      icon: BrainCircuit },
        { id: 'financial',     label: isPortuguese ? 'Financeiro' : 'Financial',     blurb: isPortuguese ? 'Margem e fechamento.'     : 'Margin and closeout.',      icon: DollarSign   },
        { id: 'billing',       label: isPortuguese ? 'Cobranca'   : 'Billing',       blurb: isPortuguese ? 'Planos.'                  : 'Plans.',                    icon: WalletCards  },
        { id: 'growth',        label: isPortuguese ? 'Crescimento': 'Growth',        blurb: isPortuguese ? 'Aquisicao e retorno.'     : 'Acquisition and return.',   icon: Zap          },
      ],
    },
    {
      label: isPortuguese ? 'Sistema' : 'System',
      items: [
        { id: 'settings', label: isPortuguese ? 'Configuracoes' : 'Settings', blurb: isPortuguese ? 'Marca e permissoes.' : 'Brand and permissions.', icon: Settings   },
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
        'group flex w-full items-start gap-3 rounded-[14px] border px-3 py-2.5 text-left transition-all duration-200',
        isActive
          ? [
              'border-[rgba(214,42,11,0.28)]',
              'bg-[linear-gradient(180deg,rgba(214,42,11,0.18)_0%,rgba(214,42,11,0.08)_100%)]',
              'shadow-[0_3px_16px_rgba(214,42,11,0.18),0_1px_4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]',
            ]
          : [
              'border-transparent',
              'hover:border-[rgba(255,255,255,0.08)]',
              'hover:bg-[rgba(255,255,255,0.06)]',
              'hover:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
            ],
      )}
    >
      {/* Icon container — embossed circle */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
          isActive
            ? [
                'border-[rgba(214,42,11,0.35)]',
                'bg-[radial-gradient(circle_at_35%_30%,rgba(214,42,11,0.30),rgba(214,42,11,0.12))]',
                'text-[#ffe0da]',
                'shadow-[0_0_12px_rgba(214,42,11,0.28),0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]',
              ]
            : [
                'border-[rgba(255,255,255,0.10)]',
                'bg-[rgba(255,255,255,0.05)]',
                'text-[rgba(248,250,252,0.45)]',
                'shadow-[0_1px_4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)]',
                'group-hover:border-[rgba(255,255,255,0.15)]',
                'group-hover:bg-[rgba(255,255,255,0.09)]',
                'group-hover:text-[rgba(248,250,252,0.75)]',
              ],
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'font-display text-[1.55rem] leading-none tracking-[-0.03em] transition-colors',
            isActive ? 'text-[#f8fafc]' : 'text-[rgba(248,250,252,0.65)] group-hover:text-[rgba(248,250,252,0.90)]',
          )}
        >
          {item.label}
        </div>
        {!compact && (
          <div
            className={cn(
              'mt-1.5 text-[11px] leading-4 transition-colors',
              isActive ? 'text-[rgba(248,250,252,0.5)]' : 'text-[rgba(248,250,252,0.32)] group-hover:text-[rgba(248,250,252,0.48)]',
            )}
          >
            {item.blurb}
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Sidebar nav scroll area ── */
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
          <div
            className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'rgba(174,147,111,0.65)' }}
          >
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
    <div
      className="relative shrink-0 px-4 py-4"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <img src="/logo.png" alt="Flow Events" className="h-7 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'rgba(174,147,111,0.75)' }}
          >
            {isPortuguese ? 'Area do produtor' : 'Producer area'}
          </div>
          <div
            className="mt-0.5 font-display text-[1.5rem] leading-none tracking-[-0.03em]"
            style={{ color: '#f8fafc' }}
          >
            Flow Events
          </div>
        </div>
      </div>
    </div>
  )

  /* ── User card footer ── */
  const UserFooter = () => (
    <div
      className="shrink-0 px-3 pb-3 pt-2"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
      }}
    >
      <div
        className="flex items-center gap-3 rounded-[14px] p-3"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(214,42,11,0.35), rgba(214,42,11,0.15))',
            border: '1px solid rgba(214,42,11,0.35)',
            color: '#ffd0ca',
            boxShadow: '0 0 12px rgba(214,42,11,0.22), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {initials || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold" style={{ color: '#f8fafc' }}>
            {profile?.first_name} {profile?.last_name}
          </div>
          <div className="truncate text-[11px]" style={{ color: 'rgba(248,250,252,0.42)' }}>
            {organization?.name ?? (isPortuguese ? 'Operacao principal' : 'Primary operation')}
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => signOut()}
          title={isPortuguese ? 'Sair' : 'Sign out'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(248,250,252,0.4)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(220,38,38,0.12)'
            el.style.borderColor = 'rgba(220,38,38,0.25)'
            el.style.color = '#fca5a5'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.04)'
            el.style.borderColor = 'rgba(255,255,255,0.08)'
            el.style.color = 'rgba(248,250,252,0.4)'
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  /* ── Shared sidebar styles ── */
  const sidebarStyles: React.CSSProperties = {
    /* Carbon fiber weave on dark navy base */
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.013) 1px, rgba(255,255,255,0.013) 2px),
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.009) 1px, rgba(255,255,255,0.009) 2px),
      linear-gradient(180deg, #0f1e3d 0%, #0a1428 100%)
    `,
    backgroundSize: '2px 2px, 2px 2px, 100% 100%',
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden h-screen w-[300px] shrink-0 flex-col lg:flex"
        style={{
          ...sidebarStyles,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.22), inset -1px 0 0 rgba(255,255,255,0.025)',
        }}
      >
        {/* Top metallic edge highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.18) 60%, transparent 100%)' }}
        />

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
            aria-label={isPortuguese ? 'Fechar navegacao' : 'Close navigation'}
            className="absolute inset-0"
            style={{ background: 'rgba(10,16,26,0.72)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 flex h-screen w-[88vw] max-w-[320px] flex-col"
            style={{
              ...sidebarStyles,
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '8px 0 48px rgba(0,0,0,0.55)',
            }}
          >
            {/* Top metallic edge */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
            />

            {/* Mobile header */}
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
                >
                  <img src="/logo.png" alt="Flow Events" className="h-6 w-auto object-contain" />
                </div>
                <div
                  className="font-display text-[1.8rem] leading-none tracking-[-0.03em]"
                  style={{ color: '#f8fafc' }}
                >
                  {isPortuguese ? 'Navegacao.' : 'Navigation.'}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(248,250,252,0.6)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
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
