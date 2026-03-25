export type PublicRoute =
  | 'home'
  | 'events'
  | 'login'
  | 'terms'
  | 'privacy'
  | 'contact'
  | { type: 'event'; slug: string }

export function getInitialPublicRoute(): PublicRoute {
  const path = window.location.pathname

  if (path === '/terms') return 'terms'
  if (path === '/privacy') return 'privacy'
  if (path === '/contact') return 'contact'
  if (path === '/events') return 'events'

  const eventMatch = path.match(/^\/e\/([^/]+)/)
  if (eventMatch) {
    return { type: 'event', slug: eventMatch[1] }
  }

  return 'home'
}

export function isImmediatePublicRoute(route: PublicRoute) {
  return typeof route === 'object' || route === 'events' || route === 'terms' || route === 'privacy' || route === 'contact'
}
