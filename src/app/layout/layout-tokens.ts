import type { CSSProperties } from 'react'

export const appLayoutTokens = {
  sidebar: {
    expandedWidth: '18.75rem',
    collapsedWidth: '5.75rem',
    mobileWidth: '18rem',
    inset: '1rem',
  },
  header: {
    height: '5.5rem',
  },
  content: {
    maxWidth: '92rem',
    maxWidthWide: '100rem',
    paddingXMobile: '1rem',
    paddingXDesktop: '2rem',
    paddingY: '2rem',
    sectionGap: '1.5rem',
  },
  grid: {
    columns: 12,
    gap: '1.5rem',
    gapDense: '1rem',
  },
  shell: {
    background: 'linear-gradient(180deg, #f8faff 0%, #f3f6fb 100%)',
    contentBackground:
      'radial-gradient(circle at top right, rgba(47, 91, 255, 0.10), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,248,250,0.98) 100%)',
    sidebarBackground:
      'radial-gradient(circle at top, rgba(47, 91, 255, 0.18) 0%, transparent 24%), linear-gradient(180deg, #071225 0%, #0b1730 54%, #0e1d3e 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.08)',
    sidebarMuted: 'rgba(255, 255, 255, 0.66)',
    sidebarText: '#F8FAFF',
    headerBackground: 'rgba(255, 255, 255, 0.78)',
    headerBorder: 'rgba(10, 26, 255, 0.08)',
    canvasGrid: 'rgba(10, 26, 255, 0.05)',
    canvasGlow: 'rgba(47, 91, 255, 0.16)',
    surfaceBorder: 'rgba(10, 26, 255, 0.08)',
  },
  motion: {
    duration: '260ms',
  },
} as const

export function getAppLayoutVariables(): CSSProperties {
  return {
    '--pulse-app-sidebar-width': appLayoutTokens.sidebar.expandedWidth,
    '--pulse-app-sidebar-expanded-width': appLayoutTokens.sidebar.expandedWidth,
    '--pulse-app-sidebar-collapsed-width': appLayoutTokens.sidebar.collapsedWidth,
    '--pulse-app-sidebar-mobile-width': appLayoutTokens.sidebar.mobileWidth,
    '--pulse-app-sidebar-inset': appLayoutTokens.sidebar.inset,
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
    '--pulse-app-motion-duration': appLayoutTokens.motion.duration,
  } as CSSProperties
}
