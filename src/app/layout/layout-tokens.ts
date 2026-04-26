import type { CSSProperties } from 'react'

export const appLayoutTokens = {
  sidebar: {
    expandedWidth: '16.25rem',
    collapsedWidth: '16.25rem',
    mobileWidth: '16.25rem',
  },
  header: {
    height: '4rem',
  },
  content: {
    maxWidth: '80rem',
    maxWidthWide: '80rem',
    paddingXMobile: '1rem',
    paddingXDesktop: '2rem',
    paddingY: '1rem',
    sectionGap: '2rem',
  },
  grid: {
    columns: 12,
    gap: '1.5rem',
    gapDense: '1rem',
  },
  shell: {
    background: '#060B18',
    contentBackground: 'transparent',
    sidebarBackground: '#060B18',
    sidebarBorder: 'rgba(240,232,214,0.07)',
    sidebarMuted: 'rgba(240,232,214,0.35)',
    sidebarText: '#F0E8D6',
    headerBackground: 'rgba(6,11,24,0.94)',
    headerBorder: 'rgba(240,232,214,0.07)',
    canvasGrid: 'transparent',
    canvasGlow: 'transparent',
    surfaceBorder: 'rgba(240,232,214,0.07)',
    hoverSurface: 'rgba(240,232,214,0.04)',
    activeSurface: 'rgba(0,87,231,0.12)',
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
