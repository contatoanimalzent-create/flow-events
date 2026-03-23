import type { ReactNode } from 'react'

export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface AppChildren {
  children: ReactNode
}
