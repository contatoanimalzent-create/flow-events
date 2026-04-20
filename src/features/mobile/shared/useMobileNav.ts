import { useState, useCallback } from 'react'

export type NavEntry<S extends string> = { screen: S; params?: Record<string, unknown> }

export function useMobileNav<S extends string>(initial: S) {
  const [stack, setStack] = useState<NavEntry<S>[]>([{ screen: initial }])

  const current = stack[stack.length - 1]

  const push = useCallback((screen: S, params?: Record<string, unknown>) => {
    setStack((prev) => [...prev, { screen, params }])
  }, [])

  const pop = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const replace = useCallback((screen: S, params?: Record<string, unknown>) => {
    setStack((prev) => [...prev.slice(0, -1), { screen, params }])
  }, [])

  const reset = useCallback((screen: S) => {
    setStack([{ screen }])
  }, [])

  return { current, stack, push, pop, replace, reset, canGoBack: stack.length > 1 }
}
