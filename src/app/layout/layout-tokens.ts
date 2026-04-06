import type { CSSProperties } from 'react'

export const appLayoutTokens = {
  sidebar: {
    expandedWidth: '16.25rem',
    collapsedWidth: '5rem',
    mobileWidth: '16.25rem',
  },
  header: {
    height: '4rem',
  },
  content: {
    maxWidth: '80rem',
    maxWidthWide: '80rem',
    paddingXMobile: '1rem',
    paddingXDesktop: '1.5rem',
    paddingY: '1.5rem',
    sectionGap: '1.5rem',
  },
  grid: {
    columns: 12,
    gap: '1.5rem',
    gapDense: '1rem',
  },
  shell: {
    background: 'var(--pulse-color-surface)',
    contentBackground: 'transparent',
    sidebarBackground: 'var(--pulse-color-background)',
    sidebarBorder: 'var(--pulse-color-border)',
    sidebarMuted: 'var(--pulse-color-text-secondary)',
    sidebarText: 'var(--pulse-color-text-primary)',
    headerBackground: 'var(--pulse-color-background)',
    headerBorder: 'var(--pulse-color-border)',
    canvasGrid: 'transparent',
    canvasGlow: 'transparent',
    surfaceBorder: 'var(--pulse-color-border)',
    hoverSurface: 'var(--pulse-color-surface)',
    activeSurface: 'color-mix(in srgb, var(--pulse-color-primary) 8%, var(--pulse-color-background))',
  },
  motion: {
    duration: '180ms',
  },
} as const

export function getAppLayoutVariables(): CSSProperties {
  return {
    '--pulse-app-sidebar-width': appLayoutTokens.sidebar.expandedWidth,
    '--pulse-app-sidebar-expanded-width': appLayoutTokens.sidebar.expandedWidth,
    '--pulse-app-sidebar-collapsed-width': appLayoutTokens.sidebar.collapsedWidth,
    '--pulse-app-sidebar-mobile-width': appLayoutTokens.sidebar.mobileWidth,
    '--pulse-app-header-height': appLayoutTokens.header.height,
    '--pulse-app-content-max-width': appLayoutTokens.content.maxWidth,
    '--pulse-app-content-max-width-wide': appLayoutTokens.content.maxWidthWide,
    '--pulse-app-content-padding-x-mobile': appLayoutTokens.content.paddingXMobile,
    '--pulse-app-content-padding-x-desktop': appLayoutTokens.content.paddingXDesktop,
    '--pulse-app-content-padding-y': appLayoutTokens.content.paddingY,
    '--pulse-app-section-gap': appLayoutTokens.content.sectionGap,
    '--pulse-app-grid-columns': String(appLayoutTokens.grid.columns),
    '--pulse-app-grid-gap': appLayoutTokens.grid.gap,
    '--pulse-app-grid-gap-dense': appLayoutTokens.grid.gapDense,
    '--pulse-app-shell-bg': appLayoutTokens.shell.background,
    '--pulse-app-content-bg': appLayoutTokens.shell.contentBackground,
    '--pulse-app-sidebar-bg': appLayoutTokens.shell.sidebarBackground,
    '--pulse-app-sidebar-border': appLayoutTokens.shell.sidebarBorder,
    '--pulse-app-sidebar-muted': appLayoutTokens.shell.sidebarMuted,
    '--pulse-app-sidebar-text': appLayoutTokens.shell.sidebarText,
    '--pulse-app-header-bg': appLayoutTokens.shell.headerBackground,
    '--pulse-app-header-border': appLayoutTokens.shell.headerBorder,
    '--pulse-app-canvas-grid': appLayoutTokens.shell.canvasGrid,
    '--pulse-app-canvas-glow': appLayoutTokens.shell.canvasGlow,
    '--pulse-app-surface-border': appLayoutTokens.shell.surfaceBorder,
    '--pulse-app-hover-surface': appLayoutTokens.shell.hoverSurface,
    '--pulse-app-active-surface': appLayoutTokens.shell.activeSurface,
    '--pulse-app-motion-duration': appLayoutTokens.motion.duration,
  } as CSSProperties
}
