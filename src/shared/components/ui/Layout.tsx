import { Outlet } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface LayoutProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  currentPath?: string
  onLogin?: () => void
  useTanStackOutlet?: boolean
}

function isActiveRoute(currentPath: string, href: string) {
  if (href === '/') {
    return currentPath === '/'
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export function Layout({
  children,
  className,
  contentClassName,
  currentPath: currentPathOverride,
  onLogin,
  useTanStackOutlet = false,
}: LayoutProps) {
  const [currentPath, setCurrentPath] = useState(currentPathOverride ?? '/')

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

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Eventos', href: '/events' },
    { label: 'Login', href: '/login', onClick: onLogin },
  ]

  return (
    <>
      <style>{`
        .pulse-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at top, rgba(0, 123, 255, 0.08), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
          color: var(--pulse-color-text-primary, #000000);
        }

        .pulse-layout__header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.94);
          border-bottom: 1px solid rgba(229, 229, 229, 0.9);
          box-shadow: 0 12px 30px rgba(0, 26, 84, 0.08);
          backdrop-filter: blur(16px);
        }

        .pulse-layout__shell {
          width: min(calc(100% - 2.5rem), var(--pulse-grid-max-width, 78rem));
          margin: 0 auto;
        }

        .pulse-layout__header-row {
          min-height: 4.6rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .pulse-layout__brand {
          display: inline-flex;
          align-items: center;
          gap: 0.9rem;
          text-decoration: none;
        }

        .pulse-layout__brand-mark {
          position: relative;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          background:
            radial-gradient(circle, rgba(0, 123, 255, 0.24) 0%, rgba(0, 123, 255, 0.08) 46%, transparent 72%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-layout__brand-core,
        .pulse-layout__brand-ring {
          position: absolute;
          border-radius: 999px;
        }

        .pulse-layout__brand-core {
          width: 0.72rem;
          height: 0.72rem;
          background: var(--pulse-color-primary-accent, #007BFF);
          box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.28);
        }

        .pulse-layout__brand-ring {
          width: 1.6rem;
          height: 1.6rem;
          border: 2px solid rgba(0, 123, 255, 0.28);
          animation: pulse-layout-ring 2.4s ease-in-out infinite;
        }

        .pulse-layout__brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
        }

        .pulse-layout__brand-name {
          color: var(--pulse-color-primary-base, #0033A0);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1.18rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .pulse-layout__brand-tagline {
          color: var(--pulse-color-text-secondary, #333333);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.76rem;
          line-height: 1.3;
        }

        .pulse-layout__nav {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .pulse-layout__nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.6rem;
          padding: 0 0.95rem;
          border-radius: 999px;
          border: 0;
          background: transparent;
          color: var(--pulse-color-text-secondary, #333333);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition:
            color 180ms ease,
            background-color 180ms ease,
            transform 180ms ease;
        }

        .pulse-layout__nav-link:hover {
          color: var(--pulse-color-primary-base, #0033A0);
          background: rgba(0, 123, 255, 0.06);
        }

        .pulse-layout__nav-link--active {
          color: var(--pulse-color-primary-base, #0033A0);
        }

        .pulse-layout__nav-link--active::after {
          content: '';
          position: absolute;
          left: 0.9rem;
          right: 0.9rem;
          bottom: 0.38rem;
          height: 2px;
          border-radius: 999px;
          background: var(--pulse-color-primary-accent, #007BFF);
        }

        .pulse-layout__content {
          flex: 1;
          width: 100%;
          padding: var(--pulse-spacing-xl, 2rem) 0 var(--pulse-spacing-xxl, 3rem);
        }

        .pulse-layout__footer {
          border-top: 1px solid rgba(229, 229, 229, 0.9);
          background: rgba(255, 255, 255, 0.88);
        }

        .pulse-layout__footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 0 1.35rem;
        }

        .pulse-layout__footer-copy,
        .pulse-layout__footer-link {
          color: var(--pulse-color-text-secondary, #333333);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .pulse-layout__footer-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pulse-layout__footer-link {
          text-decoration: none;
          transition: color 180ms ease;
        }

        .pulse-layout__footer-link:hover {
          color: var(--pulse-color-primary-base, #0033A0);
        }

        @keyframes pulse-layout-ring {
          0% {
            opacity: 0.45;
            transform: scale(0.8);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.04);
          }

          100% {
            opacity: 0.45;
            transform: scale(0.8);
          }
        }

        @media (max-width: 720px) {
          .pulse-layout__shell {
            width: min(calc(100% - 1.5rem), var(--pulse-grid-max-width, 78rem));
          }

          .pulse-layout__header-row,
          .pulse-layout__footer-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .pulse-layout__nav {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 0.1rem;
          }

          .pulse-layout__footer-links {
            flex-wrap: wrap;
            gap: 0.75rem 1rem;
          }
        }
      `}</style>

      <div className={cn('pulse-layout', className)}>
        <header className="pulse-layout__header">
          <div className="pulse-layout__shell">
            <div className="pulse-layout__header-row">
              <a href="/" className="pulse-layout__brand" aria-label="Pulse">
                <span className="pulse-layout__brand-mark" aria-hidden="true">
                  <span className="pulse-layout__brand-ring" />
                  <span className="pulse-layout__brand-core" />
                </span>

                <span className="pulse-layout__brand-text">
                  <span className="pulse-layout__brand-name">Pulse</span>
                  <span className="pulse-layout__brand-tagline">Event command in sync</span>
                </span>
              </a>

              <nav className="pulse-layout__nav" aria-label="Primary">
                {navItems.map((item) => {
                  const active = isActiveRoute(currentPath, item.href)

                  if (item.onClick) {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={item.onClick}
                        className={cn(
                          'pulse-layout__nav-link',
                          active && 'pulse-layout__nav-link--active',
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'pulse-layout__nav-link',
                        active && 'pulse-layout__nav-link--active',
                      )}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>

        <main className={cn('pulse-layout__content', contentClassName)}>
          {useTanStackOutlet ? <Outlet /> : children}
        </main>

        <footer className="pulse-layout__footer">
          <div className="pulse-layout__shell">
            <div className="pulse-layout__footer-row">
              <div className="pulse-layout__footer-copy">Pulse platform for live experiences.</div>

              <div className="pulse-layout__footer-links">
                <a href="/terms" className="pulse-layout__footer-link">
                  Termos
                </a>
                <a href="/privacy" className="pulse-layout__footer-link">
                  Privacidade
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export type { LayoutProps }
