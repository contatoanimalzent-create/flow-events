export type PublicRoute =
  | 'home'
  | 'events'
  | 'about'
  | 'create-event'
  | 'account'
  | 'login'
  | 'signup'
  | 'terms'
  | 'privacy'
  | 'contact'
  | 'producer'
  | 'operator'
  | 'staff-app'
  | 'supervisor-app'
  | 'participant-app'
  | 'promoter-app'
  | 'pulse-app'
  // ── New content pages ──
  | 'como-funciona'
  | 'precos'
  | 'demo'
  | 'api'
  | 'funcionalidades'
  | 'carreiras'
  | 'blog'
  | 'cases'
  | 'imprensa'
  | 'ajuda'
  | 'ajuda-compradores'
  | 'ajuda-produtores'
  | 'status'
  | 'eventos-categoria'
  | { type: 'event'; slug: string }
  | { type: 'staff-join'; token: string }
  | { type: 'timeclock'; eventId: string; credentialToken: string }

export function getInitialPublicRoute(): PublicRoute {
  const path = window.location.pathname

  // ── Existing routes ──
  if (path === '/terms' || path === '/termos') return 'terms'
  if (path === '/privacy' || path === '/privacidade') return 'privacy'
  if (path === '/contact' || path === '/contato') return 'contact'
  if (path === '/about' || path === '/sobre') return 'about'
  if (path === '/events' || path === '/eventos') return 'events'
  if (path === '/create-event' || path === '/criar-evento') return 'create-event'
  if (path === '/me' || path === '/account') return 'account'
  if (path === '/producer' || path === '/produtor') return 'producer'
  if (path === '/login') return 'login'
  if (path === '/signup' || path === '/register') return 'signup'

  // ── New content pages ──
  if (path === '/como-funciona' || path === '/how-it-works') return 'como-funciona'
  if (path === '/precos' || path === '/pricing') return 'precos'
  if (path === '/demo') return 'demo'
  if (path === '/api') return 'api'
  if (path.startsWith('/funcionalidades') || path.startsWith('/features')) return 'funcionalidades'
  if (path === '/carreiras' || path === '/careers') return 'carreiras'
  if (path === '/blog') return 'blog'
  if (path === '/cases') return 'cases'
  if (path === '/imprensa' || path === '/press') return 'imprensa'
  if (path === '/ajuda/compradores' || path === '/help/buyers') return 'ajuda-compradores'
  if (path === '/ajuda/produtores' || path === '/help/producers') return 'ajuda-produtores'
  if (path === '/ajuda' || path === '/help') return 'ajuda'
  if (path === '/status') return 'status'
  if (path.startsWith('/eventos/') || path.startsWith('/events/')) return 'eventos-categoria'

  // ── Pulse unified app ──
  if (path.startsWith('/pulse')) return 'pulse-app'

  // ── Legacy mobile apps ──
  if (path === '/op') return 'operator'
  if (path === '/staff' || path === '/staff-app') return 'staff-app'
  if (path === '/supervisor') return 'supervisor-app'
  if (path === '/app' || path === '/participant') return 'participant-app'
  if (path === '/promoter') return 'promoter-app'

  const eventMatch = path.match(/^\/e\/([^/]+)/)
  if (eventMatch) return { type: 'event', slug: eventMatch[1] }

  const staffJoinMatch = path.match(/^\/staff\/join\/([^/]+)/)
  if (staffJoinMatch) return { type: 'staff-join', token: staffJoinMatch[1] }

  if (path === '/timeclock') {
    const params = new URLSearchParams(window.location.search)
    const eventId = params.get('event_id') ?? ''
    const credentialToken = params.get('credential_token') ?? ''
    if (eventId) return { type: 'timeclock', eventId, credentialToken }
  }

  return 'home'
}

export function isImmediatePublicRoute(route: PublicRoute) {
  return (
    typeof route === 'object' ||
    route === 'events' ||
    route === 'about' ||
    route === 'create-event' ||
    route === 'account' ||
    route === 'terms' ||
    route === 'privacy' ||
    route === 'contact' ||
    route === 'producer' ||
    route === 'signup' ||
    route === 'operator' ||
    route === 'staff-app' ||
    route === 'supervisor-app' ||
    route === 'participant-app' ||
    route === 'promoter-app' ||
    route === 'pulse-app' ||
    route === 'como-funciona' ||
    route === 'precos' ||
    route === 'demo' ||
    route === 'api' ||
    route === 'funcionalidades' ||
    route === 'carreiras' ||
    route === 'blog' ||
    route === 'cases' ||
    route === 'imprensa' ||
    route === 'ajuda' ||
    route === 'ajuda-compradores' ||
    route === 'ajuda-produtores' ||
    route === 'status' ||
    route === 'eventos-categoria'
  )
}

export function isStaffJoinRoute(route: PublicRoute): route is { type: 'staff-join'; token: string } {
  return typeof route === 'object' && route.type === 'staff-join'
}
