import { createContext, createElement, useContext, useEffect, type ReactNode } from 'react'
import { colorTokens, radiusTokens, shadowTokens } from './tokens'
import { typographyScale } from './typography/typography'

const semanticTokens = {
  surfaceBase: colorTokens.background,
  surfaceMuted: colorTokens.surface,
  surfaceAccent: 'rgba(47, 91, 255, 0.08)',
  surfaceElevated: colorTokens.background,
  overlaySoft: 'rgba(47, 91, 255, 0.14)',
  overlayBackdrop: 'rgba(10, 26, 255, 0.72)',
  textInverse: '#FFFFFF',
  textMuted: colorTokens.textSecondary,
  textOnAccent: '#FFFFFF',
  inputBackground: colorTokens.background,
  inputMuted: colorTokens.surface,
  inputPlaceholder: colorTokens.textSecondary,
  focusRing: 'rgba(47, 91, 255, 0.18)',
  primaryHover: colorTokens.primarySoft,
  primaryActive: colorTokens.primary,
  secondaryBackground: colorTokens.surface,
  secondaryHover: '#EEF2FF',
  secondaryActive: '#E0E7FF',
  ghostHover: 'rgba(47, 91, 255, 0.08)',
  ghostActive: 'rgba(47, 91, 255, 0.14)',
  shadowInset: shadowTokens.inset,
  statusSuccess: '#16A34A',
  statusSuccessSurface: 'rgba(22, 163, 74, 0.12)',
  statusSuccessBorder: 'rgba(22, 163, 74, 0.24)',
  statusWarning: '#D97706',
  statusWarningSurface: 'rgba(217, 119, 6, 0.12)',
  statusWarningBorder: 'rgba(217, 119, 6, 0.24)',
  statusError: '#DC2626',
  statusErrorSurface: 'rgba(220, 38, 38, 0.12)',
  statusErrorBorder: 'rgba(220, 38, 38, 0.24)',
  statusInfo: colorTokens.primarySoft,
  statusInfoSurface: 'rgba(47, 91, 255, 0.12)',
  statusInfoBorder: 'rgba(47, 91, 255, 0.24)',
} as const

export const Theme = {
  colors: colorTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  typography: typographyScale,
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
  semantic: semanticTokens,
  primaryBase: colorTokens.primary,
  primaryAccent: colorTokens.primarySoft,
  background: colorTokens.background,
  textPrimary: colorTokens.textPrimary,
  textSecondary: colorTokens.textSecondary,
  border: colorTokens.border,
} as const

export type ThemeValue = typeof Theme
export type ColorToken = keyof ThemeValue['colors']

interface ThemeProviderProps {
  children: ReactNode
  theme?: ThemeValue
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function getColor(token: ColorToken) {
  return Theme.colors[token]
}

function createThemeVariables(theme: ThemeValue) {
  return {
    '--pulse-color-primary': theme.colors.primary,
    '--pulse-color-primary-soft': theme.colors.primarySoft,
    '--pulse-color-background': theme.colors.background,
    '--pulse-color-surface': theme.colors.surface,
    '--pulse-color-text-primary': theme.colors.textPrimary,
    '--pulse-color-text-secondary': theme.colors.textSecondary,
    '--pulse-color-border': theme.colors.border,
    '--pulse-color-primary-base': theme.primaryBase,
    '--pulse-color-primary-accent': theme.primaryAccent,
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
    '--pulse-button-primary-bg': theme.colors.primary,
    '--pulse-button-primary-hover': theme.semantic.primaryHover,
    '--pulse-button-primary-active': theme.semantic.primaryActive,
    '--pulse-button-secondary-bg': theme.semantic.secondaryBackground,
    '--pulse-button-secondary-hover': theme.semantic.secondaryHover,
    '--pulse-button-secondary-active': theme.semantic.secondaryActive,
    '--pulse-button-ghost-hover': theme.semantic.ghostHover,
    '--pulse-button-ghost-active': theme.semantic.ghostActive,
    '--pulse-shadow-soft': theme.shadow.soft,
    '--pulse-shadow-medium': theme.shadow.medium,
    '--pulse-shadow-strong': theme.shadow.strong,
    '--pulse-shadow-hover': theme.shadow.medium,
    '--pulse-shadow-inset': theme.semantic.shadowInset,
    '--pulse-radius-sm': theme.radius.sm,
    '--pulse-radius-md': theme.radius.md,
    '--pulse-radius-lg': theme.radius.lg,
    '--pulse-radius-full': theme.radius.full,
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
    '--pulse-font-size-caption': theme.typography.caption,
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
