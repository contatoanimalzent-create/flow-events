export interface PulseNavigationLink {
  label: string
  href: string
}

export const pulseBrandHref = '/'

export const pulsePrimaryNavigation: PulseNavigationLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Eventos', href: '/events' },
  { label: 'Login', href: '/login' },
]

export const pulseInstitutionalLinks: PulseNavigationLink[] = [
  { label: 'Termos', href: '/terms' },
  { label: 'Privacidade', href: '/privacy' },
]
