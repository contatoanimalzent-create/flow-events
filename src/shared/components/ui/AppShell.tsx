import { Outlet } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface AppShellProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  currentPath?: string
  onLogin?: () => void
  useTanStackOutlet?: boolean
}

const APP_SHELL_NAVIGATION = [
  { label: 'Eventos', href: '/events' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Login', href: '/login' },
] as const

const APP_SHELL_FOOTER_LINKS = [
  { label: 'Termos', href: '/terms' },
  { label: 'Privacidade', href: '/privacy' },
  { label: 'Contato', href: '/contact' },
] as const

function isActiveRoute(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export function AppShell({
  children,
  className,
  contentClassName,
  currentPath: currentPathOverride,
  onLogin,
  useTanStackOutlet = false,
}: AppShellProps) {
  const [currentPath, setCurrentPath] = useState(currentPathOverride ?? '/events')

  useEffect(() => {
    if (typeof currentPathOverride === 'string') {
      setCurrentPath(currentPathOverride)
    }
  }, [currentPathOverride])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof currentPathOverride === 'string') {
      return
    }

    const syncPath = () => setCurrentPath(window.location.pathname)

    syncPath()
    window.addEventListener('popstate', syncPath)

    return () => window.removeEventListener('popstate', syncPath)
  }, [currentPathOverride])

  const navItems = APP_SHELL_NAVIGATION.map((item) => ({
    ...item,
    onClick: item.href === '/login' ? onLogin : undefined,
  }))

  return (
    <>
      <style>{`
        .pulse-app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pulse-color-background);
          color: var(--pulse-color-text-primary);
        }

        .pulse-app-shell__header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--pulse-color-background);
          border-bottom: 1px solid var(--pulse-color-border);
        }

        .pulse-app-shell__container {
          width: min(100%, 1280px);
          margin: 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .pulse-app-shell__header-row {
          min-height: 4.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .pulse-app-shell__brand {
          color: var(--pulse-color-primary);
          font-family: var(--pulse-font-family);
          font-size: 1.125rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          text-decoration: none;
        }

        .pulse-app-shell__nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pulse-app-shell__nav-link {
          min-height: 2.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.9rem;
          border: 0;
          border-radius: var(--pulse-radius-full);
          background: transparent;
          color: var(--pulse-color-text-secondary);
          font-family: var(--pulse-font-family);
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 180ms ease, color 180ms ease;
        }

        .pulse-app-shell__nav-link:hover {
          background: var(--pulse-button-ghost-hover);
          color: var(--pulse-color-primary);
        }

        .pulse-app-shell__nav-link--active {
          background: var(--pulse-surface-muted);
          color: var(--pulse-color-primary);
        }

        .pulse-app-shell__main {
          flex: 1;
          width: 100%;
        }

        .pulse-app-shell__content {
          width: 100%;
        }

        .pulse-app-shell__content > section {
          background: var(--pulse-color-background);
        }

        .pulse-app-shell__content > section:nth-of-type(even) {
          background: var(--pulse-color-surface);
        }

        .pulse-app-shell__section-inner {
          width: min(100%, 1280px);
          margin: 0 auto;
          padding: 4rem 1rem;
        }

        .pulse-app-shell__footer {
          border-top: 1px solid var(--pulse-color-border);
          background: var(--pulse-color-background);
        }

        .pulse-app-shell__footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1.25rem;
          padding-bottom: 1.25rem;
        }

        .pulse-app-shell__footer-copy,
        .pulse-app-shell__footer-link {
          color: var(--pulse-color-text-secondary);
          font-family: var(--pulse-font-family);
          font-size: var(--pulse-font-size-caption);
          line-height: 1.5;
        }

        .pulse-app-shell__footer-links {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .pulse-app-shell__footer-link {
          text-decoration: none;
          transition: color 180ms ease;
        }

        .pulse-app-shell__footer-link:hover {
          color: var(--pulse-color-primary);
        }

        @media (min-width: 640px) {
          .pulse-app-shell__container,
          .pulse-app-shell__section-inner {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .pulse-app-shell__container,
          .pulse-app-shell__section-inner {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }

        @media (max-width: 720px) {
          .pulse-app-shell__header-row,
          .pulse-app-shell__footer-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .pulse-app-shell__nav {
            width: 100%;
            overflow-x: auto;
          }

          .pulse-app-shell__section-inner {
            padding-top: 3rem;
            padding-bottom: 3rem;
          }
        }
      `}</style>

      <div className={cn('pulse-app-shell', className)}>
        <header className="pulse-app-shell__header">
          <div className="pulse-app-shell__container">
            <div className="pulse-app-shell__header-row">
              <a href="/" className="pulse-app-shell__brand" aria-label="Pulse">
                Pulse
              </a>

              <nav className="pulse-app-shell__nav" aria-label="Primary">
                {navItems.map((item) => {
                  const active = isActiveRoute(currentPath, item.href)

                  if (item.onClick) {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={item.onClick}
                        className={cn('pulse-app-shell__nav-link', active && 'pulse-app-shell__nav-link--active')}
                      >
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn('pulse-app-shell__nav-link', active && 'pulse-app-shell__nav-link--active')}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>

        <main className="pulse-app-shell__main">
          <div className={cn('pulse-app-shell__content', contentClassName)}>
            {useTanStackOutlet ? <Outlet /> : children}
          </div>
        </main>

        <footer className="pulse-app-shell__footer">
          <div className="pulse-app-shell__container">
            <div className="pulse-app-shell__footer-row">
              <div className="pulse-app-shell__footer-copy">Pulse for modern event operations.</div>

              <div className="pulse-app-shell__footer-links">
                {APP_SHELL_FOOTER_LINKS.map((link) => (
                  <a key={link.href} href={link.href} className="pulse-app-shell__footer-link">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export interface AppSectionProps {
  children: ReactNode
  className?: string
}

export function AppSection({ children, className }: AppSectionProps) {
  return (
    <section className={className}>
      <div className="pulse-app-shell__section-inner">{children}</div>
    </section>
  )
}

export type { AppShellProps }
