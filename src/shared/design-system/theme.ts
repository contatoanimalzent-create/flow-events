import { createContext, createElement, useContext, useEffect, type ReactNode } from 'react'

export const Theme = {
  primaryBase: '#0033A0',
  primaryAccent: '#007BFF',
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#333333',
  border: '#E5E5E5',
  semantic: {
    surfaceBase: '#FFFFFF',
    surfaceMuted: '#F7FAFF',
    surfaceAccent: 'rgba(0, 123, 255, 0.08)',
    surfaceElevated: '#FFFFFF',
    overlaySoft: 'rgba(0, 51, 160, 0.12)',
    overlayBackdrop: 'rgba(0, 51, 160, 0.8)',
    textInverse: '#FFFFFF',
    textMuted: '#5F6C86',
    textOnAccent: '#FFFFFF',
    inputBackground: '#FFFFFF',
    inputMuted: '#F8FBFF',
    inputPlaceholder: '#7B8CA8',
    focusRing: 'rgba(0, 123, 255, 0.18)',
    primaryHover: '#005FE0',
    primaryActive: '#0048B8',
    secondaryBackground: '#F4F8FF',
    secondaryHover: '#E6F0FF',
    secondaryActive: '#D9E8FF',
    ghostHover: 'rgba(0, 123, 255, 0.08)',
    ghostActive: 'rgba(0, 123, 255, 0.14)',
    shadowSoft: '0 18px 48px rgba(0, 51, 160, 0.12)',
    shadowHover: '0 24px 64px rgba(0, 51, 160, 0.18)',
    shadowInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.85)',
    statusSuccess: '#1E9E63',
    statusSuccessSurface: 'rgba(30, 158, 99, 0.12)',
    statusSuccessBorder: 'rgba(30, 158, 99, 0.28)',
    statusWarning: '#D89614',
    statusWarningSurface: 'rgba(216, 150, 20, 0.12)',
    statusWarningBorder: 'rgba(216, 150, 20, 0.28)',
    statusError: '#D14343',
    statusErrorSurface: 'rgba(209, 67, 67, 0.12)',
    statusErrorBorder: 'rgba(209, 67, 67, 0.28)',
    statusInfo: '#007BFF',
    statusInfoSurface: 'rgba(0, 123, 255, 0.12)',
    statusInfoBorder: 'rgba(0, 123, 255, 0.28)',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: '3rem',
    h2: '2.5rem',
    h3: '2rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1.125rem',
    body: '1rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  grid: {
    maxWidth: '78rem',
    gutters: {
      mobile: '1.25rem',
      tablet: '2rem',
      desktop: '3rem',
    },
    columns: {
      mobile: 4,
      tablet: 8,
      desktop: 12,
    },
    gap: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
} as const

export type ThemeValue = typeof Theme

interface ThemeProviderProps {
  children: ReactNode
  theme?: ThemeValue
}

const ThemeContext = createContext<ThemeValue | null>(null)

function createThemeVariables(theme: ThemeValue) {
  return {
    '--pulse-color-primary-base': theme.primaryBase,
    '--pulse-color-primary-accent': theme.primaryAccent,
    '--pulse-color-background': theme.background,
    '--pulse-color-text-primary': theme.textPrimary,
    '--pulse-color-text-secondary': theme.textSecondary,
    '--pulse-color-border': theme.border,
    '--pulse-surface-base': theme.semantic.surfaceBase,
    '--pulse-surface-muted': theme.semantic.surfaceMuted,
    '--pulse-surface-accent': theme.semantic.surfaceAccent,
    '--pulse-surface-elevated': theme.semantic.surfaceElevated,
    '--pulse-overlay-soft': theme.semantic.overlaySoft,
    '--pulse-overlay-backdrop': theme.semantic.overlayBackdrop,
    '--pulse-color-text-inverse': theme.semantic.textInverse,
    '--pulse-color-text-muted': theme.semantic.textMuted,
    '--pulse-color-text-on-accent': theme.semantic.textOnAccent,
    '--pulse-input-background': theme.semantic.inputBackground,
    '--pulse-input-muted': theme.semantic.inputMuted,
    '--pulse-input-placeholder': theme.semantic.inputPlaceholder,
    '--pulse-focus-ring': theme.semantic.focusRing,
    '--pulse-button-primary-bg': theme.primaryAccent,
    '--pulse-button-primary-hover': theme.semantic.primaryHover,
    '--pulse-button-primary-active': theme.semantic.primaryActive,
    '--pulse-button-secondary-bg': theme.semantic.secondaryBackground,
    '--pulse-button-secondary-hover': theme.semantic.secondaryHover,
    '--pulse-button-secondary-active': theme.semantic.secondaryActive,
    '--pulse-button-ghost-hover': theme.semantic.ghostHover,
    '--pulse-button-ghost-active': theme.semantic.ghostActive,
    '--pulse-shadow-soft': theme.semantic.shadowSoft,
    '--pulse-shadow-hover': theme.semantic.shadowHover,
    '--pulse-shadow-inset': theme.semantic.shadowInset,
    '--pulse-status-success': theme.semantic.statusSuccess,
    '--pulse-status-success-surface': theme.semantic.statusSuccessSurface,
    '--pulse-status-success-border': theme.semantic.statusSuccessBorder,
    '--pulse-status-warning': theme.semantic.statusWarning,
    '--pulse-status-warning-surface': theme.semantic.statusWarningSurface,
    '--pulse-status-warning-border': theme.semantic.statusWarningBorder,
    '--pulse-status-error': theme.semantic.statusError,
    '--pulse-status-error-surface': theme.semantic.statusErrorSurface,
    '--pulse-status-error-border': theme.semantic.statusErrorBorder,
    '--pulse-status-info': theme.semantic.statusInfo,
    '--pulse-status-info-surface': theme.semantic.statusInfoSurface,
    '--pulse-status-info-border': theme.semantic.statusInfoBorder,
    '--pulse-font-family': theme.typography.fontFamily,
    '--pulse-font-size-h1': theme.typography.h1,
    '--pulse-font-size-h2': theme.typography.h2,
    '--pulse-font-size-h3': theme.typography.h3,
    '--pulse-font-size-h4': theme.typography.h4,
    '--pulse-font-size-h5': theme.typography.h5,
    '--pulse-font-size-h6': theme.typography.h6,
    '--pulse-font-size-body': theme.typography.body,
    '--pulse-spacing-xs': theme.spacing.xs,
    '--pulse-spacing-sm': theme.spacing.sm,
    '--pulse-spacing-md': theme.spacing.md,
    '--pulse-spacing-lg': theme.spacing.lg,
    '--pulse-spacing-xl': theme.spacing.xl,
    '--pulse-spacing-xxl': theme.spacing.xxl,
    '--pulse-grid-max-width': theme.grid.maxWidth,
    '--pulse-grid-gutter-mobile': theme.grid.gutters.mobile,
    '--pulse-grid-gutter-tablet': theme.grid.gutters.tablet,
    '--pulse-grid-gutter-desktop': theme.grid.gutters.desktop,
    '--pulse-grid-columns-mobile': String(theme.grid.columns.mobile),
    '--pulse-grid-columns-tablet': String(theme.grid.columns.tablet),
    '--pulse-grid-columns-desktop': String(theme.grid.columns.desktop),
    '--pulse-grid-gap-sm': theme.grid.gap.sm,
    '--pulse-grid-gap-md': theme.grid.gap.md,
    '--pulse-grid-gap-lg': theme.grid.gap.lg,
  } as const
}

export function ThemeProvider({ children, theme = Theme }: ThemeProviderProps) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const root = document.documentElement
    const themeVariables = createThemeVariables(theme)
    const previousValues = Object.entries(themeVariables).map(([key]) => [key, root.style.getPropertyValue(key)] as const)

    Object.entries(themeVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      previousValues.forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value)
          return
        }

        root.style.removeProperty(key)
      })
    }
  }, [theme])

  return createElement(ThemeContext.Provider, { value: theme }, children)
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
