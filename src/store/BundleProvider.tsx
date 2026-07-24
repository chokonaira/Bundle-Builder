import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { catalog } from '../data/catalog'
import type { Catalog } from '../types/catalog'
import { bundleReducer, initialState, type BundleAction, type BundleState } from './bundleState'

interface BundleContextValue {
  catalog: Catalog
  state: BundleState
  dispatch: Dispatch<BundleAction>
}

const BundleContext = createContext<BundleContextValue | null>(null)

export function BundleProvider({
  children,
  initial,
}: {
  children: ReactNode
  /** Optional pre-hydrated state (e.g. restored from localStorage). */
  initial?: BundleState
}) {
  const [state, dispatch] = useReducer(bundleReducer, initial ?? initialState(catalog))
  return (
    <BundleContext.Provider value={{ catalog, state, dispatch }}>{children}</BundleContext.Provider>
  )
}

export function useBundle(): BundleContextValue {
  const ctx = useContext(BundleContext)
  if (!ctx) throw new Error('useBundle must be used inside <BundleProvider>')
  return ctx
}
