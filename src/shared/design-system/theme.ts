import { createContext, createElement, useContext, useEffect, type ReactNode } from 'react'

export const Theme = {
  primaryBase: '#0033A0',
  primaryAccent: '#007BFF',
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#333333',
  border: '#E5E5E5',
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
