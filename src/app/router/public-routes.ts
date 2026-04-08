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
  | { type: 'event'; slug: string }
  | { type: 'staff-join'; token: string }
  | { type: 'timeclock'; eventId: string; credentialToken: string }

export function getInitialPublicRoute(): PublicRoute {
  const path = window.location.pathname

  if (path === '/terms') return 'terms'
  if (path === '/privacy') return 'privacy'
  if (path === '/contact') return 'contact'
  if (path === '/about') return 'about'
  if (path === '/events') return 'events'
  if (path === '/create-event') return 'create-event'
  if (path === '/me' || path === '/account') return 'account'
  if (path === '/producer') return 'producer'
  if (path === '/login') return 'login'
  if (path === '/signup' || path === '/register') return 'signup'

  const eventMatch = path.match(/^\/e\/([^/]+)/)
  if (eventMatch) {
    return { type: 'event', slug: eventMatch[1] }
  }

  const staffJoinMatch = path.match(/^\/staff\/join\/([^/]+)/)
  if (staffJoinMatch) {
    return { type: 'staff-join', token: staffJoinMatch[1] }
  }

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
    route === 'signup'
  )
}

export function isStaffJoinRoute(route: PublicRoute): route is { type: 'staff-join'; token: string } {
  return typeof route === 'object' && route.type === 'staff-join'
}
