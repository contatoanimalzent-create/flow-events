export type PublicRoute =
  | 'home'
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

  const eventMatch = path.match(/^\/e\/([^/]+)/)
  if (eventMatch) {
    return { type: 'event', slug: eventMatch[1] }
  }

  return 'home'
}

export function isImmediatePublicRoute(route: PublicRoute) {
  return typeof route === 'object' || route === 'terms' || route === 'privacy' || route === 'contact'
}
